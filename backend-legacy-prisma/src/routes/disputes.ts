import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { DisputeStatus, VoteType } from '@prisma/client';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const isElevatedReviewer = req.user!.role === 'admin' || req.user!.role === 'arbitrator';
    const disputes = await prisma.dispute.findMany({
      where: isElevatedReviewer
        ? undefined
        : {
            OR: [
              { plaintiffUserId: req.user!.id },
              { defendantUserId: req.user!.id },
              // Community members can discover disputes open for public voting.
              { status: DisputeStatus.community_voting },
              // Also include disputes the user has already voted on.
              { votes: { some: { userId: req.user!.id } } }
            ]
          },
      include: {
        landParcel: { select: { id: true, title: true } },
        plaintiff: { select: { id: true, name: true } },
        defendant: { select: { id: true, name: true } }
      },
      orderBy: { filedDate: 'desc' }
    });
    res.json({ success: true, disputes });
  } catch (err) {
    console.error('List disputes:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch disputes' });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { landParcelId, defendantUserId, description, evidence } = req.body;
    if (!landParcelId || !defendantUserId || !description) {
      res.status(400).json({ success: false, message: 'landParcelId, defendantUserId, description required' });
      return;
    }
    const parcel = await prisma.landParcel.findUnique({ where: { id: landParcelId } });
    if (!parcel) {
      res.status(404).json({ success: false, message: 'Parcel not found' });
      return;
    }
    const dispute = await prisma.dispute.create({
      data: {
        landParcelId,
        plaintiffUserId: req.user!.id,
        defendantUserId,
        description,
        status: DisputeStatus.filed,
        evidence: evidence?.length
          ? {
              create: evidence.map((e: string | { fileName: string; fileUrl: string }) =>
                typeof e === 'string' ? { fileName: e, fileUrl: '' } : { fileName: e.fileName, fileUrl: e.fileUrl }
              )
            }
          : undefined
      },
      include: {
        landParcel: true,
        plaintiff: true,
        defendant: true
      }
    });
    await prisma.landParcel.update({
      where: { id: landParcelId },
      data: { status: 'disputed' }
    });
    res.json({ success: true, dispute });
  } catch (err) {
    console.error('Create dispute:', err);
    res.status(500).json({ success: false, message: 'Failed to file dispute' });
  }
});

router.post('/:id/vote', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { vote } = req.body;
    if (!['support', 'against', 'abstain'].includes(vote)) {
      res.status(400).json({ success: false, message: 'vote must be support, against, or abstain' });
      return;
    }
    const dispute = await prisma.dispute.findUnique({ where: { id } });
    if (!dispute) {
      res.status(404).json({ success: false, message: 'Dispute not found' });
      return;
    }
    if (dispute.status !== DisputeStatus.community_voting) {
      res.status(400).json({ success: false, message: 'Voting not open' });
      return;
    }
    // Keep community voting impartial by excluding directly interested parties.
    if (dispute.plaintiffUserId === req.user!.id || dispute.defendantUserId === req.user!.id) {
      res.status(403).json({ success: false, message: 'Plaintiff and defendant cannot vote on this dispute' });
      return;
    }
    const existing = await prisma.disputeVote.findUnique({
      where: { disputeId_userId: { disputeId: id, userId: req.user!.id } }
    });
    if (existing) {
      res.status(400).json({ success: false, message: 'Already voted' });
      return;
    }
    const voteField = vote === 'support' ? 'supportVotes' : vote === 'against' ? 'againstVotes' : 'abstainVotes';
    await prisma.$transaction([
      prisma.disputeVote.create({
        data: { disputeId: id, userId: req.user!.id, vote: vote as VoteType }
      }),
      prisma.dispute.update({
        where: { id },
        data: { [voteField]: { increment: 1 } }
      })
    ]);
    const updated = await prisma.dispute.findUnique({ where: { id } });
    res.json({ success: true, dispute: updated });
  } catch (err) {
    console.error('Vote:', err);
    res.status(500).json({ success: false, message: 'Failed to record vote' });
  }
});

router.post('/:id/resolve', authenticate, requireRole('admin', 'arbitrator'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;
    if (!resolution?.trim()) {
      res.status(400).json({ success: false, message: 'resolution required' });
      return;
    }
    const dispute = await prisma.dispute.findUnique({ where: { id } });
    if (!dispute) {
      res.status(404).json({ success: false, message: 'Dispute not found' });
      return;
    }
    if (dispute.status === DisputeStatus.resolved) {
      res.status(400).json({ success: false, message: 'Already resolved' });
      return;
    }
    await prisma.dispute.update({
      where: { id },
      data: { status: DisputeStatus.resolved, resolution: resolution.trim(), resolvedAt: new Date() }
    });
    const updated = await prisma.dispute.findUnique({ where: { id } });
    res.json({ success: true, dispute: updated });
  } catch (err) {
    console.error('Resolve dispute:', err);
    res.status(500).json({ success: false, message: 'Failed to resolve' });
  }
});

router.patch('/:id/status', authenticate, requireRole('admin', 'arbitrator'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses: DisputeStatus[] = [
      DisputeStatus.filed,
      DisputeStatus.pending,
      DisputeStatus.under_review,
      DisputeStatus.community_voting
    ];
    if (!allowedStatuses.includes(status as DisputeStatus)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }
    const dispute = await prisma.dispute.update({
      where: { id },
      data: {
        status: status as DisputeStatus,
        ...(status === 'community_voting' ? { votingDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) } : {})
      }
    });
    res.json({ success: true, dispute });
  } catch (err) {
    console.error('Update dispute status:', err);
    res.status(500).json({ success: false, message: 'Failed to update' });
  }
});

export default router;
