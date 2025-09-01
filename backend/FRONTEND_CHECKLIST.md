# 🎯 Frontend Integration Checklist

## ✅ Обязательные требования

### 1. Заголовки
- [ ] **User-Agent** - всегда добавлять в запросы
- [ ] **Content-Type: application/json** - для POST запросов
- [ ] **CORS** - настроен для localhost:3000

### 2. Обработка ошибок
- [ ] **400** - валидация параметров
- [ ] **404** - endpoint не найден  
- [ ] **429** - rate limit превышен
- [ ] **500** - серверная ошибка

### 3. Rate Limiting
- [ ] Проверять заголовки `RateLimit-Remaining`
- [ ] Показывать предупреждения при < 10 запросов
- [ ] Блокировать UI при достижении лимита

## 🔄 Основные endpoints для интеграции

### Market Dashboard
- [ ] `/health` - проверка состояния сервера
- [ ] `/api/v1/market/overview` - общий обзор рынка
- [ ] `/api/v1/market/fear-greed` - индекс страха/жадности
- [ ] `/api/v1/market/altseason` - индекс альтсезона
- [ ] `/api/v1/market/btc-dominance` - доминирование BTC

### Coin Data
- [ ] `/api/v1/coins/list` - список монет
- [ ] `/api/v1/coins/details?symbol=BTC-USDT` - детали монеты
- [ ] `/api/v1/coins/price?symbol=BTC-USDT` - цена монеты

### Trading Signals
- [ ] `/api/v1/webhook/signals` - список сигналов
- [ ] `/api/v1/webhook/signals/stats` - статистика сигналов

## 📊 Форматы данных

### Market Overview
```javascript
{
  market_cap: number,
  market_cap_change_24h: number,
  volume_24h: number,
  volume_change_24h: number,
  active_coins: number,
  gainers_24h: number,
  losers_24h: number
}
```

### Fear & Greed Index
```javascript
{
  value: number,        // 0-100
  status: string        // "Extreme Fear" | "Fear" | "Neutral" | "Greed" | "Extreme Greed"
}
```

### Coin Details
```javascript
{
  ticker: {
    lastPrice: number,
    priceChangePercent: number,
    volume: number,
    highPrice: number,
    lowPrice: number
  },
  orderBook: {
    bids: [string, string][],  // [price, quantity]
    asks: [string, string][]
  },
  klines: {
    openTime: number,
    open: number,
    high: number,
    low: number,
    close: number,
    volume: number
  }[]
}
```

## 🎨 UI Components для реализации

### 1. Market Overview Card
- [ ] Market Cap с изменением за 24ч
- [ ] Volume с изменением за 24ч
- [ ] Количество активных монет
- [ ] Gainers/Losers счетчики

### 2. Fear & Greed Indicator
- [ ] Круговой индикатор (0-100)
- [ ] Цветовая схема по статусу
- [ ] Текстовое описание статуса
- [ ] Торговые рекомендации

### 3. BTC Dominance Chart
- [ ] Круговая диаграмма (BTC/ETH/Others)
- [ ] Прогресс бар для BTC
- [ ] Процентные значения

### 4. Coin Price Display
- [ ] Текущая цена
- [ ] Изменение за 24ч (с цветом)
- [ ] Volume
- [ ] High/Low за 24ч

### 5. Order Book
- [ ] Таблица bids (зеленые)
- [ ] Таблица asks (красные)
- [ ] Суммарные объемы
- [ ] Spread расчет

### 6. Price Chart
- [ ] Candlestick график
- [ ] Volume bars
- [ ] Timeframe selector
- [ ] Zoom/pan controls

### 7. Recent Trades
- [ ] Список последних сделок
- [ ] Цветовая индикация (buy/sell)
- [ ] Время сделки
- [ ] Объем

## 🔧 Технические моменты

### 1. Обновление данных
- [ ] Polling каждые 30-60 секунд для market data
- [ ] Real-time обновления для coin details (при фокусе)
- [ ] WebSocket (будет добавлено позже)

### 2. Кэширование
- [ ] Кэшировать market overview на 30 секунд
- [ ] Кэшировать coin details на 10 секунд
- [ ] Кэшировать fear/greed на 4 часа

### 3. Error Boundaries
- [ ] Fallback UI для ошибок API
- [ ] Retry механизм для временных ошибок
- [ ] Offline режим с кэшированными данными

### 4. Loading States
- [ ] Skeleton loaders для всех компонентов
- [ ] Progress bars для длительных операций
- [ ] Placeholder данные при загрузке

## 📱 Responsive Design

### Mobile (< 768px)
- [ ] Компактные карточки
- [ ] Горизонтальные скроллы для таблиц
- [ ] Touch-friendly controls

### Tablet (768px - 1024px)
- [ ] Адаптивные сетки
- [ ] Оптимизированные таблицы
- [ ] Средние размеры компонентов

### Desktop (> 1024px)
- [ ] Полноразмерные компоненты
- [ ] Sidebar навигация
- [ ] Hover эффекты

## 🎯 Приоритеты разработки

### Phase 1 (MVP)
1. Market Overview Card
2. Fear & Greed Indicator  
3. BTC Dominance Chart
4. Basic Coin List

### Phase 2
1. Coin Details Page
2. Order Book
3. Price Chart
4. Recent Trades

### Phase 3
1. Trading Signals
2. Advanced Filtering
3. User Preferences
4. Notifications

## 🧪 Тестирование

### API Integration
- [ ] Тестировать все endpoints
- [ ] Проверить error handling
- [ ] Тестировать rate limiting
- [ ] Проверить CORS

### UI Components
- [ ] Unit тесты для компонентов
- [ ] Integration тесты для API calls
- [ ] E2E тесты для основных сценариев
- [ ] Accessibility тесты

### Performance
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1

## 📚 Полезные ресурсы

### Charts
- [ ] TradingView Lightweight Charts
- [ ] Chart.js
- [ ] D3.js
- [ ] Recharts

### State Management
- [ ] React Query (для API)
- [ ] Zustand (для UI state)
- [ ] Redux Toolkit (если нужен сложный state)

### UI Libraries
- [ ] Tailwind CSS
- [ ] Material-UI
- [ ] Ant Design
- [ ] Chakra UI

---

**Готово к разработке! 🚀**
