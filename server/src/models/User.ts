import { Schema, model } from "mongoose";

export type UserRole = "admin" | "executor";

export interface IUser {
  email: string;
  passwordHash: string;
  role: UserRole;
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
      enum: ["admin", "executor"],
      default: "executor"
    }
  },
  { timestamps: true },
);

export const User = model<IUser>('User', userSchema);