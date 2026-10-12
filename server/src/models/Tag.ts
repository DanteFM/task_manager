import { Schema, model } from 'mongoose';

export interface ITag {
  name: string;
}

// Теги общие для всех досок (отдельная коллекция), задачи ссылаются на них по id
const tagScheme = new Schema<ITag>({
  name: { type: String, required: true, unique: true, trim: true, lowercase: true, maxLength: 30 },
});

export const Tag = model<ITag>('Tag', tagScheme);