"use client";

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import type { SubscriptionFormState } from "@/lib/subscriptions/actions";
import type { SubscriptionFormValues } from "@/lib/subscriptions/form-values";
import {
  CATEGORIES,
  FORM_BILLING_CYCLES,
  MONTHS,
  STATUSES,
} from "@/lib/subscriptions/options";
import type { SubscriptionField } from "@/lib/subscriptions/schema";

const inputClass =
  "h-12 w-full rounded-xl border border-zinc-300 bg-white px-3 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 aria-invalid:border-red-500 dark:border-zinc-700 dark:bg-zinc-900";

function Field({
  name,
  label,
  hint,
  error,
  children,
}: {
  name: SubscriptionField;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
      )}
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
function errorProps(name: SubscriptionField, error?: string) {
  return error
    ? { "aria-invalid": true, "aria-describedby": `${name}-error` }
    : {};
}

/** Big tappable radio buttons in a row (billing cycle, status). */
function SegmentedChoice({
  name,
  legend,
  options,
  value,
  onChange,
  error,
  hint,
}: {
  name: SubscriptionField;
  legend: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
}) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-sm font-medium">{legend}</legend>
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => (
          <label key={option.value} className="relative">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <span className="flex h-12 cursor-pointer items-center justify-center rounded-xl border border-zinc-300 text-base font-medium peer-checked:border-indigo-600 peer-checked:bg-indigo-50 peer-checked:text-indigo-700 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 dark:border-zinc-700 dark:peer-checked:border-indigo-400 dark:peer-checked:bg-indigo-950/50 dark:peer-checked:text-indigo-300">
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {hint && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
      )}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </fieldset>
  );
}

/**
 * The add and edit subscription form. `action` is `saveSubscription` with
 * the subscription id bound (null when adding). The status choice only
 * shows when editing.
 */
export function SubscriptionForm({
  action,
  initialValues = {},
  submitLabel,
  editing = false,
}: {
  action: (
    state: SubscriptionFormState,
    formData: FormData,
  ) => Promise<SubscriptionFormState>;
  initialValues?: SubscriptionFormValues;
  submitLabel: string;
  editing?: boolean;
}) {
  const [state, formAction, pending] = useActionState<
    SubscriptionFormState,
    FormData
  >(action, { values: initialValues });
  const errors = state.errors ?? {};
  const values = state.values ?? {};
  // Controlled so the season fields can appear and disappear as it changes.
  const [cycle, setCycle] = useState<string>(values.billing_cycle || "monthly");
  const seasonal = cycle === "seasonal";
  const [trial, setTrial] = useState(values.is_trial === "on");
  const [status, setStatus] = useState<string>(values.status || "active");

  // React resets a form after its `action` runs, which would snap the
  // controlled billing-cycle radios back to their first value while the
  // season fields stay visible. Submitting manually skips that reset, so
  // everything the user entered stays put when there's an error.
  function submitWithoutReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form
      action={formAction}
      onSubmit={submitWithoutReset}
      className="flex flex-col gap-5"
      noValidate
    >
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

      <Field
        name="price"
        label={seasonal ? "Price for the season" : "Price"}
        hint={
          [
            seasonal && "The total you pay for the whole season.",
            trial && "What you'll pay once the trial ends.",
          ]
            .filter(Boolean)
            .join(" ") || undefined
        }
        error={errors.price}
      >
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

      <SegmentedChoice
        name="billing_cycle"
        legend="Billed"
        options={FORM_BILLING_CYCLES}
        value={cycle}
        onChange={setCycle}
        error={errors.billing_cycle}
      />

      {/* Only rendered (and submitted) for seasonal plans. */}
      {seasonal && (
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              ["season_start_month", "Season starts"],
              ["season_end_month", "Season ends"],
            ] as const
          ).map(([name, label]) => (
            <Field key={name} name={name} label={label} error={errors[name]}>
              <select
                id={name}
                name={name}
                defaultValue={values[name] ?? ""}
                className={inputClass}
                {...errorProps(name, errors[name])}
              >
                <option value="" disabled>
                  Month…
                </option>
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </Field>
          ))}
        </div>
      )}

      <label className="flex min-h-12 cursor-pointer items-center justify-between gap-4 rounded-xl border border-zinc-300 px-3 py-2 dark:border-zinc-700">
        <span className="flex flex-col">
          <span className="text-base font-medium">Free trial</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Not charged until the trial ends
          </span>
        </span>
        <input
          type="checkbox"
          role="switch"
          name="is_trial"
          checked={trial}
          onChange={(e) => setTrial(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="relative h-7 w-12 shrink-0 rounded-full bg-zinc-300 transition-colors peer-checked:bg-indigo-600 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 peer-focus-visible:ring-offset-2 after:absolute after:top-0.5 after:left-0.5 after:size-6 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5 dark:bg-zinc-700 dark:peer-checked:bg-indigo-500"
        />
      </label>

      {/* A trial's first charge is the day it ends, so only one date is asked
          for. Only the visible date is rendered (and submitted). */}
      {trial ? (
        <Field
          name="trial_end_date"
          label="Trial ends"
          hint="You'll be charged for the first time on this day."
          error={errors.trial_end_date}
        >
          <input
            id="trial_end_date"
            name="trial_end_date"
            type="date"
            defaultValue={values.trial_end_date}
            className={`${inputClass} appearance-none`}
            {...errorProps("trial_end_date", errors.trial_end_date)}
          />
        </Field>
      ) : (
        <Field
          name="next_billing_date"
          label="Next billing date"
          hint={seasonal ? "When you're next charged for a season." : undefined}
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
      )}

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

      {editing && (
        <SegmentedChoice
          name="status"
          legend="Status"
          options={STATUSES}
          value={status}
          onChange={setStatus}
          error={errors.status}
          hint="Paused and cancelled subscriptions don't count toward your spending."
        />
      )}

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
          {pending ? "Saving…" : submitLabel}
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
