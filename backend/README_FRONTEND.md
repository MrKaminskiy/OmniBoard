# 🚀 OmniBoard Backend - Frontend Integration Guide

## 📚 Документация

### 1. [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Полная документация API
- Все endpoints с примерами
- Форматы данных
- Обработка ошибок
- Rate limiting
- Безопасность

### 2. [FRONTEND_CHECKLIST.md](./FRONTEND_CHECKLIST.md) - Чек-лист для разработки
- Обязательные требования
- UI компоненты для реализации
- Приоритеты разработки
- Тестирование

### 3. [FRONTEND_EXAMPLES.md](./FRONTEND_EXAMPLES.md) - Готовые примеры кода
- React Hooks для API
- UI компоненты
- Utility функции
- Responsive design helpers

## 🎯 Быстрый старт

### 1. Проверьте API
```bash
# Health check
curl -H "User-Agent: Mozilla/5.0" http://localhost:3001/health

# Market overview
curl -H "User-Agent: Mozilla/5.0" http://localhost:3001/api/v1/market/overview
```

### 2. Основные endpoints для начала
- `/health` - состояние сервера
- `/api/v1/market/overview` - обзор рынка
- `/api/v1/market/fear-greed` - индекс страха/жадности
- `/api/v1/market/btc-dominance` - доминирование BTC
- `/api/v1/coins/details?symbol=BTC-USDT` - детали монеты

### 3. Обязательные заголовки
```javascript
{
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  "Content-Type": "application/json" // для POST
}
```

## ⚠️ Важные моменты

### Rate Limiting
- **API endpoints**: 100 запросов / 15 минут
- **Строгие endpoints**: 20 запросов / 5 минут
- Проверяйте заголовки `RateLimit-Remaining`

### Обработка ошибок
- **400**: Валидация параметров
- **404**: Endpoint не найден
- **429**: Rate limit превышен
- **500**: Серверная ошибка

### CORS
- Настроен для `http://localhost:3000`
- Credentials: `true`

## 🔄 Обновление данных

- **Market Data**: каждые 30-60 секунд
- **Fear & Greed**: каждые 4 часа
- **BTC Dominance**: каждый час
- **Coin Prices**: real-time при запросе

## 🎨 Рекомендуемые UI компоненты

1. **Market Overview Card** - общая статистика рынка
2. **Fear & Greed Indicator** - круговой индикатор с торговыми советами
3. **BTC Dominance Chart** - круговая диаграмма + прогресс бар
4. **Coin Price Display** - цена с изменением и метриками
5. **Order Book** - таблица bids/asks
6. **Price Chart** - candlestick график
7. **Recent Trades** - последние сделки

## 🛠️ Технический стек

### Рекомендуемые библиотеки
- **Charts**: TradingView Lightweight Charts, Chart.js
- **State Management**: React Query, Zustand
- **UI**: Tailwind CSS, Material-UI, Ant Design
- **Testing**: Jest, React Testing Library

### Готовые Hooks
- `useApiData` - базовый API hook
- `useRealTimeData` - real-time обновления
- `useCachedApiData` - кэширование данных

## 📱 Responsive Design

- **Mobile** (< 768px): компактные карточки
- **Tablet** (768px - 1024px): адаптивные сетки
- **Desktop** (> 1024px): полноразмерные компоненты

## 🧪 Тестирование

### API Integration
```bash
npm test  # Запуск всех тестов
npm run test:watch  # Watch режим
npm run test:coverage  # Покрытие кода
```

### Performance
- Lighthouse score > 90
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s

## 🚀 Deployment

### Railway
- Автоматический деплой при push в GitHub
- Environment variables настраиваются в Railway dashboard
- Health check: `/health`

### Локально
```bash
cd backend
npm install
npm run dev  # http://localhost:3001
```

## 📞 Поддержка

При проблемах:
1. Проверьте `/health` endpoint
2. Посмотрите логи сервера
3. Проверьте rate limiting заголовки
4. Убедитесь в правильности User-Agent

## 🔮 Будущие возможности

1. **WebSocket** для real-time обновлений
2. **JWT Authentication** для пользователей
3. **Database Integration** (MongoDB/PostgreSQL)
4. **Telegram Bot** для уведомлений
5. **CoinGlass Integration** для liquidations

---

**Готово к разработке! 🚀**

Начните с [FRONTEND_CHECKLIST.md](./FRONTEND_CHECKLIST.md) для понимания требований, затем используйте [FRONTEND_EXAMPLES.md](./FRONTEND_EXAMPLES.md) для готовых компонентов.
