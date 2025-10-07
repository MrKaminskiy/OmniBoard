import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Browser client for SSR
export const createClientComponentClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Types for our database
export interface UserProfile {
  id: string
  username?: string
  avatar_url?: string
  subscription_tier: 'free' | 'premium'
  subscription_expires_at?: string
  created_at: string
  updated_at?: string
}

export interface Signal {
  id: string
  source: 'telegram' | 'tradingview' | 'manual'
  pair: string
  timeframe?: string
  direction: 'LONG' | 'SHORT'
  entry_price?: number
  dca_price?: number
  stop_loss?: number
  tp_levels: Array<{
    level: number
    price: number
    hit: boolean
    hit_at?: string
  }>
  current_price?: number
  status: 'ACTIVE' | 'TP_HIT' | 'SL_HIT' | 'CLOSED'
  confidence?: number
  raw_data?: any
  metadata?: any
  created_at: string
  updated_at: string
}

export interface SignalUpdate {
  id: string
  signal_id: string
  event_type: 'TP_HIT' | 'SL_HIT' | 'PRICE_UPDATE'
  price?: number
  metadata?: any
  created_at: string
}

export interface Payment {
  id: string
  user_id: string
  amount: number
  currency: string
  tx_hash?: string
  status: 'PENDING' | 'CONFIRMED' | 'FAILED'
  plan_duration: number
  payment_address?: string
  metadata?: any
  created_at: string
  confirmed_at?: string
}
