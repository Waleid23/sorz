/** Choices shown in the subscription form and list. Values match the database check constraints. */

export const CATEGORIES = [
  { value: "streaming", label: "Streaming", icon: "📺" },
  { value: "gaming", label: "Gaming", icon: "🎮" },
  { value: "food_delivery", label: "Food Delivery", icon: "🍔" },
  { value: "shopping", label: "Shopping", icon: "🛍️" },
  { value: "cloud_storage", label: "Cloud Storage", icon: "☁️" },
  { value: "music", label: "Music", icon: "🎵" },
  { value: "sports", label: "Sports", icon: "🏀" },
  { value: "other", label: "Other", icon: "📦" },
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
