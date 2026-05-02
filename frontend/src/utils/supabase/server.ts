/**
 * Supabase’s App Router pattern uses `createServerClient` + `cookies()` from `next/headers`.
 * This project is **Vite + React**, not Next.js — there is no server `cookies()` API here.
 *
 * Use `./client.ts` in React components/hooks. For secure server-only logic, call your
 * SmartLand API (`src/lib/api.ts`) or add a separate Next/BFF later and paste Supabase’s
 * official server helper there.
 */
export {};
