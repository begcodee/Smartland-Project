/**
 * SmartLand API client — connects frontend to backend
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function getToken(): string | null {
  return localStorage.getItem('smartland_token');
}

function headers(includeAuth = true): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (includeAuth && token) h.Authorization = `Bearer ${token}`;
  return h;
}

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

  async verifyGhanaCard(payload: { cardNumber: string; fullName: string; frontCardImage: string; backCardImage: string; faceImage: string }) {
    const r = await fetch(`${API_BASE}/verify/ghana-card`, {
      method: 'POST',
      headers: headers(false),
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Verification failed');
    return data;
  },

  async getParcels(params?: { status?: string }) {
    const q = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    const r = await fetch(`${API_BASE}/parcels${q}`, { headers: headers() });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Failed');
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
  }
};
