const bedrock = require('bedrock-protocol');
const http = require('http');

// 1. خادم الويب لإبقاء البوت مستيقظاً 24/7 في Render
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('RM Bot Bedrock is Active 24/7 ⚪👑');
}).listen(process.env.PORT || 3000);

// 2. إعدادات الأوقات التي طلبتها (بالملي ثانية: 3 ثواني = 3000)
const jumpPattern = [3000, 5000, 4000, 2000, 6000, 9000];
const weaponPattern = [3000, 4000, 9000, 5000];

function startBot() {
    // 3. الدخول إلى سيرفر البدروك
    const client = bedrock.createClient({
        host: 'REA1_CRAFT.aternos.me', // عنوان سيرفرك
        port: 64603,                   // البورت الخاص بك
        username: 'RM_Bot',            // اسم البوت
        offline: true,                 // ضروري جداً ليدخل بدون حساب Xbox رسمي
        version: '1.21.130'            // إصدار سيرفرك
    });

    client.on('join', () => {
        console.log('دخل البوت المدريدي إلى السيرفر بنجاح!');

        // --- نظام القفز المخصص ---
        let jumpIndex = 0;
        function doJump() {
            // إرسال أمر القفز للسيرفر
            client.write('player_action', {
                entity_id: client.entityId,
                action: 'jump',
                block_position: { x: 0, y: 0, z: 0 },
                result_position: { x: 0, y: 0, z: 0 },
                face: 0
            });
            
            let nextJumpTime = jumpPattern[jumpIndex];
            jumpIndex = (jumpIndex + 1) % jumpPattern.length; // الانتقال للرقم التالي ثم الإعادة
            setTimeout(doJump, nextJumpTime);
        }
        doJump(); // بدء القفز

        // --- نظام تغيير السلاح المخصص ---
        let weaponIndex = 0;
        let currentSlot = 0;
        function changeWeapon() {
            currentSlot = (currentSlot + 1) % 9; // من الخانة 0 إلى 8
            
            // إرسال أمر تغيير السلاح
            client.write('mob_equipment', {
                runtime_entity_id: client.entityId,
                item: { network_id: 0 },
                inventory_slot: currentSlot,
                hotbar_slot: currentSlot,
                window_id: 0
            });

            let nextWeaponTime = weaponPattern[weaponIndex];
            weaponIndex = (weaponIndex + 1) % weaponPattern.length; // الانتقال للرقم التالي ثم الإعادة
            setTimeout(changeWeapon, nextWeaponTime);
        }
        changeWeapon(); // بدء تغيير السلاح
    });

    // 4. إعادة الاتصال التلقائي إذا تم طرده أو انغلق السيرفر
    client.on('disconnect', (packet) => {
        console.log('انقطع الاتصال.. سأعود بعد 10 ثوانٍ:', packet);
        setTimeout(startBot, 10000);
    });

    client.on('error', (err) => {
        console.log('حدث خطأ:', err);
        setTimeout(startBot, 10000);
    });
}

// تشغيل البوت
startBot();
