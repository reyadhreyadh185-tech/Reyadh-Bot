const mineflayer = require('mineflayer');
const http = require('http');
const { generateSpawnCommands } = require('./builder');

const HOST = 'xREA1_CRAFT.aternos.me';
const PORT = 64603;
const BOT_NAME = 'SERVER_REYADH';
const VERSION = false;

const RETRY_DELAY_ONLINE  = 10000;
const RETRY_DELAY_OFFLINE = 30000;
const LOGIN_TIMEOUT       = 15000;
const SPAWN_TIMEOUT       = 60000;

const JUMP_PATTERN = [4000, 6000, 7000, 3000, 2000];
let jumpIndex       = 0;
let jumpTimeout     = null;
let inventoryInterval  = null;
let loginTimeoutHandle = null;
let spawnTimeoutHandle = null;
let retryScheduled  = false;
let currentBot      = null;
let isBuilding      = false;
let silentMode      = false; // !silent toggle

// ── HTTP server — UptimeRobot + auto-reconnect check ─────────────────────────
const httpPort = process.env.PORT || 3000;
http.createServer((req, res) => {
  const alive = !!(currentBot && currentBot.entity);
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(alive ? 'BOT_ONLINE' : 'BOT_OFFLINE');

  // If bot is not connected, trigger reconnect after 5 seconds
  if (!alive && !retryScheduled) {
    log('Ping received — bot offline, reconnecting in 5s...');
    setTimeout(() => {
      if (!retryScheduled && !currentBot) {
        retryScheduled = false;
        createBot();
      }
    }, 5000);
  }
}).listen(httpPort, () => log(`HTTP server on port ${httpPort}`));

// ── Helpers ───────────────────────────────────────────────────────────────────
function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function botSay(bot, msg) {
  if (!silentMode) {
    try { bot.chat(msg); } catch (_) {}
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function stopTimers() {
  if (jumpTimeout)        { clearTimeout(jumpTimeout);        jumpTimeout = null; }
  if (inventoryInterval)  { clearInterval(inventoryInterval); inventoryInterval = null; }
  if (loginTimeoutHandle) { clearTimeout(loginTimeoutHandle); loginTimeoutHandle = null; }
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

function scheduleRetry(reason, delay) {
  stopTimers();
  isBuilding = false;
  if (currentBot) {
    try { currentBot.removeAllListeners(); } catch (_) {}
    try { currentBot._client && currentBot._client.end(); } catch (_) {}
    currentBot = null;
  }
  if (retryScheduled) return;
  retryScheduled = true;
  const wait = delay || RETRY_DELAY_ONLINE;
  log(`${reason} — reconnecting in ${wait / 1000}s...`);
  setTimeout(() => {
    retryScheduled = false;
    createBot();
  }, wait);
}

// ── Spawn builder ─────────────────────────────────────────────────────────────
async function buildSpawn(bot) {
  if (isBuilding) { botSay(bot, 'Already building...'); return; }
  isBuilding = true;

  const pos = bot.entity.position;
  const cx = Math.floor(pos.x);
  const cy = Math.floor(pos.y);
  const cz = Math.floor(pos.z);

  log(`Building epic spawn at ${cx} ${cy} ${cz}`);
  botSay(bot, `Starting EPIC spawn build at ${cx} ${cy} ${cz}...`);

  const cmds = generateSpawnCommands(cx, cy, cz);
  botSay(bot, `Placing ${cmds.length} blocks (~${Math.ceil(cmds.length * 0.15 / 60)} min). Use !silent to hide updates.`);

  for (let i = 0; i < cmds.length; i++) {
    if (!currentBot) break;
    try { bot.chat(`/${cmds[i]}`); } catch (_) { break; }
    await sleep(220);
    if (i > 0 && i % 100 === 0) {
      const pct = Math.floor((i / cmds.length) * 100);
      botSay(bot, `Building... ${pct}% (${i}/${cmds.length})`);
    }
  }

  isBuilding = false;
  if (currentBot) botSay(bot, 'EPIC spawn building COMPLETE!');
  log('Build finished.');
}

// ── Main bot ──────────────────────────────────────────────────────────────────
function createBot() {
  log(`Connecting to ${HOST}:${PORT} as ${BOT_NAME}...`);

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
    scheduleRetry(`Failed: ${err.message}`, RETRY_DELAY_OFFLINE);
    return;
  }

  currentBot = bot;

  loginTimeoutHandle = setTimeout(() => {
    log('No login — server may be offline');
    scheduleRetry('Login timeout', RETRY_DELAY_OFFLINE);
  }, LOGIN_TIMEOUT);

  bot.once('login', () => {
    if (loginTimeoutHandle) { clearTimeout(loginTimeoutHandle); loginTimeoutHandle = null; }
    log('Login OK — waiting for spawn...');
    spawnTimeoutHandle = setTimeout(() => {
      scheduleRetry('Spawn timeout (60s)', RETRY_DELAY_ONLINE);
    }, SPAWN_TIMEOUT);
  });

  bot.on('messagestr', (msg) => {
    if (!silentMode) log(`[MSG] ${msg}`);
  });

  bot.once('spawn', () => {
    if (spawnTimeoutHandle) { clearTimeout(spawnTimeoutHandle); spawnTimeoutHandle = null; }
    log('Spawned! Bot is active.');
    jumpIndex = 0;
    scheduleNextJump(bot);
    startInventoryCycle(bot);
  });

  bot.on('chat', (username, message) => {
    if (!silentMode) log(`[CHAT] <${username}> ${message}`);
    const msg = message.trim().toLowerCase();

    if (msg === '!buildspawn')  buildSpawn(bot);
    if (msg === '!silent') {
      silentMode = !silentMode;
      bot.chat(`Silent mode: ${silentMode ? 'ON' : 'OFF'}`);
    }
    if (msg === '!help') {
      bot.chat('Commands: !buildspawn | !silent | !pos | !help');
    }
    if (msg === '!pos') {
      const p = bot.entity.position;
      bot.chat(`Pos: ${Math.floor(p.x)} ${Math.floor(p.y)} ${Math.floor(p.z)}`);
    }
  });

  bot.on('kicked', (reason) => {
    let r = reason;
    try { r = JSON.parse(reason)?.text || reason; } catch (_) {}
    scheduleRetry(`Kicked: ${r}`, RETRY_DELAY_ONLINE);
  });

  bot.on('error',  (err)    => scheduleRetry(`Error: ${err.message}`, RETRY_DELAY_OFFLINE));
  bot.on('end',    (reason) => scheduleRetry(`Ended: ${reason || '-'}`, RETRY_DELAY_ONLINE));
}

process.on('uncaughtException',  (err) => log(`Uncaught: ${err.message}`));
process.on('unhandledRejection', (r)   => log(`Rejection: ${r}`));

createBot();
