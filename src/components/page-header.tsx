/** Sticky top bar with the page title. Each page in the app shell renders one. */
export function PageHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex min-h-14 max-w-2xl items-center px-4">
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      </div>
    </header>
  );
}
