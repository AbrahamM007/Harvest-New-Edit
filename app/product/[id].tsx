import React, { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import { useCart } from '@/contexts/CartContext';
import { useConversations } from '@/hooks/useConversations';
import { Alert } from 'react-native';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MapPin, 
  Star, 
  Clock,
  Truck,
  Shield,
  Leaf,
  Plus,
  Minus,
  MessageCircle
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

type Product = Database['public']['Tables']['products']['Row'] & {
  farmer: Database['public']['Tables']['farmers']['Row'];
  category: Database['public']['Tables']['categories']['Row'] | null;
  average_rating?: number;
  review_count?: number;
};

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { createConversation } = useConversations();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          farmer:farmers(*),
          category:categories(*),
          reviews(rating)
        `)
        .eq('id', id)
        .eq('is_available', true)
        .single();

      if (error) throw error;

      // Calculate average rating
      const productWithRating = {
        ...data,
        average_rating: data.reviews?.length > 0 
          ? data.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / data.reviews.length
          : 0,
        review_count: data.reviews?.length || 0,
      };

      setProduct(productWithRating);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };
  const updateQuantity = (change: number) => {
    setQuantity(Math.max(1, quantity + change));
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    router.back();
  };

  const handleContactFarmer = async () => {
    if (!product) return;
    
    try {
      const conversation = await createConversation(product.farmer_id, product.id);
      router.push(`/chat/${conversation.id}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to start conversation');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Product not found'}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const features = [
    { icon: Leaf, text: product.is_organic ? 'Certified Organic' : 'Conventionally Grown' },
    { icon: Clock, text: product.harvest_date ? 'Fresh Harvest' : 'Available Now' },
    { icon: Truck, text: 'Same Day Delivery' },
    { icon: Shield, text: 'Quality Guaranteed' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Heart 
              size={24} 
              color={isFavorite ? "#dc2626" : "#6b7280"} 
              fill={isFavorite ? "#dc2626" : "none"}
              strokeWidth={2} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Share2 size={24} color="#6b7280" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <Image source={{ uri: product.image_url }} style={styles.productImage} />
        
        <View style={styles.freshnessTag}>
          <Clock size={14} color="#16a34a" strokeWidth={2} />
          <Text style={styles.freshnessText}>
            {product.harvest_date ? 'Fresh harvest' : 'Available now'}
          </Text>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          
          <View style={styles.farmerInfo}>
            <MapPin size={16} color="#6b7280" strokeWidth={2} />
            <Text style={styles.farmerText}>
              {product.farmer.farm_name} • {product.distance_miles ? `${product.distance_miles.toFixed(1)} miles` : 'Nearby'}
            </Text>
          </View>

          <View style={styles.ratingSection}>
            <View style={styles.ratingContainer}>
              <Star size={16} color="#fbbf24" fill="#fbbf24" strokeWidth={2} />
              <Text style={styles.rating}>
                {product.average_rating ? product.average_rating.toFixed(1) : '4.8'}
              </Text>
              <Text style={styles.reviewCount}>({product.review_count} reviews)</Text>
            </View>
          </View>

          <Text style={styles.description}>
            {product.description || 'Fresh, high-quality produce from local farmers.'}
          </Text>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.feature}>
                <feature.icon size={16} color="#16a34a" strokeWidth={2} />
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Price per {product.unit}</Text>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        </View>

        <View style={styles.quantitySection}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => updateQuantity(-1)}
          >
            <Minus size={20} color="#6b7280" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.quantity}>{quantity}</Text>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => updateQuantity(1)}
          >
            <Plus size={20} color="#6b7280" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Text style={styles.addToCartText}>Add to Cart</Text>
          <Text style={styles.totalPrice}>${(product.price * quantity).toFixed(2)}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.contactButton} onPress={handleContactFarmer}>
          <MessageCircle size={20} color="#16a34a" strokeWidth={2} />
          <Text style={styles.contactButtonText}>Contact Farmer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  productImage: {
    width: width,
    height: width * 0.8,
  },
  freshnessTag: {
    position: 'absolute',
    top: width * 0.8 - 40,
    left: 20,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  freshnessText: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '600',
  },
  productInfo: {
    padding: 20,
  },
  productName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  farmerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  farmerText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  ratingSection: {
    marginBottom: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rating: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  reviewCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 24,
  },
  featuresContainer: {
    gap: 12,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  bottomAction: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  priceSection: {
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#16a34a',
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 20,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    minWidth: 40,
    textAlign: 'center',
  },
  addToCartButton: {
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  addToCartText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  totalPrice: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  contactButton: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#16a34a',
    gap: 8,
    marginTop: 12,
  },
  contactButtonText: {
    color: '#16a34a',
    fontSize: 16,
    fontWeight: '600',
  },
});