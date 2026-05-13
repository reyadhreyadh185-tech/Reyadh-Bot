const mineflayer = require('mineflayer');
const http = require('http');

// 1. تشغيل سيرفر الويب أولاً لضمان بقاء Uptime Robot و Render باللون الأخضر
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('xRM Bot is alive and well!');
});

server.listen(10000, () => {
    console.log("📡 سيرفر الويب نشط على بورت 10000 - أوبتايم روبوت سيبقى أخضر الآن");
});

// 2. إعدادات البوت مع ميزة اكتشاف الإصدار تلقائياً
const botOptions = {
    host: 'xREA1_CRAFT.aternos.me',
    port: 64603,
    username: 'xRM',
    version: false, // يكتشف الإصدار تلقائياً من السيرفر
    connectTimeout: 30000, // انتظار 30 ثانية للاتصال لتجنب الـ Timeout
};

let bot;

function createBot() {
    console.log("🔍 جاري محاولة دخول السيرفر واكتشاف الإصدار...");
    
    bot = mineflayer.createBot(botOptions);

    bot.on('spawn', () => {
        console.log(`✅ xRM دخل بنجاح! الإصدار: ${bot.version}`);
        startActions();
    });

    // تنفيذ الحركة والقفز
    async function startActions() {
        const dirs = ['forward', 'back', 'left', 'right'];
        while (bot && bot.entity) {
            let dir = dirs[Math.floor(Math.random() * dirs.length)];
            bot.setControlState(dir, true);
            await new Promise(r => setTimeout(r, 2000)); // مشي 10 بلوكات تقريباً
            bot.setControlState(dir, false);

            if (Math.random() > 0.5) {
                bot.setControlState('jump', true);
                bot.setControlState('jump', false);
            }
            await new Promise(r => setTimeout(r, 5000 + Math.random() * 5000));
        }
    }

    // منع خروج البوت (Crash) عند حدوث خطأ
    bot.on('error', (err) => {
        console.log('⚠️ مشكلة في الاتصال (ربما السيرفر مغلق):', err.message);
    });

    bot.on('end', () => {
        console.log('⚠️ انفصل البوت، سأحاول العودة خلال 15 ثانية...');
        setTimeout(createBot, 15000);
    });
}

// تشغيل البوت
createBot();

// منع العملية كاملة من التوقف في حال حدث خطأ غير متوقع
process.on('uncaughtException', (err) => {
    console.log('🔥 حدث خطأ غير متوقع لكن السيرفر سيبقى يعمل:', err.message);
});
