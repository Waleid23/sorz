import type { BillingCycle } from "@/lib/costs";
import type { Category } from "./options";

/** A subscriptions row as the list reads it (see supabase/migrations). */
export type Subscription = {
  id: string;
  name: string;
  label: string | null;
  category: Category;
  price: number;
  currency: string;
  billing_cycle: BillingCycle;
  season_start_month: number | null;
  season_end_month: number | null;
  /** YYYY-MM-DD */
  next_billing_date: string;
  is_trial: boolean;
  /** YYYY-MM-DD */
  trial_end_date: string | null;
  status: "active" | "paused" | "cancelled";
};

/** Columns to select for a Subscription. */
export const SUBSCRIPTION_COLUMNS =
  "id, name, label, category, price, currency, billing_cycle, season_start_month, season_end_month, next_billing_date, is_trial, trial_end_date, status";
