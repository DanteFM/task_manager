import type { Types } from 'mongoose';
import { Board } from '../models/Board.js';
import { Task } from '../models/Task.js';
import { isObjectId } from '../utils/objectId.js';
import { Role } from '../constants/roles.js';

export async function findOwnedTask(taskId: unknown, adminId: string) {
  if (!isObjectId(taskId)) return null;

  const task = await Task.findById(taskId);
  if (!task) return null;

  const ownsBoard = await Board.exists({ _id: task.boardId, ownerId: adminId });
  return ownsBoard ? task : null;
}

export async function canChangeTaskStatus(
  user: { id: string, role: Role },
  task: { boardId: Types.ObjectId, assigneeId: Types.ObjectId | null },
): Promise<boolean> {
  if (user.role === Role.admin) {
    return (await Board.exists({ _id: task.boardId, ownerId: user.id }) !== null);
  }

  return task.assigneeId !== null && task.assigneeId.equals(user.id);
}