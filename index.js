const mineflayer = require('mineflayer');
const http = require('http');

// تشغيل سيرفر الويب فوراً لإبقاء الخدمة خضراء
http.createServer((req, res) => { res.end('xRM Bot is Running'); }).listen(10000);

// بيانات السيرفر كما أكدت لي
const botOptions = {
    host: 'xREA1_CRAFT.aternos.me',
    port: 64603,
    username: 'RMx',
    version: false, // جرب وضع هذا الإصدار يدوياً لتجنب عملية الفحص (Ping) التي تفشل
    hideErrors: true   // إخفاء الأخطاء غير الضرورية لتقليل استهلاك الرام
};

let bot;

function createBot() {
    console.log(`🚀 محاولة دخول مباشرة لـ ${botOptions.host}...`);
    
    // تنظيف أي محاولة سابقة
    if (bot) bot.removeAllListeners();

    bot = mineflayer.createBot(botOptions);

    bot.on('spawn', () => {
        console.log("✅ أخيراً! البوت دخل السيرفر الآن.");
        // حركة بسيطة للبقاء نشطاً
        setInterval(() => {
            if (bot.entity) bot.setControlState('jump', true);
            setTimeout(() => { if (bot.entity) bot.setControlState('jump', false); }, 500);
        }, 15000);
    });

    bot.on('error', (err) => {
        console.log('⚠️ لم يستجب السيرفر، سأحاول مجدداً تلقائياً...');
    });

    bot.on('end', () => {
        setTimeout(createBot, 10000); // إعادة محاولة كل 10 ثوانٍ
    });
}

createBot();
