import { rateLimit } from 'express-rate-limit';
import { config } from '../config.js';

// Защита от подбора паролей и массового создания аккаунтов.
// Счётчик ведётся по IP и хранится в памяти процесса: при перезапуске сервера сбрасывается.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,    // окно 15 минут
  limit: config.authRateLimit, // сколько запросов можно сделать за окно
  standardHeaders: 'draft-7',  // отдаёт заголовки RateLimit и RateLimit-Policy: по ним клиент видит остаток
  legacyHeaders: false,
  message: { message: 'Слишком много попыток, попробуйте позже' },
});