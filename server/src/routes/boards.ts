import { Router } from 'express';
import type { Types } from 'mongoose';
import { z } from 'zod';
import { DEFAULT_STATUSES } from '../constants/defaultStatuses.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Board } from '../models/Board.js';
import { Status } from '../models/Status.js';
import { Task } from '../models/Task.js';
import type { UserRole } from '../models/User.js';
import { isObjectId } from '../utils/objectId.js';

export const boardsRouter = Router();

// middleware: проверка сработает для всех роутов ниже, не нужно в каждом писать requireAuth
boardsRouter.use(requireAuth);

const createBoardSchema = z.object({
  title: z.string().trim().min(1).max(100),
});

// Правило доступа к доске:
// админ видит все доски, которые он создал
// исполнитель видит доски, где у него есть задачи
async function userCanAccessBoard(
  user: { id: string; role: UserRole },
  board: { _id: Types.ObjectId; ownerId: Types.ObjectId },
): Promise<boolean> {
  if (user.role === 'admin') return board.ownerId.equals(user.id);
  return (await Task.exists({ boardId: board._id, assigneeId: user.id })) !== null;
}

// Создать доску (также создаются статусы для нее по шаблону)
boardsRouter.post('/', requireRole('admin'), async (req, res) => {
  const parsed = createBoardSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Некорректные данные', errors: z.treeifyError(parsed.error) });
    return;
  }

  // ownerId берём из токена, а не из тела запроса: иначе можно создать доску от чужого имени
  const board = await Board.create({ title: parsed.data.title, ownerId: req.user!.id });

  // index используем как order
  const statuses = await Status.insertMany(
    DEFAULT_STATUSES.map((title, order) => {
      return ({ boardId: board._id, title, order })
    })
  );
  res.status(201).json({ board, statuses });
});

// список досок, доступных текущему пользователю
boardsRouter.get('/', async (req, res) => {
  const user = req.user!;

  const filter = user.role === 'admin'
    ? { ownerId: user.id }
    // distinct возвращает массив уникальных boardId из задач этого исполнителя
    : { _id: { $in: await Task.distinct('boardId', { assigneeId: user.id }) } };

  const boards = await Board.find(filter).sort({ createdAt: -1 });
  res.json(boards);
});

// Одна доска со статусами
boardsRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) {
    res.status(404).json({ message: 'Доска не найдена' });
    return;
  }

  const board = await Board.findById(id);

  // один обработчик для отсутствия доски или доступа и тот же 404
  // 403/404 можно узнавать, какие id существуют (это защита от IDOR)
  if (!board || !(await userCanAccessBoard(req.user!, board))) {
    res.status(404).json({ message: 'Доска не найдена' });
    return;
  }

  const statuses = await Status.find({ boardId: board._id }).sort({ order: 1 });
  res.json({ board, statuses });
});

const statusTitleSchema = z.object({
  title: z.string().trim().min(1).max(50),
});

// Доска текущего админа или null. Сразу проверяет и формат id, и владельца:
// чужую доску админ не увидит, даже зная её id.
async function findOwnedBoard(boardId: unknown, userId: string) {
  if (!isObjectId(boardId)) return null;
  return Board.findOne({ _id: boardId, ownerId: userId });
}

// Добавить статус
boardsRouter.post('/:id/statuses', requireRole('admin'), async (req, res) => {
  const board = await findOwnedBoard(req.params.id, req.user!.id);
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
boardsRouter.patch('/:id/statuses/:statusId', requireRole('admin'), async (req, res) => {
  const board = await findOwnedBoard(req.params.id, req.user!.id);
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
    { new: true } // вернуть после обновления, а не до
  );

  if (!status) {
    res.status(404).json({ message: 'Статус не найден' });
    return;
  }

  res.json(status);
});

// Удалить статус
boardsRouter.delete('/:id/statuses/:statusId', requireRole('admin'), async (req, res) => {
  const board = await findOwnedBoard(req.params.id, req.user!.id);
  const { statusId } = req.params;
  if (!board || !isObjectId(statusId)) {
    res.status(404).json({ message: 'Статус не найден' });
    return;
  }

  // Нельзя удалить статус, на который ссылаются задачи: они бы остались с "битой ссылкой
  if (await Task.exists({ statusId })) {
    res.status(409).json({ message: 'В статусе есть задачи, сначала перенесите их' });
    return;
  }

  const deleted = await Status.findOneAndDelete({ _id: statusId, boardId: board._id });
  if (!deleted) {
    res.status(404).json({ message: 'Статус не найден' });
    return;
  }

  res.status(204).end(); // 204 No Content: успех без тела ответа
});