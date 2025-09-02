const bingXService = require('./bingx-service');
const coinGeckoService = require('./coingecko-service');
const cacheService = require('./cache-service');
const { logBusinessEvent, logBusinessError, logPerformance } = require('../middleware/logger');

class MarketService {
    constructor() {
        this.topSymbols = [
            'BTC-USDT', 'ETH-USDT', 'BNB-USDT', 'ADA-USDT', 'XRP-USDT',
            'SOL-USDT', 'DOT-USDT', 'DOGE-USDT', 'AVAX-USDT', 'MATIC-USDT'
        ];
        this.updateInterval = null;
        this.updateIntervalMs = parseInt(process.env.MARKET_UPDATE_INTERVAL) || 60000; // 60 секунд по умолчанию
    }

    /**
     * Initialize market service
     */
    init() {
        // Update market data every 60 seconds (или 30 если не повлияет на лимиты)
        this.updateInterval = setInterval(() => {
            this.updateMarketData();
        }, this.updateIntervalMs);

        // Initial update
        this.updateMarketData();
        
        console.log(`📊 Market service initialized with ${this.updateIntervalMs}ms update interval`);
    }

    /**
     * Update all market data
     */
    async updateMarketData() {
        const startTime = Date.now();
        
        try {
            logBusinessEvent('market_data_update_started', { timestamp: new Date().toISOString() });
            
            // Получаем данные параллельно из разных источников
            const [bingXTickers, coinGeckoData, dominanceData] = await Promise.allSettled([
                this.getBingXData(),
                this.getCoinGeckoData(),
                this.getDominanceData()
            ]);
            
            // Агрегируем данные
            const aggregatedData = this.aggregateMarketData(
                bingXTickers.status === 'fulfilled' ? bingXTickers.value : [],
                coinGeckoData.status === 'fulfilled' ? coinGeckoData.value : null,
                dominanceData.status === 'fulfilled' ? dominanceData.value : null
            );
            
            // Кэшируем агрегированные данные
            cacheService.set('market-overview', aggregatedData.overview);
            cacheService.set('top-tickers', aggregatedData.tickers);
            cacheService.set('market-metrics', aggregatedData.metrics);
            
            const duration = Date.now() - startTime;
            logPerformance('market_data_update', duration, { 
                data_sources: ['bingx', 'coingecko', 'dominance'],
                tickers_count: aggregatedData.tickers.length
            });
            
            logBusinessEvent('market_data_update_completed', {
                duration,
                tickers_count: aggregatedData.tickers.length,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            const duration = Date.now() - startTime;
            logBusinessError('market_data_update_failed', error, { duration });
            console.error('❌ Failed to update market data:', error.message);
        }
    }

    /**
     * Получение данных от BingX
     */
    async getBingXData() {
        try {
            let tickers = await bingXService.getMultipleTickers(this.topSymbols);
            
            // Проверяем качество данных
            if (tickers.length === 0 || tickers.every(t => !t.lastPrice)) {
                throw new Error('No valid data from BingX');
            }
            
            return tickers;
        } catch (error) {
            logBusinessError('bingx_data_fetch_error', error);
            return [];
        }
    }

    /**
     * Получение данных от CoinGecko
     */
    async getCoinGeckoData() {
        try {
            const globalData = await coinGeckoService.getGlobalMarketData();
            const topCoins = await coinGeckoService.getTopCoins(100);
            
            return {
                global: globalData,
                topCoins: topCoins
            };
        } catch (error) {
            logBusinessError('coingecko_data_fetch_error', error);
            return null;
        }
    }

    /**
     * Получение данных о доминировании
     */
    async getDominanceData() {
        try {
            return await coinGeckoService.getDominanceData();
        } catch (error) {
            logBusinessError('dominance_data_fetch_error', error);
            return null;
        }
    }

    /**
     * Агрегация данных из разных источников
     */
    aggregateMarketData(bingXTickers, coinGeckoData, dominanceData) {
        // Создаем мапу для быстрого поиска по символу
        const tickerMap = new Map();
        
        // Добавляем данные от BingX
        bingXTickers.forEach(ticker => {
            const symbol = ticker.symbol.replace('-USDT', '');
            tickerMap.set(symbol, {
                ...ticker,
                source: 'bingx',
                lastUpdate: new Date().toISOString()
            });
        });
        
        // Добавляем данные от CoinGecko (даже если BingX не работает)
        if (coinGeckoData?.topCoins) {
            coinGeckoData.topCoins.forEach(coin => {
                const symbol = coin.symbol;
                if (tickerMap.has(symbol)) {
                    // Обогащаем существующие данные
                    const existing = tickerMap.get(symbol);
                    tickerMap.set(symbol, {
                        ...existing,
                        marketCap: coin.market_cap,
                        marketCapRank: coin.market_cap_rank,
                        volume24h: coin.total_volume,
                        priceChange7d: coin.price_change_percentage_7d,
                        priceChange30d: coin.price_change_percentage_30d,
                        ath: coin.ath,
                        athChange: coin.ath_change_percentage,
                        atl: coin.atl,
                        atlChange: coin.atl_change_percentage,
                        coingeckoData: true
                    });
                } else {
                    // Создаем новые данные только из CoinGecko
                    tickerMap.set(symbol, {
                        symbol: `${coin.symbol}-USDT`,
                        lastPrice: coin.current_price,
                        priceChangePercent: coin.price_change_percentage_24h,
                        volume: coin.total_volume,
                        quoteVolume: coin.total_volume,
                        marketCap: coin.market_cap,
                        marketCapRank: coin.market_cap_rank,
                        priceChange7d: coin.price_change_percentage_7d,
                        priceChange30d: coin.price_change_percentage_30d,
                        ath: coin.ath,
                        athChange: coin.ath_change_percentage,
                        atl: coin.atl,
                        atlChange: coin.atl_change_percentage,
                        source: 'coingecko',
                        lastUpdate: new Date().toISOString()
                    });
                }
            });
        }
        
        const tickers = Array.from(tickerMap.values());
        
        // Создаем overview
        const overview = this.calculateMarketOverview(tickers, coinGeckoData?.global, dominanceData);
        
        // Создаем метрики
        const metrics = this.calculateMarketMetrics(tickers, coinGeckoData?.global, dominanceData);
        
        return {
            tickers,
            overview,
            metrics
        };
    }

    /**
     * Calculate market overview from aggregated data
     */
    calculateMarketOverview(tickers, globalData, dominanceData) {
        if (!tickers || tickers.length === 0) {
            return this.getDefaultMarketOverview();
        }

        // Используем данные от CoinGecko если доступны
        if (globalData) {
            return {
                market_cap: globalData.total_market_cap,
                market_cap_formatted: this.formatLargeNumber(globalData.total_market_cap),
                market_cap_change_24h: globalData.market_cap_change_24h,
                market_cap_progress: Math.min(Math.abs(globalData.market_cap_change_24h) * 2, 100),
                volume_24h: globalData.total_volume,
                volume_formatted: this.formatLargeNumber(globalData.total_volume),
                volume_change_24h: globalData.market_cap_change_24h, // Примерная оценка
                volume_progress: Math.min(Math.abs(globalData.market_cap_change_24h) * 2, 100),
                active_coins: globalData.active_cryptocurrencies,
                gainers_24h: tickers.filter(t => t.priceChangePercent > 0).length,
                losers_24h: tickers.filter(t => t.priceChangePercent < 0).length,
                last_update: new Date().toISOString(),
                data_sources: ['bingx', 'coingecko']
            };
        }

        // Fallback на расчеты из ticker данных
        return this.calculateMarketOverviewFromTickers(tickers);
    }

    /**
     * Calculate market overview from ticker data only
     */
    calculateMarketOverviewFromTickers(tickers) {
        let totalMarketCap = 0;
        let totalVolume = 0;
        let totalPriceChange = 0;
        let gainers = 0;
        let losers = 0;

        tickers.forEach(ticker => {
            if (ticker.lastPrice) {
                const marketCap = ticker.marketCap || (ticker.lastPrice * (ticker.volume || 0) * 1000);
                totalMarketCap += marketCap;
                
                totalVolume += ticker.quoteVolume || ticker.volume || 0;
                totalPriceChange += ticker.priceChangePercent || 0;
                
                if (ticker.priceChangePercent > 0) {
                    gainers++;
                } else if (ticker.priceChangePercent < 0) {
                    losers++;
                }
            }
        });

        const avgPriceChange = tickers.length > 0 ? totalPriceChange / tickers.length : 0;

        return {
            market_cap: totalMarketCap,
            market_cap_formatted: this.formatLargeNumber(totalMarketCap),
            market_cap_change_24h: avgPriceChange,
            market_cap_progress: Math.min(Math.abs(avgPriceChange) * 2, 100),
            volume_24h: totalVolume,
            volume_formatted: this.formatLargeNumber(totalVolume),
            volume_change_24h: avgPriceChange,
            volume_progress: Math.min(Math.abs(avgPriceChange) * 2, 100),
            active_coins: tickers.length,
            gainers_24h: gainers,
            losers_24h: losers,
            last_update: new Date().toISOString(),
            data_sources: ['bingx']
        };
    }

    /**
     * Calculate additional market metrics
     */
    calculateMarketMetrics(tickers, globalData, dominanceData) {
        const metrics = {
            btc_dominance: 0,
            eth_dominance: 0,
            fear_greed_index: { value: 50, status: 'Neutral' },
            altseason_index: { value: 50, status: 'Neutral' },
            market_sentiment: 'neutral',
            last_update: new Date().toISOString()
        };

        // BTC/ETH dominance
        if (dominanceData) {
            metrics.btc_dominance = dominanceData.btc_dominance;
            metrics.eth_dominance = dominanceData.eth_dominance;
        }

        // Fear & Greed Index
        try {
            const fearGreed = coinGeckoService.getFearGreedIndex();
            metrics.fear_greed_index = fearGreed;
        } catch (error) {
            // Используем fallback расчет
            const overview = this.calculateMarketOverviewFromTickers(tickers);
            const avgChange = overview.market_cap_change_24h || 0;
            
            if (avgChange > 5) {
                metrics.fear_greed_index = { value: 75, status: 'Greed' };
            } else if (avgChange > 2) {
                metrics.fear_greed_index = { value: 60, status: 'Greed' };
            } else if (avgChange > -2) {
                metrics.fear_greed_index = { value: 50, status: 'Neutral' };
            } else if (avgChange > -5) {
                metrics.fear_greed_index = { value: 40, status: 'Fear' };
            } else {
                metrics.fear_greed_index = { value: 25, status: 'Extreme Fear' };
            }
        }

        // Altseason Index
        try {
            const altseason = coinGeckoService.getAltseasonIndex();
            metrics.altseason_index = altseason;
        } catch (error) {
            // Fallback расчет
            const overview = this.calculateMarketOverviewFromTickers(tickers);
            const avgChange = overview.market_cap_change_24h || 0;
            
            if (avgChange > 3) {
                metrics.altseason_index = { value: 70, status: 'Altcoin Season' };
            } else if (avgChange > 0) {
                metrics.altseason_index = { value: 55, status: 'Neutral' };
            } else {
                metrics.altseason_index = { value: 30, status: 'Bitcoin Season' };
            }
        }

        // Market sentiment
        const fearGreedValue = metrics.fear_greed_index.value;
        if (fearGreedValue > 70) {
            metrics.market_sentiment = 'bullish';
        } else if (fearGreedValue < 30) {
            metrics.market_sentiment = 'bearish';
        } else {
            metrics.market_sentiment = 'neutral';
        }

        return metrics;
    }

    /**
     * Get market overview data
     */
    async getMarketOverview() {
        const cached = cacheService.get('market-overview');
        if (cached) {
            return cached;
        }

        // If no cached data, try to get fresh data
        await this.updateMarketData();
        return cacheService.get('market-overview') || this.getDefaultMarketOverview();
    }

    /**
     * Get market metrics
     */
    async getMarketMetrics() {
        const cached = cacheService.get('market-metrics');
        if (cached) {
            return cached;
        }

        // If no cached data, try to get fresh data
        await this.updateMarketData();
        return cacheService.get('market-metrics') || this.getDefaultMarketMetrics();
    }

    /**
     * Get top gainers
     */
    async getTopGainers(limit = 10) {
        const tickers = cacheService.get('top-tickers') || [];
        const gainers = tickers
            .filter(ticker => ticker.priceChangePercent > 0)
            .sort((a, b) => b.priceChangePercent - a.priceChangePercent)
            .slice(0, limit);

        return {
            coins: gainers.map(ticker => this.transformTickerToCoin(ticker))
        };
    }

    /**
     * Get top losers
     */
    async getTopLosers(limit = 10) {
        const tickers = cacheService.get('top-tickers') || [];
        const losers = tickers
            .filter(ticker => ticker.priceChangePercent < 0)
            .sort((a, b) => a.priceChangePercent - b.priceChangePercent)
            .slice(0, limit);

        return {
            coins: losers.map(ticker => this.transformTickerToCoin(ticker))
        };
    }

    /**
     * Get fear and greed index
     */
    async getFearGreedIndex() {
        const metrics = await this.getMarketMetrics();
        return metrics.fear_greed_index;
    }

    /**
     * Get altseason index
     */
    async getAltseasonIndex() {
        const metrics = await this.getMarketMetrics();
        return metrics.altseason_index;
    }

    /**
     * Get BTC dominance
     */
    async getBTCDominance() {
        const metrics = await this.getMarketMetrics();
        return {
            value: metrics.btc_dominance,
            eth: metrics.eth_dominance,
            progress: metrics.btc_dominance
        };
    }

    /**
     * Get coins list
     */
    async getCoinsList(limit = 100, offset = 0) {
        const tickers = cacheService.get('top-tickers') || [];
        const paginatedTickers = tickers.slice(offset, offset + limit);
        
        return {
            coins: paginatedTickers.map(ticker => this.transformTickerToCoin(ticker))
        };
    }

    /**
     * Transform ticker to coin format
     */
    transformTickerToCoin(ticker) {
        return {
            id: ticker.symbol.toLowerCase().replace('-usdt', ''),
            symbol: ticker.symbol.replace('-USDT', ''),
            name: ticker.symbol.replace('-USDT', ''),
            price: ticker.lastPrice || 0,
            price_change_24h: ticker.priceChangePercent || 0,
            market_cap: ticker.marketCap || (ticker.lastPrice || 0) * (ticker.volume || 0) * 1000,
            volume_24h: ticker.quoteVolume || ticker.volume || 0,
            market_cap_rank: ticker.marketCapRank || null,
            price_change_7d: ticker.priceChange7d || null,
            price_change_30d: ticker.priceChange30d || null,
            ath: ticker.ath || null,
            ath_change: ticker.athChange || null,
            atl: ticker.atl || null,
            atl_change: ticker.atlChange || null,
            open_interest: 0,
            funding_rate: 0,
            image: ticker.image || `https://assets.coingecko.com/coins/images/1/large/bitcoin.png`,
            source: ticker.source || 'unknown',
            last_update: ticker.lastUpdate || new Date().toISOString()
        };
    }

    /**
     * Format large numbers for readability
     */
    formatLargeNumber(num) {
        if (num >= 1e12) return (num / 1e12).toFixed(2);
        if (num >= 1e9) return (num / 1e9).toFixed(2);
        if (num >= 1e6) return (num / 1e6).toFixed(2);
        if (num >= 1e3) return (num / 1e3).toFixed(2);
        return num.toFixed(2);
    }

    /**
     * Get default market overview
     */
    getDefaultMarketOverview() {
        return {
            market_cap: 0,
            market_cap_change_24h: 0,
            market_cap_progress: 0,
            volume_24h: 0,
            volume_change_24h: 0,
            volume_progress: 0,
            active_coins: 0,
            gainers_24h: 0,
            losers_24h: 0,
            last_update: new Date().toISOString(),
            data_sources: []
        };
    }

    /**
     * Get default market metrics
     */
    getDefaultMarketMetrics() {
        return {
            btc_dominance: 0,
            eth_dominance: 0,
            fear_greed_index: { value: 50, status: 'Neutral' },
            altseason_index: { value: 50, status: 'Neutral' },
            market_sentiment: 'neutral',
            last_update: new Date().toISOString()
        };
    }

    /**
     * Stop the service
     */
    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        console.log('🛑 Market service stopped');
    }
}

module.exports = new MarketService();
