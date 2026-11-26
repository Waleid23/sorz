import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "../auth-form";
import { ConfirmFailedNotice } from "./confirm-failed-notice";

export const metadata: Metadata = { title: "Log in · Sorz" };

export default function LoginPage() {
  return (
    <>
      <h1 className="mb-6 text-xl font-semibold">Log in</h1>
      {/* Reads the URL, so it sits behind Suspense (cacheComponents). */}
      <Suspense fallback={null}>
        <ConfirmFailedNotice />
      </Suspense>
      <AuthForm mode="login" />
    </>
  );
}
