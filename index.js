const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const http = require('http');
const https = require('https');
const { SocksProxyAgent } = require('socks-proxy-agent');

// 1. سيرفر الويب: يعمل فوراً لإبقاء Uptime Robot باللون الأخضر ومستقل عن البوت
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Bot REAL is Online via Auto-Proxy');
}).listen(10000, () => {
    console.log("🟢 أوبتايم روبوت أخضر! سيرفر الويب يعمل بثبات.");
});

let bot;
let spawnPos = null;

// 2. دالة ذكية لجلب بروكسي SOCKS5 مجاني تلقائياً من واجهة برمجية (API)
function fetchFreeProxy() {
    return new Promise((resolve, reject) => {
        console.log("🔍 جاري البحث عن بروكسي جديد تلقائياً للتخفي...");
        https.get('https://api.proxyscrape.com/v2/?request=displayproxies&protocol=socks5&timeout=5000&country=all&ssl=all&anonymity=all', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const proxies = data.split('\r\n').map(p => p.trim()).filter(p => p.includes(':'));
                if (proxies.length > 0) {
                    // اختيار بروكسي عشوائي من القائمة
                    const randomProxy = proxies[Math.floor(Math.random() * proxies.length)];
                    console.log(`✅ تم العثور على قناع (بروكسي): ${randomProxy}`);
                    resolve(`socks5://${randomProxy}`);
                } else {
                    reject('لم يتم العثور على بروكسيات حالياً.');
                }
            });
        }).on('error', err => reject(err.message));
    });
}

// 3. التشغيل الرئيسي للبوت
async function createBot() {
    try {
        // جلب البروكسي قبل محاولة دخول السيرفر
        const proxyUrl = await fetchFreeProxy();
        const proxyAgent = new SocksProxyAgent(proxyUrl);

        console.log(`📡 [REAL] جاري التسلل إلى أترنوس عبر البروكسي...`);
        
        if (bot) bot.removeAllListeners();

        bot = mineflayer.createBot({
            host: 'xREA1_CRAFT.aternos.me',
            port: 64603,
            username: 'REAL',
            version: false, // يحدد الإصدار وحده كما طلبت
            agent: proxyAgent, // ارتداء القناع (البروكسي) لتجاوز الحظر
            connectTimeout: 120000
        });

        // تحميل مكتبة الذكاء الاصطناعي للمسارات
        bot.loadPlugin(pathfinder);

        bot.on('spawn', () => {
            console.log(`✅ [REAL] تم اختراق الحظر! البوت داخل السيرفر الآن بنجاح.`);
            
            // تحديد نقطة الصفر (السبون)
            if (!spawnPos) spawnPos = bot.entity.position.clone();
            
            const movements = new Movements(bot);
            bot.pathfinder.setMovements(movements);
            mainLoop();
        });

        async function mainLoop() {
            while (bot && bot.entity) {
                try {
                    // البحث عن أي صندوق قريب (مسافة 4 بلكات)
                    const chestBlock = bot.findBlock({
                        matching: (block) => ['chest', 'trapped_chest', 'barrel'].includes(block.name),
                        maxDistance: 4
                    });

                    if (chestBlock) {
                        console.log("📦 [REAL] وجد صندوقاً! جاري فتحه...");
                        await bot.pathfinder.goto(new goals.GoalBlock(chestBlock.position.x, chestBlock.position.y, chestBlock.position.z));
                        const chest = await bot.openChest(chestBlock);
                        await new Promise(r => setTimeout(r, 3000)); // ترك الصندوق مفتوحاً لـ 3 ثوانٍ
                        chest.close();
                        console.log("✅ تم فحص الصندوق.");
                    } else {
                        // التحرك العشوائي حول منطقة السبون بحد أقصى 10 بلكات
                        const rx = Math.floor(Math.random() * 21) - 10;
                        const rz = Math.floor(Math.random() * 21) - 10;
                        const targetPos = spawnPos.offset(rx, 0, rz);

                        console.log(`🏃 [REAL] يتجول الآن...`);
                        await bot.pathfinder.goto(new goals.GoalNear(targetPos.x, targetPos.y, targetPos.z, 1));
                    }
                } catch (err) {
                    // تجاهل الأعطال البسيطة في حساب المسار ليكمل المشي
                }
                // انتظار 5 ثوانٍ قبل الحركة التالية
                await new Promise(r => setTimeout(r, 5000));
            }
        }

        bot.on('error', (err) => {
            console.log('⚠️ خطأ اتصال (غالباً البروكسي المجاني ضعيف أو رُفض):', err.message);
        });
        
        bot.on('end', () => {
            console.log('🔄 انفصل [REAL]... سأبحث عن بروكسي جديد وأحاول التسلل مجدداً بعد 15 ثانية.');
            setTimeout(createBot, 15000);
        });

    } catch (error) {
        console.log('⚠️ فشل في جلب البروكسي، سأحاول مجدداً بعد 15 ثانية:', error);
        setTimeout(createBot, 15000);
    }
}

// بدء تشغيل النظام
createBot();
