const mineflayer = require('mineflayer');

const botArgs = {
    host: 'REA1_CRAFT.aternos.me',
    port: 18542,
    username: 'ALG_BOT',
    version: '1.21.11' // مطابق لإصدار السيرفر في الصورة
};

const initBot = () => {
    const bot = mineflayer.createBot(botArgs);

    bot.on('spawn', () => {
        console.log('✅ RM_GUARD_02 inside and moving!');
        
        let angle = 0;
        const radius = 10; // قطر الحركة 10 بلوكات

        // حلقة الحركة المستمرة (مشي دائري + قفز)
        setInterval(() => {
            // حساب الإحداثيات الجديدة للحركة الدائرية
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            // أمر النظر والتحرك للنقطة التالية
            bot.lookAt(bot.entity.position.offset(x, 0, z));
            bot.setControlState('forward', true);
            
            // قفزة عشوائية لزيادة التفاعل
            if (Math.random() > 0.7) {
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 500);
            }

            angle += 0.5; // سرعة الدوران
        }, 1000);
    });

    // إعادة تشغيل تلقائي عند أي خلل
    bot.on('error', (err) => console.log('❌ Error: ', err));
    bot.on('end', () => {
        console.log('🔄 Reconnecting in 10s...');
        setTimeout(initBot, 10000);
    });
};

initBot();

// Web Server لإبقاء Render حياً
const http = require('http');
http.createServer((req, res) => {
    res.write('RM Guard is Walking & Jumping!');
    res.end();
}).listen(3000);
