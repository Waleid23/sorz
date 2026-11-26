import { z } from "zod";
import { CATEGORIES, FORM_BILLING_CYCLES } from "./options";

const categoryValues = CATEGORIES.map((c) => c.value) as [string, ...string[]];
const cycleValues = FORM_BILLING_CYCLES.map((c) => c.value) as [
  string,
  ...string[],
];

/** Largest price the form accepts (the column allows more; this catches typos). */
export const MAX_PRICE = 10_000;

/**
 * Turns what people type ("$9.99", "1,200", " 15 ") into a number.
 * Returns NaN for anything that isn't a plain amount with at most 2 decimals.
 */
export function parsePrice(input: string): number {
  const cleaned = input.trim().replace(/^\$/, "").replace(/,/g, "").trim();
  if (!/^\d+(\.\d{1,2})?$|^\.\d{1,2}$/.test(cleaned)) return NaN;
  return Number(cleaned);
}

/** A month select: "" (or missing) means not chosen; otherwise 1-12. */
const monthField = z
  .string()
  .optional()
  .transform((v) => (v ? Number(v) : null))
  .pipe(
    z
      .number()
      .int()
      .min(1, { error: "Choose a month." })
      .max(12, { error: "Choose a month." })
      .nullable(),
  );

/**
 * A date input: "" (or missing) means not filled in, and is reported by the
 * refinement below only when the date is actually needed.
 */
const dateField = z
  .string()
  .optional()
  .transform((v) => v || null)
  .pipe(
    z.iso
      .date({ error: "Choose a real date." })
      .refine((d) => d >= "2000-01-01" && d <= "2100-12-31", {
        error: "Choose a date between 2000 and 2100.",
      })
      .nullable(),
  );

const fieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Enter the service name." })
    .max(100, { error: "Keep the name under 100 characters." }),
  price: z
    .string()
    .transform(parsePrice)
    .pipe(
      z
        .number({ error: "Enter a price like 9.99." })
        .min(0, { error: "Price can't be negative." })
        .max(MAX_PRICE, {
          error: `Price must be under $${MAX_PRICE.toLocaleString()}.`,
        }),
    ),
  billing_cycle: z.enum(cycleValues, {
    error: "Choose how often you're billed.",
  }),
  next_billing_date: dateField,
  category: z.enum(categoryValues, { error: "Choose a category." }),
  season_start_month: monthField,
  season_end_month: monthField,
  is_trial: z
    .string()
    .optional()
    .transform((v) => v === "on"),
  trial_end_date: dateField,
});

/**
 * Validates the "Add subscription" form. Field names match the form inputs.
 * Season months are required for seasonal plans and cleared for the others
 * (matching the database constraint). A season may wrap the year end.
 * Trials need an end date, which also becomes the next billing date.
 */
export const newSubscriptionSchema = fieldsSchema
  .superRefine(
    (data, ctx) => {
      // A trial's first charge is when it ends, so the form asks for the
      // trial end date instead of the next billing date.
      if (data.is_trial && data.trial_end_date === null) {
        ctx.addIssue({
          code: "custom",
          path: ["trial_end_date"],
          message: "Choose the day the trial ends.",
        });
      }
      if (!data.is_trial && data.next_billing_date === null) {
        ctx.addIssue({
          code: "custom",
          path: ["next_billing_date"],
          message: "Choose the next billing date.",
        });
      }

      if (data.billing_cycle !== "seasonal") return;
      if (data.season_start_month === null) {
        ctx.addIssue({
          code: "custom",
          path: ["season_start_month"],
          message: "Choose the month the season starts.",
        });
      }
      if (data.season_end_month === null) {
        ctx.addIssue({
          code: "custom",
          path: ["season_end_month"],
          message: "Choose the month the season ends.",
        });
      }
    },
    // Run even when another field (e.g. price) already failed, so every
    // problem shows at once. Only reads billing_cycle, the trial flag, and
    // the date and month fields, which are safe to inspect on partly invalid
    // input (a field that failed to parse is never null, so it isn't
    // reported twice).
    { when: () => true },
  )
  .transform((data) => ({
    ...data,
    ...(data.billing_cycle !== "seasonal" && {
      season_start_month: null,
      season_end_month: null,
    }),
    // Trials are first charged the day they end; non-trials have no end date.
    // The refinement above guarantees the chosen date is present.
    next_billing_date: (data.is_trial
      ? data.trial_end_date
      : data.next_billing_date) as string,
    trial_end_date: data.is_trial ? data.trial_end_date : null,
  }));

export type NewSubscription = z.output<typeof newSubscriptionSchema>;
export type NewSubscriptionField = keyof NewSubscription;
