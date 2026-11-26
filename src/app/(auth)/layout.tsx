import type { ReactNode } from "react";

/** Layout for login and sign-up: centered card, no bottom nav. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex flex-1 flex-col justify-center px-4 pt-[calc(2rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto w-full max-w-sm">
        <p className="mb-8 text-center text-3xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
          Sorz
        </p>
        {children}
      </div>
    </main>
  );
}
