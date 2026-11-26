import type { SubscriptionField } from "./schema";
import type { Subscription } from "./types";

export type SubscriptionFormValues = Partial<Record<SubscriptionField, string>>;

/** Turns a saved subscription into the strings the edit form starts with. */
export function toFormValues(sub: Subscription): SubscriptionFormValues {
  return {
    name: sub.name,
    label: sub.label ?? "",
    // Always two decimals, so 15.5 shows as "15.50".
    price: Number(sub.price).toFixed(2),
    billing_cycle: sub.billing_cycle,
    next_billing_date: sub.next_billing_date,
    category: sub.category,
    season_start_month: sub.season_start_month?.toString() ?? "",
    season_end_month: sub.season_end_month?.toString() ?? "",
    is_trial: sub.is_trial ? "on" : "",
    trial_end_date: sub.trial_end_date ?? "",
    status: sub.status,
  };
}

/**
 * Starting values for "Duplicate": the same service, price, cycle, dates and
 * category, but no label (that's what tells the copies apart) and active.
 */
export function toDuplicateValues(sub: Subscription): SubscriptionFormValues {
  return { ...toFormValues(sub), label: "", status: "active" };
}
