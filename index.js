import express from "express";
import { startXrealBot } from "./xreal-bot.js";
import { startBuilderBot } from "./builder-bot.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Health endpoint لأبتايم روبوت وكرون جوب ──────────────────────────────
app.get("/", (req, res) => {
  res.send("✅ Bots are running!");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ─── تشغيل السيرفر ────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);

  // تشغيل البوت الأول
  startXrealBot();

  // تشغيل البوت الثاني بعد 15 ثانية لتجنب الطرد
  setTimeout(() => startBuilderBot(), 15_000);

  // السيرفر يزور نفسه كل دقيقة ليبقى حياً
  setInterval(() => {
    fetch(`http://localhost:${PORT}/health`)
      .then(() => console.log("[SELF-PING] ok"))
      .catch(e => console.log("[SELF-PING] failed:", e.message));
  }, 60_000);
});
