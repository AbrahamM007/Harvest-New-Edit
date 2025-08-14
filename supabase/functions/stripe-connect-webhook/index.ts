import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
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

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('No signature', { status: 400 });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        Deno.env.get('STRIPE_CONNECT_WEBHOOK_SECRET') ?? ''
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Webhook signature verification failed', { status: 400 });
    }

    console.log('Processing webhook event:', event.type);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        if (paymentIntent.metadata && paymentIntent.metadata.farmer_id) {
          // Create marketplace order record
          await supabase
            .from('marketplace_orders')
            .insert({
              user_id: paymentIntent.metadata.user_id,
              farmer_id: paymentIntent.metadata.farmer_id,
              stripe_payment_intent_id: paymentIntent.id,
              application_fee_amount: paymentIntent.application_fee_amount || 0,
              transfer_amount: paymentIntent.amount - (paymentIntent.application_fee_amount || 0),
              total_amount: paymentIntent.amount,
              status: 'completed',
              metadata: {
                items: JSON.parse(paymentIntent.metadata.items),
              },
            });

          console.log(`Order created for payment intent ${paymentIntent.id}`);
        }
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.payment_status === 'paid' && session.metadata) {
          const metadata = session.metadata;
          
          // Create marketplace order
          await supabase
            .from('marketplace_orders')
            .insert({
              user_id: metadata.user_id,
              farmer_id: metadata.farmer_id,
              stripe_payment_intent_id: session.payment_intent as string,
              stripe_checkout_session_id: session.id,
              application_fee_amount: parseInt(metadata.platform_fee_cents),
              transfer_amount: parseInt(metadata.vendor_amount_cents),
              total_amount: session.amount_total || 0,
              status: 'completed',
              metadata: {
                delivery_address: metadata.delivery_address,
                delivery_time: metadata.delivery_time,
                items: JSON.parse(metadata.items),
              },
            });

          // Update seasonal ledger
          const currentDate = new Date();
          const seasonYear = currentDate.getFullYear();
          const month = currentDate.getMonth();
          const seasonName = month < 3 ? 'winter' : month < 6 ? 'spring' : month < 9 ? 'summer' : 'fall';
          
          const vendorAmount = parseInt(metadata.vendor_amount_cents) / 100;

          await supabase
            .from('seasonal_ledgers')
            .upsert({
              farmer_id: metadata.farmer_id,
              season_year: seasonYear,
              season_name: seasonName,
              gross_sales: vendorAmount,
              net_sales: vendorAmount,
            }, {
              onConflict: 'farmer_id,season_year,season_name',
            });

          console.log(`Order processed for farmer ${metadata.farmer_id}, amount: $${vendorAmount}`);
        }
        break;
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        
        // Update Connect account status
        await supabase
          .from('vendor_stripe_accounts')
          .update({
            account_status: account.charges_enabled ? 'enabled' : 'restricted',
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
            details_submitted: account.details_submitted,
          })
          .eq('stripe_account_id', account.id);

        console.log(`Updated account ${account.id} status`);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Update vendor subscription
        await supabase
          .from('vendor_subscriptions')
          .update({
            status: subscription.status as any,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq('stripe_subscription_id', subscription.id);

        console.log(`Updated subscription ${subscription.id} status: ${subscription.status}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          // This is a premium subscription payment
          console.log(`Premium subscription payment succeeded for ${invoice.customer}`);
        } else {
          // This might be a hosting fee payment
          console.log(`Hosting fee payment succeeded for ${invoice.customer}`);
        }
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        console.log(`Dispute created for charge ${dispute.charge}`);
        // Handle dispute logic here
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});