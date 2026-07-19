const bedrock = require('bedrock-protocol');
const http = require('http');

// الإعدادات نيشان من التصويرة تاعك
const ATERNOS_HOST = 'REA1CRAFT.aternos.me';
const ATERNOS_PORT = 48581;
const MINECRAFT_VERSION = '1.26.23.1'; 

// خادم ويب لإبقاء Render شغال
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running with random movements!\n');
});
server.listen(process.env.PORT || 3000, () => {
    console.log('[System] 🌐 Web server linked for Render successfully.');
});

let actionInterval;

function startBot() {
    console.log(`[System] 🔄 جاري محاولة إدخال البوت للإصدار ${MINECRAFT_VERSION} بدون حساب...`);

    try {
        const bot = bedrock.createClient({
            host: ATERNOS_HOST,
            port: ATERNOS_PORT,
            version: MINECRAFT_VERSION,
            username: 'BuilderBot',
            offline: true,        // الدخول عادي بلا حساب مايكروسوفت
            skipPing: true        // تخطي فحص السيرفر لتفادي الأخطاء السابقة
        });

        bot.on('join', () => {
            console.log('[Bot] ✅ دخلت للسيرفر بنجاح وبلا كونت ميكروسوفت!');
        });

        bot.on('spawn', () => {
            console.log('[Bot] 🚀 راني داخل الماب دروك! جاري بدء الحركات العشوائية...');
            startRandomActions(bot);
        });

        bot.on('disconnect', (packet) => {
            console.log('[Bot] ❌ البوت انفصل، السبب:', packet.reason || packet);
            clearInterval(actionInterval);
            console.log('[System] ⏱️ إعادة محاولة الاتصال بعد 15 ثانية...');
            setTimeout(startBot, 15000);
        });

        bot.on('error', (err) => {
            console.log('[Error] ⚠️ صرى خطأ:', err.message || err);
            clearInterval(actionInterval);
            console.log('[System] ⏱️ إعادة محاولة الاتصال بعد 15 ثانية...');
            setTimeout(startBot, 15000);
        });

    } catch (err) {
        console.log('[Error] 💥 فشل كلي في التشغيل:', err.message);
    }
}

// خوارزمية الحركات العشوائية وغير المنظمة
function startRandomActions(bot) {
    if (actionInterval) clearInterval(actionInterval);

    function loop() {
        if (!bot.queue) return; // تأكيد أن البوت مازال متصل

        // اختيار حركة عشوائية: 0 = تنقاز، 1 = تدوار، 2 = تبديل آيتم
        const randomAction = Math.floor(Math.random() * 3);
        
        // توليد وقت عشوائي تماماً بين 3 إلى 9 ثواني للحركة القادمة
        const nextTime = Math.floor(Math.random() * (9000 - 3000 + 1)) + 3000;

        if (randomAction === 0) {
            console.log('[Action] 🦘 البوت راه ينقز دروك...');
            bot.queue('player_auth_input', {
                flags: { jumping: true, want_jump: true },
                position: { x: 0, y: 0, z: 0 },
                move_vector: { x: 0, z: 0 }
            });
        } 
        else if (randomAction === 1) {
            const randomYaw = Math.random() * 360;
            console.log(`[Action] 🔄 البوت دار بزاوية عشوائية: ${randomYaw.toFixed(1)}°`);
            bot.queue('player_auth_input', {
                yaw: randomYaw,
                pitch: 0,
                position: { x: 0, y: 0, z: 0 },
                move_vector: { x: 0, z: 0 }
            });
        } 
        else if (randomAction === 2) {
            const randomSlot = Math.floor(Math.random() * 9);
            console.log(`[Action] 🎒 البوت بدل السلوت تاع اليد لخيار عشوائي: Slot ${randomSlot}`);
            bot.queue('mob_equipment', {
                runtime_entity_id: bot.entityId,
                item: { network_id: 0 },
                slot: randomSlot,
                selected_slot: randomSlot,
                window_id: 'inventory'
            });
        }

        // إعداد الحركة القادمة بوقت غير منتظم
        actionInterval = setTimeout(loop, nextTime);
    }

    // انطلاق الدورة العشوائية
    loop();
}

startBot();
