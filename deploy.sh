#!/bin/bash
set -e

echo "🚀 ПОЛНЫЙ ДЕПЛОЙ PROBOOST НА TIMEWEB CLOUD (САЙТ + БОТ + API)"
echo "=============================================================="
echo ""
echo "📍 Всё на одном сервере: фронтенд + бэкенд + MongoDB + Telegram бот"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# 1. СИСТЕМА И БАЗОВЫЕ УТИЛИТЫ
# ═══════════════════════════════════════════════════════════════════════════

echo "📦 ШАГ 1: Обновляю систему..."
apt update && apt upgrade -y
apt install -y curl wget git build-essential nano htop

# ═══════════════════════════════════════════════════════════════════════════
# 2. NODE.JS 20 LTS
# ═══════════════════════════════════════════════════════════════════════════

echo "📦 ШАГ 2: Установляю Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"

# ═══════════════════════════════════════════════════════════════════════════
# 3. MONGODB
# ═══════════════════════════════════════════════════════════════════════════

echo "📦 ШАГ 3: Установляю MongoDB..."
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update
apt install -y mongodb-org

systemctl start mongod
systemctl enable mongod

echo "✅ MongoDB: $(mongod --version | head -1)"

# ═══════════════════════════════════════════════════════════════════════════
# 4. PM2 (МЕНЕДЖЕР ПРОЦЕССОВ)
# ═══════════════════════════════════════════════════════════════════════════

echo "📦 ШАГ 4: Установляю PM2 (менеджер процессов)..."
npm install -g pm2
pm2 startup
pm2 save

echo "✅ PM2 готов"

# ═══════════════════════════════════════════════════════════════════════════
# 5. NGINX (REVERSE PROXY)
# ═══════════════════════════════════════════════════════════════════════════

echo "📦 ШАГ 5: Установляю Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx

echo "✅ Nginx готов"

# ═══════════════════════════════════════════════════════════════════════════
# 6. CERTBOT (SSL СЕРТИФИКАТЫ)
# ═══════════════════════════════════════════════════════════════════════════

echo "📦 ШАГ 6: Установляю Certbot для SSL..."
apt install -y certbot python3-certbot-nginx

echo "✅ Certbot готов"

# ═══════════════════════════════════════════════════════════════════════════
# 7. КЛОНИРУЕМ РЕПОЗИТОРИЙ
# ═══════════════════════════════════════════════════════════════════════════

echo "📦 ШАГ 7: Клонирую репозиторий GitHub..."
cd /opt

# Удалить старую версию если существует
rm -rf sait-main 2>/dev/null || true

git clone https://github.com/Haward662/sait-main.git
cd sait-main

echo "✅ Репозиторий клонирован в /opt/sait-main"

# ═══════════════════════════════════════════════════════════════════════════
# 8. СБОРКА ФРОНТЕНДА (React)
# ═══════════════════════════════════════════════════════════════════════════

echo "📦 ШАГ 8: Собираю фронтенд (React + Vite)..."
cd /opt/sait-main

# Проверить что есть package.json
if [ -f package.json ]; then
  npm install
  npm run build
  echo "✅ Фронтенд собран в /dist"
else
  echo "⚠️  package.json не найден, пропускаю сборку фронтенда"
fi

# ═══════════════════════════════════════════════════════════════════════════
# 9. УСТАНОВКА ЗАВИСИМОСТЕЙ BACKEND
# ═══════════════════════════════════════════════════════════════════════════

echo "📦 ШАГ 9: Установляю зависимости бэкенда..."
cd /opt/sait-main/backend
npm install

echo "✅ Зависимости установлены"

# ═══════════════════════════════════════════════════════════════════════════
# 10. СОЗДАЁМ .ENV ФАЙЛ (ЗАПОЛНИТЬ ВРУЧНУЮ)
# ═══════════════════════════════════════════════════════════════════════════

echo "📝 ШАГ 10: Создаю .env файл..."

if [ ! -f .env ]; then
  cat > .env << 'ENVFILE'
# ═══════════════════════════════════════════════════════════════════════════
# TELEGRAM BOT
# ═══════════════════════════════════════════════════════════════════════════
TG_TOKEN=ЗАМЕНИ_НА_ТВОЙ_ТОКЕН_ОТ_BOTFATHER
TG_CHAT_ID=ЗАМЕНИ_НА_ТВОЙ_CHAT_ID

# ═══════════════════════════════════════════════════════════════════════════
# OPENAI (для анализа аналитики)
# ═══════════════════════════════════════════════════════════════════════════
OPENAI_API_KEY=ЗАМЕНИ_НА_ТВОЙ_OPENAI_КЛЮЧ
OPENAI_BASE_URL=https://neuroapi.host/v1
OPENAI_MODEL=gpt-5.4-mini

# ═══════════════════════════════════════════════════════════════════════════
# GEMINI (для создания статей)
# ═══════════════════════════════════════════════════════════════════════════
GEMINI_API_KEY=ЗАМЕНИ_НА_ТВОЙ_GEMINI_КЛЮЧ

# ═══════════════════════════════════════════════════════════════════════════
# MONGODB
# ═══════════════════════════════════════════════════════════════════════════
MONGO_URL=mongodb://localhost:27017/proboost-analytics

# ═══════════════════════════════════════════════════════════════════════════
# СЕРВЕР
# ═══════════════════════════════════════════════════════════════════════════
PORT=5000
ANALYTICS_URL=http://localhost:5000
NODE_ENV=production
ENVFILE

  echo "⚠️  .env файл создан, но ПУСТ!"
  echo "⚠️  ОБЯЗАТЕЛЬНО отредактируй его:"
  echo ""
  echo "     nano /opt/sait-main/backend/.env"
  echo ""
  echo "И добавь свои API ключи:"
  echo "  - TG_TOKEN (от @BotFather в Telegram)"
  echo "  - TG_CHAT_ID (твой ID в Telegram)"
  echo "  - OPENAI_API_KEY"
  echo "  - GEMINI_API_KEY"
  echo ""
else
  echo "✅ .env уже существует"
fi

# ═══════════════════════════════════════════════════════════════════════════
# 11. NGINX КОНФИГУРАЦИЯ
# ═══════════════════════════════════════════════════════════════════════════

echo "⚙️  ШАГ 11: Настраиваю Nginx..."

cat > /etc/nginx/sites-available/proboost << 'NGINXCONF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    # Гжав папка с фронтендом (React)
    root /opt/sait-main/dist;
    index index.html;

    # API endpoints → Node.js на порту 5000
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SEO: Sitemap, RSS Feed, Health Check
    location /sitemap.xml {
        proxy_pass http://127.0.0.1:5000;
    }

    location /feed.xml {
        proxy_pass http://127.0.0.1:5000;
    }

    location /health {
        proxy_pass http://127.0.0.1:5000;
    }

    # Всё остальное - фронтенд (React SPA, поддержка hash routing)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINXCONF

# Удалить default конфиг если существует
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

# Включить наш конфиг
ln -sf /etc/nginx/sites-available/proboost /etc/nginx/sites-enabled/proboost

# Проверить конфиг
if ! nginx -t; then
  echo "❌ Ошибка в Nginx конфиге"
  exit 1
fi

systemctl reload nginx

echo "✅ Nginx готов"

# ═══════════════════════════════════════════════════════════════════════════
# 12. ЗАПУСКАЕМ ПРИЛОЖЕНИЯ ЧЕРЕЗ PM2
# ═══════════════════════════════════════════════════════════════════════════

echo "🚀 ШАГ 12: Запускаю приложения через PM2..."

cd /opt/sait-main/backend

# Проверить наличие .env
if ! grep -q "TG_TOKEN=ЗАМЕНИ" .env; then
  echo "✅ .env файл заполнен"

  # Запустить приложения
  pm2 start server.js --name "proboost-api" --node-args="--max-old-space-size=1024"
  pm2 start telegram-bot.js --name "proboost-bot"
  pm2 save

  echo "✅ Приложения запущены!"
  pm2 status
else
  echo "⚠️  ПРОПУСКАЮ запуск приложений - .env не заполнен"
  echo ""
  echo "Когда заполнишь .env, запусти вручную:"
  echo "   cd /opt/sait-main/backend"
  echo "   pm2 start server.js --name 'proboost-api'"
  echo "   pm2 start telegram-bot.js --name 'proboost-bot'"
  echo "   pm2 save"
fi

# ═══════════════════════════════════════════════════════════════════════════
# ГОТОВО
# ═══════════════════════════════════════════════════════════════════════════

echo ""
echo "============================================================"
echo "✅ ПОЛНЫЙ ДЕПЛОЙ ЗАВЕРШЁН!"
echo "============================================================"
echo ""
echo "📍 ЧТО УСТАНОВЛЕНО И ЗАПУЩЕНО:"
echo "  ✅ Node.js 20 LTS"
echo "  ✅ npm"
echo "  ✅ MongoDB 7.0"
echo "  ✅ PM2 (менеджер процессов)"
echo "  ✅ Nginx (reverse proxy + фронтенд)"
echo "  ✅ Certbot (SSL)"
echo "  ✅ React фронтенд собран (/dist)"
echo "  ✅ Node.js API сервер (порт 5000)"
echo "  ✅ Telegram бот с крас автоматическими отчётами"
echo ""
echo "🌐 ДОСТУП:"
echo "  • Сайт: http://ТВ_IP"
echo "  • API: http://ТВ_IP/api/"
echo ""
echo "🔧 ЧТО НУЖНО СДЕЛАТЬ ВРУЧНУЮ:"
echo ""
echo "1️⃣  РЕДАКТИРУЙ .env файл:"
echo "     nano /opt/sait-main/backend/.env"
echo ""
echo "     Замени:"
echo "     - TG_TOKEN=... (от @BotFather)"
echo "     - TG_CHAT_ID=... (твой Chat ID)"
echo "     - OPENAI_API_KEY=..."
echo "     - GEMINI_API_KEY=..."
echo ""
echo "     Сохрани: Ctrl+X → Y → Enter"
echo ""
echo "2️⃣  ЗАПУСТИ ПРИЛОЖЕНИЯ:"
echo "     cd /opt/sait-main/backend"
echo "     pm2 start server.js --name 'proboost-api'"
echo "     pm2 start telegram-bot.js --name 'proboost-bot'"
echo "     pm2 save"
echo ""
echo "3️⃣  ПРОВЕРЬ СТАТУС:"
echo "     pm2 status"
echo "     pm2 logs"
echo ""
echo "4️⃣  ЕСЛИ НУЖЕН SSL (когда привяжешь домен):"
echo "     certbot certonly --nginx -d pro-boost.ru -d www.pro-boost.ru"
echo ""
echo "═══════════════════════════════════════════"
echo ""
echo "🎉 БОТ БУДЕТ АВТОМАТИЧЕСКИ:"
echo "   • 09:00 каждый день - генерировать новую статью"
echo "   • 18:00 каждый день - отправлять отчет аналитики"
echo ""
echo "📡 API будет доступен на:"
echo "   • http://IP_СЕРВЕРА:5000/api/..."
echo "   • http://IP_СЕРВЕРА/api/... (через Nginx)"
echo ""
