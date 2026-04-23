import { Request, Response } from 'express';
import crypto from 'crypto';
import { PaymentStatus } from '@prisma/client';
import { prisma } from '../db.js';
import { verifyTransaction } from '../services/paystack.js';
import { fulfillPaymentAfterSuccess } from '../services/fulfillPayment.js';

/**
 * Paystack webhook — body must be raw Buffer (see server.ts).
 * Validates `x-paystack-signature` (HMAC SHA512 of body with secret key).
 */
export async function handlePaystackWebhook(req: Request, res: Response): Promise<void> {
  const signature = req.headers['x-paystack-signature'] as string | undefined;
  const raw = req.body as Buffer;
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    res.status(500).send('missing secret');
    return;
  }

  const hash = crypto.createHmac('sha512', secret).update(raw).digest('hex');
  if (hash !== signature) {
    res.status(400).send('invalid signature');
    return;
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(raw.toString('utf8'));
  } catch {
    res.status(400).send('bad json');
    return;
  }

  try {
    if (event.event === 'charge.success' && event.data?.reference) {
      const ref = event.data.reference;
      const payment = await prisma.payment.findUnique({ where: { reference: ref } });
      if (payment && payment.status !== PaymentStatus.success) {
        const verified = await verifyTransaction(ref);
        const d = verified.data;
        if (
          d?.status === 'success' &&
          d.currency === 'GHS' &&
          d.amount === payment.amountPesewas
        ) {
          await fulfillPaymentAfterSuccess(payment.id, d.reference, verified);
        }
      }
    }
  } catch (e) {
    console.error('Paystack webhook processing error:', e);
  }

  res.status(200).json({ received: true });
}
