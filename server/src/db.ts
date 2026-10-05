import mongoose from "mongoose";

export async function connectDb(): Promise<void> {
  const url = process.env.MONGODB_URI;
  if (!url) throw new Error("MONGODB_URI не задан в .env");

  await mongoose.connect(url);
  console.log("MongoDB подключена");
}