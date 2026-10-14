import { Router } from 'express';
import { z } from 'zod';
import { requireRole } from '../middleware/auth.js';
import { Status } from '../models/Status.js';
import { Task } from '../models/Task.js';
import { findOwnedBoard } from '../services/boardAccess.js';
import { isObjectId } from '../utils/objectId.js';
import { Role } from '../constants/roles.js';

// mergeParams: true — без него параметр :boardId из родительского пути
// в этом роутере был бы недоступен (req.params.boardId === undefined)
export const statusesRouter = Router({ mergeParams: true });

const statusTitleSchema = z.object({
  title: z.string().trim().min(1).max(50),
});

// Добавить статус
statusesRouter.post('/', requireRole(Role.admin), async (req, res) => {
  const board = await findOwnedBoard(req.params.boardId, req.user!.id);
  if (!board) {
    res.status(404).json({ message: 'Доска не найдена' });
    return;
  }

  const parsed = statusTitleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Некорректные данные', errors: z.treeifyError(parsed.error) });
    return;
  }

  const { title } = parsed.data;

  if (await Status.exists({ boardId: board._id, title })) {
    res.status(409).json({ message: 'Статус с таким названием уже есть на доске' });
    return;
  }

  // Новый статус встаёт в конец: order = максимальный + 1
  const last = await Status.findOne({ boardId: board._id }).sort({ order: -1 });
  const status = await Status.create({ boardId: board._id, title, order: last ? last.order + 1 : 0 });

  res.status(201).json(status);
});

// Переименовать статус
statusesRouter.patch('/:statusId', requireRole(Role.admin), async (req, res) => {
  const board = await findOwnedBoard(req.params.boardId, req.user!.id);
  const { statusId } = req.params;

  if (!board || !isObjectId(statusId)) {
    res.status(404).json({ message: 'Статус не найден' });
    return;
  }

  const parsed = statusTitleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Некорректные данные', errors: z.treeifyError(parsed.error) });
    return;
  }

  const { title } = parsed.data;

  // $ne: исключаем сам этот статус, чтобы можно было "переименовать" в то же название
  if (await Status.exists({ boardId: board._id, title, _id: { $ne: statusId }})) {
    res.status(409).json({ message: "Статус с таким названием уже есть на доске" });
    return;
  }

  // В фильтре и _id, и boardId: нельзя изменить статус другой доски, подставив его id
  const status = await Status.findOneAndUpdate(
    { _id: statusId, boardId: board._id },
    { title },
    { returnDocument: 'after' } // вернуть после обновления, а не до
  );

  if (!status) {
    res.status(404).json({ message: 'Статус не найден' });
    return;
  }

  res.json(status);
});

// Удалить статус
statusesRouter.delete('/:statusId', requireRole(Role.admin), async (req, res) => {
  const board = await findOwnedBoard(req.params.boardId, req.user!.id);
  const { statusId } = req.params;
  if (!board || !isObjectId(statusId)) {
    res.status(404).json({ message: 'Статус не найден' });
    return;
  }

  // Сначала находим статус именно на этой доске: для чужого id будет 404
  const status = await Status.findOne({ _id: statusId, boardId: board._id });
  if (!status) {
    res.status(404).json({ message: 'Статус не найден' });
    return;
  }

  // Нельзя удалить статус, на который ссылаются задачи: они бы остались с "битой ссылкой"
  if (await Task.exists({ statusId: status._id })) {
    res.status(409).json({ message: 'В статусе есть задачи, сначала перенесите их' });
    return;
  }

  await status.deleteOne();
  res.status(204).end(); // 204 No Content: успех без тела ответа
});