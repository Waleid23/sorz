"use client";

import Link from "next/link";
import { useActionState, type ReactNode } from "react";
import {
  addSubscription,
  type AddSubscriptionState,
} from "@/lib/subscriptions/actions";
import { CATEGORIES, FORM_BILLING_CYCLES } from "@/lib/subscriptions/options";
import type { NewSubscriptionField } from "@/lib/subscriptions/schema";

const inputClass =
  "h-12 w-full rounded-xl border border-zinc-300 bg-white px-3 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 aria-invalid:border-red-500 dark:border-zinc-700 dark:bg-zinc-900";

function Field({
  name,
  label,
  error,
  children,
}: {
  name: NewSubscriptionField;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p
          id={`${name}-error`}
          className="text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/** aria attributes that link an input to its error message. */
function errorProps(name: NewSubscriptionField, error?: string) {
  return error
    ? { "aria-invalid": true, "aria-describedby": `${name}-error` }
    : {};
}

export function SubscriptionForm() {
  const [state, formAction, pending] = useActionState<
    AddSubscriptionState,
    FormData
  >(addSubscription, {});
  const errors = state.errors ?? {};
  const values = state.values ?? {};
  const cycle = values.billing_cycle || "monthly";

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <Field name="name" label="Service" error={errors.name}>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="e.g. Netflix"
          autoComplete="off"
          autoCapitalize="words"
          maxLength={100}
          defaultValue={values.name}
          className={inputClass}
          {...errorProps("name", errors.name)}
        />
      </Field>

      <Field name="price" label="Price" error={errors.price}>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-500">
            $
          </span>
          <input
            id="price"
            name="price"
            type="text"
            inputMode="decimal"
            placeholder="9.99"
            autoComplete="off"
            defaultValue={values.price}
            className={`${inputClass} pl-7`}
            {...errorProps("price", errors.price)}
          />
        </div>
      </Field>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-sm font-medium">Billed</legend>
        <div className="grid grid-cols-2 gap-2">
          {FORM_BILLING_CYCLES.map((option) => (
            <label key={option.value} className="relative">
              <input
                type="radio"
                name="billing_cycle"
                value={option.value}
                defaultChecked={cycle === option.value}
                className="peer sr-only"
              />
              <span className="flex h-12 cursor-pointer items-center justify-center rounded-xl border border-zinc-300 text-base font-medium peer-checked:border-indigo-600 peer-checked:bg-indigo-50 peer-checked:text-indigo-700 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 dark:border-zinc-700 dark:peer-checked:border-indigo-400 dark:peer-checked:bg-indigo-950/50 dark:peer-checked:text-indigo-300">
                {option.label}
              </span>
            </label>
          ))}
        </div>
        {errors.billing_cycle && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.billing_cycle}
          </p>
        )}
      </fieldset>

      <Field
        name="next_billing_date"
        label="Next billing date"
        error={errors.next_billing_date}
      >
        <input
          id="next_billing_date"
          name="next_billing_date"
          type="date"
          defaultValue={values.next_billing_date}
          className={`${inputClass} appearance-none`}
          {...errorProps("next_billing_date", errors.next_billing_date)}
        />
      </Field>

      <Field name="category" label="Category" error={errors.category}>
        <select
          id="category"
          name="category"
          defaultValue={values.category || "streaming"}
          className={inputClass}
          {...errorProps("category", errors.category)}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </Field>

      <div aria-live="polite" className="empty:hidden">
        {state.formError && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
            {state.formError}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="h-12 rounded-xl bg-indigo-600 text-base font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save subscription"}
        </button>
        <Link
          href="/subs"
          className="flex h-12 items-center justify-center rounded-xl text-base font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
