// ... (الأجزاء العلوية من الكود تبقى كما هي)

function fetchFreeProxy() {
    return new Promise((resolve) => {
        // طلب بروكسيات من دول معينة غالباً ما تكون أسرع في الاتصال
        https.get('https://api.proxyscrape.com/v2/?request=displayproxies&protocol=socks5&timeout=2000&country=US,DE,FR&ssl=all&anonymity=all', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const proxies = data.split('\r\n').filter(p => p.includes(':'));
                // اختيار بروكسي عشوائي من القائمة المفلترة
                resolve(proxies.length > 0 ? `socks5://${proxies[Math.floor(Math.random() * proxies.length)]}` : null);
            });
        }).on('error', () => resolve(null));
    });
}

async function createBot() {
    if (isConnecting || (bot && bot.entity)) return;
    
    isConnecting = true;
    console.log("🧹 جاري محاولة اختراق جديدة ببروكسي سريع...");

    if (bot) {
        try {
            bot.end();
            bot.removeAllListeners();
        } catch (e) {}
    }

    const proxyUrl = await fetchFreeProxy();
    if (!proxyUrl) {
        isConnecting = false;
        return;
    }

    bot = mineflayer.createBot({
        host: 'xREA1_CRAFT.aternos.me',
        port: 64603,
        username: 'REAL',
        version: "1.21.1", // تحديد الإصدار يدوياً يسرع الدخول
        agent: new SocksProxyAgent(proxyUrl),
        connectTimeout: 120000 // رفع المهلة لـ دقيقتين كاملتين
    });

    // ... (بقية الكود)
