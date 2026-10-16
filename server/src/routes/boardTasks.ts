import { Router } from 'express';
import { z } from 'zod';
import { requireRole } from '../middleware/auth.js';
import { Status } from '../models/Status.js';
import { Task } from '../models/Task.js';
import { findOwnedBoard, userCanAccessBoard } from '../services/boardAccess.js';
import { isObjectId, objectIdSchema } from '../utils/objectId.js';
import { Priority } from '../constants/priorities.js';
import { Role } from '../constants/roles.js';
import { Board } from '../models/Board.js';
import { allTagsExist, assigneeExists } from '../services/taskRefs.js';

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

  if (data.assigneeId && !(await assigneeExists(data.assigneeId))) {
    res.status(400).json({ message: "Исполнитель не найден" })
    return;
  }

  const tagIds = [...new Set(data.tags)];
  if (!(await allTagsExist(tagIds))) {
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

  res.status(201).json(task);
});

const listTasksQuerySchema = z.object({
  statusId: objectIdSchema.optional(),
  assigneeId: objectIdSchema.optional(),
  priority: z.enum(Priority).optional(),
  tag: objectIdSchema.optional(),
});

// Задачи доски. Фильтры в query: ?statusId=...&priority=high&tag=...
boardTasksRouter.get<{ boardId: string }>("/", async (req, res) => {
  const { boardId } = req.params;
  if (!isObjectId(boardId)) {
    res.status(404).json({ message: 'Доска не найдена' });
    return;
  }

  const board = await Board.findById(boardId);
  if (!board || !(await userCanAccessBoard(req.user!, board))) {
    res.status(404).json({ message: 'Доска не найдена' });
    return;
  }

  const parsed = listTasksQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: 'Некорректные фильтры', errors: z.treeifyError(parsed.error) });
    return;
  }
  const query = parsed.data;

  const filter: Record<string, unknown> = { boardId: board._id };
  if (query.statusId) filter.statusId = query.statusId;
  if (query.priority) filter.priority = query.priority;
  if (query.tag) filter.tags = query.tag;
  if (req.user!.role === Role.executor) filter.assigneeId = req.user!.id;
  else if (query.assigneeId) filter.assigneeId = query.assigneeId;

  const tasks = await Task.find(filter)
    .sort({ createdAt: -1 })
    .populate('tags', 'name'); // подставить вместо id тегов сами теги (только поле name)

  res.json(tasks);
})