const axios = require('axios');
const { logBusinessEvent, logBusinessError, logPerformance } = require('../middleware/logger');

class CoinGeckoService {
    constructor() {
        this.baseURL = 'https://api.coingecko.com/api/v3';
        this.rateLimitDelay = 1200; // 1.2 секунды между запросами (лимит 50 запросов в минуту)
        this.lastRequestTime = 0;
        this.requestCount = 0;
        this.resetTime = Date.now() + (60 * 1000); // Сброс счетчика каждую минуту
        
        // Кэш для данных
        this.cache = new Map();
        this.cacheTTL = 5 * 60 * 1000; // 5 минут
    }

    /**
     * Ограничение rate limit для CoinGecko API
     */
    async rateLimit() {
        const now = Date.now();
        
        // Сброс счетчика каждую минуту
        if (now > this.resetTime) {
            this.requestCount = 0;
            this.resetTime = now + (60 * 1000);
        }
        
        // Проверяем лимит (50 запросов в минуту)
        if (this.requestCount >= 50) {
            const waitTime = this.resetTime - now;
            logBusinessEvent('coingecko_rate_limit_wait', { waitTime, requestCount: this.requestCount });
            await new Promise(resolve => setTimeout(resolve, waitTime));
            this.requestCount = 0;
            this.resetTime = Date.now() + (60 * 1000);
        }
        
        // Минимальная задержка между запросами
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.rateLimitDelay) {
            await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
        }
        
        this.lastRequestTime = Date.now();
        this.requestCount++;
    }

    /**
     * Выполнение запроса к CoinGecko API
     */
    async makeRequest(endpoint, params = {}) {
        try {
            await this.rateLimit();
            
            const startTime = Date.now();
            const response = await axios.get(`${this.baseURL}${endpoint}`, {
                params,
                timeout: 10000,
                headers: {
                    'User-Agent': 'OmniBoard/1.0.0',
                    'Accept': 'application/json'
                }
            });
            
            const duration = Date.now() - startTime;
            logPerformance('coingecko_api_request', duration, { endpoint, params });
            
            return response.data;
        } catch (error) {
            logBusinessError('coingecko_api_error', error, { endpoint, params });
            throw new Error(`CoinGecko API request failed: ${error.message}`);
        }
    }

    /**
     * Получение глобальных рыночных данных
     */
    async getGlobalMarketData() {
        const cacheKey = 'global_market_data';
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;
        
        try {
            const data = await this.makeRequest('/global');
            
            const result = {
                total_market_cap: data.data.total_market_cap.usd,
                total_volume: data.data.total_volume.usd,
                market_cap_percentage: data.data.market_cap_percentage,
                market_cap_change_24h: data.data.market_cap_change_percentage_24h_usd,
                active_cryptocurrencies: data.data.active_cryptocurrencies,
                markets: data.data.markets,
                last_updated: data.data.updated_at
            };
            
            this.setCache(cacheKey, result);
            return result;
        } catch (error) {
            logBusinessError('global_market_data_error', error);
            return this.getDefaultGlobalData();
        }
    }

    /**
     * Получение топ монет по market cap
     */
    async getTopCoins(limit = 100, currency = 'usd') {
        const cacheKey = `top_coins_${limit}_${currency}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;
        
        try {
            const data = await this.makeRequest('/coins/markets', {
                vs_currency: currency,
                order: 'market_cap_desc',
                per_page: limit,
                page: 1,
                sparkline: false,
                price_change_percentage: '24h,7d,30d'
            });
            
            const result = data.map(coin => ({
                id: coin.id,
                symbol: coin.symbol.toUpperCase(),
                name: coin.name,
                image: coin.image,
                current_price: coin.current_price,
                market_cap: coin.market_cap,
                market_cap_rank: coin.market_cap_rank,
                fully_diluted_valuation: coin.fully_diluted_valuation,
                total_volume: coin.total_volume,
                high_24h: coin.high_24h,
                low_24h: coin.low_24h,
                price_change_24h: coin.price_change_24h,
                price_change_percentage_24h: coin.price_change_percentage_24h,
                price_change_percentage_7d: coin.price_change_percentage_7d_in_currency,
                price_change_percentage_30d: coin.price_change_percentage_30d_in_currency,
                market_cap_change_24h: coin.market_cap_change_24h,
                market_cap_change_percentage_24h: coin.market_cap_change_percentage_24h,
                circulating_supply: coin.circulating_supply,
                total_supply: coin.total_supply,
                max_supply: coin.max_supply,
                ath: coin.ath,
                ath_change_percentage: coin.ath_change_percentage,
                ath_date: coin.ath_date,
                atl: coin.atl,
                atl_change_percentage: coin.atl_change_percentage,
                atl_date: coin.atl_date,
                last_updated: coin.last_updated
            }));
            
            this.setCache(cacheKey, result);
            return result;
        } catch (error) {
            logBusinessError('top_coins_error', error, { limit, currency });
            return [];
        }
    }

    /**
     * Получение данных по конкретной монете
     */
    async getCoinData(coinId, currency = 'usd') {
        const cacheKey = `coin_data_${coinId}_${currency}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;
        
        try {
            const data = await this.makeRequest(`/coins/${coinId}`, {
                localization: false,
                tickers: false,
                market_data: true,
                community_data: false,
                developer_data: false,
                sparkline: false
            });
            
            const result = {
                id: data.id,
                symbol: data.symbol.toUpperCase(),
                name: data.name,
                image: data.image,
                market_data: {
                    current_price: data.market_data.current_price,
                    market_cap: data.market_data.market_cap,
                    market_cap_rank: data.market_data.market_cap_rank,
                    total_volume: data.market_data.total_volume,
                    high_24h: data.market_data.high_24h,
                    low_24h: data.market_data.low_24h,
                    price_change_24h: data.market_data.price_change_24h,
                    price_change_percentage_24h: data.market_data.price_change_percentage_24h,
                    price_change_percentage_7d: data.market_data.price_change_percentage_7d,
                    price_change_percentage_30d: data.market_data.price_change_percentage_30d,
                    market_cap_change_24h: data.market_data.market_cap_change_24h,
                    market_cap_change_percentage_24h: data.market_data.market_cap_change_percentage_24h,
                    circulating_supply: data.market_data.circulating_supply,
                    total_supply: data.market_data.total_supply,
                    max_supply: data.market_data.max_supply,
                    ath: data.market_data.ath,
                    ath_change_percentage: data.market_data.ath_change_percentage,
                    ath_date: data.market_data.ath_date,
                    atl: data.market_data.atl,
                    atl_change_percentage: data.market_data.atl_change_percentage,
                    atl_date: data.market_data.atl_date
                },
                last_updated: data.last_updated
            };
            
            this.setCache(cacheKey, result);
            return result;
        } catch (error) {
            logBusinessError('coin_data_error', error, { coinId, currency });
            return null;
        }
    }

    /**
     * Получение BTC и ETH dominance
     */
    async getDominanceData() {
        const cacheKey = 'dominance_data';
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;
        
        try {
            const globalData = await this.getGlobalMarketData();
            const btcData = await this.getCoinData('bitcoin');
            const ethData = await this.getCoinData('ethereum');
            
            const result = {
                btc_dominance: globalData.market_cap_percentage.btc || 0,
                eth_dominance: globalData.market_cap_percentage.eth || 0,
                btc_market_cap: btcData?.market_data?.market_cap?.usd || 0,
                eth_market_cap: ethData?.market_data?.market_cap?.usd || 0,
                total_market_cap: globalData.total_market_cap,
                last_updated: new Date().toISOString()
            };
            
            this.setCache(cacheKey, result);
            return result;
        } catch (error) {
            logBusinessError('dominance_data_error', error);
            return this.getDefaultDominanceData();
        }
    }

    /**
     * Получение Fear & Greed Index от alternative.me API
     */
    async getFearGreedIndex() {
        try {
            // Пробуем получить данные от alternative.me (основной источник)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch('https://api.alternative.me/fng/', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'OmniBoard/1.0'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data && data.data && data.data.length > 0) {
                const latestData = data.data[0];
                const value = parseInt(latestData.value);
                
                // Определяем статус на основе значения
                let status;
                if (value >= 76) {
                    status = 'Extreme Greed';
                } else if (value >= 56) {
                    status = 'Greed';
                } else if (value >= 46) {
                    status = 'Neutral';
                } else if (value >= 26) {
                    status = 'Fear';
                } else {
                    status = 'Extreme Fear';
                }
                
                logBusinessEvent('fear_greed_index_retrieved', {
                    value,
                    status,
                    source: 'alternative.me',
                    timestamp: new Date().toISOString()
                });
                
                return { 
                    value, 
                    status, 
                    last_updated: new Date().toISOString(),
                    source: 'alternative.me'
                };
            } else {
                throw new Error('Invalid response format from alternative.me');
            }
        } catch (error) {
            logBusinessError('fear_greed_index_alternative_me_error', error);
            
            // Fallback: пробуем Coinglass API
            try {
                const coinglassController = new AbortController();
                const coinglassTimeoutId = setTimeout(() => coinglassController.abort(), 10000);
                
                const coinglassResponse = await fetch('https://open-api.coinglass.com/public/v2/fear_greed_index', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'OmniBoard/1.0'
                    },
                    signal: coinglassController.signal
                });
                
                clearTimeout(coinglassTimeoutId);

                if (coinglassResponse.ok) {
                    const coinglassData = await coinglassResponse.json();
                    
                    if (coinglassData && coinglassData.data && coinglassData.data.length > 0) {
                        const latestData = coinglassData.data[0];
                        const value = parseInt(latestData.value);
                        
                        let status;
                        if (value >= 76) {
                            status = 'Extreme Greed';
                        } else if (value >= 56) {
                            status = 'Greed';
                        } else if (value >= 46) {
                            status = 'Neutral';
                        } else if (value >= 26) {
                            status = 'Fear';
                        } else {
                            status = 'Extreme Fear';
                        }
                        
                        logBusinessEvent('fear_greed_index_retrieved', {
                            value,
                            status,
                            source: 'coinglass',
                            timestamp: new Date().toISOString()
                        });
                        
                        return { 
                            value, 
                            status, 
                            last_updated: new Date().toISOString(),
                            source: 'coinglass'
                        };
                    }
                }
            } catch (coinglassError) {
                logBusinessError('fear_greed_index_coinglass_error', coinglassError);
            }
            
            // Последний fallback: симуляция на основе рыночных данных
            logBusinessEvent('fear_greed_index_fallback_simulation', { 
                reason: 'both_apis_failed',
                timestamp: new Date().toISOString()
            });
            
            const globalData = await this.getGlobalMarketData();
            const marketChange = globalData.market_cap_change_24h || 0;
            
            let value, status;
            if (marketChange > 5) {
                value = 75;
                status = 'Greed';
            } else if (marketChange > 2) {
                value = 60;
                status = 'Greed';
            } else if (marketChange > -2) {
                value = 50;
                status = 'Neutral';
            } else if (marketChange > -5) {
                value = 40;
                status = 'Fear';
            } else {
                value = 25;
                status = 'Extreme Fear';
            }
            
            return { 
                value, 
                status, 
                last_updated: new Date().toISOString(),
                source: 'simulation_fallback'
            };
        }
    }

    /**
     * Получение Altseason Index (симуляция)
     */
    async getAltseasonIndex() {
        try {
            const globalData = await this.getGlobalMarketData();
            const marketChange = globalData.market_cap_change_24h || 0;
            
            let value, status;
            if (marketChange > 3) {
                value = 70;
                status = 'Altcoin Season';
            } else if (marketChange > 0) {
                value = 55;
                status = 'Neutral';
            } else {
                value = 30;
                status = 'Bitcoin Season';
            }
            
            return { value, status, last_updated: new Date().toISOString() };
        } catch (error) {
            logBusinessError('altseason_index_error', error);
            return { value: 50, status: 'Neutral', last_updated: new Date().toISOString() };
        }
    }

    /**
     * Кэширование данных
     */
    getFromCache(key) {
        const item = this.cache.get(key);
        if (item && Date.now() < item.expiry) {
            return item.data;
        }
        this.cache.delete(key);
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data,
            expiry: Date.now() + this.cacheTTL
        });
    }

    /**
     * Очистка кэша
     */
    clearCache() {
        this.cache.clear();
        logBusinessEvent('coingecko_cache_cleared');
    }

    /**
     * Получение статистики кэша
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }

    /**
     * Дефолтные данные при ошибках
     */
    getDefaultGlobalData() {
        return {
            total_market_cap: 0,
            total_volume: 0,
            market_cap_percentage: {},
            market_cap_change_24h: 0,
            active_cryptocurrencies: 0,
            markets: 0,
            last_updated: new Date().toISOString()
        };
    }

    getDefaultDominanceData() {
        return {
            btc_dominance: 0,
            eth_dominance: 0,
            btc_market_cap: 0,
            eth_market_cap: 0,
            total_market_cap: 0,
            last_updated: new Date().toISOString()
        };
    }
}

module.exports = new CoinGeckoService();
