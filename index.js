const mineflayer = require('mineflayer');
const http = require('http');

// سيرفر الويب - لبقاء Uptime Robot باللون الأخضر
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('RMx Bot is Online');
}).listen(10000);

const options = {
    host: 'xREA1_CRAFT.aternos.me',
    port: 64603,
    username: 'RMx', // الاسم الجديد كما طلبت
    version: "1.21.1", // تحديد يدوي لتقليل وقت "الفحص" الذي يسبب التايم أوت
    connectTimeout: 60000, // زيادة وقت الانتظار لدقيقة كاملة
    checkTimeoutInterval: 60000
};

let bot;

function createBot() {
    console.log(`📡 جاري محاولة إدخال البوت ${options.username}...`);
    
    if (bot) bot.removeAllListeners();

    bot = mineflayer.createBot(options);

    bot.on('spawn', () => {
        console.log(`✅ [${options.username}] دخل السيرفر الآن!`);
        startRandomMovement();
    });

    async function startRandomMovement() {
        const dirs = ['forward', 'back', 'left', 'right'];
        while (bot && bot.entity) {
            let dir = dirs[Math.floor(Math.random() * dirs.length)];
            bot.setControlState(dir, true);
            await new Promise(r => setTimeout(r, 2000));
            bot.setControlState(dir, false);
            
            // قفزة عشوائية
            bot.setControlState('jump', true);
            bot.setControlState('jump', false);
            
            await new Promise(r => setTimeout(r, 10000));
        }
    }

    bot.on('error', (err) => {
        console.log('⚠️ خطأ في الاتصال: السيرفر قد يكون محمي أو مغلق.');
    });

    bot.on('end', () => {
        console.log('🔄 إعادة محاولة الدخول بعد 15 ثانية...');
        setTimeout(createBot, 15000);
    });
}

createBot();
