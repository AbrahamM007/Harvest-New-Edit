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

    const { items, delivery_address, delivery_time } = await req.json();

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No items provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Group items by farmer to handle multiple vendors
    const itemsByFarmer = items.reduce((acc: any, item: any) => {
      const farmerId = item.farmer_id;
      if (!acc[farmerId]) {
        acc[farmerId] = [];
      }
      acc[farmerId].push(item);
      return acc;
    }, {});

    const checkoutSessions = [];

    // Create separate checkout session for each farmer
    for (const [farmerId, farmerItems] of Object.entries(itemsByFarmer)) {
      // Get farmer's Connect account
      const { data: connectAccount, error: connectError } = await supabase
        .from('vendor_stripe_accounts')
        .select('stripe_account_id, charges_enabled')
        .eq('farmer_id', farmerId)
        .single();

      if (connectError || !connectAccount || !connectAccount.charges_enabled) {
        return new Response(
          JSON.stringify({ error: `Farmer ${farmerId} is not set up to receive payments` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Calculate totals for this farmer
      const farmerItemsArray = farmerItems as any[];
      const subtotal = farmerItemsArray.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const platformFee = Math.round(subtotal * 0.12 * 100); // 12% in cents
      const vendorAmount = Math.round(subtotal * 100) - platformFee; // Vendor gets 88%

      // Create line items
      const lineItems = farmerItemsArray.map((item: any) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: item.description || undefined,
            images: item.image_url ? [item.image_url] : undefined,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }));

      // Create checkout session with destination charge
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: lineItems,
        customer_email: user.email,
        payment_intent_data: {
          application_fee_amount: platformFee,
          transfer_data: { 
            destination: connectAccount.stripe_account_id 
          },
          on_behalf_of: connectAccount.stripe_account_id,
          metadata: {
            user_id: user.id,
            farmer_id: farmerId,
            delivery_address,
            delivery_time: delivery_time || '',
            items: JSON.stringify(farmerItems),
          },
        },
        success_url: `${req.headers.get('origin')}/stripe-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get('origin')}/stripe-cancel`,
        metadata: {
          user_id: user.id,
          farmer_id: farmerId,
          platform_fee_cents: platformFee.toString(),
          vendor_amount_cents: vendorAmount.toString(),
        },
      });

      checkoutSessions.push({
        farmer_id: farmerId,
        session_id: session.id,
        url: session.url,
      });
    }

    // For simplicity, if multiple farmers, return the first session
    // In production, you might want to handle this differently
    const primarySession = checkoutSessions[0];

    return new Response(
      JSON.stringify({ 
        url: primarySession.url, 
        session_id: primarySession.session_id,
        sessions: checkoutSessions 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Marketplace checkout error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});