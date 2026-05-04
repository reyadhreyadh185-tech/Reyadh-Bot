const mineflayer = require('mineflayer');
const http = require('http');
const { generateSpawnCommands } = require('./builder');

const HOST = 'xREA1_CRAFT.aternos.me';
const PORT = 64603;
const BOT_NAME = 'MINECRAFT';
const VERSION = false;

const RETRY_DELAY_ONLINE  = 10000;  // 10s — after normal disconnect
const RETRY_DELAY_OFFLINE = 30000;  // 30s — when server appears offline
const LOGIN_TIMEOUT       = 15000;  // 15s — if no login packet → server offline
const SPAWN_TIMEOUT       = 60000;  // 60s — if logged in but no spawn

const JUMP_PATTERN = [4000, 6000, 7000, 3000, 2000];
let jumpIndex = 0;
let jumpTimeout = null;
let inventoryInterval = null;
let loginTimeoutHandle = null;
let spawnTimeoutHandle = null;
let retryScheduled = false;
let currentBot = null;
let isBuilding = false;

// ── HTTP server for UptimeRobot ───────────────────────────────────────────────
const httpPort = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('REAL_BOT IS ALIVE');
}).listen(httpPort, () => log(`HTTP server on port ${httpPort}`));

// ── Helpers ───────────────────────────────────────────────────────────────────
function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
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
  if (isBuilding) { bot.chat('Building already in progress...'); return; }
  isBuilding = true;

  const pos = bot.entity.position;
  const cx = Math.floor(pos.x);
  const cy = Math.floor(pos.y);
  const cz = Math.floor(pos.z);

  log(`Building spawn at ${cx} ${cy} ${cz}`);
  bot.chat(`Starting spawn build at ${cx} ${cy} ${cz}...`);

  const cmds = generateSpawnCommands(cx, cy, cz);
  bot.chat(`Placing ${cmds.length} blocks (~${Math.ceil(cmds.length * 0.15 / 60)} min)`);

  for (let i = 0; i < cmds.length; i++) {
    if (!currentBot) break;
    try { bot.chat(`/${cmds[i]}`); } catch (_) { break; }
    await sleep(150);
    if (i > 0 && i % 200 === 0) {
      bot.chat(`Building... ${Math.floor((i / cmds.length) * 100)}%`);
    }
  }

  isBuilding = false;
  if (currentBot) bot.chat('Spawn building complete!');
  log('Spawn build finished.');
}

// ── Main bot ──────────────────────────────────────────────────────────────────
function createBot() {
  log(`Connecting to ${HOST}:${PORT} as ${BOT_NAME} [auto-version]...`);

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
    scheduleRetry(`Failed to create bot: ${err.message}`, RETRY_DELAY_OFFLINE);
    return;
  }

  currentBot = bot;

  // If no login packet in 15s → server is likely offline
  loginTimeoutHandle = setTimeout(() => {
    log('No login packet received — server may be offline or starting...');
    scheduleRetry('Server offline/unreachable', RETRY_DELAY_OFFLINE);
  }, LOGIN_TIMEOUT);

  bot.once('login', () => {
    if (loginTimeoutHandle) { clearTimeout(loginTimeoutHandle); loginTimeoutHandle = null; }
    log('Login received — waiting for spawn...');

    // After login, wait up to 60s for spawn
    spawnTimeoutHandle = setTimeout(() => {
      scheduleRetry('Spawn timeout (60s)', RETRY_DELAY_ONLINE);
    }, SPAWN_TIMEOUT);
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
    const msg = message.trim().toLowerCase();
    if (msg === '!buildspawn') buildSpawn(bot);
    if (msg === '!help') bot.chat('Commands: !buildspawn | !pos | !help');
    if (msg === '!pos') {
      const p = bot.entity.position;
      bot.chat(`Position: ${Math.floor(p.x)} ${Math.floor(p.y)} ${Math.floor(p.z)}`);
    }
  });

  bot.on('kicked', (reason) => {
    let r = reason;
    try { r = JSON.parse(reason)?.text || reason; } catch (_) {}
    scheduleRetry(`Kicked: ${r}`, RETRY_DELAY_ONLINE);
  });

  bot.on('error', (err) => {
    scheduleRetry(`Error: ${err.message}`, RETRY_DELAY_OFFLINE);
  });

  bot.on('end', (reason) => {
    scheduleRetry(`Ended: ${reason || 'no reason'}`, RETRY_DELAY_ONLINE);
  });
}

process.on('uncaughtException', (err) => log(`Uncaught: ${err.message}`));
process.on('unhandledRejection', (r) => log(`Rejection: ${r}`));

createBot();
