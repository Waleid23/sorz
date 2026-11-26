import { Suspense } from "react";
import { BottomNav } from "@/components/bottom-nav";

/**
 * App shell for the signed-in tabs: page content plus the fixed bottom nav.
 * Pages outside the (app) group (e.g. login, later) don't get the nav.
 */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {/* Bottom padding keeps content clear of the fixed nav (h-14 + safe area). */}
      <div className="flex flex-1 flex-col pb-[calc(3.5rem+env(safe-area-inset-bottom))]">
        {children}
      </div>
      {/* usePathname suspends on dynamic routes with cacheComponents; the fallback
          renders the same nav with no tab highlighted. */}
      <Suspense fallback={<BottomNav suspenseFallback />}>
        <BottomNav />
      </Suspense>
    </>
  );
}
