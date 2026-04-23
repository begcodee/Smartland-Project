import express from "express";
import { authenticate } from "../auth.js";
import { seedIfEmpty, store } from "../store.js";
import { initializeTransaction, verifyTransaction } from "../services/paystack.js";
import { anchorSaleOnChain } from "../services/chainAnchor.js";
import { z } from "zod";
import { LandConflictEngine } from "../services/landConflictEngine.js";
import { audit } from "../services/audit.js";

const router = express.Router();

function toPesewas(amountGhs) {
  const n = Number(amountGhs);
  if (!Number.isFinite(n) || n <= 0) throw new Error("Invalid amountGhs");
  return Math.round(n * 100);
}

router.post("/initialize", authenticate, async (req, res) => {
  seedIfEmpty();

  const parsed = z
    .object({
      parcelId: z.string().min(1).optional(),
      landParcelId: z.string().min(1).optional(),
      amountGhs: z.number().positive().optional(),
      channel: z.enum(["mobile_money", "bank"]).optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });
  const parcelId = parsed.data.parcelId ?? parsed.data.landParcelId;
  const { amountGhs, channel } = parsed.data;
  if (!parcelId) return res.status(400).json({ error: "landParcelId is required" });

  const parcel = store.parcels.get(parcelId);
  if (!parcel) return res.status(404).json({ error: "Parcel not found" });

  // Conflict-prevention engine (pre-dispute layer): evaluate BEFORE locking/checkout
  const engine = new LandConflictEngine(store);
  const evaluation = await engine.evaluateTransaction({
    parcel_id: parcelId,
    seller_id: parcel.sellerId,
    buyer_id: req.user.id,
    geo_polygon: parcel.boundaryPolygon || null,
    title_chain: parcel.transfers || [],
    transaction_type: "sale",
  });

  audit(req, "conflict_engine.evaluate", {
    parcelId,
    result: evaluation,
  });

  if (evaluation.decision === "BLOCK") {
    return res.status(409).json({
      success: false,
      message: "Transaction blocked due to land conflict risk.",
      conflict: evaluation,
    });
  }

  if (evaluation.decision === "REVIEW") {
    return res.status(409).json({
      success: false,
      message: "Transaction requires manual review due to conflict risk.",
      conflict: evaluation,
    });
  }
  const now = Date.now();
  if (parcel.lockedUntil && now < parcel.lockedUntil) {
    return res.status(409).json({ error: "Parcel is locked for another transaction. Try again shortly." });
  }
  if (parcel.status !== "available") {
    return res.status(400).json({ error: "Parcel is not available" });
  }

  // Transaction locking mechanism (prevents parallel/double sale)
  const lockMs = Number(process.env.TRANSACTION_LOCK_MS || 15 * 60_000);
  parcel.status = "locked_for_transaction";
  parcel.lockedUntil = now + lockMs;

  const amount = amountGhs ?? parcel.priceGhs;
  let amountPesewas;
  try {
    amountPesewas = toPesewas(amount);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  const channels =
    channel === "bank"
      ? ["bank", "card"]
      : channel === "mobile_money"
        ? ["mobile_money", "ussd"]
        : ["mobile_money", "ussd", "bank", "card"];

  const metadata = {
    parcelId: String(parcelId),
    buyerId: String(req.user.id),
  };

  try {
    const callback_url =
      process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/payment/callback` : undefined;

    const data = await initializeTransaction({
      email: req.user.email,
      amountPesewas,
      currency: "GHS",
      channels,
      metadata,
      callback_url,
    });

    const payment = {
      reference: data.reference,
      status: "pending",
      parcelId: String(parcelId),
      buyerId: String(req.user.id),
      amountPesewas,
      currency: "GHS",
      createdAt: new Date().toISOString(),
    };
    store.payments.set(payment.reference, payment);

    res.json({
      success: true,
      reference: data.reference,
      authorizationUrl: data.authorization_url,
      accessCode: data.access_code,
    });
  } catch (e) {
    // Demo fallback when Paystack isn't configured
    if (!process.env.PAYSTACK_SECRET_KEY) {
      const reference = `DEMO_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
      store.payments.set(reference, {
        reference,
        status: "success",
        parcelId: String(parcelId),
        buyerId: String(req.user.id),
        amountPesewas,
        currency: "GHS",
        createdAt: new Date().toISOString(),
        demo: true,
      });
      // In demo mode, treat as immediate success; keep lock short and let verify finalize.
      return res.json({
        success: true,
        reference,
        authorizationUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/payment/callback?reference=${reference}`,
        accessCode: reference,
        demo: true,
      });
    }
    res.status(500).json({ error: e.message || "Failed to initialize payment" });
  }
});

router.get("/verify", authenticate, async (req, res) => {
  seedIfEmpty();

  const reference = z.string().min(1).safeParse(req.query.reference);
  if (!reference.success) return res.status(400).json({ error: "reference is required" });
  const ref = reference.data;

  const existing = store.payments.get(ref);
  if (!existing) return res.status(404).json({ error: "Payment not found" });

  try {
    let verified;
    if (existing.demo) {
      verified = { status: "success", reference: ref };
    } else {
      verified = await verifyTransaction(ref);
    }

    const status = verified.status;
    if (status === "success") {
      existing.status = "success";
      existing.verifiedAt = new Date().toISOString();

      const parcel = store.parcels.get(existing.parcelId);
      let transferCreatedOrFound = null;
      if (parcel && (parcel.status === "available" || parcel.status === "locked_for_transaction")) {
        parcel.status = "sold";
        parcel.lockedUntil = null;
        const transferId = `transfer_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
        const transfer = {
          id: transferId,
          parcelId: parcel.id,
          sellerId: parcel.sellerId,
          buyerId: existing.buyerId,
          paystackReference: ref,
          createdAt: new Date().toISOString(),
          status: "completed",
          chainTxHash: null,
          chainNetwork: null,
          chainSaleId: null,
          chainAnchoredAt: null,
        };
        store.transfers.set(transfer.id, transfer);
        parcel.transfers = [...(parcel.transfers || []), transfer];
        transferCreatedOrFound = transfer;

        // Anchor on-chain asynchronously (fiat first; chain is proof)
        anchorSaleOnChain({
          transfer,
          parcelId: parcel.id,
          paystackReference: ref,
        })
          .then((anchored) => {
            if (anchored?.skipped) return;
            const updated = { ...transfer, ...anchored };
            store.transfers.set(transfer.id, updated);
            parcel.transfers = (parcel.transfers || []).map((t) =>
              t.id === transfer.id ? updated : t
            );
          })
          .catch((err) => {
            console.warn("[chain] anchor failed", err?.message || err);
          });
      } else {
        // If already finalized earlier, return the most recent transfer for this reference (if any)
        const maybe = Array.from(store.transfers.values()).find((t) => t.paystackReference === ref);
        if (maybe) transferCreatedOrFound = maybe;
      }
    } else if (status === "failed" || status === "abandoned") {
      existing.status = "failed";
      const parcel = store.parcels.get(existing.parcelId);
      if (parcel && parcel.status === "locked_for_transaction") {
        parcel.status = "available";
        parcel.lockedUntil = null;
      }
    }

    res.json({
      success: true,
      status: existing.status,
      payment: {
        reference: ref,
        status: existing.status,
        landParcelId: existing.parcelId,
        buyerId: existing.buyerId,
        amountPesewas: existing.amountPesewas,
        currency: existing.currency,
      },
      transfer: transferCreatedOrFound,
    });
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed to verify payment" });
  }
});

export default router;

