import express from "express";
import { z } from "zod";
import {
  runProtocolA,
  runProtocolB,
  buildSecurityReport,
  THESIS,
} from "../services/smartlandVerificationProtocols.js";
import { audit } from "../services/audit.js";
import { DASHBOARD_RULES } from "../services/dashboardRules.js";

const router = express.Router();

/**
 * Ghana Card IVS simulation — Protocol A (format + mock ledger) + Protocol B (biometric binding).
 * Thesis framing returned in payload for documentation / UI.
 */
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

  const selfieSource = parsed.data.selfieSource || "upload";

  const protocolA = runProtocolA(parsed.data.cardNumber, parsed.data.fullName);
  const protocolB = runProtocolB(parsed.data.faceImage, parsed.data.frontCardImage, { selfieSource });

  const protocolResults = [protocolA, protocolB];
  const securityReport = buildSecurityReport(protocolResults);

  const biometricMismatch = protocolB.skipped !== true && protocolB.passed === false;
  const flaggedForArbitrator =
    protocolA.passed === false || biometricMismatch;

  const preScreeningPassed =
    protocolA.passed && (protocolB.passed !== false || protocolB.skipped === true);

  const smartlandProtocols = {
    checkedAt: new Date().toISOString(),
    thesisNotes: THESIS,
    protocolA,
    protocolB,
    securityReport,
    overallPrescreenPassed: preScreeningPassed,
    flaggedForArbitrator,
  };

  audit(req, "verify.smartland_protocols", {
    protocolA: protocolA.passed,
    protocolBPassed: protocolB.passed,
    protocolBSkipped: protocolB.skipped,
    biometricMismatch,
    flaggedForArbitrator,
  });

  const referenceId = `IVS_SIM_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;

  return res.status(200).json({
    success: true,
    verified: false,
    preScreeningPassed,
    pendingManualReview: selfieSource === "upload" || protocolB.skipped === true,
    flaggedForArbitrator,
    biometricMismatch,
    referenceId,
    message: flaggedForArbitrator
      ? "Security rules flagged this submission — manual/arbitrator review required."
      : preScreeningPassed
        ? selfieSource === "upload"
          ? "Protocol A/B prescreen stored; upload selfie requires NIA manual review."
          : "Protocol A/B prescreen passed; awaiting NIA decision on live IVS queue."
        : "Verification failed prescreen checks.",
    thesisNotes: THESIS,
    protocolA,
    protocolB,
    securityReport,
    smartlandProtocols,
  });
});

router.get("/dashboard-rules", (_req, res) => {
  res.json({
    success: true,
    thesis:
      "SmartLand exposes a rule matrix per dashboard persona; enforcement is in routes + conflict engine.",
    rules: DASHBOARD_RULES,
  });
});

export default router;
