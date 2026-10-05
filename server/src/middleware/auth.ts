import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import type { UserRole } from "../models/User.js";

declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: string; role: UserRole };
  }
};

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: "Нужна авторизация" });
    return;
  }

  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret);

    if (typeof payload === 'string' || !payload.sub) throw new Error('Неверный токен');
    req.user = { id: payload.sub, role: payload.role };
  } catch {
    res.status(401).json({ message: 'Токен недействителен или истёк' });
  }
};

export function requireRole(role: UserRole) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.user?.role !== role) {
      res.status(403).json({ message: "Недостаточно прав" });
      return;
    }

    next();
  }
}