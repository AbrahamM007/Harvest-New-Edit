import { useState } from 'react';
import { useStripe } from '@stripe/stripe-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export function useStripePayment() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const createPaymentIntent = async (amount: number, farmerId: string, items: any[]) => {
    if (!user) throw new Error('User not authenticated');

    const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to cents
        farmer_id: farmerId,
        items,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    
    return data;
  };

  const processPayment = async (amount: number, farmerId: string, items: any[]) => {
    try {
      setLoading(true);

      // Create payment intent
      const { client_secret, ephemeral_key, customer_id } = await createPaymentIntent(amount, farmerId, items);

      // Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Harvest - Local Produce',
        customerId: customer_id,
        customerEphemeralKeySecret: ephemeral_key,
        paymentIntentClientSecret: client_secret,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: user?.user_metadata?.full_name,
          email: user?.email,
        },
      });

      if (initError) throw new Error(initError.message);

      // Present payment sheet
      const { error: paymentError } = await presentPaymentSheet();
      
      if (paymentError) {
        if (paymentError.code === 'Canceled') {
          return { success: false, canceled: true };
        }
        throw new Error(paymentError.message);
      }

      return { success: true };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    processPayment,
    loading,
  };
}