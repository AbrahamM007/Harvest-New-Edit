import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { Database } from '@/lib/database.types';

type Farmer = Database['public']['Tables']['farmers']['Row'];

export function useFarmer() {
  const { user } = useAuth();
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFarmer = async () => {
    if (!user) {
      setFarmer(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setFarmer(data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch farmer profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmer();
  }, [user]);

  return { farmer, loading, error, refetch: fetchFarmer };
}