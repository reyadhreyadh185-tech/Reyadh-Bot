const mineflayer = require('mineflayer');

// إعدادات البوت بناءً على بيانات أترنوس الخاصة بك
const botArgs = {
    host: 'xREA1_CRAFT.aternos.me', // عنوان السيرفر من صورتك
    port: 64603,                    // البورت من صورتك
    username: 'xRM',                // الاسم المطلوب
    version: false                  // تحديد الإصدار تلقائياً
};

let bot;

function createBot() {
    bot = mineflayer.createBot(botArgs);

    bot.on('spawn', () => {
        console.log(`✅ xRM دخل السيرفر بنجاح!`);
        console.log(`🎮 الإصدار المكتشف: ${bot.version}`);
        
        startMoving(); 
        startRandomJumping(); 
    });

    // نظام الحركة (10 بلوكات تقريباً في كل اتجاه)
    async function startMoving() {
        const directions = ['forward', 'back', 'left', 'right'];
        while (true) {
            for (let dir of directions) {
                bot.setControlState(dir, true);
                await bot.waitForTicks(40); // 40 Ticks تساوي ثانيتين من المشي
                bot.setControlState(dir, false);
                await bot.waitForTicks(10); 
            }
        }
    }

    // نظام القفز العشوائي جداً
    async function startRandomJumping() {
        while (true) {
            bot.setControlState('jump', true);
            bot.setControlState('jump', false);
            
            // وقت انتظار عشوائي بين ثانية و 10 ثوانٍ
            const randomWait = Math.floor(Math.random() * 10000) + 1000;
            await new Promise(res => setTimeout(res, randomWait));
        }
    }

    bot.on('error', (err) => {
        console.log('❌ خطأ في الاتصال:', err.message);
    });

    bot.on('end', () => {
        console.log('⚠️ البوت فصل، سأحاول العودة بعد قليل...');
        setTimeout(createBot, 10000); // محاولة إعادة الاتصال كل 10 ثوانٍ
    });
}

createBot();
