import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { TransferStatus } from '@prisma/client';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const transfers = await prisma.transfer.findMany({
      where: {
        OR: [{ fromUserId: req.user!.id }, { toUserId: req.user!.id }]
      },
      include: {
        landParcel: { select: { id: true, title: true } },
        fromUser: { select: { id: true, name: true } },
        toUser: { select: { id: true, name: true } }
      },
      orderBy: { initiatedDate: 'desc' }
    });
    res.json({ success: true, transfers });
  } catch (err) {
    console.error('List transfers:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch transfers' });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { landParcelId, toUserId, amount, escrowAmount } = req.body;
    if (!landParcelId || !toUserId || amount == null) {
      res.status(400).json({ success: false, message: 'landParcelId, toUserId, amount required' });
      return;
    }
    const parcel = await prisma.landParcel.findUnique({ where: { id: landParcelId } });
    if (!parcel) {
      res.status(404).json({ success: false, message: 'Parcel not found' });
      return;
    }
    if (parcel.ownerId !== req.user!.id) {
      res.status(403).json({ success: false, message: 'Not the owner' });
      return;
    }
    if (parcel.status !== 'available') {
      res.status(400).json({ success: false, message: 'Parcel not available for transfer' });
      return;
    }
    const transfer = await prisma.transfer.create({
      data: {
        landParcelId,
        fromUserId: req.user!.id,
        toUserId,
        amount: Number(amount),
        escrowAmount: escrowAmount != null ? Number(escrowAmount) : null,
        status: TransferStatus.pending
      },
      include: {
        landParcel: true,
        fromUser: { select: { id: true, name: true } },
        toUser: { select: { id: true, name: true } }
      }
    });
    await prisma.landParcel.update({
      where: { id: landParcelId },
      data: { status: 'pending' }
    });
    res.json({ success: true, transfer });
  } catch (err) {
    console.error('Create transfer:', err);
    res.status(500).json({ success: false, message: 'Failed to initiate transfer' });
  }
});

router.post('/:id/complete', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transfer = await prisma.transfer.findUnique({ where: { id } });
    if (!transfer) {
      res.status(404).json({ success: false, message: 'Transfer not found' });
      return;
    }
    if (transfer.fromUserId !== req.user!.id) {
      res.status(403).json({ success: false, message: 'Only seller can complete' });
      return;
    }
    if (transfer.status !== TransferStatus.pending) {
      res.status(400).json({ success: false, message: 'Transfer already processed' });
      return;
    }
    await prisma.$transaction([
      prisma.transfer.update({
        where: { id },
        data: { status: TransferStatus.completed, completedDate: new Date() }
      }),
      prisma.landParcel.update({
        where: { id: transfer.landParcelId },
        data: { ownerId: transfer.toUserId, status: 'sold', updatedAt: new Date() }
      })
    ]);
    const updated = await prisma.transfer.findUnique({
      where: { id },
      include: { landParcel: true, fromUser: true, toUser: true }
    });
    res.json({ success: true, transfer: updated });
  } catch (err) {
    console.error('Complete transfer:', err);
    res.status(500).json({ success: false, message: 'Failed to complete transfer' });
  }
});

export default router;
