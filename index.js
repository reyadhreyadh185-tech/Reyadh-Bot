const bedrock = require('bedrock-protocol');
const http = require('http');

// 1. إعداد خادم ويب بسيط لمنصة Render
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is Online and Running!\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[System] Web server is listening on port ${PORT} for Render.`);
});

// 2. دالة تشغيل البوت مع ميزة إعادة الاتصال التلقائي
let bot;

function startBot() {
    console.log('[Bot] جاري محاولة تشغيل البوت والاتصال بالسيرفر...');

    bot = bedrock.createClient({
        host: 'REA1CRAFT.aternos.me',   // عنوان السيرفر تاعك
        port: 48581,                    // منفذ السيرفر تاعك
        username: 'BuilderBot',         // اسم البوت
        offline: true,                  // السيرفر مكرك
        skipPing: true                  // مهم جداً! تخطي الـ Ping لتفادي خطأ RakTimeout كلياً
    });

    // عند الاتصال بنجاح
    bot.on('join', () => {
        console.log('[Bot] البوت اتصل بالسيرفر بنجاح!');
    });

    // عند رسبنة البوت داخل العالم
    bot.on('spawn', () => {
        console.log('[Bot] البوت ترسبن في العالم راهو لداخل!');
    });

    // إذا انفصل البوت لأي سبب
    bot.on('disconnect', (packet) => {
        console.log('[Bot] البوت خرج من السيرفر، السبب:', packet);
        reconnect();
    });

    // إذا حدث خطأ في الاتصال
    bot.on('error', (err) => {
        console.log('[Error] حدث خطأ في البوت:', err.message || err);
        reconnect();
    });
}

// دالة إعادة الاتصال بعد 10 ثواني
let reconnectTimeout;
function reconnect() {
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    
    console.log('[Bot] سيعيد البوت المحاولة والاتصال بعد 10 ثواني...');
    reconnectTimeout = setTimeout(() => {
        startBot();
    }, 10000); // 10000 ملي ثانية = 10 ثواني
}

// تشغيل البوت لأول مرة
startBot();
