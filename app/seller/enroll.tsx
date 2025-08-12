import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Leaf, MapPin, Phone, FileText, Store } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export default function SellerEnrollScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [farmName, setFarmName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEnroll = async () => {
    if (!farmName.trim() || !address.trim()) {
      Alert.alert('Error', 'Please fill in farm name and address');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to enroll as a seller');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('farmers')
        .insert({
          user_id: user.id,
          farm_name: farmName.trim(),
          description: description.trim() || null,
          address: address.trim(),
          phone: phone.trim() || null,
          verified: false,
        });

      if (error) throw error;

      Alert.alert(
        'Application Submitted!',
        'Welcome to Harvest! Your seller account is now active. You can start adding products immediately.',
        [{ text: 'Continue', onPress: () => router.replace('/seller/dashboard') }]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#111827" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.title}>Become a Seller</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroIcon}>
              <Leaf size={32} color="#ffffff" strokeWidth={2} />
            </View>
            <Text style={styles.heroTitle}>Join Our Community</Text>
            <Text style={styles.heroSubtitle}>
              Share your fresh produce with local customers and grow your farm business
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Farm Name *</Text>
              <View style={styles.inputWrapper}>
                <Store size={20} color="#6b7280" strokeWidth={2} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your farm name"
                  value={farmName}
                  onChangeText={setFarmName}
                  autoCapitalize="words"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Farm Description</Text>
              <View style={styles.textAreaWrapper}>
                <FileText size={20} color="#6b7280" strokeWidth={2} />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Tell customers about your farm and growing practices..."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Farm Address *</Text>
              <View style={styles.inputWrapper}>
                <MapPin size={20} color="#6b7280" strokeWidth={2} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your farm address"
                  value={address}
                  onChangeText={setAddress}
                  autoCapitalize="words"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <Phone size={20} color="#6b7280" strokeWidth={2} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>What happens next?</Text>
              <Text style={styles.infoText}>
                • Your seller account will be activated immediately{'\n'}
                • You can start listing products right away{'\n'}
                • Set up Stripe Connect to receive payments{'\n'}
                • Upload photos and set your own prices
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.enrollButton, loading && styles.enrollButtonDisabled]}
              onPress={handleEnroll}
              disabled={loading}
            >
              <Text style={styles.enrollButtonText}>
                {loading ? 'Submitting Application...' : 'Submit Application'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  keyboardView: {
    flex: 1,
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
  heroSection: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  textAreaWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    minHeight: 80,
  },
  infoBox: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0369a1',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#0369a1',
    lineHeight: 20,
  },
  enrollButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  enrollButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  enrollButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});