import { describe, expect, it } from "vitest";
import { z } from "zod";
import { newSubscriptionSchema, parsePrice } from "./schema";

const valid = {
  name: "Netflix",
  price: "15.49",
  billing_cycle: "monthly",
  next_billing_date: "2026-12-08",
  category: "streaming",
};

function errorsFor(input: Record<string, unknown>) {
  const result = newSubscriptionSchema.safeParse(input);
  return result.success ? {} : z.flattenError(result.error).fieldErrors;
}

describe("parsePrice", () => {
  it("accepts plain amounts, a leading $, and thousands commas", () => {
    expect(parsePrice("9.99")).toBe(9.99);
    expect(parsePrice("$9.99")).toBe(9.99);
    expect(parsePrice(" 15 ")).toBe(15);
    expect(parsePrice("1,200.50")).toBe(1200.5);
    expect(parsePrice(".99")).toBe(0.99);
    expect(parsePrice("0")).toBe(0);
  });
  it("rejects anything else", () => {
    for (const bad of [
      "",
      "abc",
      "9.999",
      "-5",
      "1e3",
      "9.99.9",
      "$",
      "12 34",
    ]) {
      expect(parsePrice(bad)).toBeNaN();
    }
  });
});

describe("newSubscriptionSchema", () => {
  it("accepts a valid subscription and cleans it up", () => {
    const result = newSubscriptionSchema.parse({
      ...valid,
      name: "  Netflix  ",
      price: "$15.49",
    });
    expect(result).toEqual({
      ...valid,
      price: 15.49,
      season_start_month: null,
      season_end_month: null,
      is_trial: false,
      trial_end_date: null,
    });
  });

  it("allows the same name twice (several Twitch subs)", () => {
    expect(errorsFor({ ...valid, name: "Twitch" })).toEqual({});
  });

  it("requires a name", () => {
    expect(errorsFor({ ...valid, name: "   " }).name).toEqual([
      "Enter the service name.",
    ]);
    expect(errorsFor({ ...valid, name: "x".repeat(101) }).name?.[0]).toMatch(
      /under 100/,
    );
  });

  it("explains bad prices", () => {
    expect(errorsFor({ ...valid, price: "abc" }).price).toEqual([
      "Enter a price like 9.99.",
    ]);
    expect(errorsFor({ ...valid, price: "-5" }).price).toEqual([
      "Enter a price like 9.99.",
    ]);
    expect(errorsFor({ ...valid, price: "20000" }).price?.[0]).toMatch(
      /under \$10,000/,
    );
    expect(errorsFor({ ...valid, price: "0" })).toEqual({}); // free plans are allowed
  });

  it("only accepts real calendar dates, including leap days", () => {
    expect(errorsFor({ ...valid, next_billing_date: "2028-02-29" })).toEqual(
      {},
    );
    expect(
      errorsFor({ ...valid, next_billing_date: "2027-02-29" })
        .next_billing_date,
    ).toEqual(["Choose a real date."]);
    expect(
      errorsFor({ ...valid, next_billing_date: "2026-04-31" })
        .next_billing_date,
    ).toBeDefined();
    expect(
      errorsFor({ ...valid, next_billing_date: "" }).next_billing_date,
    ).toBeDefined();
    expect(
      errorsFor({ ...valid, next_billing_date: "1999-12-31" })
        .next_billing_date?.[0],
    ).toMatch(/2000 and 2100/);
  });

  it("rejects unknown cycles and categories", () => {
    expect(
      errorsFor({ ...valid, billing_cycle: "weekly" }).billing_cycle,
    ).toBeDefined();
    expect(errorsFor({ ...valid, category: "movies" }).category).toEqual([
      "Choose a category.",
    ]);
  });

  it("accepts every category from the list", () => {
    for (const category of [
      "streaming",
      "gaming",
      "food_delivery",
      "shopping",
      "cloud_storage",
      "music",
      "sports",
      "other",
    ]) {
      expect(errorsFor({ ...valid, category })).toEqual({});
    }
  });
});

describe("seasonal plans", () => {
  const seasonal = {
    ...valid,
    name: "NBA League Pass",
    price: "109.99",
    billing_cycle: "seasonal",
    category: "sports",
  };

  it("accepts a season that wraps the year end (Oct-Jun)", () => {
    const result = newSubscriptionSchema.parse({
      ...seasonal,
      season_start_month: "10",
      season_end_month: "6",
    });
    expect(result).toMatchObject({
      billing_cycle: "seasonal",
      season_start_month: 10,
      season_end_month: 6,
    });
  });

  it("accepts a one-month season", () => {
    expect(
      errorsFor({
        ...seasonal,
        season_start_month: "5",
        season_end_month: "5",
      }),
    ).toEqual({});
  });

  it("requires both months", () => {
    expect(errorsFor(seasonal)).toEqual({
      season_start_month: ["Choose the month the season starts."],
      season_end_month: ["Choose the month the season ends."],
    });
    expect(
      errorsFor({
        ...seasonal,
        season_start_month: "10",
        season_end_month: "",
      }),
    ).toEqual({ season_end_month: ["Choose the month the season ends."] });
  });

  it("reports missing months together with other errors", () => {
    const errors = errorsFor({ ...seasonal, name: "", price: "abc" });
    expect(Object.keys(errors).sort()).toEqual([
      "name",
      "price",
      "season_end_month",
      "season_start_month",
    ]);
  });

  it("rejects months outside 1-12", () => {
    for (const bad of ["0", "13", "1.5", "abc"]) {
      expect(
        errorsFor({
          ...seasonal,
          season_start_month: bad,
          season_end_month: "6",
        }).season_start_month,
      ).toBeDefined();
    }
  });

  it("clears season months on monthly and yearly plans", () => {
    const result = newSubscriptionSchema.parse({
      ...valid,
      billing_cycle: "yearly",
      season_start_month: "10",
      season_end_month: "6",
    });
    expect(result.season_start_month).toBeNull();
    expect(result.season_end_month).toBeNull();
  });
});

describe("free trials", () => {
  const trial = {
    ...valid,
    name: "Xbox Game Pass",
    category: "gaming",
    next_billing_date: "",
    is_trial: "on",
    trial_end_date: "2026-12-10",
  };

  it("uses the trial end date as the first billing date", () => {
    const result = newSubscriptionSchema.parse(trial);
    expect(result.is_trial).toBe(true);
    expect(result.trial_end_date).toBe("2026-12-10");
    expect(result.next_billing_date).toBe("2026-12-10");
  });

  it("ignores a leftover next billing date on a trial", () => {
    const result = newSubscriptionSchema.parse({
      ...trial,
      next_billing_date: "2027-03-01",
    });
    expect(result.next_billing_date).toBe("2026-12-10");
  });

  it("requires the trial end date, but not the next billing date", () => {
    expect(errorsFor({ ...trial, trial_end_date: "" })).toEqual({
      trial_end_date: ["Choose the day the trial ends."],
    });
    expect(errorsFor({ ...trial, trial_end_date: undefined })).toEqual({
      trial_end_date: ["Choose the day the trial ends."],
    });
  });

  it("rejects impossible trial end dates, including Feb 29 outside leap years", () => {
    expect(errorsFor({ ...trial, trial_end_date: "2028-02-29" })).toEqual({});
    expect(
      errorsFor({ ...trial, trial_end_date: "2027-02-29" }).trial_end_date,
    ).toEqual(["Choose a real date."]);
    expect(
      errorsFor({ ...trial, trial_end_date: "2026-11-31" }).trial_end_date,
    ).toEqual(["Choose a real date."]);
  });

  it("reports a missing end date together with other errors", () => {
    const errors = errorsFor({ ...trial, price: "abc", trial_end_date: "" });
    expect(errors.price).toBeDefined();
    expect(errors.trial_end_date).toEqual(["Choose the day the trial ends."]);
  });

  it("is off unless the box is checked, and then drops the end date", () => {
    const result = newSubscriptionSchema.parse({
      ...valid,
      trial_end_date: "2026-12-10",
    });
    expect(result.is_trial).toBe(false);
    expect(result.trial_end_date).toBeNull();
    expect(result.next_billing_date).toBe(valid.next_billing_date);
  });

  it("still requires the next billing date when it isn't a trial", () => {
    expect(errorsFor({ ...valid, next_billing_date: "" })).toEqual({
      next_billing_date: ["Choose the next billing date."],
    });
  });

  it("works with seasonal plans", () => {
    const result = newSubscriptionSchema.parse({
      ...trial,
      name: "NBA League Pass",
      category: "sports",
      billing_cycle: "seasonal",
      season_start_month: "10",
      season_end_month: "6",
    });
    expect(result).toMatchObject({
      is_trial: true,
      next_billing_date: "2026-12-10",
      season_start_month: 10,
      season_end_month: 6,
    });
  });
});
