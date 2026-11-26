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

/** Billing cycles offered in the form. Seasonal plans also need season months. */
export const FORM_BILLING_CYCLES = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "seasonal", label: "Seasonal" },
] as const;

/** Month choices for a season's start and end; value is 1-12. */
export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
].map((label, i) => ({ value: i + 1, label }));
