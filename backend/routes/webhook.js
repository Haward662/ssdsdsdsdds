import express from 'express';
import { parseMaxCommand } from '../services/command-parser.js';
import { generateArticle } from '../services/neuroapi.js';
import { sendMessageToMax } from '../services/max-api.js';

const router = express.Router();

// POST /webhook/max - Прием сообщений из Max (VK Workspace)
router.post('/max', async (req, res) => {
  try {
    const { message, userId, conversationId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Сообщение не найдено' });
    }

    console.log(`📨 Получено сообщение из Max: "${message}"`);

    // Парсим команду (ищем "Ниша: X | Тема: Y")
    const parsed = parseMaxCommand(message);

    if (!parsed) {
      // Если это не команда - отправляем справку
      await sendMessageToMax(
        userId,
        conversationId,
        `Я не понял команду. Используй формат:\n\n` +
        `<b>Ниша:</b> SEO | <b>Тема:</b> Как писать метатеги\n\n` +
        `Или отправь готовую статью с текстом для переписи.`,
        []
      );
      return res.json({ ok: true });
    }

    const { niche, topic } = parsed;

    // Показываем что генерируем
    await sendMessageToMax(
      userId,
      conversationId,
      `⏳ Генерирую статью...\nНиша: <b>${niche}</b>\nТема: <b>${topic}</b>`,
      []
    );

    // Генерируем статью через NeuroAPI
    const content = await generateArticle(niche, topic);

    // Сохраняем как черновик в MongoDB
    const draft = {
      _id: `draft-${Date.now()}`,
      title: `${niche}: ${topic}`,
      niche,
      topic,
      content,
      source: 'user',
      status: 'pending_approval',
      createdAt: new Date(),
      approvedAt: null,
      publishedAt: null,
      userId,
      conversationId
    };

    await req.db.collection('drafts').insertOne(draft);

    // Отправляем ссылку на черновик и кнопки одобрения
    await sendMessageToMax(
      userId,
      conversationId,
      `✅ Статья создана!\n\n` +
      `<b>${niche}: ${topic}</b>\n\n` +
      `<a href="http://${process.env.SERVER_URL}/dashboard/drafts/${draft._id}">Посмотреть полный текст</a>\n\n` +
      `Нажми одобрить или переделать:`,
      [
        { text: '✅ Одобрить и опубликовать', action: 'approve', draftId: draft._id },
        { text: '❌ Переделать', action: 'reject', draftId: draft._id },
        { text: '📝 Редактировать самому', action: 'edit', draftId: draft._id }
      ]
    );

    res.json({ ok: true, draftId: draft._id });
  } catch (err) {
    console.error('❌ Ошибка webhook:', err.message);

    try {
      await sendMessageToMax(
        req.body.userId,
        req.body.conversationId,
        `❌ Ошибка: ${err.message}`,
        []
      );
    } catch (e) {
      // Если не смогли отправить ошибку - просто логируем
    }

    res.status(500).json({ error: err.message });
  }
});

export { router as webhookRouter };
