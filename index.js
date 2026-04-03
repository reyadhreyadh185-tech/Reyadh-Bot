const mineflayer = require('mineflayer');
const http = require('http');

// 1. خادم الويب والنبض الذاتي (لإبقاء Render مستيقظاً)
http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('RM Guard is patrolling the stadium!');
    res.end();
}).listen(3000, () => console.log('🌐 Web Server & Pulse System Active!'));

setInterval(() => {
    http.get('https://reyadh-bot-4.onrender.com').on('error', (err) => {
        console.log('⚠️ Pulse skip');
    });
}, 4 * 60 * 1000); 

// 2. إعدادات الاتصال
const botArgs = {
    host: 'REA1_CRAFT.aternos.me',
    port: 18542, 
    username: 'RM_GUARD_VVIP',
    version: '1.21.11'
};

const initBot = () => {
    const bot = mineflayer.createBot(botArgs);

    // متغيرات الحركة
    let spawnPoint = null;
    let angle = 0;

    bot.on('spawn', () => {
        console.log('✅ RM_GUARD_VVIP has landed at the stadium!');
        
        // حفظ "مسقط الرأس" فور الرسبنة
        spawnPoint = bot.entity.position.clone();
        
        // حلقة الحركة (كل ثانية)
        setInterval(() => {
            if (!bot.entity || !spawnPoint) return;

            // حساب النقطة التالية في الدائرة (قطر 8 لضمان البقاء داخل الـ 10)
            const radius = 8; 
            const x = spawnPoint.x + Math.cos(angle) * radius;
            const z = spawnPoint.z + Math.sin(angle) * radius;

            // النظر إلى النقطة المستهدفة والمشي نحوها
            const target = bot.entity.position.offset(Math.cos(angle), 0, Math.sin(angle));
            bot.lookAt(target);
            bot.setControlState('forward', true);

            // القفز العشوائي لزيادة التفاعل
            if (Math.random() > 0.8) {
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 400);
            }

            angle += 0.4; // سرعة الدوران
        }, 1000);
    });

    bot.on('error', (err) => console.log('❌ Error: ', err.message));
    bot.on('end', () => {
        console.log('🔄 Server closed. Reconnecting in 10s...');
        setTimeout(initBot, 10000);
    });
};

initBot();

// حماية ضد الانهيار
process.on('uncaughtException', (err) => console.log('🛡️ Crash Shield: ', err.message));
process.on('unhandledRejection', (err) => console.log('🛡️ Rejection Shield: ', err.message));
