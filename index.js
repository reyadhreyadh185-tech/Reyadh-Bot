const bedrock = require('bedrock-protocol');
const http = require('http');

// 1. إعداد خادم ويب بسيط باش منصة Render ما تحبسش البوت وتعتبرو شغال
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is Online and Running!\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[System] Web server is listening on port ${PORT} for Render.`);
});

// 2. إعداد بوت ماينكرافت بدروك (حسب معلومات سيرفرك)
console.log('[Bot] Starting Minecraft Bedrock Bot...');

const client = bedrock.createClient({
  host: 'REA1CRAFT.aternos.me',   // عنوان السيرفر تاعك
  port: 48581,                    // منفذ السيرفر تاعك
  username: 'BuilderBot',         // اسم البوت داخل اللعبة (تقدر تبدلو)
  offline: true                   // مهم جداً! بما أن سيرفرك مكرك (Online Mode: False)
});

// أحداث البوت (باش تشوف في منصة Render واش راه يصرى)
client.on('join', () => {
  console.log('[Bot] البوت اتصل بالسيرفر بنجاح!');
});

client.on('spawn', () => {
  console.log('[Bot] البوت ترسبن في العالم راهو لداخل!');
});

client.on('disconnect', (packet) => {
  console.log('[Bot] البوت خرج من السيرفر، السبب:', packet);
});

client.on('error', (err) => {
  console.log('[Error] حدث خطأ:', err);
});
