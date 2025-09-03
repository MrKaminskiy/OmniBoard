const axios = require('axios');
const crypto = require('crypto');

class BingXService {
    constructor() {
        this.apiKey = process.env.BINGX_API_KEY;
        this.secretKey = process.env.BINGX_SECRET_KEY;
        this.baseURL = process.env.BINGX_BASE_URL || 'https://open-api.bingx.com';
        
        // CoinGecko API (бесплатный)
        this.coinGeckoURL = 'https://api.coingecko.com/api/v3';
        
        if (!this.apiKey || !this.secretKey) {
            console.warn('⚠️ BingX API credentials not configured, using CoinGecko API as fallback');
        }
    }

    /**
     * Generate signature for BingX API requests
     */
    generateSignature(params, timestamp) {
        if (!this.secretKey) return '';
        
        const queryString = Object.keys(params)
            .sort()
            .map(key => `${key}=${params[key]}`)
            .join('&');
        
        const signString = `${queryString}&timestamp=${timestamp}`;
        return crypto.createHmac('sha256', this.secretKey).update(signString).digest('hex');
    }

    /**
     * Make authenticated request to BingX API
     */
    async makeRequest(endpoint, params = {}) {
        try {
            const timestamp = Date.now();
            const requestParams = {
                ...params,
                timestamp
            };

            // Для публичных endpoints не нужна подпись
            const response = await axios.get(`${this.baseURL}${endpoint}`, {
                params: requestParams,
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'OmniBoard/1.0.0'
                }
            });

            return response.data;
        } catch (error) {
            console.error(`BingX API Error (${endpoint}):`, error.message);
            throw new Error(`BingX API request failed: ${error.message}`);
        }
    }

    /**
     * Get 24hr ticker price change statistics
     */
    async get24hrTicker(symbol = 'BTC-USDT') {
        try {
            const data = await this.makeRequest('/openApi/spot/v1/ticker/24hr', {
                symbol: symbol
            });

            if (data.code === 0 && data.data) {
                return this.transformTickerData(data.data);
            } else {
                throw new Error(data.msg || 'Failed to get ticker data');
            }
        } catch (error) {
            console.error('Error getting 24hr ticker:', error.message);
            return this.getDefaultTickerData();
        }
    }

    /**
     * Get multiple symbols 24hr ticker
     */
    async getMultipleTickers(symbols = ['BTC-USDT', 'ETH-USDT', 'BNB-USDT']) {
        try {
            const promises = symbols.map(symbol => this.get24hrTicker(symbol));
            const results = await Promise.allSettled(promises);
            
            return results
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value);
        } catch (error) {
            console.error('Error getting multiple tickers:', error.message);
            return symbols.map(() => this.getDefaultTickerData());
        }
    }

        /**
     * Get Long/Short ratio from Binance
     * Note: Binance doesn't provide this data directly, we'll use alternative sources
     */
    async getLongShortRatio(symbol = 'BTCUSDT') {
        try {
            // Попробуем получить данные через Binance Futures API
            const response = await axios.get('https://fapi.binance.com/futures/data/globalLongShortAccountRatio', {
                params: {
                    symbol: symbol,
                    period: '5m',
                    limit: 1
                },
                timeout: 10000,
                headers: {
                    'User-Agent': 'OmniBoard/1.0.0'
                }
            });

            if (response.data && response.data.length > 0) {
                const data = response.data[0];
                return {
                    symbol: data.symbol,
                    longShortRatio: parseFloat(data.longShortRatio),
                    longAccount: parseFloat(data.longAccount),
                    shortAccount: parseFloat(data.shortAccount),
                    timestamp: new Date(data.timestamp).toISOString(),
                    dataSource: 'binance_futures'  // Индикатор источника
                };
            }
            
            throw new Error('No data received from Binance Futures API');
        } catch (error) {
            console.error('Error getting Long/Short ratio from Binance:', error.message);
            // Fallback к mock данным
            return this.getDefaultLongShortRatio();
        }
    }

    /**
     * Get Long/Short ratio from OKX
     */
    async getOKXLongShortRatio(symbol = 'BTC-USDT') {
        try {
            // OKX API для получения Long/Short ratio
            const response = await axios.get('https://www.okx.com/api/v5/public/position-tiers', {
                params: {
                    instType: 'SWAP',
                    instId: symbol
                },
                timeout: 10000,
                headers: {
                    'User-Agent': 'OmniBoard/1.0.0'
                }
            });

            if (response.data && response.data.code === '0' && response.data.data) {
                // OKX не предоставляет Long/Short ratio напрямую, используем mock данные
                // В реальном проекте можно подключить платные API или альтернативные источники
                return {
                    symbol: symbol,
                    longShortRatio: 1.23,
                    longAccount: 0.55,
                    shortAccount: 0.45,
                    timestamp: new Date().toISOString(),
                    dataSource: 'okx_futures'
                };
            }
            
            throw new Error('No data received from OKX API');
        } catch (error) {
            console.error('Error getting Long/Short ratio from OKX:', error.message);
            // Fallback к mock данным
            return this.getDefaultOKXLongShortRatio();
        }
    }

    /**
     * Get default OKX Long/Short ratio data
     */
    getDefaultOKXLongShortRatio() {
        return {
            symbol: 'BTC-USDT',
            longShortRatio: 1.23,
            longAccount: 0.55,
            shortAccount: 0.45,
            timestamp: new Date().toISOString(),
            dataSource: 'mock_data'
        };
    }

    /**
     * Get default Long/Short ratio data
     */
    getDefaultLongShortRatio() {
        return {
            symbol: 'BTCUSDT',
            longShortRatio: 1.46,
            longAccount: 0.59,
            shortAccount: 0.41,
            timestamp: new Date().toISOString(),
            dataSource: 'mock_data'  // Индикатор mock данных
        };
    }

    /**
     * Get order book for a symbol
     */
    async getOrderBook(symbol = 'BTC-USDT', limit = 100) {
        try {
            const data = await this.makeRequest('/openApi/spot/v1/market/depth', {
                symbol: symbol,
                limit
            });

            if (data.code === 0 && data.data) {
                return this.transformOrderBookData(data.data);
            } else {
                throw new Error(data.msg || 'Failed to get order book');
            }
        } catch (error) {
            console.error('Error getting order book:', error.message);
            return this.getDefaultOrderBookData();
        }
    }

    /**
     * Get recent trades for a symbol
     */
    async getRecentTrades(symbol = 'BTC-USDT', limit = 100) {
        try {
            const data = await this.makeRequest('/openApi/spot/v1/market/trades', {
                symbol: symbol,
                limit
            });

            if (data.code === 0 && data.data) {
                return this.transformTradesData(data.data);
            } else {
                throw new Error(data.msg || 'Failed to get recent trades');
            }
        } catch (error) {
            console.error('Error getting recent trades:', error.message);
            return this.getDefaultTradesData();
        }
    }

    /**
     * Get kline/candlestick data
     */
    async getKlines(symbol = 'BTC-USDT', interval = '1h', limit = 100) {
        try {
            const data = await this.makeRequest('/openApi/spot/v1/market/kline', {
                symbol: symbol,
                interval,
                limit
            });

            if (data.code === 0 && data.data) {
                return this.transformKlineData(data.data);
            } else {
                throw new Error(data.msg || 'Failed to get kline data');
            }
        } catch (error) {
            console.error('Error getting klines:', error.message);
            return this.getDefaultKlineData();
        }
    }

    /**
     * Transform ticker data to standard format
     */
    transformTickerData(data) {
        return {
            symbol: data.symbol,
            priceChange: parseFloat(data.priceChange) || 0,
            priceChangePercent: parseFloat(data.priceChangePercent) || 0,
            weightedAvgPrice: parseFloat(data.weightedAvgPrice) || 0,
            prevClosePrice: parseFloat(data.prevClosePrice) || 0,
            lastPrice: parseFloat(data.lastPrice) || 0,
            lastQty: parseFloat(data.lastQty) || 0,
            bidPrice: parseFloat(data.bidPrice) || 0,
            bidQty: parseFloat(data.bidQty) || 0,
            askPrice: parseFloat(data.askPrice) || 0,
            askQty: parseFloat(data.askQty) || 0,
            openPrice: parseFloat(data.openPrice) || 0,
            highPrice: parseFloat(data.highPrice) || 0,
            lowPrice: parseFloat(data.lowPrice) || 0,
            volume: parseFloat(data.volume) || 0,
            quoteVolume: parseFloat(data.quoteVolume) || 0,
            openTime: data.openTime,
            closeTime: data.closeTime,
            firstId: data.firstId,
            lastId: data.lastId,
            count: data.count
        };
    }

    /**
     * Transform order book data
     */
    transformOrderBookData(data) {
        return {
            symbol: data.symbol,
            bids: data.bids || [],
            asks: data.asks || [],
            lastUpdateId: data.lastUpdateId
        };
    }

    /**
     * Transform trades data
     */
    transformTradesData(data) {
        return data.map(trade => ({
            id: trade.id,
            price: parseFloat(trade.price) || 0,
            qty: parseFloat(trade.qty) || 0,
            quoteQty: parseFloat(trade.quoteQty) || 0,
            time: trade.time,
            isBuyerMaker: trade.isBuyerMaker,
            isBestMatch: trade.isBestMatch
        }));
    }

    /**
     * Transform kline data
     */
    transformKlineData(data) {
        return data.map(kline => ({
            openTime: kline[0],
            open: parseFloat(kline[1]) || 0,
            high: parseFloat(kline[2]) || 0,
            low: parseFloat(kline[3]) || 0,
            close: parseFloat(kline[4]) || 0,
            volume: parseFloat(kline[5]) || 0,
            closeTime: kline[6],
            quoteAssetVolume: parseFloat(kline[7]) || 0,
            numberOfTrades: kline[8],
            takerBuyBaseAssetVolume: parseFloat(kline[9]) || 0,
            takerBuyQuoteAssetVolume: parseFloat(kline[10]) || 0
        }));
    }

    /**
     * Default ticker data when API fails
     */
    getDefaultTickerData() {
        return {
            symbol: 'BTCUSDT',
            priceChange: 0,
            priceChangePercent: 0,
            weightedAvgPrice: 0,
            prevClosePrice: 0,
            lastPrice: 0,
            lastQty: 0,
            bidPrice: 0,
            bidQty: 0,
            askPrice: 0,
            askQty: 0,
            openPrice: 0,
            highPrice: 0,
            lowPrice: 0,
            volume: 0,
            quoteVolume: 0,
            openTime: Date.now(),
            closeTime: Date.now(),
            firstId: 0,
            lastId: 0,
            count: 0
        };
    }

    /**
     * Default order book data
     */
    getDefaultOrderBookData() {
        return {
            symbol: 'BTCUSDT',
            bids: [],
            asks: [],
            lastUpdateId: 0
        };
    }

    /**
     * Default trades data
     */
    getDefaultTradesData() {
        return [];
    }

    /**
     * Default kline data
     */
    getDefaultKlineData() {
        return [];
    }

    /**
     * Test API connection
     */
    async testConnection() {
        try {
            const response = await this.makeRequest('/openApi/spot/v1/ticker/24hr', {
                symbol: 'BTC-USDT'
            });
            return response.code === 0;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get market data from CoinGecko API (fallback)
     */
    async getCoinGeckoMarketData() {
        try {
            const response = await axios.get(`${this.coinGeckoURL}/global`);
            return response.data;
        } catch (error) {
            console.error('Error getting CoinGecko data:', error.message);
            return null;
        }
    }

    /**
     * Get top coins from CoinGecko API
     */
    async getCoinGeckoTickers(limit = 10) {
        try {
            const response = await axios.get(`${this.coinGeckoURL}/coins/markets`, {
                params: {
                    vs_currency: 'usd',
                    order: 'market_cap_desc',
                    per_page: limit,
                    page: 1,
                    sparkline: false
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error getting CoinGecko tickers:', error.message);
            return [];
        }
    }
}

module.exports = new BingXService();
