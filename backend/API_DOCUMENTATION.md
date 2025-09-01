# 🚀 OmniBoard Backend API Documentation

## 📋 Общая информация

**Base URL:** `http://localhost:3001` (локально) / `https://your-railway-app.railway.app` (продакшен)  
**API Version:** v1  
**Content-Type:** `application/json`  
**Authentication:** Пока не требуется (будет добавлено позже)

## 🔐 Заголовки

### Обязательные заголовки
```javascript
{
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  "Content-Type": "application/json" // для POST запросов
}
```

### CORS
- **Origin:** `http://localhost:3000` (локально) / ваш домен (продакшен)
- **Credentials:** `true`

## 📊 Endpoints

### 1. Health Check

**GET** `/health`

Проверка состояния сервера и базовых метрик.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-09-01T12:41:15.671Z",
  "uptime": "12s",
  "metrics": {
    "requests": {
      "total": 0,
      "perSecond": 0
    },
    "responseTime": {
      "average": 0,
      "min": null,
      "max": null
    },
    "errors": {
      "total": 0
    },
    "activeConnections": 1
  }
}
```

**Использование на фронте:**
```javascript
// Проверка состояния сервера
const checkHealth = async () => {
  try {
    const response = await fetch('/health');
    const data = await response.json();
    
    if (data.status === 'ok') {
      console.log('Сервер работает, uptime:', data.uptime);
      console.log('Активные соединения:', data.metrics.activeConnections);
    }
  } catch (error) {
    console.error('Сервер недоступен:', error);
  }
};
```

---

### 2. API Information

**GET** `/api/v1`

Получение информации об API и доступных endpoints.

**Response:**
```json
{
  "status": "ok",
  "message": "OmniBoard API v1",
  "version": "1.0.0",
  "timestamp": "2025-09-01T12:41:20.220Z",
  "endpoints": {
    "market": "/api/v1/market",
    "coins": "/api/v1/coins",
    "derivatives": "/api/v1/derivatives",
    "webhook": "/api/v1/webhook"
  },
  "features": {
    "market_data": "Real-time market data from BingX and CoinGecko",
    "trading_signals": "TradingView webhook integration",
    "market_metrics": "Fear & Greed, Altseason, Dominance indices",
    "price_tracking": "Live price updates every 30-60 seconds"
  }
}
```

**Использование на фронте:**
```javascript
// Получение информации об API
const getApiInfo = async () => {
  const response = await fetch('/api/v1');
  const data = await response.json();
  
  console.log('Доступные endpoints:', data.endpoints);
  console.log('Функции:', data.features);
};
```

---

### 3. Market Data

#### 3.1 Market Overview

**GET** `/api/v1/market/overview`

Общий обзор рынка с агрегированными данными.

**Response:**
```json
{
  "status": "ok",
  "data": {
    "market_cap": 0,
    "market_cap_change_24h": 0,
    "market_cap_progress": 0,
    "volume_24h": 0,
    "volume_change_24h": 0,
    "volume_progress": 0,
    "active_coins": 0,
    "gainers_24h": 0,
    "losers_24h": 0,
    "last_update": "2025-09-01T12:41:07.162Z",
    "data_sources": []
  },
  "timestamp": "2025-09-01T12:42:24.149Z"
}
```

**Использование на фронте:**
```javascript
// Получение обзора рынка
const getMarketOverview = async () => {
  const response = await fetch('/api/v1/market/overview');
  const data = await response.json();
  
  if (data.status === 'ok') {
    const marketData = data.data;
    
    // Обновление UI
    updateMarketCap(marketData.market_cap, marketData.market_cap_change_24h);
    updateVolume(marketData.volume_24h, marketData.volume_change_24h);
    updateStats(marketData.active_coins, marketData.gainers_24h, marketData.losers_24h);
  }
};
```

#### 3.2 Fear & Greed Index

**GET** `/api/v1/market/fear-greed`

Индекс страха и жадности рынка.

**Response:**
```json
{
  "status": "ok",
  "data": {
    "value": 50,
    "status": "Neutral",
    "last_updated": "2025-09-01T12:41:07.162Z"
  },
  "timestamp": "2025-09-01T12:41:28.683Z"
}
```

**Возможные статусы:**
- `Extreme Fear` (0-25)
- `Fear` (26-45)
- `Neutral` (46-55)
- `Greed` (56-75)
- `Extreme Greed` (76-100)

**Использование на фронте:**
```javascript
// Получение индекса страха и жадности
const getFearGreedIndex = async () => {
  const response = await fetch('/api/v1/market/fear-greed');
  const data = await response.json();
  
  if (data.status === 'ok') {
    const { value, status } = data.data;
    
    // Обновление UI с цветовой индикацией
    updateFearGreedIndicator(value, status);
    
    // Логика для торговых решений
    if (status === 'Extreme Fear') {
      showBuySignal('Возможность покупки на дне');
    } else if (status === 'Extreme Greed') {
      showSellSignal('Возможность продажи на пике');
    }
  }
};
```

#### 3.3 Altseason Index

**GET** `/api/v1/market/altseason`

Индекс альтсезона (соотношение BTC vs альткоины).

**Response:**
```json
{
  "status": "ok",
  "data": {
    "value": 55,
    "status": "Neutral",
    "last_updated": "2025-09-01T12:43:59.210Z"
  },
  "timestamp": "2025-09-01T12:43:59.210Z"
}
```

**Интерпретация:**
- `0-25`: Bitcoin Season (BTC доминирует)
- `26-45`: Bitcoin Season (BTC силен)
- `46-55`: Neutral (нейтральный период)
- `56-75`: Altcoin Season (альткоины растут)
- `76-100`: Altcoin Season (альткоины доминируют)

#### 3.4 BTC Dominance

**GET** `/api/v1/market/btc-dominance`

Доминирование Bitcoin на рынке.

**Response:**
```json
{
  "status": "ok",
  "data": {
    "value": 56.21486017723593,
    "eth": 13.766808292434742,
    "progress": 56.21486017723593
  },
  "timestamp": "2025-09-01T12:41:32.740Z"
}
```

**Использование на фронте:**
```javascript
// Получение доминирования BTC
const getBTCDominance = async () => {
  const response = await fetch('/api/v1/market/btc-dominance');
  const data = await response.json();
  
  if (data.status === 'ok') {
    const { value, eth, progress } = data.data;
    
    // Обновление круговой диаграммы
    updateDominanceChart({
      BTC: value,
      ETH: eth,
      Others: 100 - value - eth
    });
    
    // Прогресс бар
    updateProgressBar(progress);
  }
};
```

#### 3.5 Top Gainers

**GET** `/api/v1/market/top-gainers?limit=10`

Топ монет по росту за 24 часа.

**Query Parameters:**
- `limit` (optional): количество монет (1-1000, по умолчанию 100)

**Response:**
```json
{
  "status": "ok",
  "data": {
    "coins": []
  },
  "timestamp": "2025-09-01T12:43:52.847Z"
}
```

#### 3.6 Top Losers

**GET** `/api/v1/market/top-losers?limit=10`

Топ монет по падению за 24 часа.

**Query Parameters:**
- `limit` (optional): количество монет (1-1000, по умолчанию 100)

---

### 4. Coins Data

#### 4.1 Coins List

**GET** `/api/v1/coins/list?limit=20&offset=0`

Список всех доступных монет с пагинацией.

**Query Parameters:**
- `limit` (optional): количество монет (1-1000, по умолчанию 100)
- `offset` (optional): смещение для пагинации (по умолчанию 0)

**Response:**
```json
{
  "status": "ok",
  "data": {
    "coins": []
  },
  "timestamp": "2025-09-01T12:41:37.591Z"
}
```

#### 4.2 Coin Details

**GET** `/api/v1/coins/details?symbol=BTC-USDT`

Детальная информация о конкретной монете.

**Query Parameters:**
- `symbol` (required): символ пары (например, BTC-USDT, ETH-USDT)

**Response:**
```json
{
  "status": "ok",
  "data": {
    "ticker": {
      "askPrice": 0,
      "askQty": 0,
      "bidPrice": 0,
      "bidQty": 0,
      "highPrice": 0,
      "lastPrice": 0,
      "lastQty": 0,
      "lowPrice": 0,
      "openPrice": 0,
      "prevClosePrice": 0,
      "priceChange": 0,
      "priceChangePercent": 0,
      "quoteVolume": 0,
      "volume": 0,
      "weightedAvgPrice": 0
    },
    "orderBook": {
      "bids": [
        ["108996.31", "0.126702"],
        ["108996.25", "0.529174"]
      ],
      "asks": [
        ["109210.55", "0.000020"],
        ["109210.49", "0.000036"]
      ],
      "lastUpdateId": 14519683602
    },
    "recentTrades": [
      {
        "id": 165518877,
        "price": 109013.33,
        "qty": 0.005868,
        "quoteQty": 0,
        "time": 1756730546296
      }
    ],
    "klines": [
      {
        "openTime": 1756728000000,
        "open": 108776.81,
        "high": 109163.78,
        "low": 108622.54,
        "close": 108994.28,
        "volume": 73.082273,
        "closeTime": 1756731599999,
        "quoteAssetVolume": 7960796.26
      }
    ]
  },
  "timestamp": "2025-09-01T12:42:27.212Z"
}
```

**Использование на фронте:**
```javascript
// Получение деталей монеты
const getCoinDetails = async (symbol) => {
  const response = await fetch(`/api/v1/coins/details?symbol=${symbol}`);
  const data = await response.json();
  
  if (data.status === 'ok') {
    const { ticker, orderBook, recentTrades, klines } = data.data;
    
    // Обновление цен
    updatePriceDisplay(ticker.lastPrice, ticker.priceChangePercent);
    
    // Обновление order book
    updateOrderBook(orderBook.bids, orderBook.asks);
    
    // Обновление графика
    updatePriceChart(klines);
    
    // Обновление последних сделок
    updateRecentTrades(recentTrades);
  }
};
```

#### 4.3 Coin Price

**GET** `/api/v1/coins/price?symbol=BTC-USDT`

Только цена и базовые метрики монеты.

**Response:**
```json
{
  "status": "ok",
  "data": {
    "high": 0,
    "low": 0,
    "open": 0,
    "price": 0,
    "priceChange": 0,
    "priceChangePercent": 0,
    "quoteVolume": 0,
    "volume": 0
  },
  "timestamp": "2025-09-01T12:44:17.837Z"
}
```

---

### 5. Derivatives (Placeholder)

#### 5.1 Funding Rates

**GET** `/api/v1/derivatives/funding-rates?symbol=BTC-USDT`

**Response:**
```json
{
  "status": "ok",
  "data": {
    "message": "Funding rates endpoint - coming soon",
    "timestamp": "2025-09-01T12:42:35.812Z"
  },
  "timestamp": "2025-09-01T12:42:35.812Z"
}
```

---

### 6. Webhook & Trading Signals

#### 6.1 Service Info

**GET** `/api/v1/webhook/service-info`

Информация о webhook сервисе.

**Response:**
```json
{
  "status": "ok",
  "data": {
    "name": "TradingView Webhook Service",
    "version": "1.0.0",
    "status": "active",
    "subscribers_count": 0,
    "signals_count": 0,
    "max_signals": 1000,
    "valid_signal_types": ["CRITICAL_SHORTS", "FEAR_ZONE"],
    "valid_timeframes": ["1h", "4h", "1d"],
    "valid_exchanges": ["BINANCE", "OKX", "BINGX"],
    "last_updated": "2025-09-01T12:41:43.061Z"
  },
  "timestamp": "2025-09-01T12:41:43.061Z"
}
```

#### 6.2 Signals List

**GET** `/api/v1/webhook/signals?limit=20&type=CRITICAL_SHORTS&symbol=BTC-USDT`

Список торговых сигналов.

**Query Parameters:**
- `limit` (optional): количество сигналов (1-1000, по умолчанию 50)
- `type` (optional): тип сигнала (CRITICAL_SHORTS, FEAR_ZONE)
- `symbol` (optional): символ монеты

**Response:**
```json
{
  "status": "ok",
  "data": {
    "signals": [],
    "count": 0,
    "filters": {
      "limit": 20,
      "type": null,
      "symbol": null
    }
  },
  "timestamp": "2025-09-01T12:43:40.543Z"
}
```

#### 6.3 Signals Statistics

**GET** `/api/v1/webhook/signals/stats`

Статистика по сигналам.

**Response:**
```json
{
  "status": "ok",
  "data": {
    "total": 0,
    "by_type": {},
    "by_exchange": {},
    "by_symbol": {},
    "recent_24h": 0,
    "recent_1h": 0,
    "last_signal": null
  },
  "timestamp": "2025-09-01T12:43:44.753Z"
}
```

#### 6.4 TradingView Webhook

**POST** `/api/v1/webhook/tradingview`

Endpoint для получения сигналов от TradingView.

**Headers:**
```javascript
{
  "x-signature": "signature-hash",
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "symbol": "BTC-USDT",
  "signal_type": "CRITICAL_SHORTS",
  "timeframe": "1h",
  "exchange": "BINANCE",
  "price": 109000,
  "timestamp": 1756730600000
}
```

---

### 7. Admin & Monitoring

#### 7.1 Detailed Metrics

**GET** `/admin/metrics`

Детальные метрики производительности (только для разработки).

**Response:**
```json
{
  "status": "ok",
  "data": {
    "requests": {
      "total": 15,
      "byMethod": {"GET": 11, "POST": 1, "HEAD": 3},
      "byEndpoint": {...},
      "byStatus": {"200": 13, "400": 1, "404": 1}
    },
    "responseTime": {
      "total": 1193,
      "count": 15,
      "min": 0,
      "max": 891,
      "byEndpoint": {...}
    },
    "errors": {"total": 2, "byType": {"Error": 2}},
    "activeConnections": 1,
    "uptime": 97982,
    "uptimeFormatted": "1m 37s",
    "averages": {
      "avgResponseTime": 79.53,
      "avgRequestsPerSecond": 0.15
    }
  }
}
```

#### 7.2 Reset Metrics

**POST** `/admin/metrics/reset`

Сброс метрик (только для разработки).

---

## 🔄 Rate Limiting

### Лимиты по endpoints:

- **Общие API endpoints:** 100 запросов / 15 минут
- **Строгие endpoints** (coin details, market data): 20 запросов / 5 минут
- **Аутентификация** (будет добавлено): 5 запросов / 15 минут

### Заголовки rate limiting:

```javascript
{
  "RateLimit-Policy": "100;w=900",
  "RateLimit-Limit": "100",
  "RateLimit-Remaining": "75",
  "RateLimit-Reset": "800"
}
```

**Использование на фронте:**
```javascript
// Проверка rate limit
const checkRateLimit = (response) => {
  const remaining = response.headers.get('RateLimit-Remaining');
  const reset = response.headers.get('RateLimit-Reset');
  
  if (parseInt(remaining) < 10) {
    showWarning(`Осталось ${remaining} запросов. Сброс через ${reset} секунд.`);
  }
  
  if (parseInt(remaining) === 0) {
    showError('Достигнут лимит запросов. Попробуйте позже.');
  }
};
```

---

## 🛡️ Security Headers

Все ответы содержат следующие заголовки безопасности:

```javascript
{
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Content-Security-Policy": "default-src 'self';...",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload"
}
```

---

## 📝 Error Handling

### Стандартный формат ошибок:

```json
{
  "status": "error",
  "message": "Описание ошибки",
  "timestamp": "2025-09-01T12:44:24.039Z",
  "path": "/api/v1/market/overview",
  "method": "GET",
  "stack": "Stack trace (только для разработки)"
}
```

### Коды ошибок:

- **400**: Bad Request (неверные параметры)
- **401**: Unauthorized (будет добавлено)
- **404**: Not Found (endpoint не найден)
- **415**: Unsupported Media Type
- **429**: Too Many Requests (rate limit)
- **500**: Internal Server Error

**Использование на фронте:**
```javascript
// Обработка ошибок
const handleApiError = async (response) => {
  if (!response.ok) {
    const errorData = await response.json();
    
    switch (response.status) {
      case 400:
        showValidationError(errorData.message);
        break;
      case 404:
        showNotFoundError(errorData.message);
        break;
      case 429:
        showRateLimitError(errorData.message);
        break;
      default:
        showGenericError(errorData.message);
    }
    
    throw new Error(errorData.message);
  }
  
  return response.json();
};
```

---

## 🔧 Frontend Integration Examples

### React Hook для API:

```javascript
import { useState, useEffect } from 'react';

const useApiData = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(endpoint, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            ...options.headers
          },
          ...options
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
};

// Использование:
const { data: marketData, loading, error } = useApiData('/api/v1/market/overview');
```

### WebSocket для real-time данных (будет добавлено):

```javascript
// Планируется для real-time обновлений цен
const useWebSocket = (symbol) => {
  const [price, setPrice] = useState(null);
  
  useEffect(() => {
    // WebSocket подключение будет добавлено позже
    // ws://localhost:3001/ws/price/BTC-USDT
  }, [symbol]);
  
  return price;
};
```

---

## 📊 Data Update Frequency

- **Market Data**: каждые 30-60 секунд
- **Coin Prices**: real-time (при запросе)
- **Fear & Greed Index**: каждые 4 часа
- **Altseason Index**: каждые 24 часа
- **BTC Dominance**: каждые 1 час
- **Trading Signals**: по мере поступления webhooks

---

## 🚀 Deployment Notes

### Railway:
- Порт: `process.env.PORT` (Railway автоматически)
- Environment variables: см. `.env.example`
- Health check: `/health`
- Graceful shutdown: поддерживается

### Docker:
- `docker build -t omniboard-backend .`
- `docker run -p 3001:3001 omniboard-backend`

---

## 🔮 Future Features

1. **WebSocket** для real-time обновлений
2. **JWT Authentication** для пользователей
3. **Database Integration** (MongoDB/PostgreSQL)
4. **Telegram Bot** для уведомлений
5. **CoinGlass Integration** для liquidations
6. **Historical Data** storage
7. **User Preferences** и настройки
8. **Analytics Dashboard** для пользователей

---

## 📞 Support

При возникновении проблем:
1. Проверьте `/health` endpoint
2. Посмотрите логи сервера
3. Проверьте rate limiting заголовки
4. Убедитесь в правильности User-Agent заголовка

---

*Документация обновлена: 2025-09-01*
