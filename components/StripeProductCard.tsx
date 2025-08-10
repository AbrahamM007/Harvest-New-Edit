import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { ShoppingCart, Star, Crown } from 'lucide-react-native';

interface StripeProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  mode: 'payment' | 'subscription';
  onPurchase: (productId: string) => void;
}

export default function StripeProductCard({ 
  id, 
  name, 
  description, 
  price, 
  mode, 
  onPurchase 
}: StripeProductCardProps) {
  const isSubscription = mode === 'subscription';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {isSubscription ? (
            <Crown size={24} color="#7c3aed" strokeWidth={2} />
          ) : (
            <ShoppingCart size={24} color="#16a34a" strokeWidth={2} />
          )}
        </View>
        {isSubscription && (
          <View style={styles.subscriptionBadge}>
            <Text style={styles.subscriptionText}>PREMIUM</Text>
          </View>
        )}
      </View>

      <Text style={styles.name}>{name}</Text>
      <Text style={styles.description}>{description}</Text>
      
      <View style={styles.priceContainer}>
        <Text style={styles.price}>
          ${price.toFixed(2)}
          {isSubscription && <Text style={styles.period}>/month</Text>}
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.purchaseButton, isSubscription && styles.subscriptionButton]}
        onPress={() => onPurchase(id)}
      >
        <Text style={[styles.purchaseButtonText, isSubscription && styles.subscriptionButtonText]}>
          {isSubscription ? 'Subscribe Now' : 'Buy Now'}
        </Text>
      </TouchableOpacity>

      {isSubscription && (
        <View style={styles.features}>
          <View style={styles.feature}>
            <Star size={12} color="#7c3aed" strokeWidth={2} />
            <Text style={styles.featureText}>Priority delivery</Text>
          </View>
          <View style={styles.feature}>
            <Star size={12} color="#7c3aed" strokeWidth={2} />
            <Text style={styles.featureText}>Exclusive products</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionBadge: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subscriptionText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  priceContainer: {
    marginBottom: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  period: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  purchaseButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  subscriptionButton: {
    backgroundColor: '#7c3aed',
  },
  purchaseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  subscriptionButtonText: {
    color: '#ffffff',
  },
  features: {
    marginTop: 12,
    gap: 6,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    color: '#6b7280',
  },
});