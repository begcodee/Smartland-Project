/**
 * SmartLand API client — connects frontend to backend
 */

import { API_BASE } from './apiBase';

function getToken(): string | null {
  return localStorage.getItem('smartland_token');
}

function headers(includeAuth = true): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (includeAuth && token) h.Authorization = `Bearer ${token}`;
  return h;
}

export type LawCategory = 'registration' | 'transfer' | 'dispute' | 'environmental' | 'general';
export type LawStatus = 'draft' | 'active';

export type LawRecord = {
  id: string;
  code: string;
  title: string;
  summary: string;
  body: string;
  category: LawCategory;
  effectiveFrom: string;
  status: LawStatus;
  createdAt: string;
  updatedAt: string;
};

export type LawPayload = {
  code?: string;
  title: string;
  summary?: string;
  body?: string;
  category?: LawCategory;
  effectiveFrom?: string;
  status?: LawStatus;
};

export const api = {
  async health() {
    const r = await fetch(API_BASE.replace('/api', '') + '/health');
    return r.json();
  },

  /** Register a new user directly — creates account with verificationStatus: pending */
  async register(payload: {
    name: string;
    email: string;
    phoneNumber: string;
    role: string;
    organization?: string;
    password: string;
    staffId?: string;
  }) {
    const r = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: headers(false),
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Registration failed');
    if (data.token) localStorage.setItem('smartland_token', data.token);
    return data;
  },

  async login(email: string, password: string, role?: string, staffId?: string, arbitratorRegNo?: string) {
    const r = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: headers(false),
      body: JSON.stringify({ email, password, role, staffId, arbitratorRegNo })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Login failed');
    if (data.token) localStorage.setItem('smartland_token', data.token);
    return data;
  },

  async me() {
    const r = await fetch(`${API_BASE}/auth/me`, { method: 'GET', headers: headers() });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Failed');
    return data;
  },

  logout() {
    localStorage.removeItem('smartland_token');
  },

  async submitRegistration(payload: {
    name: string;
    email: string;
    phoneNumber: string;
    role: string;
    organization?: string;
    password: string;
    staffId?: string;
    arbitratorRegNo?: string;
    ghanaCard: { frontCardImage: string; backCardImage: string; faceImage: string; cardNumber: string; fullName: string };
    landDocuments: Array<{ id?: string; name: string; type: string; scannedImage: string; size?: number }>;
  }) {
    const r = await fetch(`${API_BASE}/registrations/submit`, {
      method: 'POST',
      headers: headers(false),
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Submission failed');
    return data;
  },

  async simulateReview(id: string) {
    const r = await fetch(`${API_BASE}/registrations/${id}/simulate-review`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({})
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.reason || 'Verification failed');
    return data;
  },

  async getPendingRegistrations() {
    const r = await fetch(`${API_BASE}/registrations/pending`, { headers: headers() });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Failed');
    return data;
  },

  async reviewRegistration(id: string, action: 'approve' | 'reject', rejectionReason?: string) {
    const r = await fetch(`${API_BASE}/registrations/${id}/review`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ action, rejectionReason })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Review failed');
    return data;
  },

  async verifyGhanaCard(payload: {
    cardNumber: string;
    fullName: string;
    frontCardImage: string;
    backCardImage: string;
    faceImage: string;
    selfieSource?: 'live_camera' | 'upload';
  }) {
    const r = await fetch(`${API_BASE}/verify/ghana-card`, {
      method: 'POST',
      headers: headers(false),
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Verification failed');
    return data as {
      success: boolean;
      verified?: boolean;
      message?: string;
      pendingManualReview?: boolean;
      preScreeningPassed?: boolean;
      referenceId?: string;
      flaggedForArbitrator?: boolean;
      biometricMismatch?: boolean;
      thesisNotes?: Record<string, string>;
      protocolA?: { passed?: boolean; flags?: string[]; thesisNote?: string };
      protocolB?: {
        passed?: boolean | null;
        skipped?: boolean;
        similarity?: number | null;
        threshold?: number;
        flags?: string[];
        thesisNote?: string;
      };
      securityReport?: string[];
      smartlandProtocols?: Record<string, unknown>;
    };
  },

  async getVerificationDashboardRules() {
    const r = await fetch(`${API_BASE}/verify/dashboard-rules`, { headers: headers(false) });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Failed');
    return data as { success: boolean; rules: Record<string, unknown>; thesis?: string };
  },

  /** Persist Ghana Card submission; user remains pending until admin approves */
  async saveIdVerification(idVerification: Record<string, unknown>) {
    const r = await fetch(`${API_BASE}/users/me`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ idVerification })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Failed to save verification');
    return data;
  },

  async getParcels(params?: { status?: string }) {
    const q = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    const r = await fetch(`${API_BASE}/parcels${q}`, { headers: headers() });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Failed');
    const parcels = Array.isArray(data) ? data : Array.isArray(data?.parcels) ? data.parcels : [];
    return { success: true as const, parcels };
  },

  /** Arbitrator/admin: restore parcel to **clear** after investigation (enables automated settlement again). */
  async clearParcelRedFlag(parcelId: string) {
    const r = await fetch(`${API_BASE}/parcels/${encodeURIComponent(parcelId)}/clear-red-flag`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({})
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Failed to clear flag');
    return data;
  },

  async createParcel(payload: object) {
    const r = await fetch(`${API_BASE}/parcels`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Failed');
    return data;
  },

  async getTransfers() {
    const r = await fetch(`${API_BASE}/transfers`, { headers: headers() });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Failed');
    return data;
  },

  async createTransfer(payload: { landParcelId: string; toUserId: string; amount: number; escrowAmount?: number }) {
    const r = await fetch(`${API_BASE}/transfers`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Failed');
    return data;
  },

  async completeTransfer(id: string) {
    const r = await fetch(`${API_BASE}/transfers/${id}/complete`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({})
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Failed');
    return data;
  },

  /** Paystack checkout — Mobile Money or bank; returns authorization URL to redirect the buyer */
  async initializeLandPayment(payload: {
    landParcelId: string;
    channel: 'mobile_money' | 'bank';
    /** Demo fallback when backend DB is offline */
    amountGhs?: number;
  }) {
    const r = await fetch(`${API_BASE}/payments/initialize`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok) {
      const err = new Error(data.message || 'Failed to start payment') as Error & {
        redFlag?: boolean;
        conflict?: unknown;
      };
      err.redFlag = data.redFlag === true;
      err.conflict = data.conflict;
      throw err;
    }
    return data as {
      success: boolean;
      authorizationUrl: string;
      reference: string;
      accessCode: string;
    };
  },

  /** Confirm payment after Paystack redirect (server verifies with Paystack and completes sale) */
  async verifyLandPayment(reference: string) {
    const q = new URLSearchParams({ reference });
    const r = await fetch(`${API_BASE}/payments/verify?${q}`, {
      method: 'GET',
      headers: headers()
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Verification failed');
    return data as {
      success: boolean;
      status: string;
      message?: string;
      redFlag?: boolean;
      blocked?: boolean;
      evaluation?: unknown;
      payment?: unknown;
      transfer?: {
        id: string;
        parcelId: string;
        sellerId: string;
        buyerId: string;
        paystackReference: string;
      } | null;
    };
  },

  /** Community rating (Uber-style): 1–5 stars for a completed transaction */
  async createRating(payload: { toUserId: string; stars: number; transferId: string }) {
    const r = await fetch(`${API_BASE}/ratings`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        toUserId: payload.toUserId,
        stars: payload.stars,
        context: { type: 'transfer', transferId: payload.transferId }
      })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || data.error || 'Failed to submit rating');
    return data as { success: boolean; summary?: { count: number; avgStars: number; score100: number } };
  },

  async listConversations() {
    const r = await fetch(`${API_BASE}/conversations`, { headers: headers() });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Failed');
    return data as { success: boolean; conversations: unknown[] };
  },

  async startConversation(landParcelId: string) {
    const r = await fetch(`${API_BASE}/conversations/start`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ landParcelId })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Failed');
    return data as {
      success: boolean;
      conversation: {
        id: string;
        landParcel?: { id: string; title: string };
        buyer?: { id: string; name: string; phoneNumber?: string; email?: string };
        seller?: { id: string; name: string; phoneNumber?: string; email?: string };
      };
    };
  },

  async getConversation(conversationId: string) {
    const r = await fetch(`${API_BASE}/conversations/${conversationId}`, {
      method: 'GET',
      headers: headers()
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Failed');
    return data as {
      success: boolean;
      conversation: {
        id: string;
        landParcel?: { id: string; title: string };
        buyer?: { id: string; name: string; phoneNumber?: string; email?: string };
        seller?: { id: string; name: string; phoneNumber?: string; email?: string };
      };
    };
  },

  async getConversationMessages(conversationId: string) {
    const r = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
      method: 'GET',
      headers: headers()
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Failed');
    return data as {
      success: boolean;
      messages: Array<{
        id: string;
        body: string;
        createdAt: string;
        senderId: string;
        sender?: { id: string; name: string };
        attachments?: Array<{ kind: 'image' | 'document'; name: string; mimeType: string; dataUrl: string }>;
      }>;
    };
  },

  async sendConversationMessage(
    conversationId: string,
    body: string,
    attachments?: Array<{ kind: 'image' | 'document'; name: string; mimeType: string; dataUrl: string }>
  ) {
    const r = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ body, attachments })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Failed');
    return data as { success: boolean; message: unknown };
  },

  /** NIA: list users awaiting Ghana Card verification */
  async niaListUsers() {
    const r = await fetch(`${API_BASE}/nia/users`, { headers: headers() });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Failed');
    return data as { success: boolean; users: Array<Record<string, unknown>> };
  },

  /** NIA: verify/reject user after database check */
  async niaDecision(userId: string, action: 'verify' | 'reject') {
    const r = await fetch(`${API_BASE}/nia/users/${userId}/decision`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ action })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Failed');
    return data as { success: boolean };
  },

  /** NIA: demo employee verification flow (Step 1–5) */
  async niaVerifyEmployee(input: {
    staffId: string;
    ghanaCardNumber: string;
    fullNameOnCard?: string;
    biometricSample?: string;
  }) {
    const r = await fetch(`${API_BASE}/nia/employees/verify-employee`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(input)
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Failed');
    return data as { success: boolean; decision: string; attempt: { flaggedReason?: string } };
  },

  async getParcel(id: string) {
    const r = await fetch(`${API_BASE}/parcels/${id}`, { headers: headers() });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Failed');
    return data;
  },

  async getAnalytics() {
    const r = await fetch(`${API_BASE}/analytics`, { headers: headers() });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Failed');
    return data;
  },

  async getUsers() {
    const r = await fetch(`${API_BASE}/users`, { headers: headers() });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Failed');
    return data;
  },

  /** Admin: fetch users with verificationStatus = pending */
  async getPendingUsers() {
    const r = await fetch(`${API_BASE}/users/pending`, { headers: headers() });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Failed');
    return data;
  },

  /** Admin: approve or reject a pending user */
  async verifyUser(userId: string, action: 'approve' | 'reject', rejectionReason?: string) {
    const r = await fetch(`${API_BASE}/users/${userId}/verify`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ action, rejectionReason })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Verification action failed');
    return data;
  },

  async getNotifications() {
    const r = await fetch(`${API_BASE}/notifications`, { headers: headers() });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Failed');
    return data;
  },

  async markNotificationRead(id: string) {
    const r = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({})
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Failed');
    return data;
  },

  async patchDisputeStatus(disputeId: string, status: string) {
    const r = await fetch(`${API_BASE}/disputes/${disputeId}/status`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ status })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Failed');
    return data;
  },

  async getDisputes() {
    const r = await fetch(`${API_BASE}/disputes`, { headers: headers() });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Failed');
    return data;
  },

  async createDispute(payload: { landParcelId: string; defendantUserId: string; description: string; evidence?: string[] }) {
    const r = await fetch(`${API_BASE}/disputes`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Failed');
    return data;
  },

  async voteDispute(disputeId: string, vote: 'support' | 'against' | 'abstain') {
    const r = await fetch(`${API_BASE}/disputes/${disputeId}/vote`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ vote })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Failed');
    return data;
  },

  async resolveDispute(disputeId: string, resolution: string) {
    const r = await fetch(`${API_BASE}/disputes/${disputeId}/resolve`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ resolution })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Failed');
    return data;
  },

  async getLaws() {
    const r = await fetch(`${API_BASE}/laws`, { headers: headers(false) });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Failed to load laws');
    return data as { laws: LawRecord[] };
  },

  async createLaw(payload: LawPayload) {
    const r = await fetch(`${API_BASE}/laws`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Failed to create law');
    return data as { law: LawRecord };
  },

  async updateLaw(id: string, payload: Partial<LawPayload>) {
    const r = await fetch(`${API_BASE}/laws/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Failed to update law');
    return data as { law: LawRecord };
  },

  async deleteLaw(id: string) {
    const r = await fetch(`${API_BASE}/laws/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: headers()
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Failed to delete law');
    return data as { ok: boolean };
  }
};
