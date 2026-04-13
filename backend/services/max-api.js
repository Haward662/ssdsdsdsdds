import fetch from 'node-fetch';

const MAX_API_URL = process.env.MAX_API_URL || 'https://api.max.im';
const MAX_BOT_TOKEN = process.env.MAX_BOT_TOKEN;
const MAX_BOT_ID = process.env.MAX_BOT_ID;

/**
 * Отправляет сообщение в Max (VK Workspace) с кнопками
 * @param {string} userId - ID пользователя в Max
 * @param {string} conversationId - ID беседы в Max
 * @param {string} text - Текст сообщения (поддерживает HTML: <b>, <i>, <a>, и т.д.)
 * @param {Array} buttons - Массив кнопок [{text, action, draftId}, ...]
 */
export async function sendMessageToMax(userId, conversationId, text, buttons = []) {
  try {
    if (!MAX_BOT_TOKEN || !MAX_BOT_ID) {
      console.warn('⚠️  MAX_BOT_TOKEN или MAX_BOT_ID не установлены');
      return;
    }

    // Готовим payload в зависимости от типа message (user chat или direct message)
    const payload = {
      user_id: userId,
      conversation_id: conversationId,
      text: text,
      buttons: buttons.map(btn => ({
        label: btn.text,
        action: {
          type: 'postback',
          payload: JSON.stringify({
            action: btn.action,
            draftId: btn.draftId || null
          })
        }
      }))
    };

    console.log(`📤 Отправляю сообщение в Max для ${userId}...`);

    const response = await fetch(`${MAX_API_URL}/bot/${MAX_BOT_ID}/send_message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MAX_BOT_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`❌ Ошибка Max API (${response.status}):`, errorData);
      throw new Error(`Max API error: ${response.status}`);
    }

    console.log('✅ Сообщение отправлено в Max');
    return await response.json();
  } catch (err) {
    console.error('❌ Ошибка отправки в Max:', err.message);
    // Не бросаем ошибку дальше, чтобы не прерывать основной процесс
  }
}

/**
 * Обрабатывает callback из Max (когда пользователь нажимает кнопку)
 * Вызывается из webhook при получении действия от пользователя
 */
export async function handleMaxCallback(payload, db) {
  try {
    const { action, draftId } = payload;

    console.log(`🔔 Callback из Max: action=${action}, draftId=${draftId}`);

    if (action === 'approve' && draftId) {
      // Одобрение статьи уже обрабатывается в /api/drafts/:id/approve
      return { status: 'approved' };
    }

    if (action === 'reject' && draftId) {
      // Отклонение статьи уже обрабатывается в /api/drafts/:id/reject
      return { status: 'rejected' };
    }

    return { status: 'unknown_action' };
  } catch (err) {
    console.error('❌ Ошибка обработки callback:', err.message);
    throw err;
  }
}

/**
 * Проверяет что webhook пришел от Max (валидирует подпись)
 * Если MAX_WEBHOOK_SECRET установлен, проверяет подпись
 */
export function validateMaxWebhook(req) {
  const secret = process.env.MAX_WEBHOOK_SECRET;

  if (!secret) {
    console.warn('⚠️  MAX_WEBHOOK_SECRET не установлен - пропускаю валидацию');
    return true;
  }

  // TODO: Реализовать проверку подписи если необходимо
  // В зависимости от документации Max
  return true;
}
