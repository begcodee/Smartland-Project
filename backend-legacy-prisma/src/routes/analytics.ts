import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, requireRole('admin'), async (_req: Request, res: Response) => {
  try {
    const [parcels, users, disputes, transfers] = await Promise.all([
      prisma.landParcel.findMany(),
      prisma.user.findMany({ include: { reputation: true } }),
      prisma.dispute.findMany(),
      prisma.transfer.findMany()
    ]);
    const totalValue = parcels.reduce((s, p) => s + p.price, 0);
    const activeDisputes = disputes.filter((d) => d.status !== 'resolved').length;
    const pendingTransfers = transfers.filter((t) => t.status === 'pending').length;
    const verifiedUsers = users.filter((u) => u.verificationStatus === 'verified').length;
    const roleDistribution = {
      sellers: users.filter((u) => u.role === 'seller').length,
      buyers: users.filter((u) => u.role === 'buyer').length,
      admins: users.filter((u) => u.role === 'admin').length,
      arbitrators: users.filter((u) => u.role === 'arbitrator').length
    };
    const statusDistribution = {
      active: parcels.filter((p) => p.status === 'available').length,
      disputed: parcels.filter((p) => p.status === 'disputed').length,
      transferPending: parcels.filter((p) => p.status === 'pending').length
    };
    res.json({
      success: true,
      analytics: {
        totalProperties: parcels.length,
        totalValue,
        activeDisputes,
        pendingTransfers,
        verifiedUsers,
        roleDistribution,
        statusDistribution
      }
    });
  } catch (err) {
    console.error('Analytics:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
});

export default router;
