"use client";

import { useActionState, useState } from "react";
import {
  deleteSubscription,
  type DeleteSubscriptionState,
} from "@/lib/subscriptions/actions";

/** Delete button that asks for confirmation first. */
export function DeleteSubscription({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, pending] = useActionState<DeleteSubscriptionState>(
    deleteSubscription.bind(null, id),
    {},
  );

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="h-12 rounded-xl border border-red-300 text-base font-medium text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/50"
      >
        Delete subscription
      </button>
    );
  }

  return (
    <form
      action={formAction}
      role="alertdialog"
      aria-labelledby="delete-title"
      aria-describedby="delete-desc"
      className="flex flex-col gap-3 rounded-2xl border border-red-300 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40"
    >
      <p id="delete-title" className="font-semibold">
        Delete {name}?
      </p>
      <p id="delete-desc" className="text-sm text-zinc-600 dark:text-zinc-300">
        This removes it for good, including any shared-plan split. To stop
        counting it but keep it, set the status to Paused or Cancelled instead.
      </p>
      {state.error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">
          {state.error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          autoFocus
          onClick={() => setConfirming(false)}
          disabled={pending}
          className="h-12 rounded-xl border border-zinc-300 bg-white text-base font-medium hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          Keep it
        </button>
        <button
          type="submit"
          disabled={pending}
          className="h-12 rounded-xl bg-red-600 text-base font-semibold text-white hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:opacity-60"
        >
          {pending ? "Deleting…" : "Delete"}
        </button>
      </div>
    </form>
  );
}
