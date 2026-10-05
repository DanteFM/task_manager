function required(name: string): string {
  const value = process.env[name];

  if (!value) throw new Error(`${name} не задан в .env`);
  return value;
}

export const config = {
  port: Number(process.env.PORT) || 3000,
  mongoUri: required('MONGODB_URI'),
  jwtSecret: required('JWT_SECRET'),
};