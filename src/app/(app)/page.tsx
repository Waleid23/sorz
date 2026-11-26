import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = { title: "Home · Sorz" };

export default function HomePage() {
  return (
    <>
      <PageHeader title="Home" />
      <Placeholder>
        Your monthly and yearly spending will show here.
      </Placeholder>
    </>
  );
}
