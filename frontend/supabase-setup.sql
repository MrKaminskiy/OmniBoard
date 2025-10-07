-- OmniBoard Supabase Database Setup
-- Запустите этот скрипт в SQL Editor Supabase

-- 1. Создание таблицы профилей пользователей
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE,
  avatar_url TEXT,
  subscription_tier VARCHAR(20) DEFAULT 'free', -- 'free' | 'premium'
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Создание таблицы платежей
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(20,8),
  currency VARCHAR(10), -- 'USDT' | 'BTC' | 'ETH'
  tx_hash VARCHAR(255),
  status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING' | 'CONFIRMED' | 'FAILED'
  plan_duration INT, -- дней
  payment_address TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- 3. Создание таблицы сигналов
CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(50) NOT NULL, -- 'telegram' | 'tradingview' | 'manual'
  pair VARCHAR(20) NOT NULL,
  timeframe VARCHAR(10),
  direction VARCHAR(10) NOT NULL, -- 'LONG' | 'SHORT'
  entry_price DECIMAL(20,8),
  dca_price DECIMAL(20,8),
  stop_loss DECIMAL(20,8),
  tp_levels JSONB, -- [{level: 1, price: 45000, hit: false}]
  current_price DECIMAL(20,8),
  status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE' | 'TP_HIT' | 'SL_HIT' | 'CLOSED'
  confidence DECIMAL(3,2),
  raw_data JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Создание таблицы обновлений сигналов
CREATE TABLE IF NOT EXISTS signal_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID REFERENCES signals(id) ON DELETE CASCADE,
  event_type VARCHAR(50), -- 'TP_HIT' | 'SL_HIT' | 'PRICE_UPDATE'
  price DECIMAL(20,8),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Создание таблицы подключений к биржам
CREATE TABLE IF NOT EXISTS exchange_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exchange VARCHAR(20) NOT NULL, -- 'binance' | 'bybit' | 'bingx'
  api_key_encrypted TEXT NOT NULL,
  api_secret_encrypted TEXT NOT NULL,
  permissions JSONB, -- ['read', 'trade']
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Создание таблицы сделок
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exchange_connection_id UUID REFERENCES exchange_connections(id) ON DELETE CASCADE,
  exchange_trade_id VARCHAR(100),
  pair VARCHAR(20) NOT NULL,
  side VARCHAR(10) NOT NULL, -- 'BUY' | 'SELL'
  type VARCHAR(20), -- 'MARKET' | 'LIMIT' | 'STOP_LOSS'
  quantity DECIMAL(20,8),
  price DECIMAL(20,8),
  commission DECIMAL(20,8),
  commission_asset VARCHAR(10),
  realized_pnl DECIMAL(20,8),
  executed_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Создание таблицы позиций
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pair VARCHAR(20) NOT NULL,
  side VARCHAR(10) NOT NULL,
  entry_price DECIMAL(20,8),
  quantity DECIMAL(20,8),
  current_price DECIMAL(20,8),
  unrealized_pnl DECIMAL(20,8),
  realized_pnl DECIMAL(20,8),
  status VARCHAR(20) DEFAULT 'OPEN', -- 'OPEN' | 'CLOSED'
  opened_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Создание таблицы источников медиа
CREATE TABLE IF NOT EXISTS media_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- 'twitter' | 'telegram' | 'rss'
  identifier VARCHAR(255) NOT NULL, -- username, channel_id, или URL
  name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  last_fetch TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Создание таблицы постов медиа
CREATE TABLE IF NOT EXISTS media_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES media_sources(id) ON DELETE CASCADE,
  external_id VARCHAR(255),
  content TEXT,
  author VARCHAR(100),
  published_at TIMESTAMPTZ,
  url TEXT,
  media_urls JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_signals_pair ON signals(pair);
CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status);
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_source ON signals(source);

CREATE INDEX IF NOT EXISTS idx_signal_updates_signal_id ON signal_updates(signal_id);
CREATE INDEX IF NOT EXISTS idx_signal_updates_created_at ON signal_updates(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_pair ON trades(pair);
CREATE INDEX IF NOT EXISTS idx_trades_executed_at ON trades(executed_at DESC);

CREATE INDEX IF NOT EXISTS idx_positions_user_id ON positions(user_id);
CREATE INDEX IF NOT EXISTS idx_positions_status ON positions(status);

CREATE INDEX IF NOT EXISTS idx_media_sources_user_id ON media_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_media_posts_source_id ON media_posts(source_id);
CREATE INDEX IF NOT EXISTS idx_media_posts_published_at ON media_posts(published_at DESC);

-- 11. Row Level Security (RLS) Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_posts ENABLE ROW LEVEL SECURITY;

-- Политики для user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Политики для payments
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Политики для exchange_connections
CREATE POLICY "Users can manage own connections" ON exchange_connections FOR ALL USING (auth.uid() = user_id);

-- Политики для trades
CREATE POLICY "Users can view own trades" ON trades FOR SELECT USING (auth.uid() = user_id);

-- Политики для positions
CREATE POLICY "Users can view own positions" ON positions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own positions" ON positions FOR UPDATE USING (auth.uid() = user_id);

-- Политики для media_sources
CREATE POLICY "Users can manage own media sources" ON media_sources FOR ALL USING (auth.uid() = user_id);

-- Политики для media_posts
CREATE POLICY "Users can view posts from own sources" ON media_posts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM media_sources 
    WHERE media_sources.id = media_posts.source_id 
    AND media_sources.user_id = auth.uid()
  )
);

-- 12. Функция для автоматического создания профиля пользователя
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Триггер для автоматического создания профиля
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 14. Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 15. Триггеры для обновления updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_signals_updated_at BEFORE UPDATE ON signals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 16. Вставка тестовых данных (опционально)
-- Сигналы доступны всем (без RLS)
INSERT INTO signals (source, pair, timeframe, direction, entry_price, dca_price, stop_loss, tp_levels, current_price, status, confidence) VALUES
('telegram', 'BTC/USDT', '4h', 'LONG', 45000.00, 44000.00, 42000.00, '[{"level": 1, "price": 46000, "hit": false}, {"level": 2, "price": 47000, "hit": false}]', 45200.00, 'ACTIVE', 0.85),
('telegram', 'ETH/USDT', '1h', 'SHORT', 3200.00, 3250.00, 3350.00, '[{"level": 1, "price": 3100, "hit": false}, {"level": 2, "price": 3000, "hit": false}]', 3180.00, 'ACTIVE', 0.75),
('telegram', 'ADA/USDT', '4h', 'LONG', 0.45, 0.44, 0.42, '[{"level": 1, "price": 0.47, "hit": false}, {"level": 2, "price": 0.50, "hit": false}]', 0.452, 'ACTIVE', 0.65),
('tradingview', 'SOL/USDT', '1h', 'LONG', 120.00, 118.00, 110.00, '[{"level": 1, "price": 125, "hit": false}, {"level": 2, "price": 130, "hit": false}]', 121.50, 'ACTIVE', 0.80),
('telegram', 'DOT/USDT', '4h', 'SHORT', 8.50, 8.70, 9.00, '[{"level": 1, "price": 8.20, "hit": false}, {"level": 2, "price": 7.90, "hit": false}]', 8.45, 'ACTIVE', 0.70);

-- Готово! Теперь у вас есть полная база данных для OmniBoard
