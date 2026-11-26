import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";

/**
 * Supabase client for Server Components, Server Actions, and Route Handlers.
 * Create a new client per request; don't store it in a global variable.
 */
export async function createClient() {
  // Supabase checks token expiry with Date.now(). With Cache Components,
  // Next.js flags that unless rendering is explicitly request-time only,
  // which every per-user query is anyway.
  await connection();
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component, where cookies are read-only.
            // Safe to ignore: the proxy (src/proxy.ts) refreshes the session.
          }
        },
      },
    },
  );
}
