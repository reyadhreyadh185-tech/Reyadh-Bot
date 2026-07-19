const bedrock = require('bedrock-protocol');
const http = require('http');

// إعدادات السيرفر تاعك نيشان
const ATERNOS_HOST = 'REA1CRAFT.aternos.me';
const ATERNOS_PORT = 48581;
const MINECRAFT_VERSION = '1.26.20'; 

// خادم ويب لإبقاء Render شغال
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running safely with Anti-Duplication!\n');
});
server.listen(process.env.PORT || 3000, () => {
    console.log('[System] 🌐 Web server linked for Render successfully.');
});

let actionInterval;
let botClient = null;
let reconnectTimeout = null;

function startBot() {
    // تنظيف التيماوتس القديمة لمنع التكرار تماماً
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    if (actionInterval) clearInterval(actionInterval);
    
    // إذا كان كاين كليانت قديم شغال نقفلوه قبل ما نفتحو جديد
    if (botClient) {
        try { botClient.close(); } catch(e) {}
        botClient = null;
    }

    console.log(`[System] 🔄 جاري محاولة الاتصال الآمن بالإصدار ${MINECRAFT_VERSION}...`);

    try {
        botClient = bedrock.createClient({
            host: ATERNOS_HOST,
            port: ATERNOS_PORT,
            version: MINECRAFT_VERSION,
            username: 'BuilderBot',
            offline: true,        
            skipPing: true        
        });

        botClient.on('join', () => {
            console.log('[Bot] ✅ دخلت للسيرفر بنجاح وبلا كونت!');
        });

        botClient.on('spawn', () => {
            console.log('[Bot] 🚀 راني داخل الماب! جاري بدء الحركات العشوائية...');
            startRandomActions(botClient);
        });

        // دالة موحدة ومعزولة لإعادة الاتصال لمنع ظهور BuilderBot(2)
        let hasDisconnected = false;
        const handleDisconnect = (reason) => {
            if (hasDisconnected) return; // إذا تم التعامل مع الفصل، نخرج
            hasDisconnected = true;
            
            console.log(`[Bot] ❌ انفصل البوت. السبب: ${reason}`);
            if (actionInterval) clearInterval(actionInterval);
            
            console.log('[System] ⏱️ إعادة المحاولة بعد 20 ثانية بنسخة واحدة ونظيفة...');
            reconnectTimeout = setTimeout(startBot, 20000);
        };

        botClient.on('disconnect', (packet) => {
            handleDisconnect(packet.reason || 'Server disconnected');
        });

        botClient.on('error', (err) => {
            handleDisconnect(err.message || 'Client error');
        });

    } catch (err) {
        console.log('[Error] 💥 فشل كلي في التشغيل:', err.message);
        reconnectTimeout = setTimeout(startBot, 20000);
    }
}

// حركات عشوائية متباعدة باش الحماية ما تعيقش بيه
function startRandomActions(bot) {
    if (actionInterval) clearInterval(actionInterval);

    function loop() {
        if (!bot || !bot.queue) return; 

        const randomAction = Math.floor(Math.random() * 3);
        // أوقات عشوائية متباعدة بين 6 إلى 12 ثانية لتفادي طرد الحماية
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
