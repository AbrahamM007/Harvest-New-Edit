import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Package, DollarSign, TrendingUp, Eye, CreditCard as Edit3, Trash2, CircleAlert as AlertCircle } from 'lucide-react-native';
import { useSellerProducts } from '@/hooks/useSellerProducts';
import { useFarmer } from '@/hooks/useFarmer';
import { useStripeConnect } from '@/hooks/useStripeConnect';
import ConnectStatusCard from '@/components/ConnectStatusCard';
import { supabase } from '@/lib/supabase';

export default function SellerDashboardScreen() {
  const router = useRouter();
  const { farmer, loading: farmerLoading } = useFarmer();
  const { products, loading: productsLoading } = useSellerProducts();
  const { 
    connectAccount, 
    platformCustomer, 
    vendorSubscription,
    createConnectAccount,
    setupBilling,
    subscribeToPremium,
    loading: stripeLoading 
  } = useStripeConnect();

  const totalRevenue = products.reduce((sum, product) => sum + (product.price * 10), 0); // Mock sales
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.is_available).length;

  const handleDeleteProduct = async (productId: string, productName: string) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${productName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId);

              if (error) throw error;
              
              // Refresh products list
              window.location.reload();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            }
          }
        }
      ]
    );
  };

  if (farmerLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!farmer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notEnrolledContainer}>
          <AlertCircle size={48} color="#f59e0b" strokeWidth={2} />
          <Text style={styles.notEnrolledTitle}>Not Enrolled as Seller</Text>
          <Text style={styles.notEnrolledText}>
            You need to enroll as a seller to access this dashboard
          </Text>
          <TouchableOpacity 
            style={styles.enrollButton}
            onPress={() => router.push('/seller/enroll')}
          >
            <Text style={styles.enrollButtonText}>Enroll Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleStripeOnboarding = async () => {
    try {
      await createConnectAccount();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to start onboarding');
    }
  };

  const handleSetupBilling = async () => {
    try {
      await setupBilling();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to setup billing');
    }
  };

  const handlePremiumSubscription = async () => {
    try {
      await subscribeToPremium();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to setup premium');
    }
  };

  if (!farmer.verified) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.pendingContainer}>
          <AlertCircle size={48} color="#f59e0b" strokeWidth={2} />
          <Text style={styles.pendingTitle}>Application Under Review</Text>
          <Text style={styles.pendingText}>
            Your seller application is being reviewed. You'll be notified once approved.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.farmName}>{farmer.farm_name}</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/seller/add-product')}
        >
          <Plus size={24} color="#ffffff" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <DollarSign size={24} color="#16a34a" strokeWidth={2} />
            <Text style={styles.statNumber}>${totalRevenue.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Total Revenue</Text>
          </View>
          <View style={styles.statCard}>
            <Package size={24} color="#2563eb" strokeWidth={2} />
            <Text style={styles.statNumber}>{totalProducts}</Text>
            <Text style={styles.statLabel}>Total Products</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#dc2626" strokeWidth={2} />
            <Text style={styles.statNumber}>{activeProducts}</Text>
            <Text style={styles.statLabel}>Active Listings</Text>
          </View>
        </View>

        {/* Stripe Connect Status */}
        <ConnectStatusCard
          connectAccount={connectAccount}
          platformCustomer={platformCustomer}
          vendorSubscription={vendorSubscription}
          onSetupPayments={handleStripeOnboarding}
          onSetupBilling={handleSetupBilling}
          onSubscribePremium={handlePremiumSubscription}
        />

        {/* Products Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Products</Text>
            <TouchableOpacity onPress={() => router.push('/seller/add-product')}>
              <Text style={styles.addProductText}>Add Product</Text>
            </TouchableOpacity>
          </View>

          {productsLoading ? (
            <ActivityIndicator size="large" color="#16a34a" style={styles.loader} />
          ) : products.length === 0 ? (
            <View style={styles.emptyState}>
              <Package size={48} color="#9ca3af" strokeWidth={2} />
              <Text style={styles.emptyStateTitle}>No Products Yet</Text>
              <Text style={styles.emptyStateText}>
                Start by adding your first product to begin selling
              </Text>
              <TouchableOpacity 
                style={styles.addFirstProductButton}
                onPress={() => router.push('/seller/add-product')}
              >
                <Plus size={20} color="#ffffff" strokeWidth={2} />
                <Text style={styles.addFirstProductText}>Add Your First Product</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.productsList}>
              {products.map((product) => (
                <View key={product.id} style={styles.productCard}>
                  <Image source={{ uri: product.image_url }} style={styles.productImage} />
                  
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productPrice}>${product.price.toFixed(2)}/{product.unit}</Text>
                    <View style={styles.productStatus}>
                      <View style={[
                        styles.statusDot, 
                        { backgroundColor: product.is_available ? '#16a34a' : '#ef4444' }
                      ]} />
                      <Text style={styles.statusText}>
                        {product.is_available ? 'Available' : 'Unavailable'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.productActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => router.push(`/product/${product.id}`)}
                    >
                      <Eye size={16} color="#6b7280" strokeWidth={2} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => Alert.alert('Coming Soon', 'Product editing will be available soon')}
                    >
                      <Edit3 size={16} color="#6b7280" strokeWidth={2} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleDeleteProduct(product.id, product.name)}
                    >
                      <Trash2 size={16} color="#ef4444" strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  greeting: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 2,
  },
  farmName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  addProductText: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '600',
  },
  loader: {
    marginVertical: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstProductButton: {
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addFirstProductText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  productsList: {
    gap: 12,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
    marginBottom: 4,
  },
  productStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#6b7280',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  notEnrolledContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  notEnrolledTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  notEnrolledText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  enrollButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  enrollButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  pendingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  pendingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  pendingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});