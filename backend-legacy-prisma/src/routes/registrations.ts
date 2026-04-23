import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { hashPassword, signToken } from '../utils/auth.js';
import { generateBlockchainToken } from '../utils/blockchain.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { sendRegistrationOutcomeEmail, sendVerificationDocumentsReceivedEmail } from '../services/email.js';

const router = Router();

router.post('/submit', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const {
      name,
      email,
      phoneNumber,
      role,
      organization,
      password,
      staffId,
      arbitratorRegNo,
      ghanaCard,
      landDocuments
    } = body;
    if (!name || !email || !phoneNumber || !password || !ghanaCard) {
      res.status(400).json({
        success: false,
        message: 'Missing: name, email, phoneNumber, password, ghanaCard'
      });
      return;
    }
    const hasGhanaCard =
      ghanaCard.frontCardImage &&
      ghanaCard.backCardImage &&
      ghanaCard.faceImage &&
      ghanaCard.cardNumber &&
      ghanaCard.fullName;
    if (!hasGhanaCard) {
      res.status(400).json({ success: false, message: 'Complete Ghana Card verification' });
      return;
    }
    if (role === 'seller' && (!landDocuments || landDocuments.length < 2)) {
      res.status(400).json({ success: false, message: 'Sellers need Land Title and Survey Plan' });
      return;
    }
    if (role === 'admin' && !staffId?.trim()) {
      res.status(400).json({ success: false, message: 'Staff ID required for admin' });
      return;
    }
    if (role === 'arbitrator' && !arbitratorRegNo?.trim()) {
      res.status(400).json({ success: false, message: 'Arbitrator registration number required' });
      return;
    }
    const existing = await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } });
    if (existing) {
      res.status(400).json({ success: false, message: 'Email already registered' });
      return;
    }
    const passwordHash = await hashPassword(password);
    const reg = await prisma.pendingRegistration.create({
      data: {
        name,
        email: String(email).toLowerCase(),
        phoneNumber,
        role: (['admin', 'seller', 'buyer', 'arbitrator'].includes(String(role)) ? String(role) : 'seller') as 'admin' | 'seller' | 'buyer' | 'arbitrator',
        organization: organization || null,
        passwordHash,
        staffId: role === 'admin' ? staffId?.trim() : null,
        arbitratorRegNo: role === 'arbitrator' ? arbitratorRegNo?.trim() : null,
        ghanaCard: {
          create: {
            frontCardImage: ghanaCard.frontCardImage,
            backCardImage: ghanaCard.backCardImage,
            faceImage: ghanaCard.faceImage,
            cardNumber: ghanaCard.cardNumber,
            fullName: ghanaCard.fullName,
            faceMatchPassed: !!ghanaCard.faceMatchPassed
          }
        },
        landDocuments: landDocuments?.length
          ? {
              create: landDocuments.map((d: { id?: string; name: string; type: string; scannedImage: string; size?: number }) => ({
                name: d.name,
                type: d.type,
                scannedImage: d.scannedImage,
                size: d.size || 0
              }))
            }
          : undefined
      },
      include: { ghanaCard: true, landDocuments: true }
    });
    void sendVerificationDocumentsReceivedEmail(reg.email, reg.name, 'full_registration').catch(() => {});
    res.json({
      success: true,
      id: reg.id,
      message:
        'Registration received. Ghana Lands Commission and (where applicable) NIA will review — expect an email within 24 to 48 hours.'
    });
  } catch (err) {
    console.error('Registration submit:', err);
    res.status(500).json({ success: false, message: 'Submission failed' });
  }
});

router.get('/pending', authenticate, requireRole('admin'), async (_req: Request, res: Response) => {
  try {
    const list = await prisma.pendingRegistration.findMany({
      where: { status: 'pending' },
      include: { ghanaCard: true, landDocuments: true },
      orderBy: { submittedAt: 'desc' }
    });
    res.json({ success: true, registrations: list });
  } catch (err) {
    console.error('Pending registrations:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch' });
  }
});

router.post('/:id/review', authenticate, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason } = req.body;
    const finalRejectionReason = rejectionReason || 'Documents do not meet standards';
    if (!action || !['approve', 'reject'].includes(action)) {
      res.status(400).json({ success: false, message: 'action must be approve or reject' });
      return;
    }
    const reg = await prisma.pendingRegistration.findUnique({
      where: { id },
      include: { ghanaCard: true, landDocuments: true }
    });
    if (!reg) {
      res.status(404).json({ success: false, message: 'Registration not found' });
      return;
    }
    if (reg.status !== 'pending') {
      res.status(400).json({ success: false, message: 'Already reviewed' });
      return;
    }
    await prisma.pendingRegistration.update({
      where: { id },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewedAt: new Date(),
        reviewedById: req.user!.id,
        rejectionReason: action === 'reject' ? finalRejectionReason : null
      }
    });
    if (action === 'reject') {
      await sendRegistrationOutcomeEmail({
        to: reg.email,
        name: reg.name,
        role: reg.role,
        approved: false,
        rejectionReason: finalRejectionReason
      });
      res.json({ success: true, approved: false, message: 'Registration rejected' });
      return;
    }
    const token = generateBlockchainToken();
    const user = await prisma.user.create({
      data: {
        name: reg.name,
        email: reg.email,
        phoneNumber: reg.phoneNumber,
        passwordHash: reg.passwordHash,
        role: reg.role,
        organization: reg.organization,
        staffId: reg.staffId,
        arbitratorRegNo: reg.arbitratorRegNo,
        blockchainToken: token,
        verificationStatus: 'verified',
        country: 'GH',
        idVerification: reg.ghanaCard
          ? JSON.stringify({
              frontCardImage: reg.ghanaCard.frontCardImage,
              backCardImage: reg.ghanaCard.backCardImage,
              faceImage: reg.ghanaCard.faceImage,
              cardNumber: reg.ghanaCard.cardNumber,
              fullName: reg.ghanaCard.fullName,
              status: 'verified'
            })
          : null,
        reputation: {
          create: { score: 0, totalTransactions: 0, successfulTransactions: 0, disputesWon: 0, communityVotes: 0 }
        },
        creditScore: {
          create: { score: 650, rating: 'Fair', paymentHistory: 70, creditUtilization: 45, lengthOfHistory: 60, newCredit: 55, creditMix: 65 }
        },
        financialProfile: {
          create: { monthlyIncome: 3500, assets: 50000, liabilities: 15000, netWorth: 35000, bankingHistory: 3 }
        }
      },
      include: { reputation: true, creditScore: true, financialProfile: true }
    });
    const { passwordHash, ...safe } = user;
    const jwtToken = signToken(user.id);
    await sendRegistrationOutcomeEmail({
      to: reg.email,
      name: reg.name,
      role: reg.role,
      approved: true
    });
    res.json({
      success: true,
      approved: true,
      user: safe,
      blockchainToken: token,
      token: jwtToken,
      message: 'Registration approved'
    });
  } catch (err) {
    console.error('Review error:', err);
    res.status(500).json({ success: false, message: 'Review failed' });
  }
});

router.post('/:id/simulate-review', authenticate, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reg = await prisma.pendingRegistration.findUnique({
      where: { id },
      include: { ghanaCard: true, landDocuments: true }
    });
    if (!reg) {
      res.status(404).json({ success: false, approved: false, reason: 'Registration not found' });
      return;
    }
    if (reg.status !== 'pending') {
      res.status(400).json({ success: false, approved: false, reason: 'Already reviewed' });
      return;
    }
    const hasGhanaCard = !!(
      reg.ghanaCard?.frontCardImage &&
      reg.ghanaCard?.backCardImage &&
      reg.ghanaCard?.faceImage &&
      reg.ghanaCard?.cardNumber &&
      reg.ghanaCard?.fullName
    );
    if (!hasGhanaCard) {
      const reason = 'Ghana Card verification failed';
      await prisma.pendingRegistration.update({ where: { id }, data: { status: 'rejected', rejectionReason: 'Ghana Card verification failed' } });
      await sendRegistrationOutcomeEmail({
        to: reg.email,
        name: reg.name,
        role: reg.role,
        approved: false,
        rejectionReason: reason
      });
      res.json({ approved: false, reason });
      return;
    }
    if (reg.role === 'seller' && (!reg.landDocuments || reg.landDocuments.length < 2)) {
      const reason = 'Land documents required. Sellers must upload Land Title and Survey Plan.';
      await prisma.pendingRegistration.update({ where: { id }, data: { status: 'rejected', rejectionReason: 'Land documents required' } });
      await sendRegistrationOutcomeEmail({
        to: reg.email,
        name: reg.name,
        role: reg.role,
        approved: false,
        rejectionReason: reason
      });
      res.json({ approved: false, reason });
      return;
    }
    if (reg.role === 'admin' && !reg.staffId?.trim()) {
      const reason = 'Staff ID required for admin account verification.';
      await prisma.pendingRegistration.update({ where: { id }, data: { status: 'rejected', rejectionReason: reason } });
      await sendRegistrationOutcomeEmail({
        to: reg.email,
        name: reg.name,
        role: reg.role,
        approved: false,
        rejectionReason: reason
      });
      res.json({ approved: false, reason });
      return;
    }
    if (reg.role === 'arbitrator' && !reg.arbitratorRegNo?.trim()) {
      const reason = 'Arbitrator registration number required for arbitrator account verification.';
      await prisma.pendingRegistration.update({ where: { id }, data: { status: 'rejected', rejectionReason: reason } });
      await sendRegistrationOutcomeEmail({
        to: reg.email,
        name: reg.name,
        role: reg.role,
        approved: false,
        rejectionReason: reason
      });
      res.json({ approved: false, reason });
      return;
    }
    const token = generateBlockchainToken();
    await prisma.pendingRegistration.update({
      where: { id },
      data: { status: 'approved', reviewedAt: new Date(), reviewedById: req.user!.id }
    });
    const user = await prisma.user.create({
      data: {
        name: reg.name,
        email: reg.email,
        phoneNumber: reg.phoneNumber,
        passwordHash: reg.passwordHash,
        role: reg.role,
        organization: reg.organization,
        staffId: reg.staffId,
        arbitratorRegNo: reg.arbitratorRegNo,
        blockchainToken: token,
        verificationStatus: 'verified',
        country: 'GH',
        idVerification: reg.ghanaCard ? JSON.stringify({ ...reg.ghanaCard, status: 'verified' }) : null,
        reputation: { create: { score: 0, totalTransactions: 0, successfulTransactions: 0, disputesWon: 0, communityVotes: 0 } },
        creditScore: { create: { score: 650, rating: 'Fair', paymentHistory: 70, creditUtilization: 45, lengthOfHistory: 60, newCredit: 55, creditMix: 65 } },
        financialProfile: { create: { monthlyIncome: 3500, assets: 50000, liabilities: 15000, netWorth: 35000, bankingHistory: 3 } }
      },
      include: { reputation: true, creditScore: true, financialProfile: true }
    });
    const { passwordHash, ...safe } = user;
    const jwtToken = signToken(user.id);
    await sendRegistrationOutcomeEmail({
      to: reg.email,
      name: reg.name,
      role: reg.role,
      approved: true
    });
    res.json({ approved: true, user: safe, blockchainToken: token, token: jwtToken });
  } catch (err) {
    console.error('Simulate review:', err);
    res.status(500).json({ approved: false, reason: 'Verification failed' });
  }
});

export default router;
