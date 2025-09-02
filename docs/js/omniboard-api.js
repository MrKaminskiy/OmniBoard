/**
 * OmniBoard API Integration
 * Connects to the OmniBoard backend for real-time crypto market data
 */

class OmniBoardAPI {
    constructor() {
        this.baseURL = 'https://omniboard-backend-production.up.railway.app';
        this.apiVersion = 'v1';
        this.endpoints = {
            market: {
                overview: '/api/v1/market/overview',
                topGainers: '/api/v1/market/top-gainers',
                topLosers: '/api/v1/market/top-losers',
                fearGreed: '/api/v1/market/fear-greed',
                altseason: '/api/v1/market/altseason',
                openInterest: '/api/v1/market/open-interest',
                liquidations: '/api/v1/market/liquidations',
                longShortRatio: '/api/v1/market/long-short-ratio',
                btcDominance: '/api/v1/market/btc-dominance'
            },
            coins: {
                list: '/api/v1/coins/list',
                details: '/api/v1/coins/details',
                price: '/api/v1/coins/price',
                marketData: '/api/v1/coins/market-data'
            },
            derivatives: {
                fundingRates: '/api/v1/derivatives/funding-rates',
                openInterest: '/api/v1/derivatives/open-interest'
            }
        };
        
        this.cache = new Map();
        this.cacheTimeout = 30000; // 30 seconds
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second
    }

    /**
     * Make HTTP request with retry logic and error handling
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            ...options
        };

        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                const response = await fetch(url, config);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                if (data.status === 'error') {
                    throw new Error(data.message || 'API Error');
                }
                
                return data;
                
            } catch (error) {
                console.warn(`Attempt ${attempt} failed for ${endpoint}:`, error.message);
                
                if (attempt === this.retryAttempts) {
                    throw new Error(`Failed after ${this.retryAttempts} attempts: ${error.message}`);
                }
                
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
            }
        }
    }

    /**
     * Get cached data or fetch from API
     */
    async getCachedData(key, fetchFunction) {
        const cached = this.cache.get(key);
        const now = Date.now();
        
        if (cached && (now - cached.timestamp) < this.cacheTimeout) {
            return cached.data;
        }
        
        try {
            const data = await fetchFunction();
            this.cache.set(key, {
                data,
                timestamp: now
            });
            return data;
        } catch (error) {
            // Return cached data if available, even if expired
            if (cached) {
                console.warn(`Using expired cache for ${key} due to API error:`, error.message);
                return cached.data;
            }
            throw error;
        }
    }

    /**
     * Get market overview data
     */
    async getMarketOverview() {
        return this.getCachedData('market-overview', async () => {
            const data = await this.request(this.endpoints.market.overview);
            return this.transformMarketOverview(data);
        });
    }

    /**
     * Get top gainers
     */
    async getTopGainers(limit = 10) {
        return this.getCachedData(`top-gainers-${limit}`, async () => {
            const data = await this.request(`${this.endpoints.market.topGainers}?limit=${limit}`);
            return this.transformCoinList(data);
        });
    }

    /**
     * Get top losers
     */
    async getTopLosers(limit = 10) {
        return this.getCachedData(`top-losers-${limit}`, async () => {
            const data = await this.request(`${this.endpoints.market.topLosers}?limit=${limit}`);
            return this.transformCoinList(data);
        });
    }

    /**
     * Get fear and greed index
     */
    async getFearGreedIndex() {
        return this.getCachedData('fear-greed', async () => {
            const data = await this.request(this.endpoints.market.fearGreed);
            return this.transformFearGreed(data);
        });
    }

    /**
     * Get altseason index
     */
    async getAltseasonIndex() {
        return this.getCachedData('altseason', async () => {
            const data = await this.request(this.endpoints.market.altseason);
            return this.transformAltseason(data);
        });
    }

    /**
     * Get open interest data
     */
    async getOpenInterest() {
        return this.getCachedData('open-interest', async () => {
            const data = await this.request(this.endpoints.market.openInterest);
            return this.transformOpenInterest(data);
        });
    }

    /**
     * Get liquidations data
     */
    async getLiquidations() {
        return this.getCachedData('liquidations', async () => {
            const data = await this.request(this.endpoints.market.liquidations);
            return this.transformLiquidations(data);
        });
    }

    /**
     * Get long/short ratio
     */
    async getLongShortRatio() {
        return this.getCachedData('long-short-ratio', async () => {
            const data = await this.request(this.endpoints.market.longShortRatio);
            return this.transformLongShortRatio(data);
        });
    }

    /**
     * Get BTC dominance
     */
    async getBTCDominance() {
        return this.getCachedData('btc-dominance', async () => {
            const data = await this.request(this.endpoints.market.btcDominance);
            return this.transformBTCDominance(data);
        });
    }

    /**
     * Get coins list with market data
     */
    async getCoinsList(limit = 100, offset = 0) {
        const cacheKey = `coins-list-${limit}-${offset}`;
        return this.getCachedData(cacheKey, async () => {
            const data = await this.request(`${this.endpoints.coins.list}?limit=${limit}&offset=${offset}`);
            return this.transformCoinList(data);
        });
    }

    /**
     * Transform market overview data to match UI expectations
     */
    transformMarketOverview(data) {
        // Fallback to "000" if API data is not in expected format
        return {
            marketCap: {
                value: data.market_cap || 0,
                change: data.market_cap_change_24h || 0,
                progress: data.market_cap_progress || 0
            },
            volume: {
                value: data.volume_24h || 0,
                change: data.volume_change_24h || 0,
                progress: data.volume_progress || 0
            },
            activeCoins: data.active_coins || 0,
            gainers: data.gainers_24h || 0,
            losers: data.losers_24h || 0,
            lastUpdate: data.last_update || new Date().toLocaleTimeString()
        };
    }

    /**
     * Transform coin list data
     */
    transformCoinList(data) {
        if (!data.coins || !Array.isArray(data.coins)) {
            return [];
        }

        return data.coins.map(coin => ({
            id: coin.id || coin.symbol?.toLowerCase(),
            symbol: coin.symbol,
            name: coin.name,
            price: coin.current_price || coin.price,
            priceChange24h: coin.price_change_percentage_24h || coin.price_change_24h,
            marketCap: coin.market_cap,
            volume24h: coin.total_volume || coin.volume_24h,
            openInterest: coin.open_interest || 0,
            fundingRate: coin.funding_rate || 0,
            image: coin.image || `https://assets.coingecko.com/coins/images/1/large/bitcoin.png`
        }));
    }

    /**
     * Transform fear and greed data
     */
    transformFearGreed(data) {
        return {
            value: data.value || data.score || 0,
            status: data.status || '000',
            classification: data.classification || '000'
        };
    }

    /**
     * Transform altseason data
     */
    transformAltseason(data) {
        return {
            value: data.value || data.score || 0,
            status: data.status || '000',
            classification: data.classification || '000'
        };
    }

    /**
     * Transform open interest data
     */
    transformOpenInterest(data) {
        return {
            value: data.value || data.total_open_interest || 0,
            change: data.change_24h || data.change || 0,
            progress: data.progress || 0
        };
    }

    /**
     * Transform liquidations data
     */
    transformLiquidations(data) {
        return {
            value: data.value || data.total_liquidations || 0,
            ratio: data.long_short_ratio || 0,
            progress: data.progress || 0
        };
    }

    /**
     * Transform long/short ratio data
     */
    transformLongShortRatio(data) {
        return {
            value: data.value || data.ratio || 0,
            accounts: data.accounts_percentage || '000',
            progress: data.progress || 0
        };
    }

    /**
     * Transform BTC dominance data
     */
    transformBTCDominance(data) {
        return {
            value: data.value || data.btc_dominance || 0,
            eth: data.eth_dominance || 0,
            progress: data.progress || 0
        };
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        console.log('OmniBoard API cache cleared');
    }

    /**
     * Get cache status
     */
    getCacheStatus() {
        const now = Date.now();
        const status = {};
        
        for (const [key, value] of this.cache.entries()) {
            const age = now - value.timestamp;
            const isExpired = age > this.cacheTimeout;
            status[key] = {
                age: Math.round(age / 1000),
                expired: isExpired,
                dataSize: JSON.stringify(value.data).length
            };
        }
        
        return status;
    }
}

// Create global instance
window.omniboardAPI = new OmniBoardAPI();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OmniBoardAPI;
}
