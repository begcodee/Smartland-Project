import express from "express";
import { z } from "zod";
import {
  isValidGhanaCardFormat,
  normalizeGhanaCardNumber,
  isObviouslyFakeGhanaCard,
  validateFullNameOnCard,
} from "../utils/ghanaCard.js";
import { audit } from "../services/audit.js";

const router = express.Router();

router.post("/ghana-card", (req, res) => {
  const parsed = z
    .object({
      cardNumber: z.string().min(1),
      fullName: z.string().min(1),
      frontCardImage: z.string().min(1),
      backCardImage: z.string().min(1),
      faceImage: z.string().min(1),
      selfieSource: z.enum(["live_camera", "upload"]).optional(),
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Invalid payload" });
  }

  const cardNumber = normalizeGhanaCardNumber(parsed.data.cardNumber);
  if (!isValidGhanaCardFormat(cardNumber)) {
    audit(req, "verify.ghana_card.prescreen", { ok: false, reason: "format_invalid" });
    return res.status(200).json({
      success: true,
      verified: false,
      preScreeningPassed: false,
      message: "Invalid Ghana Card number format",
    });
  }

  if (isObviouslyFakeGhanaCard(cardNumber)) {
    audit(req, "verify.ghana_card.prescreen", { ok: false, reason: "obviously_fake" });
    return res.status(200).json({
      success: true,
      verified: false,
      preScreeningPassed: false,
      message: "Ghana Card number failed structural checks",
    });
  }

  if (!validateFullNameOnCard(parsed.data.fullName)) {
    audit(req, "verify.ghana_card.prescreen", { ok: false, reason: "name_invalid" });
    return res.status(200).json({
      success: true,
      verified: false,
      preScreeningPassed: false,
      message: "Full name must match the name on the card (at least first + last name).",
    });
  }

  const selfieSource = parsed.data.selfieSource || "upload";
  if (selfieSource === "upload") {
    audit(req, "verify.ghana_card.prescreen", { ok: true, selfieSource, decision: "manual_review" });
    // Never auto-verify uploads (manual review required)
    return res.status(200).json({
      success: true,
      verified: false,
      preScreeningPassed: true,
      pendingManualReview: true,
      referenceId: `NIA_PRE_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`,
      message: "Submitted for manual review (24–48 hours).",
    });
  }

  audit(req, "verify.ghana_card.prescreen", { ok: true, selfieSource, decision: "await_nia" });
  // Live camera: prescreen passes, still no auto-verify (NIA decision required)
  return res.status(200).json({
    success: true,
    verified: false,
    preScreeningPassed: true,
    pendingManualReview: false,
    referenceId: `NIA_PRE_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`,
    message: "Pre-screening passed. Awaiting NIA verification (24–48 hours).",
  });
});

export default router;

