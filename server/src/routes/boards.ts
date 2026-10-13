import { Router } from 'express';
import { z } from 'zod';
import { DEFAULT_STATUSES } from '../constants/defaultStatuses.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Board } from '../models/Board.js';
import { Status } from '../models/Status.js';
import { Task } from '../models/Task.js';
import { isObjectId } from '../utils/objectId.js';
import { userCanAccessBoard } from '../services/boardAccess.js';
import { statusesRouter } from './statuses.js';

export const boardsRouter = Router();

// middleware: проверка сработает для всех роутов ниже, не нужно в каждом писать requireAuth
boardsRouter.use(requireAuth);

// Вложенные ресурсы доски, правила выше работают и на них
boardsRouter.use('/:boardId/statuses', statusesRouter);

const createBoardSchema = z.object({
  title: z.string().trim().min(1).max(100),
});

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