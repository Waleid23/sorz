import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { SUBSCRIPTION_COLUMNS, type Subscription } from "./types";

/**
 * Loads one of the signed-in user's subscriptions. Returns `null` for a
 * malformed id or one that isn't theirs (RLS hides other users' rows), and
 * `"error"` if the query itself failed. Reads the session: render callers
 * inside <Suspense>.
 */
export async function getSubscription(
  id: string,
): Promise<Subscription | null | "error"> {
  if (!z.uuid().safeParse(id).success) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select(SUBSCRIPTION_COLUMNS)
    .eq("id", id)
    .maybeSingle<Subscription>();
  if (error) {
    console.error("getSubscription failed:", error.code, error.message);
    return "error";
  }
  return data;
}
