import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = { title: "Shared plans · Sorz" };

export default function SharedPage() {
  return (
    <>
      <PageHeader title="Shared plans" />
      <Placeholder>
        Plans you split with friends, and who owes you, will show here.
      </Placeholder>
    </>
  );
}
