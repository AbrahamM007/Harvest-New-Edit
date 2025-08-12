import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { Database } from '@/lib/database.types';

type Product = Database['public']['Tables']['products']['Row'] & {
  farmer: Database['public']['Tables']['farmers']['Row'];
  category: Database['public']['Tables']['categories']['Row'] | null;
  average_rating?: number;
  review_count?: number;
  distance_miles?: number;
};

export function useProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
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
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Calculate average ratings
      const productsWithRatings = data?.map(product => ({
        ...product,
        average_rating: product.reviews?.length > 0 
          ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length
          : 0,
        review_count: product.reviews?.length || 0,
        distance_miles: Math.random() * 5 + 0.5, // Mock distance for now
      })) || [];

      // Sort by distance (nearest first)
      productsWithRatings.sort((a, b) => (a.distance_miles || 999) - (b.distance_miles || 999));

      setProducts(productsWithRatings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  return { products, loading, error, refetch: fetchProducts };
}

export function useProductsByCategory(categoryName?: string) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('products')
        .select(`
          *,
          farmer:farmers(*),
          category:categories(*),
          reviews(rating)
        `)
        .eq('is_available', true);

      if (categoryName && categoryName !== 'All') {
        query = query.eq('categories.name', categoryName);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate average ratings
      const productsWithRatings = data?.map(product => ({
        ...product,
        average_rating: product.reviews?.length > 0 
          ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length
          : 0,
        review_count: product.reviews?.length || 0,
        distance_miles: Math.random() * 5 + 0.5, // Mock distance for now
      })) || [];

      // Sort by distance (nearest first)
      productsWithRatings.sort((a, b) => (a.distance_miles || 999) - (b.distance_miles || 999));

      setProducts(productsWithRatings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryName, user]);

  return { products, loading, error, refetch: fetchProducts };
}