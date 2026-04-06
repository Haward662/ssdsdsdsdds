import { Telegraf } from 'telegraf';
import cron from 'node-cron';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

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
  ctx.reply(`👋 Привет! Я аналитик и контент-помощник PROBOOST.

Доступные команды:

📊 АНАЛИТИКА:
  /report24 - отчёт за 24 часа
  /report7 - отчёт за 7 дней
  /stats - статистика

✍️ СТАТЬИ:
  /articles - показать черновики на одобрение
  /ready "текст статьи" - отправить готовую статью (публикуется сразу)
  /topic "тема статьи" - придумать статью по теме (нужно одобрение)

🔔 АВТОМАТИЧЕСКОЕ:
  Каждый день в 09:00 - генерация новой статьи
  Каждый вечер (18:00) - отчёт об аналитике`);
});

// ─── /help ────────────────────────────────────────────────────────────────
bot.command('help', (ctx) => {
  const help = `
📊 АНАЛИТИКА:
  /report24 - анализ за последние 24 часа
  /report7 - анализ за последние 7 дней
  /stats - быстрая статистика

✍️ СТАТЬИ (контент):
  /articles - показать черновики на одобрение
  /ready "текст статьи" - отправить готовую статью (публикуется сразу!)
  /topic "тема статьи" - попросить AI раскрыть тему (требует одобрения)

🤖 АВТОМАТИЧЕСКОЕ:
  • Каждый день в 09:00 - Gemini генерирует новую статью
  • Каждый вечер в 18:00 - отчёт об аналитике и трафике
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
  • Просмотры: ${stats?.pageViews || 0}
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

// ─── /ready "текст" - готовая статья (публикуется сразу) ──────────────────
bot.command('ready', async (ctx) => {
  const text = ctx.message.text.replace('/ready', '').trim();

  if (!text) {
    return ctx.reply(`📝 Используй: /ready "текст вашей статьи"`);
  }

  ctx.reply('⏳ Сохраняю статью...');

  try {
    const response = await fetch(`${ANALYTICS_URL}/api/articles/pending`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: text.substring(0, 100),
        content: text,
        source: 'user',  // готовая статья от пользователя
        category: 'strategy'
      })
    });

    const data = await response.json();

    if (response.ok) {
      // Сразу одобряем (публикуем)
      const approveResponse = await fetch(`${ANALYTICS_URL}/api/articles/approve/${data.id}`, {
        method: 'POST'
      });

      if (approveResponse.ok) {
        ctx.reply('✅ Статья опубликована! Уже на сайте!');
        console.log(`📝 Статья опубликована сразу: ${text.substring(0, 50)}`);
      }
    } else {
      ctx.reply('❌ Ошибка сохранения статьи');
    }
  } catch (err) {
    ctx.reply('❌ Ошибка сохранения статьи');
    console.error(err);
  }
});

// ─── /topic "тема" - Gemini раскрывает тему (требует одобрения) ────────────
bot.command('topic', async (ctx) => {
  const topic = ctx.message.text.replace('/topic', '').trim();

  if (!topic) {
    return ctx.reply(`📝 Используй: /topic "тема для статьи"`);
  }

  ctx.reply('⏳ Генерирую статью по теме (дай 30 секунд)...');

  try {
    const response = await fetch(`${ANALYTICS_URL}/api/articles/pending`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: topic.substring(0, 100),
        content: topic,
        source: 'user_topic',  // тема от пользователя, нужно одобрение
        category: 'strategy'
      })
    });

    if (response.ok) {
      ctx.reply('✅ Тема принята! Gemini работает над статьей. Результат отправлю в чат.\n\n(Будет нужно твоё одобрение - используй /articles)');
    }
  } catch (err) {
    ctx.reply('❌ Ошибка сохранения темы');
  }
});

// ─── /articles - показать черновики на одобрение ──────────────────────────
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
      const sourceLabel = article.source === 'auto' ? '🤖 Автогенерация' : article.source === 'user_topic' ? '✍️ Ручная тема' : '📝 Готовая статья';

      ctx.replyWithHTML(`
<b>${sourceLabel}</b>
<b>📝 ${article.title}</b>

${preview}

/approve_${article._id.replace('-', '_')} или /reject_${article._id.replace('-', '_')}
      `, {
        parse_mode: 'HTML'
      });
    }
  } catch (err) {
    ctx.reply('❌ Ошибка загрузки статей');
  }
});

// ─── Обработка /approve и /reject ─────────────────────────────────────────
bot.hears(/^\/approve_.+/, async (ctx) => {
  const articleId = ctx.message.text.replace('/approve_', '').replace(/_/g, '-');

  try {
    const response = await fetch(`${ANALYTICS_URL}/api/articles/approve/${articleId}`, {
      method: 'POST'
    });

    if (response.ok) {
      ctx.reply('✅ Статья одобрена! Она на сайте!');
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
      ctx.reply('❌ Статья удалена');
    } else {
      ctx.reply('❌ Статья не найдена');
    }
  } catch (err) {
    ctx.reply('❌ Ошибка отклонения');
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ─── РАСПИСАНИЕ (CRON) ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

// ─── 09:00 ежедневно - автоматическое создание статьи ─────────────────────
cron.schedule('0 9 * * *', async () => {
  console.log('🤖 [CRON 09:00] Запускаю генерацию статьи...');

  try {
    const generateResponse = await fetch(`${ANALYTICS_URL}/api/articles/generate`);
    const { article } = await generateResponse.json();

    if (article) {
      const preview = article.content.substring(0, 300) + '...';

      // Отправляем в Telegram
      await bot.telegram.sendMessage(CHAT_ID, `
🤖 АВТОМАТИЧЕСКАЯ СТАТЬЯ (${new Date().toLocaleString('ru-RU')})

<b>${article.title}</b>

${preview}

/approve_${article.id.replace('-', '_')} или /reject_${article.id.replace('-', '_')}
      `, { parse_mode: 'HTML' });

      console.log(`✅ [CRON 09:00] Статья сгенерирована и отправлена`);
    }
  } catch (err) {
    console.error('❌ [CRON 09:00] Ошибка генерации статьи:', err.message);
  }
});

// ─── 18:00 ежедневно - ежевечерний отчёт аналитики ────────────────────────
cron.schedule('0 18 * * *', async () => {
  console.log('📊 [CRON 18:00] Запускаю отправку вечернего отчёта...');

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
${stats?.topArticles?.slice(0, 3).map((a, i) => `  ${i+1}. ${a}`).join('\n') || '  Нет данных'}
    `;

    await bot.telegram.sendMessage(CHAT_ID, message);
    console.log(`✅ [CRON 18:00] Вечерний отчёт отправлен`);
  } catch (err) {
    console.error('❌ [CRON 18:00] Ошибка отправки отчёта:', err.message);
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
