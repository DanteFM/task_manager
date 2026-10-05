import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDb } from "./db.js";
import { config } from "./config.js";
import { authRouter } from "./routes/auth.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);

app.get('/health', (_req, res) => {
  res.json({ status: "ok" });
});

async function start() {
  await connectDb();
  app.listen(config.port, () => console.log(`Сервер запущен на порту: ${config.port}`));
}

start().catch((err) => {
  console.error("Не удалось запустить сервер:", err);
  process.exit(1);
})