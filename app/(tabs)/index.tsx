import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Star, Clock, Leaf, ShoppingCart } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useProfile } from '@/hooks/useProfile';
import { useCart } from '@/contexts/CartContext';
import { useSubscription } from '@/hooks/useSubscription';
import { stripeProducts } from '@/src/stripe-config';
import StripeProductCard from '@/components/StripeProductCard';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const { profile } = useProfile();
  const { addToCart } = useCart();
  const { subscription } = useSubscription();

  const featuredProducts = products.slice(0, 2);
  const isLoading = productsLoading || categoriesLoading;

  const formatPrice = (price: number, unit: string) => `$${price.toFixed(2)}/${unit}`;
  
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning! 🌅';
    if (hour < 17) return 'Good afternoon! ☀️';
    return 'Good evening! 🌙';
  };

  const handlePurchaseStripeProduct = (productId: string) => {
    router.push(`/stripe-checkout?productId=${productId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {profile?.full_name ? `Hello, ${profile.full_name.split(' ')[0]}! 👋` : getTimeBasedGreeting()}
            </Text>
            <View style={styles.locationContainer}>
              <MapPin size={16} color="#6b7280" strokeWidth={2} />
              <Text style={styles.location}>Downtown Community</Text>
            </View>
            {subscription && (
              <View style={styles.subscriptionBadge}>
                <Text style={styles.subscriptionText}>
                  Plan: {subscription.subscription_status === 'active' ? 'Premium' : 'Free'}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Image
              source={{ 
                uri: profile?.avatar_url || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100' 
              }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <LinearGradient
          colors={['#16a34a', '#15803d']}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <Leaf size={32} color="#ffffff" strokeWidth={2} />
            <Text style={styles.heroTitle}>Fresh from your neighbors</Text>
            <Text style={styles.heroSubtitle}>
              Support local farmers and enjoy the freshest produce in your community
            </Text>
            <TouchableOpacity style={styles.heroButton}>
              <Text style={styles.heroButtonText}>Shop Local</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Stripe Products Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Premium Products</Text>
          <View style={styles.premiumProductsContainer}>
            {stripeProducts.map((product) => (
              <StripeProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
                mode={product.mode}
                onPurchase={handlePurchaseStripeProduct}
              />
            ))}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          {isLoading ? (
            <ActivityIndicator size="large" color="#16a34a" style={styles.loader} />
          ) : (
            <View style={styles.categoriesGrid}>
              {categories.map((category) => (
                <TouchableOpacity 
                  key={category.id} 
                  style={styles.categoryCard}
                  onPress={() => router.push(`/(tabs)/search?category=${category.name}`)}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                    <Text style={styles.categoryEmoji}>{category.icon}</Text>
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Fresh Today</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <ActivityIndicator size="large" color="#16a34a" style={styles.loader} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsScroll}>
              {featuredProducts.map((product) => (
                <TouchableOpacity 
                  key={product.id} 
                  style={styles.productCard}
                  onPress={() => router.push(`/product/${product.id}`)}
                >
                  <Image source={{ uri: product.image_url }} style={styles.productImage} />
                  <View style={styles.freshnessTag}>
                    <Clock size={12} color="#16a34a" strokeWidth={2} />
                    <Text style={styles.freshnessText}>
                      {product.harvest_date ? 'Fresh harvest' : 'Available now'}
                    </Text>
                  </View>
                  
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.farmerName}>{product.farmer.farm_name}</Text>
                    
                    <View style={styles.productMeta}>
                      <View style={styles.ratingContainer}>
                        <Star size={14} color="#fbbf24" fill="#fbbf24" strokeWidth={2} />
                        <Text style={styles.rating}>
                          {product.average_rating ? product.average_rating.toFixed(1) : '4.8'}
                        </Text>
                      </View>
                      <View style={styles.distanceContainer}>
                        <MapPin size={12} color="#6b7280" strokeWidth={2} />
                        <Text style={styles.distance}>1.2 miles</Text>
                      </View>
                    </View>
                    
                    <View style={styles.priceContainer}>
                      <Text style={styles.price}>{formatPrice(product.price, product.unit)}</Text>
                      <TouchableOpacity 
                        style={styles.addButton}
                        onPress={() => addToCart(product)}
                      >
                        <Text style={styles.addButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Community Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Community Impact</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>127</Text>
              <Text style={styles.statLabel}>Local Farmers</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>2.3k</Text>
              <Text style={styles.statLabel}>Happy Customers</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>15k</Text>
              <Text style={styles.statLabel}>Pounds Sold</Text>
            </View>
          </View>
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
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  subscriptionBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  subscriptionText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
  },
  profileButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  loader: {
    marginVertical: 20,
  },
  heroSection: {
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 16,
    padding: 24,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
    marginBottom: 20,
  },
  heroButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  heroButtonText: {
    color: '#16a34a',
    fontWeight: '600',
    fontSize: 16,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
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
  seeAllText: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '600',
  },
  premiumProductsContainer: {
    marginTop: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  categoryCard: {
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  productsScroll: {
    marginTop: 16,
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginRight: 16,
    width: width * 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  freshnessTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  freshnessText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  farmerName: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distance: {
    fontSize: 12,
    color: '#6b7280',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16a34a',
  },
  addButton: {
    backgroundColor: '#16a34a',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statCard: {
    backgroundColor: '#ffffff',
    flex: 1,
    marginHorizontal: 4,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#16a34a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
  },
});