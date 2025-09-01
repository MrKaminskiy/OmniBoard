/**
 * Middleware для мониторинга производительности и метрик
 */

// Простой in-memory store для метрик
class MetricsStore {
    constructor() {
        this.metrics = {
            requests: {
                total: 0,
                byMethod: {},
                byEndpoint: {},
                byStatus: {}
            },
            responseTime: {
                total: 0,
                count: 0,
                min: Infinity,
                max: -Infinity,
                byEndpoint: {}
            },
            errors: {
                total: 0,
                byType: {},
                byEndpoint: {}
            },
            activeConnections: 0,
            uptime: Date.now()
        };
        
        this.resetInterval = null;
    }

    // Увеличиваем счетчик запросов
    incrementRequest(method, endpoint, status) {
        this.metrics.requests.total++;
        
        // По методу
        this.metrics.requests.byMethod[method] = (this.metrics.requests.byMethod[method] || 0) + 1;
        
        // По эндпоинту
        this.metrics.requests.byEndpoint[endpoint] = (this.metrics.requests.byEndpoint[endpoint] || 0) + 1;
        
        // По статусу
        this.metrics.requests.byStatus[status] = (this.metrics.requests.byStatus[status] || 0) + 1;
    }

    // Добавляем время ответа
    addResponseTime(endpoint, responseTime) {
        this.metrics.responseTime.total += responseTime;
        this.metrics.responseTime.count++;
        
        if (responseTime < this.metrics.responseTime.min) {
            this.metrics.responseTime.min = responseTime;
        }
        if (responseTime > this.metrics.responseTime.max) {
            this.metrics.responseTime.max = responseTime;
        }
        
        // По эндпоинту
        if (!this.metrics.responseTime.byEndpoint[endpoint]) {
            this.metrics.responseTime.byEndpoint[endpoint] = {
                total: 0,
                count: 0,
                min: Infinity,
                max: -Infinity
            };
        }
        
        const endpointMetrics = this.metrics.responseTime.byEndpoint[endpoint];
        endpointMetrics.total += responseTime;
        endpointMetrics.count++;
        
        if (responseTime < endpointMetrics.min) {
            endpointMetrics.min = responseTime;
        }
        if (responseTime > endpointMetrics.max) {
            endpointMetrics.max = responseTime;
        }
    }

    // Увеличиваем счетчик ошибок
    incrementError(errorType, endpoint) {
        this.metrics.errors.total++;
        
        this.metrics.errors.byType[errorType] = (this.metrics.errors.byType[errorType] || 0) + 1;
        this.metrics.errors.byEndpoint[endpoint] = (this.metrics.errors.byEndpoint[endpoint] || 0) + 1;
    }

    // Устанавливаем количество активных соединений
    setActiveConnections(count) {
        this.metrics.activeConnections = count;
    }

    // Получаем все метрики
    getMetrics() {
        const now = Date.now();
        const uptime = now - this.metrics.uptime;
        
        return {
            ...this.metrics,
            uptime,
            uptimeFormatted: this.formatUptime(uptime),
            averages: this.calculateAverages(uptime),
            timestamp: new Date(now).toISOString()
        };
    }

    // Вычисляем средние значения
    calculateAverages(uptime) {
        const avgResponseTime = this.metrics.responseTime.count > 0 
            ? this.metrics.responseTime.total / this.metrics.responseTime.count 
            : 0;
            
        const avgRequestsPerSecond = uptime > 0 
            ? this.metrics.requests.total / (uptime / 1000) 
            : 0;
            
        return {
            avgResponseTime: Math.round(avgResponseTime * 100) / 100,
            avgRequestsPerSecond: Math.round(avgRequestsPerSecond * 100) / 100
        };
    }

    // Форматируем uptime
    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    // Сбрасываем метрики (каждый час)
    startResetTimer() {
        this.resetInterval = setInterval(() => {
            this.resetMetrics();
        }, 60 * 60 * 1000); // Каждый час
    }

    // Сбрасываем метрики
    resetMetrics() {
        this.metrics = {
            requests: {
                total: 0,
                byMethod: {},
                byEndpoint: {},
                byStatus: {}
            },
            responseTime: {
                total: 0,
                count: 0,
                min: Infinity,
                max: -Infinity,
                byEndpoint: {}
            },
            errors: {
                total: 0,
                byType: {},
                byEndpoint: {}
            },
            activeConnections: this.metrics.activeConnections,
            uptime: this.metrics.uptime
        };
        
        console.log('🔄 Metrics reset');
    }

    // Останавливаем таймер
    stop() {
        if (this.resetInterval) {
            clearInterval(this.resetInterval);
            this.resetInterval = null;
        }
    }
}

// Создаем глобальный экземпляр метрик
const metricsStore = new MetricsStore();

// Middleware для отслеживания запросов
const requestTracker = (req, res, next) => {
    const startTime = Date.now();
    const method = req.method;
    const endpoint = req.path;
    
    // Увеличиваем счетчик активных соединений
    metricsStore.setActiveConnections(metricsStore.metrics.activeConnections + 1);
    
    // Перехватываем отправку ответа для сбора метрик
    const originalSend = res.send;
    res.send = function(data) {
        const responseTime = Date.now() - startTime;
        const status = res.statusCode;
        
        // Собираем метрики
        metricsStore.incrementRequest(method, endpoint, status);
        metricsStore.addResponseTime(endpoint, responseTime);
        
        // Уменьшаем счетчик активных соединений
        metricsStore.setActiveConnections(metricsStore.metrics.activeConnections - 1);
        
        // Добавляем заголовки с метриками
        res.setHeader('X-Response-Time', `${responseTime}ms`);
        res.setHeader('X-Request-ID', req.id || 'unknown');
        
        // Вызываем оригинальный метод
        originalSend.call(this, data);
    };
    
    next();
};

// Middleware для отслеживания ошибок
const errorTracker = (err, req, res, next) => {
    const endpoint = req.path;
    const errorType = err.name || 'UnknownError';
    
    metricsStore.incrementError(errorType, endpoint);
    
    next(err);
};

// Middleware для health check с метриками
const healthCheckWithMetrics = (req, res) => {
    try {
        const metrics = metricsStore.getMetrics();
        
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: metrics.uptimeFormatted || '0s',
            metrics: {
                requests: {
                    total: metrics.requests.total || 0,
                    perSecond: metrics.averages?.avgRequestsPerSecond || 0
                },
                responseTime: {
                    average: metrics.averages?.avgResponseTime || 0,
                    min: metrics.responseTime.min || 0,
                    max: metrics.responseTime.max || 0
                },
                errors: {
                    total: metrics.errors.total || 0
                },
                activeConnections: metrics.activeConnections || 0
            }
        });
    } catch (error) {
        // Fallback если метрики недоступны
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: '0s',
            metrics: {
                requests: { total: 0, perSecond: 0 },
                responseTime: { average: 0, min: 0, max: 0 },
                errors: { total: 0 },
                activeConnections: 0
            }
        });
    }
};

// Middleware для детальных метрик (только для админов)
const detailedMetrics = (req, res) => {
    const metrics = metricsStore.getMetrics();
    
    res.json({
        status: 'ok',
        data: metrics,
        timestamp: new Date().toISOString()
    });
};

// Middleware для сброса метрик (только для админов)
const resetMetrics = (req, res) => {
    metricsStore.resetMetrics();
    
    res.json({
        status: 'ok',
        message: 'Metrics reset successfully',
        timestamp: new Date().toISOString()
    });
};

// Инициализируем таймер сброса
metricsStore.startResetTimer();

module.exports = {
    metricsStore,
    requestTracker,
    errorTracker,
    healthCheckWithMetrics,
    detailedMetrics,
    resetMetrics
};
