import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config.js';
import { User } from '../models/User.js';

export const authRouter = Router();

// схема того, что ждем от клиента
const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(8).max(72),
})

function signToken(userId: string, role: string): string {
  return jwt.sign({ sub: userId, role }, config.jwtSecret, {expiresIn: "7d" });
}

authRouter.post("/register", async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Некорректные данные", errors: z.treeifyError(parsed.error) });
    return;
  }

  const { email, password } = parsed.data;

  if (await User.exists({ email })) {
    res.status(409).json({ message: "Этот email уже занят"});
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash });

  res.status(201).json({
    token: signToken(user.id, user.role),
    user: { id: user.id, email: user.email, role: user.role }
  });
});

authRouter.post("/login", async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Некорректные данные" });
    return;
  }

  const { email, password } = parsed.data;

  const user = await User.findOne({ email });
  const isCorrectPassword = user ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!user || !isCorrectPassword) {
    res.status(401).json({ message: "Неверный email или пароль" });
    return;
  }

  res.json({
    token: signToken(user.id, user.role),
    user: { id: user.id, email: user.email, role: user.role }
  });
});