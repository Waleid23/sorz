import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { saveSubscription } from "@/lib/subscriptions/actions";
import { toDuplicateValues } from "@/lib/subscriptions/form-values";
import { getSubscription } from "@/lib/subscriptions/queries";
import { LoadError, SubscriptionFormSkeleton } from "../form-skeleton";
import { SubscriptionForm } from "../subscription-form";

export const metadata: Metadata = { title: "Add subscription · Sorz" };

/**
 * The add form. With `?from=<id>` (the Duplicate button) it starts as a copy
 * of that subscription. Reads the URL and session, so it sits behind Suspense.
 */
async function NewSubscription({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { from } = await searchParams;
  const source = typeof from === "string" ? await getSubscription(from) : null;
  if (source === "error") return <LoadError />;

  return (
    <div className="flex flex-col gap-5">
      {source && (
        <p
          role="status"
          className="rounded-xl bg-indigo-50 px-3 py-2 text-sm text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300"
        >
          Copied from {source.name}
          {source.label ? ` (${source.label})` : ""}. Add a label to tell them
          apart.
        </p>
      )}
      <SubscriptionForm
        // A fresh form for each source, so useActionState starts over.
        key={source ? source.id : "blank"}
        action={saveSubscription.bind(null, null)}
        initialValues={source ? toDuplicateValues(source) : undefined}
        submitLabel="Save subscription"
      />
    </div>
  );
}

export default function NewSubscriptionPage({
  searchParams,
}: PageProps<"/subs/new">) {
  return (
    <>
      <PageHeader title="Add subscription" backHref="/subs" />
      <main className="mx-auto w-full max-w-2xl px-4 py-6">
        <Suspense fallback={<SubscriptionFormSkeleton />}>
          <NewSubscription searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}
