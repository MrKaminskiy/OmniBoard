# OmniBoard Backend

🚀 Производительный бэкенд для криптовалютного дашборда с интеграцией BingX, CoinGecko и TradingView webhook'ов.

## ✨ Возможности

- **📊 Рыночные данные**: Real-time цены, market cap, volume
- **🔔 TradingView сигналы**: Webhook интеграция для CRITICAL SHORTS и FEAR ZONE
- **📈 Метрики рынка**: Fear & Greed Index, Altseason Index, BTC/ETH dominance
- **🛡️ Безопасность**: Rate limiting, валидация, защита от атак
- **📊 Мониторинг**: Метрики производительности, логирование
- **🚀 Готов к продакшену**: Railway deployment, Docker support

## 🏗️ Архитектура

```
backend/
├── middleware/          # Middleware для безопасности, логирования, валидации
├── routes/             # API роуты
├── services/           # Бизнес-логика и интеграции
├── tests/              # Тесты
├── server.js           # Основной сервер
├── package.json        # Зависимости
└── Dockerfile          # Docker контейнер
```

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+
- npm или pnpm
- API ключи для BingX (опционально)

### Установка

```bash
# Клонируйте репозиторий
git clone <repository-url>
cd OmniBoardFront/backend

# Установите зависимости
npm install

# Скопируйте переменные окружения
cp .env.example .env

# Отредактируйте .env файл
nano .env
```

### Переменные окружения

Создайте `.env` файл на основе `.env.example`:

```bash
# BingX API Configuration
BINGX_API_KEY=your_bingx_api_key_here
BINGX_SECRET_KEY=your_bingx_secret_key_here
BINGX_BASE_URL=https://open-api.bingx.com

# TradingView Webhook Configuration
TRADINGVIEW_WEBHOOK_SECRET=your_webhook_secret_here

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Market Data Update Interval (in milliseconds)
MARKET_UPDATE_INTERVAL=60000
```

### Запуск

```bash
# Development режим
npm run dev

# Production режим
npm start

# Тестирование
npm test
npm run test:coverage
```

## 📊 API Endpoints

### Market Data
- `GET /api/v1/market/overview` - Обзор рынка
- `GET /api/v1/market/top-gainers` - Топ растущих монет
- `GET /api/v1/market/top-losers` - Топ падающих монет
- `GET /api/v1/market/fear-greed` - Fear & Greed Index
- `GET /api/v1/market/altseason` - Altseason Index
- `GET /api/v1/market/btc-dominance` - BTC/ETH dominance

### Coins
- `GET /api/v1/coins/list` - Список монет
- `GET /api/v1/coins/details` - Детали монеты
- `GET /api/v1/coins/price` - Цена монеты
- `GET /api/v1/coins/market-data` - Рыночные данные

### Webhooks
- `POST /api/v1/webhook/tradingview` - TradingView сигналы
- `GET /api/v1/webhook/signals` - Список сигналов
- `GET /api/v1/webhook/signals/stats` - Статистика сигналов

### Health & Monitoring
- `GET /health` - Состояние сервера
- `GET /admin/metrics` - Метрики (development)

## 🔧 Разработка

### Структура проекта

```
backend/
├── middleware/
│   ├── error-handler.js      # Обработка ошибок
│   ├── logger.js             # Логирование
│   ├── monitoring.js         # Мониторинг и метрики
│   ├── rate-limiter.js       # Rate limiting
│   ├── security.js           # Безопасность
│   └── validation.js         # Валидация данных
├── routes/
│   ├── index.js              # Основной роутер
│   ├── market-routes.js      # Рыночные данные
│   ├── coins-routes.js       # Данные монет
│   ├── derivatives-routes.js # Деривативы
│   └── webhook-routes.js     # Webhook'и
├── services/
│   ├── bingx-service.js      # BingX API интеграция
│   ├── coingecko-service.js  # CoinGecko API интеграция
│   ├── market-service.js     # Агрегация рыночных данных
│   ├── cache-service.js      # Кэширование
│   └── tradingview-webhook-service.js # TradingView webhook
└── tests/
    └── basic.test.js         # Базовые тесты
```

### Добавление новых эндпоинтов

1. Создайте роут в `routes/`
2. Добавьте валидацию в `middleware/validation.js`
3. Создайте сервис в `services/` если нужно
4. Добавьте тесты в `tests/`
5. Обновите документацию

### Логирование

```javascript
const { logBusinessEvent, logBusinessError } = require('../middleware/logger');

// Логирование событий
logBusinessEvent('user_action', { userId: 123, action: 'login' });

// Логирование ошибок
logBusinessError('api_error', error, { endpoint: '/api/users' });
```

### Валидация

```javascript
const { simpleValidators } = require('../middleware/validation');

router.get('/endpoint', 
    simpleValidators.validateLimit,
    simpleValidators.validateSymbol,
    async (req, res) => {
        // Ваш код
    }
);
```

## 🧪 Тестирование

### Запуск тестов

```bash
# Все тесты
npm test

# Тесты в watch режиме
npm run test:watch

# Тесты с покрытием
npm run test:coverage

# Конкретный тест
npm test -- --testNamePattern="Market Endpoints"
```

### Структура тестов

```javascript
describe('Feature', () => {
    it('should do something', async () => {
        // Arrange
        const input = 'test';
        
        // Act
        const result = await function(input);
        
        // Assert
        expect(result).toBe('expected');
    });
});
```

## 🚀 Развертывание

### Railway (рекомендуется)

1. Подключите GitHub репозиторий к Railway
2. Настройте переменные окружения в Railway dashboard
3. Автоматическое развертывание при push в main ветку

### Docker

```bash
# Сборка образа
docker build -t omniboard-backend .

# Запуск контейнера
docker run -p 3001:3001 --env-file .env omniboard-backend
```

### Локальное развертывание

```bash
# Установка зависимостей
npm ci --only=production

# Запуск
NODE_ENV=production npm start
```

## 📊 Мониторинг

### Health Check

```bash
curl https://your-domain.railway.app/health
```

### Метрики

```bash
# Development режим
curl https://your-domain.railway.app/admin/metrics
```

### Логи

Логи доступны в Railway dashboard или локально в консоли.

## 🔒 Безопасность

### Rate Limiting

- **API**: 100 запросов в 15 минут
- **Строгий**: 20 запросов в 5 минут
- **Webhook**: 5 запросов в 15 минут

### Защита от атак

- SQL Injection protection
- NoSQL Injection protection
- XSS protection
- CSRF protection
- Request size limiting
- Suspicious activity logging

### Заголовки безопасности

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## 📈 Производительность

### Кэширование

- In-memory кэш с TTL
- Автоматическая очистка устаревших данных
- Кэширование API ответов

### Оптимизация

- Сжатие ответов (gzip)
- Rate limiting для защиты от злоупотреблений
- Параллельные запросы к API
- Graceful shutdown

## 🔮 Планы развития

- [ ] Аутентификация пользователей (JWT)
- [ ] База данных (MongoDB/PostgreSQL)
- [ ] WebSocket для real-time обновлений
- [ ] Интеграция с CoinGlass
- [ ] Telegram bot для уведомлений
- [ ] Дополнительные биржи
- [ ] Исторические данные
- [ ] Аналитика и отчеты
- [ ] GraphQL API
- [ ] Микросервисная архитектура

## 🐛 Troubleshooting

### Частые проблемы

1. **API ключи не работают**
   - Проверьте правильность ключей в `.env`
   - Убедитесь в правах доступа к API

2. **Rate limiting**
   - Проверьте заголовки `X-RateLimit-*`
   - Увеличьте интервалы между запросами

3. **Ошибки валидации**
   - Проверьте формат параметров
   - Убедитесь в обязательных полях

4. **Проблемы с кэшем**
   - Очистите кэш через `/admin/metrics/reset`
   - Проверьте TTL настройки

### Логи

```bash
# Локально
npm run dev

# В Railway
# Проверьте логи в dashboard
```

## 📞 Поддержка

- **Issues**: Создайте issue в GitHub
- **Discussions**: Используйте GitHub Discussions
- **Documentation**: [API Documentation](./API_DOCUMENTATION.md)

## 📄 Лицензия

MIT License - см. [LICENSE](../LICENSE) файл.

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature ветку (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

### Стандарты кода

- ESLint + Prettier
- Jest для тестирования
- Conventional Commits
- TypeScript (планируется)

---

**OmniBoard Backend** - мощный и безопасный бэкенд для криптовалютных приложений 🚀
