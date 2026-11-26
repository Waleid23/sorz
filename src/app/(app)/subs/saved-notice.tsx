"use client";

import { useSearchParams } from "next/navigation";

const MESSAGES = {
  added: "Subscription saved.",
  updated: "Changes saved.",
  deleted: "Subscription deleted.",
};

/** Confirms a save or delete after a form redirects to /subs?added=1 (or updated / deleted). */
export function SavedNotice() {
  const params = useSearchParams();
  const key = (Object.keys(MESSAGES) as (keyof typeof MESSAGES)[]).find(
    (k) => params.get(k) === "1",
  );
  if (!key) return null;
  return (
    <p
      role="status"
      className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
    >
      {MESSAGES[key]}
    </p>
  );
}
