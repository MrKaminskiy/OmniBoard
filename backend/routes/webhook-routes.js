const express = require('express');
const router = express.Router();
const tradingViewWebhookService = require('../services/tradingview-webhook-service');
const { logBusinessEvent, logBusinessError } = require('../middleware/logger');
const { simpleValidators } = require('../middleware/validation');

/**
 * POST /api/v1/webhook/tradingview
 * Webhook endpoint для TradingView сигналов
 */
router.post('/tradingview', async (req, res, next) => {
    try {
        const payload = req.body;
        const signature = req.headers['x-signature'] || req.headers['x-tradingview-signature'];
        
        if (!signature) {
            return res.status(401).json({
                status: 'error',
                message: 'Missing signature header',
                timestamp: new Date().toISOString()
            });
        }

        logBusinessEvent('tradingview_webhook_received', {
            signal_type: payload.signal_type,
            symbol: payload.symbol,
            exchange: payload.exchange,
            timestamp: payload.timestamp
        });

        const result = await tradingViewWebhookService.processWebhook(payload, signature);
        
        res.json({
            status: 'ok',
            data: result,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logBusinessError('tradingview_webhook_error', error, { 
            body: req.body, 
            headers: req.headers 
        });
        next(error);
    }
});

/**
 * GET /api/v1/webhook/signals
 * Получение последних сигналов
 */
router.get('/signals', 
    simpleValidators.validateLimit,
    async (req, res, next) => {
        try {
            const limit = parseInt(req.query.limit) || 50;
            const signalType = req.query.type || null;
            const symbol = req.query.symbol || null;
            
            const signals = tradingViewWebhookService.getRecentSignals(limit, signalType, symbol);
            
            res.json({
                status: 'ok',
                data: {
                    signals,
                    count: signals.length,
                    filters: {
                        limit,
                        type: signalType,
                        symbol
                    }
                },
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            logBusinessError('signals_retrieval_error', error, { 
                query: req.query 
            });
            next(error);
        }
    }
);

/**
 * GET /api/v1/webhook/signals/stats
 * Получение статистики сигналов
 */
router.get('/signals/stats', async (req, res, next) => {
    try {
        const stats = tradingViewWebhookService.getSignalsStats();
        
        res.json({
            status: 'ok',
            data: stats,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logBusinessError('signals_stats_error', error);
        next(error);
    }
});

/**
 * GET /api/v1/webhook/signals/:symbol
 * Получение сигналов по конкретному символу
 */
router.get('/signals/:symbol', 
    simpleValidators.validateLimit,
    async (req, res, next) => {
        try {
            const { symbol } = req.params;
            const limit = parseInt(req.query.limit) || 20;
            
            const signals = tradingViewWebhookService.getSignalsBySymbol(symbol, limit);
            
            res.json({
                status: 'ok',
                data: {
                    symbol,
                    signals,
                    count: signals.length,
                    limit
                },
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            logBusinessError('symbol_signals_error', error, { 
                symbol: req.params.symbol 
            });
            next(error);
        }
    }
);

/**
 * GET /api/v1/webhook/signals/type/:type
 * Получение сигналов по типу
 */
router.get('/signals/type/:type', 
    simpleValidators.validateLimit,
    async (req, res, next) => {
        try {
            const { type } = req.params;
            const limit = parseInt(req.query.limit) || 20;
            
            // Валидируем тип сигнала
            if (!tradingViewWebhookService.validSignalTypes.includes(type)) {
                return res.status(400).json({
                    status: 'error',
                    message: `Invalid signal type. Valid types: ${tradingViewWebhookService.validSignalTypes.join(', ')}`,
                    timestamp: new Date().toISOString()
                });
            }
            
            const signals = tradingViewWebhookService.getSignalsByType(type, limit);
            
            res.json({
                status: 'ok',
                data: {
                    type,
                    signals,
                    count: signals.length,
                    limit
                },
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            logBusinessError('type_signals_error', error, { 
                type: req.params.type 
            });
            next(error);
        }
    }
);

/**
 * GET /api/v1/webhook/service-info
 * Информация о webhook сервисе
 */
router.get('/service-info', async (req, res, next) => {
    try {
        const info = tradingViewWebhookService.getServiceInfo();
        
        res.json({
            status: 'ok',
            data: info,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logBusinessError('service_info_error', error);
        next(error);
    }
});

/**
 * POST /api/v1/webhook/signals/cleanup
 * Очистка старых сигналов (только для админов)
 */
router.post('/signals/cleanup', async (req, res, next) => {
    try {
        const { maxAge } = req.body;
        const maxAgeMs = maxAge ? parseInt(maxAge) : 7 * 24 * 60 * 60 * 1000; // 7 дней по умолчанию
        
        const cleanedCount = tradingViewWebhookService.cleanupOldSignals(maxAgeMs);
        
        res.json({
            status: 'ok',
            data: {
                cleaned_count: cleanedCount,
                max_age_ms: maxAgeMs,
                max_age_days: Math.round(maxAgeMs / (24 * 60 * 60 * 1000))
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logBusinessError('signals_cleanup_error', error, { 
            body: req.body 
        });
        next(error);
    }
});

/**
 * POST /api/v1/webhook/test
 * Тестовый endpoint для проверки webhook
 */
router.post('/test', async (req, res) => {
    try {
        // Тестовый endpoint для проверки webhook
        const testData = {
            message: 'Webhook test successful',
            timestamp: new Date().toISOString(),
            test: true
        };
        
        res.json({
            status: 'ok',
            data: testData,
            message: 'Webhook endpoint is working correctly'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Webhook test failed',
            error: error.message
        });
    }
});

module.exports = router;
