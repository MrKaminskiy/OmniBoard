# 🚀 OmniBoard - Crypto Market Dashboard

**OmniBoard** - это современная платформа для мониторинга криптовалютного рынка с real-time данными, торговыми сигналами и аналитическими инструментами.

## 🌟 Особенности

- 📊 **Real-time Market Data** - актуальные цены, объемы, market cap
- 😱 **Fear & Greed Index** - индекс страха и жадности рынка
- 📈 **BTC Dominance** - доминирование Bitcoin и альткоинов
- 🔔 **Trading Signals** - сигналы от TradingView
- 📱 **Responsive Design** - адаптивный интерфейс для всех устройств
- 🚀 **High Performance** - оптимизированная производительность

## 🏗️ Архитектура

Проект построен на современном стеке технологий:

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express.js + MongoDB (планируется)
- **Real-time**: WebSocket (планируется)
- **Deployment**: Railway + Docker

## 📁 Структура проекта

```
OmniBoard/
├── backend/          # Backend API (Node.js + Express)
├── core/             # Core business logic
├── docs/             # Документация
├── preview/          # Preview компоненты
├── shared/           # Общие утилиты и типы
└── src/              # Frontend приложение
```

## 🚀 Быстрый старт

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend будет доступен по адресу: http://localhost:3001

### Frontend

```bash
npm install
npm run dev
```

Frontend будет доступен по адресу: http://localhost:3000

## 📚 Документация

### Backend API
- [API Documentation](./backend/API_DOCUMENTATION.md) - Полная документация API
- [Frontend Integration Guide](./backend/README_FRONTEND.md) - Руководство по интеграции
- [Frontend Checklist](./backend/FRONTEND_CHECKLIST.md) - Чек-лист для разработки
- [Frontend Examples](./backend/FRONTEND_EXAMPLES.md) - Готовые примеры кода

### Deployment
- [Railway Deployment](./backend/RAILWAY_DEPLOY.md) - Инструкции по деплою на Railway

## 🔧 API Endpoints

### Market Data
- `GET /api/v1/market/overview` - Обзор рынка
- `GET /api/v1/market/fear-greed` - Fear & Greed Index
- `GET /api/v1/market/altseason` - Altseason Index
- `GET /api/v1/market/btc-dominance` - BTC Dominance

### Coins
- `GET /api/v1/coins/list` - Список монет
- `GET /api/v1/coins/details` - Детали монеты
- `GET /api/v1/coins/price` - Цена монеты

### Trading Signals
- `GET /api/v1/webhook/signals` - Список сигналов
- `POST /api/v1/webhook/tradingview` - Webhook от TradingView

### Health & Monitoring
- `GET /health` - Health check
- `GET /admin/metrics` - Метрики (dev only)

## 🛡️ Безопасность

- Rate limiting (100 req/15min, 20 req/5min для строгих endpoints)
- Security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- CORS protection
- Input validation
- SQL/NoSQL injection protection

## 🧪 Тестирование

```bash
# Backend tests
cd backend
npm test
npm run test:coverage

# Frontend tests
npm test
npm run test:coverage
```

## 🚀 Deployment

### Railway (Автоматический)
1. Push в GitHub репозиторий
2. Railway автоматически деплоит изменения
3. Environment variables настраиваются в Railway dashboard

### Локально
```bash
# Backend
cd backend
docker build -t omniboard-backend .
docker run -p 3001:3001 omniboard-backend

# Frontend
npm run build
npm run start
```

## 📊 Мониторинг

- **Health Check**: `/health`
- **Metrics**: `/admin/metrics` (dev only)
- **Logs**: Структурированное логирование
- **Performance**: Response time tracking

## 🔮 Roadmap

### Phase 1 (Текущая)
- ✅ Backend API с базовыми endpoints
- ✅ Market data integration
- ✅ Security middleware
- ✅ Monitoring и logging

### Phase 2 (Планируется)
- 🔄 WebSocket для real-time обновлений
- 🔄 JWT Authentication
- 🔄 Database integration (MongoDB)
- 🔄 Telegram bot notifications

### Phase 3 (Будущее)
- 🔄 CoinGlass integration для liquidations
- 🔄 Advanced analytics
- 🔄 User preferences
- 🔄 Mobile app

## 🤝 Contributing

1. Fork репозиторий
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 License

Этот проект лицензирован под MIT License - см. [LICENSE](LICENSE) файл для деталей.

## 📞 Поддержка

При возникновении проблем:
1. Проверьте [документацию](./backend/README_FRONTEND.md)
2. Откройте Issue в GitHub
3. Проверьте [Railway deployment guide](./backend/RAILWAY_DEPLOY.md)

---

**OmniBoard** - Ваш надежный помощник в мире криптовалют! 🚀📈

