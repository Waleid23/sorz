import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { SubscriptionForm } from "./subscription-form";

export const metadata: Metadata = { title: "Add subscription · Sorz" };

export default function NewSubscriptionPage() {
  return (
    <>
      <PageHeader title="Add subscription" backHref="/subs" />
      <main className="mx-auto w-full max-w-2xl px-4 py-6">
        <SubscriptionForm />
      </main>
    </>
  );
}
