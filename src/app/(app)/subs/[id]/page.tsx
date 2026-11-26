import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { PageHeader } from "@/components/page-header";
import { saveSubscription } from "@/lib/subscriptions/actions";
import { toFormValues } from "@/lib/subscriptions/form-values";
import {
  SUBSCRIPTION_COLUMNS,
  type Subscription,
} from "@/lib/subscriptions/types";
import { createClient } from "@/lib/supabase/server";
import { SubscriptionForm } from "../subscription-form";
import { DeleteSubscription } from "./delete-subscription";

export const metadata: Metadata = { title: "Edit subscription · Sorz" };

/** Loads the subscription and renders the filled-in form. Reads params and the session, so it sits behind Suspense. */
async function EditSubscription({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  // RLS only returns the user's own rows, so someone else's id is "not found".
  const supabase = await createClient();
  const { data: sub, error } = await supabase
    .from("subscriptions")
    .select(SUBSCRIPTION_COLUMNS)
    .eq("id", id)
    .maybeSingle<Subscription>();

  if (error) {
    console.error("EditSubscription query failed:", error.code, error.message);
    return (
      <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
        Couldn&apos;t load this subscription. Refresh the page to try again.
      </p>
    );
  }
  if (!sub) notFound();

  return (
    <div className="flex flex-col gap-8">
      <SubscriptionForm
        action={saveSubscription.bind(null, sub.id)}
        initialValues={toFormValues(sub)}
        submitLabel="Save changes"
        editing
      />
      <DeleteSubscription
        id={sub.id}
        name={sub.label ? `${sub.name} (${sub.label})` : sub.name}
      />
    </div>
  );
}

function EditSubscriptionSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-[4.75rem] animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900"
        />
      ))}
    </div>
  );
}

export default function EditSubscriptionPage({
  params,
}: PageProps<"/subs/[id]">) {
  return (
    <>
      <PageHeader title="Edit subscription" backHref="/subs" />
      <main className="mx-auto w-full max-w-2xl px-4 py-6">
        <Suspense fallback={<EditSubscriptionSkeleton />}>
          <EditSubscription params={params} />
        </Suspense>
      </main>
    </>
  );
}
