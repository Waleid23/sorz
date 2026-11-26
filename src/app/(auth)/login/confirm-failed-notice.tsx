"use client";

import { useSearchParams } from "next/navigation";

/** Shown when /auth/confirm couldn't log the user in from the email link. */
export function ConfirmFailedNotice() {
  if (useSearchParams().get("confirm") !== "failed") return null;
  return (
    <p className="mb-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
      That confirmation link didn&apos;t work. It may have expired or been
      opened in a different browser. Try logging in; if your email isn&apos;t
      confirmed yet, sign up again for a new link.
    </p>
  );
}
