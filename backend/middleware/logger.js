const morgan = require('morgan');

/**
 * Middleware для структурированного логирования
 */

// Кастомный формат для morgan
const morganFormat = (tokens, req, res) => {
    const logData = {
        timestamp: new Date().toISOString(),
        method: tokens.method(req, res),
        url: tokens.url(req, res),
        status: tokens.status(req, res),
        responseTime: tokens['response-time'](req, res),
        contentLength: tokens.res(req, res, 'content-length'),
        userAgent: tokens['user-agent'](req, res),
        ip: req.ip || req.connection.remoteAddress,
        requestId: req.headers['x-request-id'] || 'unknown'
    };

    // Добавляем query параметры для API запросов
    if (req.query && Object.keys(req.query).length > 0) {
        logData.query = req.query;
    }

    // Добавляем body для POST/PUT запросов (только для API)
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.path.startsWith('/api/')) {
        logData.body = req.body;
    }

    return JSON.stringify(logData);
};

// Создаем morgan middleware с кастомным форматом
const morganMiddleware = morgan(morganFormat, {
    stream: {
        write: (message) => {
            try {
                const logData = JSON.parse(message);
                console.log('📝 HTTP Request:', logData);
            } catch (error) {
                console.log('📝 HTTP Request:', message.trim());
            }
        }
    }
});

// Middleware для добавления request ID
const requestIdMiddleware = (req, res, next) => {
    req.id = req.headers['x-request-id'] || 
             req.headers['x-correlation-id'] || 
             `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    res.setHeader('X-Request-ID', req.id);
    next();
};

// Middleware для логирования ошибок
const errorLogger = (err, req, res, next) => {
    const errorLog = {
        timestamp: new Date().toISOString(),
        requestId: req.id || 'unknown',
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        error: {
            message: err.message,
            stack: err.stack,
            statusCode: err.statusCode || 500,
            name: err.name
        },
        request: {
            query: req.query,
            body: req.body,
            headers: {
                'content-type': req.get('Content-Type'),
                'authorization': req.get('Authorization') ? '[REDACTED]' : undefined,
                'user-agent': req.get('User-Agent')
            }
        }
    };

    console.error('❌ Error Log:', errorLog);
    next(err);
};

// Middleware для логирования успешных ответов
const successLogger = (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
        // Логируем только успешные API ответы
        if (res.statusCode >= 200 && res.statusCode < 300 && req.path.startsWith('/api/')) {
            const responseLog = {
                timestamp: new Date().toISOString(),
                requestId: req.id || 'unknown',
                method: req.method,
                url: req.originalUrl,
                statusCode: res.statusCode,
                responseTime: Date.now() - req._startTime,
                responseSize: data ? data.length : 0
            };

            console.log('✅ Success Response:', responseLog);
        }
        
        originalSend.call(this, data);
    };

    req._startTime = Date.now();
    next();
};

// Функция для логирования бизнес-логики
const logBusinessEvent = (event, data = {}) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        event,
        data,
        level: 'info'
    };
    
    console.log('📊 Business Event:', logEntry);
};

// Функция для логирования ошибок бизнес-логики
const logBusinessError = (event, error, data = {}) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        event,
        error: {
            message: error.message,
            stack: error.stack,
            name: error.name
        },
        data,
        level: 'error'
    };
    
    console.error('❌ Business Error:', logEntry);
};

// Функция для логирования производительности
const logPerformance = (operation, duration, metadata = {}) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        operation,
        duration,
        metadata,
        level: 'performance'
    };
    
    console.log('⚡ Performance:', logEntry);
};

module.exports = {
    morganMiddleware,
    requestIdMiddleware,
    errorLogger,
    successLogger,
    logBusinessEvent,
    logBusinessError,
    logPerformance
};
