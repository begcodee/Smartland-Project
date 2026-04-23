import express from "express";
import { authenticate, requireRole } from "../auth.js";
import { seedIfEmpty, store, safeParcel } from "../store.js";
import { audit } from "../services/audit.js";
import {
  polygonBbox,
  bboxArea,
  bboxIntersectionArea,
  geoFingerprint,
  polygonOverlapRatio,
  polygonAreaSqm,
  conflictRiskFromOverlap,
} from "../services/geo.js";

const router = express.Router();

router.get("/", (_req, res) => {
  seedIfEmpty();
  const parcels = Array.from(store.parcels.values()).map(safeParcel);
  res.json(parcels);
});

router.post("/", authenticate, requireRole("seller", "lands_commission", "admin"), (req, res) => {
  seedIfEmpty();
  const actor = store.users.get(req.user.id);
  // Parcel submission gate (KYC/risk must allow)
  if (actor?.role === "seller") {
    if (!actor.submissionAllowed) {
      audit(req, "parcel.create.blocked", {
        reason: "submission_not_allowed",
        riskScore: actor.riskScore ?? null,
        flag: actor.idVerificationRiskFlag ?? null,
      });
      return res.status(403).json({
        success: false,
        message: "Parcel submission blocked: identity verification/risk review required.",
        riskScore: actor.riskScore ?? null,
        flag: actor.idVerificationRiskFlag ?? null,
      });
    }
  }

  const { title, location, priceGhs, size, boundaryPolygon, areaSqm, areaSqft } = req.body || {};
  if (!title || !location || !priceGhs) {
    return res.status(400).json({ error: "Missing title, location, or priceGhs" });
  }

  // Conflict prevention: compute geo fingerprint + overlap risk (demo uses bbox overlap)
  let bbox = null;
  let fingerprint = null;
  let geoAreaSqm = null;
  let conflictRisk = { level: "medium", action: "review" };
  let overlapReport = null;

  if (boundaryPolygon) {
    bbox = polygonBbox(boundaryPolygon);
    if (bbox) {
      fingerprint = geoFingerprint(boundaryPolygon);
      geoAreaSqm = polygonAreaSqm(boundaryPolygon);

      const existing = Array.from(store.parcels.values()).filter((p) => p.bbox);
      let worst = { overlapRatio: 0, withParcelId: null };
      for (const p of existing) {
        // Fast bbox overlap estimate
        const a = bboxArea(bbox);
        const b = bboxArea(p.bbox);
        const inter = bboxIntersectionArea(bbox, p.bbox);
        const denom = Math.max(1e-12, Math.min(a, b));
        const bboxRatio = inter / denom;
        if (bboxRatio <= 0) continue;

        // Precise polygon overlap when both have boundary polygons
        let ratio = bboxRatio;
        if (p.boundaryPolygon) {
          const polyRatio = polygonOverlapRatio(boundaryPolygon, p.boundaryPolygon);
          if (typeof polyRatio === "number") ratio = polyRatio;
        }

        if (ratio > worst.overlapRatio) worst = { overlapRatio: ratio, withParcelId: p.id };
      }
      conflictRisk = conflictRiskFromOverlap(worst.overlapRatio);
      overlapReport = worst.withParcelId
        ? { overlapRatio: worst.overlapRatio, withParcelId: worst.withParcelId }
        : { overlapRatio: 0, withParcelId: null };

      if (conflictRisk.action === "block") {
        audit(req, "parcel.create.blocked", {
          reason: "boundary_overlap_high",
          overlap: overlapReport,
        });
        return res.status(409).json({
          success: false,
          message: "Parcel boundary overlaps an existing registered parcel. Manual verification required.",
          conflictRisk,
          overlap: overlapReport,
        });
      }
    }
  }

  const id = `parcel_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
  const parcel = {
    id,
    title: String(title),
    location: String(location),
    priceGhs: Number(priceGhs),
    size: size ? String(size) : null,
    areaSqm: typeof areaSqm === "number" ? areaSqm : typeof areaSqft === "number" ? Math.round(areaSqft / 10.7639104167) : null,
    areaSqft: typeof areaSqft === "number" ? areaSqft : typeof areaSqm === "number" ? Math.round(areaSqm * 10.7639104167) : null,
    geoAreaSqm,
    status: "available",
    sellerId: req.user.id,
    createdAt: new Date().toISOString(),
    transfers: [],
    boundaryPolygon: boundaryPolygon || null,
    bbox,
    geoFingerprint: fingerprint,
    conflictRisk,
    overlap: overlapReport,
  };
  store.parcels.set(parcel.id, parcel);
  audit(req, "parcel.created", {
    parcelId: parcel.id,
    geoFingerprint: fingerprint,
    conflictRisk,
    overlap: overlapReport,
  });
  res.status(201).json(safeParcel(parcel));
});

export default router;

