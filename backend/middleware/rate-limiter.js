const rateLimit = require('express-rate-limit');

/**
 * Rate limiter middleware для защиты API от злоупотреблений
 */
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            status: 'error',
            message: 'Too many requests from this IP, please try again later.',
            timestamp: new Date().toISOString()
        },
        standardHeaders: true,
        legacyHeaders: false,
        // Счетчик для каждого IP
        keyGenerator: (req) => {
            return req.ip || req.connection.remoteAddress || 'unknown';
        },
        // Пропускаем health check
        skip: (req) => req.path === '/health',
        // Добавляем заголовки с информацией о лимитах
        handler: (req, res) => {
            res.setHeader('X-RateLimit-Limit', max);
            res.setHeader('X-RateLimit-Remaining', 0);
            res.setHeader('X-RateLimit-Reset', new Date(Date.now() + windowMs).toISOString());
            
            res.status(429).json({
                status: 'error',
                message: 'Too many requests from this IP, please try again later.',
                timestamp: new Date().toISOString(),
                retryAfter: Math.ceil(windowMs / 1000)
            });
        }
    });
};

// Разные лимиты для разных эндпоинтов
const apiLimiter = createRateLimiter(
    parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 минут
    parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 500 // Увеличиваем до 500 запросов
);

const strictLimiter = createRateLimiter(5 * 60 * 1000, 100); // 5 минут, 100 запросов
const authLimiter = createRateLimiter(15 * 60 * 1000, 20); // 15 минут, 20 попыток

module.exports = {
    apiLimiter,
    strictLimiter,
    authLimiter,
    createRateLimiter
};
