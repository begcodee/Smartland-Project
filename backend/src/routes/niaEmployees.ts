import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  EmployeeVerificationDecision,
  EmployeeVerificationStep,
  NIAVerificationStatus,
} from '@prisma/client';
import { isValidGhanaCardFormat, normalizeGhanaCardNumber, validateFullNameOnCard } from '../utils/ghanaCard.js';

const router = Router();

function demoBiometricHash(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Step 1–5 demo verification for NIA employees (no real DB):
 * - Card auth: Ghana Card format + “visual authenticity” simulated
 * - Biometric match: compare demo hash against stored employee biometricRef
 * - HR validation: check employee exists, active, dept/role
 */
router.post('/verify-employee', authenticate, requireRole('nia'), async (req: Request, res: Response) => {
  try {
    const {
      staffId,
      ghanaCardNumber,
      fullNameOnCard,
      biometricSample,
    } = req.body as {
      staffId?: string;
      ghanaCardNumber?: string;
      fullNameOnCard?: string;
      biometricSample?: string;
    };

    if (!staffId?.trim() || !ghanaCardNumber?.trim()) {
      res.status(400).json({ success: false, message: 'staffId and ghanaCardNumber are required' });
      return;
    }

    const normalizedCard = normalizeGhanaCardNumber(ghanaCardNumber);
    const attempt = await prisma.employeeVerificationAttempt.create({
      data: {
        niaOfficerId: req.user!.id,
        staffId: staffId.trim(),
        ghanaCardNumber: normalizedCard,
        stepReached: EmployeeVerificationStep.employee_identification
      }
    });

    // Step 2 — Card Authentication (demo)
    if (!isValidGhanaCardFormat(normalizedCard)) {
      const updated = await prisma.employeeVerificationAttempt.update({
        where: { id: attempt.id },
        data: {
          stepReached: EmployeeVerificationStep.card_authentication,
          decision: EmployeeVerificationDecision.denied,
          flaggedReason: 'Invalid Ghana Card format',
          details: JSON.stringify({ step: 2, reason: 'format', expected: 'GHA-123456789-1' })
        }
      });
      res.json({ success: true, decision: updated.decision, attempt: updated });
      return;
    }
    if (fullNameOnCard && !validateFullNameOnCard(fullNameOnCard)) {
      const updated = await prisma.employeeVerificationAttempt.update({
        where: { id: attempt.id },
        data: {
          stepReached: EmployeeVerificationStep.card_authentication,
          decision: EmployeeVerificationDecision.flagged,
          flaggedReason: 'Name on card looks invalid',
          details: JSON.stringify({ step: 2, reason: 'name_on_card' })
        }
      });
      res.json({ success: true, decision: updated.decision, attempt: updated });
      return;
    }

    // Step 4 — Internal Staff Validation (demo HR list)
    const employee = await prisma.nIAEmployee.findUnique({ where: { staffId: staffId.trim() } });
    if (!employee) {
      const updated = await prisma.employeeVerificationAttempt.update({
        where: { id: attempt.id },
        data: {
          stepReached: EmployeeVerificationStep.internal_staff_validation,
          decision: EmployeeVerificationDecision.denied,
          flaggedReason: 'Staff ID not found in active staff list',
          details: JSON.stringify({ step: 4, reason: 'staff_not_found' })
        }
      });
      res.json({ success: true, decision: updated.decision, attempt: updated });
      return;
    }
    if (!employee.active) {
      const updated = await prisma.employeeVerificationAttempt.update({
        where: { id: attempt.id },
        data: {
          employeeId: employee.id,
          stepReached: EmployeeVerificationStep.internal_staff_validation,
          decision: EmployeeVerificationDecision.denied,
          flaggedReason: 'Employee is not active',
          details: JSON.stringify({ step: 4, reason: 'inactive' })
        }
      });
      res.json({ success: true, decision: updated.decision, attempt: updated });
      return;
    }

    // Step 3 — Biometric Match (demo)
    if (!biometricSample?.trim()) {
      const updated = await prisma.employeeVerificationAttempt.update({
        where: { id: attempt.id },
        data: {
          employeeId: employee.id,
          stepReached: EmployeeVerificationStep.biometric_match,
          decision: EmployeeVerificationDecision.flagged,
          flaggedReason: 'Biometric sample missing',
          details: JSON.stringify({ step: 3, reason: 'missing_biometric' })
        }
      });
      res.json({ success: true, decision: updated.decision, attempt: updated });
      return;
    }

    const sampleHash = demoBiometricHash(biometricSample.trim());
    const match = sampleHash === employee.biometricRef;

    if (!match) {
      const updated = await prisma.employeeVerificationAttempt.update({
        where: { id: attempt.id },
        data: {
          employeeId: employee.id,
          stepReached: EmployeeVerificationStep.biometric_match,
          decision: EmployeeVerificationDecision.denied,
          flaggedReason: 'Biometric mismatch',
          details: JSON.stringify({ step: 3, reason: 'mismatch' })
        }
      });
      res.json({ success: true, decision: updated.decision, attempt: updated });
      return;
    }

    // Cross-check card number against record (demo “chip data consistency”)
    if (employee.ghanaCardNumber !== normalizedCard) {
      const updated = await prisma.employeeVerificationAttempt.update({
        where: { id: attempt.id },
        data: {
          employeeId: employee.id,
          stepReached: EmployeeVerificationStep.card_authentication,
          decision: EmployeeVerificationDecision.flagged,
          flaggedReason: 'Card number does not match staff record',
          details: JSON.stringify({ step: 2, reason: 'card_mismatch' })
        }
      });
      res.json({ success: true, decision: updated.decision, attempt: updated });
      return;
    }

    // Step 5 — Access Decision
    const updated = await prisma.employeeVerificationAttempt.update({
      where: { id: attempt.id },
      data: {
        employeeId: employee.id,
        stepReached: EmployeeVerificationStep.access_decision,
        decision: EmployeeVerificationDecision.granted,
        details: JSON.stringify({
          step: 5,
          granted: true,
          staff: { staffId: employee.staffId, dept: employee.department, roleTitle: employee.roleTitle }
        })
      }
    });

    res.json({ success: true, decision: updated.decision, attempt: updated });
  } catch (err) {
    console.error('Verify employee:', err);
    res.status(500).json({ success: false, message: 'Employee verification failed' });
  }
});

/** NIA: recent employee verification attempts */
router.get('/attempts', authenticate, requireRole('nia'), async (req: Request, res: Response) => {
  try {
    const attempts = await prisma.employeeVerificationAttempt.findMany({
      where: { niaOfficerId: req.user!.id },
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json({ success: true, attempts });
  } catch (err) {
    console.error('List attempts:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch attempts' });
  }
});

/** NIA: demo staff list */
router.get('/staff', authenticate, requireRole('nia'), async (_req: Request, res: Response) => {
  try {
    const staff = await prisma.nIAEmployee.findMany({
      orderBy: { fullName: 'asc' },
      take: 100
    });
    res.json({ success: true, staff });
  } catch (err) {
    console.error('List staff:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch staff list' });
  }
});

export default router;

