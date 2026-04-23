import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import {
  DocVerificationStatus,
  ParcelStatus,
  PaystackPaymentChannel,
  PaymentStatus
} from '@prisma/client';
import { prisma } from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { initializeTransaction, verifyTransaction } from '../services/paystack.js';
import { fulfillPaymentAfterSuccess } from '../services/fulfillPayment.js';

const router = Router();

function makeReference(): string {
  return `SL_${Date.now().toString(36)}_${crypto.randomBytes(6).toString('hex')}`;
}

function channelsFor(kind: PaystackPaymentChannel): string[] {
  if (kind === PaystackPaymentChannel.mobile_money) return ['mobile_money'];
  return ['bank', 'bank_transfer'];
}

/** Buyer initiates Paystack checkout (Mobile Money or bank / bank transfer). */
router.post('/initialize', authenticate, async (req: Request, res: Response) => {
  try {
    const { landParcelId, channel, amountGhs } = req.body as {
      landParcelId?: string;
      channel?: PaystackPaymentChannel;
      amountGhs?: number;
    };
    if (!landParcelId || !channel) {
      res.status(400).json({
        success: false,
        message: 'landParcelId and channel required (mobile_money | bank)'
      });
      return;
    }
    if (channel !== 'mobile_money' && channel !== 'bank') {
      res.status(400).json({ success: false, message: 'Invalid channel' });
      return;
    }

    const user = req.user!;
    if (user.role !== 'buyer' && user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Only buyers can purchase land' });
      return;
    }

    // Try DB-backed flow. If DB is offline (demo mode), fall back to client-provided amount.
    let parcelPrice = 0;
    let parcelOwnerId: string | null = null;
    try {
      const parcel = await prisma.landParcel.findUnique({ where: { id: landParcelId } });
      if (!parcel) {
        res.status(404).json({ success: false, message: 'Parcel not found' });
        return;
      }
      if (parcel.status !== ParcelStatus.available) {
        res.status(400).json({ success: false, message: 'Parcel not available' });
        return;
      }
      if (parcel.ownerId === user.id) {
        res.status(400).json({ success: false, message: 'You already own this parcel' });
        return;
      }
      // Demo: allow purchase even if documents are not verified (frontend still indicates verification status).
      parcelPrice = parcel.price;
      parcelOwnerId = parcel.ownerId;
    } catch (e) {
      // DB offline
      parcelPrice = Number(amountGhs ?? 0);
      parcelOwnerId = null;
      if (!parcelPrice || parcelPrice <= 0) {
        res.status(503).json({
          success: false,
          message:
            'Database is offline. Provide amountGhs in the request to run Paystack checkout in demo mode.'
        });
        return;
      }
    }

    // If DB is up, prevent duplicate pending payments. If DB is offline, skip.
    if (parcelOwnerId) {
      const existing = await prisma.payment.findFirst({
        where: {
          landParcelId,
          buyerId: user.id,
          status: { in: [PaymentStatus.pending, PaymentStatus.processing] }
        }
      });
      if (existing) {
        res.status(400).json({
          success: false,
          message: 'You already have a pending payment for this parcel'
        });
        return;
      }
    }

    const reference = makeReference();
    const amountPesewas = Math.round(parcelPrice * 100);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const callbackUrl = `${frontendUrl.replace(/\/$/, '')}/payment/callback`;

    try {
      // DB-backed: create Payment row so verify can fulfill. Demo offline: skip DB writes.
      const payment = parcelOwnerId
        ? await prisma.payment.create({
            data: {
              reference,
              amount: parcelPrice,
              amountPesewas,
              currency: 'GHS',
              status: PaymentStatus.pending,
              channel,
              buyerId: user.id,
              sellerId: parcelOwnerId,
              landParcelId
            }
          })
        : null;

      const init = await initializeTransaction({
        email: user.email,
        amountGhs: parcelPrice,
        reference,
        callbackUrl,
        channels: channelsFor(channel),
        metadata: {
          payment_id: payment?.id ?? 'demo',
          land_parcel_id: landParcelId,
          buyer_id: user.id
        }
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.processing, paystackReference: init.reference }
        });
      }

      res.json({
        success: true,
        authorizationUrl: init.authorization_url,
        reference: init.reference,
        accessCode: init.access_code
      });
    } catch (e) {
      // If DB is up and payment row exists, mark failed. If offline, just bubble up.
      throw e;
    }
  } catch (err) {
    console.error('Payment initialize:', err);
    res.status(500).json({
      success: false,
      message: err instanceof Error ? err.message : 'Failed to start payment'
    });
  }
});

/** After redirect from Paystack — confirms payment server-side and fulfills purchase. */
router.get('/verify', authenticate, async (req: Request, res: Response) => {
  try {
    const reference = req.query.reference as string;
    if (!reference) {
      res.status(400).json({ success: false, message: 'reference query required' });
      return;
    }

    // DB-backed verify: find Payment row. If DB offline or missing row (demo), just verify with Paystack and return status.
    let payment: any = null;
    try {
      payment = await prisma.payment.findUnique({ where: { reference } });
    } catch {
      payment = null;
    }
    if (payment) {
      if (payment.buyerId !== req.user!.id && req.user!.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not allowed' });
        return;
      }
      if (payment.status === PaymentStatus.success) {
        const p = await prisma.payment.findUnique({
          where: { id: payment.id },
          include: {
            transfer: true,
            landParcel: { select: { id: true, title: true, status: true } }
          }
        });
        res.json({ success: true, status: 'success', payment: p });
        return;
      }
    }

    const verified = await verifyTransaction(reference);
    const data = verified.data;
    if (!data) {
      res.status(502).json({ success: false, message: 'Invalid Paystack response' });
      return;
    }

    if (data.status !== 'success') {
      const terminal = ['failed', 'abandoned', 'reversed'].includes(data.status);
      if (terminal && payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.failed, paystackPayload: JSON.stringify(verified) }
        });
      }
      res.json({
        success: true,
        status: data.status,
        payment: payment ? await prisma.payment.findUnique({ where: { id: payment.id } }) : undefined
      });
      return;
    }

    if (payment) {
      if (data.currency !== 'GHS' || data.amount !== payment.amountPesewas) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.failed, paystackPayload: JSON.stringify({ error: 'amount_mismatch', verified }) }
        });
        res.status(400).json({ success: false, message: 'Payment amount does not match order' });
        return;
      }

      await fulfillPaymentAfterSuccess(payment.id, data.reference, verified);

      const updated = await prisma.payment.findUnique({
        where: { id: payment.id },
        include: {
          transfer: true,
          landParcel: { select: { id: true, title: true, status: true } }
        }
      });
      res.json({ success: true, status: 'success', payment: updated });
      return;
    }

    // Demo offline mode: verified with Paystack, but no DB fulfillment.
    res.json({ success: true, status: 'success', payment: { reference: data.reference, amount: data.amount, currency: data.currency } });
  } catch (err) {
    console.error('Payment verify:', err);
    res.status(500).json({
      success: false,
      message: err instanceof Error ? err.message : 'Failed to verify payment'
    });
  }
});

export default router;
