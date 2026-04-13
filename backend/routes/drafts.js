import express from 'express';
import { sendMessageToMax } from '../services/max-api.js';

const router = express.Router();

// GET /api/drafts - Получить все черновики
router.get('/', async (req, res) => {
  try {
    const drafts = await req.db.collection('drafts')
      .find({ status: { $in: ['pending_approval', 'draft'] } })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(drafts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/drafts/:id - Получить один черновик
router.get('/:id', async (req, res) => {
  try {
    const draft = await req.db.collection('drafts').findOne({ _id: req.params.id });

    if (!draft) {
      return res.status(404).json({ error: 'Черновик не найден' });
    }

    res.json(draft);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/drafts/:id/approve - Одобрить и опубликовать
router.post('/:id/approve', async (req, res) => {
  try {
    const draft = await req.db.collection('drafts').findOne({ _id: req.params.id });

    if (!draft) {
      return res.status(404).json({ error: 'Черновик не найден' });
    }

    // Обновляем статус на published
    await req.db.collection('drafts').updateOne(
      { _id: req.params.id },
      {
        $set: {
          status: 'published',
          publishedAt: new Date(),
          approvedAt: new Date()
        }
      }
    );

    // Сохраняем как опубликованную статью
    const article = {
      _id: `article-${Date.now()}`,
      ...draft,
      status: 'published',
      publishedAt: new Date()
    };

    await req.db.collection('articles').insertOne(article);

    // Отправляем уведомление в Max
    if (draft.userId && draft.conversationId) {
      await sendMessageToMax(
        draft.userId,
        draft.conversationId,
        `✅ Статья опубликована!\n\n<b>${draft.title}</b>\n\n` +
        `<a href="http://${process.env.SERVER_URL}/blog/${draft._id}">Посмотреть на сайте</a>`,
        []
      );
    }

    console.log(`✅ Статья опубликована: ${draft.title}`);
    res.json({ ok: true, message: 'Статья опубликована' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/drafts/:id/reject - Отклонить
router.post('/:id/reject', async (req, res) => {
  try {
    const draft = await req.db.collection('drafts').findOne({ _id: req.params.id });

    if (!draft) {
      return res.status(404).json({ error: 'Черновик не найден' });
    }

    // Удаляем черновик
    await req.db.collection('drafts').deleteOne({ _id: req.params.id });

    // Отправляем уведомление в Max
    if (draft.userId && draft.conversationId) {
      await sendMessageToMax(
        draft.userId,
        draft.conversationId,
        `❌ Черновик отклонен и удален.\n\n` +
        `Напиши новую команду чтобы создать другую статью.`,
        []
      );
    }

    console.log(`❌ Черновик отклонен: ${draft.title}`);
    res.json({ ok: true, message: 'Черновик удален' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/drafts/:id/update - Обновить содержимое черновика
router.post('/:id/update', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content не указан' });
    }

    await req.db.collection('drafts').updateOne(
      { _id: req.params.id },
      {
        $set: {
          content,
          updatedAt: new Date()
        }
      }
    );

    res.json({ ok: true, message: 'Черновик обновлен' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export { router as draftRouter };
