/**
 * API origin for web + Capacitor builds.
 * On a phone/emulator, set VITE_API_URL at build time (e.g. http://192.168.1.10:3001 or http://10.0.2.2:3001 for Android emulator).
 */
function normalizeApiBase(raw: string | undefined): string {
  const fallback = 'http://localhost:3001/api';
  if (raw == null || !String(raw).trim()) return fallback;
  let u = String(raw).trim().replace(/\/$/, '');
  if (!u.endsWith('/api')) u = `${u}/api`;
  return u;
}

export const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);
