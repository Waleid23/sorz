import Link from "next/link";

/**
 * Sticky top bar with the page title. Each page in the app shell renders one.
 * Pass `backHref` on sub-pages to show a back arrow.
 */
export function PageHeader({
  title,
  backHref,
}: {
  title: string;
  backHref?: string;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex min-h-14 max-w-2xl items-center gap-1 px-4">
        {backHref && (
          <Link
            href={backHref}
            aria-label="Back"
            className="-ml-3 flex size-11 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-indigo-500 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
        )}
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      </div>
    </header>
  );
}
