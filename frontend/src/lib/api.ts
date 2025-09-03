

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
  market_cap_rank: number;
  image?: string;
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
    // Используем новый endpoint для получения конкретных монет
    const specificCoins = ['bitcoin', 'ethereum', 'solana', 'ripple', 'binancecoin', 'dogecoin', 'sui', 'chainlink', 'aave', 'pepe', 'dogwifhat', 'litecoin', 'cardano', 'optimism', 'aptos'];
    return this.getSpecificCoins(specificCoins);
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
