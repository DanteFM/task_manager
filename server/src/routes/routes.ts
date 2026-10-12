import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Tag } from '../models/Tag.js';

export const tagsRouter = Router();

tagsRouter.use(requireAuth);

const createTagSchema = z.object({
  name: z.string().trim().toLowerCase().min(1).max(30),
});

// Список тегов: нужен всем, чтобы фильтровать задачи и видеть теги на карточках
tagsRouter.get('/', async (_req, res) => {
  const tags = await Tag.find().sort({ name: 1 });
  res.json(tags);
});

// Создать тег (только админ)
tagsRouter.post('/', requireRole('admin'), async (req, res) => {
  const parsed = createTagSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Некорректные данные', errors: z.treeifyError(parsed.error) });
    return;
  }
  const { name } = parsed.data;

  if (await Tag.exists({ name })) {
    res.status(409).json({ message: 'Такой тег уже есть' });
    return;
  }

  const tag = await Tag.create({ name });
  res.status(201).json(tag);
});