import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { generateBlockchainToken } from '../utils/blockchain.js';
import { sendVerificationDocumentsReceivedEmail } from '../services/email.js';

const router = Router();

router.get('/', authenticate, async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true }
    });
    res.json({ success: true, users });
  } catch (err) {
    console.error('List users:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

/** Admin: list all users with verificationStatus = pending */
/** Save Ghana Card / ID verification payload (JSON) — user stays pending until admin approves */
router.patch('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const { idVerification } = req.body as { idVerification?: string | Record<string, unknown> };
    if (idVerification == null) {
      res.status(400).json({ success: false, message: 'idVerification required' });
      return;
    }
    const json =
      typeof idVerification === 'string' ? idVerification : JSON.stringify(idVerification);
    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: { idVerification: json, niaStatus: 'pending' },
      select: { email: true, name: true }
    });
    void sendVerificationDocumentsReceivedEmail(updated.email, updated.name, 'ghana_card').catch(() => {});
    res.json({
      success: true,
      message:
        'Verification details received. Ghana Lands Commission / NIA review — expect an email within 24 to 48 hours.'
    });
  } catch (err) {
    console.error('Patch me:', err);
    res.status(500).json({ success: false, message: 'Failed to save verification' });
  }
});

router.get('/pending', authenticate, requireRole('admin'), async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { verificationStatus: 'pending' },
      include: { reputation: true, creditScore: true },
      orderBy: { createdAt: 'desc' }
    });
    const safe = users.map(({ passwordHash, ...u }) => u);
    res.json({ success: true, users: safe });
  } catch (err) {
    console.error('Pending users:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch pending users' });
  }
});

/** Admin: approve or reject a pending user */
router.patch('/:id/verify', authenticate, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason } = req.body as { action: 'approve' | 'reject'; rejectionReason?: string };
    if (!action || !['approve', 'reject'].includes(action)) {
      res.status(400).json({ success: false, message: 'action must be approve or reject' });
      return;
    }
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    if (existing.verificationStatus !== 'pending') {
      res.status(400).json({ success: false, message: 'User is not in pending status' });
      return;
    }
    if (action === 'approve' && existing.niaStatus !== 'verified') {
      res.status(400).json({
        success: false,
        message:
          'Cannot approve yet. NIA must verify this user first (niaStatus must be verified).'
      });
      return;
    }
    if (action === 'reject') {
      const updated = await prisma.user.update({
        where: { id },
        data: { verificationStatus: 'rejected' }
      });
      const { passwordHash, ...safe } = updated;
      res.json({ success: true, action: 'rejected', user: safe, reason: rejectionReason || 'Does not meet Ghana Lands Commission standards.' });
      return;
    }
    // Approve: set verified + generate blockchain token
    const token = generateBlockchainToken();
    const updated = await prisma.user.update({
      where: { id },
      data: { verificationStatus: 'verified', blockchainToken: token }
    });
    const { passwordHash, ...safe } = updated;
    res.json({ success: true, action: 'approved', user: safe, blockchainToken: token });
  } catch (err) {
    console.error('Verify user:', err);
    res.status(500).json({ success: false, message: 'Verification action failed' });
  }
});

export default router;
