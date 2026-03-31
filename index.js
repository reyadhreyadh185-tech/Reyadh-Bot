const mineflayer = require('mineflayer');
const express = require('express');
const app = express();

// إعداد السيرفر ليبقى Render مستيقظاً
app.get('/', (req, res) => res.send('RM Guard is Online! ⚔️'));
app.listen(8080, () => console.log('Web server is ready!'));

const botArgs = {
    host: 'REA1_CRAFT.aternos.me', // عنوان سيرفرك
    port: 18542,                  // المنفذ الخاص بك
    username: 'RM_GUARD_FINAL',    // اسم البوت
    version: '1.21.1'             // إصدار ماينكرافت
};

let bot;
let spawnLocation = null;

function createBot() {
    bot = mineflayer.createBot(botArgs);

    bot.on('spawn', () => {
        console.log('⚔️ [RM] تم الدخول بنجاح وبدء الحراسة!');
        spawnLocation = bot.entity.position.clone(); // حفظ نقطة الرأس (مركز الـ 10 بلكات)
        
        startBehaviors();
    });

    // نظام الحركات المطلوبة
    function startBehaviors() {
        // 1. القفز كل 3 ثوانٍ
        setInterval(() => {
            if (bot.entity) bot.setControlState('jump', true);
            setTimeout(() => { if (bot.entity) bot.setControlState('jump', false); }, 500);
        }, 3000);

        // 2. تحريك الرأس عشوائياً كل ثانيتين لمدة ثانية
        setInterval(() => {
            const yaw = (Math.random() - 0.5) * Math.PI * 2;
            const pitch = (Math.random() - 0.5) * Math.PI;
            if (bot.entity) bot.look(yaw, pitch);
        }, 2000);

        // 3. المشي العشوائي ضمن قطر 10 بلكات
        setInterval(() => {
            if (!bot.entity || !spawnLocation) return;
            
            // حساب إحداثيات عشوائية ضمن القطر
            const dx = (Math.random() - 0.5) * 20; // 10 يمين و 10 يسار
            const dz = (Math.random() - 0.5) * 20;
            
            const targetPos = spawnLocation.offset(dx, 0, dz);
            
            // التحرك نحو الهدف
            bot.lookAt(targetPos);
            bot.setControlState('forward', true);
            setTimeout(() => { if (bot.entity) bot.setControlState('forward', false); }, 1500);
        }, 5000);
    }

    // أهم جزء: إعادة الدخول السريع (خلال 5 ثوانٍ)
    bot.on('end', () => {
        console.log('⚠️ انقطع الاتصال! العودة خلال 5 ثوانٍ...');
        setTimeout(createBot, 5000); 
    });

    bot.on('error', (err) => {
        console.log('❌ خطأ: ' + err.message);
    });
}

createBot();
