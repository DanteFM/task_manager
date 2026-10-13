import { Router } from 'express';
import { z } from 'zod';
import { requireRole } from '../middleware/auth.js';
import { Status } from '../models/Status.js';
import { Tag } from '../models/Tag.js';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { findOwnedBoard } from '../services/boardAccess.js';
import { objectIdSchema } from '../utils/objectId.js';
import { Priority } from '../constants/priorities.js';
import { Role } from '../constants/roles.js';
import { error } from 'node:console';

export const boardTasksRouter = Router({ mergeParams: true });

const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(5000).default(''),
  priority: z.enum(Priority).default(Priority.medium),
  statusId: objectIdSchema.optional(), // если не указан, берём первую колонку
  assigneeId: objectIdSchema.nullable().optional(), // исполнитель, можно не назначать
  tags: z.array(objectIdSchema).max(20).default([]),
});

// создать задачу (только админ-владелец доски)
boardTasksRouter.post('/', requireRole(Role.admin), async(req, res) => {
  const board = await findOwnedBoard(req.params.boardId, req.user!.id);
  if (!board) {
    res.status(404).json({ message: "Доска не найдена" });
    return;
  }

  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Некорректные данны", error: z.treeifyError(parsed.error) });
    return;
  }

  const data = parsed.data;

  // статус должен принадлежать этой доске
  const status = data.statusId
    ? await Status.findOne({ _id: data.statusId, boardId: board._id })
    : await Status.findOne({ boardId: board._id }).sort({ order: 1 });

  if (!status) {
    res.status(400).json({ message: "Статус не найден на этой доске" });
    return;
  }

  // Назначить можно только существующего исполнителя
  if (data.assigneeId && !(await User.exists({ _id: data.assigneeId, role: Role.executor }))) {
    res.status(400).json({ message: "Исполнитель не найден" })
    return;
  }

  const tagIds = [...new Set(data.tags)];
  // Все теги должны существовать.
  if (tagIds.length && (await Tag.countDocuments({ _id: { $in: tagIds } })) !== tagIds.length) {
    res.status(400).json({ message: "Некоторые теги не найдены" });
    return;
  }

  const task = await Task.create({
    boardId: board._id,
    statusId: status._id,
    title: data.title,
    description: data.description,
    priority: data.priority,
    assigneeId: data.assigneeId ?? null,
    creatorId: req.user!.id,
    tags: tagIds,
  });

  res.status(200).json(task);
});