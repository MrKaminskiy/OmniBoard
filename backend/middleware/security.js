const helmet = require('helmet');

/**
 * Middleware для безопасности и защиты API
 */

// Настройки Helmet для максимальной безопасности
const helmetConfig = {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    noCache: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
};

// Middleware для защиты от различных атак
const securityMiddleware = [
    // Базовая защита Helmet
    helmet(helmetConfig),
    
    // Дополнительные заголовки безопасности
    (req, res, next) => {
        // Защита от clickjacking
        res.setHeader('X-Frame-Options', 'DENY');
        
        // Защита от MIME type sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff');
        
        // Защита от XSS
        res.setHeader('X-XSS-Protection', '1; mode=block');
        
        // Защита от referrer leakage
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        // Защита от timing attacks
        res.setHeader('X-DNS-Prefetch-Control', 'off');
        
        // Защита от cache poisoning
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
        
        next();
    }
];

// Middleware для валидации Content-Type
const validateContentType = (req, res, next) => {
    // Проверяем только для POST/PUT/PATCH запросов
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const contentType = req.get('Content-Type');
        
        if (!contentType || !contentType.includes('application/json')) {
            return res.status(415).json({
                status: 'error',
                message: 'Unsupported Media Type. Only application/json is supported.',
                timestamp: new Date().toISOString()
            });
        }
    }
    
    next();
};

// Middleware для ограничения размера запроса
const requestSizeLimit = (req, res, next) => {
    const contentLength = parseInt(req.get('Content-Length') || '0');
    const maxSize = 1024 * 1024; // 1MB
    
    if (contentLength > maxSize) {
        return res.status(413).json({
            status: 'error',
            message: 'Request entity too large. Maximum size is 1MB.',
            timestamp: new Date().toISOString()
        });
    }
    
    next();
};

// Middleware для проверки User-Agent
const validateUserAgent = (req, res, next) => {
    const userAgent = req.get('User-Agent');
    
    // Блокируем подозрительные User-Agent
    const blockedPatterns = [
        /bot/i,
        /crawler/i,
        /spider/i,
        /scraper/i,
        /curl/i,
        /wget/i,
        /python/i,
        /java/i,
        /go-http-client/i
    ];
    
    if (userAgent && blockedPatterns.some(pattern => pattern.test(userAgent))) {
        return res.status(403).json({
            status: 'error',
            message: 'Access denied for automated clients.',
            timestamp: new Date().toISOString()
        });
    }
    
    next();
};

// Middleware для защиты от SQL Injection (базовая проверка)
const sqlInjectionProtection = (req, res, next) => {
    const sqlPatterns = [
        /\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b/i,
        /\b(script|javascript|vbscript|onload|onerror|onclick)\b/i,
        /\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\s+/i,
        /\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\s*\(/i,
        /\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\s*=/i
    ];
    
    const checkValue = (value) => {
        if (typeof value === 'string') {
            return sqlPatterns.some(pattern => pattern.test(value));
        }
        if (typeof value === 'object' && value !== null) {
            return Object.values(value).some(checkValue);
        }
        return false;
    };
    
    // Проверяем query параметры
    if (req.query && checkValue(req.query)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid characters detected in request parameters.',
            timestamp: new Date().toISOString()
        });
    }
    
    // Проверяем body
    if (req.body && checkValue(req.body)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid characters detected in request body.',
            timestamp: new Date().toISOString()
        });
    }
    
    next();
};

// Middleware для защиты от NoSQL Injection
const nosqlInjectionProtection = (req, res, next) => {
    const nosqlPatterns = [
        /\$where/i,
        /\$ne/i,
        /\$gt/i,
        /\$lt/i,
        /\$gte/i,
        /\$lte/i,
        /\$in/i,
        /\$nin/i,
        /\$regex/i,
        /\$options/i
    ];
    
    const checkValue = (value) => {
        if (typeof value === 'string') {
            return nosqlPatterns.some(pattern => pattern.test(value));
        }
        if (typeof value === 'object' && value !== null) {
            return Object.keys(value).some(key => 
                nosqlPatterns.some(pattern => pattern.test(key)) ||
                checkValue(value[key])
            );
        }
        return false;
    };
    
    // Проверяем query параметры
    if (req.query && checkValue(req.query)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid query operators detected.',
            timestamp: new Date().toISOString()
        });
    }
    
    // Проверяем body
    if (req.body && checkValue(req.body)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid query operators detected in request body.',
            timestamp: new Date().toISOString()
        });
    }
    
    next();
};

// Middleware для логирования подозрительной активности
const suspiciousActivityLogger = (req, res, next) => {
    const suspiciousIndicators = [];
    
    // Проверяем подозрительные заголовки
    if (req.get('X-Forwarded-For') && !req.get('X-Real-IP')) {
        suspiciousIndicators.push('Missing X-Real-IP header');
    }
    
    // Проверяем подозрительные IP
    const clientIP = req.ip || req.connection.remoteAddress;
    if (clientIP && (clientIP.startsWith('192.168.') || clientIP.startsWith('10.') || clientIP.startsWith('172.'))) {
        suspiciousIndicators.push('Private IP address');
    }
    
    // Проверяем подозрительные User-Agent
    const userAgent = req.get('User-Agent');
    if (userAgent && (userAgent.length < 10 || userAgent.length > 500)) {
        suspiciousIndicators.push('Suspicious User-Agent length');
    }
    
    // Логируем подозрительную активность
    if (suspiciousIndicators.length > 0) {
        console.warn('⚠️ Suspicious activity detected:', {
            timestamp: new Date().toISOString(),
            ip: clientIP,
            userAgent,
            url: req.originalUrl,
            method: req.method,
            indicators: suspiciousIndicators
        });
    }
    
    next();
};

module.exports = {
    securityMiddleware,
    validateContentType,
    requestSizeLimit,
    validateUserAgent,
    sqlInjectionProtection,
    nosqlInjectionProtection,
    suspiciousActivityLogger
};
