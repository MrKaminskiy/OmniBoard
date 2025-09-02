# OmniBoard - Crypto Trading Dashboard

Современный дашборд для криптотрейдинга с Next.js frontend и Node.js backend.

## 🏗️ Архитектура

- **Frontend**: Next.js 15 с App Router, Tabler UI (CDN)
- **Backend**: Node.js API с Express, Railway deployment
- **Стили**: Tailwind CSS + Tabler UI компоненты

## 🚀 Быстрый старт

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Откройте http://localhost:3000

### Backend (Node.js)
```bash
cd backend
npm install
npm run dev
```
Backend запустится на http://localhost:3001

## 📁 Структура проекта

```
├── frontend/          # Next.js приложение
│   ├── src/
│   │   ├── app/      # App Router страницы
│   │   ├── components/ # React компоненты
│   │   ├── hooks/    # Custom hooks
│   │   └── lib/      # API клиент
│   └── package.json
├── backend/           # Node.js API
│   ├── routes/       # API маршруты
│   ├── services/     # Бизнес логика
│   └── package.json
└── package.json      # Корневой package.json
```

## 🌐 Деплой

- **Frontend**: Vercel (автоматически из GitHub)
- **Backend**: Railway

## 🎨 UI Компоненты

- Tabler UI (через CDN)
- Темная тема по умолчанию
- Responsive дизайн
- Иконки Tabler Icons

## 📊 Страницы

1. **Market Overview** - Обзор рынка, KPI карточки
2. **Signals** - Торговые сигналы
3. **Trading Journal** - Дневник торговли
4. **Public Media** - Публичные медиа

## 🔧 Технологии

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **UI**: Tabler UI, Tabler Icons
- **Deployment**: Vercel, Railway

