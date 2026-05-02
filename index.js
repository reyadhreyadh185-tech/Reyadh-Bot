const bedrock = require('bedrock-protocol');
const http = require('http');

// خادم ويب بسيط لإبقاء البوت مستيقظاً في Render
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('RM Bot is Active 24/7 ⚪👑');
}).listen(process.env.PORT || 3000);

// التوقيتات التي طلبتها (بالملي ثانية)
const jumpTimes = [3000, 5000, 4000, 2000, 6000, 9000];
const weaponTimes = [3000, 4000, 9000, 5000];

function startBot() {
    const client = bedrock.createClient({
        host: 'REAL__CRAFT.aternos.me // العنوان من صورتك
        port: 47495,                      // المنفذ من صورتك
        username: 'RM_Bot',
        offline: true,                   // للدخول بدون حساب إكس بوكس
        version: '1.21.131'              // الإصدار من صورتك
    });

    client.on('join', () => {
        console.log('تم دخول البوت بنجاح! التكتيك مفعل.');

        // --- نظام القفز المتغير ---
        let jIdx = 0;
        function jump() {
            client.write('player_action', {
                entity_id: client.entityId,
                action: 'jump',
                block_position: { x: 0, y: 0, z: 0 },
                result_position: { x: 0, y: 0, z: 0 },
                face: 0
            });
            setTimeout(jump, jumpTimes[jIdx]);
            jIdx = (jIdx + 1) % jumpTimes.length;
        }
        jump();

        // --- نظام تغيير السلاح المتغير ---
        let wIdx = 0;
        let slot = 0;
        function swap() {
            slot = (slot + 1) % 9;
            client.write('mob_equipment', {
                runtime_entity_id: client.entityId,
                item: { network_id: 0 },
                inventory_slot: slot,
                hotbar_slot: slot,
                window_id: 0
            });
            setTimeout(swap, weaponTimes[wIdx]);
            wIdx = (wIdx + 1) % weaponTimes.length;
        }
        swap();
    });

    // إعادة اتصال تلقائي في حال حدوث خطأ أو طرد
    client.on('error', (err) => {
        console.log('حدث خطأ، سأحاول العودة:', err.message);
        setTimeout(startBot, 10000);
    });
}

startBot();
