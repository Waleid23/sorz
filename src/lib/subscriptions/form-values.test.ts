import { describe, expect, it } from "vitest";
import { toFormValues } from "./form-values";
import { subscriptionSchema } from "./schema";
import type { Subscription } from "./types";

const base: Subscription = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Twitch",
  label: "streamerA",
  category: "streaming",
  price: 5.99,
  currency: "USD",
  billing_cycle: "monthly",
  season_start_month: null,
  season_end_month: null,
  next_billing_date: "2026-12-02",
  is_trial: false,
  trial_end_date: null,
  status: "active",
};

/** What saving the edit form unchanged would write back. */
const roundTrip = (sub: Subscription) =>
  subscriptionSchema.parse(toFormValues(sub));

describe("toFormValues", () => {
  it("shows prices with two decimals", () => {
    expect(toFormValues({ ...base, price: 15.5 }).price).toBe("15.50");
    expect(toFormValues({ ...base, price: 1200 }).price).toBe("1200.00");
    // Supabase can return numeric columns as strings.
    expect(
      toFormValues({ ...base, price: "9.9" as unknown as number }).price,
    ).toBe("9.90");
  });

  it("saving unchanged gives back the same subscription", () => {
    const subs: Subscription[] = [
      base,
      {
        ...base,
        name: "NBA League Pass",
        label: null,
        category: "sports",
        price: 109.99,
        billing_cycle: "seasonal",
        season_start_month: 10,
        season_end_month: 6,
        next_billing_date: "2027-10-01",
        status: "paused",
      },
      {
        ...base,
        name: "Xbox Game Pass",
        category: "gaming",
        price: 19.99,
        next_billing_date: "2026-11-28",
        is_trial: true,
        trial_end_date: "2026-11-28",
        status: "cancelled",
      },
    ];
    for (const sub of subs) {
      expect(roundTrip(sub)).toEqual({
        name: sub.name,
        price: Number(sub.price),
        billing_cycle: sub.billing_cycle,
        next_billing_date: sub.next_billing_date,
        category: sub.category,
        season_start_month: sub.season_start_month,
        season_end_month: sub.season_end_month,
        is_trial: sub.is_trial,
        trial_end_date: sub.trial_end_date,
        status: sub.status,
      });
    }
  });

  it("turns a trial off cleanly: the end date becomes the billing date", () => {
    const values = toFormValues({
      ...base,
      is_trial: true,
      trial_end_date: "2026-11-28",
      next_billing_date: "2026-11-28",
    });
    const result = subscriptionSchema.parse({ ...values, is_trial: "" });
    expect(result.is_trial).toBe(false);
    expect(result.trial_end_date).toBeNull();
    expect(result.next_billing_date).toBe("2026-11-28");
  });
});
