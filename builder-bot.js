import mineflayer from "mineflayer";

const HOST = process.env.MC_HOST || "xREA1_CRAFT.aternos.me";
const PORT = parseInt(process.env.MC_PORT || "64603");
const VERSION = process.env.MC_VERSION || "1.21.11";
// builder يعيد الاتصال بعد 20 ثانية لتجنب التصادم مع xREAL
const RECONNECT_MS = 20_000;
const TRIGGER = "!lobby";

let bot = null;
let reconnectTimer = null;
let isConnecting = false;
let isBuilding = false;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function cmd(b, c) {
  b.chat(c);
  await sleep(150);
}

async function buildLobby(b) {
  if (isBuilding) { b.chat("البناء جارٍ بالفعل..."); return; }
  isBuilding = true;

  const p = b.entity.position;
  const cx = Math.floor(p.x);
  const cy = Math.floor(p.y);
  const cz = Math.floor(p.z);
  const R = 50;
  const H = 16;

  b.chat("§6✦ بدأ بناء اللوبي الأسطوري! ✦");
  await sleep(500);

  await cmd(b, `/fill ${cx-R-3} ${cy-3} ${cz-R-3} ${cx+R+3} ${cy+H+5} ${cz+R+3} air`);
  await sleep(600);

  await cmd(b, `/fill ${cx-R} ${cy-3} ${cz-R} ${cx+R} ${cy-3} ${cz+R} bedrock`);
  await cmd(b, `/fill ${cx-R} ${cy-2} ${cz-R} ${cx+R} ${cy-2} ${cz+R} blackstone`);
  await cmd(b, `/fill ${cx-R} ${cy-1} ${cz-R} ${cx+R} ${cy-1} ${cz+R} polished_blackstone`);

  await cmd(b, `/fill ${cx-R} ${cy} ${cz-R} ${cx+R} ${cy} ${cz+R} quartz_block`);
  for (let x = cx-R; x <= cx+R; x += 4) {
    await cmd(b, `/fill ${x} ${cy} ${cz-R} ${x+1} ${cy} ${cz+R} smooth_quartz`);
  }
  for (let z = cz-R; z <= cz+R; z += 4) {
    await cmd(b, `/fill ${cx-R} ${cy} ${z} ${cx+R} ${cy} ${z} end_stone_bricks`);
  }
  await cmd(b, `/fill ${cx-R} ${cy} ${cz-R} ${cx+R} ${cy} ${cz-R+1} purpur_block`);
  await cmd(b, `/fill ${cx-R} ${cy} ${cz+R-1} ${cx+R} ${cy} ${cz+R} purpur_block`);
  await cmd(b, `/fill ${cx-R} ${cy} ${cz-R} ${cx-R+1} ${cy} ${cz+R} purpur_block`);
  await cmd(b, `/fill ${cx+R-1} ${cy} ${cz-R} ${cx+R} ${cy} ${cz+R} purpur_block`);

  await cmd(b, `/fill ${cx-R} ${cy+1} ${cz-R} ${cx+R} ${cy+H} ${cz-R+1} stone_bricks`);
  await cmd(b, `/fill ${cx-R} ${cy+1} ${cz+R-1} ${cx+R} ${cy+H} ${cz+R} stone_bricks`);
  await cmd(b, `/fill ${cx-R} ${cy+1} ${cz-R} ${cx-R+1} ${cy+H} ${cz+R} stone_bricks`);
  await cmd(b, `/fill ${cx+R-1} ${cy+1} ${cz-R} ${cx+R} ${cy+H} ${cz+R} stone_bricks`);
  await cmd(b, `/fill ${cx-R} ${cy+8} ${cz-R} ${cx+R} ${cy+8} ${cz-R+1} quartz_pillar`);
  await cmd(b, `/fill ${cx-R} ${cy+8} ${cz+R-1} ${cx+R} ${cy+8} ${cz+R} quartz_pillar`);
  await cmd(b, `/fill ${cx-R} ${cy+8} ${cz-R} ${cx-R+1} ${cy+8} ${cz+R} quartz_pillar`);
  await cmd(b, `/fill ${cx+R-1} ${cy+8} ${cz-R} ${cx+R} ${cy+8} ${cz+R} quartz_pillar`);
  await cmd(b, `/fill ${cx-R} ${cy+H} ${cz-R} ${cx+R} ${cy+H} ${cz-R+1} purpur_pillar`);
  await cmd(b, `/fill ${cx-R} ${cy+H} ${cz+R-1} ${cx+R} ${cy+H} ${cz+R} purpur_pillar`);
  await cmd(b, `/fill ${cx-R} ${cy+H} ${cz-R} ${cx-R+1} ${cy+H} ${cz+R} purpur_pillar`);
  await cmd(b, `/fill ${cx+R-1} ${cy+H} ${cz-R} ${cx+R} ${cy+H} ${cz+R} purpur_pillar`);

  const towers = [
    [cx-R, cz-R], [cx+R-3, cz-R], [cx-R, cz+R-3], [cx+R-3, cz+R-3]
  ];
  for (const [tx, tz] of towers) {
    await cmd(b, `/fill ${tx} ${cy+1} ${tz} ${tx+3} ${cy+H+6} ${tz+3} dark_prismarine`);
    await cmd(b, `/fill ${tx} ${cy+H+4} ${tz} ${tx+3} ${cy+H+6} ${tz+3} prismarine_bricks`);
    await cmd(b, `/fill ${tx+1} ${cy+H+7} ${tz+1} ${tx+2} ${cy+H+8} ${tz+2} sea_lantern`);
    await cmd(b, `/fill ${tx} ${cy+H+6} ${tz} ${tx+3} ${cy+H+6} ${tz+3} obsidian`);
  }

  const gateW = 9;
  const gateH = 11;
  const half = Math.floor(gateW / 2);

  await cmd(b, `/fill ${cx-half} ${cy+1} ${cz-R} ${cx+half} ${cy+gateH} ${cz-R+1} air`);
  await cmd(b, `/fill ${cx-half-1} ${cy+1} ${cz-R} ${cx-half-1} ${cy+gateH+2} ${cz-R+1} purpur_pillar`);
  await cmd(b, `/fill ${cx+half+1} ${cy+1} ${cz-R} ${cx+half+1} ${cy+gateH+2} ${cz-R+1} purpur_pillar`);
  await cmd(b, `/fill ${cx-half-1} ${cy+gateH+1} ${cz-R} ${cx+half+1} ${cy+gateH+2} ${cz-R+1} crying_obsidian`);
  await cmd(b, `/fill ${cx-half} ${cy+gateH+1} ${cz-R} ${cx+half} ${cy+gateH+1} ${cz-R} end_stone_bricks`);
  await cmd(b, `/setblock ${cx} ${cy+gateH+3} ${cz-R} beacon`);

  await cmd(b, `/fill ${cx-half} ${cy+1} ${cz+R-1} ${cx+half} ${cy+gateH} ${cz+R} air`);
  await cmd(b, `/fill ${cx-half-1} ${cy+1} ${cz+R-1} ${cx-half-1} ${cy+gateH+2} ${cz+R} purpur_pillar`);
  await cmd(b, `/fill ${cx+half+1} ${cy+1} ${cz+R-1} ${cx+half+1} ${cy+gateH+2} ${cz+R} purpur_pillar`);
  await cmd(b, `/fill ${cx-half-1} ${cy+gateH+1} ${cz+R-1} ${cx+half+1} ${cy+gateH+2} ${cz+R} crying_obsidian`);
  await cmd(b, `/fill ${cx-half} ${cy+gateH+1} ${cz+R-1} ${cx+half} ${cy+gateH+1} ${cz+R} end_stone_bricks`);
  await cmd(b, `/setblock ${cx} ${cy+gateH+3} ${cz+R} beacon`);

  await cmd(b, `/fill ${cx-R} ${cy+1} ${cz-half} ${cx-R+1} ${cy+gateH} ${cz+half} air`);
  await cmd(b, `/fill ${cx-R} ${cy+1} ${cz-half-1} ${cx-R+1} ${cy+gateH+2} ${cz-half-1} purpur_pillar`);
  await cmd(b, `/fill ${cx-R} ${cy+1} ${cz+half+1} ${cx-R+1} ${cy+gateH+2} ${cz+half+1} purpur_pillar`);
  await cmd(b, `/fill ${cx-R} ${cy+gateH+1} ${cz-half-1} ${cx-R+1} ${cy+gateH+2} ${cz+half+1} crying_obsidian`);
  await cmd(b, `/setblock ${cx-R} ${cy+gateH+3} ${cz} beacon`);

  await cmd(b, `/fill ${cx+R-1} ${cy+1} ${cz-half} ${cx+R} ${cy+gateH} ${cz+half} air`);
  await cmd(b, `/fill ${cx+R-1} ${cy+1} ${cz-half-1} ${cx+R} ${cy+gateH+2} ${cz-half-1} purpur_pillar`);
  await cmd(b, `/fill ${cx+R-1} ${cy+1} ${cz+half+1} ${cx+R} ${cy+gateH+2} ${cz+half+1} purpur_pillar`);
  await cmd(b, `/fill ${cx+R-1} ${cy+gateH+1} ${cz-half-1} ${cx+R} ${cy+gateH+2} ${cz+half+1} crying_obsidian`);
  await cmd(b, `/setblock ${cx+R} ${cy+gateH+3} ${cz} beacon`);

  const innerR = 30;
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const px = cx + Math.round(innerR * Math.cos(angle));
    const pz = cz + Math.round(innerR * Math.sin(angle));
    await cmd(b, `/fill ${px-1} ${cy+1} ${pz-1} ${px+1} ${cy+H-1} ${pz+1} purpur_pillar`);
    await cmd(b, `/fill ${px-1} ${cy+H} ${pz-1} ${px+1} ${cy+H+1} ${pz+1} sea_lantern`);
    await cmd(b, `/fill ${px-2} ${cy+H+2} ${pz-2} ${px+2} ${cy+H+2} ${pz+2} glowstone`);
  }

  await cmd(b, `/fill ${cx-R+2} ${cy+H+1} ${cz-R+2} ${cx+R-2} ${cy+H+1} ${cz+R-2} glass`);
  await cmd(b, `/fill ${cx-R+2} ${cy+H+1} ${cz-R+2} ${cx+R-2} ${cy+H+1} ${cz-R+3} sea_lantern`);
  await cmd(b, `/fill ${cx-R+2} ${cy+H+1} ${cz+R-3} ${cx+R-2} ${cy+H+1} ${cz+R-2} sea_lantern`);
  await cmd(b, `/fill ${cx-R+2} ${cy+H+1} ${cz-R+2} ${cx-R+3} ${cy+H+1} ${cz+R-2} sea_lantern`);
  await cmd(b, `/fill ${cx+R-3} ${cy+H+1} ${cz-R+2} ${cx+R-2} ${cy+H+1} ${cz+R-2} sea_lantern`);
  for (let x = cx-R+6; x <= cx+R-6; x += 12) {
    await cmd(b, `/fill ${x} ${cy+H+1} ${cz-R+2} ${x+1} ${cy+H+1} ${cz+R-2} sea_lantern`);
  }

  await cmd(b, `/fill ${cx-6} ${cy-1} ${cz-6} ${cx+6} ${cy-1} ${cz+6} gold_block`);
  await cmd(b, `/fill ${cx-5} ${cy} ${cz-5} ${cx+5} ${cy} ${cz+5} gold_block`);
  await cmd(b, `/fill ${cx-4} ${cy+1} ${cz-4} ${cx+4} ${cy+1} ${cz+4} diamond_block`);
  await cmd(b, `/fill ${cx-3} ${cy+2} ${cz-3} ${cx+3} ${cy+2} ${cz+3} iron_block`);
  await cmd(b, `/fill ${cx-2} ${cy+2} ${cz-2} ${cx+2} ${cy+2} ${cz+2} gold_block`);
  await cmd(b, `/setblock ${cx} ${cy+3} ${cz} beacon`);
  for (const [ox, oz] of [[4,4],[-4,4],[4,-4],[-4,-4]]) {
    await cmd(b, `/fill ${cx+ox} ${cy+1} ${cz+oz} ${cx+ox} ${cy+8} ${cz+oz} crying_obsidian`);
    await cmd(b, `/setblock ${cx+ox} ${cy+9} ${cz+oz} end_rod`);
  }

  for (let x = cx-R+5; x <= cx+R-5; x += 15) {
    for (let z = cz-R+5; z <= cz+R-5; z += 15) {
      await cmd(b, `/setblock ${x} ${cy} ${z} glowstone`);
    }
  }

  for (let x = cx-R+5; x <= cx+R-5; x += 10) {
    await cmd(b, `/fill ${x} ${cy+1} ${cz-R} ${x} ${cy+H+2} ${cz-R} prismarine_bricks`);
    await cmd(b, `/fill ${x} ${cy+1} ${cz+R} ${x} ${cy+H+2} ${cz+R} prismarine_bricks`);
  }
  for (let z = cz-R+5; z <= cz+R-5; z += 10) {
    await cmd(b, `/fill ${cx-R} ${cy+1} ${z} ${cx-R} ${cy+H+2} ${z} prismarine_bricks`);
    await cmd(b, `/fill ${cx+R} ${cy+1} ${z} ${cx+R} ${cy+H+2} ${z} prismarine_bricks`);
  }

  b.chat("§a✦ تم بناء اللوبي الأسطوري بنجاح! ✦");
  isBuilding = false;
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  console.log(`[BUILDER] Reconnecting in ${RECONNECT_MS / 1000}s...`);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    createBot();
  }, RECONNECT_MS);
}

function createBot() {
  if (isConnecting || bot) return;
  isConnecting = true;
  console.log("[BUILDER] Connecting...");

  const instance = mineflayer.createBot({
    host: HOST, port: PORT, username: "builder", version: VERSION,
    hideErrors: false, checkTimeoutInterval: 60_000,
  });
  bot = instance;

  instance.once("spawn", () => {
    isConnecting = false;
    console.log("[BUILDER] Connected. Waiting for !lobby command...");
  });

  instance.on("chat", (username, message) => {
    if (message.trim() === TRIGGER && username !== "builder") {
      console.log(`[BUILDER] Build triggered by ${username}`);
      buildLobby(instance).catch(e => {
        console.error("[BUILDER] Build error:", e.message);
        isBuilding = false;
      });
    }
  });

  instance.on("kicked", (r) => {
    if (bot !== instance) return;
    isBuilding = false;
    console.log(`[BUILDER] Kicked: ${r}`);
    bot = null; isConnecting = false; scheduleReconnect();
  });
  instance.on("error", (e) => {
    if (bot !== instance) return;
    isBuilding = false;
    console.log(`[BUILDER] Error: ${e.message}`);
    bot = null; isConnecting = false; scheduleReconnect();
  });
  instance.on("end", (r) => {
    if (bot !== instance) return;
    isBuilding = false;
    console.log(`[BUILDER] Disconnected: ${r}`);
    bot = null; isConnecting = false; scheduleReconnect();
  });
}

export function startBuilderBot() { createBot(); }
