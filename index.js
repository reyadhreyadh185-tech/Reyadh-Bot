const mineflayer = require('mineflayer');
const http = require('http');

// 1. خادم الويب (لإبقاء Render متصلاً)
http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('RM Guard is Unstoppable!');
    res.end();
}).listen(3000, () => console.log('🌐 Web Server is Running!'));

// 2. نظام النبض الذاتي (السلاح السري لمنع النوم)
// البوت سيزور رابطه بنفسه كل 4 دقائق لضمان عدم نوم Render
setInterval(() => {
    // ضع رابط مشروعك الناجح هنا
    http.get('https://reyadh-bot-4.onrender.com').on('error', (err) => {
        console.log('⚠️ Pulse error (Ignored)');
    });
}, 4 * 60 * 1000); 

// 3. إعدادات البوت والاتصال
const botArgs = {
    host: 'REA1_CRAFT.aternos.me',
    port: 18542, // تأكد أنه نفس البورت الموجود في أترنوس حالياً
    username: 'RM_GUARD_VVIP', // غيرنا الاسم لتجنب أي طرد سابق
    version: '1.21.1'
};

const initBot = () => {
    const bot = mineflayer.createBot(botArgs);

    bot.on('spawn', () => {
        console.log('✅ RM_GUARD_VVIP inside the stadium!');
        let angle = 0;
        const radius = 10;
        
        setInterval(() => {
            if (!bot.entity) return;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            bot.lookAt(bot.entity.position.offset(x, 0, z));
            bot.setControlState('forward', true);
            
            if (Math.random() > 0.7) {
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 500);
            }
            angle += 0.5;
        }, 1000);
    });

    bot.on('error', (err) => console.log('❌ Bot Error: ', err.message));
    bot.on('end', () => {
        console.log('🔄 Disconnected! Reconnecting in 10 seconds...');
        setTimeout(initBot, 10000);
    });
};

initBot();

// 4. نظام الحماية ضد الانهيار (لمنع توقف السكربت بالكامل)
process.on('uncaughtException', (err) => console.log('🛡️ Crash prevented: ', err.message));
process.on('unhandledRejection', (err) => console.log('🛡️ Rejection prevented: ', err.message));
