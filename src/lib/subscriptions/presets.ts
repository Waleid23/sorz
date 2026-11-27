import type { Category } from "./options";

/**
 * Quick-add presets for common services. Tapping one fills in the name,
 * category and billing cycle (plus season months for seasonal plans).
 * Prices are left out on purpose: they differ by plan and change often, so
 * the user types what they actually pay.
 */
export type Preset = {
  name: string;
  category: Category;
  billing_cycle: "monthly" | "yearly" | "seasonal";
  season_start_month?: number;
  season_end_month?: number;
  /** Several subs of this service are common (e.g. one per streamer), so ask for a label next. */
  askLabel?: boolean;
};

export const PRESETS: readonly Preset[] = [
  { name: "Netflix", category: "streaming", billing_cycle: "monthly" },
  { name: "Hulu", category: "streaming", billing_cycle: "monthly" },
  { name: "Disney+", category: "streaming", billing_cycle: "monthly" },
  { name: "YouTube Premium", category: "streaming", billing_cycle: "monthly" },
  { name: "Crunchyroll", category: "streaming", billing_cycle: "monthly" },
  {
    name: "Twitch",
    category: "streaming",
    billing_cycle: "monthly",
    askLabel: true,
  },
  { name: "Spotify", category: "music", billing_cycle: "monthly" },
  { name: "Apple Music", category: "music", billing_cycle: "monthly" },
  { name: "DashPass", category: "food_delivery", billing_cycle: "monthly" },
  { name: "Uber One", category: "food_delivery", billing_cycle: "monthly" },
  { name: "Xbox Game Pass", category: "gaming", billing_cycle: "monthly" },
  { name: "PlayStation Plus", category: "gaming", billing_cycle: "monthly" },
  { name: "Amazon Prime", category: "shopping", billing_cycle: "yearly" },
  { name: "iCloud+", category: "cloud_storage", billing_cycle: "monthly" },
  { name: "Google One", category: "cloud_storage", billing_cycle: "monthly" },
  {
    name: "NBA League Pass",
    category: "sports",
    billing_cycle: "seasonal",
    season_start_month: 10,
    season_end_month: 6,
  },
];
