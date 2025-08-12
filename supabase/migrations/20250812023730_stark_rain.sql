/*
  # Stripe Connect Integration Setup

  1. New Tables
    - `vendor_stripe_accounts` - Links farmers to Stripe Connect accounts
    - `vendor_platform_customers` - Links farmers to platform billing customers
    - `vendor_subscriptions` - Manages vendor premium subscriptions
    - `seasonal_ledgers` - Tracks vendor sales and hosting fees by season
    - `marketplace_orders` - Enhanced order tracking with Stripe data

  2. Security
    - Enable RLS on all new tables
    - Add policies for vendor data access
    - Secure webhook processing

  3. Enums
    - Connect account status tracking
    - Subscription status for vendor premium features
*/

-- Create enums for Connect account status
CREATE TYPE connect_account_status AS ENUM (
  'pending',
  'restricted',
  'enabled',
  'rejected'
);

CREATE TYPE vendor_subscription_status AS ENUM (
  'inactive',
  'active',
  'past_due',
  'canceled',
  'incomplete'
);

-- Vendor Stripe Connect accounts
CREATE TABLE IF NOT EXISTS vendor_stripe_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  stripe_account_id text UNIQUE NOT NULL,
  account_status connect_account_status DEFAULT 'pending',
  charges_enabled boolean DEFAULT false,
  payouts_enabled boolean DEFAULT false,
  details_submitted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vendor platform customers (for billing vendors)
CREATE TABLE IF NOT EXISTS vendor_platform_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  stripe_customer_id text UNIQUE NOT NULL,
  default_payment_method_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vendor premium subscriptions
CREATE TABLE IF NOT EXISTS vendor_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE,
  status vendor_subscription_status DEFAULT 'inactive',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seasonal ledgers for tracking sales and fees
CREATE TABLE IF NOT EXISTS seasonal_ledgers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  season_year integer NOT NULL,
  season_name text NOT NULL, -- 'spring', 'summer', 'fall', 'winter'
  gross_sales numeric(10,2) DEFAULT 0,
  refunds numeric(10,2) DEFAULT 0,
  net_sales numeric(10,2) DEFAULT 0,
  discount_amount numeric(10,2) DEFAULT 0,
  hosting_fee_due numeric(10,2) DEFAULT 0,
  hosting_invoice_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(farmer_id, season_year, season_name)
);

-- Enhanced marketplace orders
CREATE TABLE IF NOT EXISTS marketplace_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  farmer_id uuid NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  stripe_payment_intent_id text UNIQUE NOT NULL,
  stripe_checkout_session_id text UNIQUE,
  application_fee_amount integer NOT NULL, -- in cents
  transfer_amount integer NOT NULL, -- in cents
  total_amount integer NOT NULL, -- in cents
  currency text DEFAULT 'usd',
  status text DEFAULT 'pending',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE vendor_stripe_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_platform_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasonal_ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendor_stripe_accounts
CREATE POLICY "Farmers can read own Connect account"
  ON vendor_stripe_accounts
  FOR SELECT
  TO authenticated
  USING (farmer_id IN (
    SELECT id FROM farmers WHERE user_id = auth.uid()
  ));

CREATE POLICY "Farmers can update own Connect account"
  ON vendor_stripe_accounts
  FOR UPDATE
  TO authenticated
  USING (farmer_id IN (
    SELECT id FROM farmers WHERE user_id = auth.uid()
  ));

-- RLS Policies for vendor_platform_customers
CREATE POLICY "Farmers can read own platform customer"
  ON vendor_platform_customers
  FOR SELECT
  TO authenticated
  USING (farmer_id IN (
    SELECT id FROM farmers WHERE user_id = auth.uid()
  ));

-- RLS Policies for vendor_subscriptions
CREATE POLICY "Farmers can read own subscription"
  ON vendor_subscriptions
  FOR SELECT
  TO authenticated
  USING (farmer_id IN (
    SELECT id FROM farmers WHERE user_id = auth.uid()
  ));

-- RLS Policies for seasonal_ledgers
CREATE POLICY "Farmers can read own ledger"
  ON seasonal_ledgers
  FOR SELECT
  TO authenticated
  USING (farmer_id IN (
    SELECT id FROM farmers WHERE user_id = auth.uid()
  ));

-- RLS Policies for marketplace_orders
CREATE POLICY "Users can read own orders"
  ON marketplace_orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Farmers can read orders for their products"
  ON marketplace_orders
  FOR SELECT
  TO authenticated
  USING (farmer_id IN (
    SELECT id FROM farmers WHERE user_id = auth.uid()
  ));

-- Update triggers
CREATE TRIGGER update_vendor_stripe_accounts_updated_at
  BEFORE UPDATE ON vendor_stripe_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_platform_customers_updated_at
  BEFORE UPDATE ON vendor_platform_customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_subscriptions_updated_at
  BEFORE UPDATE ON vendor_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seasonal_ledgers_updated_at
  BEFORE UPDATE ON seasonal_ledgers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_orders_updated_at
  BEFORE UPDATE ON marketplace_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();