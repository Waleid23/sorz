"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { SubscriptionFormValues } from "./form-values";
import { subscriptionSchema, type SubscriptionField } from "./schema";

export type SubscriptionFormState = {
  /** First problem with each field, keyed by input name. */
  errors?: Partial<Record<SubscriptionField, string>>;
  /** A problem with the whole form (e.g. the save failed). */
  formError?: string;
  /** What was typed, so the form can show it again after an error. */
  values?: SubscriptionFormValues;
};

export type DeleteSubscriptionState = { error?: string };

const FIELDS: SubscriptionField[] = [
  "name",
  "price",
  "billing_cycle",
  "next_billing_date",
  "category",
  "season_start_month",
  "season_end_month",
  "is_trial",
  "trial_end_date",
  "status",
];

const isId = (id: unknown): id is string => z.uuid().safeParse(id).success;

/**
 * Server Actions can be called directly, so re-check the session instead of
 * relying on the page being protected. RLS also limits every query to the
 * user's own rows.
 */
async function requireUser() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims.sub;
  if (!userId) redirect("/login");
  return { supabase, userId };
}

/**
 * Saves the add or edit form. With no `subscriptionId` it adds a new
 * subscription; otherwise it updates that one. Bind the id before passing
 * it to the form: `saveSubscription.bind(null, id)`.
 */
export async function saveSubscription(
  subscriptionId: string | null,
  _prev: SubscriptionFormState,
  formData: FormData,
): Promise<SubscriptionFormState> {
  const values = Object.fromEntries(
    FIELDS.map((field) => [field, String(formData.get(field) ?? "")]),
  ) as Record<SubscriptionField, string>;

  const parsed = subscriptionSchema.safeParse(values);
  if (!parsed.success) {
    const errors: SubscriptionFormState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as SubscriptionField;
      errors[field] ??= issue.message;
    }
    return { errors, values };
  }

  const { supabase, userId } = await requireUser();

  if (subscriptionId === null) {
    const { error } = await supabase
      .from("subscriptions")
      .insert({ ...parsed.data, user_id: userId });
    if (error) {
      console.error("add subscription failed:", error.code, error.message);
      return {
        formError: "Couldn't save the subscription. Please try again.",
        values,
      };
    }
    redirect("/subs?added=1");
  }

  if (!isId(subscriptionId)) {
    return { formError: "This subscription doesn't exist.", values };
  }
  // RLS turns someone else's row into zero matches, so ask for the updated
  // row back to tell "saved" apart from "not found".
  const { data, error } = await supabase
    .from("subscriptions")
    .update(parsed.data)
    .eq("id", subscriptionId)
    .select("id");
  if (error) {
    console.error("update subscription failed:", error.code, error.message);
    return {
      formError: "Couldn't save your changes. Please try again.",
      values,
    };
  }
  if (data.length === 0) {
    return {
      formError:
        "This subscription no longer exists. It may have been deleted.",
      values,
    };
  }
  redirect("/subs?updated=1");
}

/** Deletes a subscription (and, through the database, its shared plan and reminder history). */
export async function deleteSubscription(
  subscriptionId: string,
): Promise<DeleteSubscriptionState> {
  if (!isId(subscriptionId))
    return { error: "This subscription doesn't exist." };
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("subscriptions")
    .delete()
    .eq("id", subscriptionId)
    .select("id");
  if (error) {
    console.error("delete subscription failed:", error.code, error.message);
    return { error: "Couldn't delete the subscription. Please try again." };
  }
  if (data.length === 0) {
    return { error: "This subscription no longer exists." };
  }
  redirect("/subs?deleted=1");
}
