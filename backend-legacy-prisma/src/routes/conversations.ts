import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { ParcelStatus } from '@prisma/client';

const router = Router();

function assertParticipant(userId: string, conv: { buyerId: string; sellerId: string }) {
  return conv.buyerId === userId || conv.sellerId === userId;
}

/** List conversations for current user */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const conversations = await prisma.conversation.findMany({
      where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
      include: {
        landParcel: { select: { id: true, title: true, status: true, price: true } },
        buyer: { select: { id: true, name: true, email: true } },
        seller: { select: { id: true, name: true, email: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, body: true, senderId: true, createdAt: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json({ success: true, conversations });
  } catch (err) {
    console.error('List conversations:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch conversations' });
  }
});

/**
 * Start or fetch a conversation for a parcel between buyer and seller.
 * Buyer can start it; seller can fetch if it exists.
 */
router.post('/start', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { landParcelId } = req.body as { landParcelId?: string };
    if (!landParcelId) {
      res.status(400).json({ success: false, message: 'landParcelId required' });
      return;
    }

    const parcel = await prisma.landParcel.findUnique({
      where: { id: landParcelId },
      select: { id: true, ownerId: true, status: true, documentsVerificationStatus: true }
    });
    if (!parcel) {
      res.status(404).json({ success: false, message: 'Parcel not found' });
      return;
    }

    const sellerId = parcel.ownerId;
    const buyerId = userId;
    if (buyerId === sellerId) {
      res.status(400).json({ success: false, message: 'Cannot message yourself' });
      return;
    }

    // Allow messaging if listing exists; only block if already sold.
    if (parcel.status === ParcelStatus.sold) {
      res.status(400).json({ success: false, message: 'Parcel already sold' });
      return;
    }

    const conv = await prisma.conversation.upsert({
      where: { landParcelId_buyerId_sellerId: { landParcelId, buyerId, sellerId } },
      create: { landParcelId, buyerId, sellerId },
      update: {},
      include: {
        landParcel: { select: { id: true, title: true } },
        buyer: { select: { id: true, name: true, phoneNumber: true, email: true } },
        seller: { select: { id: true, name: true, phoneNumber: true, email: true } }
      }
    });

    res.json({ success: true, conversation: conv });
  } catch (err) {
    console.error('Start conversation:', err);
    res.status(500).json({ success: false, message: 'Failed to start conversation' });
  }
});

/** Get conversation details (participants + parcel) */
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const conv = await prisma.conversation.findUnique({
      where: { id },
      include: {
        landParcel: { select: { id: true, title: true } },
        buyer: { select: { id: true, name: true, phoneNumber: true, email: true } },
        seller: { select: { id: true, name: true, phoneNumber: true, email: true } }
      }
    });
    if (!conv) {
      res.status(404).json({ success: false, message: 'Conversation not found' });
      return;
    }
    if (!assertParticipant(userId, conv)) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }
    res.json({ success: true, conversation: conv });
  } catch (err) {
    console.error('Get conversation:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch conversation' });
  }
});

/** Get messages in a conversation */
router.get('/:id/messages', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const conv = await prisma.conversation.findUnique({
      where: { id },
      select: { id: true, buyerId: true, sellerId: true }
    });
    if (!conv) {
      res.status(404).json({ success: false, message: 'Conversation not found' });
      return;
    }
    if (!assertParticipant(userId, conv)) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, name: true } } }
    });
    res.json({ success: true, messages });
  } catch (err) {
    console.error('Get messages:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

/** Send a message */
router.post('/:id/messages', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { body } = req.body as { body?: string };
    if (!body?.trim()) {
      res.status(400).json({ success: false, message: 'Message body required' });
      return;
    }

    const conv = await prisma.conversation.findUnique({
      where: { id },
      select: { id: true, buyerId: true, sellerId: true }
    });
    if (!conv) {
      res.status(404).json({ success: false, message: 'Conversation not found' });
      return;
    }
    if (!assertParticipant(userId, conv)) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    const msg = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: userId,
        body: body.trim()
      },
      include: { sender: { select: { id: true, name: true } } }
    });

    await prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } });

    res.json({ success: true, message: msg });
  } catch (err) {
    console.error('Send message:', err);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

export default router;

