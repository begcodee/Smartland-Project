/**
 * NIA (National Identification Authority) Ghana Card verification.
 * Uses IVSP (Identity Verification System Platform) when configured.
 * See: https://nia.gov.gh/service/verification-services/
 * Onboarding: idverification@nia.gov.gh
 */

import { isValidGhanaCardFormat, normalizeGhanaCardNumber, validateFullNameOnCard } from '../utils/ghanaCard.js';

export interface NIAVerifyRequest {
  cardNumber: string;
  fullName: string;
  /** Base64 data URL (e.g. data:image/jpeg;base64,...) */
  frontCardImage: string;
  backCardImage: string;
  faceImage: string;
  /** live_camera = in-app capture; upload = file chosen — uploads always need manual review */
  selfieSource?: 'live_camera' | 'upload';
}

export interface NIAVerifyResponse {
  success: boolean;
  /** True only when NIA confirms identity (or admin approves off-line) */
  verified?: boolean;
  /** Match score 0-100 when facial comparison is done */
  faceMatchScore?: number;
  /** NIA reference / transaction ID */
  referenceId?: string;
  message: string;
  /** Uploaded selfie — must be reviewed by staff; never auto-verified here */
  pendingManualReview?: boolean;
  /** Live capture passed format + presence checks only (not a substitute for NIA biometrics) */
  preScreeningPassed?: boolean;
  /** Optional details from NIA */
  details?: {
    pin?: string;
    dateOfBirth?: string;
    nationality?: string;
  };
}

const NIA_BASE_URL = process.env.NIA_BASE_URL || '';
const NIA_API_KEY = process.env.NIA_API_KEY || '';
const USE_NIA_LIVE = Boolean(NIA_BASE_URL && NIA_API_KEY);

/**
 * Mock NIA verification for development — does **not** grant final verified identity.
 * Card format must be valid; uploaded selfies always require manual review.
 */
async function mockNIAVerify(req: NIAVerifyRequest): Promise<NIAVerifyResponse> {
  await new Promise((r) => setTimeout(r, 800));
  const normalized = normalizeGhanaCardNumber(req.cardNumber);
  const validCardFormat = isValidGhanaCardFormat(normalized);
  const validName = validateFullNameOnCard(req.fullName);
  const hasImages = Boolean(req.frontCardImage && req.backCardImage && req.faceImage);

  if (!validCardFormat) {
    return {
      success: false,
      verified: false,
      message:
        'Invalid Ghana Card number. Use the format GHA-123456789-1 (GHA, nine digits, hyphen, one check digit).',
    };
  }
  if (!validName) {
    return {
      success: false,
      verified: false,
      message: 'Enter your full name as printed on the card (at least two names).',
    };
  }
  if (!hasImages) {
    return {
      success: false,
      verified: false,
      message: 'Front, back, and face images are required.',
    };
  }

  if (req.selfieSource === 'upload') {
    return {
      success: true,
      verified: false,
      pendingManualReview: true,
      faceMatchScore: 0,
      referenceId: `NIA-UPLOAD-${Date.now()}`,
      message:
        'Images received. Uploaded selfies are not auto-approved. Ghana Lands Commission will review your submission.',
    };
  }

  return {
    success: true,
    verified: false,
    preScreeningPassed: true,
    faceMatchScore: 0,
    referenceId: `NIA-PRE-${Date.now()}`,
    message:
      'Card details and live capture accepted for screening. Final verification requires Ghana Lands Commission approval (NIA biometrics when integrated).',
  };
}

/**
 * Call NIA IVSP when credentials are configured.
 * Adapt request/response to actual NIA API when available.
 */
async function liveNIAVerify(req: NIAVerifyRequest): Promise<NIAVerifyResponse> {
  const res = await fetch(`${NIA_BASE_URL.replace(/\/$/, '')}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${NIA_API_KEY}`,
      'X-NIA-Client': 'SmartLand',
    },
    body: JSON.stringify({
      cardNumber: req.cardNumber.trim(),
      fullName: req.fullName.trim(),
      frontCardImage: req.frontCardImage,
      backCardImage: req.backCardImage,
      faceImage: req.faceImage,
      selfieSource: req.selfieSource,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return {
      success: false,
      message: `NIA verification error: ${res.status} ${text.slice(0, 200)}`,
    };
  }

  const data = (await res.json()) as { verified?: boolean; faceMatchScore?: number; referenceId?: string; message?: string };
  return {
    success: Boolean(data.verified),
    verified: data.verified,
    faceMatchScore: data.faceMatchScore,
    referenceId: data.referenceId,
    message: data.message || (data.verified ? 'Verification successful.' : 'Verification failed.'),
  };
}

export async function verifyGhanaCard(req: NIAVerifyRequest): Promise<NIAVerifyResponse> {
  if (USE_NIA_LIVE) {
    return liveNIAVerify(req);
  }
  return mockNIAVerify(req);
}
