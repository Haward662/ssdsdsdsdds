import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const bot = new Telegraf(process.env.TG_TOKEN);
const ANALYTICS_URL = process.env.ANALYTICS_URL || 'http://localhost:5000';
const CHAT_ID = process.env.TG_CHAT_ID;

// Проверяем, что токен не плейсхолдер
if (process.env.TG_TOKEN?.includes('заполни') || !process.env.TG_TOKEN) {
  console.log(`\n⚠️  Telegram Bot не запущен`);
  console.log(`   Заполни TG_TOKEN и TG_CHAT_ID в .env файле\n`);
  process.exit(0);
}

console.log(`\n🤖 Telegram Bot запущен`);
console.log(`   Отправляет отчёты в чат: ${CHAT_ID}\n`);

// ─── /start ───────────────────────────────────────────────────────────────
bot.command('start', (ctx) => {
  ctx.reply(`👋 Привет! Я аналитик PROBOOST.\n\nДоступные команды:\n/report24 - отчёт за 24 часа\n/report7 - отчёт за 7 дней\n/stats - статистика\n/help - справка`);
});

// ─── /help ────────────────────────────────────────────────────────────────
bot.command('help', (ctx) => {
  const help = `
📊 Аналитика:
  /report24 - анализ за последние 24 часа
  /report7 - анализ за последние 7 дней
  /stats - быстрая статистика

✍️ Статьи:
  /idea "твоя идея статьи" - предложить идею
  /articles - показать черновики на одобрение

🔔 Автоматические отчёты:
  Каждый день в 9:00 и 18:00
  Новые статьи в 15:00 NSK
`;
  ctx.reply(help);
});

// ─── Функция получения анализа ────────────────────────────────────────────
async function getAnalysis(hours) {
  try {
    const response = await fetch(`${ANALYTICS_URL}/api/analyze?hours=${hours}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Ошибка при получении анализа:', err.message);
    return { analysis: '❌ Ошибка подключения к аналитике' };
  }
}

// ─── /report24 ────────────────────────────────────────────────────────────
bot.command('report24', async (ctx) => {
  ctx.reply('⏳ Генерирую отчёт за 24 часа...');
  const { analysis, stats } = await getAnalysis(24);

  const message = `
📊 ОТЧЁТ ЗА 24 ЧАСА

${analysis}

───────────────
📈 Статистика:
  • События: ${stats?.totalEvents || 0}
  • Просмотры: ${stats?.pageViews || 0}
  • Клики по статьям: ${stats?.articleClicks || 0}
  • Среднее прокручивание: ${stats?.avgScrollDepth || 0}%

🔝 Топ статьи:
${stats?.topArticles?.slice(0, 3).map((a, i) => `  ${i+1}. ${a}`).join('\n') || '  Нет данных'}
`;

  ctx.reply(message);
});

// ─── /report7 ────────────────────────────────────────────────────────────
bot.command('report7', async (ctx) => {
  ctx.reply('⏳ Генерирую отчёт за 7 дней...');
  const { analysis, stats } = await getAnalysis(168); // 7 * 24

  const message = `
📊 ОТЧЁТ ЗА 7 ДНЕЙ

${analysis}

───────────────
📈 Статистика:
  • События: ${stats?.totalEvents || 0}
  • Среднее прокручивание: ${stats?.avgScrollDepth || 0}%
`;

  ctx.reply(message);
});

// ─── /stats ───────────────────────────────────────────────────────────────
bot.command('stats', async (ctx) => {
  try {
    const response = await fetch(`${ANALYTICS_URL}/api/events?hours=24`);
    const { count, events } = await response.json();

    const pageViews = events.filter(e => e.event === 'page_view').length;
    const clicks = events.filter(e => e.event === 'article_click').length;

    ctx.reply(`📊 Статистика за 24ч:
  📌 Всего событий: ${count}
  👁 Просмотры страниц: ${pageViews}
  🔗 Клики: ${clicks}

Используй /report24 для подробного анализа`);
  } catch (err) {
    ctx.reply('❌ Ошибка подключения к аналитике');
  }
});

// ─── /idea ────────────────────────────────────────────────────────────────
bot.command('idea', async (ctx) => {
  const idea = ctx.message.text.replace('/idea', '').trim();

  if (!idea) {
    return ctx.reply('📝 Используй: /idea "твоя идея статьи"');
  }

  try {
    const response = await fetch(`${ANALYTICS_URL}/api/articles/pending`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: idea.substring(0, 100),
        content: idea,
        source: 'user_idea',
        category: 'strategy'
      })
    });

    if (response.ok) {
      ctx.reply('✅ Идея принята! AI будет работать над статьей. Результат отправлю в чат.');
    }
  } catch (err) {
    ctx.reply('❌ Ошибка сохранения идеи');
  }
});

// ─── /articles ────────────────────────────────────────────────────────────
bot.command('articles', async (ctx) => {
  try {
    const response = await fetch(`${ANALYTICS_URL}/api/articles/pending`);
    const articles = await response.json();
    const pending = articles.filter(a => a.status === 'pending');

    if (pending.length === 0) {
      return ctx.reply('✨ Нет черновиков на одобрение');
    }

    for (const article of pending) {
      const preview = article.content.substring(0, 300) + '...';

      ctx.replyWithHTML(`
<b>📝 ${article.title}</b>
<i>${article.source}</i>

${preview}

/approve_${article.id.replace('-', '_')} или /reject_${article.id.replace('-', '_')}
      `, {
        parse_mode: 'HTML'
      });
    }
  } catch (err) {
    ctx.reply('❌ Ошибка загрузки статей');
  }
});

// ─── Автоматический ежедневный отчёт ──────────────────────────────────────
setInterval(async () => {
  const now = new Date();
  // Отправляем отчёты в 9:00 и 18:00
  if ((now.getHours() === 9 || now.getHours() === 18) && now.getMinutes() === 0) {
    const { analysis, stats } = await getAnalysis(24);

    const message = `
📊 ЕЖЕДНЕВНЫЙ ОТЧЁТ (${now.toLocaleString('ru-RU')})

${analysis}

───────────────
📈 Статистика:
  • События: ${stats?.totalEvents || 0}
  • Просмотры: ${stats?.pageViews || 0}
  • Клики: ${stats?.articleClicks || 0}
`;

    try {
      await bot.telegram.sendMessage(CHAT_ID, message);
      console.log(`✅ Отправлен ежедневный отчёт в ${now.toLocaleTimeString('ru-RU')}`);
    } catch (err) {
      console.error('Ошибка отправки отчёта:', err.message);
    }
  }
}, 60000); // Проверяем каждую минуту

// ─── Обработка /approve и /reject ─────────────────────────────────────────
bot.hears(/^\/approve_.+/, async (ctx) => {
  const articleId = ctx.message.text.replace('/approve_', '').replace(/_/g, '-');

  try {
    const response = await fetch(`${ANALYTICS_URL}/api/articles/approve/${articleId}`, {
      method: 'POST'
    });

    if (response.ok) {
      ctx.reply('✅ Статья одобрена! Добавляю на сайт...');
    } else {
      ctx.reply('❌ Статья не найдена');
    }
  } catch (err) {
    ctx.reply('❌ Ошибка одобрения');
  }
});

bot.hears(/^\/reject_.+/, async (ctx) => {
  const articleId = ctx.message.text.replace('/reject_', '').replace(/_/g, '-');

  try {
    const response = await fetch(`${ANALYTICS_URL}/api/articles/reject/${articleId}`, {
      method: 'POST'
    });

    if (response.ok) {
      ctx.reply('❌ Статья отклонена');
    } else {
      ctx.reply('❌ Статья не найдена');
    }
  } catch (err) {
    ctx.reply('❌ Ошибка отклонения');
  }
});

// ─── Обработка ошибок ─────────────────────────────────────────────────────
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('❌ Произошла ошибка');
});

// ─── Запуск ────────────────────────────────────────────────────────────────
bot.launch().catch(err => {
  console.error('❌ Ошибка подключения к Telegram:', err.message);
  console.log('⚠️  Бот не будет отправлять сообщения, но аналитика работает');
});

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export default bot;
