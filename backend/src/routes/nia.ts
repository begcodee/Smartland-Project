import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { NIAVerificationStatus, VerificationStatus } from '@prisma/client';
import { verifyGhanaCard } from '../services/niaVerification.js';

const router = Router();

/** NIA: list users awaiting NIA verification */
router.get('/users', authenticate, requireRole('nia'), async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        verificationStatus: VerificationStatus.pending,
        idVerification: { not: null },
        niaStatus: { in: [NIAVerificationStatus.pending, NIAVerificationStatus.not_submitted] }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
        idVerification: true,
        niaStatus: true,
        niaReferenceId: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, users });
  } catch (err) {
    console.error('NIA list users:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

/** NIA: verify or reject a user's Ghana Card details */
router.post('/users/:id/decision', authenticate, requireRole('nia'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action } = req.body as { action?: 'verify' | 'reject' };
    if (!action || !['verify', 'reject'].includes(action)) {
      res.status(400).json({ success: false, message: 'action must be verify or reject' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, idVerification: true, niaStatus: true }
    });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    if (!user.idVerification) {
      res.status(400).json({ success: false, message: 'No Ghana Card submission found for this user' });
      return;
    }

    if (action === 'reject') {
      const updated = await prisma.user.update({
        where: { id },
        data: {
          niaStatus: NIAVerificationStatus.rejected,
          niaVerifiedAt: new Date(),
          niaReferenceId: `NIA-REJECT-${Date.now()}`
        },
        select: { id: true, niaStatus: true, niaReferenceId: true, niaVerifiedAt: true }
      });
      res.json({ success: true, user: updated });
      return;
    }

    // Verify: call the NIA verifier (mock or live). This does NOT set verificationStatus=verified.
    let payload: { cardNumber?: string; fullName?: string; frontCardImage?: string; backCardImage?: string; faceImage?: string; selfieSource?: 'live_camera' | 'upload' };
    try {
      payload = JSON.parse(user.idVerification) as typeof payload;
    } catch {
      res.status(400).json({ success: false, message: 'Invalid stored idVerification payload' });
      return;
    }

    const result = await verifyGhanaCard({
      cardNumber: payload.cardNumber || '',
      fullName: payload.fullName || '',
      frontCardImage: payload.frontCardImage || '',
      backCardImage: payload.backCardImage || '',
      faceImage: payload.faceImage || '',
      selfieSource: payload.selfieSource
    });

    // In this prototype, NIA endpoint returns screening results; for NIA staff, "verify" records NIA decision anyway.
    const updated = await prisma.user.update({
      where: { id },
      data: {
        niaStatus: NIAVerificationStatus.verified,
        niaVerifiedAt: new Date(),
        niaReferenceId: result.referenceId || `NIA-OK-${Date.now()}`
      },
      select: { id: true, niaStatus: true, niaReferenceId: true, niaVerifiedAt: true }
    });

    res.json({ success: true, user: updated, nia: result });
  } catch (err) {
    console.error('NIA decision:', err);
    res.status(500).json({ success: false, message: 'Failed to update NIA decision' });
  }
});

export default router;

