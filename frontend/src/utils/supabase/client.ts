/**
 * Browser Supabase client (Vite + React).
 * Equivalent to the Supabase UI registry block `@supabase/supabase-client-nextjs` browser helper,
 * but uses `import.meta.env` (via shared env resolution) instead of `process.env`.
 */
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseCredentials } from './env';

let browserClient: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  const creds = getSupabaseCredentials();
  if (!creds) {
    throw new Error(
      'Missing Supabase env. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_* mirrors) in .env.local'
    );
  }
  if (!browserClient) {
    browserClient = createBrowserClient(creds.url, creds.key);
  }
  return browserClient;
}
