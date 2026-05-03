/**
 * API origin for web + Capacitor builds.
 * Dev default `/api` uses the Vite proxy (see vite.config.ts) so requests are same-origin — avoids CORS when
 * the app is opened as http://127.0.0.1:5173 or other hosts. Set VITE_API_URL for LAN/emulator builds.
 */
function normalizeApiBase(raw: string | undefined): string {
  const trimmed = raw != null ? String(raw).trim() : '';
  if (trimmed) {
    let u = trimmed.replace(/\/$/, '');
    if (!u.endsWith('/api')) u = `${u}/api`;
    return u;
  }
  if (import.meta.env.DEV) return '/api';
  return 'http://localhost:3001/api';
}

export const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

/** Backend serves `GET /health` outside `/api` — use this URL from the browser. */
export function healthCheckUrl(): string {
  if (API_BASE.startsWith('http')) return API_BASE.replace(/\/?api\/?$/i, '') + '/health';
  return '/health';
}
