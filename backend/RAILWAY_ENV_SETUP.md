# 🚀 Railway Environment Variables Setup

## 📋 Обязательные переменные окружения

Скопируйте эти переменные в Railway dashboard → Variables:

### 1. BingX API Configuration
```bash
BINGX_API_KEY=your_bingx_api_key_here
BINGX_SECRET_KEY=your_bingx_secret_key_here
BINGX_BASE_URL=https://open-api.bingx.com
```

### 2. TradingView Webhook Configuration
```bash
TRADINGVIEW_WEBHOOK_SECRET=your_webhook_secret_here
```

### 3. Server Configuration
```bash
PORT=process.env.PORT
NODE_ENV=production
```

### 4. CORS Configuration
```bash
CORS_ORIGIN=https://your-app-name.railway.app
```
**Важно**: Замените `your-app-name` на реальное имя вашего Railway приложения

### 5. Rate Limiting
```bash
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 6. Cache Configuration
```bash
CACHE_TTL=30000
```

### 7. Market Data Update Interval
```bash
MARKET_UPDATE_INTERVAL=60000
```

### 8. Logging
```bash
LOG_LEVEL=info
```

### 9. Security (ОБЯЗАТЕЛЬНО измените на свои!)
```bash
SESSION_SECRET=your_strong_session_secret_here_min_32_chars
JWT_SECRET=your_strong_jwt_secret_here_min_32_chars
```

## 🔐 Генерация секретов

### Session Secret (32+ символов)
```bash
# В терминале:
openssl rand -hex 32
# Или используйте онлайн генератор: https://generate-secret.vercel.app/32
```

### JWT Secret (32+ символов)
```bash
# В терминале:
openssl rand -hex 32
# Или используйте онлайн генератор: https://generate-secret.vercel.app/32
```

## 📱 Как установить в Railway

1. Перейдите в [Railway Dashboard](https://railway.app/dashboard)
2. Выберите ваш проект
3. Перейдите в раздел **Variables**
4. Добавьте каждую переменную:
   - **Name**: `BINGX_API_KEY`
   - **Value**: `your_actual_api_key`
   - **Environment**: `Production`
5. Повторите для всех переменных

## ⚠️ Важные моменты

### 1. CORS_ORIGIN
- Для локальной разработки: `http://localhost:3000`
- Для Railway: `https://your-app-name.railway.app`
- Для кастомного домена: `https://yourdomain.com`

### 2. Порт
- Railway автоматически установит `PORT`
- Не меняйте значение `process.env.PORT`

### 3. Секреты
- **НИКОГДА** не коммитьте реальные секреты в git
- Используйте сильные секреты (32+ символов)
- Регулярно обновляйте секреты

### 4. API ключи
- Получите реальные ключи от BingX
- Ограничьте доступ по IP в BingX dashboard
- Мониторьте использование API

## 🔍 Проверка настроек

После установки переменных:

1. **Health Check**: `https://your-app-name.railway.app/health`
2. **API Info**: `https://your-app-name.railway.app/api/v1`
3. **Market Data**: `https://your-app-name.railway.app/api/v1/market/overview`

## 🚨 Troubleshooting

### Ошибка "Missing environment variables"
- Проверьте, что все переменные установлены
- Убедитесь, что Environment = Production

### CORS ошибки
- Проверьте `CORS_ORIGIN`
- Убедитесь, что домен правильный

### API ошибки
- Проверьте BingX API ключи
- Убедитесь, что API доступен

### Порт занят
- Не устанавливайте `PORT` вручную
- Railway автоматически назначит порт

## 📚 Дополнительные ресурсы

- [Railway Documentation](https://docs.railway.app/)
- [Environment Variables Guide](https://docs.railway.app/develop/variables)
- [BingX API Documentation](https://bingx-api.github.io/docs/)
- [TradingView Webhook Guide](https://www.tradingview.com/support/solutions/43000529348-webhook-alerts/)

---

**После настройки всех переменных Railway автоматически перезапустит приложение! 🚀**
