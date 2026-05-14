const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const http = require('http');

// إنشاء سيرفر الويب لضمان بقاء البوت حياً (Uptime)
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Bot REAL is Online and Exploring');
}).listen(10000);

const botOptions = {
    host: 'xREA1_CRAFT.aternos.me',
    port: 64603,
    username: 'REAL', // تغيير الاسم إلى REAL بحروف كبيرة كما طلبت
    version: false,   // تحديد الإصدار تلقائياً من قبل البوت
    connectTimeout: 120000
};

let bot;
let spawnPos = null;

function createBot() {
    console.log("📡 [REAL] جاري محاولة الدخول واكتشاف الإصدار تلقائياً...");
    
    if (bot) bot.removeAllListeners();
    bot = mineflayer.createBot(botOptions);

    // تحميل إضافات الحركة والمسارات
    bot.loadPlugin(pathfinder);

    bot.on('spawn', () => {
        console.log(`✅ [REAL] دخل السيرفر! الإصدار المكتشف: ${bot.version}`);
        
        // تثبيت نقطة السبون عند أول دخول للتحرك حولها
        if (!spawnPos) spawnPos = bot.entity.position.clone();

        const movements = new Movements(bot);
        bot.pathfinder.setMovements(movements);
        
        // بدء الحلقة الرئيسية للمشي وفتح الصناديق
        mainLoop();
    });

    async function mainLoop() {
        while (bot && bot.entity) {
            try {
                // 1. البحث عن صندوق قريب لفتحه
                const chestBlock = bot.findBlock({
                    matching: (block) => ['chest', 'trapped_chest', 'barrel'].includes(block.name),
                    maxDistance: 4
                });

                if (chestBlock) {
                    console.log("📦 وجد [REAL] صندوقاً! جاري التوجه لفتحه...");
                    await bot.pathfinder.goto(new goals.GoalBlock(chestBlock.position.x, chestBlock.position.y, chestBlock.position.z));
                    const chest = await bot.openChest(chestBlock);
                    await new Promise(r => setTimeout(r, 3000)); // يبقى الصندوق مفتوحاً لـ 3 ثوانٍ
                    chest.close();
                    console.log("✅ تم فحص الصندوق بنجاح.");
                } else {
                    // 2. التحرك عشوائياً ضمن نطاق 10 بلكات من نقطة البداية
                    const rx = Math.floor(Math.random() * 21) - 10;
                    const rz = Math.floor(Math.random() * 21) - 10;
                    const targetPos = spawnPos.offset(rx, 0, rz);

                    console.log(`🏃 تجول عشوائي ضمن 10 بلكات إلى: ${Math.round(targetPos.x)}, ${Math.round(targetPos.z)}`);
                    await bot.pathfinder.goto(new goals.GoalNear(targetPos.x, targetPos.y, targetPos.z, 1));
                }
            } catch (err) {
                // تجاهل أخطاء الطريق البسيطة
            }
            // انتظار 5 ثوانٍ قبل المهمة التالية
            await new Promise(r => setTimeout(r, 5000));
        }
    }

    bot.on('error', (err) => console.log('⚠️ خطأ اتصال:', err.message));
    
    bot.on('end', () => {
        console.log('🔄 انفصل [REAL]، سيتم إعادة المحاولة بعد 20 ثانية...');
        setTimeout(createBot, 20000);
    });
}

createBot();
