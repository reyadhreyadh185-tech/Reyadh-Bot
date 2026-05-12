import mineflayer from "mineflayer";

const HOST = process.env.MC_HOST || "xREA1_CRAFT.aternos.me";
const PORT = parseInt(process.env.MC_PORT || "64603");
const RECONNECT_MS = 60_000;
const JUMP_INTERVALS = [1000, 2000, 3000, 4000, 7000, 9000];

let bot = null;
let reconnectTimer = null;
let isConnecting = false;
let movementTimer = null;
let jumpTimer = null;
let startX = null;
let startZ = null;
const RADIUS = 10;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

function stopTimers() {
  if (movementTimer) { clearTimeout(movementTimer); movementTimer = null; }
  if (jumpTimer) { clearTimeout(jumpTimer); jumpTimer = null; }
}

function scheduleJump() {
  const delay = JUMP_INTERVALS[rnd(0, JUMP_INTERVALS.length - 1)];
  jumpTimer = setTimeout(async () => {
    if (!bot) return;
    try {
      bot.setControlState("jump", true);
      await sleep(200);
      bot.setControlState("jump", false);
    } catch {}
    scheduleJump();
  }, delay);
}

function scheduleMovement() {
  const delay = rnd(3000, 8000);
  movementTimer = setTimeout(async () => {
    if (!bot || startX === null) return;
    try {
      const action = rnd(1, 5);
      switch (action) {
        case 1:
          bot.setControlState("forward", true);
          await sleep(rnd(400, 1200));
          bot.setControlState("forward", false);
          break;
        case 2:
          bot.setControlState("back", true);
          await sleep(rnd(400, 1000));
          bot.setControlState("back", false);
          break;
        case 3:
          bot.setControlState("left", true);
          await sleep(rnd(300, 900));
          bot.setControlState("left", false);
          break;
        case 4:
          bot.setControlState("right", true);
          await sleep(rnd(300, 900));
          bot.setControlState("right", false);
          break;
        case 5: {
          const yaw = (Math.random() * Math.PI * 2) - Math.PI;
          bot.look(yaw, 0, true);
          break;
        }
      }
      const newPos = bot.entity.position;
      if (
        Math.abs(newPos.x - startX) > RADIUS ||
        Math.abs(newPos.z - startZ) > RADIUS
      ) {
        const backX = clamp(newPos.x, startX - RADIUS, startX + RADIUS);
        const backZ = clamp(newPos.z, startZ - RADIUS, startZ + RADIUS);
        bot.chat(`/tp ${bot.username} ${backX.toFixed(1)} ~ ${backZ.toFixed(1)}`);
      }
    } catch {}
    scheduleMovement();
  }, delay);
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  console.log(`[xREA1] Reconnecting in ${RECONNECT_MS / 1000}s...`);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    createBot();
  }, RECONNECT_MS);
}

function createBot() {
  if (isConnecting || bot) return;
  isConnecting = true;
  console.log("[xREA1] Connecting...");

  const instance = mineflayer.createBot({
    host: HOST, port: PORT, username: "xREA1",
    hideErrors: false, checkTimeoutInterval: 60_000,
  });

  bot = instance;

  instance.once("spawn", () => {
    isConnecting = false;
    const pos = instance.entity.position;
    startX = pos.x;
    startZ = pos.z;
    console.log("[xREA1] Connected!");
    scheduleMovement();
    scheduleJump();
  });

  instance.on("kicked", (r) => {
    if (bot !== instance) return;
    console.log(`[xREA1] Kicked: ${r}`);
    stopTimers(); bot = null; isConnecting = false; scheduleReconnect();
  });
  instance.on("error", (e) => {
    if (bot !== instance) return;
    console.log(`[xREA1] Error: ${e.message}`);
    stopTimers(); bot = null; isConnecting = false; scheduleReconnect();
  });
  instance.on("end", (r) => {
    if (bot !== instance) return;
    console.log(`[xREA1] Disconnected: ${r}`);
    stopTimers(); bot = null; isConnecting = false; scheduleReconnect();
  });
}

export function startXrealBot() { createBot(); }
