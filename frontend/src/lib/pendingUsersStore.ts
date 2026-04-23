/**
 * In-memory store for locally registered pending users.
 * Used when the backend is unavailable (prototype / offline mode).
 *
 * Registration flow  →  addLocalPendingUser()
 * Ghana Card verify  →  updateLocalPendingUserVerification()
 * Admin approve/reject → removeLocalPendingUser()
 * Admin dashboard    →  getLocalPendingUsers()
 */

export interface LocalPendingUser {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  organization?: string | null;
  staffId?: string | null;
  verificationStatus: string;
  /** JSON-stringified VerificationData */
  idVerification?: string | null;
  createdAt: string;
}

const store: LocalPendingUser[] = [];

export function addLocalPendingUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  verificationStatus?: string;
  phoneNumber?: string;
  organization?: string | null;
  staffId?: string | null;
}) {
  if (store.some((u) => u.id === user.id)) return;
  store.push({
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber ?? '',
    role: user.role,
    organization: user.organization ?? null,
    staffId: user.staffId ?? null,
    verificationStatus: user.verificationStatus ?? 'pending',
    idVerification: null,
    createdAt: new Date().toISOString(),
  });
}

export function updateLocalPendingUserVerification(
  userId: string,
  idVerification: object
) {
  const user = store.find((u) => u.id === userId);
  if (user) {
    user.idVerification = JSON.stringify(idVerification);
  }
}

export function removeLocalPendingUser(userId: string) {
  const idx = store.findIndex((u) => u.id === userId);
  if (idx !== -1) store.splice(idx, 1);
}

export function getLocalPendingUsers(): LocalPendingUser[] {
  return [...store];
}
