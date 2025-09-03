const express = require('express');
const router = express.Router();
const liquidationsService = require('../services/liquidations-service');

/**
 * GET /api/v1/liquidations/overview
 * Получение общей сводки ликвидаций за 24 часа
 */
router.get('/overview', async (req, res) => {
    try {
        const data = liquidationsService.getAggregatedData();
        
        res.json({
            status: 'ok',
            data: {
                total_24h: data.total_24h,
                total_formatted: data.total_formatted,
                longs_24h: data.longs_24h,
                longs_formatted: data.longs_formatted,
                shorts_24h: data.shorts_24h,
                shorts_formatted: data.shorts_formatted,
                last_update: data.last_update,
                exchanges: data.exchanges
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting liquidations overview:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get liquidations overview',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /api/v1/liquidations/exchange/:exchange
 * Получение данных о ликвидациях по конкретной бирже
 */
router.get('/exchange/:exchange', async (req, res) => {
    try {
        const { exchange } = req.params;
        const data = liquidationsService.getExchangeData(exchange);
        
        if (!data) {
            return res.status(404).json({
                status: 'error',
                message: `Exchange '${exchange}' not found`,
                timestamp: new Date().toISOString()
            });
        }
        
        res.json({
            status: 'ok',
            data: {
                exchange,
                total: data.total,
                total_formatted: liquidationsService.formatValue(data.total),
                longs: data.longs,
                longs_formatted: liquidationsService.formatValue(data.longs),
                shorts: data.shorts,
                shorts_formatted: liquidationsService.formatValue(data.shorts),
                last_update: data.last_update
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting exchange liquidations:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get exchange liquidations',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /api/v1/liquidations/status
 * Получение статуса сервиса ликвидаций
 */
router.get('/status', async (req, res) => {
    try {
        const status = liquidationsService.getStatus();
        
        res.json({
            status: 'ok',
            data: status,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting liquidations service status:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get service status',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * POST /api/v1/liquidations/start
 * Запуск сервиса ликвидаций (для администраторов)
 */
router.post('/start', async (req, res) => {
    try {
        await liquidationsService.start();
        
        res.json({
            status: 'ok',
            message: 'Liquidations service started successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error starting liquidations service:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to start liquidations service',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * POST /api/v1/liquidations/stop
 * Остановка сервиса ликвидаций (для администраторов)
 */
router.post('/stop', async (req, res) => {
    try {
        liquidationsService.stop();
        
        res.json({
            status: 'ok',
            message: 'Liquidations service stopped successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error stopping liquidations service:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to stop liquidations service',
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
