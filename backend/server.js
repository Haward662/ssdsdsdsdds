import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import cron from 'node-cron';
import { Bot, Keyboard } from '@maxhub/max-bot-api';
import { generateArticle } from './services/neuroapi.js';

const app = express();
const PORT = process.env.PORT || 4000;

// ════════════════════════════════════════════════
// MONGODB
// ════════════════════════════════════════════════

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/proboost';
const client = new MongoClient(mongoUrl);
let db;

async function connectDB() {
  await client.connect();
  db = client.db('proboost');
  console.log('✅ MongoDB подключена');
}

connectDB().catch(err => {
  console.error('❌ MongoDB ошибка:', err.message);
  process.exit(1);
});

// ════════════════════════════════════════════════
// EXPRESS
// ════════════════════════════════════════════════

app.use(cors());
app.use(express.json());

app.get('/api/articles', async (req, res) => {
  try {
    const articles = await db.collection('articles')
      .find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .toArray();
      
    const mapped = articles.map(a => ({
      ...a,
      id: a._id,
      category: a.category || a.niche || 'Статьи',
      excerpt: a.excerpt || (a.content ? a.content.replace(/[#*`>_~]/g, '').replace(/\n+/g, ' ').substring(0, 150) + '...' : ''),
      imageUrl: a.imageUrl || 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800&h=450',
      readTime: a.readTime || (a.content ? Math.ceil(a.content.split(' ').length / 200) : 5),
      tags: a.tags || []
    }));
    
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/articles/:id', async (req, res) => {
  try {
    const article = await db.collection('articles').findOne({ _id: req.params.id });
    if (!article) return res.status(404).json({ error: 'Не найдено' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/drafts', async (req, res) => {
  try {
    const drafts = await db.collection('articles')
      .find({ status: 'draft' })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(drafts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

app.listen(PORT, () => console.log(`🚀 Express на порту ${PORT}`));

// ════════════════════════════════════════════════
// MAX BOT
// ════════════════════════════════════════════════

const bot = new Bot(process.env.MAX_BOT_TOKEN);

// Состояние пользователя
const userState = {};

// ─── Кнопки ────────────────────────────────────

const MAIN_KEYBOARD = Keyboard.inlineKeyboard([
  [
    Keyboard.button.callback('🚀 Генерировать сейчас', 'menu_generate'),
    Keyboard.button.callback('📋 Черновики', 'menu_drafts')
  ],
  [
    Keyboard.button.callback('✅ Опубликовать на сайт', 'menu_publish'),
    Keyboard.button.callback('⏱ Расписание', 'menu_schedule')
  ],
  [
    Keyboard.button.callback('📥 Загрузить готовый текст', 'menu_upload')
  ]
]);

const MAIN_MENU = { attachments: [MAIN_KEYBOARD] };

function withKeyboard(keyboard) {
  return { attachments: [keyboard] };
}

function approveButtons(draftId) {
  return withKeyboard(Keyboard.inlineKeyboard([
    [
      Keyboard.button.callback('✅ Одобрить', `approve_${draftId}`),
      Keyboard.button.callback('❌ Отклонить', `reject_${draftId}`)
    ],
    [
      Keyboard.button.callback('📋 Все черновики', 'menu_drafts')
    ]
  ]));
}

// ─── /start ───────────────────────────────────

bot.command('start', async (ctx) => {
  console.log('📍 /start');
  await ctx.reply('👋 Привет! Я SEO-автоматизатор.\nВыбери действие:', MAIN_MENU);
});

// ─── Обработка нажатий кнопок (action) ────────

function getActionUserId(ctx) {
  return (
    ctx.update?.callback?.user?.user_id ||
    ctx.update?.callback?.user?.id ||
    'unknown'
  );
}

bot.action('menu_generate', async (ctx) => {
  const userId = getActionUserId(ctx);
  console.log(`🎯 menu_generate userId=${userId}`);
  userState[userId] = 'waiting_niche';
  await ctx.reply('✍️ Введи нишу:\nПример: SEO, Доставка еды, Строительство');
});

bot.action('menu_drafts', async (ctx) => {
  await showDrafts(ctx);
});

bot.action('menu_publish', async (ctx) => {
  await showDrafts(ctx);
});

bot.action('menu_schedule', async (ctx) => {
  await ctx.reply('⏱ Расписание: каждый день в 15:00 (NSK)\n\nЧтобы изменить — напиши:\nрасписание 10:00', MAIN_MENU);
});

bot.action('menu_upload', async (ctx) => {
  const userId = getActionUserId(ctx);
  console.log(`📥 menu_upload userId=${userId}`);
  userState[userId] = 'waiting_ready_text';
  await ctx.reply('📥 Отправь мне готовый текст статьи.\nОн будет сохранён как черновик без обработки NeuroAPI.');
});

bot.action('menu_main', async (ctx) => {
  await ctx.reply('Выбери действие:', MAIN_MENU);
});

bot.action(/^approve_(.+)$/, async (ctx) => {
  const draftId = ctx.match[1];
  await publishDraft(ctx, draftId);
});

bot.action(/^reject_(.+)$/, async (ctx) => {
  const draftId = ctx.match[1];
  await rejectDraft(ctx, draftId);
});

// ─── Обработка кнопок и сообщений ─────────────

bot.on('message_created', async (ctx) => {
  try {
    const text = (
      ctx.message?.body?.text ||
      ctx.message?.text ||
      ''
    ).trim();

    const userId = ctx.message?.sender?.user_id || ctx.message?.sender?.userId || 'unknown';

    console.log(`📬 [${userId}]: "${text}" | state=${JSON.stringify(userState[userId])} | allStates=${JSON.stringify(Object.keys(userState))}`);

    if (!text) return;

    // ─ Состояние: ожидаем готовый текст (прямая загрузка без NeuroAPI)
    if (userState[userId] === 'waiting_ready_text') {
      delete userState[userId];
      try {
        const title = text.substring(0, 100).replace(/[\n\r]/g, ' ');
        const draft = {
          _id: `upload-${Date.now()}`,
          title,
          niche: 'Пользовательский контент',
          topic: title,
          content: text,
          slug: title.toLowerCase().replace(/[^a-zа-яё0-9]/gi, '-').substring(0, 80),
          source: 'user_upload',
          status: 'draft',
          createdAt: new Date(),
          publishedAt: null
        };
        await db.collection('articles').insertOne(draft);
        console.log(`📥 Готовый текст сохранён: ${draft._id}`);
        await ctx.reply(
          `✅ Черновик сохранён!\n\n📌 ${draft.title}\n\nИспользуй кнопку «Черновики» чтобы опубликовать.`,
          approveButtons(draft._id)
        );
      } catch (err) {
        console.error('❌ Ошибка сохранения текста:', err.message);
        await ctx.reply(`❌ Ошибка сохранения: ${err.message}`, MAIN_MENU);
      }
      return;
    }

    // ─ Состояние: ожидаем нишу
    if (userState[userId] === 'waiting_niche') {
      userState[userId] = { step: 'waiting_topic', niche: text };
      await ctx.reply('✍️ Ниша принята! Теперь напиши тему статьи:');
      return;
    }

    // ─ Состояние: ожидаем тему
    if (userState[userId]?.step === 'waiting_topic') {
      const niche = userState[userId].niche;
      const topic = text;
      delete userState[userId];
      await ctx.reply('⏳ Генерирую статью, подожди...');
      await generateAndSave(ctx, niche, topic);
      return;
    }

    // ─ Кнопка: Генерировать
    if (text === 'menu_generate') {
      userState[userId] = 'waiting_niche';
      await ctx.reply('✍️ Введи нишу:\nПример: SEO, Доставка еды, Строительство');
      return;
    }

    // ─ Кнопка: Черновики
    if (text === 'menu_drafts' || text === 'menu_publish') {
      await showDrafts(ctx);
      return;
    }

    // ─ Кнопка: Загрузить готовый текст
    if (text === 'menu_upload') {
      userState[userId] = 'waiting_ready_text';
      await ctx.reply('📥 Отправь мне готовый текст статьи.\nОн будет сохранён как черновик без обработки NeuroAPI.');
      return;
    }

    // ─ Кнопка: Расписание
    if (text === 'menu_schedule') {
      await ctx.reply('⏱ Расписание: каждый день в 15:00 (NSK)\n\nЧтобы изменить — напиши:\nрасписание 10:00', MAIN_MENU);
      return;
    }

    // ─ Кнопка: Назад в меню
    if (text === 'menu_main') {
      await ctx.reply('Выбери действие:', MAIN_MENU);
      return;
    }

    // ─ Кнопка: Одобрить
    if (text.startsWith('approve_')) {
      await publishDraft(ctx, text.replace('approve_', ''));
      return;
    }

    // ─ Кнопка: Отклонить
    if (text.startsWith('reject_')) {
      await rejectDraft(ctx, text.replace('reject_', ''));
      return;
    }

    // ─ Команда изменения расписания
    if (text.toLowerCase().startsWith('расписание ')) {
      const time = text.split(' ')[1];
      await ctx.reply(`✅ Время изменено на ${time}`, MAIN_MENU);
      return;
    }

    // ─ Формат: Ниша: X | Тема: Y
    const match = text.match(/Ниша:\s*([^|]+)\s*\|\s*Тема:\s*(.+)/i);
    if (match) {
      await ctx.reply('⏳ Генерирую статью...');
      await generateAndSave(ctx, match[1].trim(), match[2].trim());
      return;
    }

    // ─ По умолчанию — меню
    await ctx.reply('Выбери действие:', MAIN_MENU);

  } catch (err) {
    console.error('❌ Ошибка:', err.message);
    try { await ctx.reply('❌ Ошибка: ' + err.message); } catch (_) {}
  }
});

// ─── Генерация и сохранение ────────────────────

async function generateAndSave(ctx, niche, topic, source = 'user_command') {
  try {
    console.log(`🤖 Генерирую: "${niche}" — "${topic}"`);
    const content = await generateArticle(niche, topic);

    // Чистый текст без markdown-разметки для excerpt и preview
    const cleanText = content.replace(/[#*`>_~]/g, '').replace(/\n+/g, ' ').trim();
    const excerpt = cleanText.substring(0, 200);

    const draft = {
      _id: `draft-${Date.now()}`,
      title: `${niche}: ${topic}`,
      niche,
      topic,
      content,
      excerpt,
      category: niche,
      tags: [niche.toLowerCase(), topic.toLowerCase(), 'маркетинг'],
      imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800&h=450',
      readTime: Math.ceil(content.split(' ').length / 200), // ~200 слов/мин
      slug: `${niche}-${topic}`.toLowerCase().replace(/[^a-zа-яё0-9]/gi, '-').substring(0, 80),
      source,
      status: 'draft',
      createdAt: new Date(),
      publishedAt: null
    };

    await db.collection('articles').insertOne(draft);
    console.log(`✅ Черновик: ${draft._id}`);

    // Разбиваем полный текст на части по 3800 символов (лимит Max Bot ~4096)
    const CHUNK_SIZE = 3800;
    const fullText = content; // полный markdown text
    const chunks = [];
    let i = 0;
    while (i < fullText.length) {
      // Разрыв по последнему переносу строки внутри окна
      let end = Math.min(i + CHUNK_SIZE, fullText.length);
      if (end < fullText.length) {
        const lastNewline = fullText.lastIndexOf('\n', end);
        if (lastNewline > i) end = lastNewline + 1;
      }
      chunks.push(fullText.slice(i, end));
      i = end;
    }

    const header = `📄 Статья готова!\n\n📌 ${draft.title}\n⏱ ~${draft.readTime} мин чтения\n\n`;

    if (chunks.length === 1) {
      await ctx.reply(`${header}${chunks[0]}`, approveButtons(draft._id));
    } else {
      // Первая часть — с заголовком
      await ctx.reply(`${header}${chunks[0]}\n\n📖 Часть 1/${chunks.length}`);
      // Средние части
      for (let idx = 1; idx < chunks.length - 1; idx++) {
        await ctx.reply(`${chunks[idx]}\n\n📖 Часть ${idx + 1}/${chunks.length}`);
      }
      // Последняя часть — с кнопками одобрения
      await ctx.reply(
        `${chunks[chunks.length - 1]}\n\n📖 Часть ${chunks.length}/${chunks.length}\n\n✅ Проверь статью и одобри или отклони:`,
        approveButtons(draft._id)
      );
    }

  } catch (err) {
    console.error('❌ Ошибка генерации:', err.message);
    await ctx.reply(`❌ Ошибка: ${err.message}`, MAIN_MENU);
  }
}

// ─── Показать черновики ────────────────────────

async function showDrafts(ctx) {
  try {
    const drafts = await db.collection('articles')
      .find({ status: 'draft' })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    if (drafts.length === 0) {
      await ctx.reply('📋 Черновиков нет.', MAIN_MENU);
      return;
    }

    let text = `📋 Черновики (${drafts.length}):\n\n`;
    drafts.forEach((d, i) => {
      text += `${i + 1}. ${d.title}\n📅 ${new Date(d.createdAt).toLocaleDateString('ru')}\n\n`;
    });

    const keyboard = Keyboard.inlineKeyboard([
      ...drafts.map(d => [
        Keyboard.button.callback(`✅ ${d.title.substring(0, 25)}`, `approve_${d._id}`),
        Keyboard.button.callback('❌', `reject_${d._id}`)
      ]),
      [Keyboard.button.callback('← Меню', 'menu_main')]
    ]);

    await ctx.reply(text, withKeyboard(keyboard));

  } catch (err) {
    console.error('❌ Ошибка черновиков:', err.message);
    await ctx.reply('❌ Ошибка загрузки', MAIN_MENU);
  }
}

// ─── Публикация ────────────────────────────────

async function publishDraft(ctx, draftId) {
  try {
    const draft = await db.collection('articles').findOne({ _id: draftId });
    if (!draft) {
      await ctx.reply('❌ Черновик не найден', MAIN_MENU);
      return;
    }

    await db.collection('articles').updateOne(
      { _id: draftId },
      { $set: { status: 'published', publishedAt: new Date() } }
    );

    console.log(`✅ Опубликовано: ${draft.title}`);
    await ctx.reply(`✅ Статья опубликована!\n\n📌 ${draft.title}`, MAIN_MENU);

  } catch (err) {
    console.error('❌ Ошибка публикации:', err.message);
    await ctx.reply('❌ Ошибка публикации', MAIN_MENU);
  }
}

// ─── Отклонение ────────────────────────────────

async function rejectDraft(ctx, draftId) {
  try {
    await db.collection('articles').deleteOne({ _id: draftId });
    console.log(`🗑️ Удалено: ${draftId}`);
    await ctx.reply('🗑️ Черновик удалён.', MAIN_MENU);
  } catch (err) {
    console.error('❌ Ошибка удаления:', err.message);
    await ctx.reply('❌ Ошибка удаления', MAIN_MENU);
  }
}

// ════════════════════════════════════════════════
// CRON: 15:00 NSK = 08:00 UTC
// ════════════════════════════════════════════════

cron.schedule('0 8 * * *', async () => {
  console.log('🤖 [CRON 15:00 NSK] Генерирую статьи...');

  const niches = ['SEO', 'Интернет-маркетинг', 'Контент-маркетинг', 'Таргет', 'Email-маркетинг'];
  const topics = ['Как выбрать подрядчика', 'Топ ошибок новичков', 'Как увеличить конверсию', 'Тренды 2025', 'Пошаговый план'];

  for (let i = 0; i < 3; i++) {
    const niche = niches[Math.floor(Math.random() * niches.length)];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    try {
      const content = await generateArticle(niche, topic);
      await db.collection('articles').insertOne({
        _id: `cron-${Date.now()}-${i}`,
        title: `${niche}: ${topic}`,
        niche, topic, content,
        slug: `${niche}-${topic}`.toLowerCase().replace(/[^a-zа-яё0-9]/gi, '-').substring(0, 80),
        source: 'auto_cron',
        status: 'draft',
        createdAt: new Date(),
        publishedAt: null
      });
      console.log(`✅ ${i + 1}/3: ${niche} — ${topic}`);
    } catch (err) {
      console.error(`❌ ${i + 1}/3:`, err.message);
    }
  }
});

// ════════════════════════════════════════════════
// СТАРТ
// ════════════════════════════════════════════════

bot.start();
console.log('🤖 MAX Bot запущен');
