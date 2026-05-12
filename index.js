import express from "express";
import { startXrealBot } from "./xreal-bot.js";
import { startBuilderBot } from "./builder-bot.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("✅ Bots are running!"));
app.get("/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);

  // xREAL يتصل أولاً
  startXrealBot();

  // builder يتصل بعد 20 ثانية لتجنب الطرد المتبادل
  setTimeout(() => startBuilderBot(), 20_000);

  // السيرفر يزور نفسه كل دقيقة
  setInterval(() => {
    fetch(`http://localhost:${PORT}/health`)
      .then(() => console.log("[SELF-PING] ok"))
      .catch(e => console.log("[SELF-PING] failed:", e.message));
  }, 60_000);
});
