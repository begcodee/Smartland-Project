import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { comparePassword, hashPassword, signToken } from '../utils/auth.js';
import { Role } from '@prisma/client';
import { sendAccountPendingVerificationEmail } from '../services/email.js';

const router = Router();

/** Self-registration — creates user with verificationStatus: pending immediately */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, phoneNumber, role, organization, password, staffId } = req.body;
    if (!name || !email || !phoneNumber || !password || !role) {
      res.status(400).json({ success: false, message: 'Missing required fields: name, email, phoneNumber, password, role' });
      return;
    }
    if (!['buyer', 'seller', 'admin'].includes(String(role))) {
      res.status(400).json({ success: false, message: 'Invalid role. Must be buyer, seller, or admin.' });
      return;
    }
    if (String(role) === 'admin' && !staffId?.trim()) {
      res.status(400).json({ success: false, message: 'Staff ID is required for admin registration.' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
      return;
    }
    const existing = await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } });
    if (existing) {
      res.status(409).json({ success: false, message: 'An account with this email already exists. Please sign in.' });
      return;
    }
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: String(email).toLowerCase().trim(),
        phoneNumber: String(phoneNumber).trim(),
        role: String(role) as Role,
        organization: organization ? String(organization).trim() : null,
        staffId: String(role) === 'admin' ? String(staffId).trim() : null,
        passwordHash,
        verificationStatus: 'pending',
        country: 'GH',
        reputation: { create: { score: 0, totalTransactions: 0, successfulTransactions: 0, disputesWon: 0, communityVotes: 0 } },
        creditScore: { create: { score: 0, rating: 'Fair', paymentHistory: 0, creditUtilization: 0, lengthOfHistory: 0, newCredit: 0, creditMix: 0 } },
        financialProfile: { create: { monthlyIncome: 0, assets: 0, liabilities: 0, netWorth: 0, bankingHistory: 0 } }
      },
      include: { reputation: true, creditScore: true, financialProfile: true }
    });
    const token = signToken(user.id);
    const { passwordHash: _ph, ...safe } = user;
    void sendAccountPendingVerificationEmail(safe.email, safe.name).catch(() => {});
    res.status(201).json({
      success: true,
      token,
      user: safe,
      message:
        'Account created. Ghana Lands Commission and (where applicable) NIA will verify your details — expect an email within 24 to 48 hours.'
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, role, staffId, arbitratorRegNo } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password required' });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase() },
      include: {
        reputation: true,
        creditScore: true,
        financialProfile: true
      }
    });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }
    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }
    const effectiveRole = (role || user.role) as Role;
    if (user.role !== effectiveRole) {
      res.status(400).json({ success: false, message: `No ${effectiveRole} account found. Select correct role.` });
      return;
    }
    if (effectiveRole === 'admin' && user.staffId && staffId !== user.staffId) {
      res.status(401).json({ success: false, message: 'Invalid Staff ID' });
      return;
    }
    if (effectiveRole === 'arbitrator' && user.arbitratorRegNo && arbitratorRegNo !== user.arbitratorRegNo) {
      res.status(401).json({ success: false, message: 'Invalid Arbitrator registration number' });
      return;
    }
    const token = signToken(user.id);
    const { passwordHash, ...safe } = user;
    res.json({
      success: true,
      token,
      user: {
        ...safe,
        reputation: user.reputation,
        creditScore: user.creditScore,
        financialProfile: user.financialProfile
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

router.get('/me', async (req: Request, res: Response) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Token required' });
    return;
  }
  try {
    const jwt = await import('jsonwebtoken');
    const payload = jwt.default.verify(auth.slice(7), process.env.JWT_SECRET || 'dev-secret') as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { reputation: true, creditScore: true, financialProfile: true }
    });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    const { passwordHash, ...safe } = user;
    res.json({ success: true, user: safe });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

export default router;
