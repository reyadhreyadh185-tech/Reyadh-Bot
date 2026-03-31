const mineflayer = require('mineflayer');
const express = require('express');

// نظام الويب لضمان العمل 24/7
const app = express();
app.get('/', (req, res) => res.send('✅ RM_SYSTEM_ONLINE'));
app.listen(8080);

const botArgs = {
  host: 'REA1_CRAFT.aternos.me',
  port: 18542,
  username: 'RM_GUARD_FINAL',
  version: '1.21.1' 
};

function createBot() {
  const bot = mineflayer.createBot(botArgs);

  bot.on('spawn', () => {
    console.log('⚔️ [RM] تم الدخول بنجاح!');
    setInterval(() => {
      if (bot.entity) {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 500);
      }
    }, 20000);
  });

  bot.on('end', () => setTimeout(createBot, 10000));
  bot.on('error', (err) => console.log('Error: ' + err.message));
}

createBot();
