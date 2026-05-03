const mineflayer = require('mineflayer');
const express = require('express');
const app = express();

// نظام نبضات القلب لـ UptimeRobot و Render
app.get('/', (req, res) => {
    res.send('<h1>RM_ALGÉRIE Java Bot is Online! 🇩🇿👑</h1>');
});

app.listen(process.env.PORT || 3000);

const botArgs = {
    host: 'xREA1_CRAFT.aternos.me', 
    port: 64603,                      
    username: 'RM_ALGÉRIE',
    version: '1.21.1' // متوافق مع نسخة 1.21.11 في Purpur
};

function initBot() {
    console.log('--- جاري محاولة الدخول لنظام الجافا (Purpur)... ---');
    
    const bot = mineflayer.createBot(botArgs);

    bot.on('spawn', () => {
        console.log('✅ تم الدخول! بوت الجافا RM_ALGÉRIE نشط الآن.');
        
        // نظام حركات عشوائية متطور (تسلل، قفز، دوران)
        setInterval(() => {
            const actions = ['jump', 'sneak', 'look'];
            const randomAction = actions[Math.floor(Math.random() * actions.length)];

            if (randomAction === 'jump') {
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 500);
            } else if (randomAction === 'sneak') {
                bot.setControlState('sneak', true);
                setTimeout(() => bot.setControlState('sneak', false), 1000);
            } else {
                bot.look(Math.random() * Math.PI * 2, (Math.random() - 0.5) * Math.PI);
            }
        }, 8000);
    });

    // إعادة المحاولة التلقائية كل 10 ثوانٍ عند الطرد أو الخطأ
    bot.on('error', (err) => console.log('خطأ:', err.message));
    bot.on('end', () => {
        console.log('⚠️ انفصل الاتصال، سأعود بعد 10 ثوانٍ...');
        setTimeout(initBot, 10000);
    });
}

// حماية الكود من الانهيار (Status 1)
process.on('uncaughtException', (err) => console.log('خطأ تم اعتراضه:', err.message));

initBot();
