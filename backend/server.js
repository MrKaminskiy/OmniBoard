const express = require('express');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();

// Импортируем новые middleware
const { securityMiddleware, validateContentType, requestSizeLimit, validateUserAgent, sqlInjectionProtection, nosqlInjectionProtection, suspiciousActivityLogger } = require('./middleware/security');
const { morganMiddleware, requestIdMiddleware, errorLogger, successLogger } = require('./middleware/logger');
const { apiLimiter, strictLimiter } = require('./middleware/rate-limiter');
const { errorHandler, notFoundHandler, unhandledRejectionHandler, uncaughtExceptionHandler } = require('./middleware/error-handler');
const { requestTracker, errorTracker, healthCheckWithMetrics, detailedMetrics, resetMetrics } = require('./middleware/monitoring');

// Импортируем сервисы
const bingXService = require('./services/bingx-service');
const marketService = require('./services/market-service');
const cacheService = require('./services/cache-service');

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Обработка необработанных ошибок
process.on('unhandledRejection', unhandledRejectionHandler);
process.on('uncaughtException', uncaughtExceptionHandler);

// Middleware для безопасности
app.use(securityMiddleware);

// Middleware для валидации и ограничений
app.use(validateContentType);
app.use(requestSizeLimit);
app.use(validateUserAgent);
app.use(sqlInjectionProtection);
app.use(nosqlInjectionProtection);
app.use(suspiciousActivityLogger);

// Middleware для логирования и мониторинга
app.use(requestIdMiddleware);
app.use(morganMiddleware);
app.use(requestTracker);
app.use(successLogger);

// Rate limiting - ВРЕМЕННО ОТКЛЮЧЕН для тестирования
console.log('⚠️ Rate limiting TEMPORARILY DISABLED for testing');
// TODO: Восстановить когда решим проблемы с API
/*
if (process.env.DISABLE_RATE_LIMIT !== 'true') {
    app.use('/api/', apiLimiter);
    app.use('/api/v1/coins/details', strictLimiter);
    app.use('/api/v1/coins/market-data', strictLimiter);
    console.log('🔒 Rate limiting enabled');
} else {
    console.log('⚠️ Rate limiting DISABLED for testing');
}
*/

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// CORS configuration - более гибкие настройки для Railway
const corsOptions = {
    origin: function (origin, callback) {
        // Разрешаем все origins в production (Railway)
        if (NODE_ENV === 'production') {
            callback(null, true);
        } else {
            // В development разрешаем localhost
            const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
            if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'User-Agent'],
    exposedHeaders: ['X-Request-ID', 'X-Response-Time']
};

app.use(cors(corsOptions));

// Health check endpoint с метриками
app.get('/health', healthCheckWithMetrics);

// Admin endpoints для метрик (в продакшене должны быть защищены)
if (process.env.NODE_ENV === 'development') {
    app.get('/admin/metrics', detailedMetrics);
    app.post('/admin/metrics/reset', resetMetrics);
}

// API Routes
app.use('/api/v1', require('./routes'));

// Liquidations Routes
app.use('/api/v1/liquidations', require('./routes/liquidations-routes'));

// 404 handler
app.use(notFoundHandler);

// Error handling middleware
app.use(errorTracker);
app.use(errorLogger);
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
    console.log(`🚀 OmniBoard Backend running on port ${PORT}`);
    console.log(`📊 Environment: ${NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    
    // Логируем переменные окружения для отладки
    console.log('🔧 Environment Variables:');
    console.log(`   DISABLE_RATE_LIMIT: ${process.env.DISABLE_RATE_LIMIT}`);
    console.log(`   CORS_ORIGIN: ${process.env.CORS_ORIGIN}`);
    console.log(`   RATE_LIMIT_MAX_REQUESTS: ${process.env.RATE_LIMIT_MAX_REQUESTS}`);
    
    // Initialize services
    cacheService.init();
    marketService.init();
    
    // Start liquidations service
    const liquidationsService = require('./services/liquidations-service');
    liquidationsService.start().then(() => {
        console.log('✅ Liquidations service started');
    }).catch(error => {
        console.error('❌ Failed to start liquidations service:', error);
    });
    
    console.log('✅ Services initialized successfully');
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
    console.log(`🔄 ${signal} received, shutting down gracefully...`);
    
    // Останавливаем сервер
    server.close(() => {
        console.log('🛑 HTTP server closed');
        
        // Останавливаем сервисы
        cacheService.stop();
        marketService.stop();
        
        // Останавливаем сервис ликвидаций
        const liquidationsService = require('./services/liquidations-service');
        liquidationsService.stop();
        
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
    });
    
    // Принудительное завершение через 30 секунд
    setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;
