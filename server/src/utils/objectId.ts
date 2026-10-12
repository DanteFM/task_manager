// Если прислать в :id не-ObjectId, Mongoose бросит ошибку и клиент получит 500 вместо понятного ответа.

import { isValidObjectId } from "mongoose";

// type guard: после проверки ts считает значение строкой
export function isObjectId(value: unknown): value is string {
  return typeof value === 'string' && isValidObjectId(value);
}