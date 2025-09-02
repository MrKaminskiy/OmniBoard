/**
 * OmniBoard API Client
 * Handles API requests and mock data fallback
 */
class OmniBoardAPI {
    constructor() {
        this.baseURL = window.OMNIBOARD_CONFIG?.API_BASE || '';
        this.useMock = {
            market: window.OMNIBOARD_CONFIG?.USE_MOCK_MARKET || false,
            signals: window.OMNIBOARD_CONFIG?.USE_MOCK_SIGNALS || false,
            journal: window.OMNIBOARD_CONFIG?.USE_MOCK_JOURNAL || false,
            media: window.OMNIBOARD_CONFIG?.USE_MOCK_MEDIA || false
        };
    }

    /**
     * Make GET request to API
     */
    async getJSON(path, params = {}) {
        try {
            if (!this.baseURL) {
                throw new Error('API base URL not configured');
            }

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
                    'User-Agent': 'OmniBoard-Frontend/1.0.0'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API Error (${path}):`, error);
            throw error;
        }
    }

    /**
     * Make POST request to API
     */
    async postJSON(path, body = {}) {
        try {
            if (!this.baseURL) {
                throw new Error('API base URL not configured');
            }

            const url = new URL(path, this.baseURL);
            const response = await fetch(url.toString(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'OmniBoard-Frontend/1.0.0'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API Error (${path}):`, error);
            throw error;
        }
    }

    /**
     * Smart GET - tries API first, falls back to mock if configured
     */
    async smartGet(path, params = {}, mockPath = null) {
        try {
            // Try real API first
            return await this.getJSON(path, params);
        } catch (error) {
            // If mock is enabled and mockPath provided, try mock
            if (mockPath && this.shouldUseMock(path)) {
                console.log(`Falling back to mock data for ${path}`);
                return await this.getMockData(mockPath);
            }
            throw error;
        }
    }

    /**
     * Check if we should use mock for this endpoint
     */
    shouldUseMock(path) {
        if (path.includes('/market/')) return this.useMock.market;
        if (path.includes('/signals/')) return this.useMock.signals;
        if (path.includes('/journal/')) return this.useMock.journal;
        if (path.includes('/influencers/')) return this.useMock.media;
        return false;
    }

    /**
     * Get mock data from static files
     */
    async getMockData(path) {
        try {
            const response = await fetch(`/static/mocks${path}.json`);
            if (!response.ok) {
                throw new Error(`Mock file not found: ${path}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Mock data error (${path}):`, error);
            throw error;
        }
    }

    // Market Data Methods
    async getMarketOverview() {
        return this.smartGet('/api/v1/market/overview', {}, '/market_overview');
    }

    async getTopGainers(limit = 10) {
        return this.smartGet('/api/v1/market/top-gainers', { limit }, '/top_gainers');
    }

    async getTopLosers(limit = 10) {
        return this.smartGet('/api/v1/market/top-losers', { limit }, '/top_losers');
    }

    async getFearGreed() {
        return this.smartGet('/api/v1/market/fear-greed', {}, '/fear_greed');
    }

    async getAltseason() {
        return this.smartGet('/api/v1/market/altseason', {}, '/altseason');
    }

    // Получить конкретный список монет для отображения
    async getSpecificCoins() {
        const symbols = ['BTC', 'ETH', 'SOL'];
        
        try {
            console.log('Testing with coins:', symbols);
            
            // Получаем данные последовательно с задержкой
            const coins = [];
            for (let i = 0; i < symbols.length; i++) {
                try {
                    const symbol = symbols[i];
                    console.log(`Fetching ${symbol}...`);
                    
                    const coin = await this.getJSON(`/api/v1/coins/details`, { symbol: `${symbol}-USDT` });
                    console.log(`${symbol} data received:`, coin);
                    
                    if (coin && coin.data && coin.data.ticker) {
                        const ticker = coin.data.ticker;
                        console.log(`Raw ticker data for ${symbol}:`, ticker);
                        
                        // Проверяем все возможные поля
                        const formattedCoin = {
                            symbol: symbol, // Используем исходный символ
                            name: symbol,
                            price: parseFloat(ticker.lastPrice || ticker.price || 0),
                            price_change_24h: parseFloat(ticker.priceChangePercent || ticker.priceChange || ticker.change24h || 0),
                            volume_24h: parseFloat(ticker.volume || ticker.volume24h || 0),
                            market_cap: parseFloat(ticker.quoteVolume || ticker.marketCap || 0),
                            market_cap_rank: 0
                        };
                        
                        console.log(`Formatted ${symbol}:`, formattedCoin);
                        coins.push(formattedCoin);
                    } else {
                        console.log(`Invalid coin structure for ${symbol}:`, coin);
                    }
                    
                    // Увеличиваем задержку до 1 секунды чтобы избежать rate limiting
                    if (i < symbols.length - 1) {
                        console.log(`Waiting 1000ms before next request...`);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                } catch (error) {
                    console.error(`Error fetching ${symbols[i]}:`, error);
                }
            }
            
            console.log('All coins processed:', coins);
            
            // Если не получили ни одной монеты, используем mock данные
            if (coins.length === 0) {
                console.log('No coins received from API, using mock data');
                return this.getMockData('/specific_coins');
            }
            
            return {
                status: 'ok',
                data: { coins: coins },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Failed to fetch specific coins:', error);
            console.log('Falling back to mock data');
            // Fallback к mock данным
            return this.getMockData('/specific_coins');
        }
    }

    // Signals Methods (placeholder - implement when endpoints are available)
    async getSignals(symbols = [], timeframes = []) {
        // For now, return mock data since signals endpoint doesn't exist yet
        return this.getMockData('/signals_latest');
    }

    // Journal Methods (placeholder - implement when endpoints are available)
    async getJournalSummary(accountId, range = '90d') {
        return this.getMockData('/journal_summary');
    }

    async getJournalTrades(accountId, limit = 100) {
        return this.getMockData('/journal_trades');
    }

    // Media Methods (placeholder - implement when endpoints are available)
    async getInfluencersFeed(since = '24h') {
        return this.getMockData('/influencers_feed');
    }

    async getInfluencersHeatmap(since = '24h') {
        return this.getMockData('/influencers_heatmap');
    }
}

// Create global instance
window.omniBoardAPI = new OmniBoardAPI();
