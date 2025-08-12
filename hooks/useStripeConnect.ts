import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useFarmer } from './useFarmer';
import * as WebBrowser from 'expo-web-browser';

interface ConnectAccount {
  id: string;
  farmer_id: string;
  stripe_account_id: string;
  account_status: 'pending' | 'restricted' | 'enabled' | 'rejected';
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
}

interface PlatformCustomer {
  id: string;
  farmer_id: string;
  stripe_customer_id: string;
  default_payment_method_id: string | null;
}

interface VendorSubscription {
  id: string;
  farmer_id: string;
  stripe_subscription_id: string | null;
  status: 'inactive' | 'active' | 'past_due' | 'canceled' | 'incomplete';
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export function useStripeConnect() {
  const { farmer } = useFarmer();
  const [connectAccount, setConnectAccount] = useState<ConnectAccount | null>(null);
  const [platformCustomer, setPlatformCustomer] = useState<PlatformCustomer | null>(null);
  const [vendorSubscription, setVendorSubscription] = useState<VendorSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConnectData = async () => {
    if (!farmer) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch Connect account
      const { data: connectData } = await supabase
        .from('vendor_stripe_accounts')
        .select('*')
        .eq('farmer_id', farmer.id)
        .single();

      setConnectAccount(connectData);

      // Fetch platform customer
      const { data: customerData } = await supabase
        .from('vendor_platform_customers')
        .select('*')
        .eq('farmer_id', farmer.id)
        .single();

      setPlatformCustomer(customerData);

      // Fetch vendor subscription
      const { data: subscriptionData } = await supabase
        .from('vendor_subscriptions')
        .select('*')
        .eq('farmer_id', farmer.id)
        .single();

      setVendorSubscription(subscriptionData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Stripe data');
    } finally {
      setLoading(false);
    }
  };

  const createConnectAccount = async () => {
    if (!farmer) throw new Error('Farmer profile required');

    const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/stripe-connect-onboard`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'create_account',
        return_url: `${window.location.origin}/seller/dashboard?onboard=success`,
        refresh_url: `${window.location.origin}/seller/dashboard?onboard=refresh`,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    // Open onboarding in browser
    await WebBrowser.openBrowserAsync(data.url);
    
    return data;
  };

  const setupBilling = async () => {
    if (!farmer) throw new Error('Farmer profile required');

    const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/stripe-connect-onboard`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'setup_billing',
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    // Open billing setup in browser
    await WebBrowser.openBrowserAsync(data.url);
    
    return data;
  };

  const subscribeToPremium = async () => {
    if (!farmer) throw new Error('Farmer profile required');

    const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/stripe-connect-onboard`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'subscribe_premium',
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    
    return data;
  };

  useEffect(() => {
    fetchConnectData();
  }, [farmer]);

  return {
    connectAccount,
    platformCustomer,
    vendorSubscription,
    loading,
    error,
    createConnectAccount,
    setupBilling,
    subscribeToPremium,
    refetch: fetchConnectData,
  };
}