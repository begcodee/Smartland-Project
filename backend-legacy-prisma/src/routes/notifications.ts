import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json({ success: true, notifications });
  } catch (err) {
    console.error('List notifications:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch' });
  }
});

router.patch('/:id/read', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.notification.updateMany({
      where: { id, userId: req.user!.id },
      data: { read: true }
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Mark read:', err);
    res.status(500).json({ success: false });
  }
});

export default router;
