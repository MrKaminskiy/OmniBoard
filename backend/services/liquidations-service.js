const WebSocket = require('ws');
const EventEmitter = require('events');

class LiquidationsService extends EventEmitter {
    constructor() {
        super();
        this.liquidations = new Map(); // Хранит ликвидации по биржам
        this.aggregatedData = {
            total_24h: 0,
            longs_24h: 0,
            shorts_24h: 0,
            last_update: new Date().toISOString(),
            exchanges: {}
        };
        this.connections = new Map();
        this.isRunning = false;
        
        // Очищаем старые данные каждые 24 часа
        setInterval(() => this.cleanOldData(), 24 * 60 * 60 * 1000);
    }

    /**
     * Запуск сервиса ликвидаций
     */
    async start() {
        if (this.isRunning) return;
        
        console.log('🚀 Starting Liquidations Service...');
        this.isRunning = true;

        try {
            // Подключаемся к Binance WebSocket
            await this.connectToBinance();
            
            // Подключаемся к OKX WebSocket
            await this.connectToOKX();
            
            // Запускаем агрегацию каждые 5 минут
            setInterval(() => this.aggregateData(), 5 * 60 * 1000);
            
            console.log('✅ Liquidations Service started successfully');
        } catch (error) {
            console.error('❌ Error starting Liquidations Service:', error);
            this.isRunning = false;
        }
    }

    /**
     * Подключение к Binance WebSocket для ликвидаций
     */
    async connectToBinance() {
        try {
            const ws = new WebSocket('wss://fstream.binance.com/ws/!forceOrder@arr');
            
            ws.on('open', () => {
                console.log('🔗 Connected to Binance Liquidations WebSocket');
                this.connections.set('binance', ws);
            });

            ws.on('message', (data) => {
                try {
                    const liquidations = JSON.parse(data);
                    this.processBinanceLiquidations(liquidations);
                } catch (error) {
                    console.error('Error processing Binance liquidations:', error);
                }
            });

            ws.on('error', (error) => {
                console.error('Binance WebSocket error:', error);
            });

            ws.on('close', () => {
                console.log('Binance WebSocket connection closed');
                this.connections.delete('binance');
                // Переподключение через 5 секунд
                setTimeout(() => this.connectToBinance(), 5000);
            });

        } catch (error) {
            console.error('Error connecting to Binance WebSocket:', error);
        }
    }

    /**
     * Подключение к OKX WebSocket для ликвидаций
     */
    async connectToOKX() {
        try {
            const ws = new WebSocket('wss://ws.okx.com:8443/ws/v5/public');
            
            ws.on('open', () => {
                console.log('🔗 Connected to OKX WebSocket');
                // Подписываемся на канал ликвидаций
                const subscribeMsg = {
                    op: 'subscribe',
                    args: [{
                        channel: 'liquidation-warning',
                        instType: 'SWAP'
                    }]
                };
                ws.send(JSON.stringify(subscribeMsg));
                this.connections.set('okx', ws);
            });

            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data);
                    this.processOKXLiquidations(message);
                } catch (error) {
                    console.error('Error processing OKX liquidations:', error);
                }
            });

            ws.on('error', (error) => {
                console.error('OKX WebSocket error:', error);
            });

            ws.on('close', () => {
                console.log('OKX WebSocket connection closed');
                this.connections.delete('okx');
                // Переподключение через 5 секунд
                setTimeout(() => this.connectToOKX(), 5000);
            });

        } catch (error) {
            console.error('Error connecting to OKX WebSocket:', error);
        }
    }

    /**
     * Обработка ликвидаций с Binance
     */
    processBinanceLiquidations(data) {
        if (!Array.isArray(data)) return;

        data.forEach(liquidation => {
            if (liquidation.e === 'forceOrder') {
                const timestamp = new Date(liquidation.E);
                const symbol = liquidation.s;
                const side = liquidation.S; // LONG или SHORT
                const quantity = parseFloat(liquidation.q);
                const price = parseFloat(liquidation.p);
                const value = quantity * price;

                this.addLiquidation('binance', {
                    symbol,
                    side,
                    quantity,
                    price,
                    value,
                    timestamp
                });
            }
        });
    }

    /**
     * Обработка ликвидаций с OKX
     */
    processOKXLiquidations(data) {
        if (data.event === 'subscribe') return;
        if (data.data && Array.isArray(data.data)) {
            data.data.forEach(liquidation => {
                if (liquidation.instId && liquidation.posSide) {
                    const timestamp = new Date();
                    const symbol = liquidation.instId;
                    const side = liquidation.posSide === 'long' ? 'LONG' : 'SHORT';
                    const quantity = parseFloat(liquidation.sz || 0);
                    const price = parseFloat(liquidation.last || 0);
                    const value = quantity * price;

                    if (value > 0) {
                        this.addLiquidation('okx', {
                            symbol,
                            side,
                            quantity,
                            price,
                            value,
                            timestamp
                        });
                    }
                }
            });
        }
    }

    /**
     * Добавление ликвидации в хранилище
     */
    addLiquidation(exchange, liquidation) {
        const key = `${exchange}_${liquidation.symbol}_${liquidation.timestamp.getTime()}`;
        
        if (!this.liquidations.has(exchange)) {
            this.liquidations.set(exchange, new Map());
        }
        
        this.liquidations.get(exchange).set(key, liquidation);
        
        // Эмитим событие для обновления агрегированных данных
        this.emit('liquidation_added', { exchange, liquidation });
    }

    /**
     * Агрегация данных за последние 24 часа
     */
    aggregateData() {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        let totalValue = 0;
        let longsValue = 0;
        let shortsValue = 0;
        const exchanges = {};

        // Проходим по всем биржам
        for (const [exchange, liquidations] of this.liquidations) {
            let exchangeTotal = 0;
            let exchangeLongs = 0;
            let exchangeShorts = 0;

            // Проходим по ликвидациям биржи
            for (const [key, liquidation] of liquidations) {
                // Проверяем, что ликвидация за последние 24 часа
                if (liquidation.timestamp >= twentyFourHoursAgo) {
                    exchangeTotal += liquidation.value;
                    
                    if (liquidation.side === 'LONG') {
                        exchangeLongs += liquidation.value;
                    } else if (liquidation.side === 'SHORT') {
                        exchangeShorts += liquidation.value;
                    }
                }
            }

            // Сохраняем данные по бирже
            exchanges[exchange] = {
                total: exchangeTotal,
                longs: exchangeLongs,
                shorts: exchangeShorts,
                last_update: now.toISOString()
            };

            // Добавляем к общим значениям
            totalValue += exchangeTotal;
            longsValue += exchangeLongs;
            shortsValue += exchangeShorts;
        }

        // Обновляем агрегированные данные
        this.aggregatedData = {
            total_24h: totalValue,
            longs_24h: longsValue,
            shorts_24h: shortsValue,
            last_update: now.toISOString(),
            exchanges
        };

        console.log('📊 Liquidations aggregated:', {
            total: this.formatValue(totalValue),
            longs: this.formatValue(longsValue),
            shorts: this.formatValue(shortsValue)
        });
    }

    /**
     * Форматирование значения ликвидаций
     */
    formatValue(value) {
        if (value >= 1e9) {
            return `$${(value / 1e9).toFixed(2)}B`;
        } else if (value >= 1e6) {
            return `$${(value / 1e6).toFixed(2)}M`;
        } else if (value >= 1e3) {
            return `$${(value / 1e3).toFixed(2)}K`;
        } else {
            return `$${value.toFixed(2)}`;
        }
    }

    /**
     * Очистка старых данных (старше 24 часов)
     */
    cleanOldData() {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        for (const [exchange, liquidations] of this.liquidations) {
            for (const [key, liquidation] of liquidations) {
                if (liquidation.timestamp < twentyFourHoursAgo) {
                    liquidations.delete(key);
                }
            }
        }
        
        console.log('🧹 Old liquidations data cleaned');
    }

    /**
     * Получение агрегированных данных
     */
    getAggregatedData() {
        return {
            ...this.aggregatedData,
            total_formatted: this.formatValue(this.aggregatedData.total_24h),
            longs_formatted: this.formatValue(this.aggregatedData.longs_24h),
            shorts_formatted: this.formatValue(this.aggregatedData.shorts_24h)
        };
    }

    /**
     * Получение данных по конкретной бирже
     */
    getExchangeData(exchange) {
        return this.aggregatedData.exchanges[exchange] || null;
    }

    /**
     * Остановка сервиса
     */
    stop() {
        console.log('🛑 Stopping Liquidations Service...');
        this.isRunning = false;
        
        // Закрываем все WebSocket соединения
        for (const [exchange, ws] of this.connections) {
            ws.close();
        }
        this.connections.clear();
        
        console.log('✅ Liquidations Service stopped');
    }

    /**
     * Статус сервиса
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            connections: Array.from(this.connections.keys()),
            liquidationsCount: Array.from(this.liquidations.values()).reduce((total, map) => total + map.size, 0),
            lastUpdate: this.aggregatedData.last_update
        };
    }
}

module.exports = new LiquidationsService();
