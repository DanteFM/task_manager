import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDb } from "./db.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: "ok" });
});

async function start() {
  await connectDb();

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => console.log(`Сервер запущен на порту: ${port}`));
}

start().catch((err) => {
  console.error("Не удалось запустить сервер:", err);
  process.exit(1);
})