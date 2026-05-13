const mineflayer = require('mineflayer');
const http = require('http');

// سيرفر الويب - لضمان بقاء Uptime Robot أخضر 🟢
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('xRM Bot Status: Active');
}).listen(10000);

const connectionInfo = {
    host: 'xREA1_CRAFT.aternos.me',
    port: 64603, // تأكد من مطابقة هذا الرقم لما يظهر في صفحة أترنوس الآن!
    username: 'xRM',
    version: false,
    connectTimeout: 45000 // زيادة وقت الانتظار لـ 45 ثانية
};

let bot;

function createBot() {
    // إذا كان هناك محاولة قديمة معلقة، نقوم بإنهائها
    if (bot) {
        bot.quit();
        bot.removeAllListeners();
    }

    console.log(`🔍 محاولة اتصال جديدة بـ ${connectionInfo.host}:${connectionInfo.port}...`);
    
    bot = mineflayer.createBot(connectionInfo);

    bot.on('spawn', () => {
        console.log(`✅ دخل xRM بنجاح! السيرفر يعمل الآن.`);
        // منع الخروج بسبب الخمول
        setInterval(() => {
            if (bot.entity) {
                bot.setControlState('jump', true);
                bot.setControlState('jump', false);
            }
        }, 30000); 
    });

    // التعامل مع الأخطاء بدون توقف البرنامج
    bot.on('error', (err) => {
        console.log('⚠️ لم أستطع الاتصال بالسيرفر. تأكد أنه Online.');
    });

    bot.on('end', () => {
        console.log('🔄 محاولة إعادة الاتصال خلال 20 ثانية...');
        setTimeout(createBot, 20000);
    });
}

createBot();
