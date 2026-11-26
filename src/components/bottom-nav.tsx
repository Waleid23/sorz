"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavItem = { href: string; label: string; icon: ReactNode };

const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Home",
    icon: (
      <>
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5.5 10v10h13V10" />
        <path d="M10 20v-5h4v5" />
      </>
    ),
  },
  {
    href: "/subs",
    label: "Subs",
    icon: (
      <>
        <path d="M9 6h11M9 12h11M9 18h11" />
        <circle cx="4.5" cy="6" r="1" />
        <circle cx="4.5" cy="12" r="1" />
        <circle cx="4.5" cy="18" r="1" />
      </>
    ),
  },
  {
    href: "/calendar",
    label: "Calendar",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </>
    ),
  },
  {
    href: "/shared",
    label: "Shared",
    icon: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M17 14c2.5 0 4.5 2 4.5 4.5" />
      </>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <>
        <path d="M4 6h9m4 0h3M4 12h3m4 0h9M4 18h11m4 0h1" />
        <circle cx="15" cy="6" r="2" />
        <circle cx="9" cy="12" r="2" />
        <circle cx="17" cy="18" r="2" />
      </>
    ),
  },
];

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ pathname }: { pathname: string | null }) {
  return (
    <ul className="mx-auto flex max-w-2xl">
      {NAV_ITEMS.map(({ href, label, icon }) => {
        const active = isActive(pathname, href);
        return (
          <li key={href} className="flex-1">
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-500 ${
                active
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className="size-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {icon}
              </svg>
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function ActiveNavLinks() {
  return <NavLinks pathname={usePathname()} />;
}

/** Fixed bottom tab bar. Sits above the iPhone home indicator via safe-area padding. */
export function BottomNav({
  suspenseFallback,
}: {
  suspenseFallback?: boolean;
}) {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-zinc-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95"
    >
      {suspenseFallback ? <NavLinks pathname={null} /> : <ActiveNavLinks />}
    </nav>
  );
}
