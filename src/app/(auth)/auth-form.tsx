"use client";

import Link from "next/link";
import { useActionState } from "react";
import { logIn, signUp } from "@/lib/auth/actions";
import { MIN_PASSWORD_LENGTH, type AuthFormState } from "@/lib/auth/messages";

const COPY = {
  login: {
    action: logIn,
    submit: "Log in",
    pending: "Logging in…",
    passwordAutoComplete: "current-password",
    switchText: "New to Sorz?",
    switchLink: { href: "/signup", label: "Create an account" },
  },
  signup: {
    action: signUp,
    submit: "Create account",
    pending: "Creating account…",
    passwordAutoComplete: "new-password",
    switchText: "Already have an account?",
    switchLink: { href: "/login", label: "Log in" },
  },
} as const;

const inputClass =
  "h-12 w-full rounded-xl border border-zinc-300 bg-white px-3 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-900";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const copy = COPY[mode];
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    copy.action,
    {},
  );

  return (
    <>
      <form action={formAction} className="flex flex-col gap-4" noValidate>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Email
          <input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            required
            defaultValue={state.email}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Password
          <input
            name="password"
            type="password"
            autoComplete={copy.passwordAutoComplete}
            required
            minLength={mode === "signup" ? MIN_PASSWORD_LENGTH : undefined}
            aria-describedby={mode === "signup" ? "password-hint" : undefined}
            className={inputClass}
          />
          {mode === "signup" && (
            <span
              id="password-hint"
              className="text-xs font-normal text-zinc-500"
            >
              At least {MIN_PASSWORD_LENGTH} characters.
            </span>
          )}
        </label>

        {/* Announced by screen readers when it appears. */}
        <div aria-live="polite" className="empty:hidden">
          {state.error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
              {state.error}
            </p>
          )}
          {state.message && (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
              {state.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="h-12 rounded-xl bg-indigo-600 text-base font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-60"
        >
          {pending ? copy.pending : copy.submit}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        {copy.switchText}{" "}
        <Link
          href={copy.switchLink.href}
          className="inline-block py-3 font-semibold text-indigo-600 dark:text-indigo-400"
        >
          {copy.switchLink.label}
        </Link>
      </p>
    </>
  );
}
