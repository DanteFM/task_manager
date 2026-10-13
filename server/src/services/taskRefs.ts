import { Role } from '../constants/roles.js';
import { Tag } from '../models/Tag.js';
import { User } from '../models/User.js';

// Назначить задачу можно только существующему исполнителю (роль executor)
export async function assigneeExists(assigneeId: string): Promise<boolean> {
  return (await User.exists({ _id: assigneeId, role: Role.executor })) !== null;
}

// Все присланные теги должны существовать. Ожидает массив без дублей.
export async function allTagsExist(tagIds: string[]): Promise<boolean> {
  if (tagIds.length === 0) return true;
  return (await Tag.countDocuments({ _id: { $in: tagIds } })) === tagIds.length;
}