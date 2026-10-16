import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { Role } from "../constants/roles.js";
import { AUTH_COOKIE } from "../utils/authCookie.js";

declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: string; role: Role };
  }
};

// Токен берём из заголовка Authorization (Postman, скрипты), а если его нет, из cookie (браузер).
// Заголовок главнее: его клиент ставит осознанно, а cookie браузер подставляет сам.
function extractToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);

  const cookieToken: unknown = req.cookies?.[AUTH_COOKIE];
  return typeof cookieToken === 'string' ? cookieToken : undefined;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({ message: "Нужна авторизация" });
    return;
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);

    if (typeof payload === 'string' || !payload.sub) throw new Error('Неверный токен');
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    res.status(401).json({ message: 'Токен недействителен или истёк' });
  }
};

export function requireRole(role: Role) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.user?.role !== role) {
      res.status(403).json({ message: "Недостаточно прав" });
      return;
    }

    next();
  }
}