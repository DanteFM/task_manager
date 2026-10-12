import { Schema, model, type Types } from 'mongoose';

export interface IStatus {
  boardId: Types.ObjectId; // Статусы могут быть кастомные для каждой доски
  title: string;
  order: number;
}

const statusSchema = new Schema<IStatus>({
  boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true, index: true },
  title: { type: String, required: true, trim: true, maxLength: 50 },
  order: { type: Number, required: true },
});

// Составной уникальный индекс: на одной доске не может быть двух статусов с одним названием
statusSchema.index({ boardId: 1, title: 1}, { unique: true });

export const Status = model<IStatus>('Status', statusSchema);