"use client";

import { useSearchParams } from "next/navigation";

/** Confirms a save after the add form redirects to /subs?added=1. */
export function AddedNotice() {
  if (useSearchParams().get("added") !== "1") return null;
  return (
    <p
      role="status"
      className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
    >
      Subscription saved.
    </p>
  );
}
