import { Telegraf, Markup } from 'telegraf';
import cron from 'node-cron';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Telegraf(process.env.TG_TOKEN);
const ANALYTICS_URL = process.env.ANALYTICS_URL || 'http://localhost:5000';
const CHAT_ID = process.env.TG_CHAT_ID;

if (process.env.TG_TOKEN?.includes('заполни') || !process.env.TG_TOKEN) {
  console.log(`\n⚠️  Telegram Bot не запущен`);
  console.log(`   Заполни TG_TOKEN и TG_CHAT_ID в .env файле\n`);
  process.exit(0);
}

console.log(`\n🤖 Telegram Bot запущен`);
console.log(`   Отправляет отчёты в чат: ${CHAT_ID}\n`);

// ═══════════════════════════════════════════════════════════════════════════
// ─── ГЛАВНОЕ МЕНЮ ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

const mainMenu = Markup.keyboard([
  ['📊 Аналитика', '✍️ Статьи'],
  ['📈 Отчет 24ч', '📈 Отчет 7 дней'],
  ['ℹ️ Помощь']
]).resize();

const analyticsMenu = Markup.keyboard([
  ['📌 Статистика', '📊 Подробный анализ'],
  ['◀️ В главное меню']
]).resize();

const articlesMenu = Markup.keyboard([
  ['📝 Загрузить готовую', '🤖 По теме'],
  ['📋 Черновики', '◀️ В главное меню']
]).resize();

// ─── /start ───────────────────────────────────────────────────────────────
bot.start((ctx) => {
  ctx.reply(
    '👋 Привет! Я аналитик и контент-помощник PROBOOST.\n\n' +
    '📊 Я помогу с:\n' +
    '• Аналитикой сайта (трафик, статьи, поведение)\n' +
    '• Созданием статей (готовые или по теме)\n' +
    '• Автоматическими отчетами (09:00 и 18:00)\n\n' +
    'Выбери что тебе нужно 👇',
    mainMenu
  );
});

// ─── Обработка главного меню ──────────────────────────────────────────────
bot.hears('📊 Аналитика', (ctx) => {
  ctx.reply('Что тебя интересует?', analyticsMenu);
});

bot.hears('✍️ Статьи', (ctx) => {
  ctx.reply('Как хочешь создать статью?', articlesMenu);
});

bot.hears('ℹ️ Помощь', (ctx) => {
  ctx.reply(
    '🤖 Вот что я умею:\n\n' +
    '📊 АНАЛИТИКА:\n' +
    '• Статистика за 24ч (просмотры, клики, трафик)\n' +
    '• Подробный анализ за неделю\n' +
    '• Рекомендации что улучшить\n\n' +
    '✍️ СТАТЬИ:\n' +
    '• Загрузить готовую статью (сразу на сайт!)\n' +
    '• Придумать по теме (нужно твоё одобрение)\n' +
    '• Посмотреть черновики на одобрение\n\n' +
    '🔔 АВТОМАТИЧЕСКОЕ:\n' +
    '• 09:00 - генерирую новую статью\n' +
    '• 18:00 - отправляю анализ трафика\n\n' +
    'Используй кнопки для навигации 👇',
    mainMenu
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// ─── АНАЛИТИКА ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

async function getAnalysis(hours) {
  try {
    const response = await fetch(`${ANALYTICS_URL}/api/analyze?hours=${hours}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Ошибка анализа:', err.message);
    return { analysis: '❌ Ошибка подключения к аналитике' };
  }
}

bot.hears('📌 Статистика', async (ctx) => {
  ctx.reply('⏳ Загружаю статистику...', mainMenu);

  try {
    const response = await fetch(`${ANALYTICS_URL}/api/events?hours=24`);
    const { count, events } = await response.json();

    const pageViews = events.filter(e => e.event === 'page_view').length;
    const clicks = events.filter(e => e.event === 'article_click').length;
    const scrolls = events.filter(e => e.event === 'scroll').length;

    const message = `
📊 СТАТИСТИКА ЗА 24 ЧАСА

👁 Просмотры: ${pageViews}
🔗 Клики: ${clicks}
📜 Прокрутки: ${scrolls}
📌 Всего событий: ${count}

Используй кнопку "Подробный анализ" для деталей 👇`;

    ctx.reply(message, analyticsMenu);
  } catch (err) {
    ctx.reply('❌ Ошибка загрузки статистики', analyticsMenu);
  }
});

bot.hears('📊 Подробный анализ', async (ctx) => {
  ctx.reply('⏳ Анализирую данные...', analyticsMenu);
  const { analysis, stats } = await getAnalysis(24);

  const message = `
📊 ПОДРОБНЫЙ АНАЛИЗ (24ч)

${analysis}

───────────────
📈 Метрики:
  • События: ${stats?.totalEvents || 0}
  • Просмотры: ${stats?.pageViews || 0}
  • Клики: ${stats?.articleClicks || 0}
  • Прокрутка: ${stats?.avgScrollDepth || 0}%

🔝 ТОП статьи:
${stats?.topArticles?.slice(0, 3).map((a, i) => `  ${i+1}. ${a}`).join('\n') || '  Нет данных'}`;

  ctx.reply(message, analyticsMenu);
});

bot.hears('📈 Отчет 24ч', async (ctx) => {
  ctx.reply('⏳ Генерирую отчёт...', mainMenu);
  const { analysis, stats } = await getAnalysis(24);

  const message = `
📊 ОТЧЁТ ЗА 24 ЧАСА

${analysis}

───────────────
📈 Статистика:
  • События: ${stats?.totalEvents || 0}
  • Просмотры: ${stats?.pageViews || 0}
  • Клики: ${stats?.articleClicks || 0}
  • Прокрутка: ${stats?.avgScrollDepth || 0}%

🔝 Топ статьи:
${stats?.topArticles?.slice(0, 3).map((a, i) => `  ${i+1}. ${a}`).join('\n') || '  Нет данных'}`;

  ctx.reply(message, mainMenu);
});

bot.hears('📈 Отчет 7 дней', async (ctx) => {
  ctx.reply('⏳ Генерирую отчёт...', mainMenu);
  const { analysis, stats } = await getAnalysis(168);

  const message = `
📊 ОТЧЁТ ЗА 7 ДНЕЙ

${analysis}

───────────────
📈 Статистика:
  • События: ${stats?.totalEvents || 0}
  • Просмотры: ${stats?.pageViews || 0}
  • Прокрутка: ${stats?.avgScrollDepth || 0}%`;

  ctx.reply(message, mainMenu);
});

// ═══════════════════════════════════════════════════════════════════════════
// ─── СТАТЬИ ───────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

bot.hears('📝 Загрузить готовую', (ctx) => {
  ctx.reply(
    '📝 Отправь текст статьи\n\n' +
    'Она будет опубликована сразу на сайте!',
    Markup.keyboard([['◀️ Назад']]).resize()
  );
  ctx.session = { mode: 'ready_article' };
});

bot.hears('🤖 По теме', (ctx) => {
  ctx.reply(
    '🤖 Напиши тему для статьи\n\n' +
    'Gemini раскроет её полностью под SEO\n' +
    'Потом ты одобришь или переделаешь',
    Markup.keyboard([['◀️ Назад']]).resize()
  );
  ctx.session = { mode: 'topic_article' };
});

bot.hears('📋 Черновики', async (ctx) => {
  try {
    const response = await fetch(`${ANALYTICS_URL}/api/articles/pending`);
    const articles = await response.json();
    const pending = articles.filter(a => a.status === 'pending');

    if (pending.length === 0) {
      ctx.reply('✨ Нет черновиков на одобрение', articlesMenu);
      return;
    }

    for (const article of pending) {
      const preview = article.content.substring(0, 200) + '...';
      const sourceLabel = article.source === 'auto' ? '🤖 Автогенерация' :
                         article.source === 'user_topic' ? '✍️ По теме' :
                         '📝 Готовая';

      const buttons = Markup.inlineKeyboard([
        [Markup.button.callback('✅ Одобрить', `approve_${article._id}`)],
        [Markup.button.callback('❌ Отклонить', `reject_${article._id}`)]
      ]);

      ctx.replyWithHTML(
        `<b>${sourceLabel}</b>\n` +
        `<b>📝 ${article.title}</b>\n\n` +
        `${preview}`,
        buttons
      );
    }

    ctx.reply('Выбери действие 👆', articlesMenu);
  } catch (err) {
    ctx.reply('❌ Ошибка загрузки черновиков', articlesMenu);
  }
});

// ─── Обработка текста (готовая статья или тема) ────────────────────────────
bot.on('text', async (ctx) => {
  if (ctx.message.text === '◀️ Назад' || ctx.message.text === '◀️ В главное меню') {
    if (ctx.message.text === '◀️ Назад') {
      ctx.reply('Как хочешь создать статью?', articlesMenu);
    } else {
      ctx.reply('Что тебе нужно?', mainMenu);
    }
    ctx.session = {};
    return;
  }

  const mode = ctx.session?.mode;

  if (mode === 'ready_article') {
    ctx.reply('⏳ Сохраняю статью...');

    try {
      const response = await fetch(`${ANALYTICS_URL}/api/articles/pending`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: ctx.message.text.substring(0, 100),
          content: ctx.message.text,
          source: 'user',
          category: 'strategy'
        })
      });

      const data = await response.json();

      if (response.ok) {
        const approveResponse = await fetch(`${ANALYTICS_URL}/api/articles/approve/${data.id}`, {
          method: 'POST'
        });

        if (approveResponse.ok) {
          ctx.reply('✅ Статья опубликована! Уже на сайте!', mainMenu);
          console.log(`📝 Статья опубликована: ${ctx.message.text.substring(0, 50)}`);
        }
      }
    } catch (err) {
      ctx.reply('❌ Ошибка сохранения статьи', mainMenu);
      console.error(err);
    }

    ctx.session = {};
  } else if (mode === 'topic_article') {
    ctx.reply('⏳ Gemini работает над статьей (подожди 30 секунд)...');

    try {
      const response = await fetch(`${ANALYTICS_URL}/api/articles/pending`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: ctx.message.text.substring(0, 100),
          content: ctx.message.text,
          source: 'user_topic',
          category: 'strategy'
        })
      });

      if (response.ok) {
        ctx.reply('✅ Тема принята!\n\nКогда статья будет готова, отправлю в черновики.\n\nСмотри в "📋 Черновики" 👇', articlesMenu);
        console.log(`📝 Тема создана: ${ctx.message.text.substring(0, 50)}`);
      }
    } catch (err) {
      ctx.reply('❌ Ошибка создания статьи', articlesMenu);
      console.error(err);
    }

    ctx.session = {};
  }
});

// ─── Кнопки одобрения/отклонения ──────────────────────────────────────────
bot.action(/^approve_(.+)$/, async (ctx) => {
  const articleId = ctx.match[1];

  try {
    const response = await fetch(`${ANALYTICS_URL}/api/articles/approve/${articleId}`, {
      method: 'POST'
    });

    if (response.ok) {
      ctx.answerCbQuery('✅ Статья опубликована!');
      ctx.editMessageReplyMarkup(null);
      ctx.reply('✅ Статья опубликована на сайте!', mainMenu);
    } else {
      ctx.answerCbQuery('❌ Ошибка');
    }
  } catch (err) {
    ctx.answerCbQuery('❌ Ошибка одобрения');
  }
});

bot.action(/^reject_(.+)$/, async (ctx) => {
  const articleId = ctx.match[1];

  try {
    const response = await fetch(`${ANALYTICS_URL}/api/articles/reject/${articleId}`, {
      method: 'POST'
    });

    if (response.ok) {
      ctx.answerCbQuery('❌ Статья удалена');
      ctx.editMessageReplyMarkup(null);
      ctx.reply('❌ Статья удалена', mainMenu);
    } else {
      ctx.answerCbQuery('❌ Ошибка');
    }
  } catch (err) {
    ctx.answerCbQuery('❌ Ошибка отклонения');
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ─── РАСПИСАНИЕ (CRON) ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

cron.schedule('0 9 * * *', async () => {
  console.log('🤖 [CRON 09:00] Генерирую статью...');

  try {
    const generateResponse = await fetch(`${ANALYTICS_URL}/api/articles/generate`);
    const { article } = await generateResponse.json();

    if (article) {
      const preview = article.content.substring(0, 200) + '...';
      const buttons = Markup.inlineKeyboard([
        [Markup.button.callback('✅ Одобрить', `approve_${article.id}`)],
        [Markup.button.callback('❌ Отклонить', `reject_${article.id}`)]
      ]);

      await bot.telegram.sendMessage(
        CHAT_ID,
        `🤖 НОВАЯ СТАТЬЯ (${new Date().toLocaleString('ru-RU')})\n\n` +
        `<b>${article.title}</b>\n\n` +
        `${preview}`,
        { parse_mode: 'HTML', ...buttons }
      );

      console.log(`✅ [CRON 09:00] Статья сгенерирована и отправлена`);
    }
  } catch (err) {
    console.error('❌ [CRON 09:00] Ошибка:', err.message);
  }
});

cron.schedule('0 18 * * *', async () => {
  console.log('📊 [CRON 18:00] Отправляю вечерний отчёт...');

  try {
    const { analysis, stats } = await getAnalysis(24);

    const message = `
📊 ВЕЧЕРНИЙ ОТЧЁТ (${new Date().toLocaleString('ru-RU')})

${analysis}

───────────────
📈 За сегодня:
  • События: ${stats?.totalEvents || 0}
  • Просмотры: ${stats?.pageViews || 0}
  • Клики: ${stats?.articleClicks || 0}
  • Прокрутка: ${stats?.avgScrollDepth || 0}%

🔝 ТОП 3 статьи:
${stats?.topArticles?.slice(0, 3).map((a, i) => `  ${i+1}. ${a}`).join('\n') || '  Нет данных'}`;

    await bot.telegram.sendMessage(CHAT_ID, message);
    console.log(`✅ [CRON 18:00] Вечерний отчёт отправлен`);
  } catch (err) {
    console.error('❌ [CRON 18:00] Ошибка:', err.message);
  }
});

// ─── Обработка ошибок ─────────────────────────────────────────────────────
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('❌ Произошла ошибка').catch(() => {});
});

// ─── Запуск ────────────────────────────────────────────────────────────────
bot.launch().catch(err => {
  console.error('❌ Ошибка подключения к Telegram:', err.message);
  console.log('⚠️  Бот не работает, но аналитика работает');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export default bot;
