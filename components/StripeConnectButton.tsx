import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { CreditCard, ExternalLink } from 'lucide-react-native';

interface StripeConnectButtonProps {
  onPress: () => void;
  loading?: boolean;
  connected?: boolean;
  disabled?: boolean;
}

export default function StripeConnectButton({ 
  onPress, 
  loading = false, 
  connected = false,
  disabled = false 
}: StripeConnectButtonProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        connected && styles.connectedButton,
        disabled && styles.disabledButton
      ]}
      onPress={onPress}
      disabled={loading || disabled}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        <>
          <CreditCard size={20} color="#ffffff" strokeWidth={2} />
          <Text style={styles.buttonText}>
            {connected ? 'Stripe Connected' : 'Connect with Stripe'}
          </Text>
          {!connected && <ExternalLink size={16} color="#ffffff" strokeWidth={2} />}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#635bff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  connectedButton: {
    backgroundColor: '#16a34a',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});