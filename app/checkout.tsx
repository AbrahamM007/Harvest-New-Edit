import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, CreditCard, Lock, CircleCheck as CheckCircle, Clock } from 'lucide-react-native';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { useStripePayment } from '@/hooks/useStripePayment';
import * as WebBrowser from 'expo-web-browser';

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { processPayment, loading: stripeLoading } = useStripePayment();
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [deliveryTime, setDeliveryTime] = useState('today');
  const [loading, setLoading] = useState(false);

  const subtotal = getTotalPrice();
  const deliveryFee = 2.99;
  const serviceFee = 1.50;
  const total = subtotal + deliveryFee + serviceFee;

  const handlePayment = async () => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to complete your order');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    try {
      // Group items by farmer for multi-vendor support
      const itemsByFarmer = items.reduce((acc: any, item) => {
        const farmerId = item.product.farmer_id;
        if (!acc[farmerId]) {
          acc[farmerId] = [];
        }
        acc[farmerId].push(item);
        return acc;
      }, {});

      // For now, handle single farmer checkout (can be extended for multi-farmer)
      const farmerIds = Object.keys(itemsByFarmer);
      if (farmerIds.length > 1) {
        Alert.alert('Multiple Farmers', 'Please checkout items from one farmer at a time for now');
        return;
      }

      const farmerId = farmerIds[0];
      const farmerItems = itemsByFarmer[farmerId];
      
      const result = await processPayment(total, farmerId, farmerItems);
      
      if (result.success) {
        clearCart();
        Alert.alert(
          'Payment Successful!',
          'Your order has been placed successfully.',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
        );
      } else if (result.canceled) {
        // User canceled payment
        return;
      }

    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to place order');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <TouchableOpacity style={styles.addressCard}>
            <MapPin size={20} color="#16a34a" strokeWidth={2} />
            <View style={styles.addressInfo}>
              <Text style={styles.addressTitle}>Home</Text>
              <Text style={styles.addressText}>123 Oak Street, Downtown</Text>
              <Text style={styles.addressText}>Community District, 12345</Text>
            </View>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* Delivery Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Time</Text>
          <View style={styles.timeOptions}>
            <TouchableOpacity 
              style={[styles.timeOption, deliveryTime === 'today' && styles.timeOptionActive]}
              onPress={() => setDeliveryTime('today')}
            >
              <Clock size={16} color={deliveryTime === 'today' ? '#16a34a' : '#6b7280'} strokeWidth={2} />
              <View style={styles.timeInfo}>
                <Text style={[styles.timeTitle, deliveryTime === 'today' && styles.timeTextActive]}>
                  Today
                </Text>
                <Text style={[styles.timeSubtitle, deliveryTime === 'today' && styles.timeSubtitleActive]}>
                  2-4 PM
                </Text>
              </View>
              {deliveryTime === 'today' && (
                <CheckCircle size={20} color="#16a34a" strokeWidth={2} />
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.timeOption, deliveryTime === 'tomorrow' && styles.timeOptionActive]}
              onPress={() => setDeliveryTime('tomorrow')}
            >
              <Clock size={16} color={deliveryTime === 'tomorrow' ? '#16a34a' : '#6b7280'} strokeWidth={2} />
              <View style={styles.timeInfo}>
                <Text style={[styles.timeTitle, deliveryTime === 'tomorrow' && styles.timeTextActive]}>
                  Tomorrow
                </Text>
                <Text style={[styles.timeSubtitle, deliveryTime === 'tomorrow' && styles.timeSubtitleActive]}>
                  9 AM - 12 PM
                </Text>
              </View>
              {deliveryTime === 'tomorrow' && (
                <CheckCircle size={20} color="#16a34a" strokeWidth={2} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity 
            style={[styles.paymentOption, selectedPayment === 'card' && styles.paymentOptionActive]}
            onPress={() => setSelectedPayment('card')}
          >
            <CreditCard size={20} color="#16a34a" strokeWidth={2} />
            {loading ? (
              <>
                <Text style={styles.checkoutButtonText}>Creating checkout...</Text>
              </>
            ) : (
              <>
                <Lock size={20} color="#ffffff" strokeWidth={2} />
                <Text style={styles.checkoutButtonText}>Pay $${total.toFixed(2)}</Text>
              </>
            )}
            <Lock size={16} color="#6b7280" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service Fee</Text>
              <Text style={styles.summaryValue}>${serviceFee.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.checkoutSection}>
        <TouchableOpacity 
          style={[styles.checkoutButton, loading && styles.checkoutButtonDisabled]}
          onPress={handlePayment}
          disabled={loading || stripeLoading}
        >
          <Text style={styles.checkoutButtonText}>
            {loading || stripeLoading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
          </Text>
        </TouchableOpacity>
        <Text style={styles.secureText}>🔒 Secure payment processing</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    gap: 12,
  },
  addressInfo: {
    flex: 1,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  changeText: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '600',
  },
  timeOptions: {
    gap: 12,
  },
  timeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 12,
  },
  timeOptionActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  timeInfo: {
    flex: 1,
  },
  timeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  timeTextActive: {
    color: '#16a34a',
  },
  timeSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  timeSubtitleActive: {
    color: '#15803d',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 12,
  },
  paymentOptionActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  paymentSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16a34a',
  },
  checkoutSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  checkoutButton: {
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 8,
  },
  checkoutButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  checkoutButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  secureText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
  },
});