import { Schema, model } from "mongoose";
import { Role } from "../constants/roles.js";

export interface IUser {
  email: string;
  passwordHash: string;
  role: Role;
  firstName?: string;
  lastName?: string;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: Role,
      default: Role.executor
    },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
  },
  { timestamps: true },
);

// Mongoose сам создаст коллекцию с именем 'users' (имя модели во множественном числе).
export const User = model<IUser>('User', userSchema);