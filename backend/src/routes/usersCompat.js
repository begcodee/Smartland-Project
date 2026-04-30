import express from "express";
import { authenticate, requireRole } from "../auth.js";
import { seedIfEmpty, store, publicUser } from "../store.js";
import { z } from "zod";
import { computeRiskScore } from "../services/risk.js";
import { audit } from "../services/audit.js";
import { createNotification } from "./notifications.js";
import { getSmartlandProtocols } from "../services/sellerProtocolGate.js";

const router = express.Router();

function estimateDataUrlBytes(dataUrl) {
  const s = String(dataUrl || "");
  const comma = s.indexOf(",");
  if (comma === -1) return null;
  const b64 = s.slice(comma + 1).trim();
  if (!b64) return 0;
  const pad = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  return Math.floor((b64.length * 3) / 4) - pad;
}

router.get("/", authenticate, requireRole("lands_commission", "admin", "nia"), (_req, res) => {
  seedIfEmpty();
  res.json({ success: true, users: Array.from(store.users.values()).map(publicUser) });
});

router.get("/pending", authenticate, requireRole("lands_commission", "admin"), (_req, res) => {
  seedIfEmpty();
  const pending = Array.from(store.users.values())
    .filter((u) => !u.verified)
    .map(publicUser);
  res.json({ success: true, users: pending });
});

// Update my profile / save verification payload
router.patch("/me", authenticate, (req, res) => {
  seedIfEmpty();
  const me = store.users.get(req.user.id);
  if (!me) return res.status(404).json({ error: "User not found" });

  const parsed = z
    .object({ idVerification: z.unknown().optional() })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  if (parsed.data.idVerification !== undefined) {
    me.idVerification = parsed.data.idVerification;
    me.niaStatus = "pending";

    // Document-size mismatch flagging (declared size vs actual dataUrl size)
    try {
      const docs = me.idVerification?.landDocuments;
      if (Array.isArray(docs) && docs.length) {
        const flags = [];
        for (const d of docs) {
          const declared = Number(d?.size);
          const actual = estimateDataUrlBytes(d?.scannedImage);
          if (!Number.isFinite(declared) || declared <= 0 || actual === null) continue;
          const diff = Math.abs(actual - declared);
          const tol = Math.max(1024, declared * 0.1); // 10% or 1KB
          if (diff > tol) {
            flags.push({
              name: d?.name || d?.type || "document",
              declaredBytes: declared,
              actualBytes: actual,
            });
          }
        }
        me.documentSizeFlags = flags;
        if (flags.length) me.idVerificationRiskFlag = me.idVerificationRiskFlag || "document_size_mismatch";
      }
    } catch {
      // ignore
    }

    // Uniqueness check (flag if Ghana Card already linked elsewhere)
    const gh = me.idVerification?.ghanaCard?.cardNumber || me.idVerification?.cardNumber;
    if (gh) {
      const normalized = String(gh).trim().toUpperCase();
      const dup = Array.from(store.users.values()).find(
        (u) => u.id !== me.id && String(u.idVerification?.ghanaCard?.cardNumber || u.idVerification?.cardNumber || "")
          .trim()
          .toUpperCase() === normalized
      );
      if (dup) {
        me.idVerificationRiskFlag = "ghana_card_duplicate";
      }
    }

    // Compute risk score snapshot (demo “KYC pipeline”)
    const userInput = {
      fullName: me.idVerification?.ghanaCard?.fullName || me.idVerification?.fullName,
      dob: me.idVerification?.dob,
      ghanaCardNumber: me.idVerification?.ghanaCard?.cardNumber || me.idVerification?.cardNumber,
    };
    const idwise = me.idVerification?.idwise || {};
    const risk = computeRiskScore({
      user: userInput,
      idwise,
      failedAttempts: me.failedVerificationAttempts || 0,
    });
    me.riskScore = risk.score;
    me.riskReasons = risk.reasons;
    me.submissionAllowed = risk.allow && me.idVerificationRiskFlag !== "ghana_card_duplicate";

    audit(req, "user.id_verification.saved", {
      niaStatus: me.niaStatus,
      riskScore: me.riskScore,
      submissionAllowed: me.submissionAllowed,
      flag: me.idVerificationRiskFlag || null,
      documentSizeFlags: me.documentSizeFlags || [],
    });

    const sp = getSmartlandProtocols(me);
    const pb = sp?.protocolB;
    if (pb && pb.skipped !== true && pb.passed === false && !me.biometricArbitratorNotified) {
      me.biometricArbitratorNotified = true;
      for (const u of Array.from(store.users.values())) {
        if (u.role !== "arbitrator") continue;
        createNotification({
          userId: u.id,
          type: "red_flag",
          category: "arbitration",
          title: "Identity theft review — biometric mismatch",
          message: `${me.name} (${me.email}) failed Protocol B (similarity ${pb.similarity ?? "?"} < threshold ${pb.threshold ?? "?"}).`,
          actionUrl: "/arbitrator",
        });
      }
      audit(req, "protocol.b.arbitrator_escalation", { userId: me.id, similarity: pb.similarity });
    }
  }

  res.json({ success: true, user: publicUser(me) });
});

// Lands Commission admin approval (blocked until NIA verified)
router.patch("/:id/verify", authenticate, requireRole("lands_commission", "admin"), (req, res) => {
  seedIfEmpty();
  const target = store.users.get(req.params.id);
  if (!target) return res.status(404).json({ error: "User not found" });

  const parsed = z
    .object({
      action: z.enum(["approve", "reject"]).optional(),
      rejectionReason: z.string().max(500).optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const action = parsed.data.action || "approve";

  if (target.niaStatus !== "verified") {
    audit(req, "lands.verify_user.blocked", { targetUserId: target.id, niaStatus: target.niaStatus });
    return res.status(400).json({
      error: "User cannot be approved until NIA verification is successful",
      niaStatus: target.niaStatus,
    });
  }

  if (action === "reject") {
    target.verified = false;
    target.rejectionReason = parsed.data.rejectionReason || "Rejected by Lands Commission";
    createNotification({
      userId: target.id,
      type: "error",
      category: "verification",
      title: "Lands Commission verification rejected",
      message: `Your account verification was rejected by the Lands Commission. Reason: ${target.rejectionReason}`,
      actionUrl: "/",
    });
    audit(req, "lands.verify_user.rejected", { targetUserId: target.id, reason: target.rejectionReason });
    return res.json({ success: true, user: publicUser(target) });
  }

  target.verified = true;
  createNotification({
    userId: target.id,
    type: "success",
    category: "verification",
    title: "Lands Commission verification approved",
    message:
      "Your account has been approved by the Lands Commission. You can now access full SmartLand features.",
    actionUrl:
      target.role === "seller"
        ? "/seller"
        : target.role === "buyer"
          ? "/buyer"
          : target.role === "arbitrator"
            ? "/arbitrator"
            : "/",
  });
  audit(req, "lands.verify_user.approved", { targetUserId: target.id });
  res.json({ success: true, user: publicUser(target) });
});

export default router;

