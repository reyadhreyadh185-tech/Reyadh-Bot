const bedrock = require('bedrock-protocol');
const http = require('http');

// خادم ويب لإبقاء البوت مستيقظاً في Render
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('RM Bot is Running on REAL__CRAFT ⚪👑');
}).listen(process.env.PORT || 3000);

// توقيتات القفز وتغيير السلاح (بالملي ثانية)
const jumpTimes = [3000, 5000, 4000, 2000, 6000, 9000];
const weaponTimes = [3000, 4000, 9000, 5000];

function createBot() {
    console.log('جاري محاولة الدخول للسيرفر الجديد...');
    
    const client = bedrock.createClient({
        host: 'REAL__CRAFT.aternos.me', 
        port: 47495,                      
        username: 'RM_Bot',
        offline: true,
        version: '1.21.131' // الإصدار المعتاد لسيرفرك
    });

    client.on('join', () => {
        console.log('تم الدخول بنجاح! التكتيكات مفعلة.');

        // نظام القفز المتغير
        let jIdx = 0;
        function jump() {
            client.write('player_action', {
                entity_id: client.entityId, action: 'jump',
                block_position: { x: 0, y: 0, z: 0 },
                result_position: { x: 0, y: 0, z: 0 }, face: 0
            });
            setTimeout(jump, jumpTimes[jIdx]);
            jIdx = (jIdx + 1) % jumpTimes.length;
        }
        jump();

        // نظام تغيير السلاح المتغير
        let wIdx = 0; let slot = 0;
        function swap() {
            slot = (slot + 1) % 9;
            client.write('mob_equipment', {
                runtime_entity_id: client.entityId, item: { network_id: 0 },
                inventory_slot: slot, hotbar_slot: slot, window_id: 0
            });
            setTimeout(swap, weaponTimes[wIdx]);
            wIdx = (wIdx + 1) % weaponTimes.length;
        }
        swap();
    });

    // إعادة الاتصال التلقائي عند حدوث خطأ (لتجنب status 1)
    client.on('error', (err) => {
        console.log('خطأ في الاتصال، سأحاول مجدداً بعد 10 ثوانٍ:', err.message);
        setTimeout(createBot, 10000);
    });
}

createBot();
