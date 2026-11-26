import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { AddedNotice } from "./added-notice";
import {
  SubscriptionList,
  SubscriptionListSkeleton,
} from "./subscription-list";

export const metadata: Metadata = { title: "Subscriptions · Sorz" };

export default function SubsPage() {
  return (
    <>
      <PageHeader title="Subscriptions" />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-6">
        {/* Reads the URL, so it sits behind Suspense (cacheComponents). */}
        <Suspense fallback={null}>
          <AddedNotice />
        </Suspense>
        <Link
          href="/subs/new"
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 text-base font-semibold text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          <span aria-hidden="true" className="text-xl leading-none">
            +
          </span>
          Add subscription
        </Link>
        {/* Reads the session and database, so it streams in behind Suspense. */}
        <Suspense fallback={<SubscriptionListSkeleton />}>
          <SubscriptionList />
        </Suspense>
      </main>
    </>
  );
}
