const express = require('express');
const router = express.Router();

// Import route modules
const marketRoutes = require('./market-routes');
const coinsRoutes = require('./coins-routes');
const derivativesRoutes = require('./derivatives-routes');
const webhookRoutes = require('./webhook-routes');

// Mount routes
router.use('/market', marketRoutes);
router.use('/coins', coinsRoutes);
router.use('/derivatives', derivativesRoutes);
router.use('/webhook', webhookRoutes);

// API info endpoint
router.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'OmniBoard API v1',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            market: '/api/v1/market',
            coins: '/api/v1/coins',
            derivatives: '/api/v1/derivatives',
            webhook: '/api/v1/webhook'
        },
        features: {
            market_data: 'Real-time market data from BingX and CoinGecko',
            trading_signals: 'TradingView webhook integration',
            market_metrics: 'Fear & Greed, Altseason, Dominance indices',
            price_tracking: 'Live price updates every 30-60 seconds'
        }
    });
});

module.exports = router;
