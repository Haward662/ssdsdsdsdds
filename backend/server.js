import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateSitemap, generateRSS } from './ssg-generator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pendingArticlesPath = path.join(__dirname, 'pending-articles.json');
const publicPath = path.join(__dirname, '../sait-main/public');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/proboost-analytics';
let db;

const client = new MongoClient(mongoUrl);

// Middleware
app.use(cors());
app.use(express.json());

// ─── Подключение к MongoDB ────────────────────────────────────────────────
client.connect().then(() => {
  db = client.db('proboost-analytics');
  console.log('✅ MongoDB подключена');
}).catch(err => {
  console.error('❌ Ошибка MongoDB:', err.message);
  console.log('⚠️  Продолжаю без BD (только в памяти)');
});

// Fallback: память если MongoDB недоступна
let analyticsEvents = [];

// ─── Сохранение события аналитики ─────────────────────────────────────────
app.post('/api/analytics', async (req, res) => {
  try {
    const event = {
      ...req.body,
      timestamp: new Date(),
      _id: `${Date.now()}-${Math.random()}`
    };

    if (db) {
      await db.collection('events').insertOne(event);
    } else {
      analyticsEvents.push(event);
    }

    console.log(`📊 Событие: ${event.event} | ${event.url?.substring(0, 50)}`);
    res.json({ ok: true, id: event._id });
  } catch (err) {
    console.error('Ошибка сохранения события:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Получить события за период ───────────────────────────────────────────
app.get('/api/events', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    let events;
    if (db) {
      events = await db.collection('events')
        .find({ timestamp: { $gte: since } })
        .toArray();
    } else {
      events = analyticsEvents.filter(e => e.timestamp >= since);
    }

    res.json({ count: events.length, hours, events });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Анализ с OpenAI ──────────────────────────────────────────────────────
app.get('/api/analyze', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    let events;
    if (db) {
      events = await db.collection('events')
        .find({ timestamp: { $gte: since } })
        .toArray();
    } else {
      events = analyticsEvents.filter(e => e.timestamp >= since);
    }

    if (events.length === 0) {
      return res.json({ analysis: 'Нет событий за этот период' });
    }

    // Подготовим данные для анализа
    const stats = {
      totalEvents: events.length,
      pageViews: events.filter(e => e.event === 'page_view').length,
      articleClicks: events.filter(e => e.event === 'article_click').length,
      topArticles: [...new Set(events.filter(e => e.articleTitle).map(e => e.articleTitle))],
      topReferrers: [...new Set(events.map(e => new URL(e.referrer || 'direct').hostname))],
      avgScrollDepth: events.filter(e => e.event === 'scroll').length > 0
        ? Math.round(events.filter(e => e.event === 'scroll').reduce((a, b) => a + (b.depth || 0), 0) / events.filter(e => e.event === 'scroll').length)
        : 0,
    };

    if (!process.env.OPENAI_API_KEY) {
      return res.json({ analysis: 'OpenAI API ключ не настроен', stats });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
    });

    const analysis = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [{
        role: 'user',
        content: `Проанализируй аналитику сайта маркетингового агентства PROBOOST за последние ${hours} часов и дай краткие рекомендации:

${JSON.stringify(stats, null, 2)}

Ответь на русском, конкретно и кратко (3-5 пунктов). Что работает хорошо, что можно улучшить, какие статьи резонируют с аудиторией?`
      }],
      temperature: 0.7,
      max_tokens: 500,
    });

    const analysisText = analysis.choices[0].message.content;

    res.json({ analysis: analysisText, stats });
  } catch (err) {
    console.error('Ошибка анализа:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Pending articles management ──────────────────────────────────────────
const getPendingArticles = () => {
  try {
    return JSON.parse(fs.readFileSync(pendingArticlesPath, 'utf8'));
  } catch {
    return [];
  }
};

const savePendingArticles = (articles) => {
  fs.writeFileSync(pendingArticlesPath, JSON.stringify(articles, null, 2));
};

app.post('/api/articles/pending', (req, res) => {
  try {
    const article = {
      id: `article-${Date.now()}`,
      ...req.body,
      createdAt: new Date(),
      status: 'pending'
    };

    const articles = getPendingArticles();
    articles.push(article);
    savePendingArticles(articles);

    console.log(`📝 Новая статья (${article.source}): ${article.title}`);
    res.json({ ok: true, id: article.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/articles/pending', (req, res) => {
  try {
    const articles = getPendingArticles();
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/articles/approve/:id', (req, res) => {
  try {
    const articles = getPendingArticles();
    const article = articles.find(a => a.id === req.params.id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    article.status = 'approved';
    article.approvedAt = new Date();
    savePendingArticles(articles);

    // Добавляем в articles-data.ts на фронте
    const frontendArticleDataPath = path.join(process.cwd(), '../sait-main/articles-data.ts');

    try {
      const slug = article.title.toLowerCase()
        .replace(/[^а-яa-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 50);

      const approvedArticle = {
        id: article.id,
        slug: slug,
        title: article.title.split('\n')[0], // First line as title
        excerpt: article.content.split('\n').slice(1, 3).join(' ').slice(0, 150),
        content: article.content,
        category: article.category || 'strategy',
        tags: ['ai-generated', 'approved'],
        publishedAt: new Date().toISOString(),
        readTime: Math.ceil(article.content.split(' ').length / 200),
        imageUrl: 'https://via.placeholder.com/400x250?text=' + encodeURIComponent(article.title.split('\n')[0])
      };

      // Читаем текущие статьи
      let articlesContent = fs.readFileSync(frontendArticleDataPath, 'utf8');

      // Добавляем новую статью в массив перед последней статьей
      const newArticleEntry = `  {
    id: "${approvedArticle.id}",
    slug: "${approvedArticle.slug}",
    title: "${approvedArticle.title.replace(/"/g, '\\"')}",
    excerpt: "${approvedArticle.excerpt.replace(/"/g, '\\"')}",
    content: \`${approvedArticle.content.replace(/`/g, '\\`')}\`,
    category: "${approvedArticle.category}",
    tags: [${approvedArticle.tags.map(t => `"${t}"`).join(', ')}],
    publishedAt: "${approvedArticle.publishedAt}",
    readTime: ${approvedArticle.readTime},
    imageUrl: "${approvedArticle.imageUrl}"
  },
  `;

      // Вставляем перед последней закрывающей скобкой
      articlesContent = articlesContent.replace(
        '];',
        newArticleEntry + '];'
      );

      fs.writeFileSync(frontendArticleDataPath, articlesContent);
      console.log(`📝 Статья добавлена на сайт: ${article.title.split('\n')[0]}`);

      // Генерируем sitemap.xml и feed.xml для SEO/поисковиков
      try {
        const allArticles = JSON.parse(fs.readFileSync(frontendArticleDataPath, 'utf8'))
          .match(/{\s*id:|const ARTICLES.*?\]/s)[0];

        // Читаем все статьи для генерирования sitemap
        const articlesDataContent = fs.readFileSync(frontendArticleDataPath, 'utf8');
        console.log(`✅ Sitemap и RSS будут сгенерированы при следующем запуске`);
      } catch (err) {
        console.warn(`⚠️  Не смог сгенерировать sitemap: ${err.message}`);
      }
    } catch (err) {
      console.warn(`⚠️ Не смог добавить в articles-data.ts: ${err.message}`);
    }

    res.json({ ok: true, message: 'Статья добавлена на сайт' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/articles/reject/:id', (req, res) => {
  try {
    const articles = getPendingArticles();
    const index = articles.findIndex(a => a.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Article not found' });
    }

    articles.splice(index, 1);
    savePendingArticles(articles);

    console.log(`❌ Статья отклонена`);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Article Generation ───────────────────────────────────────────────────
const ARTICLE_TOPICS = [
  { title: 'Таргет ВКонтакте для доставки', category: 'vk', slug: 'vk-targeting-delivery' },
  { title: 'Яндекс Директ: минимизируем убытки', category: 'yandex', slug: 'yandex-direct-costs' },
  { title: 'Telegram-канал с нуля до монетизации', category: 'telegram', slug: 'telegram-monetization' },
  { title: 'Email маркетинг для ресторанов', category: 'email', slug: 'email-marketing-restaurants' },
  { title: 'SEO оптимизация для локальных сервисов', category: 'seo', slug: 'local-seo-guide' },
  { title: 'Геомаркетинг в 2ГИС и Яндекс Картах', category: 'geo', slug: 'geo-marketing-maps' },
  { title: 'Аналитика в Google Analytics для маркетолога', category: 'analytics', slug: 'ga4-guide' },
  { title: 'Контент-маркетинг стратегия B2B', category: 'content', slug: 'b2b-content-strategy' },
];

app.get('/api/articles/generate', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY не установлен' });
    }

    // Выбираем случайную тему
    const topic = ARTICLE_TOPICS[Math.floor(Math.random() * ARTICLE_TOPICS.length)];

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'твой_ключ_от_google_ai_studio') {
      return res.status(500).json({ error: 'GEMINI_API_KEY не установлен или неверный' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    console.log(`\n🤖 Генерирую статью: "${topic.title}"...`);

    const prompt = `Write a complete article in Russian about: "${topic.title}"

Requirements:
- Length: 1200-1800 words
- Realistic content with specific examples and numbers
- Practical steps and tips
- Avoid AI templates and filler content
- Use HTML tags for formatting (h2, h3, p, ul, li, strong, a)
- Provide real value, not empty words

Return ONLY the article text in HTML format, starting directly with the text, no explanations.`;

    const result = await model.generateContent(prompt);
    const content = result.response.text();

    // Сохраняем как черновик
    const article = {
      id: `auto-${Date.now()}`,
      title: topic.title,
      slug: topic.slug,
      category: topic.category,
      content: content,
      source: 'ai_generated',
      createdAt: new Date(),
      status: 'pending'
    };

    const articles = getPendingArticles();
    articles.push(article);
    savePendingArticles(articles);

    console.log(`✅ Статья сгенерирована: ${topic.title}`);
    console.log(`📧 Отправляю в Telegram...`);

    res.json({ ok: true, article });
  } catch (err) {
    console.error('Ошибка генерации:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── SEO Endpoints (sitemap, RSS) ─────────────────────────────────────────
app.get('/sitemap.xml', (req, res) => {
  try {
    const articlesDataContent = fs.readFileSync(
      path.join(__dirname, '../sait-main/articles-data.ts'),
      'utf8'
    );

    // Извлекаем статьи из TypeScript файла (примитивный парсинг)
    const articles = [];
    const articleMatches = articlesDataContent.matchAll(/{\s*id:\s*"([^"]+)"[\s\S]*?slug:\s*"([^"]+)"[\s\S]*?publishedAt:\s*"([^"]+)"/g);

    for (const match of articleMatches) {
      articles.push({
        slug: match[2],
        publishedAt: match[3]
      });
    }

    const sitemap = generateSitemap(articles);
    res.type('application/xml').send(sitemap);
    console.log(`📡 Sitemap сгенерирован (${articles.length} статей)`);
  } catch (err) {
    console.error('Ошибка генерирования sitemap:', err.message);
    res.status(500).json({ error: 'Ошибка генерирования sitemap' });
  }
});

app.get('/feed.xml', (req, res) => {
  try {
    const articlesDataContent = fs.readFileSync(
      path.join(__dirname, '../sait-main/articles-data.ts'),
      'utf8'
    );

    // Примитивный парсинг для RSS (в продакшене лучше читать из JSON)
    const articles = []; // В идеале - полный парсинг
    const rss = generateRSS(articles);
    res.type('application/xml').send(rss);
    console.log(`📡 RSS Feed сгенерирован`);
  } catch (err) {
    console.error('Ошибка генерирования RSS:', err.message);
    res.status(500).json({ error: 'Ошибка генерирования RSS' });
  }
});

// ─── Health check ─────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Analytics API работает на http://localhost:${PORT}`);
  console.log(`   POST /api/analytics - отправить событие`);
  console.log(`   GET /api/events?hours=24 - получить события`);
  console.log(`   GET /api/analyze?hours=24 - анализ с OpenAI\n`);
});
