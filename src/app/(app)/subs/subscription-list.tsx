import Link from "next/link";
import { cycleSuffix, formatMoney, formatShortDate } from "@/lib/format";
import { groupByCategory, countsTowardTotals } from "@/lib/subscriptions/group";
import type { Category } from "@/lib/subscriptions/options";
import {
  SUBSCRIPTION_COLUMNS,
  type Subscription,
} from "@/lib/subscriptions/types";
import { createClient } from "@/lib/supabase/server";

/** Tinted circle behind each category icon. Full class names so Tailwind keeps them. */
const CATEGORY_TINT: Record<Category, string> = {
  streaming: "bg-rose-100 dark:bg-rose-950",
  gaming: "bg-emerald-100 dark:bg-emerald-950",
  food_delivery: "bg-orange-100 dark:bg-orange-950",
  shopping: "bg-amber-100 dark:bg-amber-950",
  cloud_storage: "bg-sky-100 dark:bg-sky-950",
  music: "bg-fuchsia-100 dark:bg-fuchsia-950",
  sports: "bg-lime-100 dark:bg-lime-950",
  other: "bg-zinc-200 dark:bg-zinc-800",
};

const STATUS_BADGE: Record<Subscription["status"], string | null> = {
  active: null,
  paused: "Paused",
  cancelled: "Cancelled",
};

function Badge({
  children,
  tone,
}: {
  children: string;
  tone: "amber" | "zinc";
}) {
  const tones = {
    amber: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    zinc: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function SubscriptionRow({ sub, year }: { sub: Subscription; year: number }) {
  const inactive = !countsTowardTotals(sub);
  const status = STATUS_BADGE[sub.status];
  return (
    <li>
      <Link
        href={`/subs/${sub.id}`}
        className="flex min-h-16 items-center gap-3 px-4 py-3 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-500 active:bg-zinc-100 dark:hover:bg-zinc-800/50 dark:active:bg-zinc-800"
      >
        <div className={`min-w-0 flex-1 ${inactive ? "opacity-60" : ""}`}>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-medium">
            <span className="truncate">{sub.name}</span>
            {sub.label && (
              <span className="truncate text-sm font-normal text-zinc-500 dark:text-zinc-400">
                {sub.label}
              </span>
            )}
            {sub.is_trial && <Badge tone="amber">Trial</Badge>}
            {status && <Badge tone="zinc">{status}</Badge>}
          </p>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            {sub.is_trial && sub.trial_end_date
              ? `Trial ends ${formatShortDate(sub.trial_end_date, year)}`
              : `Renews ${formatShortDate(sub.next_billing_date, year)}`}
          </p>
        </div>
        <p
          className={`shrink-0 text-right font-semibold tabular-nums ${inactive ? "opacity-60" : ""}`}
        >
          {formatMoney(sub.price, sub.currency)}
          <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
            {cycleSuffix(sub.billing_cycle)}
          </span>
        </p>
        <svg
          viewBox="0 0 24 24"
          className="-mr-1 size-5 shrink-0 text-zinc-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </Link>
    </li>
  );
}

/** The signed-in user's subscriptions, grouped by category. Reads the session: render inside <Suspense>. */
export async function SubscriptionList() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select(SUBSCRIPTION_COLUMNS)
    .returns<Subscription[]>();

  if (error) {
    console.error("SubscriptionList query failed:", error.code, error.message);
    return (
      <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
        Couldn&apos;t load your subscriptions. Refresh the page to try again.
      </p>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
        <p className="font-medium">No subscriptions yet</p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Add the services you pay for to see them here.
        </p>
      </div>
    );
  }

  const now = new Date();
  const month = now.getUTCMonth() + 1;
  const year = now.getUTCFullYear();
  const groups = groupByCategory(data, month);

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.category} aria-labelledby={`cat-${group.category}`}>
          <div className="mb-2 flex items-center gap-2 px-1">
            <span
              aria-hidden="true"
              className={`flex size-8 items-center justify-center rounded-full text-base ${CATEGORY_TINT[group.category]}`}
            >
              {group.icon}
            </span>
            <h2 id={`cat-${group.category}`} className="flex-1 font-semibold">
              {group.label}{" "}
              <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
                ({group.subscriptions.length})
              </span>
            </h2>
            <p className="text-sm text-zinc-500 tabular-nums dark:text-zinc-400">
              {formatMoney(group.monthlyTotal)}/mo
            </p>
          </div>
          <ul className="divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            {group.subscriptions.map((sub) => (
              <SubscriptionRow key={sub.id} sub={sub} year={year} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** Placeholder shown while the list loads. */
export function SubscriptionListSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="h-40 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900"
        />
      ))}
    </div>
  );
}
