const bedrock = require('bedrock-protocol');
const { SocksClient } = require('socks');
const http = require('http');

// إعداد البروكسي مباشرة في الكود (تم اختيار بروكسي SOCKS5 شغال)
const proxyOptions = {
    proxy: {
        host: '185.162.230.122', 
        port: 1080,              
        type: 5                  
    },
    command: 'connect',
    destination: {
        host: 'REA1CRAFT.aternos.me',
        port: 48581
    }
};

// خادم الويب الأساسي لمنصة Render باش ما تطفاش الخدمة
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is Active and Connected via Proxy!\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[System] Web server is running on port ${PORT}`);
});

function startBot() {
    console.log('[Bot] جاري محاولة الاتصال بالسيرفر عبر البروكسي...');

    SocksClient.createConnection(proxyOptions, (err, info) => {
        if (err) {
            console.log('[Error] فشل الاتصال بالبروكسي:', err.message);
            reconnect();
            return;
        }

        console.log('[Proxy] تم الاتصال بالبروكسي بنجاح! جاري الدخول للسيرفر...');

        const bot = bedrock.createClient({
            host: 'REA1CRAFT.aternos.me',
            port: 48581,
            username: 'BuilderBot',
            offline: true,
            skipPing: true,
            socket: info.socket 
        });

        bot.on('join', () => {
            console.log('[Bot] دخلت للسيرفر بنجاح عبر البروكسي!');
        });

        bot.on('spawn', () => {
            console.log('[Bot] البوت ترسبن في العالم راهو لداخل!');
        });

        bot.on('disconnect', (packet) => {
            console.log('[Bot] البوت خرج من السيرفر، السبب:', packet);
            reconnect();
        });

        bot.on('error', (err) => {
            console.log('[Error] خطأ في البوت:', err.message || err);
            reconnect();
        });
    });
}

function reconnect() {
    console.log('[Bot] إعادة المحاولة والاتصال بعد 10 ثواني...');
    setTimeout(startBot, 10000);
}

// تشغيل البوت
startBot();
