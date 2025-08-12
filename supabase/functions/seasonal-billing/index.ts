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

    const { season_year, season_name, base_hosting_fee = 50 } = await req.json();

    if (!season_year || !season_name) {
      return new Response(
        JSON.stringify({ error: 'Season year and name are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all farmers with sales data for the season
    const { data: ledgers, error: ledgerError } = await supabase
      .from('seasonal_ledgers')
      .select(`
        *,
        farmer:farmers(
          farm_name,
          vendor_platform_customers(stripe_customer_id)
        )
      `)
      .eq('season_year', season_year)
      .eq('season_name', season_name);

    if (ledgerError) {
      throw ledgerError;
    }

    const results = [];

    for (const ledger of ledgers || []) {
      const netSales = parseFloat(ledger.net_sales.toString());
      
      // Calculate hosting fee: $50 base minus $1 per $10 in sales
      const salesDiscount = Math.floor(netSales / 10) * 1;
      const hostingDue = Math.max(0, base_hosting_fee - salesDiscount);

      // If no sales or hosting fee is $0, skip billing
      if (netSales === 0 || hostingDue === 0) {
        await supabase
          .from('seasonal_ledgers')
          .update({
            discount_amount: salesDiscount,
            hosting_fee_due: 0,
          })
          .eq('id', ledger.id);

        results.push({
          farmer_id: ledger.farmer_id,
          farm_name: ledger.farmer.farm_name,
          net_sales: netSales,
          hosting_due: 0,
          status: 'no_charge',
        });
        continue;
      }

      // Get platform customer for billing
      const platformCustomer = ledger.farmer.vendor_platform_customers?.[0];
      if (!platformCustomer?.stripe_customer_id) {
        results.push({
          farmer_id: ledger.farmer_id,
          farm_name: ledger.farmer.farm_name,
          net_sales: netSales,
          hosting_due: hostingDue,
          status: 'no_payment_method',
        });
        continue;
      }

      try {
        // Create invoice items
        await stripe.invoiceItems.create({
          customer: platformCustomer.stripe_customer_id,
          currency: 'usd',
          unit_amount: base_hosting_fee * 100, // Base fee in cents
          description: `${season_name} ${season_year} hosting fee`,
        });

        // Add discount if applicable
        if (salesDiscount > 0) {
          await stripe.invoiceItems.create({
            customer: platformCustomer.stripe_customer_id,
            currency: 'usd',
            unit_amount: -salesDiscount * 100, // Negative amount for discount
            description: `Sales-based discount ($${netSales.toFixed(2)} in sales)`,
          });
        }

        // Create and finalize invoice
        const invoice = await stripe.invoices.create({
          customer: platformCustomer.stripe_customer_id,
          collection_method: 'charge_automatically',
          auto_advance: true,
          description: `${season_name} ${season_year} hosting fee for ${ledger.farmer.farm_name}`,
        });

        await stripe.invoices.finalizeInvoice(invoice.id);

        // Update ledger
        await supabase
          .from('seasonal_ledgers')
          .update({
            discount_amount: salesDiscount,
            hosting_fee_due: hostingDue,
            hosting_invoice_id: invoice.id,
          })
          .eq('id', ledger.id);

        results.push({
          farmer_id: ledger.farmer_id,
          farm_name: ledger.farmer.farm_name,
          net_sales: netSales,
          hosting_due: hostingDue,
          invoice_id: invoice.id,
          status: 'invoiced',
        });

      } catch (invoiceError) {
        console.error(`Failed to create invoice for farmer ${ledger.farmer_id}:`, invoiceError);
        results.push({
          farmer_id: ledger.farmer_id,
          farm_name: ledger.farmer.farm_name,
          net_sales: netSales,
          hosting_due: hostingDue,
          status: 'error',
          error: invoiceError.message,
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        season: `${season_name} ${season_year}`,
        base_hosting_fee,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Seasonal billing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});