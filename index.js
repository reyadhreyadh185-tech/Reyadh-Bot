const mineflayer = require('mineflayer');
const http = require('http');

// 1. إضافة سيرفر ويب بسيط لإرضاء منصة Render
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot xRM is running!\n');
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`📡 سيرفر الويب يعمل على بورت: ${PORT}`);
});

// 2. إعدادات بوت ماين كرافت
const botArgs = {
    host: 'xREA1_CRAFT.aternos.me', 
    port: 64603,                    
    username: 'xRM',                
    version: false                  
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
                if (!bot.entity) break;
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
            if (!bot.entity) break;
            bot.setControlState('jump', true);
            bot.setControlState('jump', false);
            
            // وقت انتظار عشوائي بين ثانية و 10 ثوانٍ لتمويه نظام الحماية
            const randomWait = Math.floor(Math.random() * 10000) + 1000;
            await new Promise(res => setTimeout(res, randomWait));
        }
    }

    bot.on('error', (err) => {
        console.log('❌ خطأ في الاتصال:', err.message);
    });

    bot.on('end', () => {
        console.log('⚠️ البوت فصل، سأحاول العودة بعد 10 ثوانٍ...');
        setTimeout(createBot, 10000);
    });
}

createBot();
