

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

export interface MarketOverview {
  market_cap: number;
  market_cap_formatted: string;
  market_cap_change_24h: number;
  volume_24h: number;
  volume_formatted: string;
  volume_change_24h: number;
  active_coins: number;
  gainers_24h: number;
  losers_24h: number;
  last_update: string;
  data_sources: string[];
  fear_greed?: string;
  altseason?: string;
}

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  price: number;
  price_change_24h: number;
  market_cap: number;
  volume_24h: number;
  rsi_1d: number;
  liquidations_24h: number;
  image: string;
}

export interface Ticker {
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  volume24h: number;
  marketCap: number;
  marketCapRank: number;
}

export interface Signal {
  id: string;
  symbol: string;
  timeframe: string;
  signal: 'buy' | 'sell' | 'hold';
  strength: number;
  price: number;
  timestamp: string;
  source: string;
}

export interface ApiResponse<T> {
  status: 'ok' | 'error';
  data: T;
  timestamp: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  async getMarketOverview(): Promise<ApiResponse<MarketOverview>> {
    return this.request<ApiResponse<MarketOverview>>('/api/v1/market/overview');
  }

  async getSpecificCoins(coinIds: string[]): Promise<ApiResponse<{ coins: Coin[] }>> {
    const coinsParam = coinIds.join(',');
    return this.request<ApiResponse<{ coins: Coin[] }>>(`/api/v1/market/specific-coins?coins=${coinsParam}`);
  }

  async getTopGainers(limit: number = 10): Promise<ApiResponse<{ coins: Coin[] }>> {
    return this.request<ApiResponse<{ coins: Coin[] }>>(`/api/v1/market/top-gainers?limit=${limit}`);
  }

  async getTopLosers(limit: number = 10): Promise<ApiResponse<{ coins: Coin[] }>> {
    return this.request<ApiResponse<{ coins: Coin[] }>>(`/api/v1/market/top-losers?limit=${limit}`);
  }

  async getTickers(): Promise<ApiResponse<{ coins: Coin[] }>> {
    // Захардкоженные 15 монет с мок-данными
    const hardcodedCoins: Coin[] = [
      { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 0, price_change_24h: 0, market_cap: 0, volume_24h: 0, rsi_1d: 0, liquidations_24h: 0, image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
      { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 0, price_change_24h: 0, market_cap: 0, volume_24h: 0, rsi_1d: 0, liquidations_24h: 0, image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
      { id: 'solana', symbol: 'SOL', name: 'Solana', price: 0, price_change_24h: 0, market_cap: 0, volume_24h: 0, rsi_1d: 0, liquidations_24h: 0, image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' },
      { id: 'ripple', symbol: 'XRP', name: 'XRP', price: 0, price_change_24h: 0, market_cap: 0, volume_24h: 0, rsi_1d: 0, liquidations_24h: 0, image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png' },
      { id: 'binancecoin', symbol: 'BNB', name: 'BNB', price: 0, price_change_24h: 0, market_cap: 0, volume_24h: 0, rsi_1d: 0, liquidations_24h: 0, image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png' },
      { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', price: 0, price_change_24h: 0, market_cap: 0, volume_24h: 0, rsi_1d: 0, liquidations_24h: 0, image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png' },
      { id: 'sui', symbol: 'SUI', name: 'Sui', price: 0, price_change_24h: 0, market_cap: 0, volume_24h: 0, rsi_1d: 0, liquidations_24h: 0, image: 'https://assets.coingecko.com/coins/images/26375/large/sui_asset.jpeg' },
      { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', price: 0, price_change_24h: 0, market_cap: 0, volume_24h: 0, rsi_1d: 0, liquidations_24h: 0, image: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png' },
      { id: 'aave', symbol: 'AAVE', name: 'Aave', price: 0, price_change_24h: 0, market_cap: 0, volume_24h: 0, rsi_1d: 0, liquidations_24h: 0, image: 'https://assets.coingecko.com/coins/images/12645/large/AAVE.png' },
      { id: 'pepe', symbol: 'PEPE', name: 'Pepe', price: 0, price_change_24h: 0, market_cap: 0, volume_24h: 0, rsi_1d: 0, liquidations_24h: 0, image: 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg' },
      { id: 'dogwifhat', symbol: 'WIF', name: 'Dogwifhat', price: 0, price_change_24h: 0, market_cap: 0, volume_24h: 0, rsi_1d: 0, liquidations_24h: 0, image: 'https://assets.coingecko.com/coins/images/33566/large/dogwifhat.jpg' },
      { id: 'litecoin', symbol: 'LTC', name: 'Litecoin', price: 0, price_change_24h: 0, market_cap: 0, volume_24h: 0, rsi_1d: 0, liquidations_24h: 0, image: 'https://assets.coingecko.com/coins/images/2/large/litecoin.png' },
      { id: 'cardano', symbol: 'ADA', name: 'Cardano', price: 0, price_change_24h: 0, market_cap: 0, volume_24h: 0, rsi_1d: 0, liquidations_24h: 0, image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png' },
      { id: 'optimism', symbol: 'OP', name: 'Optimism', price: 0, price_change_24h: 0, market_cap: 0, volume_24h: 0, rsi_1d: 0, liquidations_24h: 0, image: 'https://assets.coingecko.com/coins/images/25244/large/Optimism.png' },
      { id: 'aptos', symbol: 'APT', name: 'Aptos', price: 0, price_change_24h: 0, market_cap: 0, volume_24h: 0, rsi_1d: 0, liquidations_24h: 0, image: 'https://assets.coingecko.com/coins/images/26455/large/aptos_round.png' }
    ];

    try {
      // Пытаемся получить реальные данные через BingX API
      const response = await this.getSpecificCoins(['bitcoin', 'ethereum', 'solana', 'ripple', 'binancecoin', 'dogecoin', 'sui', 'chainlink', 'aave', 'pepe', 'dogwifhat', 'litecoin', 'cardano', 'optimism', 'aptos']);
      
      // Если получили данные, объединяем с захардкоженными
      if (response.data.coins && response.data.coins.length > 0) {
        const updatedCoins = hardcodedCoins.map(hardcodedCoin => {
          const realData = response.data.coins.find(coin => coin.id === hardcodedCoin.id);
          if (realData && realData.price > 0) {
            return {
              ...hardcodedCoin,
              price: realData.price,
              price_change_24h: realData.price_change_24h,
              volume_24h: realData.volume_24h
            };
          }
          return hardcodedCoin;
        });
        
        return {
          status: 'ok' as const,
          data: { coins: updatedCoins },
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Error fetching real data from BingX, using hardcoded:', error);
    }

    // Возвращаем захардкоженные данные если API не работает
    return {
      status: 'ok' as const,
      data: { coins: hardcodedCoins },
      timestamp: new Date().toISOString()
    };
  }

  async getSignals(): Promise<ApiResponse<Signal[]>> {
    // Пока используем заглушку
    return Promise.resolve({
      status: 'ok' as const,
      data: [],
      timestamp: new Date().toISOString()
    });
  }
}

export const apiClient = new ApiClient(API_BASE);
