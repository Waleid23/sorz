import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = { title: "Subscriptions · Sorz" };

export default function SubsPage() {
  return (
    <>
      <PageHeader title="Subscriptions" />
      <Placeholder>
        Your subscriptions, grouped by category, will show here.
      </Placeholder>
    </>
  );
}
