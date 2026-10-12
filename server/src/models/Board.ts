import { Schema, model, type Types } from 'mongoose';

export interface IBoard {
  title: string;
  ownerId: Types.ObjectId; // id админа
}

const boardSchema = new Schema<IBoard>(
  {
    title: { type: String, required: true, trim: true, maxLength: 100 },
    // ref указывает Mongoose на какую коллекцию указывает id
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true },
);

export const Board = model<IBoard>('Board', boardSchema);