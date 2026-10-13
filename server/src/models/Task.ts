import { Schema, model, type Types } from 'mongoose';
import { Priority } from '../constants/priorities.js';


export interface ITask {
  boardId: Types.ObjectId;
  statusId: Types.ObjectId;
  title: string;
  description: string;
  priority: Priority;
  assigneeId: Types.ObjectId | null;
  creatorId: Types.ObjectId;
  tags: Types.ObjectId[]; // связь многие ко многим
}

const taskSchema = new Schema<ITask>(
  {
    boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true, index: true },
    statusId: { type: Schema.Types.ObjectId, ref: 'Status', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 5000 },
    priority: { type: String, enum: Priority, default: Priority.medium },
    assigneeId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
  },
  { timestamps: true },
);

export const Task = model<ITask>('Task', taskSchema);