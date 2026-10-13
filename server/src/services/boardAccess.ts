import type { Types } from 'mongoose';
import { Board } from '../models/Board.js';
import { Task } from '../models/Task.js';
import type { UserRole } from '../models/User.js';
import { isObjectId } from '../utils/objectId.js';

// Доска текущего админа или null
export async function findOwnedBoard(boardId: unknown, userId: string) {
  if (!isObjectId(boardId)) return null;
  return Board.findOne({ _id: boardId, ownerId: userId });
}

// Правило доступа к доске:
// админ видит свои доски, исполнитель видит доски, где ему назначена задача
export async function userCanAccessBoard(
  user: { id: string; role: UserRole },
  board: { _id: Types.ObjectId; ownerId: Types.ObjectId },
): Promise<boolean> {
  if (user.role === 'admin') return board.ownerId.equals(user.id);
  return (await Task.exists({ boardId: board._id, assigneeId: user.id })) !== null;
}