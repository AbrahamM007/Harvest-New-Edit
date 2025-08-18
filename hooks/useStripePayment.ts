import { useState } from 'react';
import { Platform, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import * as WebBrowser from 'expo-web-browser';

export function useStripePayment() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const createCheckoutSession = async (amount: number, farmerId: string, items: any[]) => {
    if (!user) throw new Error('User not authenticated');

    const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/marketplace-checkout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: items.map(item => ({
          product_id: item.product.id,
          name: item.product.name,
          description: item.product.description,
          price: item.product.price,
          quantity: item.quantity,
          image_url: item.product.image_url,
          farmer_id: item.product.farmer_id,
        })),
        delivery_address: '123 Oak Street, Downtown, Community District, 12345',
        delivery_time: 'Today 2-4 PM',
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    
    return data;
  };

  const processPayment = async (amount: number, farmerId: string, items: any[]) => {
    try {
      setLoading(true);

      if (Platform.OS === 'web') {
        // For web, use Stripe Checkout
        const { url } = await createCheckoutSession(amount, farmerId, items);
        
        if (url) {
          await WebBrowser.openBrowserAsync(url);
          return { success: true };
        }
      } else {
        // For native platforms, use Stripe React Native
        const { useStripe } = require('@stripe/stripe-react-native');
        const { initPaymentSheet, presentPaymentSheet } = useStripe();

        // Create payment intent for native
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

        // Initialize payment sheet
        const { error: initError } = await initPaymentSheet({
          merchantDisplayName: 'Harvest - Local Produce',
          customerId: data.customer_id,
          customerEphemeralKeySecret: data.ephemeral_key,
          paymentIntentClientSecret: data.client_secret,
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
      }
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