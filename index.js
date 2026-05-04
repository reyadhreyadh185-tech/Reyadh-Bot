const mineflayer = require('mineflayer');
const http = require('http');

const HOST = 'xREA1_CRAFT.aternos.me';
const PORT = 64603;
const BOT_NAME = 'REAL_BOT';
const VERSION = '1.21.1';
const RETRY_DELAY = 10000;
const SPAWN_TIMEOUT = 30000;

const JUMP_PATTERN = [4000, 6000, 7000, 3000, 2000];
let jumpIndex = 0;
let jumpTimeout = null;
let inventoryInterval = null;
let spawnTimeoutHandle = null;
let retryScheduled = false;
let currentBot = null;

const httpPort = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('REAL_BOT IS ALIVE');
}).listen(httpPort, () => log(`HTTP server on port ${httpPort}`));

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function stopTimers() {
  if (jumpTimeout) { clearTimeout(jumpTimeout); jumpTimeout = null; }
  if (inventoryInterval) { clearInterval(inventoryInterval); inventoryInterval = null; }
  if (spawnTimeoutHandle) { clearTimeout(spawnTimeoutHandle); spawnTimeoutHandle = null; }
}

function scheduleNextJump(bot) {
  if (jumpTimeout) clearTimeout(jumpTimeout);
  const delay = JUMP_PATTERN[jumpIndex % JUMP_PATTERN.length];
  jumpIndex++;
  jumpTimeout = setTimeout(() => {
    try {
      if (bot && bot.entity) {
        bot.setControlState('jump', true);
        setTimeout(() => {
          try { if (bot && bot.entity) bot.setControlState('jump', false); } catch (_) {}
        }, 250);
      }
    } catch (_) {}
    scheduleNextJump(bot);
  }, delay);
}

function startInventoryCycle(bot) {
  if (inventoryInterval) clearInterval(inventoryInterval);
  let slot = 0;
  inventoryInterval = setInterval(() => {
    try {
      if (bot && bot.entity) {
        slot = (slot + 1) % 9;
        bot.setQuickBarSlot(slot);
      }
    } catch (_) {}
  }, 2000);
}

function scheduleRetry(reason) {
  stopTimers();

  if (currentBot) {
    try { currentBot.removeAllListeners(); } catch (_) {}
    try { currentBot._client && currentBot._client.end(); } catch (_) {}
    currentBot = null;
  }

  if (retryScheduled) return;
  retryScheduled = true;

  log(`${reason} — reconnecting in ${RETRY_DELAY / 1000}s...`);
  setTimeout(() => {
    retryScheduled = false;
    createBot();
  }, RETRY_DELAY);
}

function createBot() {
  log(`Connecting to ${HOST}:${PORT} as ${BOT_NAME} [${VERSION}]...`);

  let bot;
  try {
    bot = mineflayer.createBot({
      host: HOST,
      port: PORT,
      username: BOT_NAME,
      auth: 'offline',
      version: VERSION,
      hideErrors: true,
      checkTimeoutInterval: 30000,
    });
  } catch (err) {
    scheduleRetry(`Failed to create bot: ${err.message}`);
    return;
  }

  currentBot = bot;

  spawnTimeoutHandle = setTimeout(() => {
    scheduleRetry('Spawn timeout (30s)');
  }, SPAWN_TIMEOUT);

  bot.once('login', () => {
    log('Logged in — waiting for spawn...');
  });

  bot.on('messagestr', (msg) => {
    log(`[MSG] ${msg}`);
  });

  bot.once('spawn', () => {
    if (spawnTimeoutHandle) { clearTimeout(spawnTimeoutHandle); spawnTimeoutHandle = null; }
    log('Spawned! Activity loops starting...');
    jumpIndex = 0;
    scheduleNextJump(bot);
    startInventoryCycle(bot);
  });

  bot.on('chat', (username, message) => {
    log(`[CHAT] <${username}> ${message}`);
  });

  bot.on('kicked', (reason) => {
    let r = reason;
    try { r = JSON.parse(reason)?.text || reason; } catch (_) {}
    scheduleRetry(`Kicked: ${r}`);
  });

  bot.on('error', (err) => {
    scheduleRetry(`Error: ${err.message}`);
  });

  bot.on('end', (reason) => {
    scheduleRetry(`Ended: ${reason || 'no reason'}`);
  });
}

process.on('uncaughtException', (err) => log(`Uncaught: ${err.message}`));
process.on('unhandledRejection', (r) => log(`Rejection: ${r}`));

createBot();
