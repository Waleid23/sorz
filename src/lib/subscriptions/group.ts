import { toMonthly, type Month } from "@/lib/costs";
import { CATEGORIES, type Category } from "./options";
import type { Subscription } from "./types";

export type CategoryGroup = {
  category: Category;
  label: string;
  icon: string;
  subscriptions: Subscription[];
  /** What the active subscriptions in this group cost in `month`. */
  monthlyTotal: number;
};

/** Only active subscriptions count toward spending. */
export const countsTowardTotals = (sub: Subscription) =>
  sub.status === "active";

/**
 * Groups subscriptions by category, in the fixed CATEGORIES order, skipping
 * empty categories. Inside a group: active first, then soonest renewal, then
 * name and label (so several Twitch subs sit together in a stable order).
 */
export function groupByCategory(
  subs: Subscription[],
  month: Month,
): CategoryGroup[] {
  return CATEGORIES.map(({ value, label, icon }) => {
    const subscriptions = subs
      .filter((s) => s.category === value)
      .sort(
        (a, b) =>
          Number(countsTowardTotals(b)) - Number(countsTowardTotals(a)) ||
          a.next_billing_date.localeCompare(b.next_billing_date) ||
          a.name.localeCompare(b.name) ||
          (a.label ?? "").localeCompare(b.label ?? ""),
      );
    const monthlyTotal = subscriptions
      .filter(countsTowardTotals)
      .reduce((total, s) => total + toMonthly(s, month), 0);
    return { category: value, label, icon, subscriptions, monthlyTotal };
  }).filter((g) => g.subscriptions.length > 0);
}
