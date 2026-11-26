import { describe, expect, it } from "vitest";
import { cycleSuffix, formatMoney, formatShortDate } from "./format";

describe("formatMoney", () => {
  it("shows dollars and cents", () => {
    expect(formatMoney(15.49)).toBe("$15.49");
    expect(formatMoney(139)).toBe("$139.00");
    expect(formatMoney(0)).toBe("$0.00");
    expect(formatMoney(1200.5)).toBe("$1,200.50");
  });
  it("rounds unrounded totals to cents", () => {
    expect(formatMoney(139 / 12)).toBe("$11.58");
    expect(formatMoney(109.99 / 9)).toBe("$12.22");
  });
});

describe("cycleSuffix", () => {
  it("labels each cycle", () => {
    expect(cycleSuffix("monthly")).toBe("/mo");
    expect(cycleSuffix("yearly")).toBe("/yr");
    expect(cycleSuffix("seasonal")).toBe("/season");
  });
});

describe("formatShortDate", () => {
  it("doesn't shift the day with the time zone", () => {
    // Would print "Nov 30" if parsed as UTC but formatted in US local time.
    expect(formatShortDate("2026-12-01")).toBe("Dec 1");
    expect(formatShortDate("2027-01-01")).toBe("Jan 1");
  });
  it("handles month ends and leap days", () => {
    expect(formatShortDate("2026-01-31")).toBe("Jan 31");
    expect(formatShortDate("2028-02-29")).toBe("Feb 29");
  });
  it("adds the year only when it isn't the current one", () => {
    expect(formatShortDate("2026-12-08", 2026)).toBe("Dec 8");
    expect(formatShortDate("2027-10-01", 2026)).toBe("Oct 1, 2027");
  });
});
