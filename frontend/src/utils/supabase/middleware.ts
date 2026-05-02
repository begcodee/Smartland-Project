/**
 * Next.js `middleware.ts` refreshes Supabase cookies on every request.
 * Vite SPAs don’t have that middleware layer — use `auth.onAuthStateChange` in React,
 * or keep using SmartLand’s JWT + `/api/auth` until you add a framework that supports middleware.
 */
export {};
