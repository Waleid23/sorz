/** Choices shown in the subscription form. Values match the database check constraints. */

export const CATEGORIES = [
  { value: "streaming", label: "Streaming" },
  { value: "gaming", label: "Gaming" },
  { value: "food_delivery", label: "Food Delivery" },
  { value: "shopping", label: "Shopping" },
  { value: "cloud_storage", label: "Cloud Storage" },
  { value: "music", label: "Music" },
  { value: "sports", label: "Sports" },
  { value: "other", label: "Other" },
] as const;

export type Category = (typeof CATEGORIES)[number]["value"];

/**
 * Billing cycles offered in the form. "seasonal" is supported by the database
 * and cost helpers; it joins this list along with its season-month fields
 * (next PLAN.md task).
 */
export const FORM_BILLING_CYCLES = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
] as const;
