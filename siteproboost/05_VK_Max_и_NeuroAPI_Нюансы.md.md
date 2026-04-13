# Технические нюансы и известные баги: VK Max API & NeuroAPI

**Суть:** Сборник критических правил для написания кода, основанный на предыдущих ошибках отладки. Строго соблюдать при изменении `server.js`.

## 1. Кнопки (Inline Keyboard) в VK Max
В библиотеке `@maxhub/max-bot-api` прямая передача объекта клавиатуры в `ctx.reply` вызывает ошибку `400: Field 'payload' cannot be null`. 
Кнопки **ОБЯЗАТЕЛЬНО** должны быть обернуты в массив `attachments`.

✅ **Правильный паттерн вывода кнопок:**
```javascript
const { Keyboard } = require('@maxhub/max-bot-api');

const mainMenu = Keyboard.inlineKeyboard([
  [Keyboard.button.callback('🚀 Генерировать сейчас', 'menu_generate')],
  [Keyboard.button.callback('📋 Черновики', 'menu_drafts')]
]);

await ctx.reply({
  text: "Выбери действие:",
  attachments: [mainMenu] // Обертка обязательна!
});

## Извлечение `userId` при клике на кнопку (bot.action)

Когда пользователь нажимает inline-кнопку, структура объекта `ctx` меняется. Использование стандартного пути (`ctx.message.sender.user_id`) приведет к тому, что в `userId` запишется ID самого бота, и стейт-менеджер сломается.

✅ **Правильный путь для получения ID пользователя в `bot.action`:**

JavaScript

```
const userId = ctx.update?.callback?.user?.user_id;
```