import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useFarmer } from './useFarmer';
import type { Database } from '@/lib/database.types';

type Conversation = Database['public']['Tables']['conversations']['Row'] & {
  user: Database['public']['Tables']['profiles']['Row'];
  farmer: Database['public']['Tables']['farmers']['Row'];
  product?: Database['public']['Tables']['products']['Row'] | null;
  last_message?: {
    content: string;
    sender_id: string;
    created_at: string;
  };
  unread_count?: number;
};

export function useConversations() {
  const { user } = useAuth();
  const { farmer } = useFarmer();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Build query based on user role
      let query = supabase
        .from('conversations')
        .select(`
          *,
          user:profiles!conversations_user_id_fkey(*),
          farmer:farmers!conversations_farmer_id_fkey(*),
          product:products(*)
        `)
        .order('last_message_at', { ascending: false });

      // Filter based on user role
      if (farmer) {
        // If user is a farmer, show conversations for their farm
        query = query.eq('farmer_id', farmer.id);
      } else {
        // If regular user, show their conversations
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get last message and unread count for each conversation
      const conversationsWithDetails = await Promise.all(
        (data || []).map(async (conversation) => {
          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, sender_id, created_at')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conversation.id)
            .neq('sender_id', user.id)
            .is('read_at', null);

          return {
            ...conversation,
            last_message: lastMessage,
            unread_count: unreadCount || 0,
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (farmerId: string, productId?: string) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('conversations')
      .upsert({
        user_id: user.id,
        farmer_id: farmerId,
        product_id: productId || null,
      }, {
        onConflict: 'user_id,farmer_id,product_id'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  useEffect(() => {
    fetchConversations();

    // Subscribe to conversation changes
    const subscription = supabase
      .channel('conversations')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'conversations',
          filter: farmer ? `farmer_id=eq.${farmer.id}` : `user_id=eq.${user?.id}`
        }, 
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, farmer]);

  return { 
    conversations, 
    loading, 
    error, 
    createConversation,
    refetch: fetchConversations 
  };
}