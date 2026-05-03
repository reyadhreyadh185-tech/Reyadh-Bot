const mineflayer = require('mineflayer');
const express = require('express');
const app = express();

// نظام استقبال نبضات UptimeRobot
app.get('/', (req, res) => {
    res.send('<h1>RM_ALGÉRIE IS ONLINE 🇩🇿👑</h1>');
});

app.listen(process.env.PORT || 3000, () => {
    console.log('--- نظام النبضات جاهز لـ UptimeRobot ---');
});

const botOptions = {
    host: 'xREA1_CRAFT.aternos.me', 
    port: 64603,                      
    username: 'RM_ALGÉRIE',
    version: '1.21.1' // نسخة الجافا المتوافقة مع Purpur 1.21.11
};

function startBot() {
    console.log(`--- جاري محاولة الدخول لآيبي: ${botOptions.host} ---`);
    
    const bot = mineflayer.createBot(botOptions);

    bot.on('spawn', () => {
        console.log('✅ تم الدخول بنجاح! بوت RM_ALGÉRIE يسيطر على المكان.');
        
        // نظام الحركات العشوائية (قفز، تسلل، دوران، تغيير خانات)
        setInterval(() => {
            if (!bot.entity) return;
            
            const rand = Math.random();
            if (rand < 0.25) {
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 500);
            } else if (rand < 0.50) {
                bot.setControlState('sneak', true);
                setTimeout(() => bot.setControlState('sneak', false), 1000);
            } else if (rand < 0.75) {
                bot.look(Math.random() * Math.PI * 2, (Math.random() - 0.5) * Math.PI);
            } else {
                const slot = Math.floor(Math.random() * 9);
                bot.setQuickBarSlot(slot);
            }
        }, 7000); // حركات عشوائية كل 7 ثوانٍ
    });

    // إعادة محاولة كل 10 ثوانٍ في حال الطرد أو الخطأ
    bot.on('error', (err) => console.log('❌ خطأ:', err.message));
    bot.on('end', () => {
        console.log('⚠️ انفصل الاتصال! سأعود بعد 10 ثوانٍ...');
        setTimeout(startBot, 10000);
    });
}

// حماية الكود من الانهيار (لضمان بقائه في ريندر)
process.on('uncaughtException', (err) => console.log('🛡️ منع الانهيار:', err.message));

startBot();
