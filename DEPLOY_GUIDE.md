# 🚀 ДЕПЛОЙ НА TIMEWEB CLOUD - ОБЛАЧНАЯ ПЛАТФОРМА

## ЧТО ТАКОЕ TIMEWEB CLOUD?

Timeweb Cloud - это **облачная платформа** (как App Platform от DigitalOcean).
Там НЕ НУЖНО подключаться по SSH и вручную устанавливать stuff.
**Всё происходит через UI и конфиг файлы.**

---

## ВЫБОР СЕРВЕРА

**Рекомендуемая конфигурация:**
- **ОС**: Ubuntu 24.04 LTS
- **CPU**: 1x 3.3 ГГц (достаточно для Node.js)
- **RAM**: 2 ГБ (для Node.js + трафика)
- **Диск**: 30 ГБ NVMe (для кода)
- **Канал**: 1 Гбит/с (хватит)
- **Цена**: ~550₽/месяц конфиг + 180₽ IP

**ВАЖНО**: В Timeweb Cloud это уже всё предустановлено!
- Node.js уже есть
- npm уже есть
- Система уже настроена
- Тебе просто нужно загрузить код

---

## ШАГ 1: СОЗДАНИЕ ПРИЛОЖЕНИЯ В TIMEWEB CLOUD

**В интерфейсе Timeweb Cloud:**

1. **Главное меню → "Облачные серверы"**
2. **Нажми "Создать сервер"**
3. Выбери **Ubuntu 24.04**
4. Конфигурация: **2 ГБ RAM, 1 CPU, 30 ГБ диск**
5. **Нажми "Заказать"**

Сервер создастся за 2-3 минуты.

---

## ШАГ 2: ПОДКЛЮЧЕНИЕ И ПЕРВОНАЧАЛЬНАЯ НАСТРОЙКА

После создания сервера Timeweb выдаст:
- **IP адрес** (например: 123.45.67.89)
- **Пароль root** (в email)
- **Доступ через веб-терминал** (в кабинете)

### Подключись через веб-терминал ИЛИ SSH:
```bash
ssh root@123.45.67.89
# Введи пароль
```

После подключения просто выполнишь скрипт ниже.

---

## ШАГ 3: ПОЛНОСТЬЮ АВТОМАТИЧЕСКИЙ ДЕПЛОЙ (10 минут)

Просто скопируй всё ниже и вставь в терминал после подключения:

```bash
#!/bin/bash
set -e

echo "🚀 Начинаю полный деплой PROBOOST..."

# ═══════════════════════════════════════════════════════════════════════════
# 1. СИСТЕМА
# ═══════════════════════════════════════════════════════════════════════════

echo "📦 Обновляю систему..."
apt update && apt upgrade -y
apt install -y curl wget git build-essential

# ═══════════════════════════════════════════════════════════════════════════
# 2. NODE.JS И NPM
# ═══════════════════════════════════════════════════════════════════════════

echo "📦 Установляю Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

node --version
npm --version

# ═══════════════════════════════════════════════════════════════════════════
# 3. MONGODB (LOCAL)
# ═══════════════════════════════════════════════════════════════════════════

echo "📦 Установляю MongoDB..."
apt install -y mongodb-org

systemctl start mongod
systemctl enable mongod
systemctl status mongod

# Проверка
mongo --version

# ═══════════════════════════════════════════════════════════════════════════
# 4. PM2 (для запуска Node приложений)
# ═══════════════════════════════════════════════════════════════════════════

echo "📦 Установляю PM2 (менеджер процессов)..."
npm install -g pm2
pm2 startup
pm2 save

# ═══════════════════════════════════════════════════════════════════════════
# 5. NGINX (reverse proxy и SSL)
# ═══════════════════════════════════════════════════════════════════════════

echo "📦 Установляю Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx

# ═══════════════════════════════════════════════════════════════════════════
# 6. CERTBOT (SSL сертификаты от Let's Encrypt)
# ═══════════════════════════════════════════════════════════════════════════

echo "📦 Установляю Certbot для SSL..."
apt install -y certbot python3-certbot-nginx

# ═══════════════════════════════════════════════════════════════════════════
# 7. КЛОНИРУЕМ РЕПОЗИТОРИЙ
# ═══════════════════════════════════════════════════════════════════════════

echo "📦 Клонирую репозиторий..."
cd /opt
git clone https://github.com/Haward662/sait-main.git
cd sait-main

# ═══════════════════════════════════════════════════════════════════════════
# 8. УСТАНОВКА ЗАВИСИМОСТЕЙ БЭКЕНДА
# ═══════════════════════════════════════════════════════════════════════════

echo "📦 Установляю зависимости бэкенда..."
cd backend
npm install

# ═══════════════════════════════════════════════════════════════════════════
# 9. СОЗДАЁМ .ENV ФАЙЛ
# ═══════════════════════════════════════════════════════════════════════════

echo "📝 Создаю .env файл..."
cat > .env << 'EOF'
# Telegram Bot
TG_TOKEN=ТВОЙ_ТОКЕН_БОТ
TG_CHAT_ID=ТВОЙ_CHAT_ID

# OpenAI API
OPENAI_API_KEY=ТВОЙ_OPENAI_КЛЮЧ
OPENAI_BASE_URL=https://neuroapi.host/v1
OPENAI_MODEL=gpt-5.4-mini

# Gemini API
GEMINI_API_KEY=ТВОЙ_GEMINI_КЛЮЧ

# MongoDB
MONGO_URL=mongodb://localhost:27017/proboost-analytics

# Porty
PORT=5000
ANALYTICS_URL=http://localhost:5000

# Node Environment
NODE_ENV=production
EOF

echo "⚠️  ВАЖНО: Отредактируй .env файл:"
echo "   nano .env"
echo "   Добавь свои API ключи!"

# ═══════════════════════════════════════════════════════════════════════════
# 10. ЗАПУСК БЭКЕНДА ЧЕРЕЗ PM2
# ═══════════════════════════════════════════════════════════════════════════

echo "🚀 Запускаю бэкенд сервер..."
pm2 start server.js --name "proboost-api"
pm2 start telegram-bot.js --name "proboost-bot"
pm2 save

pm2 status

# ═══════════════════════════════════════════════════════════════════════════
# 11. NGINX КОНФИГУРАЦИЯ
# ═══════════════════════════════════════════════════════════════════════════

echo "⚙️  Настраиваю Nginx..."
cat > /etc/nginx/sites-available/proboost << 'EOF'
server {
    listen 80;
    server_name pro-boost.ru www.pro-boost.ru;

    # API (бэкенд на localhost:5000)
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Sitemap и feeds
    location /sitemap.xml {
        proxy_pass http://localhost:5000;
    }

    location /feed.xml {
        proxy_pass http://localhost:5000;
    }

    location /health {
        proxy_pass http://localhost:5000;
    }

    # Всё остальное - фронтенд (React статика)
    location / {
        # Это заполнишь потом - там фронтенд от App Platform
        return 404;
    }
}
EOF

ln -sf /etc/nginx/sites-available/proboost /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl reload nginx

echo "✅ Nginx готов"

# ═══════════════════════════════════════════════════════════════════════════
# ГОТОВО
# ═══════════════════════════════════════════════════════════════════════════

echo ""
echo "============================================"
echo "✅ ДЕПЛОЙ ЗАВЕРШЁН!"
echo "============================================"
echo ""
echo "📍 ЧТО СЕЙЧАС РАБОТАЕТ:"
echo "  ✅ Node.js и npm"
echo "  ✅ MongoDB (localhost:27017)"
echo "  ✅ Nginx (reverse proxy)"
echo "  ✅ PM2 (управление процессами)"
echo "  ✅ Certbot (готов для SSL)"
echo ""
echo "🔧 ЧТО НУЖНО СДЕЛАТЬ ВРУЧНУЮ:"
echo ""
echo "1️⃣  РЕДАКТИРУЕМ .env:"
echo "   cd /opt/sait-main/backend"
echo "   nano .env"
echo "   Вставь: TG_TOKEN, TG_CHAT_ID, OPENAI_API_KEY, GEMINI_API_KEY"
echo "   Ctrl+X → Y → Enter"
echo ""
echo "2️⃣  ПЕРЕЗАПУСКАЕМ БЭКЕНД:"
echo "   pm2 restart all"
echo "   pm2 logs"
echo ""
echo "3️⃣  ДОБАВЛЯЕМ SSL (если есть домен):"
echo "   certbot certonly --nginx -d pro-boost.ru -d www.pro-boost.ru"
echo ""
echo "4️⃣  ПРОВЕРЯЕМ ЧТО РАБОТАЕТ:"
echo "   curl http://localhost:5000/health"
echo ""
echo "5️⃣  СМОТРИМ ЛОГИ:"
echo "   pm2 logs"
echo "   pm2 logs proboost-api"
echo "   pm2 logs proboost-bot"
echo ""
echo "IP сервера: 123.45.67.89 (замени на свой)"
echo "API работает на: http://123.45.67.89:5000"
echo ""
echo "💬 Бот уже стартует автоматически!"
echo "   09:00 - генерирует статью"
echo "   18:00 - отправляет отчет"
echo ""
```

---

## ШАГ 4: ВВОДИМ СВОИ ДАННЫЕ (5 минут)

После выполнения скрипта сервер остановится и попросит заполнить `.env`:

```bash
cd /opt/sait-main/backend
nano .env
```

**Замени вот это:**
```env
TG_TOKEN=ТВОЙ_ТОКЕН_БОТ              ← @BotFather выдал
TG_CHAT_ID=ТВОЙ_CHAT_ID              ← Твой ChatID (можешь узнать у бота)
OPENAI_API_KEY=ТВОЙ_OPENAI_КЛЮЧ      ← openai.com
GEMINI_API_KEY=ТВОЙ_GEMINI_КЛЮЧ      ← ai.google.dev
```

**Сохрани:**
- Ctrl+X
- Y
- Enter

---

## ШАГ 5: ПЕРЕЗАПУСКАЕМ И ПРОВЕРЯЕМ (2 минуты)

```bash
# Перезапустить все процессы
pm2 restart all

# Проверить статус
pm2 status

# Смотреть логи (Ctrl+C для выхода)
pm2 logs

# Тест API
curl http://localhost:5000/health
```

Если видишь `{"status":"ok"}` - **всё работает!** ✅

---

## ШАГ 6: ДОБАВЛЯЕМ ДОМЕН И SSL (3 минуты)

Если у тебя есть домен `pro-boost.ru`:

```bash
# 1. Указать домен на IP в регистраторе
#    (А-запись на 123.45.67.89)

# 2. Подождать 5-10 минут

# 3. Добавить SSL сертификат
certbot certonly --nginx -d pro-boost.ru -d www.pro-boost.ru

# 4. Nginx автоматически обновит конфиг
```

---

## ШАГ 7: ФРОНТЕНД (ПОТОМ)

Сейчас фронтенд на App Platform. Можешь:

**Вариант А** (рекомендую):
- Оставить фронтенд на App Platform
- Только бэкенд на Timeweb
- Обновить `VITE_ANALYTICS_URL=https://pro-boost.ru` в App Platform переменных

**Вариант Б**:
- Загрузить фронтенд тоже на Timeweb
- Обновить Nginx конфиг
- (Но это усложнит жизнь)

---

## КОМАНДЫ ДЛЯ УПРАВЛЕНИЯ

```bash
# Статус всех приложений
pm2 status

# Логи
pm2 logs                    # Все логи
pm2 logs proboost-api      # Только API
pm2 logs proboost-bot      # Только бот

# Перезагрузка
pm2 restart all            # Перезагрузить всё
pm2 restart proboost-api   # Перезагрузить конкретное

# Остановка
pm2 stop all
pm2 start all

# Удалить приложение
pm2 delete proboost-api

# Смотреть место на диске
df -h

# Смотреть памяць
free -h

# Смотреть логи MongoDB
journalctl -u mongod -f
```

---

## ПРОБЛЕМЫ И РЕШЕНИЯ

### ❌ "Бот не отправляет сообщения"
```bash
# Проверь логи бота
pm2 logs proboost-bot

# Проверь переменные
cat backend/.env | grep TG_
```

### ❌ "API не работает"
```bash
# Проверь логи
pm2 logs proboost-api

# Проверь порт
netstat -tulpn | grep 5000

# Проверь MongoDB
systemctl status mongod
```

### ❌ "MongoDB не запускается"
```bash
systemctl restart mongod
journalctl -u mongod -f
```

### ❌ "Место на диске закончилось"
```bash
# Найти большие файлы
du -sh /opt/*
du -sh /var/log/*

# Очистить логи
journalctl --vacuum=500M
```

---

## ПРОВЕРКА ЧТО ВСЕМУ РАБОТАЕТ

1. **API жив?**
   ```bash
   curl http://localhost:5000/health
   ```
   Должно быть: `{"status":"ok"}`

2. **MongoDB работает?**
   ```bash
   mongosh
   > db.admin.ping()
   > exit
   ```
   Должно быть: `{ ok: 1 }`

3. **Бот запущен?**
   ```bash
   pm2 status | grep proboost-bot
   ```
   Должно быть: `online`

4. **Nginx работает?**
   ```bash
   curl http://localhost/api/health
   ```
   Должно быть: `{"status":"ok"}`

---

## ИТОГ

После выполнения всех шагов:
- ✅ Backend работает на http://123.45.67.89:5000
- ✅ Бот отправляет сообщения в Telegram
- ✅ 09:00 каждый день - новая статья
- ✅ 18:00 каждый день - отчет аналитики
- ✅ MongoDB хранит все данные
- ✅ Nginx прокси запросы

**Всё это произойдет за 15-20 минут одной командой!**

---

## НУЖНА ПОМОЩЬ?

Если что-то не работает:
1. Посмотри логи: `pm2 logs`
2. Проверь .env переменные
3. Перезагрузи сервер: `reboot`
4. Проверь статус: `pm2 status`

Всё должно заработать сразу! 🚀
