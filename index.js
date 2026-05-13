const mineflayer = require('mineflayer');
const express = require('express');
const app = express();

// 1. نظام إبقاء البوت حياً في ريندر (Express Server)
app.get('/', (req, res) => res.send('xREALx Bot is Running! 🇩🇿👑'));
app.listen(process.env.PORT || 3000, () => console.log('--- نظام الحماية من النوم نشط ---'));

const botOptions = {
    host: 'xREA1_CRAFT.aternos.me', 
    port: 64603,                      
    username: 'xREALx',
    version: '1.21.1' // متوافق مع نسخة Purpur 1.21.11 الظاهرة في الصورة
};

function createBot() {
    const bot = mineflayer.createBot(botOptions);

    bot.on('spawn', () => {
        console.log('✅ تم الدخول بنجاح! البوت xREALx متصل الآن.');
        
        // نظام الحركة: قفز ومشي بقطر 10 بلوكات تقريباً
        setInterval(() => {
            if (!bot.entity) return;

            const action = Math.random();
            
            if (action < 0.3) { 
                // قفز عشوائي
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 500);
            } else {
                // مشي عشوائي (تغيير الاتجاه والمشي لمسافة بسيطة)
                const yaw = Math.random() * Math.PI * 2;
                bot.look(yaw, 0);
                bot.setControlState('forward', true);
                
                // المشي لمدة ثانيتين (حوالي 8-10 بلوكات) ثم التوقف
                setTimeout(() => {
                    bot.setControlState('forward', false);
                }, 2000);
            }
        }, 5000); // تكرار المحاولة كل 5 ثوانٍ
    });

    // 2. إعادة المحاولة كل 5 ثوانٍ عند انقطاع الاتصال
    bot.on('end', (reason) => {
        console.log(`⚠️ انفصل الاتصال (السبب: ${reason}). سأحاول العودة بعد 5 ثوانٍ...`);
        setTimeout(createBot, 5000);
    });

    // 3. معالجة الأخطاء لمنع انهيار الخدمة في ريندر
    bot.on('error', (err) => {
        console.log('❌ خطأ في الاتصال:', err.message);
        // إذا كان السيرفر مغلقاً، ينتظر قليلاً قبل المحاولة مجدداً
        setTimeout(createBot, 10000); 
    });
}

// منع توقف الكود نهائياً عند حدوث خطأ غير متوقع
process.on('uncaughtException', (err) => console.log('🛡️ تم منع انهيار الكود:', err.message));

createBot();
