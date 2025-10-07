// Временная заглушка для деплоя
export const supabase = {
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
    signUp: () => Promise.resolve({ data: { user: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: null })
      })
    })
  })
};

export const createClientComponentClient = () => supabase;

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
