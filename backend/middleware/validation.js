const { ValidationError } = require('./error-handler');

/**
 * Middleware для валидации входящих данных
 */

// Валидация query параметров
const validateQuery = (schema) => {
    return (req, res, next) => {
        try {
            const { error, value } = schema.validate(req.query);
            if (error) {
                throw new ValidationError('Invalid query parameters', error.details);
            }
            req.query = value;
            next();
        } catch (err) {
            next(err);
        }
    };
};

// Валидация body параметров
const validateBody = (schema) => {
    return (req, res, next) => {
        try {
            const { error, value } = schema.validate(req.body);
            if (error) {
                throw new ValidationError('Invalid request body', error.details);
            }
            req.body = value;
            next();
        } catch (err) {
            next(err);
        }
    };
};

// Валидация params
const validateParams = (schema) => {
    return (req, res, next) => {
        try {
            const { error, value } = schema.validate(req.params);
            if (error) {
                throw new ValidationError('Invalid path parameters', error.details);
            }
            req.params = value;
            next();
        } catch (err) {
            next(err);
        }
    };
};

// Простые валидаторы без Joi
const simpleValidators = {
    // Валидация символа криптовалюты
    validateSymbol: (req, res, next) => {
        const { symbol } = req.query;
        if (!symbol || typeof symbol !== 'string') {
            return next(new ValidationError('Symbol parameter is required and must be a string'));
        }
        
        // Проверяем формат символа (например, BTC-USDT)
        const symbolRegex = /^[A-Z0-9]+-[A-Z0-9]+$/;
        if (!symbolRegex.test(symbol)) {
            return next(new ValidationError('Invalid symbol format. Expected format: BASE-QUOTE (e.g., BTC-USDT)'));
        }
        
        next();
    },

    // Валидация лимита
    validateLimit: (req, res, next) => {
        const { limit } = req.query;
        if (limit) {
            const limitNum = parseInt(limit);
            if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
                return next(new ValidationError('Limit must be a number between 1 and 1000'));
            }
            req.query.limit = limitNum;
        }
        next();
    },

    // Валидация offset
    validateOffset: (req, res, next) => {
        const { offset } = req.query;
        if (offset) {
            const offsetNum = parseInt(offset);
            if (isNaN(offsetNum) || offsetNum < 0) {
                return next(new ValidationError('Offset must be a non-negative number'));
            }
            req.query.offset = offsetNum;
        }
        next();
    },

    // Валидация интервала для свечей
    validateInterval: (req, res, next) => {
        const { interval } = req.query;
        if (interval) {
            const validIntervals = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'];
            if (!validIntervals.includes(interval)) {
                return next(new ValidationError(`Invalid interval. Valid intervals: ${validIntervals.join(', ')}`));
            }
        }
        next();
    },

    // Валидация временного диапазона
    validateTimeRange: (req, res, next) => {
        const { startTime, endTime } = req.query;
        
        if (startTime) {
            const startTimestamp = parseInt(startTime);
            if (isNaN(startTimestamp) || startTimestamp < 0) {
                return next(new ValidationError('Start time must be a valid timestamp'));
            }
        }
        
        if (endTime) {
            const endTimestamp = parseInt(endTime);
            if (isNaN(endTimestamp) || endTimestamp < 0) {
                return next(new ValidationError('End time must be a valid timestamp'));
            }
        }
        
        if (startTime && endTime) {
            const start = parseInt(startTime);
            const end = parseInt(endTime);
            if (start >= end) {
                return next(new ValidationError('Start time must be before end time'));
            }
        }
        
        next();
    }
};

module.exports = {
    validateQuery,
    validateBody,
    validateParams,
    simpleValidators
};
