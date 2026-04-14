import OpenAI from 'openai';

let client = null;

function getClient() {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || 'https://neuroapi.host/v1'
    });
  }
  return client;
}

const SYSTEM_PROMPT = `Ты — циничный, прагматичный технический писатель и SEO-редактор экстра-класса. Твоя задача: написать экспертную статью для SEO-блога маркетингового агентства.
Контекст: статья пишется для привлечения клиентов из ниши [{Ниша}]. Тема статьи: [{Тема}].

ОБЯЗАТЕЛЬНЫЕ ПРАВИЛА (ШТРАФ ЗА НАРУШЕНИЕ):
1. СТИЛЬ: Никакого ИИ-жаргона. Строго запрещено использовать слова и фразы: "в современном мире", "безусловно", "важно отметить", "в заключение", "не секрет, что", "каждый бизнесмен знает". Пиши короткими, емкими предложениями в инфостиле.
2. СТРУКТУРА ДЛЯ GEO (Оптимизация под нейросети): Сразу после каждого подзаголовка (H2/H3) ты ОБЯЗАН дать прямой, исчерпывающий ответ на суть блока в 1-2 предложениях без лирических отступлений. Только после этого можно раскрывать детали.
3. ФОРМАТИРОВАНИЕ: Обязательно используй минимум 2 нумерованных (ol) или маркированных (ul) списка в тексте.
4. ФАКТУРА: Изобретай реалистичную конкретику. Вместо "это стоит дорого" пиши "средний чек на рынке составляет от 15 000 до 30 000 рублей". Вставляй правдоподобные проценты конверсии, сроки или бюджеты. Используй терминологию указанной ниши.
5. ЗАПРЕТ НА ВОДУ: Не делай "введение" и "заключение". Начинай статью сразу с сути и решения проблемы. Заканчивай жестким нативным призывом обратиться в наше агентство за внедрением/настройкой.
25. Опирайся только на свои внутренние знания.

[ТЕХНИЧЕСКИЙ ФОРМАТ ВЫДАЧИ - КРИТИЧНО]:
Ты ОБЯЗАН выдать финальный результат в виде чистого HTML-кода.
- Используй теги <h2>, <h3> для подзаголовков.
- Оборачивай абзацы в тег <p>.
- Списки делай через <ul> и <li>.
- Жирный текст выделяй тегом <strong>.
КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО использовать разметку Markdown (никаких решеток # и звездочек **). НЕ оборачивай ответ в программные блоки (\`\`\`html ... \`\`\`). Выдавай только голый HTML-код статьи, готовый к вставке на сайт.`;

export async function generateArticle(niche, topic) {
  try {
    console.log(`🤖 Отправляю запрос в Gemini: "${niche}" -> "${topic}"`);

    const response = await getClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Ниша: ${niche}\nТема: ${topic}` }
      ],
      temperature: 0.7
    });

    const content = response.choices[0].message.content;
    console.log(`✅ Статья сгенерирована (${content.split(' ').length} слов)`);
    return content;

  } catch (err) {
    console.error('❌ Ошибка Gemini:', err.message);
    throw new Error(`Ошибка при генерации статьи: ${err.message}`);
  }
}

export async function rewriteArticle(originalContent) {
  try {
    console.log('🔄 Переписываю статью через Gemini...');

    const response = await getClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Переписать эту статью, следуя всем правилам:\n\n${originalContent}` }
      ],
      temperature: 0.7
    });

    const rewritten = response.choices[0].message.content;
    console.log('✅ Статья переписана');
    return rewritten;

  } catch (err) {
    console.error('❌ Ошибка переписи:', err.message);
    throw new Error(`Ошибка при переписи статьи: ${err.message}`);
  }
}
