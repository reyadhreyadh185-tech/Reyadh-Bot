const express = require('express');
const mineflayer = require('mineflayer'); // أضفنا هذا السطر الضروري
const app = express();
const port = process.env.PORT || 3000;

// إعداد السيرفر ليبقى Render مستيقظاً (مرة واحدة فقط)
app.get('/', (req, res) => {
  res.send('RM Guard Bot is Alive! ⚔️');
});

app.listen(port, () => {
  console.log(`Web server running on port ${port}`);
});

// إعدادات البوت
const botArgs = {
    host: 'REA1_CRAFT.aternos.me', 
    port: 18542,                  
    username: 'RM_GUARD_02',    
    version: '1.21.1' // تأكد من هذا الإصدار (بدون 11 الزائدة)
};

let bot;
let spawnLocation = null;

function createBot() {
    bot = mineflayer.createBot(botArgs);

    bot.on('spawn', () => {
        console.log('⚔️ [RM] تم الدخول بنجاح وبدء الحراسة!');
        if (bot.entity) {
            spawnLocation = bot.entity.position.clone();
            startBehaviors();
        }
    });

    function startBehaviors() {
        // 1. القفز كل 3 ثوانٍ
        setInterval(() => {
            if (bot.entity) {
                bot.setControlState('jump', true);
                setTimeout(() => { if (bot.entity) bot.setControlState('jump', false); }, 500);
            }
        }, 3000);

        // 2. تحريك الرأس عشوائياً
        setInterval(() => {
            if (bot.entity) {
                const yaw = (Math.random() - 0.5) * Math.PI * 2;
                const pitch = (Math.random() - 0.5) * Math.PI;
                bot.look(yaw, pitch);
            }
        }, 2000);

        // 3. المشي العشوائي
        setInterval(() => {
            if (!bot.entity || !spawnLocation) return;
            const dx = (Math.random() - 0.5) * 10; 
            const dz = (Math.random() - 0.5) * 10;
            const targetPos = spawnLocation.offset(dx, 0, dz);
            bot.lookAt(targetPos);
            bot.setControlState('forward', true);
            setTimeout(() => { if (bot.entity) bot.setControlState('forward', false); }, 1500);
        }, 5000);
    }

    bot.on('end', () => {
        console.log('⚠️ انقطع الاتصال! العودة خلال 5 ثوانٍ...');
        setTimeout(createBot, 5000); 
    });

    bot.on('error', (err) => {
        console.log('❌ خطأ: ' + err.message);
    });
}

createBot();
