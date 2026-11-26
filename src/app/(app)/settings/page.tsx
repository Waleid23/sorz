import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { Placeholder } from "@/components/placeholder";
import { AccountSection } from "./account-section";

export const metadata: Metadata = { title: "Settings · Sorz" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" />
      <section
        className="mx-auto w-full max-w-2xl px-4 pt-6"
        aria-labelledby="account-heading"
      >
        <h2
          id="account-heading"
          className="mb-3 text-sm font-semibold text-zinc-500 uppercase"
        >
          Account
        </h2>
        <Suspense
          fallback={
            <div className="h-28 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />
          }
        >
          <AccountSection />
        </Suspense>
      </section>
      <Placeholder>Reminder settings will show here.</Placeholder>
    </>
  );
}
