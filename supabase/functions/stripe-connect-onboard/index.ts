import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2024-06-20',
    });

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');

    // Get the user from the token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get farmer profile
    const { data: farmer, error: farmerError } = await supabase
      .from('farmers')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (farmerError || !farmer) {
      return new Response(
        JSON.stringify({ error: 'Farmer profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, return_url, refresh_url } = await req.json();

    if (action === 'create_account') {
      // Check if account already exists
      const { data: existingAccount } = await supabase
        .from('vendor_stripe_accounts')
        .select('stripe_account_id')
        .eq('farmer_id', farmer.id)
        .single();

      let accountId = existingAccount?.stripe_account_id;

      if (!accountId) {
        // Create new Connect account
        const account = await stripe.accounts.create({
          type: 'standard',
          country: 'US',
          email: user.email,
          business_profile: {
            name: farmer.farm_name,
            product_description: 'Fresh local produce',
          },
          metadata: {
            farmer_id: farmer.id,
            user_id: user.id,
          },
        });

        accountId = account.id;

        // Save to database
        await supabase
          .from('vendor_stripe_accounts')
          .insert({
            farmer_id: farmer.id,
            stripe_account_id: accountId,
            account_status: 'pending',
          });
      }

      // Create account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        return_url: return_url || `${req.headers.get('origin')}/seller/dashboard`,
        refresh_url: refresh_url || `${req.headers.get('origin')}/seller/enroll`,
        type: 'account_onboarding',
      });

      return new Response(
        JSON.stringify({ url: accountLink.url, account_id: accountId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'setup_billing') {
      // Create platform customer for vendor billing
      const { data: existingCustomer } = await supabase
        .from('vendor_platform_customers')
        .select('stripe_customer_id')
        .eq('farmer_id', farmer.id)
        .single();

      let customerId = existingCustomer?.stripe_customer_id;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: farmer.farm_name,
          metadata: {
            farmer_id: farmer.id,
            user_id: user.id,
            type: 'vendor_billing',
          },
        });

        customerId = customer.id;

        await supabase
          .from('vendor_platform_customers')
          .insert({
            farmer_id: farmer.id,
            stripe_customer_id: customerId,
          });
      }

      // Create setup session for payment method
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'setup',
        payment_method_types: ['card'],
        success_url: `${req.headers.get('origin')}/seller/dashboard?setup=success`,
        cancel_url: `${req.headers.get('origin')}/seller/dashboard?setup=cancel`,
      });

      return new Response(
        JSON.stringify({ url: session.url, customer_id: customerId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'subscribe_premium') {
      // Get platform customer
      const { data: platformCustomer, error: customerError } = await supabase
        .from('vendor_platform_customers')
        .select('stripe_customer_id')
        .eq('farmer_id', farmer.id)
        .single();

      if (customerError || !platformCustomer) {
        return new Response(
          JSON.stringify({ error: 'Platform customer not found. Please set up billing first.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create premium subscription
      const subscription = await stripe.subscriptions.create({
        customer: platformCustomer.stripe_customer_id,
        items: [{ price: 'price_vendor_premium_5_monthly' }], // You'll need to create this price in Stripe
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      // Save subscription to database
      await supabase
        .from('vendor_subscriptions')
        .upsert({
          farmer_id: farmer.id,
          stripe_subscription_id: subscription.id,
          status: 'incomplete',
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        });

      return new Response(
        JSON.stringify({ 
          subscription_id: subscription.id,
          client_secret: subscription.latest_invoice?.payment_intent?.client_secret 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Connect onboard error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});