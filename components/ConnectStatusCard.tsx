import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { CircleCheck as CheckCircle, CircleAlert as AlertCircle, Clock, CreditCard } from 'lucide-react-native';

interface ConnectStatusCardProps {
  connectAccount: any;
  platformCustomer: any;
  vendorSubscription: any;
  onSetupPayments: () => void;
  onSetupBilling: () => void;
  onSubscribePremium: () => void;
}

export default function ConnectStatusCard({
  connectAccount,
  platformCustomer,
  vendorSubscription,
  onSetupPayments,
  onSetupBilling,
  onSubscribePremium,
}: ConnectStatusCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enabled':
        return <CheckCircle size={20} color="#16a34a" strokeWidth={2} />;
      case 'pending':
      case 'restricted':
        return <Clock size={20} color="#f59e0b" strokeWidth={2} />;
      default:
        return <AlertCircle size={20} color="#ef4444" strokeWidth={2} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'enabled': return 'Ready to receive payments';
      case 'pending': return 'Onboarding in progress';
      case 'restricted': return 'Additional info required';
      case 'rejected': return 'Account rejected';
      default: return 'Setup required';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Setup</Text>
      
      {/* Connect Account Status */}
      <View style={styles.statusItem}>
        <View style={styles.statusLeft}>
          {getStatusIcon(connectAccount?.account_status || 'none')}
          <View style={styles.statusText}>
            <Text style={styles.statusTitle}>Stripe Connect</Text>
            <Text style={styles.statusSubtitle}>
              {getStatusText(connectAccount?.account_status || 'none')}
            </Text>
          </View>
        </View>
        {!connectAccount?.charges_enabled && (
          <TouchableOpacity style={styles.actionButton} onPress={onSetupPayments}>
            <Text style={styles.actionButtonText}>Setup</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Platform Billing Status */}
      <View style={styles.statusItem}>
        <View style={styles.statusLeft}>
          {platformCustomer ? (
            <CheckCircle size={20} color="#16a34a" strokeWidth={2} />
          ) : (
            <AlertCircle size={20} color="#f59e0b" strokeWidth={2} />
          )}
          <View style={styles.statusText}>
            <Text style={styles.statusTitle}>Platform Billing</Text>
            <Text style={styles.statusSubtitle}>
              {platformCustomer ? 'Payment method on file' : 'No payment method'}
            </Text>
          </View>
        </View>
        {!platformCustomer && (
          <TouchableOpacity style={styles.actionButton} onPress={onSetupBilling}>
            <Text style={styles.actionButtonText}>Add Card</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Premium Subscription Status */}
      <View style={styles.statusItem}>
        <View style={styles.statusLeft}>
          {vendorSubscription?.status === 'active' ? (
            <CheckCircle size={20} color="#7c3aed" strokeWidth={2} />
          ) : (
            <CreditCard size={20} color="#6b7280" strokeWidth={2} />
          )}
          <View style={styles.statusText}>
            <Text style={styles.statusTitle}>Premium Features</Text>
            <Text style={styles.statusSubtitle}>
              {vendorSubscription?.status === 'active' ? 'Active subscription' : '$5/month premium features'}
            </Text>
          </View>
        </View>
        {vendorSubscription?.status !== 'active' && platformCustomer && (
          <TouchableOpacity style={styles.premiumButton} onPress={onSubscribePremium}>
            <Text style={styles.premiumButtonText}>Subscribe</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  statusText: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  premiumButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  premiumButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});