const http = require('http');
const mineflayer = require('mineflayer');

const BOT_HOST = 'xREA1_CRAFT.aternos.me';
const BOT_PORT = 64603;
const BOT_USERNAME = 'BOT.RM';
const jumpTimes = [5000, 3000, 2000, 8000];
const WEAPON_INTERVAL = 3000;

let botOnline = false;
let reconnecting = false;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', bot: botOnline ? 'online' : 'offline' }));
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`✅ الخادم يعمل على المنفذ ${PORT}`);
  createBot();
  setInterval(() => {
    http.get(`http://localhost:${PORT}/`, (res) => {
      res.resume();
      console.log('💓 نبضة داخلية — الخادم حي');
    }).on('error', () => {});
  }, 4 * 60 * 1000);
});

function scheduleReconnect() {
  if (reconnecting) return;
  reconnecting = true;
  setTimeout(() => {
    reconnecting = false;
    createBot();
  }, 5000);
}

function createBot() {
  console.log(`جاري الاتصال بـ ${BOT_HOST}:${BOT_PORT} ...`);
  const bot = mineflayer.createBot({
    host: BOT_HOST,
    port: BOT_PORT,
    username: BOT_USERNAME,
    auth: 'offline',
    version: false,
  });

  bot.on('spawn', () => {
    botOnline = true;
    console.log('✅ BOT.RM دخل السيرفر بنجاح!');
    let jIdx = 0;
    function jump() {
      if (!botOnline) return;
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 300);
      const delay = jumpTimes[jIdx];
      jIdx = (jIdx + 1) % jumpTimes.length;
      setTimeout(jump, delay);
    }
    jump();
    let slot = 0;
    const weaponTimer = setInterval(() => {
      if (!botOnline) { clearInterval(weaponTimer); return; }
      slot = (slot + 1) % 9;
      bot.setQuickBarSlot(slot);
    }, WEAPON_INTERVAL);
  });

  bot.on('end', () => {
    botOnline = false;
    console.log('⚠️ انقطع الاتصال — إعادة المحاولة بعد 5 ثوانٍ...');
    scheduleReconnect();
  });

  bot.on('error', (err) => {
    botOnline = false;
    if (['ECONNREFUSED','ECONNRESET','ENOTFOUND','ETIMEDOUT'].includes(err.code)) {
      console.log('🔴 السيرفر مغلق — إعادة المحاولة بعد 5 ثوانٍ...');
    } else {
      console.log(`⚠️ خطأ: ${err.message}`);
    }
    scheduleReconnect();
  });

  bot.on('kicked', (reason) => {
    botOnline = false;
    let msg;
    try { msg = typeof reason === 'string' ? reason : JSON.stringify(reason); }
    catch { msg = String(reason); }
    console.log(`🚫 طُرد البوت: ${msg}`);
    scheduleReconnect();
  });
                                 }
