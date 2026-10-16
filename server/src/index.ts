import "dotenv/config"; // всегда первой строкой - добавляет значения в process.env из env
import express from "express";
import cors from "cors";
import { connectDb } from "./db.js";
import { config } from "./config.js";
import { authRouter } from "./routes/auth.js";
import { requireAuth } from './middleware/auth.js';
import { User } from './models/User.js';
import { boardsRouter } from "./routes/boards.js";
import { tagsRouter } from "./routes/tags.js";
import { tasksRouter } from "./routes/tasks.js";
import cookieParser from "cookie-parser";
import { checkOrigin } from "./middleware/originCheck.js";

const app = express();

app.use(cors({ origin: config.clientOrigin, credentials: true })); // разрешаем кроссдоменные запросы
app.use(cookieParser()); // заполняет req.cookie
app.use(express.json()); // Превращает JSON из тела запроса в объект и кладёт в req.body
app.use(checkOrigin); // важен порядок - до роутов

app.use("/api/auth", authRouter);
app.use('/api/boards', boardsRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/tasks', tasksRouter);

app.get('/health', (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user!.id);

  if (!user) {
    res.status(401).json({ message: "Пользователь не найден" });
    return;
  }
  
  res.json({ id: user.id, email: user.email, role: user.role });
})

async function start() {
  await connectDb();
  app.listen(config.port, () => console.log(`Сервер запущен на порту: ${config.port}`));
}

start().catch((err) => {
  console.error("Не удалось запустить сервер:", err);
  process.exit(1);
})