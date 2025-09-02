# OmniBoard Frontend

Next.js dashboard для криптотрейдинга с Tabler UI.

## 🚀 Технологии

- **Next.js 14** - App Router
- **TypeScript** - типизация
- **Tabler UI** - UI компоненты (CDN)
- **Tailwind CSS** - стилизация
- **React Hooks** - состояние и логика

## 📁 Структура проекта

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # Основной layout с навигацией
│   ├── page.tsx        # Главная страница (Market Overview)
│   ├── signals/        # Страница сигналов
│   │   └── page.tsx
│   ├── journal/        # Страница торгового журнала
│   │   └── page.tsx
│   └── media/          # Страница публичных медиа
│       └── page.tsx
├── components/          # React компоненты
│   └── Navigation.tsx  # Навигация
├── hooks/              # Кастомные хуки
│   └── usePolling.ts   # Хук для периодических запросов
└── lib/                # Утилиты и API
    └── api.ts          # API клиент
```

## 🛠️ Установка и запуск

### Локальная разработка

1. **Установите зависимости:**
   ```bash
   npm install
   ```

2. **Создайте .env.local:**
   ```bash
   NEXT_PUBLIC_API_BASE=https://your-railway-backend.railway.app
   ```

3. **Запустите dev сервер:**
   ```bash
   npm run dev
   ```

4. **Откройте браузер:**
   ```
   http://localhost:3000
   ```

### Сборка для продакшена

```bash
npm run build
npm start
```

## 🌐 Деплой на Vercel

1. **Подключите репозиторий** к Vercel
2. **Установите переменные окружения:**
   - `NEXT_PUBLIC_API_BASE` - URL вашего Railway backend
3. **Деплой автоматический** при push в main

## 📊 Страницы и функциональность

### 1. Market Overview (`/`)
- **4 KPI карточки:**
  - Market Cap (с 24h изменением)
  - 24h Volume (с 24h изменением)
  - Fear & Greed Index (75/100 - Greed)
  - Altseason Index (65/100 - Alt Season)
- **Таблица топ монет** (пока заглушка)
- **Polling каждые 30 секунд**

### 2. Signals (`/signals`)
- **TradingView сигналы** в виде карточек
- **Фильтрация по:** symbol, timeframe, signal type
- **Отображение:** strength, price, source, timestamp
- **Polling каждые 30 секунд**

### 3. Trading Journal (`/journal`)
- **4 KPI карточки:**
  - Total PnL (с цветовой индикацией)
  - Win Rate (процент успешных сделок)
  - Avg Fee (средняя комиссия)
  - Avg Duration (среднее время удержания)
- **Таблица сделок** с фильтрами
- **Кнопка "Connect Exchange"**
- **Export CSV функциональность**
- **Polling каждые 60 секунд**

### 4. Public Media (`/media`)
- **Лента новостей** из Twitter, Telegram, Reddit
- **Анализ настроений** (positive/negative/neutral)
- **Топ-10 упоминаний монет** в правой панели
- **Engagement метрики**
- **Polling каждые 5 минут**

## 📊 API Endpoints

Frontend использует следующие backend endpoints:

- `GET /api/v1/market/overview` - метрики рынка
- `GET /api/v1/coins/details?symbol=BTC-USDT` - данные по монетам
- `GET /api/v1/signals/latest?limit=50` - TradingView сигналы

## 🔄 Polling

Данные автоматически обновляются:
- **Market Overview:** 30 секунд
- **Signals:** 30 секунд  
- **Journal:** 60 секунд
- **Media:** 5 минут

## 🎨 UI Components

Используются Tabler UI компоненты:
- **Cards** для метрик и KPI
- **Tables** для данных
- **Badges** для статусов и настроений
- **Icons** для визуализации
- **Responsive grid** система

## 🚨 Обработка ошибок

- **Простые alert'ы** для ошибок
- **Skeleton loading** состояния
- **Fallback UI** при недоступности API
- **Graceful degradation** для отсутствующих данных

## 📱 Responsive Design

- **Адаптивная сетка** для всех устройств
- **Мобильная навигация** с hamburger меню
- **Оптимизация** для desktop, tablet, mobile
- **Tabler UI** responsive компоненты

## 🔧 Разработка

### Добавление новых страниц:
1. Создайте папку в `src/app/`
2. Добавьте `page.tsx` с компонентом
3. Обновите навигацию в `Navigation.tsx`
4. Добавьте API endpoints в `api.ts`

### Добавление новых API:
1. Обновите интерфейсы в `api.ts`
2. Добавьте методы в `ApiClient` класс
3. Используйте в компонентах с `usePolling`

## 🚀 Следующие шаги

- [ ] Реальные данные для Fear & Greed Index
- [ ] Реальные данные для Altseason Index
- [ ] Интеграция с TradingView API
- [ ] Подключение к биржам
- [ ] Реальные данные для медиа
- [ ] Чарты и графики
- [ ] Уведомления и алерты
