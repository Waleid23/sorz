import type { ReactNode } from "react";

/** Temporary body for tabs whose features haven't been built yet. */
export function Placeholder({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
      <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        {children}
      </p>
    </main>
  );
}
