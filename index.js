const mineflayer = require('mineflayer');
const http = require('http');

// 1. تشغيل سيرفر الويب فوراً (لإصلاح لون أوبتايم روبوت الأحمر)
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('RMx Human-Simulation Active');
}).listen(10000, () => {
    console.log("🟢 أوبتايم روبوت سيعود أخضر الآن.. سيرفر الويب يعمل!");
});

const botOptions = {
    host: 'xREA1_CRAFT.aternos.me',
    port: 64603,
    username: 'RMx',
    version: "1.21.11", // الإصدار من صورتك الأخيرة
    connectTimeout: 90000
};

let bot;

function createBot() {
    console.log("🛠 جاري تشغيل نظام المحاكاة البشرية لـ RMx...");
    
    if (bot) bot.removeAllListeners();
    bot = mineflayer.createBot(botOptions);

    bot.on('spawn', () => {
        console.log("✅ RMx داخل السيرفر.. بدأ إرسال إشارات بشرية.");
        simulateHumanBehavior();
    });

    // وظيفة المحاكاة البشرية (تغيير النظر، القفز العشوائي، والانتظار غير المنتظم)
    async function simulateHumanBehavior() {
        while (bot && bot.entity) {
            try {
                // 1. تغيير زاوية النظر عشوائياً (كأن اللاعب ينظر حوله)
                const yaw = (Math.random() * Math.PI * 2);
                const pitch = ((Math.random() - 0.5) * Math.PI);
                await bot.look(yaw, pitch, false);

                // 2. قفزة بشرية (تأخير بسيط قبل وبعد القفزة)
                if (Math.random() > 0.6) {
                    bot.setControlState('jump', true);
                    await new Promise(r => setTimeout(r, Math.random() * 500 + 200));
                    bot.setControlState('jump', false);
                }

                // 3. إرسال إشارة "تسلل" (Crouch) سريعة
                if (Math.random() > 0.8) {
                    bot.setControlState('sneak', true);
                    await new Promise(r => setTimeout(r, 400));
                    bot.setControlState('sneak', false);
                }

                // أهم جزء: انتظار غير منتظم (بين 10 إلى 30 ثانية) لتضليل الحماية
                const waitTime = Math.random() * 20000 + 10000;
                await new Promise(r => setTimeout(r, waitTime));
                
            } catch (err) { break; }
        }
    }

    bot.on('error', (err) => {
        console.log('⚠️ فشل في إرسال الإشارات.. ربما السيرفر مغلق.');
    });

    bot.on('end', () => {
        console.log('🔄 إعادة المحاولة بنمط بشري جديد بعد 20 ثانية...');
        setTimeout(createBot, 20000);
    });
}

// بدء التشغيل
createBot();
