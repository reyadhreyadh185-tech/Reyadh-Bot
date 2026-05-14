const mineflayer = require('mineflayer');
const http = require('http');

// 1. تشغيل سيرفر الويب فوراً لضمان اللون الأخضر (مستقل عن البوت)
http.createServer((req, res) => {
    res.end('RMx Status: Stealth Mode Active');
}).listen(10000, () => {
    console.log("🟢 أوبتايم روبوت أخضر.. سيرفر الويب يعمل!");
});

const botOptions = {
    host: 'xREA1_CRAFT.aternos.me',
    port: 64603,
    username: 'RMx',
    version: false, // سيكتشف الإصدار تلقائياً
    connectTimeout: 120000,
    keepAlive: true,
    hideErrors: false
};

let bot;

function createBot() {
    // توقيت عشوائي لإعادة المحاولة (بين 30 إلى 60 ثانية) لتضليل نظام الحماية
    const retryDelay = Math.floor(Math.random() * 30000) + 30000;
    
    console.log(`📡 [${new Date().toLocaleTimeString()}] محاولة "تسلل" جديدة لـ RMx...`);
    
    if (bot) bot.removeAllListeners();

    bot = mineflayer.createBot(botOptions);

    bot.once('inject_allowed', () => {
        console.log("🛠 تم اختراق الجدار الأولي.. جاري التعرف على الإصدار...");
    });

    bot.on('spawn', () => {
        console.log(`✅ دخل RMx بنجاح! الإصدار الذي اكتشفه البوت: ${bot.version}`);
        startHumanBehavior();
    });

    async function startHumanBehavior() {
        while (bot && bot.entity) {
            try {
                // محاكاة حركة الرأس البشرية
                await bot.look(Math.random() * 6.2, (Math.random() - 0.5) * 1.5);
                
                // قفزة عشوائية كل فترة
                if (Math.random() > 0.75) {
                    bot.setControlState('jump', true);
                    await new Promise(r => setTimeout(r, 400));
                    bot.setControlState('jump', false);
                }

                // انتظار طويل وغير منتظم (كأن اللاعب يتحدث أو يفتح القوائم)
                await new Promise(r => setTimeout(r, Math.random() * 20000 + 20000));
            } catch (e) { break; }
        }
    }

    bot.on('error', (err) => {
        if (err.code === 'ETIMEDOUT') {
            console.log("🚫 أترنوس يرفض الاتصال (IP Blocked). سأغير توقيت المحاولة...");
        } else {
            console.log(`⚠️ خطأ: ${err.message}`);
        }
    });

    bot.on('end', () => {
        console.log(`🔄 سأختفي لـ ${retryDelay/1000} ثانية ثم أحاول مجدداً...`);
        setTimeout(createBot, retryDelay);
    });
}

createBot();
