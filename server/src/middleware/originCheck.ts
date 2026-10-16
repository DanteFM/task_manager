import type { NextFunction, Request, Response } from 'express';
import { config } from '../config.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// Изменяющие запросы с чужого Origin отклоняем. Браузер всегда присылает Origin
// на POST/PATCH/DELETE, а Postman и curl его не ставят, поэтому они проходят.
export function checkOrigin(req: Request, res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const origin = req.headers.origin!;
  if (origin && origin !== config.clientOrigin) {
    res.status(403).json({ message: "Запрос с неразрешённого источника" })
    return;
  }

  next();
}