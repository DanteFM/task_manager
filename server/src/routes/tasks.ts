import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Status } from '../models/Status.js';
import { Task } from '../models/Task.js';
import { canChangeTaskStatus, findOwnedTask } from '../services/taskAccess.js';
import { isObjectId, objectIdSchema } from '../utils/objectId.js';
import { assigneeExists, allTagsExist } from '../services/taskRefs.js';
import { Priority } from '../constants/priorities.js';

export const tasksRouter = Router();

tasksRouter.use(requireAuth);

const changeStatusSchema = z.object({
  statusId: objectIdSchema,
});

// смена статуса задачи
tasksRouter.patch('/:taskId/status', async (req, res) => {
  const { taskId } = req.params;
  if (!isObjectId(taskId)) {
    res.status(404).json({ message: "Задача не найдена" });
    return;
  }
  
  const parsed = changeStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({message: 'Некорректные данные', errors: z.treeifyError(parsed.error) });
    return;
  }

  const task = await Task.findById(taskId);
  // Нет задачи и нет доступа: один и тот же 404, чтобы нельзя было перебирать чужие id
  if (!task || !(await canChangeTaskStatus(req.user!, task))) {
    res.status(404).json({ message: 'Задача не найдена' });
    return;
  }

  // Новый статус должен быть с той же доски, что и задача
  if (!(await Status.exists({ _id: parsed.data.statusId, boardId: task.boardId }))) {
    res.status(400).json({ message: 'Статус не найден на доске задачи' });
    return;
  }

  const updated = await Task.findByIdAndUpdate(
    task._id,
    { statusId: parsed.data.statusId },
    { returnDocument: "after" },
  );

  res.json(updated);
});

const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(5000),
  priority: z.enum(Priority),
  assigneeId: objectIdSchema.nullable(), // null снимет исполнителя
  tags: z.array(objectIdSchema).max(20),
}).partial()
.refine((data) => Object.keys(data).length > 0, { message: "Передайте хотя бы одно поле" });

// Изменить задачу
tasksRouter.patch('/:taskId', requireRole('admin'), async (req, res) => {
  const task = await findOwnedTask(req.params.taskId, req.user!.id);
  if (!task) {
    res.status(404).json({ message: 'Задача не найдена' });
    return;
  }

  const parsed = updateTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Некорректные данные', errors: z.treeifyError(parsed.error) });
    return;
  }
  
  const { tags, ...fields } = parsed.data;
  if (fields.assigneeId && !(await assigneeExists(fields.assigneeId))) {
    res.status(400).json({ message: "Исполнитель не найден" });
    return;
  }

  const  tagIds = tags && [...new Set(tags)];
  if (tagIds && !(await allTagsExist(tagIds))) {
    res.status(400).json({ message: "Некоторые теги не найдены" });
    return;
  }

  const updated = await Task.findByIdAndUpdate(
    task._id,
    { ...fields, ...(tagIds ? { tags: tagIds } : {})},
    { returnDocument: "after" }
  ).populate('tags', "name");

  res.json(updated);
});

// Удалить задачу
tasksRouter.delete('/:taskId', requireRole('admin'), async (req, res) => {
  const task = await findOwnedTask(req.params.taskId, req.user!.id);
  if (!task) {
    res.status(404).json({ message: 'Задача не найдена' });
    return;
  }

  await task.deleteOne();
  res.status(204).end();
});