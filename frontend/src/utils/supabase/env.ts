/** Resolve Supabase URL/key from Next-style or Vite-style env names. */

export function getSupabaseCredentials(): { url: string; key: string } | null {
  const url = (
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_URL ||
    ''
  ).trim();
  const key = (
    import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    ''
  ).trim();
  if (!url || !key) return null;
  return { url, key };
}

export function checkSupabaseConfigured(): boolean {
  return getSupabaseCredentials() !== null;
}
