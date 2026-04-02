const mineflayer = require('mineflayer');

const botArgs = {
    host: 'REA1_CRAFT.aternos.me', // العنوان الأساسي
    port: 18542,                   // المنفذ (تأكد منه من صفحة Connect)
    username: 'RM_GUARD_02',       // اسم البوت
    version: '1.21.1'              // تأكد أنها نفس نسخة السيرفر
};

const initBot = () => {
    const bot = mineflayer.createBot(botArgs);

    // نظام منع الطرد (الحركة المستمرة)
    bot.on('spawn', () => {
        console.log('✅ RM_GUARD_02 دخل الملعب!');
        
        // البوت سيقفز كل 5 ثوانٍ ليوهم السيرفر أنه لاعب حقيقي
        setInterval(() => {
            bot.setControlState('jump', true);
            setTimeout(() => {
                bot.setControlState('jump', false);
            }, 500);
        }, 5000);
    });

    // إعادة الاتصال التلقائي في حال حدث خطأ
    bot.on('error', (err) => console.log('❌ خطأ في البوت: ', err));
    bot.on('end', () => {
        console.log('🔄 السيرفر أغلق أو البوت طُرد.. إعادة المحاولة بعد 10 ثوانٍ');
        setTimeout(initBot, 10000);
    });
};

initBot();

// كود بسيط لإبقاء خدمة Render تعمل (Web Server)
const http = require('http');
http.createServer((req, res) => {
    res.write('RM_GUARD_02 is Alive!');
    res.end();
}).listen(3000);
