const request = require('supertest');
const app = require('../server');

describe('OmniBoard API Basic Tests', () => {
    describe('Health Check', () => {
        it('should return health status with metrics', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'ok');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('uptime');
            expect(response.body).toHaveProperty('metrics');
        });
    });

    describe('API Info', () => {
        it('should return API information', async () => {
            const response = await request(app)
                .get('/api/v1')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'ok');
            expect(response.body).toHaveProperty('message', 'OmniBoard API v1');
            expect(response.body).toHaveProperty('version', '1.0.0');
            expect(response.body).toHaveProperty('endpoints');
            expect(response.body).toHaveProperty('features');
        });
    });

    describe('Market Endpoints', () => {
        it('should return market overview', async () => {
            const response = await request(app)
                .get('/api/v1/market/overview')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'ok');
            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('timestamp');
        });

        it('should return top gainers with limit', async () => {
            const response = await request(app)
                .get('/api/v1/market/top-gainers?limit=5')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'ok');
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('coins');
        });

        it('should return fear and greed index', async () => {
            const response = await request(app)
                .get('/api/v1/market/fear-greed')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'ok');
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('value');
            expect(response.body.data).toHaveProperty('status');
        });

        it('should return altseason index', async () => {
            const response = await request(app)
                .get('/api/v1/market/altseason')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'ok');
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('value');
            expect(response.body.data).toHaveProperty('status');
        });

        it('should return BTC dominance', async () => {
            const response = await request(app)
                .get('/api/v1/market/btc-dominance')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'ok');
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('value');
            expect(response.body.data).toHaveProperty('eth');
        });
    });

    describe('Coins Endpoints', () => {
        it('should return coins list with pagination', async () => {
            const response = await request(app)
                .get('/api/v1/coins/list?limit=10&offset=0')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'ok');
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('coins');
        });

        it('should return coin details with valid symbol', async () => {
            const response = await request(app)
                .get('/api/v1/coins/details?symbol=BTC-USDT')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'ok');
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('symbol', 'BTC-USDT');
        });

        it('should return error for missing symbol', async () => {
            const response = await request(app)
                .get('/api/v1/coins/details')
                .expect(400);

            expect(response.body).toHaveProperty('status', 'error');
            expect(response.body).toHaveProperty('message');
        });

        it('should return coin price', async () => {
            const response = await request(app)
                .get('/api/v1/coins/price?symbol=BTC-USDT')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'ok');
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('symbol');
            expect(response.body.data).toHaveProperty('price');
        });
    });

    describe('Webhook Endpoints', () => {
        it('should return webhook service info', async () => {
            const response = await request(app)
                .get('/api/v1/webhook/service-info')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'ok');
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('name');
            expect(response.body.data).toHaveProperty('status');
        });

        it('should return signals list', async () => {
            const response = await request(app)
                .get('/api/v1/webhook/signals?limit=10')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'ok');
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('signals');
        });

        it('should return signals stats', async () => {
            const response = await request(app)
                .get('/api/v1/webhook/signals/stats')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'ok');
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('total');
        });

        it('should return test webhook response', async () => {
            const response = await request(app)
                .post('/api/v1/webhook/test')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'ok');
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('data');
        });
    });

    describe('Error Handling', () => {
        it('should return 404 for non-existent endpoint', async () => {
            const response = await request(app)
                .get('/api/v1/non-existent')
                .expect(404);

            expect(response.body).toHaveProperty('status', 'error');
            expect(response.body).toHaveProperty('message');
        });

        it('should return 400 for invalid limit parameter', async () => {
            const response = await request(app)
                .get('/api/v1/market/top-gainers?limit=invalid')
                .expect(400);

            expect(response.body).toHaveProperty('status', 'error');
            expect(response.body).toHaveProperty('message');
        });

        it('should return 400 for invalid symbol format', async () => {
            const response = await request(app)
                .get('/api/v1/coins/details?symbol=invalid-symbol')
                .expect(400);

            expect(response.body).toHaveProperty('status', 'error');
            expect(response.body).toHaveProperty('message');
        });
    });

    describe('Rate Limiting', () => {
        it('should include rate limit headers', async () => {
            const response = await request(app)
                .get('/api/v1/market/overview')
                .expect(200);

            expect(response.headers).toHaveProperty('ratelimit-limit');
            expect(response.headers).toHaveProperty('ratelimit-remaining');
        });
    });

    describe('Security Headers', () => {
        it('should include security headers', async () => {
            const response = await request(app)
                .get('/api/v1/market/overview')
                .expect(200);

            expect(response.headers).toHaveProperty('x-frame-options');
            expect(response.headers).toHaveProperty('x-content-type-options');
            expect(response.headers).toHaveProperty('x-xss-protection');
        });
    });
});
