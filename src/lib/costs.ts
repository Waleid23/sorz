/**
 * Cost normalization. Every total in the app goes through these helpers;
 * never calculate monthly/yearly amounts inline.
 *
 * - monthly:  price is charged every month.
 * - yearly:   price is charged once a year; each month carries 1/12 of it.
 * - seasonal: price is the total for the season (e.g. NBA League Pass, Oct-Jun),
 *             charged once a year. It is spread evenly over the in-season months;
 *             off-season months cost 0.
 *
 * Amounts are not rounded here. Round only when displaying.
 */

export type BillingCycle = "monthly" | "yearly" | "seasonal";

/** 1 = January ... 12 = December. */
export type Month = number;

export type Billable = {
  price: number;
  billing_cycle: BillingCycle;
  season_start_month?: Month | null;
  season_end_month?: Month | null;
};

function assertMonth(month: Month, name: string): void {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError(
      `${name} must be a whole number from 1 to 12, got ${month}`,
    );
  }
}

function seasonBounds(sub: Billable): { start: Month; end: Month } {
  const start = sub.season_start_month;
  const end = sub.season_end_month;
  if (start == null || end == null) {
    throw new Error(
      "A seasonal subscription needs season_start_month and season_end_month",
    );
  }
  assertMonth(start, "season_start_month");
  assertMonth(end, "season_end_month");
  return { start, end };
}

/**
 * Number of months in the season, counting both ends.
 * Wraps the year end: Oct (10) to Jun (6) is 9 months. Start == end is 1 month.
 */
export function seasonLength(sub: Billable): number {
  const { start, end } = seasonBounds(sub);
  return ((end - start + 12) % 12) + 1;
}

/** Whether `month` falls inside the season (inclusive), including seasons that wrap the year end. */
export function isInSeason(sub: Billable, month: Month): boolean {
  assertMonth(month, "month");
  const { start, end } = seasonBounds(sub);
  return start <= end
    ? month >= start && month <= end
    : month >= start || month <= end;
}

/**
 * What the subscription costs in a given calendar month.
 * `month` only matters for seasonal plans (in season: price / season length; off season: 0).
 */
export function toMonthly(sub: Billable, month: Month): number {
  assertMonth(month, "month");
  switch (sub.billing_cycle) {
    case "monthly":
      return sub.price;
    case "yearly":
      return sub.price / 12;
    case "seasonal":
      return isInSeason(sub, month) ? sub.price / seasonLength(sub) : 0;
  }
}

/** What the subscription costs over a full year. */
export function toYearly(sub: Billable): number {
  switch (sub.billing_cycle) {
    case "monthly":
      return sub.price * 12;
    case "yearly":
      return sub.price;
    case "seasonal":
      seasonBounds(sub); // validate
      return sub.price;
  }
}
