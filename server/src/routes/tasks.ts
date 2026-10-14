import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { Status } from '../models/Status.js';
import { Task } from '../models/Task.js';
import { canChangeTaskStatus } from '../services/taskAccess.js';
import { isObjectId, objectIdSchema } from '../utils/objectId.js';

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
    { new: true },
  );

  res.json(updated);
});