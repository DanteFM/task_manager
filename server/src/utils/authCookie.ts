import type { CookieOptions, Response } from "express";
import { config } from "../config.js";

export const AUTH_COOKIE = "token";

const baseOptions: CookieOptions = {
  httpOnly: true, // без доступа через js (защита от кражи через XSS)
  secure: config.isProd, // в проде только по HTTPS
  sameSite: "lax", // только для иммутабельных запросов с других сайтов (защита от CSRF)
  path: "/",
};

export function setAuthCookie(res: Response, token: string): void {
  // maxAge в миллисекундах
  res.cookie(AUTH_COOKIE, token, { ...baseOptions, maxAge: config.tokenTtlSeconds * 1000 });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE, baseOptions);
}