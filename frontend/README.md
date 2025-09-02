# OmniBoard Frontend

Современный веб-интерфейс для криптовалютной торговой платформы OmniBoard, построенный с использованием Eleventy (11ty) и Tabler UI.

## 🚀 Возможности

### 📊 Страницы
- **Market Overview** (`/`) - Обзор рынка с KPI карточками и таблицей тикеров
- **Crypto Signals** (`/signals`) - Криптовалютные сигналы с фильтрами и RSI индикаторами
- **Trading Journal** (`/journal`) - Торговый журнал с управлением аккаунтами и экспортом
- **Public Media** (`/media`) - Мониторинг упоминаний в социальных сетях и новостях

### 🎨 UI/UX
- Современный дизайн на основе Tabler UI
- Адаптивная верстка для всех устройств
- Поддержка темной и светлой темы
- Интерактивные компоненты и анимации

### 🔄 Автообновление
- Market Overview: каждые 60 секунд
- Tickers: каждые 30 секунд
- Signals: каждые 60 секунд
- Media: каждые 5 минут

## 🛠 Технологии

- **Static Site Generator**: Eleventy (11ty)
- **UI Framework**: Tabler UI (via CDN)
- **Styling**: SCSS/CSS с кастомными компонентами
- **JavaScript**: Vanilla JS (ES6+)
- **Build Tool**: Eleventy CLI
- **Deployment**: Vercel

## 📁 Структура проекта

```
frontend/
├── src/
│   ├── css/
│   │   └── omniboard.css          # Кастомные стили
│   ├── js/
│   │   ├── config.js              # Конфигурация приложения
│   │   ├── api.js                 # API клиент
│   │   └── components.js          # UI компоненты
│   ├── static/
│   │   └── mocks/                 # Mock данные для разработки
│   ├── index.html                 # Market Overview
│   ├── signals.html               # Crypto Signals
│   ├── journal.html               # Trading Journal
│   └── media.html                 # Public Media
├── dist/                          # Собранные файлы
├── .eleventy.js                   # Конфигурация Eleventy
├── .env.example                   # Пример переменных окружения
└── README.md                      # Документация
```

## 🚀 Установка и запуск

### Предварительные требования
- Node.js 16+ 
- npm или pnpm

### Локальная разработка

1. **Клонируйте репозиторий**
   ```bash
   git clone <repository-url>
   cd OmniBoardFront/frontend
   ```

2. **Установите зависимости**
   ```bash
   npm install
   ```

3. **Настройте переменные окружения**
   ```bash
   cp .env.example .env
   # Отредактируйте .env файл
   ```

4. **Запустите локальный сервер**
   ```bash
   npm run dev
   ```

5. **Откройте браузер**
   ```
   http://localhost:8080
   ```

### Сборка для продакшена

```bash
npm run build
```

Собранные файлы будут в папке `dist/`.

## ⚙️ Конфигурация

### Переменные окружения

Создайте файл `.env` на основе `.env.example`:

```bash
# API Configuration
PUBLIC_API_BASE_URL=https://your-railway-api-host.railway.app

# Mock Mode (optional)
USE_MOCK_MARKET=false
USE_MOCK_SIGNALS=false
USE_MOCK_JOURNAL=false
USE_MOCK_MEDIA=false
```

### API Endpoints

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/market/overview` | GET | Обзор рынка (KPI) |
| `/market/tickers` | GET | Список тикеров |
| `/signals/latest` | GET | Последние сигналы |
| `/accounts` | POST | Создание аккаунта |
| `/journal/sync` | POST | Синхронизация журнала |
| `/journal/summary` | GET | Сводка по журналу |
| `/journal/trades` | GET | Список сделок |
| `/influencers` | GET | Лента медиа |
| `/influencers/heatmap` | GET | Тепловая карта упоминаний |

## 🎯 Mock режим

Если `PUBLIC_API_BASE_URL` не установлен или mock флаги включены, приложение будет использовать локальные JSON файлы из `/static/mocks/`.

### Mock файлы
- `market_overview.json` - Данные обзора рынка
- `market_tickers.json` - Список тикеров
- `signals_latest.json` - Сигналы
- `journal_summary.json` - Сводка журнала
- `journal_trades.json` - Сделки
- `influencers_feed.json` - Медиа лента
- `influencers_heatmap.json` - Тепловая карта

## 🚀 Деплой на Vercel

1. **Подключите репозиторий к Vercel**
2. **Установите переменные окружения**:
   - `PUBLIC_API_BASE_URL`: URL вашего Railway API
   - `USE_MOCK_*`: Флаги для mock режима
3. **Настройте build команду**: `npm run build`
4. **Укажите output directory**: `dist`

## 🔧 Разработка

### Добавление новых страниц

1. Создайте HTML файл в `src/`
2. Скопируйте базовую структуру из существующих страниц
3. Добавьте специфичную логику в JavaScript секцию
4. Обновите навигацию в sidebar

### Создание новых компонентов

1. Добавьте HTML шаблон в `components.js`
2. Создайте соответствующие CSS стили в `omniboard.css`
3. Используйте компонент на страницах

### API интеграция

1. Добавьте новые методы в `api.js`
2. Используйте `window.omniboardAPI.methodName()`
3. Обрабатывайте ошибки и состояния загрузки

## 🎨 UI компоненты

### KPI Cards
```javascript
window.omniboardComponents.createKpiCard({
  title: "Market Cap",
  value: "$2.1T",
  subtitle: "+5.2% from yesterday",
  color: "primary"
});
```

### Tables
```javascript
window.omniboardComponents.createTable({
  headers: ["Coin", "Price", "24h %"],
  data: [...],
  sortable: true
});
```

### Modals
```javascript
window.omniboardComponents.showModal("connect-exchange");
```

## 📱 Адаптивность

- **Desktop**: Полная функциональность с sidebar
- **Tablet**: Адаптированная навигация
- **Mobile**: Мобильная навигация с hamburger меню

## 🌙 Темы

- **Light**: Стандартная светлая тема
- **Dark**: Темная тема для комфортной работы в условиях низкой освещенности
- **Auto**: Автоматическое переключение на основе системных настроек

## 🚨 Обработка ошибок

- Автоматические retry для API запросов
- Пользовательские уведомления об ошибках
- Fallback на mock данные при недоступности API
- Логирование ошибок в консоль

## 📊 Экспорт данных

- **CSV экспорт** для таблиц сделок
- **Фильтрация** по датам, символам, статусам
- **Сортировка** по любому столбцу
- **Пагинация** для больших наборов данных

## 🔒 Безопасность

- CORS настройки для API запросов
- Валидация входных данных
- Безопасное хранение API ключей
- HTTPS для всех внешних запросов

## 🧪 Тестирование

```bash
# Запуск тестов
npm test

# Тестирование сборки
npm run build && npm run preview
```

## 📈 Производительность

- Минифицированные CSS/JS файлы
- Оптимизированные изображения
- Lazy loading для тяжелых компонентов
- Кэширование API ответов

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch
3. Внесите изменения
4. Добавьте тесты
5. Создайте Pull Request

## 📄 Лицензия

MIT License - см. файл [LICENSE](../LICENSE) для деталей.

## 🆘 Поддержка

- **Issues**: Создайте issue в GitHub
- **Discussions**: Используйте GitHub Discussions
- **Documentation**: Изучите код и комментарии

## 🔄 Обновления

- **Tabler UI**: Автоматические обновления через CDN
- **Dependencies**: Регулярные обновления npm пакетов
- **Security**: Мониторинг уязвимостей

---

**OmniBoard Frontend** - Современный интерфейс для криптовалютной торговли 🚀
