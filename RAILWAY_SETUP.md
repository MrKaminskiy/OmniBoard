# 🚀 Railway Setup Guide для OmniBoard

## 📋 Предварительные требования

1. **GitHub аккаунт** с репозиторием [MrKaminskiy/OmniBoard](https://github.com/MrKaminskiy/OmniBoard)
2. **Railway аккаунт** - [railway.app](https://railway.app)
3. **BingX API ключи** (опционально для тестирования)

## 🚀 Пошаговая настройка Railway

### Шаг 1: Подключение GitHub к Railway

1. Перейдите на [Railway Dashboard](https://railway.app/dashboard)
2. Нажмите **"New Project"**
3. Выберите **"Deploy from GitHub repo"**
4. Найдите и выберите репозиторий **`MrKaminskiy/OmniBoard`**
5. Нажмите **"Deploy Now"**

### Шаг 2: Настройка проекта

1. **Название проекта**: `omniboard-backend`
2. **Branch**: `main`
3. **Root Directory**: `backend`
4. **Build Command**: `npm ci`
5. **Start Command**: `npm start`

### Шаг 3: Настройка Environment Variables

Перейдите в раздел **Variables** и добавьте:

#### Обязательные переменные:
```bash
NODE_ENV=production
PORT=process.env.PORT
CORS_ORIGIN=https://omniboard-backend-production.up.railway.app
```

#### BingX API (опционально):
```bash
BINGX_API_KEY=your_api_key
BINGX_SECRET_KEY=your_secret_key
BINGX_BASE_URL=https://open-api.bingx.com
```

#### Безопасность:
```bash
SESSION_SECRET=your_32_char_session_secret
JWT_SECRET=your_32_char_jwt_secret
```

#### Остальные настройки:
```bash
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CACHE_TTL=30000
MARKET_UPDATE_INTERVAL=60000
LOG_LEVEL=info
TRADINGVIEW_WEBHOOK_SECRET=your_webhook_secret
```

### Шаг 4: Настройка GitHub Secrets

1. Перейдите в GitHub репозиторий
2. **Settings** → **Secrets and variables** → **Actions**
3. Добавьте секрет:
   - **Name**: `RAILWAY_TOKEN`
   - **Value**: Получите из Railway Dashboard → Account → Tokens

### Шаг 5: Автоматический деплой

После настройки:
1. **Push в main branch** автоматически запустит деплой
2. **GitHub Actions** проведут тесты
3. **Railway** автоматически обновит приложение

## 🔧 Проверка деплоя

### 1. Health Check
```bash
curl https://omniboard-backend-production.up.railway.app/health
```

### 2. API Info
```bash
curl https://omniboard-backend-production.up.railway.app/api/v1
```

### 3. Market Data
```bash
curl https://omniboard-backend-production.up.railway.app/api/v1/market/overview
```

## 📱 Получение Railway URL

После деплоя Railway предоставит URL вида:
```
https://omniboard-backend-production.up.railway.app
```

## 🔍 Мониторинг

### Railway Dashboard
- **Deployments**: История деплоев
- **Logs**: Логи приложения
- **Metrics**: CPU, Memory, Network
- **Variables**: Environment variables

### GitHub Actions
- **Tests**: Автоматическое тестирование
- **Deploy**: Автоматический деплой
- **Coverage**: Покрытие кода тестами

## 🚨 Troubleshooting

### Ошибка "Build failed"
1. Проверьте логи в Railway Dashboard
2. Убедитесь, что все зависимости установлены
3. Проверьте package.json и scripts

### Ошибка "Port already in use"
1. Не устанавливайте PORT вручную
2. Railway автоматически назначит порт

### Ошибка "Environment variables missing"
1. Проверьте раздел Variables в Railway
2. Убедитесь, что Environment = Production
3. Проверьте названия переменных

### CORS ошибки
1. Проверьте CORS_ORIGIN
2. Убедитесь, что домен правильный
3. Проверьте настройки CORS в коде

## 🔄 Обновление приложения

### Автоматически
1. Push в main branch
2. GitHub Actions запустят тесты
3. Railway автоматически обновит приложение

### Вручную
1. Railway Dashboard → Deployments
2. Нажмите **"Deploy"**
3. Выберите branch и нажмите **"Deploy"**

## 📊 Мониторинг производительности

### Railway Metrics
- **CPU Usage**: Мониторинг нагрузки
- **Memory Usage**: Использование памяти
- **Network**: Входящий/исходящий трафик
- **Response Time**: Время ответа API

### Application Metrics
- **Health Check**: `/health`
- **API Metrics**: `/admin/metrics` (dev only)
- **Logs**: Структурированное логирование

## 🔐 Безопасность

### Environment Variables
- **НИКОГДА** не коммитьте секреты в git
- Используйте Railway Variables
- Регулярно обновляйте секреты

### API Keys
- Ограничьте доступ по IP
- Мониторьте использование
- Используйте разные ключи для dev/prod

### CORS
- Настройте только нужные домены
- Не используйте `*` в продакшене
- Проверьте настройки безопасности

## 📚 Полезные ссылки

- [Railway Documentation](https://docs.railway.app/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [BingX API](https://bingx-api.github.io/docs/)
- [OmniBoard Backend Docs](./backend/README_FRONTEND.md)

---

**После настройки Railway ваш бэкенд будет автоматически деплоиться при каждом push в main branch! 🚀**
