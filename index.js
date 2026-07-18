const bedrock = require('bedrock-protocol');
const http = require('http');

const ATERNOS_HOST = 'REA1CRAFT.aternos.me';
const ATERNOS_PORT = 48581;
const MINECRAFT_VERSION = '1.26.20'; 

// خادم ويب باش Render ما يطفيش البوت
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Minecraft Bot (Microsoft Auth) is Running!\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[System] Web server is running on port ${PORT}`);
});

function startBot() {
    console.log('[System] 🔥 جاري تشغيل البوت بحساب مايكروسوفت رسمي...');
    console.log('[System] ⚠️ عس اللوج مليح! راح يخرجلك رابط وكود باش تأكد الدخول...');

    try {
        const bot = bedrock.createClient({
            host: ATERNOS_HOST,
            port: ATERNOS_PORT,
            offline: false,       // هادي هي العفسة السحرية: تفرض على البوت يدخل بكونت رسمي
            version: MINECRAFT_VERSION,
            skipPing: true,       // لتخطي فحص البينغ
            profilesFolder: './auth_cache' // باش يخبي التسجيل وما يطلبوش منك كل مرة
        });

        bot.on('join', () => {
            console.log('[Bot] 👑 دخلت للسيرفر بنجاح بحساب مايكروسوفت! انخدع أترنوس!');
        });

        bot.on('spawn', () => {
            console.log('[Bot] راني في اللوبي الدائري الشباب اللي بنيتو يا رياض!');
        });

        bot.on('disconnect', (packet) => {
            console.log('[Bot] البوت انفصل عن السيرفر، السبب:', packet);
            console.log('[System] محاولة إعادة الاتصال بعد 10 ثواني...');
            setTimeout(startBot, 10000);
        });

        bot.on('error', (err) => {
            console.log('[Error] خطأ في البوت:', err.message || err);
            console.log('[System] محاولة إعادة الاتصال بعد 10 ثواني...');
            setTimeout(startBot, 10000);
        });

    } catch (err) {
        console.log('[Error] فشل في تشغيل البوت:', err.message || err);
    }
}

startBot();
