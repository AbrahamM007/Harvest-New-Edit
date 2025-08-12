export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string
          user_id: string
          farmer_id: string
          product_id: string | null
          last_message_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          farmer_id: string
          product_id?: string | null
          last_message_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          farmer_id?: string
          product_id?: string | null
          last_message_at?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          message_type: 'text' | 'image' | 'product_share' | 'order_update'
          metadata: any
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          message_type?: 'text' | 'image' | 'product_share' | 'order_update'
          metadata?: any
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          message_type?: 'text' | 'image' | 'product_share' | 'order_update'
          metadata?: any
          read_at?: string | null
          created_at?: string
        }
      }
      message_attachments: {
        Row: {
          id: string
          message_id: string
          file_url: string
          file_type: string
          file_size: number | null
          created_at: string
        }
        Insert: {
          id?: string
          message_id: string
          file_url: string
          file_type: string
          file_size?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          file_url?: string
          file_type?: string
          file_size?: number | null
          created_at?: string
        }
      }
      stripe_customers: {
        Row: {
          id: number
          user_id: string
          customer_id: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: number
          user_id: string
          customer_id: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string
          customer_id?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      stripe_subscriptions: {
        Row: {
          id: number
          customer_id: string
          subscription_id: string | null
          price_id: string | null
          current_period_start: number | null
          current_period_end: number | null
          cancel_at_period_end: boolean
          payment_method_brand: string | null
          payment_method_last4: string | null
          status: 'not_started' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused'
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: number
          customer_id: string
          subscription_id?: string | null
          price_id?: string | null
          current_period_start?: number | null
          current_period_end?: number | null
          cancel_at_period_end?: boolean
          payment_method_brand?: string | null
          payment_method_last4?: string | null
          status: 'not_started' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: number
          customer_id?: string
          subscription_id?: string | null
          price_id?: string | null
          current_period_start?: number | null
          current_period_end?: number | null
          cancel_at_period_end?: boolean
          payment_method_brand?: string | null
          payment_method_last4?: string | null
          status?: 'not_started' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      stripe_orders: {
        Row: {
          id: number
          checkout_session_id: string
          payment_intent_id: string
          customer_id: string
          amount_subtotal: number
          amount_total: number
          currency: string
          payment_status: string
          status: 'pending' | 'completed' | 'canceled'
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: number
          checkout_session_id: string
          payment_intent_id: string
          customer_id: string
          amount_subtotal: number
          amount_total: number
          currency: string
          payment_status: string
          status?: 'pending' | 'completed' | 'canceled'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: number
          checkout_session_id?: string
          payment_intent_id?: string
          customer_id?: string
          amount_subtotal?: number
          amount_total?: number
          currency?: string
          payment_status?: string
          status?: 'pending' | 'completed' | 'canceled'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          icon: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          icon: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          icon?: string
          color?: string
          created_at?: string
        }
      }
      vendor_stripe_accounts: {
        Row: {
          id: string
          farmer_id: string
          stripe_account_id: string
          account_status: 'pending' | 'restricted' | 'enabled' | 'rejected'
          charges_enabled: boolean
          payouts_enabled: boolean
          details_submitted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          farmer_id: string
          stripe_account_id: string
          account_status?: 'pending' | 'restricted' | 'enabled' | 'rejected'
          charges_enabled?: boolean
          payouts_enabled?: boolean
          details_submitted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          farmer_id?: string
          stripe_account_id?: string
          account_status?: 'pending' | 'restricted' | 'enabled' | 'rejected'
          charges_enabled?: boolean
          payouts_enabled?: boolean
          details_submitted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      vendor_platform_customers: {
        Row: {
          id: string
          farmer_id: string
          stripe_customer_id: string
          default_payment_method_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          farmer_id: string
          stripe_customer_id: string
          default_payment_method_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          farmer_id?: string
          stripe_customer_id?: string
          default_payment_method_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vendor_subscriptions: {
        Row: {
          id: string
          farmer_id: string
          stripe_subscription_id: string | null
          status: 'inactive' | 'active' | 'past_due' | 'canceled' | 'incomplete'
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          farmer_id: string
          stripe_subscription_id?: string | null
          status?: 'inactive' | 'active' | 'past_due' | 'canceled' | 'incomplete'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          farmer_id?: string
          stripe_subscription_id?: string | null
          status?: 'inactive' | 'active' | 'past_due' | 'canceled' | 'incomplete'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      seasonal_ledgers: {
        Row: {
          id: string
          farmer_id: string
          season_year: number
          season_name: string
          gross_sales: number
          refunds: number
          net_sales: number
          discount_amount: number
          hosting_fee_due: number
          hosting_invoice_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          farmer_id: string
          season_year: number
          season_name: string
          gross_sales?: number
          refunds?: number
          net_sales?: number
          discount_amount?: number
          hosting_fee_due?: number
          hosting_invoice_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          farmer_id?: string
          season_year?: number
          season_name?: string
          gross_sales?: number
          refunds?: number
          net_sales?: number
          discount_amount?: number
          hosting_fee_due?: number
          hosting_invoice_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      marketplace_orders: {
        Row: {
          id: string
          user_id: string
          farmer_id: string
          stripe_payment_intent_id: string
          stripe_checkout_session_id: string | null
          application_fee_amount: number
          transfer_amount: number
          total_amount: number
          currency: string
          status: string
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          farmer_id: string
          stripe_payment_intent_id: string
          stripe_checkout_session_id?: string | null
          application_fee_amount: number
          transfer_amount: number
          total_amount: number
          currency?: string
          status?: string
          metadata?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          farmer_id?: string
          stripe_payment_intent_id?: string
          stripe_checkout_session_id?: string | null
          application_fee_amount?: number
          transfer_amount?: number
          total_amount?: number
          currency?: string
          status?: string
          metadata?: any
          created_at?: string
          updated_at?: string
        }
      }
      farmers: {
        Row: {
          id: string
          user_id: string | null
          farm_name: string
          description: string | null
          address: string
          phone: string | null
          verified: boolean
          created_at: string
          updated_at: string
          latitude: number | null
          longitude: number | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          farm_name: string
          description?: string | null
          address: string
          phone?: string | null
          verified?: boolean
          created_at?: string
          updated_at?: string
          latitude?: number | null
          longitude?: number | null
        }
        Update: {
          id?: string
          user_id?: string | null
          farm_name?: string
          description?: string | null
          address?: string
          phone?: string | null
          verified?: boolean
          created_at?: string
          updated_at?: string
          latitude?: number | null
          longitude?: number | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          status: string
          subtotal: number
          delivery_fee: number
          service_fee: number
          total: number
          delivery_address: string
          delivery_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: string
          subtotal: number
          delivery_fee?: number
          service_fee?: number
          total: number
          delivery_address: string
          delivery_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          subtotal?: number
          delivery_fee?: number
          service_fee?: number
          total?: number
          delivery_address?: string
          delivery_time?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          farmer_id: string
          category_id: string | null
          name: string
          description: string | null
          price: number
          unit: string
          image_url: string
          available_quantity: number
          harvest_date: string | null
          is_organic: boolean
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          farmer_id: string
          category_id?: string | null
          name: string
          description?: string | null
          price: number
          unit?: string
          image_url: string
          available_quantity?: number
          harvest_date?: string | null
          is_organic?: boolean
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          farmer_id?: string
          category_id?: string | null
          name?: string
          description?: string | null
          price?: number
          unit?: string
          image_url?: string
          available_quantity?: number
          harvest_date?: string | null
          is_organic?: boolean
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          latitude: number | null
          longitude: number | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          latitude?: number | null
          longitude?: number | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          latitude?: number | null
          longitude?: number | null
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          product_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}