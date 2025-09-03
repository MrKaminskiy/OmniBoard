const express = require('express');
const router = express.Router();
const marketService = require('../services/market-service');
const { simpleValidators } = require('../middleware/validation');
const { logBusinessEvent, logBusinessError } = require('../middleware/logger');

/**
 * GET /api/v1/market/overview
 * Get comprehensive market overview with all metrics
 */
router.get('/overview', async (req, res, next) => {
    try {
        logBusinessEvent('market_overview_requested', { timestamp: new Date().toISOString() });
        
        const data = await marketService.getComprehensiveMarketOverview();
        
        logBusinessEvent('market_overview_retrieved', { 
            dataPoints: Object.keys(data).length,
            timestamp: new Date().toISOString()
        });
        
        res.json({
            status: 'ok',
            data,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logBusinessError('market_overview_error', error, { endpoint: '/overview' });
        next(error);
    }
});

/**
 * GET /api/v1/market/top-gainers
 * Get top gainers
 */
router.get('/top-gainers', 
    simpleValidators.validateLimit,
    async (req, res, next) => {
        try {
            const limit = req.query.limit || 10;
            logBusinessEvent('top_gainers_requested', { limit, timestamp: new Date().toISOString() });
            
            const data = await marketService.getTopGainers(limit);
            
            logBusinessEvent('top_gainers_retrieved', { 
                count: data.coins?.length || 0,
                limit,
                timestamp: new Date().toISOString()
            });
            
            res.json({
                status: 'ok',
                data,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logBusinessError('top_gainers_error', error, { endpoint: '/top-gainers', limit: req.query.limit });
            next(error);
        }
    }
);

/**
 * GET /api/v1/market/top-losers
 * Get top losers
 */
router.get('/top-losers', 
    simpleValidators.validateLimit,
    async (req, res, next) => {
        try {
            const limit = req.query.limit || 10;
            logBusinessEvent('top_losers_requested', { limit, timestamp: new Date().toISOString() });
            
            const data = await marketService.getTopLosers(limit);
            
            logBusinessEvent('top_losers_retrieved', { 
                count: data.coins?.length || 0,
                limit,
                timestamp: new Date().toISOString()
            });
            
            res.json({
                status: 'ok',
                data,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logBusinessError('top_losers_error', error, { endpoint: '/top-losers', limit: req.query.limit });
            next(error);
        }
    }
);

/**
 * GET /api/v1/market/fear-greed
 * Get fear and greed index
 */
router.get('/fear-greed', async (req, res, next) => {
    try {
        logBusinessEvent('fear_greed_requested', { timestamp: new Date().toISOString() });
        
        const data = await marketService.getFearGreedIndex();
        
        logBusinessEvent('fear_greed_retrieved', { 
            value: data.value,
            status: data.status,
            timestamp: new Date().toISOString()
        });
        
        res.json({
            status: 'ok',
            data,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logBusinessError('fear_greed_error', error, { endpoint: '/fear-greed' });
        next(error);
    }
});

/**
 * GET /api/v1/market/altseason
 * Get altseason index
 */
router.get('/altseason', async (req, res, next) => {
    try {
        logBusinessEvent('altseason_requested', { timestamp: new Date().toISOString() });
        
        const data = await marketService.getAltseasonIndex();
        
        logBusinessEvent('altseason_retrieved', { 
            value: data.value,
            status: data.status,
            timestamp: new Date().toISOString()
        });
        
        res.json({
            status: 'ok',
            data,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logBusinessError('altseason_error', error, { endpoint: '/altseason' });
        next(error);
    }
});

/**
 * GET /api/v1/market/open-interest
 * Get open interest data
 */
router.get('/open-interest', async (req, res, next) => {
    try {
        logBusinessEvent('open_interest_requested', { timestamp: new Date().toISOString() });
        
        const data = await marketService.getOpenInterest();
        
        logBusinessEvent('open_interest_retrieved', { 
            value: data.value,
            change: data.change,
            timestamp: new Date().toISOString()
        });
        
        res.json({
            status: 'ok',
            data,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logBusinessError('open_interest_error', error, { endpoint: '/open-interest' });
        next(error);
    }
});

/**
 * GET /api/v1/market/liquidations
 * Get liquidations data
 */
router.get('/liquidations', async (req, res, next) => {
    try {
        logBusinessEvent('liquidations_requested', { timestamp: new Date().toISOString() });
        
        const data = await marketService.getLiquidations();
        
        logBusinessEvent('liquidations_retrieved', { 
            value: data.value,
            longShortRatio: data.long_short_ratio,
            timestamp: new Date().toISOString()
        });
        
        res.json({
            status: 'ok',
            data,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logBusinessError('liquidations_error', error, { endpoint: '/liquidations' });
        next(error);
    }
});

/**
 * GET /api/v1/market/long-short-ratio
 * Get long/short ratio
 */
router.get('/long-short-ratio', async (req, res, next) => {
    try {
        logBusinessEvent('long_short_ratio_requested', { timestamp: new Date().toISOString() });
        
        const data = await marketService.getLongShortRatio();
        
        logBusinessEvent('long_short_ratio_retrieved', { 
            value: data.value,
            accountsPercentage: data.accounts_percentage,
            timestamp: new Date().toISOString()
        });
        
        res.json({
            status: 'ok',
            data,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logBusinessError('long_short_ratio_error', error, { endpoint: '/long-short-ratio' });
        next(error);
    }
});

/**
 * GET /api/v1/market/btc-dominance
 * Get BTC dominance
 */
router.get('/btc-dominance', async (req, res, next) => {
    try {
        logBusinessEvent('btc_dominance_requested', { timestamp: new Date().toISOString() });
        
        const data = await marketService.getBTCDominance();
        
        logBusinessEvent('btc_dominance_retrieved', { 
            value: data.value,
            eth: data.eth,
            timestamp: new Date().toISOString()
        });
        
        res.json({
            status: 'ok',
            data,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logBusinessError('btc_dominance_error', error, { endpoint: '/btc-dominance' });
        next(error);
    }
});

/**
 * GET /api/v1/market/coins
 * Get all coins data (currently limited to specific 15 coins)
 */
router.get('/coins', async (req, res, next) => {
    try {
        logBusinessEvent('all_coins_requested', { timestamp: new Date().toISOString() });
        
        const data = await marketService.getAllCoinsData();
        
        logBusinessEvent('all_coins_retrieved', { 
            count: data.coins?.length || 0,
            timestamp: new Date().toISOString()
        });
        
        res.json({
            status: 'ok',
            data,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logBusinessError('all_coins_error', error, { endpoint: '/coins' });
        next(error);
    }
});

/**
 * GET /api/v1/market/specific-coins
 * Get data for specific coins
 */
router.get('/specific-coins', async (req, res, next) => {
    try {
        const { coins } = req.query;
        
        if (!coins) {
            return res.status(400).json({
                status: 'error',
                message: 'Coins parameter is required (comma-separated list)',
                timestamp: new Date().toISOString()
            });
        }
        
        const coinIds = coins.split(',').map(id => id.trim());
        logBusinessEvent('specific_coins_requested', { 
            coinIds, 
            count: coinIds.length,
            timestamp: new Date().toISOString() 
        });
        
        const data = await marketService.getSpecificCoins(coinIds);
        
        logBusinessEvent('specific_coins_retrieved', { 
            requested: coinIds.length,
            returned: data.coins?.length || 0,
            timestamp: new Date().toISOString()
        });
        
        res.json({
            status: 'ok',
            data,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logBusinessError('specific_coins_error', error, { endpoint: '/specific-coins' });
        next(error);
    }
});

module.exports = router;
