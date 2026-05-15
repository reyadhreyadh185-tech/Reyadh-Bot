const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const http = require('http');
const https = require('https');
const { SocksProxyAgent } = require('socks-proxy-agent');

let bot;
let spawnPos = null;
let isConnecting = false;

// دالة جلب البروكسي (نفس السابقة)
function fetchFreeProxy() {
    return new Promise((resolve) => {
        https.get('https://api.proxyscrape.com/v2/?request=displayproxies&protocol=socks5&timeout=5000', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const proxies = data.split('\r\n').filter(p => p.includes(':'));
                resolve(proxies.length > 0 ? `socks5://${proxies[Math.floor(Math.random() * proxies.length)]}` : null);
            });
        }).on('error', () => resolve(null));
    });
}

// دالة إنشاء البوت
async function createBot() {
    if (isConnecting || (bot && bot.entity)) return;
    
    isConnecting = true;
    if (bot) { bot.quit(); bot.removeAllListeners(); }

    const proxyUrl = await fetchFreeProxy();
    if (!proxyUrl) { isConnecting = false; return; }

    console.log(`📡 [REAL] محاولة تسلل ببروكسي: ${proxyUrl}`);
    bot = mineflayer.createBot({
        host: 'xREA1_CRAFT.aternos.me',
        port: 64603,
        username: 'REAL',
        version: false,
        agent: new SocksProxyAgent(proxyUrl),
        connectTimeout: 60000
    });

    bot.loadPlugin(pathfinder);

    bot.on('spawn', () => {
        isConnecting = false;
        console.log("✅ [REAL] مستقر الآن.");
        if (!spawnPos) spawnPos = bot.entity.position.clone();
        const movements = new Movements(bot);
        bot.pathfinder.setMovements(movements);
        mainLoop();
    });

    bot.on('end', () => { isConnecting = false; console.log("🔄 انفصل البوت."); });
    bot.on('error', () => { isConnecting = false; });
}

// *** التعديل الجوهري هنا: ربط أوبتايم روبوت بالبوت ***
http.createServer((req, res) => {
    // كلما زار Uptime Robot الرابط، سيتم تنفيذ هذا الجزء
    if (!bot || !bot.entity) {
        console.log("⚡ نبض من Uptime Robot: البوت متوقف، جاري إيقاظه...");
        createBot(); 
        res.writeHead(200);
        res.end('Bot REAL is being revived...');
    } else {
        res.writeHead(200);
        res.end('Bot REAL is already active!');
    }
}).listen(10000);

async function mainLoop() {
    while (bot && bot.entity) {
        try {
            const rx = Math.floor(Math.random() * 21) - 10;
            const rz = Math.floor(Math.random() * 21) - 10;
            const targetPos = spawnPos.offset(rx, 0, rz);
            await bot.pathfinder.goto(new goals.GoalNear(targetPos.x, targetPos.y, targetPos.z, 1));
        } catch (e) {}
        await new Promise(r => setTimeout(r, 10000));
    }
}

// أول تشغيل عند رفع الكود
createBot();
