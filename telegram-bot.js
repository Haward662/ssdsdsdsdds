const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();

const token = process.env.TG_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const menuButtons = ['📝 Загрузить готовую', '🤖 По теме', '📋 Черновики', '◀️ В главное меню'];

console.log('🤖 Бот запущен...');

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Привет! Я на связи. Выбирай кнопку в меню.");
});

bot.on('message', async (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;
  
  const chatId = msg.chat.id;
  const text = msg.text;

  if (menuButtons.includes(text)) {
    if (text === '🤖 По теме') return bot.sendMessage(chatId, "Напиши тему, и я сгенерирую статью через NeuroAPI.");
    if (text === '📝 Загрузить готовую') return bot.sendMessage(chatId, "Отправь мне текст готовой статьи.");
    if (text === '📋 Черновики') return bot.sendMessage(chatId, "Раздел в разработке.");
    if (text === '◀️ В главное меню') return bot.sendMessage(chatId, "Ок, ты в главном меню.");
    return;
  }

  bot.sendMessage(chatId, `🚀 Принял: "${text.substring(0, 30)}...". Дал пинок NeuroAPI, жди...`);

  try {
    const response = await axios.post('http://localhost:5000/api/articles/pending', {
      title: text.substring(0, 50),
      content: text,
      source: text.length < 100 ? 'user_topic' : 'user'
    });

    if (response.data.ok) {
      bot.sendMessage(chatId, "✅ Нейронка отработала! Статья опубликована на сайте.");
    }
  } catch (error) {
    console.error('Ошибка сервера:', error.message);
    bot.sendMessage(chatId, "❌ Сервер ответил ошибкой.");
  }
});
