const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const http = require('http');

// خادم ويب وهمي لكي لا يتوقف البوت في Render
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Bot is Active 24/7');
}).listen(process.env.PORT || 3000);

const bot = mineflayer.createBot({
    host: 'REA1_CRAFT.aternos.me', 
    port: 18542,                   
    username: 'RM_Bot',            
    version: false                 
});

bot.loadPlugin(pathfinder);

bot.on('spawn', () => {
    console.log('دخل البوت إلى السيرفر بنجاح!');
    
    const defaultMove = new Movements(bot);
    bot.pathfinder.setMovements(defaultMove);

    // 1. تكتيك القفز (كل 2، 4، 7، 3 ثواني)
    const jumpPattern = [2000, 4000, 7000, 3000];
    let jumpIndex = 0;
    
    function startJumping() {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 500); 
        setTimeout(startJumping, jumpPattern[jumpIndex]);
        jumpIndex = (jumpIndex + 1) % jumpPattern.length; 
    }
    startJumping();

    // 2. التحرك في قطر 10 بلوكات
    setInterval(() => {
        if (!bot.entity) return;
        const p = bot.entity.position;
        const randomX = p.x + (Math.random() * 20 - 10);
        const randomZ = p.z + (Math.random() * 20 - 10);
        bot.pathfinder.setGoal(new goals.GoalNearXZ(randomX, randomZ, 1));
    }, 15000); 

    // 3. تغيير السلاح كل 5 ثواني
    let currentSlot = 0;
    setInterval(() => {
        bot.setQuickBarSlot(currentSlot);
        currentSlot = (currentSlot + 1) % 9; 
    }, 5000);

    // 4. فتح أي صندوق أمامه
    setInterval(async () => {
        const chest = bot.findBlock({
            matching: bot.registry.blocksByName.chest.id,
            maxDistance: 3 
        });

        if (chest) {
            try {
                const container = await bot.openContainer(chest);
                setTimeout(() => container.close(), 1000); 
            } catch (err) {}
        }
    }, 4000); 
});

// إعادة الاتصال التلقائي
bot.on('end', () => {
    console.log('انقطع الاتصال.. سأحاول الدخول مجدداً.');
    process.exit(1); 
});
bot.on('error', err => console.log(err));
