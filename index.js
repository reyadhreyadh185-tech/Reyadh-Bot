const mineflayer = require('mineflayer');

// إعدادات البوت
const botArgs = {
    host: 'ip_السيرفر_هنا', // استبدله بـ IP سيرفرك
    port: 25565,             // استبدله بالبورت الخاص بك
    username: 'xRM',         // الاسم المطلوب: x صغير والحروف الباقية كبيرة
    version: false           // 'false' تجعل البوت يحاول معرفة الإصدار تلقائياً من السيرفر
};

let bot;

function createBot() {
    bot = mineflayer.createBot(botArgs);

    // عند دخول البوت للسيرفر
    bot.on('spawn', () => {
        console.log(`✅ البوت دخل باسم: ${bot.username}`);
        console.log(`🎮 الإصدار الحالي: ${bot.version}`);
        
        startMoving(); // بدء نظام الحركة
        startRandomJumping(); // بدء القفز العشوائي
    });

    // نظام الحركة: المشي في كل الاتجاهات
    async function startMoving() {
        const directions = ['forward', 'back', 'left', 'right'];
        
        while (true) {
            for (let dir of directions) {
                bot.setControlState(dir, true); // ابدأ المشي
                // ننتظر حوالي 2 ثانية (تقريباً 10 بلوكات حسب سرعة المشي العادية)
                await bot.waitForTicks(40); 
                bot.setControlState(dir, false); // توقف
                
                await bot.waitForTicks(10); // استراحة قصيرة بين الاتجاهات
            }
        }
    }

    // نظام القفز العشوائي جداً
    async function startRandomJumping() {
        while (true) {
            bot.setControlState('jump', true);
            bot.setControlState('jump', false);
            
            // وقت عشوائي بين قفزة وأخرى (من ثانية إلى 10 ثوانٍ)
            const randomWait = Math.floor(Math.random() * 10000) + 1000;
            await new Promise(res => setTimeout(res, randomWait));
        }
    }

    // التعامل مع الأخطاء وإعادة الاتصال
    bot.on('error', (err) => console.log('❌ خطأ:', err));
    bot.on('end', () => {
        console.log('⚠️ انفصل الاتصال، سأحاول العودة بعد 5 ثوانٍ...');
        setTimeout(createBot, 5000);
    });
}

createBot();
