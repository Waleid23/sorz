import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { saveSubscription } from "@/lib/subscriptions/actions";
import { toFormValues } from "@/lib/subscriptions/form-values";
import { getSubscription } from "@/lib/subscriptions/queries";
import { LoadError, SubscriptionFormSkeleton } from "../form-skeleton";
import { SubscriptionForm } from "../subscription-form";
import { DeleteSubscription } from "./delete-subscription";

export const metadata: Metadata = { title: "Edit subscription · Sorz" };

/** Loads the subscription and renders the filled-in form. Reads params and the session, so it sits behind Suspense. */
async function EditSubscription({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const sub = await getSubscription((await params).id);
  if (sub === "error") return <LoadError />;
  if (!sub) notFound();

  return (
    <div className="flex flex-col gap-8">
      <SubscriptionForm
        action={saveSubscription.bind(null, sub.id)}
        initialValues={toFormValues(sub)}
        submitLabel="Save changes"
        editing
      />
      <div className="flex flex-col gap-3">
        <Link
          href={`/subs/new?from=${sub.id}`}
          className="flex h-12 items-center justify-center rounded-xl border border-zinc-300 text-base font-medium hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Duplicate
        </Link>
        <DeleteSubscription
          id={sub.id}
          name={sub.label ? `${sub.name} (${sub.label})` : sub.name}
        />
      </div>
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
        <Suspense fallback={<SubscriptionFormSkeleton />}>
          <EditSubscription params={params} />
        </Suspense>
      </main>
    </>
  );
}
