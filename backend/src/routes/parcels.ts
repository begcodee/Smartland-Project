import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { ParcelStatus, ParcelType, DocVerificationStatus } from '@prisma/client';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { status, verifiedOnly } = req.query;
    const isAdmin = req.user!.role === 'admin';
    const parcels = await prisma.landParcel.findMany({
      where: {
        ...(status ? { status: status as ParcelStatus } : {}),
        ...(!isAdmin && verifiedOnly !== 'false'
          ? { documentsVerificationStatus: DocVerificationStatus.verified }
          : {})
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        location: true,
        documents: true,
        images: { orderBy: { displayOrder: 'asc' } },
        transfers: {
          where: { status: 'completed' },
          orderBy: { completedDate: 'desc' },
          take: 1,
          select: {
            chainTxHash: true,
            chainNetwork: true,
            transactionHash: true,
            chainSaleId: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json({ success: true, parcels });
  } catch (err) {
    console.error('List parcels:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch parcels' });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parcel = await prisma.landParcel.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        location: true,
        documents: true,
        images: { orderBy: { displayOrder: 'asc' } },
        comments: { include: { user: { select: { id: true, name: true } } } },
        transfers: {
          where: { status: 'completed' },
          orderBy: { completedDate: 'desc' },
          take: 1,
          select: {
            chainTxHash: true,
            chainNetwork: true,
            transactionHash: true,
            chainSaleId: true
          }
        }
      }
    });
    if (!parcel) {
      res.status(404).json({ success: false, message: 'Parcel not found' });
      return;
    }
    res.json({ success: true, parcel });
  } catch (err) {
    console.error('Get parcel:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch parcel' });
  }
});

router.post('/', authenticate, requireRole('seller', 'admin'), async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const { title, description, area, price, type, location, documents, images } = body;
    if (!title || !description || area == null || price == null || !type || !location) {
      res.status(400).json({ success: false, message: 'Missing: title, description, area, price, type, location' });
      return;
    }
    const parcel = await prisma.landParcel.create({
      data: {
        title,
        description,
        area: Number(area),
        price: Number(price),
        type: (type as ParcelType) || 'residential',
        status: ParcelStatus.available,
        ownerId: req.user!.id,
        documentsVerificationStatus: DocVerificationStatus.pending,
        location: {
          create: {
            address: location.address || '',
            latitude: Number(location.latitude ?? location.coordinates?.lat ?? 0),
            longitude: Number(location.longitude ?? location.coordinates?.lng ?? 0),
            region: location.region || ''
          }
        },
        documents: documents?.length
          ? {
              create: documents.map((d: { name: string; type: string; url: string }) => ({
                name: d.name,
                type: d.type,
                url: d.url
              }))
            }
          : undefined,
        images: images?.length
          ? {
              create: images.map((img: { url: string; caption?: string; type?: string }, i: number) => ({
                url: img.url,
                caption: img.caption || '',
                type: img.type || 'main',
                displayOrder: i
              }))
            }
          : undefined
      },
      include: { location: true, documents: true, images: true }
    });
    res.json({ success: true, parcel });
  } catch (err) {
    console.error('Create parcel:', err);
    res.status(500).json({ success: false, message: 'Failed to create parcel' });
  }
});

router.patch('/:id/documents/verify', authenticate, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { docUpdates } = req.body as { docUpdates: { docId: string; action: 'verify' | 'reject' }[] };
    if (!docUpdates?.length) {
      res.status(400).json({ success: false, message: 'docUpdates required' });
      return;
    }
    const parcel = await prisma.landParcel.findUnique({ where: { id }, include: { documents: true } });
    if (!parcel) {
      res.status(404).json({ success: false, message: 'Parcel not found' });
      return;
    }
    for (const { docId, action } of docUpdates) {
      await prisma.landParcelDocument.updateMany({
        where: { id: docId, landParcelId: id },
        data: {
          verificationStatus: action === 'verify' ? DocVerificationStatus.verified : DocVerificationStatus.rejected,
          verifiedById: action === 'verify' ? req.user!.id : null,
          verifiedAt: action === 'verify' ? new Date() : null
        }
      });
    }
    const updated = await prisma.landParcel.findUnique({ where: { id }, include: { documents: true } });
    const allVerified = updated!.documents.every((d) => d.verificationStatus === DocVerificationStatus.verified);
    const anyRejected = updated!.documents.some((d) => d.verificationStatus === DocVerificationStatus.rejected);
    const docStatus = anyRejected ? DocVerificationStatus.rejected : allVerified ? DocVerificationStatus.verified : DocVerificationStatus.pending;
    await prisma.landParcel.update({
      where: { id },
      data: { documentsVerificationStatus: docStatus, updatedAt: new Date() }
    });
    res.json({ success: true, documentsVerificationStatus: docStatus });
  } catch (err) {
    console.error('Verify documents:', err);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

router.post('/:id/comments', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (!content?.trim()) {
      res.status(400).json({ success: false, message: 'content required' });
      return;
    }
    const comment = await prisma.landParcelComment.create({
      data: { landParcelId: id, userId: req.user!.id, content: content.trim() },
      include: { user: { select: { id: true, name: true } } }
    });
    res.json({ success: true, comment });
  } catch (err) {
    console.error('Add comment:', err);
    res.status(500).json({ success: false, message: 'Failed to add comment' });
  }
});

export default router;
