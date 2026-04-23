import { ParcelStatus, PaymentStatus, TransferStatus } from '@prisma/client';
import { prisma } from '../db.js';
import { anchorSaleOnChain } from './chainAnchor.js';

type TxResult =
  | { kind: 'missing_payment' }
  | { kind: 'already_done' }
  | { kind: 'failed'; reason: string }
  | { kind: 'fulfilled'; transferId: string; landParcelId: string };

/**
 * After Paystack confirms success: create completed transfer, assign parcel to buyer,
 * then optionally anchor the sale on-chain (registrar wallet — no crypto needed for buyers).
 */
export async function fulfillPaymentAfterSuccess(
  paymentId: string,
  paystackReference: string,
  payload?: unknown
): Promise<{ ok: boolean; reason?: string }> {
  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { id: paymentId } });
    if (!payment) return { kind: 'missing_payment' as const };
    if (payment.status === PaymentStatus.success) return { kind: 'already_done' as const };

    const parcel = await tx.landParcel.findUnique({ where: { id: payment.landParcelId } });
    if (!parcel || parcel.status !== ParcelStatus.available) {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.failed,
          paystackPayload: JSON.stringify({ error: 'parcel_unavailable', detail: payload })
        }
      });
      return { kind: 'failed' as const, reason: 'parcel_unavailable' };
    }
    if (parcel.ownerId !== payment.sellerId) {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.failed,
          paystackPayload: JSON.stringify({ error: 'seller_mismatch', detail: payload })
        }
      });
      return { kind: 'failed' as const, reason: 'seller_mismatch' };
    }

    const transfer = await tx.transfer.create({
      data: {
        landParcelId: payment.landParcelId,
        fromUserId: payment.sellerId,
        toUserId: payment.buyerId,
        amount: payment.amount,
        status: TransferStatus.completed,
        completedDate: new Date(),
        transactionHash: paystackReference
      }
    });

    await tx.landParcel.update({
      where: { id: parcel.id },
      data: { ownerId: payment.buyerId, status: ParcelStatus.sold }
    });

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.success,
        paystackReference,
        transferId: transfer.id,
        paystackPayload:
          typeof payload === 'string' ? payload : payload != null ? JSON.stringify(payload) : undefined
      }
    });

    return {
      kind: 'fulfilled' as const,
      transferId: transfer.id,
      landParcelId: parcel.id
    };
  });

  if (result.kind === 'missing_payment') return { ok: false, reason: 'payment_not_found' };
  if (result.kind === 'already_done') return { ok: true };
  if (result.kind === 'failed') return { ok: false, reason: result.reason };

  void anchorSaleOnChain({
    transferId: result.transferId,
    landParcelId: result.landParcelId,
    paystackReference
  }).catch((err) => console.error('[chain] anchorSaleOnChain:', err));

  return { ok: true };
}
