/**
 * Парсит команды из Max сообщений
 * Ищет паттерн: "Ниша: [X] | Тема: [Y]"
 */
export function parseMaxCommand(message) {
  if (!message || typeof message !== 'string') {
    return null;
  }

  // Паттерн: "Ниша: [что-то] | Тема: [что-то]"
  const regex = /Ниша:\s*([^|]+)\s*\|\s*Тема:\s*(.+)/i;
  const match = message.match(regex);

  if (!match) {
    return null;
  }

  return {
    niche: match[1].trim(),
    topic: match[2].trim()
  };
}

/**
 * Валидирует что нища и тема не пусты и имеют допустимую длину
 */
export function validateCommand(niche, topic) {
  const errors = [];

  if (!niche || niche.length < 2) {
    errors.push('Ниша должна быть минимум 2 символа');
  }

  if (niche.length > 100) {
    errors.push('Ниша максимум 100 символов');
  }

  if (!topic || topic.length < 2) {
    errors.push('Тема должна быть минимум 2 символа');
  }

  if (topic.length > 200) {
    errors.push('Тема максимум 200 символов');
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}
