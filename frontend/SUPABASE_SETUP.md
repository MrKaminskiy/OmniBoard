# 🔐 Supabase Setup для OmniBoard

## 1. Настройка проекта Supabase

### Создание проекта
1. Перейдите в [Supabase Dashboard](https://supabase.com/dashboard)
2. Нажмите "New Project"
3. Выберите организацию и создайте проект
4. Дождитесь завершения инициализации

### Получение ключей
1. В Settings → API найдите:
   - **Project URL**: `https://your-project.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role secret key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 2. Настройка базы данных

### Запуск SQL скрипта
1. Откройте **SQL Editor** в Supabase Dashboard
2. Скопируйте содержимое файла `supabase-setup.sql`
3. Вставьте и выполните скрипт
4. Проверьте, что все таблицы созданы в **Table Editor**

### Проверка таблиц
После выполнения скрипта должны быть созданы таблицы:
- `user_profiles` - профили пользователей
- `payments` - платежи
- `signals` - торговые сигналы
- `signal_updates` - обновления сигналов
- `exchange_connections` - подключения к биржам
- `trades` - сделки
- `positions` - позиции
- `media_sources` - источники медиа
- `media_posts` - посты медиа

## 3. Настройка переменных окружения

### Локальная разработка
Создайте файл `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Access Control
ACCESS_PASSWORD=omniboard2024

# CTSS Integration
NEXT_PUBLIC_CTSS_API_URL=http://localhost:5001
CTSS_API_KEY=your_ctss_api_key
```

### Production (Vercel)
1. Откройте [Vercel Dashboard](https://vercel.com/dashboard)
2. Выберите проект OmniBoard
3. Перейдите в Settings → Environment Variables
4. Добавьте переменные:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ACCESS_PASSWORD`
   - `NEXT_PUBLIC_CTSS_API_URL`
   - `CTSS_API_KEY`

## 4. Настройка аутентификации

### Email аутентификация
1. В Supabase Dashboard → Authentication → Settings
2. Убедитесь, что **Enable email confirmations** включен
3. Настройте **Site URL**: `https://your-domain.com`
4. Настройте **Redirect URLs**: 
   - `https://your-domain.com/auth/callback`
   - `http://localhost:3000/auth/callback` (для разработки)

### Email Templates (опционально)
1. Authentication → Email Templates
2. Настройте шаблоны для:
   - Confirm signup
   - Reset password
   - Magic link

## 5. Настройка Row Level Security (RLS)

### Проверка политик
Убедитесь, что RLS включен и политики созданы:
1. Table Editor → выберите таблицу
2. Settings → Row Level Security
3. Проверьте, что политики активны

### Основные политики:
- `user_profiles`: пользователи видят только свой профиль
- `payments`: пользователи видят только свои платежи
- `signals`: все сигналы доступны всем (публичные)
- `trades`: пользователи видят только свои сделки

## 6. Тестирование

### Регистрация пользователя
1. Откройте приложение
2. Перейдите на `/auth/signup`
3. Зарегистрируйтесь с реальным email
4. Проверьте почту и подтвердите регистрацию
5. Войдите в систему

### Проверка данных
1. В Supabase Dashboard → Table Editor
2. Проверьте таблицу `user_profiles` - должен появиться новый пользователь
3. Проверьте таблицу `signals` - должны быть тестовые сигналы

## 7. Интеграция с CTSS

### Настройка API ключей
1. Запустите CTSS API сервер локально:
   ```bash
   cd /path/to/ctss/apps/worker
   python3 enhanced_api_server.py
   ```

2. Получите API ключ из логов сервера
3. Обновите переменную `CTSS_API_KEY` в `.env.local`

### Тестирование интеграции
1. Войдите в систему
2. Перейдите на `/signals`
3. Проверьте, что сигналы загружаются из CTSS API

## 8. Мониторинг и логи

### Supabase Logs
1. Dashboard → Logs
2. Мониторьте:
   - Authentication events
   - Database errors
   - API usage

### Vercel Logs
1. Vercel Dashboard → Functions
2. Мониторьте ошибки API routes

## 9. Безопасность

### Рекомендации
1. **Никогда не коммитьте** `.env.local` в git
2. Используйте **service_role key** только на сервере
3. Регулярно **ротируйте API ключи**
4. Настройте **rate limiting** для API endpoints
5. Мониторьте **необычную активность**

### Backup
1. Supabase Dashboard → Settings → Database
2. Настройте автоматические бэкапы
3. Экспортируйте схему БД регулярно

## 10. Troubleshooting

### Частые проблемы

**"Invalid supabaseUrl"**
- Проверьте, что URL начинается с `https://`
- Убедитесь, что нет лишних пробелов в переменных

**"Auth session not found"**
- Проверьте настройки Site URL в Supabase
- Убедитесь, что middleware правильно настроен

**"Row Level Security policy violation"**
- Проверьте, что пользователь авторизован
- Убедитесь, что RLS политики правильно настроены

**"API key invalid"**
- Проверьте правильность API ключа CTSS
- Убедитесь, что CTSS сервер запущен

### Логи и отладка
```bash
# Локальная разработка с отладкой
npm run dev

# Проверка Supabase подключения
curl -H "apikey: YOUR_ANON_KEY" https://your-project.supabase.co/rest/v1/signals

# Проверка CTSS API
curl -H "X-API-Key: YOUR_CTSS_KEY" http://localhost:5001/api/signals
```

## Готово! 🎉

Теперь у вас есть полностью функциональная система аутентификации с Supabase, готовая для production использования.
