/**
 * PROBOOST — AI Article Generator с поиском свежих российских материалов
 *
 * Gemini 2.0 Flash ищет актуальные российские статьи через Google Search,
 * переформулирует их, дополняет и добавляет CTA от PROBOOST.
 *
 * Usage:
 *   GEMINI_API_KEY=ваш_ключ node generate-article.mjs
 *   GEMINI_API_KEY=ваш_ключ node generate-article.mjs --topic "настройка таргета ВКонтакте 2025"
 *   GEMINI_API_KEY=ваш_ключ node generate-article.mjs --count 3
 */

import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_TS_PATH = path.join(__dirname, 'articles-data.ts');
const ARTICLES_PUBLIC_PATH = path.join(__dirname, 'public', 'articles.json');

const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;
if (!API_KEY) {
  console.error('❌ Укажи GEMINI_API_KEY в переменных окружения');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// ─── Темы: только технические how-to, без кейсов и личных историй ──────────
const TOPICS = [
  // ВКонтакте
  'как настроить таргетированную рекламу ВКонтакте для малого бизнеса 2025',
  'как создать и настроить чат-бот ВКонтакте для бизнеса',
  'рассылки ВКонтакте через Senler — пошаговая настройка',
  'как собрать аудиторию для таргета ВКонтакте через TargetHunter',
  'форматы рекламных объявлений ВКонтакте — какой выбрать в 2025',
  'как настроить ретаргетинг ВКонтакте — пиксель и аудитории',
  'клипы ВКонтакте для бизнеса — как запустить и продвигать',
  'автопостинг и контент-план ВКонтакте — инструменты и практика',

  // Яндекс Директ
  'как настроить Яндекс Директ с нуля — пошаговое руководство 2025',
  'РСЯ Яндекс Директ — настройка и оптимизация рекламной сети',
  'мастер кампаний Яндекс Директ — как работает и стоит ли использовать',
  'как подобрать ключевые слова для Яндекс Директ — Вордстат и операторы',
  'минус-слова в Яндекс Директ — как составить список и зачем',
  'автоматические стратегии Яндекс Директ — когда включать и как настроить',
  'смарт-баннеры Яндекс Директ — настройка фида и запуск',
  'Яндекс Бизнес — что это и как настроить для локального бизнеса',

  // Telegram
  'как создать Telegram-канал для бизнеса и набрать первых подписчиков',
  'Telegram Ads — как запустить рекламу в Telegram 2025',
  'как сделать чат-бота в Telegram через BotFather — пошаговая инструкция',
  'Teletype и Telegraph — как использовать для контент-маркетинга',
  'статистика Telegram-канала — какие метрики смотреть и как анализировать',
  'как оформить Telegram-канал для бизнеса — аватар, описание, закреп',

  // ВКонтакте — сообщества
  'как настроить магазин ВКонтакте — товары, оплата, доставка',
  'продвижение сообщества ВКонтакте без рекламного бюджета — органика',
  'ВКонтакте истории для бизнеса — форматы и как снимать',
  'как провести конкурс ВКонтакте — правила и механики',

  // Геомаркетинг и локальное SEO
  'как настроить карточку организации в Яндекс Бизнес — полная инструкция',
  'продвижение в 2ГИС — как попасть в топ и увеличить звонки',
  'как работать с отзывами на Яндекс Картах — ответы и накрутки',
  'локальное SEO для малого бизнеса — как продвигаться в своём городе',

  // Email и мессенджер-маркетинг
  'email-маркетинг для малого бизнеса — как начать с нуля в 2025',
  'сегментация базы email — как разделить подписчиков и повысить конверсию',
  'WhatsApp Business API — как подключить и настроить рассылки',
  'Unisender или SendPulse — сравнение сервисов рассылок для малого бизнеса',

  // Аналитика и инструменты
  'Яндекс Метрика — как настроить цели и читать отчёты',
  'UTM-метки — что это и как правильно настроить для всех каналов',
  'как настроить сквозную аналитику для малого бизнеса без больших затрат',
  'коллтрекинг — как отслеживать звонки с рекламы и зачем это нужно',
  'как провести A/B тест рекламного объявления — методология и инструменты',

  // Контент-маркетинг
  'как составить контент-план для социальных сетей — шаблон и практика',
  'Reels и Shorts для бизнеса — как снимать без оператора и бюджета',
  'UGC-контент — как мотивировать клиентов создавать контент о вашем бизнесе',
  'как писать продающие посты в соцсетях — структура и примеры',

  // Стратегия без личных кейсов
  'как рассчитать бюджет на рекламу — формулы и ориентиры по каналам',
  'воронка продаж в интернет-маркетинге — как выстроить и измерить',
  'как снизить стоимость лида в таргетированной рекламе — практические советы',
  'CPA-маркетинг — что это и как запустить партнёрскую программу',
  'как работает look-alike аудитория и когда её использовать',
];

// ─── Категория по теме ────────────────────────────────────────────────────
function getCategory(topic) {
  if (/вконтакте|вк\b/i.test(topic)) return 'ВКонтакте';
  if (/яндекс|директ/i.test(topic)) return 'Яндекс Директ';
  if (/telegram|телеграм/i.test(topic)) return 'Telegram';
  if (/2гис|яндекс.карт|яндекс карт|локальн|геомарк/i.test(topic)) return 'Геомаркетинг';
  if (/метрик|аналитик|utm|коллтрек|a\/b/i.test(topic)) return 'Аналитика';
  if (/email|рассылк|unisender|sendpulse|whatsapp/i.test(topic)) return 'Email';
  if (/контент|reels|shorts|ugc|посты/i.test(topic)) return 'Контент';
  return 'Стратегия';
}

// ─── Изображение по категории ─────────────────────────────────────────────
const IMAGES = {
  'ВКонтакте':    'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=800&h=450',
  'Яндекс Директ':'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=800&h=450',
  'Telegram':     'https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&q=80&w=800&h=450',
  'Геомаркетинг': 'https://images.unsplash.com/photo-1512552288940-3a300922a275?auto=format&fit=crop&q=80&w=800&h=450',
  'Аналитика':    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800&h=450',
  'Email':        'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&q=80&w=800&h=450',
  'Контент':      'https://images.unsplash.com/photo-1533750516457-a7f992034fec?auto=format&fit=crop&q=80&w=800&h=450',
  'Стратегия':    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800&h=450',
};

function slugify(text) {
  const map = {'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'j','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'};
  return text.toLowerCase().replace(/[а-яёА-ЯЁ]/g, ch => map[ch]||ch).replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').substring(0,80);
}

function readTime(html) {
  const words = html.replace(/<[^>]+>/g,' ').split(/\s+/).filter(Boolean).length;
  return Math.max(5, Math.round(words / 180));
}

// ─── Генерация с поиском ──────────────────────────────────────────────────
async function generateArticle(topic) {
  const category = getCategory(topic);

  const prompt = `Найди в интернете 2–3 свежие российские статьи или инструкции по теме: "${topic}".

На основе найденного материала напиши полноценную экспертную статью для блога маркетингового агентства PROBOOST (pro-boost.ru).

ПРАВИЛА НАПИСАНИЯ:
— Возьми реальную актуальную информацию из найденных источников: конкретные шаги, цифры, интерфейсы, названия кнопок
— Перепиши своими словами — не копируй, а объясни как опытный маркетолог коллеге
— Пиши по-русски, прямо и конкретно: «зайди в раздел», «нажми», «укажи», «выбери» — без воды
— Никаких шаблонных фраз: «в современном мире», «стоит отметить», «нельзя не согласиться»
— Если в источниках есть конкретные цифры или сроки — используй их
— Дополни материал практическими советами и частыми ошибками, которые делают новички
— Объём: 1200–1800 слов. Без воды, только полезное

СТРУКТУРА:
— Вступление: почему эта тема важна (2–3 предложения, без пафоса)
— Основные разделы H2 с подробными пояснениями
— Нумерованные или маркированные списки для шагов
— Раздел «Частые ошибки» или «На что обратить внимание»
— В самом конце — 2–3 предложения: «Если нужна помощь с настройкой — команда PROBOOST занимается этим каждый день. Оставь заявку на pro-boost.ru»

ФОРМАТ ОТВЕТА — строго валидный JSON без markdown-обёрток:
{
  "title": "Заголовок до 80 символов с ключевым словом",
  "excerpt": "Краткое описание 1–2 предложения, до 200 символов",
  "tags": ["тег1", "тег2", "тег3", "тег4"],
  "content": "<h2>...</h2><p>...</p><ul><li>...</li></ul>..."
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.5,
      maxOutputTokens: 6000,
    },
  });

  let raw = response.text().trim();

  // Убираем markdown-обёртки если Gemini всё же их добавил
  raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]+\}/);
    if (!match) throw new Error('Gemini вернул невалидный JSON:\n' + raw.substring(0, 300));
    parsed = JSON.parse(match[0]);
  }

  if (!parsed.content || parsed.content.length < 500) {
    throw new Error('Статья слишком короткая — возможно, Gemini не нашёл источников. Попробуй ещё раз.');
  }

  return {
    id: crypto.randomBytes(4).toString('hex'),
    slug: slugify(parsed.title || topic),
    title: parsed.title || topic,
    excerpt: parsed.excerpt || '',
    category,
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 6) : [category],
    publishedAt: new Date().toISOString().split('T')[0],
    readTime: readTime(parsed.content),
    imageUrl: IMAGES[category] || IMAGES['Стратегия'],
    content: parsed.content,
  };
}

// ─── Загрузка и сохранение articles-data.ts ──────────────────────────────
function loadArticles() {
  if (!fs.existsSync(ARTICLES_TS_PATH)) return [];
  try {
    // Читаем JSON из public/ как основной источник истины
    if (fs.existsSync(ARTICLES_PUBLIC_PATH)) {
      return JSON.parse(fs.readFileSync(ARTICLES_PUBLIC_PATH, 'utf-8'));
    }
  } catch {}
  return [];
}

function saveArticles(articles) {
  // 1. public/articles.json — для продакшна
  fs.mkdirSync(path.dirname(ARTICLES_PUBLIC_PATH), { recursive: true });
  fs.writeFileSync(ARTICLES_PUBLIC_PATH, JSON.stringify(articles, null, 2), 'utf-8');

  // 2. articles-data.ts — для Vite-импорта в dev
  const entries = articles.map(a => {
    const escaped = JSON.stringify(a.content);
    const rest = { ...a };
    delete rest.content;
    return `  { ${Object.entries(rest).map(([k,v]) => `"${k}": ${JSON.stringify(v)}`).join(', ')}, "content": ${escaped} }`;
  }).join(',\n');

  const ts = `import type { Article } from './types';\n\nconst ARTICLES: Article[] = [\n${entries}\n];\n\nexport default ARTICLES;\n`;
  fs.writeFileSync(ARTICLES_TS_PATH, ts, 'utf-8');

  console.log(`   💾 Сохранено: articles-data.ts и public/articles.json`);
}

// ─── Выбор темы без повторов ──────────────────────────────────────────────
function pickTopic(existing) {
  const used = new Set(existing.map(a => a.title?.toLowerCase()));
  const free = TOPICS.filter(t => !used.has(t.toLowerCase()));
  const pool = free.length > 0 ? free : TOPICS;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── Main ─────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const topicIdx = args.indexOf('--topic');
  const countIdx = args.indexOf('--count');
  const manualTopic = topicIdx !== -1 ? args[topicIdx + 1] : null;
  const count = countIdx !== -1 ? parseInt(args[countIdx + 1], 10) || 1 : 1;

  console.log(`\n🚀 PROBOOST Article Generator`);
  console.log(`   Режим: поиск свежих российских статей через Google Search`);
  console.log(`   Статей к генерации: ${count}\n`);

  const articles = loadArticles();
  console.log(`   Уже в блоге: ${articles.length} статей`);

  for (let i = 0; i < count; i++) {
    const topic = manualTopic || pickTopic(articles);
    console.log(`\n📝 [${i + 1}/${count}] Тема: "${topic}"`);
    console.log(`   🔍 Ищу актуальные российские источники...`);

    try {
      const article = await generateArticle(topic);
      articles.unshift(article);
      saveArticles(articles);

      console.log(`   ✅ "${article.title}"`);
      console.log(`   Slug: ${article.slug}`);
      console.log(`   Категория: ${article.category} | ~${article.readTime} мин чтения`);
    } catch (err) {
      console.error(`   ❌ Ошибка: ${err.message}`);
    }

    if (i < count - 1) {
      console.log(`   ⏳ Пауза 4 секунды...`);
      await new Promise(r => setTimeout(r, 4000));
    }
  }

  console.log(`\n✨ Итого статей в блоге: ${articles.length}`);
  console.log(`   Следующий шаг: npm run build && деплой на Timeweb\n`);
}

main();
