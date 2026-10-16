function required(name: string): string {
  const value = process.env[name];

  if (!value) throw new Error(`${name} не задан в .env`);
  return value;
}

export const config = {
  port: Number(process.env.PORT) || 3000,
  mongoUri: required('MONGODB_URI'),
  jwtSecret: required('JWT_SECRET'),
  clientOrigin: required('CLIENT_ORIGIN'),
  isProd: process.env.NODE_ENV === 'production',
  tokenTtlSeconds: 7 * 24 * 60 * 60, // Срок жизни токена и cookie один: 7 дней, в секундах
  // Лимит запросов к /api/auth за 15 минут с одного IP. По умолчанию строгий,
  // для разработки значение поднимается в .env
  authRateLimit: Number(process.env.AUTH_RATE_LIMIT) || 20,
};