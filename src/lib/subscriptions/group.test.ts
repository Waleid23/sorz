import { describe, expect, it } from "vitest";
import { groupByCategory } from "./group";
import type { Subscription } from "./types";

let nextId = 0;
function sub(overrides: Partial<Subscription>): Subscription {
  return {
    id: String(nextId++),
    name: "Netflix",
    label: null,
    category: "streaming",
    price: 10,
    currency: "USD",
    billing_cycle: "monthly",
    season_start_month: null,
    season_end_month: null,
    next_billing_date: "2026-12-10",
    is_trial: false,
    trial_end_date: null,
    status: "active",
    ...overrides,
  };
}

describe("groupByCategory", () => {
  it("returns no groups for no subscriptions", () => {
    expect(groupByCategory([], 11)).toEqual([]);
  });

  it("uses the fixed category order and skips empty categories", () => {
    const groups = groupByCategory(
      [
        sub({ category: "sports" }),
        sub({ category: "food_delivery" }),
        sub({ category: "streaming" }),
      ],
      11,
    );
    expect(groups.map((g) => g.category)).toEqual([
      "streaming",
      "food_delivery",
      "sports",
    ]);
    expect(groups[0]).toMatchObject({ label: "Streaming", icon: "📺" });
  });

  it("keeps several subs of the same service, ordered by renewal then label", () => {
    const groups = groupByCategory(
      [
        sub({
          name: "Twitch",
          label: "streamerC",
          next_billing_date: "2026-12-20",
        }),
        sub({
          name: "Twitch",
          label: "streamerB",
          next_billing_date: "2026-12-05",
        }),
        sub({
          name: "Twitch",
          label: "streamerA",
          next_billing_date: "2026-12-05",
        }),
      ],
      11,
    );
    expect(groups[0].subscriptions.map((s) => s.label)).toEqual([
      "streamerA",
      "streamerB",
      "streamerC",
    ]);
  });

  it("totals each group per month through toMonthly", () => {
    const [streaming, sports] = groupByCategory(
      [
        sub({ price: 15.49 }),
        sub({ price: 120, billing_cycle: "yearly" }),
        sub({
          category: "sports",
          price: 90,
          billing_cycle: "seasonal",
          season_start_month: 10,
          season_end_month: 6,
        }),
      ],
      11,
    );
    expect(streaming.monthlyTotal).toBeCloseTo(15.49 + 10, 10);
    expect(sports.monthlyTotal).toBeCloseTo(10, 10); // 90 over a 9-month season
    expect(
      groupByCategory(
        [
          sub({
            category: "sports",
            price: 90,
            billing_cycle: "seasonal",
            season_start_month: 10,
            season_end_month: 6,
          }),
        ],
        7,
      )[0].monthlyTotal,
    ).toBe(0); // off season
  });

  it("lists paused and cancelled subs last and leaves them out of totals", () => {
    const [group] = groupByCategory(
      [
        sub({
          name: "Old",
          status: "cancelled",
          next_billing_date: "2026-01-01",
        }),
        sub({
          name: "Paused",
          status: "paused",
          next_billing_date: "2026-01-02",
        }),
        sub({ name: "Live", price: 5 }),
      ],
      11,
    );
    expect(group.subscriptions.map((s) => s.name)).toEqual([
      "Live",
      "Old",
      "Paused",
    ]);
    expect(group.monthlyTotal).toBe(5);
  });
});
