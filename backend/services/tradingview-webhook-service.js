const crypto = require('crypto');
const { logBusinessEvent, logBusinessError } = require('../middleware/logger');

class TradingViewWebhookService {
    constructor() {
        this.webhookSecret = process.env.TRADINGVIEW_WEBHOOK_SECRET || 'default_secret';
        this.signals = new Map(); // Хранение последних сигналов
        this.maxSignals = 1000; // Максимальное количество сигналов в памяти
        this.subscribers = new Set(); // Подписчики на уведомления
        
        // Валидация сигналов
        this.validSignalTypes = ['CRITICAL_SHORTS', 'FEAR_ZONE'];
        this.validTimeframes = ['1h', '4h', '1d'];
        this.validExchanges = ['BINANCE', 'OKX', 'BINGX'];
    }

    /**
     * Валидация webhook от TradingView
     */
    validateWebhook(payload, signature) {
        try {
            // Проверяем подпись
            const expectedSignature = crypto
                .createHmac('sha256', this.webhookSecret)
                .update(JSON.stringify(payload))
                .digest('hex');
            
            if (signature !== expectedSignature) {
                logBusinessError('webhook_signature_invalid', new Error('Invalid signature'), { 
                    expected: expectedSignature, 
                    received: signature 
                });
                return false;
            }

            // Проверяем обязательные поля
            if (!payload.signal_type || !payload.symbol || !payload.timeframe || !payload.exchange) {
                logBusinessError('webhook_missing_fields', new Error('Missing required fields'), { payload });
                return false;
            }

            // Проверяем тип сигнала
            if (!this.validSignalTypes.includes(payload.signal_type)) {
                logBusinessError('webhook_invalid_signal_type', new Error('Invalid signal type'), { 
                    signal_type: payload.signal_type 
                });
                return false;
            }

            // Проверяем timeframe
            if (!this.validTimeframes.includes(payload.timeframe)) {
                logBusinessError('webhook_invalid_timeframe', new Error('Invalid timeframe'), { 
                    timeframe: payload.timeframe 
                });
                return false;
            }

            // Проверяем exchange
            if (!this.validExchanges.includes(payload.exchange)) {
                logBusinessError('webhook_invalid_exchange', new Error('Invalid exchange'), { 
                    exchange: payload.exchange 
                });
                return false;
            }

            return true;
        } catch (error) {
            logBusinessError('webhook_validation_error', error, { payload, signature });
            return false;
        }
    }

    /**
     * Обработка webhook от TradingView
     */
    async processWebhook(payload, signature) {
        try {
            // Валидируем webhook
            if (!this.validateWebhook(payload, signature)) {
                throw new Error('Webhook validation failed');
            }

            // Создаем уникальный ID для сигнала
            const signalId = this.generateSignalId(payload);
            
            // Обогащаем данные сигнала
            const enrichedSignal = {
                id: signalId,
                signal_type: payload.signal_type,
                symbol: payload.symbol,
                timeframe: payload.timeframe,
                exchange: payload.exchange,
                price: payload.price || null,
                timestamp: payload.timestamp || new Date().toISOString(),
                conditions: payload.conditions || [],
                strength: payload.strength || 'medium',
                description: this.generateSignalDescription(payload),
                metadata: {
                    received_at: new Date().toISOString(),
                    source: 'tradingview',
                    version: payload.version || '1.0'
                }
            };

            // Сохраняем сигнал
            this.saveSignal(signalId, enrichedSignal);

            // Логируем событие
            logBusinessEvent('tradingview_signal_received', {
                signal_id: signalId,
                signal_type: enrichedSignal.signal_type,
                symbol: enrichedSignal.symbol,
                exchange: enrichedSignal.exchange,
                timestamp: enrichedSignal.timestamp
            });

            // Уведомляем подписчиков
            await this.notifySubscribers(enrichedSignal);

            return {
                status: 'success',
                signal_id: signalId,
                message: 'Signal processed successfully'
            };

        } catch (error) {
            logBusinessError('webhook_processing_error', error, { payload, signature });
            throw error;
        }
    }

    /**
     * Генерация уникального ID для сигнала
     */
    generateSignalId(payload) {
        const data = `${payload.signal_type}_${payload.symbol}_${payload.exchange}_${payload.timestamp || Date.now()}`;
        return crypto.createHash('md5').update(data).digest('hex');
    }

    /**
     * Генерация описания сигнала
     */
    generateSignalDescription(payload) {
        const descriptions = {
            'CRITICAL_SHORTS': `Critical short signal detected for ${payload.symbol} on ${payload.exchange}. High short interest detected.`,
            'FEAR_ZONE': `Fear zone signal for ${payload.symbol} on ${payload.exchange}. Price entering fear territory.`
        };
        
        return descriptions[payload.signal_type] || `Signal received for ${payload.symbol}`;
    }

    /**
     * Сохранение сигнала
     */
    saveSignal(signalId, signal) {
        // Добавляем сигнал в начало списка
        this.signals.set(signalId, signal);
        
        // Ограничиваем количество сигналов в памяти
        if (this.signals.size > this.maxSignals) {
            const oldestKey = this.signals.keys().next().value;
            this.signals.delete(oldestKey);
        }

        logBusinessEvent('signal_saved', {
            signal_id: signalId,
            total_signals: this.signals.size
        });
    }

    /**
     * Получение последних сигналов
     */
    getRecentSignals(limit = 50, signalType = null, symbol = null) {
        const signals = Array.from(this.signals.values());
        
        let filtered = signals;
        
        // Фильтруем по типу сигнала
        if (signalType) {
            filtered = filtered.filter(signal => signal.signal_type === signalType);
        }
        
        // Фильтруем по символу
        if (symbol) {
            filtered = filtered.filter(signal => signal.symbol === symbol);
        }
        
        // Сортируем по времени (новые сначала)
        filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Возвращаем ограниченное количество
        return filtered.slice(0, limit);
    }

    /**
     * Получение статистики сигналов
     */
    getSignalsStats() {
        const signals = Array.from(this.signals.values());
        const now = Date.now();
        const oneDayAgo = now - (24 * 60 * 60 * 1000);
        const oneHourAgo = now - (60 * 60 * 1000);
        
        const stats = {
            total: signals.length,
            by_type: {},
            by_exchange: {},
            by_symbol: {},
            recent_24h: 0,
            recent_1h: 0,
            last_signal: null
        };
        
        signals.forEach(signal => {
            // По типу
            stats.by_type[signal.signal_type] = (stats.by_type[signal.signal_type] || 0) + 1;
            
            // По бирже
            stats.by_exchange[signal.exchange] = (stats.by_exchange[signal.exchange] || 0) + 1;
            
            // По символу
            stats.by_symbol[signal.symbol] = (stats.by_symbol[signal.symbol] || 0) + 1;
            
            // По времени
            const signalTime = new Date(signal.timestamp).getTime();
            if (signalTime > oneDayAgo) stats.recent_24h++;
            if (signalTime > oneHourAgo) stats.recent_1h++;
            
            // Последний сигнал
            if (!stats.last_signal || signalTime > new Date(stats.last_signal.timestamp).getTime()) {
                stats.last_signal = signal;
            }
        });
        
        return stats;
    }

    /**
     * Подписка на уведомления
     */
    subscribe(callback) {
        this.subscribers.add(callback);
        logBusinessEvent('webhook_subscriber_added', { total_subscribers: this.subscribers.size });
    }

    /**
     * Отписка от уведомлений
     */
    unsubscribe(callback) {
        this.subscribers.delete(callback);
        logBusinessEvent('webhook_subscriber_removed', { total_subscribers: this.subscribers.size });
    }

    /**
     * Уведомление подписчиков
     */
    async notifySubscribers(signal) {
        const promises = Array.from(this.subscribers).map(async (callback) => {
            try {
                await callback(signal);
            } catch (error) {
                logBusinessError('subscriber_notification_error', error, { 
                    signal_id: signal.id,
                    subscriber: callback.name || 'anonymous'
                });
            }
        });
        
        await Promise.allSettled(promises);
        
        logBusinessEvent('subscribers_notified', {
            signal_id: signal.id,
            subscribers_count: this.subscribers.size
        });
    }

    /**
     * Получение сигналов по символу
     */
    getSignalsBySymbol(symbol, limit = 20) {
        return this.getRecentSignals(limit, null, symbol);
    }

    /**
     * Получение сигналов по типу
     */
    getSignalsByType(signalType, limit = 20) {
        return this.getRecentSignals(limit, signalType);
    }

    /**
     * Очистка старых сигналов
     */
    cleanupOldSignals(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 дней
        const now = Date.now();
        let cleanedCount = 0;
        
        for (const [key, signal] of this.signals.entries()) {
            const signalAge = now - new Date(signal.timestamp).getTime();
            if (signalAge > maxAge) {
                this.signals.delete(key);
                cleanedCount++;
            }
        }
        
        if (cleanedCount > 0) {
            logBusinessEvent('old_signals_cleaned', { cleaned_count: cleanedCount });
        }
        
        return cleanedCount;
    }

    /**
     * Получение информации о сервисе
     */
    getServiceInfo() {
        return {
            name: 'TradingView Webhook Service',
            version: '1.0.0',
            status: 'active',
            subscribers_count: this.subscribers.size,
            signals_count: this.signals.size,
            max_signals: this.maxSignals,
            valid_signal_types: this.validSignalTypes,
            valid_timeframes: this.validTimeframes,
            valid_exchanges: this.validExchanges,
            last_updated: new Date().toISOString()
        };
    }
}

module.exports = new TradingViewWebhookService();
