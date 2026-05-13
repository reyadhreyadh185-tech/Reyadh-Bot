const mineflayer = require('mineflayer');
const http = require('http');

// سيرفر الويب للبقاء حياً على بورت 10000 (ضروري لـ Render)
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('xRM Bot is Online and Running');
}).listen(10000);

const options = {
    host: 'xREA1_CRAFT.aternos.me', 
    port: 64603,                    
    username: 'xRM'
};

function startBot() {
    console.log("🔍 جاري فحص إصدار السيرفر...");

    // فحص السيرفر قبل الدخول لجلب الإصدار وضمان عدم حدوث Timeout
    mineflayer.ping(options, (err, status) => {
        if (err) {
            console.log("❌ السيرفر مغلق أو غير مستجيب، سأحاول مجدداً بعد 20 ثانية...");
            setTimeout(startBot, 20000);
            return;
        }

        const version = status.version.name;
        console.log(`✅ تم اكتشاف الإصدار: ${version}`);

        const bot = mineflayer.createBot({
            ...options,
            version: version // استخدام الإصدار الذي اكتشفه الـ Ping
        });

        bot.on('spawn', () => {
            console.log(`🚀 xRM دخل السيرفر بنجاح!`);
            handleMovement(bot);
        });

        bot.on('error', (err) => console.log('⚠️ خطأ:', err.message));
        
        bot.on('end', () => {
            console.log('⚠️ انفصل الاتصال، جاري إعادة المحاولة...');
            setTimeout(startBot, 10000);
        });
    });
}

async function handleMovement(bot) {
    const directions = ['forward', 'back', 'left', 'right'];
    while (bot && bot.entity) {
        // اختيار اتجاه عشوائي
        const dir = directions[Math.floor(Math.random() * directions.length)];
        
        bot.setControlState(dir, true);
        await new Promise(r => setTimeout(r, 2500)); // مشي لمسافة 10 بلوكات تقريباً
        bot.setControlState(dir, false);

        // قفز في أوقات عشوائية جداً
        if (Math.random() > 0.4) {
            bot.setControlState('jump', true);
            bot.setControlState('jump', false);
        }

        await new Promise(r => setTimeout(r, Math.random() * 8000 + 2000));
    }
}

startBot();
