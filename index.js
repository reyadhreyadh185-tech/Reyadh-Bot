const mineflayer = require('mineflayer');
const http = require('http');

const HOST = 'xREA1_CRAFT.aternos.me';
const PORT = 64603;
const BOT_NAME = 'REAL_BOT';
const RETRY_DELAY = 10000;

const JUMP_PATTERN = [4000, 6000, 7000, 3000, 2000];
let jumpIndex = 0;
let jumpTimeout = null;
let inventoryInterval = null;
let isConnecting = false;
let currentBot = null;

const httpPort = process.env.PORT || 3000;
const httpServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('REAL_BOT IS ALIVE AND RUNNING');
});

httpServer.listen(httpPort, () => {
  log(`HTTP server listening on port ${httpPort} (UptimeRobot ready)`);
});

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function stopTimers() {
  if (jumpTimeout) {
    clearTimeout(jumpTimeout);
    jumpTimeout = null;
  }
  if (inventoryInterval) {
    clearInterval(inventoryInterval);
    inventoryInterval = null;
  }
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
          try {
            if (bot && bot.entity) bot.setControlState('jump', false);
          } catch (_) {}
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

function createBot() {
  if (isConnecting) return;
  isConnecting = true;

  log(`Connecting to ${HOST}:${PORT} as ${BOT_NAME}...`);

  let bot;
  try {
    bot = mineflayer.createBot({
      host: HOST,
      port: PORT,
      username: BOT_NAME,
      auth: 'offline',
      version: false,
      hideErrors: true,
      checkTimeoutInterval: 30000,
    });
  } catch (err) {
    log(`Failed to create bot instance: ${err.message}`);
    isConnecting = false;
    setTimeout(createBot, RETRY_DELAY);
    return;
  }

  currentBot = bot;

  bot.once('spawn', () => {
    isConnecting = false;
    log('Bot spawned successfully! Starting activity loops...');
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
    log(`Kicked from server: ${r}`);
    stopTimers();
    currentBot = null;
    isConnecting = false;
    log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
    setTimeout(createBot, RETRY_DELAY);
  });

  bot.on('error', (err) => {
    log(`Connection error: ${err.message}`);
    stopTimers();
    currentBot = null;
    isConnecting = false;
    log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
    setTimeout(createBot, RETRY_DELAY);
  });

  bot.on('end', (reason) => {
    log(`Connection ended${reason ? ': ' + reason : ''}`);
    stopTimers();
    currentBot = null;
    isConnecting = false;
    log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
    setTimeout(createBot, RETRY_DELAY);
  });
}

process.on('uncaughtException', (err) => {
  log(`Uncaught exception: ${err.message}`);
});

process.on('unhandledRejection', (reason) => {
  log(`Unhandled rejection: ${reason}`);
});

createBot();
