import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDb } from '../db.js';
import { User } from '../models/User.js';

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) throw new Error('Не заданы ADMIN_EMAIL и ADMIN_PASSWORD в .env');

  await connectDb();
  const passwordHash = await bcrypt.hash(password, 10);
  await User.findOneAndUpdate(
    { email },
    { email, passwordHash, role: 'admin' },
    { upsert: true },
  );
  console.log(`Админ ${email} создан/обновлён`)
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());