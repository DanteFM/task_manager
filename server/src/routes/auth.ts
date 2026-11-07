import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config.js';
import { User } from '../models/User.js';
import { setAuthCookie, clearAuthCookie } from '../utils/authCookie.js';
import { toPublicUser } from '../utils/publicUser.js';

export const authRouter = Router();

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(8).max(72),
});

const registerSchema = credentialsSchema.extend({
  firstName: z.string().trim().min(1, 'Укажите имя').max(50),
  lastName: z.string().trim().min(1, 'Укажите фамилию').max(50),
});

function signToken(userId: string, role: string): string {
  return jwt.sign({ sub: userId, role }, config.jwtSecret, { expiresIn: config.tokenTtlSeconds });
}

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Некорректные данные", errors: z.treeifyError(parsed.error) });
    return;
  }

  const { email, password, firstName, lastName } = parsed.data;

  if (await User.exists({ email })) {
    res.status(409).json({ message: "Этот email уже занят" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, firstName, lastName });

  setAuthCookie(res, signToken(user.id, user.role));

  res.status(201).json({ user: toPublicUser(user) });
});

authRouter.post("/login", async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Некорректные данные", errors: z.treeifyError(parsed.error) });
    return;
  }

  const { email, password } = parsed.data;

  const user = await User.findOne({ email });
  const isCorrectPassword = user ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!user || !isCorrectPassword) {
    res.status(401).json({ message: "Неверный email или пароль" });
    return;
  }

  setAuthCookie(res, signToken(user.id, user.role));

  res.json({ user: toPublicUser(user) });
});

authRouter.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  res.status(204).end();
});