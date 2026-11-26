import { describe, expect, it } from "vitest";
import {
  isInSeason,
  seasonLength,
  toMonthly,
  toYearly,
  type Billable,
} from "./costs";

const monthly: Billable = { price: 15.49, billing_cycle: "monthly" };
const yearly: Billable = { price: 139, billing_cycle: "yearly" };
// NBA League Pass style: Oct-Jun, wraps the year end.
const nba: Billable = {
  price: 109.99,
  billing_cycle: "seasonal",
  season_start_month: 10,
  season_end_month: 6,
};
// Season inside one calendar year: Mar-Sep.
const summer: Billable = {
  price: 70,
  billing_cycle: "seasonal",
  season_start_month: 3,
  season_end_month: 9,
};
const ALL_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

describe("monthly plans", () => {
  it("cost the price every month", () => {
    for (const m of ALL_MONTHS) expect(toMonthly(monthly, m)).toBe(15.49);
  });
  it("cost 12x the price per year", () => {
    expect(toYearly(monthly)).toBeCloseTo(185.88, 10);
  });
  it("handle a free plan", () => {
    const free: Billable = { price: 0, billing_cycle: "monthly" };
    expect(toMonthly(free, 1)).toBe(0);
    expect(toYearly(free)).toBe(0);
  });
});

describe("yearly plans", () => {
  it("spread the price over 12 months", () => {
    for (const m of ALL_MONTHS)
      expect(toMonthly(yearly, m)).toBeCloseTo(139 / 12, 10);
  });
  it("cost the price per year", () => {
    expect(toYearly(yearly)).toBe(139);
  });
});

describe("seasonal plans", () => {
  it("count season length inclusively, wrapping the year end", () => {
    expect(seasonLength(nba)).toBe(9); // Oct, Nov, Dec, Jan, Feb, Mar, Apr, May, Jun
    expect(seasonLength(summer)).toBe(7); // Mar..Sep
    expect(
      seasonLength({ ...nba, season_start_month: 5, season_end_month: 5 }),
    ).toBe(1);
    expect(
      seasonLength({ ...nba, season_start_month: 1, season_end_month: 12 }),
    ).toBe(12);
    expect(
      seasonLength({ ...nba, season_start_month: 12, season_end_month: 1 }),
    ).toBe(2);
  });

  it("know which months are in season when the season wraps the year end", () => {
    const inSeason = ALL_MONTHS.filter((m) => isInSeason(nba, m));
    expect(inSeason).toEqual([1, 2, 3, 4, 5, 6, 10, 11, 12]);
  });

  it("know which months are in season within one year", () => {
    const inSeason = ALL_MONTHS.filter((m) => isInSeason(summer, m));
    expect(inSeason).toEqual([3, 4, 5, 6, 7, 8, 9]);
  });

  it("spread the price over in-season months and cost 0 off season", () => {
    expect(toMonthly(nba, 10)).toBeCloseTo(109.99 / 9, 10); // season start
    expect(toMonthly(nba, 1)).toBeCloseTo(109.99 / 9, 10); // after the wrap
    expect(toMonthly(nba, 6)).toBeCloseTo(109.99 / 9, 10); // season end
    expect(toMonthly(nba, 7)).toBe(0); // off season
    expect(toMonthly(nba, 9)).toBe(0); // last off-season month
  });

  it("add up to the season price over a full year", () => {
    for (const sub of [nba, summer]) {
      const sum = ALL_MONTHS.reduce((total, m) => total + toMonthly(sub, m), 0);
      expect(sum).toBeCloseTo(sub.price, 10);
    }
  });

  it("cost the season price per year", () => {
    expect(toYearly(nba)).toBe(109.99);
  });

  it("treat a 12-month season like a yearly plan", () => {
    const allYear: Billable = {
      ...nba,
      season_start_month: 1,
      season_end_month: 12,
    };
    for (const m of ALL_MONTHS)
      expect(toMonthly(allYear, m)).toBeCloseTo(109.99 / 12, 10);
  });

  it("reject missing season months", () => {
    const broken: Billable = {
      price: 10,
      billing_cycle: "seasonal",
      season_start_month: 10,
    };
    expect(() => toMonthly(broken, 1)).toThrow(
      /season_start_month and season_end_month/,
    );
    expect(() => toYearly(broken)).toThrow(
      /season_start_month and season_end_month/,
    );
    expect(() =>
      seasonLength({ ...broken, season_start_month: null }),
    ).toThrow();
  });

  it("reject out-of-range season months", () => {
    expect(() => toYearly({ ...nba, season_start_month: 13 })).toThrow(
      RangeError,
    );
    expect(() => toYearly({ ...nba, season_end_month: 0 })).toThrow(RangeError);
  });
});

describe("month argument", () => {
  it("rejects months outside 1-12 for every cycle", () => {
    for (const sub of [monthly, yearly, nba]) {
      expect(() => toMonthly(sub, 0)).toThrow(RangeError);
      expect(() => toMonthly(sub, 13)).toThrow(RangeError);
      expect(() => toMonthly(sub, 2.5)).toThrow(RangeError);
    }
  });
});

describe("totals across several subscriptions", () => {
  it("sum Person 2's three Twitch subs plus Prime", () => {
    const twitch: Billable = { price: 5.99, billing_cycle: "monthly" };
    const subs = [twitch, twitch, twitch, yearly];
    const month = subs.reduce((t, s) => t + toMonthly(s, 11), 0);
    const year = subs.reduce((t, s) => t + toYearly(s), 0);
    expect(month).toBeCloseTo(3 * 5.99 + 139 / 12, 10);
    expect(year).toBeCloseTo(3 * 5.99 * 12 + 139, 10);
  });
});
