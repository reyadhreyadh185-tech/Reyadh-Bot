const bedrock = require('bedrock-protocol');
const http = require('http');

const ATERNOS_HOST = 'REA1CRAFT.aternos.me';
const ATERNOS_PORT = 48581;
// الإصدار المتوافق تماماً لتخطي مشاكل فحص النسخة
const MINECRAFT_VERSION = '1.26.20'; 

// خادم ويب أساسي باش منصة Render ما تطفيش السيرفر تاعك
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Direct Minecraft Bot is Running!\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[System] Web server is running on port ${PORT}`);
});

// دالة تشغيل البوت مباشرة
function startBot() {
    console.log('[System] جاري محاولة الاتصال المباشر بالسيرفر (بدون بروكسي)...');

    try {
        const bot = bedrock.createClient({
            host: ATERNOS_HOST,
            port: ATERNOS_PORT,
            username: 'BuilderBot',
            offline: true,     // ضروري لأن السيرفر مكرك (أترنوس)
            skipPing: true,    // يتخطى فحص البينغ للاتصال المباشر والسريع
            version: MINECRAFT_VERSION
        });

        bot.on('join', () => {
            console.log('[Bot] دخلت للسيرفر بنجاح والآن أنا متصل!');
        });

        bot.on('spawn', () => {
            console.log('[Bot] البوت ترسبن في العالم راهو لداخل!');
        });

        bot.on('disconnect', (packet) => {
            console.log('[Bot] البوت انفصل عن السيرفر، السبب:', packet);
            console.log('[System] إعادة الاتصال بعد 10 ثواني...');
            setTimeout(startBot, 10000);
        });

        bot.on('error', (err) => {
            console.log('[Error] خطأ في البوت:', err.message || err);
            console.log('[System] إعادة الاتصال بعد 10 ثواني...');
            setTimeout(startBot, 10000);
        });

    } catch (err) {
        console.log('[Error] فشل في تشغيل البوت:', err.message || err);
    }
}

// إطلاق البوت
startBot();
