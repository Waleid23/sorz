import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = { title: "Calendar · Sorz" };

export default function CalendarPage() {
  return (
    <>
      <PageHeader title="Calendar" />
      <Placeholder>Upcoming renewals will show on a calendar here.</Placeholder>
    </>
  );
}
