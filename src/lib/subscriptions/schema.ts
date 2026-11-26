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

/** Validates the "Add subscription" form. Field names match the form inputs. */
export const newSubscriptionSchema = z.object({
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
  next_billing_date: z.iso
    .date({ error: "Choose the next billing date." })
    .refine((d) => d >= "2000-01-01" && d <= "2100-12-31", {
      error: "Choose a date between 2000 and 2100.",
    }),
  category: z.enum(categoryValues, { error: "Choose a category." }),
});

export type NewSubscription = z.infer<typeof newSubscriptionSchema>;
export type NewSubscriptionField = keyof NewSubscription;
