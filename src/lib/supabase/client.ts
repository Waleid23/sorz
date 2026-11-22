import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for Client Components (runs in the browser).
 * Uses only the public URL and publishable key; RLS protects the data.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
