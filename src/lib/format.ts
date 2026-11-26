import type { BillingCycle } from "@/lib/costs";

/** $15.49, $139.00. Rounds to cents only here, at display time. */
export function formatMoney(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    amount,
  );
}

/** "/mo", "/yr", "/season": appended to a subscription's price. */
export function cycleSuffix(cycle: BillingCycle): string {
  return { monthly: "/mo", yearly: "/yr", seasonal: "/season" }[cycle];
}

/**
 * "Dec 1" for a YYYY-MM-DD date (adds the year when it isn't `currentYear`).
 * Formats in UTC: parsing "2026-12-01" gives midnight UTC, which local time
 * in the Americas would show as Nov 30.
 */
export function formatShortDate(isoDate: string, currentYear?: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  const showYear =
    currentYear !== undefined && date.getUTCFullYear() !== currentYear;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(showYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  });
}
