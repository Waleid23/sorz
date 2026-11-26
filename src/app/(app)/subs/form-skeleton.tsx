/** Placeholder shown while a subscription form's starting values load. */
export function SubscriptionFormSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-[4.75rem] animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900"
        />
      ))}
    </div>
  );
}

/** Shown when a subscription couldn't be loaded. */
export function LoadError() {
  return (
    <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
      Couldn&apos;t load this subscription. Refresh the page to try again.
    </p>
  );
}
