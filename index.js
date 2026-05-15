const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const http = require('http');
const https = require('https');
const { SocksProxyAgent } = require('socks-proxy-agent');

let bot;
let spawnPos = null;
let isConnecting = false;

// دالة جلب بروكسي مع مهلة زمنية قصيرة لضمان السرعة
function fetchFreeProxy() {
    return new Promise((resolve) => {
        const options = {
            hostname: 'api.proxyscrape.com',
            path: '/v2/?request=displayproxies&protocol=socks5&timeout=3000',
            method: 'GET'
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const proxies = data.split('\r\n').filter(p => p.includes(':'));
                resolve(proxies.length > 0 ? `socks5://${proxies[Math.floor(Math.random() * proxies.length)]}` : null);
            });
        });
        req.on('error', () => resolve(null));
        req.end();
    });
}

async function createBot() {
    if (isConnecting || (bot && bot.entity)) return;
    
    isConnecting = true;
    console.log("🧹 جاري تنظيف الجلسة السابقة بعناية...");

    // إصلاح الخطأ: استخدام طريقة آمنة لإنهاء البوت
    if (bot) {
        try {
            if (typeof bot.end === 'function') bot.end();
            bot.removeAllListeners();
        } catch (e) {
            console.log("⚠️ فشل تنظيف البوت القديم، سأكمل على أي حال.");
        }
    }

    const proxyUrl = await fetchFreeProxy();
    if (!proxyUrl) {
        isConnecting = false;
        console.log("❌ لم أجد بروكسي سريع، سأنتظر النبضة القادمة.");
        return;
    }

    console.log(`📡 [REAL] محاولة تسلل ببروكسي: ${proxyUrl}`);
    
    bot = mineflayer.createBot({
        host: 'xREA1_CRAFT.aternos.me',
        port: 64603,
        username: 'REAL',
        version: false,
        agent: new SocksProxyAgent(proxyUrl),
        connectTimeout: 90000 // زيادة المهلة لتجنب ETIMEDOUT
    });

    bot.loadPlugin(pathfinder);

    bot.once('spawn', () => {
        isConnecting = false;
        console.log("✅ [REAL] اخترق الحظر واستقر في السيرفر!");
        if (!spawnPos) spawnPos = bot.entity.position.clone();
        const movements = new Movements(bot);
        bot.pathfinder.setMovements(movements);
        mainLoop();
    });

    bot.on('end', () => {
        isConnecting = false;
        console.log("🔄 انفصل البوت (البروكسي مات أو تم الطرد).");
    });

    bot.on('error', (err) => {
        isConnecting = false;
        console.log(`⚠️ خطأ اتصال: ${err.message}`);
    });
}

// سيرفر الويب: المحرك الحقيقي للبوت عبر Uptime Robot
http.createServer((req, res) => {
    if (!bot || !bot.entity) {
        console.log("⚡ نبض من Uptime Robot: البوت متوقف، جاري الإنعاش...");
        createBot(); 
        res.writeHead(200);
        res.end('Reviving REAL...');
    } else {
        res.writeHead(200);
        res.end('REAL is alive and kicking!');
    }
}).listen(10000);

async function mainLoop() {
    while (bot && bot.entity) {
        try {
            const rx = Math.floor(Math.random() * 11) - 5;
            const rz = Math.floor(Math.random() * 11) - 5;
            const targetPos = spawnPos.offset(rx, 0, rz);
            await bot.pathfinder.goto(new goals.GoalNear(targetPos.x, targetPos.y, targetPos.z, 1));
        } catch (e) {}
        await new Promise(r => setTimeout(r, 15000));
    }
}

// البدء فوراً عند التشغيل
createBot();
