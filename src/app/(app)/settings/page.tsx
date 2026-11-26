import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = { title: "Settings · Sorz" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" />
      <Placeholder>Reminder and account settings will show here.</Placeholder>
    </>
  );
}
