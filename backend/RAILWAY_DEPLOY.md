# 🚀 Деплой на Railway

## 📋 Подготовка к деплою

### 1. **Настройка BingX API ключей**

Создайте файл `.env` в корне backend папки:

```bash
cd backend
cp env.example .env
```

Отредактируйте `.env` с вашими реальными ключами:

```env
# BingX API Configuration
BINGX_API_KEY=ваш_реальный_api_ключ
BINGX_SECRET_KEY=ваш_реальный_secret_ключ
BINGX_BASE_URL=https://open-api.bingx.com

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Cache Configuration
CACHE_TTL=30000

# Logging
LOG_LEVEL=info
```

### 2. **Тестирование локально**

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Тестирование API
curl http://localhost:3001/health
curl http://localhost:3001/api/v1
```

## 🚀 Деплой на Railway

### 1. **Установка Railway CLI**

```bash
npm install -g @railway/cli
```

### 2. **Авторизация в Railway**

```bash
railway login
```

### 3. **Создание нового проекта**

```bash
# Перейдите в папку backend
cd backend

# Инициализация проекта
railway init

# Создание нового проекта (если нужно)
railway project create omniboard-backend
```

### 4. **Настройка переменных окружения**

```bash
# Установка переменных из .env файла
railway variables set BINGX_API_KEY=ваш_ключ
railway variables set BINGX_SECRET_KEY=ваш_секрет
railway variables set NODE_ENV=production
railway variables set CORS_ORIGIN=https://your-frontend-domain.com
```

### 5. **Деплой**

```bash
# Деплой на Railway
railway up

# Или через Git (рекомендуется)
git add .
git commit -m "Deploy to Railway"
git push railway main
```

## 🔧 Конфигурация Railway

### **railway.json**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### **Dockerfile**
- Оптимизированный образ Node.js 18
- Non-root пользователь для безопасности
- Health check для мониторинга
- Минимальный размер образа

## 📊 Мониторинг и логи

### **Railway Dashboard**
- Перейдите на [railway.app](https://railway.app)
- Выберите ваш проект
- Просматривайте логи и метрики

### **Health Check**
```bash
# Проверка здоровья сервиса
curl https://your-railway-domain.railway.app/health
```

### **API Endpoints**
```bash
# Информация об API
curl https://your-railway-domain.railway.app/api/v1

# Рыночные данные
curl https://your-railway-domain.railway.app/api/v1/market/overview
```

## 🛡️ Безопасность

### **Переменные окружения**
- Никогда не коммитьте `.env` файл
- Используйте Railway Variables для секретов
- Ограничьте доступ к API ключам

### **CORS настройки**
```env
# Разрешите только ваш фронтенд домен
CORS_ORIGIN=https://your-frontend-domain.com
```

### **Rate Limiting**
- Ограничение запросов: 100 в 15 минут
- Настраивается через переменные окружения

## 🔄 Автоматический деплой

### **GitHub Integration**
1. Подключите GitHub репозиторий к Railway
2. Настройте автоматический деплой при push в main ветку
3. Railway автоматически собирает и деплоит изменения

### **Environment Variables**
Railway автоматически подхватывает переменные из `.env` файла при деплое.

## 🚨 Устранение неполадок

### **Деплой не удается**
1. Проверьте логи в Railway Dashboard
2. Убедитесь, что все зависимости установлены
3. Проверьте переменные окружения

### **API не отвечает**
1. Проверьте health check endpoint
2. Убедитесь, что BingX API ключи корректны
3. Проверьте CORS настройки

### **Высокое потребление ресурсов**
1. Оптимизируйте кэширование
2. Уменьшите частоту обновления данных
3. Мониторьте использование памяти

## 📈 Масштабирование

### **Автоматическое масштабирование**
Railway автоматически масштабирует ваш сервис в зависимости от нагрузки.

### **Мониторинг ресурсов**
- CPU и Memory usage
- Network I/O
- Response times

## 🔮 Следующие шаги

1. **Протестируйте локально** с вашими BingX API ключами
2. **Создайте проект на Railway**
3. **Настройте переменные окружения**
4. **Деплойте приложение**
5. **Обновите фронтенд** с новым Railway URL

---

**Статус: ГОТОВ К ДЕПЛОЮ** 🎉

**Локальное тестирование**: Настроено
**Railway конфигурация**: Готова
**Docker образ**: Оптимизирован
**Автоматический деплой**: Настроен
