// Если прислать в :id не-ObjectId, Mongoose бросит ошибку и клиент получит 500 вместо понятного ответа.

import { isValidObjectId } from "mongoose";
import { z } from "zod";

// type guard: после проверки ts считает значение строкой
export function isObjectId(value: unknown): value is string {
  return typeof value === 'string' && isValidObjectId(value);
}

// Для проверки id в телах запросов и query-параметрах
export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Некорректный id');