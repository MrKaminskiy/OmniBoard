// OmniBoard API Client
class OmniBoardAPI {
  constructor() {
    this.config = window.OMNIBOARD_CONFIG || {};
    this.baseURL = this.config.API_BASE || '';
  }

  // Получить JSON данные
  async getJSON(path, params = {}) {
    try {
      const url = new URL(path, this.baseURL);
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key]);
        }
      });

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Отправить POST запрос
  async postJSON(path, body = {}) {
    try {
      const url = new URL(path, this.baseURL);
      
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Получить мок данные
  async getMockData(endpoint) {
    try {
      const response = await fetch(`/mocks/${endpoint}.json`);
      if (!response.ok) {
        throw new Error(`Mock data not found: ${endpoint}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Mock data error:', error);
      return this.getDefaultMockData(endpoint);
    }
  }

  // Дефолтные мок данные
  getDefaultMockData(endpoint) {
    const defaults = {
      'market_overview': {
        market_cap: 2500000000000,
        volume_24h: 85000000000,
        fear_greed: 65,
        altseason: 45
      },
      'market_tickers': [
        { symbol: 'BTC', price: 45000, change_24h: 2.5, oi: 15000000000, funding: 0.01 },
        { symbol: 'ETH', price: 2800, change_24h: -1.2, oi: 8000000000, funding: 0.008 },
        { symbol: 'SOL', price: 95, change_24h: 5.8, oi: 2000000000, funding: 0.015 }
      ],
      'signals_latest': [
        { symbol: 'BTC', price: 45000, rsi_1h: 65, rsi_4h: 58, rsi_1d: 62, signal_1h: 'BUY', signal_4h: 'HOLD', signal_1d: 'BUY' },
        { symbol: 'ETH', price: 2800, rsi_1h: 42, rsi_4h: 45, rsi_1d: 48, signal_1h: 'SELL', signal_4h: 'HOLD', signal_1d: 'HOLD' }
      ],
      'journal_summary': {
        total_pnl: 1250.50,
        win_rate: 68.5,
        avg_fee: 0.15,
        avg_duration: 2.5
      },
      'journal_trades': [
        { id: 1, symbol: 'BTC', side: 'BUY', status: 'CLOSED', pnl: 150.25, fee: 0.12, duration: 3.2 },
        { id: 2, symbol: 'ETH', side: 'SELL', status: 'OPEN', pnl: -45.80, fee: 0.08, duration: 1.8 }
      ],
      'influencers_feed': [
        { source: 'twitter', handle: '@crypto_expert', text: 'Bitcoin showing strong support at $44k', symbols: ['BTC'], sentiment: 'bullish', timestamp: '2024-01-15T10:30:00Z' },
        { source: 'telegram', handle: 'CryptoSignals', text: 'ETH breakout imminent', symbols: ['ETH'], sentiment: 'bullish', timestamp: '2024-01-15T10:25:00Z' }
      ],
      'influencers_heatmap': [
        { symbol: 'BTC', mentions: 45, sentiment: 'bullish' },
        { symbol: 'ETH', mentions: 32, sentiment: 'neutral' },
        { symbol: 'SOL', mentions: 28, sentiment: 'bullish' }
      ]
    };

    return defaults[endpoint] || [];
  }

  // Smart API вызов с fallback на моки
  async smartGet(endpoint, params = {}, mockFlag = null) {
    const shouldUseMock = mockFlag !== null ? mockFlag : this.config[`USE_MOCK_${endpoint.toUpperCase()}`];
    
    if (shouldUseMock || !this.baseURL) {
      return await this.getMockData(endpoint);
    }
    
    return await this.getJSON(endpoint, params);
  }

  // Market API методы
  async getMarketOverview() {
    return await this.smartGet('market_overview', {}, this.config.USE_MOCK_MARKET);
  }

  async getMarketTickers(symbols = 'BTC,ETH,SOL,BNB,XRP,DOGE,SUI,LINK,AAVE,PEPE') {
    return await this.smartGet('market/tickers', { symbols }, this.config.USE_MOCK_MARKET);
  }

  // Signals API методы
  async getSignalsLatest(symbols = 'BTC,ETH,SOL,BNB,XRP', tfs = '1h,4h,1d') {
    return await this.smartGet('signals/latest', { symbols, tfs }, this.config.USE_MOCK_SIGNALS);
  }

  // Journal API методы
  async getJournalSummary(accountId, range = '90d') {
    return await this.smartGet('journal/summary', { account_id: accountId, range }, this.config.USE_MOCK_JOURNAL);
  }

  async getJournalTrades(accountId, limit = 100) {
    return await this.smartGet('journal/trades', { account_id: accountId, limit }, this.config.USE_MOCK_JOURNAL);
  }

  async createAccount(accountData) {
    return await this.postJSON('accounts', accountData);
  }

  async syncJournal(accountId, range = '90d') {
    return await this.postJSON('journal/sync', { account_id: accountId, range });
  }

  // Media API методы
  async getInfluencersFeed(since = '24h') {
    return await this.smartGet('influencers', { since }, this.config.USE_MOCK_MEDIA);
  }

  async getInfluencersHeatmap(since = '24h') {
    return await this.smartGet('influencers/heatmap', { since }, this.config.USE_MOCK_MEDIA);
  }
}

// Создаем глобальный экземпляр API
window.omniboardAPI = new OmniBoardAPI();
