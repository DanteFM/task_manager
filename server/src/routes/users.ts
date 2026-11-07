import { Router } from 'express';
import { z } from 'zod';
import { Role } from '../constants/roles.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { toPublicUser } from '../utils/publicUser.js';

const router = Router();
const querySchema = z.object({ role: z.enum(Role).optional() });

router.get('/', requireAuth, requireRole(Role.admin), async (req, res) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ message: "Некорректные параметры", errors: z.treeifyError(parsed.error)});
  }

  const filter = parsed.data.role ? { role: parsed.data.role } : {};
  const users = await User.find(filter).select("email role").sort({ email: 1 });

  res.json(users.map((user) => (toPublicUser(user))))
});

export default router;