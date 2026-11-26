"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { newSubscriptionSchema, type NewSubscriptionField } from "./schema";

export type AddSubscriptionState = {
  /** First problem with each field, keyed by input name. */
  errors?: Partial<Record<NewSubscriptionField, string>>;
  /** A problem with the whole form (e.g. the save failed). */
  formError?: string;
  /** What was typed, so the form can show it again after an error. */
  values?: Partial<Record<NewSubscriptionField, string>>;
};

const FIELDS: NewSubscriptionField[] = [
  "name",
  "price",
  "billing_cycle",
  "next_billing_date",
  "category",
  "season_start_month",
  "season_end_month",
  "is_trial",
  "trial_end_date",
];

export async function addSubscription(
  _prev: AddSubscriptionState,
  formData: FormData,
): Promise<AddSubscriptionState> {
  const values = Object.fromEntries(
    FIELDS.map((field) => [field, String(formData.get(field) ?? "")]),
  ) as Record<NewSubscriptionField, string>;

  const parsed = newSubscriptionSchema.safeParse(values);
  if (!parsed.success) {
    const errors: AddSubscriptionState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as NewSubscriptionField;
      errors[field] ??= issue.message;
    }
    return { errors, values };
  }

  // Re-check the session here: Server Actions can be called directly, so
  // don't rely on the page being protected. RLS also enforces ownership.
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims.sub;
  if (!userId) redirect("/login");

  const { error } = await supabase
    .from("subscriptions")
    .insert({ ...parsed.data, user_id: userId });
  if (error) {
    console.error("addSubscription insert failed:", error.code, error.message);
    return {
      formError: "Couldn't save the subscription. Please try again.",
      values,
    };
  }

  redirect("/subs?added=1");
}
