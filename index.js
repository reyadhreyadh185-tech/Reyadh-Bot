const bedrock = require('bedrock-protocol');
const { SocksClient } = require('socks');
const http = require('http');
const https = require('https'); // مكتبة مدمجة لجلب البروكسيات

const ATERNOS_HOST = 'REA1CRAFT.aternos.me';
const ATERNOS_PORT = 48581;

// 1. خادم الويب الأساسي لمنصة Render
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Auto-Proxy Minecraft Bot is Active!\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[System] Web server is running on port ${PORT}`);
});

// 2. دالة جلب البروكسيات تلقائياً من API مجاني
function fetchProxies() {
    return new Promise((resolve, reject) => {
        console.log('[System] جاري جلب قائمة البروكسيات تلقائياً...');
        const url = 'https://api.proxyscrape.com/v2/?request=getproxies&protocol=socks5&timeout=5000&country=all&ssl=all&anonymity=all';
        
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const lines = data.split('\n').map(line => line.trim()).filter(line => line.includes(':'));
                if (lines.length === 0) {
                    reject(new Error('قائمة البروكسيات المستلمة فارغة.'));
                } else {
                    resolve(lines);
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// 3. دالة تشغيل البوت وتجربة البروكسيات
async function startBot() {
    let proxies = [];
    try {
        proxies = await fetchProxies();
        console.log(`[System] تم جلب ${proxies.length} بروكسي بنجاح. جاري الفحص والتجربة...`);
    } catch (err) {
        console.log('[Error] فشل في جلب قائمة البروكسيات:', err.message);
        console.log('[System] إعادة المحاولة بعد 10 ثواني...');
        setTimeout(startBot, 10000);
        return;
    }

    // تجربة البروكسيات واحد تلو الآخر حتى ينجح أحدها
    for (let i = 0; i < proxies.length; i++) {
        const [ip, portStr] = proxies[i].split(':');
        const port = parseInt(portStr, 10);
        
        console.log(`[Proxy] تجربة البروكسي رقم [${i + 1}/${proxies.length}] -> ${ip}:${port}`);

        const proxyOptions = {
            proxy: {
                host: ip,
                port: port,
                type: 5 // SOCKS5
            },
            command: 'connect',
            destination: {
                host: ATERNOS_HOST,
                port: ATERNOS_PORT
            },
            timeout: 5000 // 5 ثواني كحد أقصى لتجربة البروكسي عشان ما نعطلوش العملية
        };

        try {
            const info = await new Promise((resolve, reject) => {
                SocksClient.createConnection(proxyOptions, (err, info) => {
                    if (err) reject(err);
                    else resolve(info);
                });
            });

            // إذا وصلنا هنا، يعني البروكسي شغال وقبل الاتصال
            console.log(`[Proxy] نجح الاتصال بالبروكسي ${ip}:${port}! جاري إدخال البوت للسيرفر...`);
            
            const bot = bedrock.createClient({
                host: ATERNOS_HOST,
                port: ATERNOS_PORT,
                username: 'BuilderBot',
                offline: true,
                skipPing: true,
                socket: info.socket // تمرير الاتصال المحمي بالبروكسي
            });

            bot.on('join', () => {
                console.log('[Bot] دخلت للسيرفر بنجاح عبر البروكسي الآلي!');
            });

            bot.on('spawn', () => {
                console.log('[Bot] البوت ترسبن في العالم راهو لداخل!');
            });

            bot.on('disconnect', (packet) => {
                console.log('[Bot] البوت انفصل عن السيرفر، السبب:', packet);
                console.log('[System] جاري البحث عن بروكسي جديد للاتصال مجدداً...');
                startBot();
            });

            bot.on('error', (err) => {
                console.log('[Error] خطأ في البوت:', err.message || err);
                // في حالة حدث خطأ بعد الدخول، نبحث عن بروكسي آخر
                startBot();
            });

            return; // الخروج من الدالة لأن البوت اتصل بنجاح

        } catch (err) {
            console.log(`[Proxy] البروكسي ${ip}:${port} ميت أو بطيء جداً. جاري الانتقال للتالي...`);
        }
    }

    console.log('[System] انتهت القائمة ولم ينجح أي بروكسي. إعادة جلب قائمة جديدة بعد 10 ثواني...');
    setTimeout(startBot, 10000);
}

// انطلاق العملية
startBot();
