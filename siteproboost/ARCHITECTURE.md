# 🏗️ SEO Bot - Архитектура v2.0

## Общее описание

**SEO Bot** - это автоматизированная система для генерации SEO-оптимизированного контента блога маркетингового агентства.

- **Интеграция**: Max (VK Workspace) + Webhooks
- **Генерация**: NeuroAPI (OpenAI совместимый)
- **Хранилище**: MongoDB
- **Функции**: автоматическая генерация, ручное управление, одобрение/публикация

---

## 📁 Структура проекта

```
backend/
├── server.js                 # Основной Express сервер + CRON
├── .env.example              # Шаблон переменных окружения
├── package.json              # Зависимости
│
├── routes/                   # Express роуты
│   ├── webhook.js           # POST /webhook/max - прием сообщений из Max
│   └── drafts.js            # GET/POST /api/drafts/* - управление черновиками
│
├── services/                # Бизнес-логика и интеграции
│   ├── command-parser.js    # Парсинг команд из Max ("Ниша: X | Тема: Y")
│   ├── neuroapi.js          # Генерация статей через NeuroAPI
│   └── max-api.js           # Отправка сообщений и кнопок в Max
│
└── models/                  # (будущее) Mongoose схемы для MongoDB
```

---

## 🔄 Логика работы

### 1. Ежедневная генерация (10:00 Новосибирск)

```
CRON (03:00 UTC = 10:00 NSK)
  ↓
Генерируем 3 статьи с random нишей и темой
  ↓
Сохраняем в MongoDB (status: 'pending_approval')
  ↓
Отправляем в Max с кнопками [✅ Одобрить] [❌ Переделать]
```

### 2. Команда пользователя в Max

```
Пользователь пишет: "Ниша: SEO | Тема: Как писать мета-теги"
  ↓
Webhook на POST /webhook/max
  ↓
parseMaxCommand() парсит ниша + тема
  ↓
generateArticle(niche, topic) через NeuroAPI
  ↓
Сохраняем в MongoDB (status: 'pending_approval', source: 'user')
  ↓
sendMessageToMax() отправляет ссылку и кнопки одобрения
```

### 3. Одобрение статьи

```
Пользователь нажимает [✅ Одобрить]
  ↓
POST /api/drafts/:id/approve
  ↓
Обновляем статус: 'published'
  ↓
Сохраняем в collection 'articles'
  ↓
sendMessageToMax() подтверждает публикацию с ссылкой на сайт
```

### 4. Отклонение/переделка

```
Пользователь нажимает [❌ Переделать]
  ↓
POST /api/drafts/:id/reject
  ↓
Удаляем черновик
  ↓
sendMessageToMax() отправляет уведомление
  ↓
Пользователь может создать новую статью через команду
```

---

## 🔧 API Endpoints

### Webhooks
- **POST /webhook/max** - Получить сообщение из Max
  - Обрабатывает команды "Ниша: X | Тема: Y"
  - Генерирует статью и отправляет на одобрение

### Управление черновиками
- **GET /api/drafts** - Список всех черновиков
- **GET /api/drafts/:id** - Один черновик
- **POST /api/drafts/:id/approve** - Одобрить и опубликовать
- **POST /api/drafts/:id/reject** - Отклонить (удалить)
- **POST /api/drafts/:id/update** - Обновить содержимое

### Health check
- **GET /health** - Проверка статуса сервера

---

## 🗄️ MongoDB Collections

### drafts
```javascript
{
  _id: "draft-1234567890",
  title: "SEO: Как писать мета-теги",
  niche: "SEO",
  topic: "Как писать мета-теги",
  content: "<h2>Заголовок</h2>...",
  source: "user" | "auto",              // источник: пользователь или автоген
  status: "pending_approval" | "draft" | "published",
  createdAt: 2024-01-15T10:00:00Z,
  approvedAt: 2024-01-15T10:05:00Z,
  publishedAt: 2024-01-15T10:06:00Z,
  userId: "max_user_123",               // ID пользователя в Max
  conversationId: "max_conv_456"        // ID беседы в Max
}
```

### articles
```javascript
{
  _id: "article-1234567890",
  title: "SEO: Как писать мета-теги",
  niche: "SEO",
  topic: "Как писать мета-теги",
  content: "<h2>Заголовок</h2>...",
  source: "user" | "auto",
  status: "published",
  createdAt: 2024-01-15T10:00:00Z,
  publishedAt: 2024-01-15T10:06:00Z
}
```

---

## 🚀 Запуск

```bash
# Установка зависимостей
npm install

# Копировать .env.example в .env и заполнить значения
cp .env.example .env
nano .env

# Запуск сервера
npm start

# Dev режим (с hot reload)
npm run dev
```

---

## 📦 Переменные окружения (.env)

```env
PORT=5000
NODE_ENV=production
SERVER_URL=your-server.com

OPENAI_API_KEY=your-neuroapi-key
OPENAI_BASE_URL=https://neuroapi.host/v1
OPENAI_MODEL=gpt-5.4-mini

MONGO_URL=mongodb://localhost:27017/seo-bot

MAX_API_URL=https://api.max.im
MAX_BOT_TOKEN=your-max-bot-token
MAX_BOT_ID=your-max-bot-id
```

---

## 🔮 Будущие расширения (архитектура готова)

### 1. Парсинг Яндекса перед генерацией
- Добавить `services/yandex-parser.js`
- В webhook перед `generateArticle()` вызвать `getYandexTrends(niche, topic)`
- Результаты добавить в промпт для более релевантного контента

### 2. A/B тестирование разных промптов
- Добавить поле `promptVariant` в draft
- Хранить несколько версий системного промпта
- Анализировать какие работают лучше

### 3. Фронтенд панель управления
- Dashboard для просмотра черновиков
- Inline редактирование прямо в панели
- История опубликованных статей

### 4. Email уведомления
- Вместо/в дополнение к Max отправлять email
- Добавить `services/email.js`

### 5. Интеграция с другими мессенджерами
- Slack, Telegram, Discord
- Один системный промпт, разные интеграции

---

## 🧹 Чистота кода

✅ **Separation of Concerns**
- Routes - только обработка запросов
- Services - бизнес-логика
- Models - структуры данных

✅ **DRY (Don't Repeat Yourself)**
- Один `generateArticle()` используется везде
- Один системный промпт в одном месте

✅ **Easy to extend**
- Добавить новый сервис? Просто создай файл в `/services/`
- Добавить новый route? Просто импортируй в `server.js`
- Добавить новый webhook? Добавь обработчик в `routes/webhook.js`

