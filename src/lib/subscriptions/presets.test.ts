import { describe, expect, it } from "vitest";
import { CATEGORIES, FORM_BILLING_CYCLES } from "./options";
import { PRESETS } from "./presets";
import { subscriptionSchema } from "./schema";

describe("PRESETS", () => {
  it("includes the services potential users named", () => {
    const names = PRESETS.map((p) => p.name);
    for (const name of [
      "Netflix",
      "Hulu",
      "Crunchyroll",
      "DashPass",
      "Xbox Game Pass",
      "iCloud+",
      "Amazon Prime",
      "Twitch",
      "NBA League Pass",
    ]) {
      expect(names).toContain(name);
    }
  });

  it("has unique names, and only categories and cycles the form offers", () => {
    const names = PRESETS.map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
    const categories: string[] = CATEGORIES.map((c) => c.value);
    const cycles: string[] = FORM_BILLING_CYCLES.map((c) => c.value);
    for (const p of PRESETS) {
      expect(categories).toContain(p.category);
      expect(cycles).toContain(p.billing_cycle);
    }
  });

  it("gives a valid subscription once a price and date are added", () => {
    for (const p of PRESETS) {
      const result = subscriptionSchema.safeParse({
        name: p.name,
        category: p.category,
        billing_cycle: p.billing_cycle,
        season_start_month: p.season_start_month?.toString(),
        season_end_month: p.season_end_month?.toString(),
        price: "9.99",
        next_billing_date: "2026-12-01",
      });
      expect(result.success, p.name).toBe(true);
    }
  });

  it("only seasonal presets have season months", () => {
    for (const p of PRESETS) {
      const hasMonths =
        p.season_start_month !== undefined && p.season_end_month !== undefined;
      expect(hasMonths, p.name).toBe(p.billing_cycle === "seasonal");
    }
  });
});
