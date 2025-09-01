const express = require('express');
const router = express.Router();
const marketService = require('../services/market-service');
const bingXService = require('../services/bingx-service');

/**
 * GET /api/v1/coins/list
 * Get list of coins with market data
 */
router.get('/list', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;
        const data = await marketService.getCoinsList(limit, offset);
        res.json({
            status: 'ok',
            data,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Coins list error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /api/v1/coins/details
 * Get detailed information about a specific coin
 */
router.get('/details', async (req, res) => {
    try {
        const { symbol } = req.query;
        
        if (!symbol) {
            return res.status(400).json({
                status: 'error',
                message: 'Symbol parameter is required',
                timestamp: new Date().toISOString()
            });
        }

        const ticker = await bingXService.get24hrTicker(symbol);
        const orderBook = await bingXService.getOrderBook(symbol, 50);
        const recentTrades = await bingXService.getRecentTrades(symbol, 50);
        const klines = await bingXService.getKlines(symbol, '1h', 24);

        const data = {
            symbol: ticker.symbol,
            ticker,
            orderBook,
            recentTrades,
            klines
        };

        res.json({
            status: 'ok',
            data,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Coin details error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /api/v1/coins/price
 * Get current price for a coin
 */
router.get('/price', async (req, res) => {
    try {
        const { symbol } = req.query;
        
        if (!symbol) {
            return res.status(400).json({
                status: 'error',
                message: 'Symbol parameter is required',
                timestamp: new Date().toISOString()
            });
        }

        const ticker = await bingXService.get24hrTicker(symbol);
        
        const data = {
            symbol: ticker.symbol,
            price: ticker.lastPrice,
            priceChange: ticker.priceChange,
            priceChangePercent: ticker.priceChangePercent,
            volume: ticker.volume,
            quoteVolume: ticker.quoteVolume,
            high: ticker.highPrice,
            low: ticker.lowPrice,
            open: ticker.openPrice
        };

        res.json({
            status: 'ok',
            data,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Coin price error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /api/v1/coins/market-data
 * Get comprehensive market data for a coin
 */
router.get('/market-data', async (req, res) => {
    try {
        const { symbol, interval = '1h', limit = 100 } = req.query;
        
        if (!symbol) {
            return res.status(400).json({
                status: 'error',
                message: 'Symbol parameter is required',
                timestamp: new Date().toISOString()
            });
        }

        const [ticker, klines] = await Promise.all([
            bingXService.get24hrTicker(symbol),
            bingXService.getKlines(symbol, interval, limit)
        ]);

        const data = {
            symbol: ticker.symbol,
            ticker,
            klines,
            metadata: {
                interval,
                limit,
                lastUpdate: new Date().toISOString()
            }
        };

        res.json({
            status: 'ok',
            data,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Market data error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
