const bedrock = require('bedrock-protocol');
const http = require('http');

// إعدادات السيرفر
const ATERNOS_HOST = 'REA1CRAFT.aternos.me';
const ATERNOS_PORT = 48581;
const MINECRAFT_VERSION = '1.26.20';
const BOT_USERNAME = 'REA1_BOT'; // الاسم الجديد لمنع أي تصادم مع الكونتات القديمة

// خادم ويب لإبقاء الخدمة شغالة في Render
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('REA1_BOT is active and running!\n');
});

server.listen(process.env.PORT || 3000, () => {
    console.log('[System] 🌐 Web server linked for Render successfully.');
});

let actionInterval = null;
let botClient = null;
let reconnectTimeout = null;

function startBot() {
    // تنظيف المحاولات والتايمرات القديمة لضمان عدم وجود أكثر من نسخة
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    if (actionInterval) clearInterval(actionInterval);
    
    if (botClient) {
        try {
            botClient.close();
        } catch (e) {}
        botClient = null;
    }

    console.log(`[System] 🔄 جاري تشغيل البوت باسم (${BOT_USERNAME}) للاتصال بالسيرفر...`);

    try {
        botClient = bedrock.createClient({
            host: ATERNOS_HOST,
            port: ATERNOS_PORT,
            version: MINECRAFT_VERSION,
            username: BOT_USERNAME,
            offline: true,        // دخول أوفلاين
            skipPing: true        // تخطي الفحص لتفادي الأخطاء
        });

        botClient.on('join', () => {
            console.log(`[Bot] ✅ دخل البوت (${BOT_USERNAME}) للسيرفر بنجاح!`);
        });

        botClient.on('spawn', () => {
            console.log('[Bot] 🚀 راني داخل الماب دروك! جاري بدء الحركات العشوائية...');
            startRandomActions(botClient);
        });

        let hasDisconnected = false;
        const handleDisconnect = (reason) => {
            if (hasDisconnected) return;
            hasDisconnected = true;
            
            console.log(`[Bot] ❌ انفصل البوت. السبب: ${reason}`);
            if (actionInterval) clearInterval(actionInterval);
            
            console.log('[System] ⏱️ إعادة الاتصال بعد 20 ثانية بنسخة جديدة ونظيفة...');
            reconnectTimeout = setTimeout(startBot, 20000);
        };

        botClient.on('disconnect', (packet) => {
            handleDisconnect(packet.reason || 'Server disconnected');
        });

        botClient.on('error', (err) => {
            handleDisconnect(err.message || 'Client error');
        });

    } catch (err) {
        console.log('[Error] 💥 فشل في التشغيل:', err.message);
        reconnectTimeout = setTimeout(startBot, 20000);
    }
}

// حركات عشوائية غير منتظمة تفادياً للـ AFK وطرد الحماية
function startRandomActions(bot) {
    if (actionInterval) clearInterval(actionInterval);

    function loop() {
        if (!bot || !bot.queue) return; 

        const randomAction = Math.floor(Math.random() * 3);
        // توقيت عشوائي تماماً بين 6 إلى 12 ثانية
        const nextTime = Math.floor(Math.random() * (12000 - 6000 + 1)) + 6000;

        if (randomAction === 0) {
            console.log('[Action] 🦘 تنقاز عشوائي...');
            bot.queue('player_auth_input', {
                flags: { jumping: true, want_jump: true },
                position: { x: 0, y: 0, z: 0 },
                move_vector: { x: 0, z: 0 }
            });
        } 
        else if (randomAction === 1) {
            const randomYaw = Math.random() * 360;
            console.log(`[Action] 🔄 تدوار عشوائي بزاوية: ${randomYaw.toFixed(1)}°`);
            bot.queue('player_auth_input', {
                yaw: randomYaw,
                pitch: 0,
                position: { x: 0, y: 0, z: 0 },
                move_vector: { x: 0, z: 0 }
            });
        } 
        else if (randomAction === 2) {
            const randomSlot = Math.floor(Math.random() * 9);
            console.log(`[Action] 🎒 تبديل سلوت اليد: Slot ${randomSlot}`);
            bot.queue('mob_equipment', {
                runtime_entity_id: bot.entityId,
                item: { network_id: 0 },
                slot: randomSlot,
                selected_slot: randomSlot,
                window_id: 'inventory'
            });
        }

        actionInterval = setTimeout(loop, nextTime);
    }

    loop();
}

startBot();
