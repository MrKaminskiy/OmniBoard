# OmniBoard API Integration

Этот файл содержит интеграцию фронтенда с OmniBoard бэкендом для получения данных о криптовалютном рынке.

## 📁 Файлы

### `omniboard-api.js`
Основной класс для работы с API OmniBoard. Включает:
- HTTP запросы с retry логикой
- Кэширование данных (30 секунд)
- Трансформацию данных для UI
- Fallback на mock данные при ошибках API

### `crypto-dashboard.js`
Контроллер дашборда, который:
- Управляет UI элементами
- Обрабатывает события пользователя
- Обновляет данные в реальном времени
- Автоматически обновляет данные каждые 5 минут

### `api-test.js`
Тестовый скрипт для проверки работы API

## 🔗 API Endpoints

Базовый URL: `https://omniboard-production.up.railway.app`

### Market Data
- `GET /api/v1/market/overview` - Обзор рынка
- `GET /api/v1/market/top-gainers` - Топ gainers
- `GET /api/v1/market/top-losers` - Топ losers
- `GET /api/v1/market/fear-greed` - Индекс страха и жадности
- `GET /api/v1/market/altseason` - Индекс altseason
- `GET /api/v1/market/open-interest` - Открытый интерес
- `GET /api/v1/market/liquidations` - Ликвидации
- `GET /api/v1/market/long-short-ratio` - Соотношение long/short
- `GET /api/v1/market/btc-dominance` - Доминирование BTC

### Coins Data
- `GET /api/v1/coins/list` - Список монет
- `GET /api/v1/coins/details` - Детали монеты
- `GET /api/v1/coins/price` - Цена монеты
- `GET /api/v1/coins/market-data` - Рыночные данные

### Derivatives Data
- `GET /api/v1/derivatives/funding-rates` - Ставки финансирования
- `GET /api/v1/derivatives/open-interest` - Открытый интерес

## 🚀 Использование

### Инициализация
```javascript
// API автоматически инициализируется при загрузке страницы
const api = window.omniboardAPI;

// Получить данные о рынке
const overview = await api.getMarketOverview();

// Получить топ gainers
const gainers = await api.getTopGainers(10);
```

### Кэширование
```javascript
// Очистить кэш
api.clearCache();

// Получить статус кэша
const status = api.getCacheStatus();
```

## 🔄 Автоматическое обновление

Дашборд автоматически обновляет данные:
- При загрузке страницы
- При нажатии кнопки Refresh
- Каждые 5 минут
- При ошибках API использует кэшированные данные

## 🛡️ Обработка ошибок

- Retry логика (3 попытки)
- Fallback на mock данные
- Graceful degradation при недоступности API
- Логирование ошибок в консоль

## 📊 Mock Data

При недоступности API используются mock данные:
- Market Cap: $2.47T
- Volume: $89.2B
- Fear & Greed: 72 (Greed)
- Altseason: 45 (Neutral)
- И другие стандартные значения

## 🧪 Тестирование

Откройте консоль браузера на странице `crypto-market-overview.html` для просмотра логов API тестов.

## 🔧 Настройка

Для изменения настроек API отредактируйте `omniboard-api.js`:
- `baseURL` - базовый URL бэкенда
- `cacheTimeout` - время жизни кэша (мс)
- `retryAttempts` - количество попыток при ошибках
- `retryDelay` - задержка между попытками (мс)

## 📝 Логи

Все API вызовы логируются в консоль браузера:
- Успешные запросы
- Ошибки и retry попытки
- Статус кэша
- Время обновления данных
