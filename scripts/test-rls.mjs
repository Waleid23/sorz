// Row-level security check for the subscriptions table, run against the
// real Supabase project: `npm run test:rls`.
//
// It logs in as two test users (A = TEST_USER_*, B = TEST_USER2_* in
// .env.local) and as a logged-out visitor, then tries to read, change,
// delete, and create subscriptions that aren't theirs. Every one of those
// attempts must fail. Control checks confirm A *can* use their own row, so a
// broken setup (e.g. nothing readable at all) can't pass by accident.
//
// It only touches rows it creates (named "ZZ RLS check") and deletes them at
// the end, even if a check fails. Exits with code 1 if any check fails.

import { createClient } from "@supabase/supabase-js";

const env = process.env;
const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "TEST_USER_EMAIL",
  "TEST_USER_PASSWORD",
  "TEST_USER2_EMAIL",
  "TEST_USER2_PASSWORD",
];
const missing = required.filter((name) => !env[name]);
if (missing.length) {
  console.error(`Missing in .env.local: ${missing.join(", ")}`);
  process.exit(1);
}

const NAME = "ZZ RLS check";
const newClient = () =>
  createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

async function logIn(email, password) {
  const client = newClient();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(`Couldn't log in as ${email}: ${error.message}`);
  return { client, id: data.user.id, email };
}

let failures = 0;
function check(ok, description, detail = "") {
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${description}${detail ? `  (${detail})` : ""}`,
  );
  if (!ok) failures++;
}

const row = (user_id) => ({
  user_id,
  name: NAME,
  category: "other",
  price: 1,
  billing_cycle: "monthly",
  next_billing_date: "2030-01-01",
});

const a = await logIn(env.TEST_USER_EMAIL, env.TEST_USER_PASSWORD);
const b = await logIn(env.TEST_USER2_EMAIL, env.TEST_USER2_PASSWORD);
const anon = newClient();
console.log(`User A: ${a.email}\nUser B: ${b.email}\n`);

try {
  // Setup: A and B each create one subscription.
  const { data: aRow, error: aErr } = await a.client
    .from("subscriptions")
    .insert(row(a.id))
    .select("id, price")
    .single();
  if (aErr) throw new Error(`A couldn't create a test row: ${aErr.message}`);
  const { data: bRow, error: bErr } = await b.client
    .from("subscriptions")
    .insert(row(b.id))
    .select("id")
    .single();
  if (bErr) throw new Error(`B couldn't create a test row: ${bErr.message}`);

  // Controls: A can use their own row.
  {
    const { data } = await a.client
      .from("subscriptions")
      .select("id")
      .eq("id", aRow.id);
    check(data?.length === 1, "A can read their own subscription");
    const { data: updated } = await a.client
      .from("subscriptions")
      .update({ price: 2 })
      .eq("id", aRow.id)
      .select("id");
    check(updated?.length === 1, "A can edit their own subscription");
  }

  // Reading
  {
    const { data } = await b.client
      .from("subscriptions")
      .select("id")
      .eq("id", aRow.id);
    check(data?.length === 0, "B can't read A's subscription by its id");

    const { data: all } = await b.client
      .from("subscriptions")
      .select("user_id");
    const others = (all ?? []).filter((r) => r.user_id !== b.id).length;
    check(
      all !== null && others === 0,
      "B's full list contains only B's own subscriptions",
      `${all?.length ?? 0} rows, ${others} not B's`,
    );

    const { data: aAll } = await a.client
      .from("subscriptions")
      .select("user_id");
    const aOthers = (aAll ?? []).filter((r) => r.user_id !== a.id).length;
    check(
      aAll !== null && aOthers === 0,
      "A's full list contains only A's own subscriptions",
      `${aAll?.length ?? 0} rows, ${aOthers} not A's`,
    );
  }

  // Editing
  {
    const { data } = await b.client
      .from("subscriptions")
      .update({ price: 999 })
      .eq("id", aRow.id)
      .select("id");
    const { data: after } = await a.client
      .from("subscriptions")
      .select("price")
      .eq("id", aRow.id)
      .single();
    check(
      (data?.length ?? 0) === 0 && Number(after?.price) === 2,
      "B can't edit A's subscription",
      `price is still ${after?.price}`,
    );

    const { data: moved, error } = await b.client
      .from("subscriptions")
      .update({ user_id: a.id })
      .eq("id", bRow.id)
      .select("id");
    check(
      Boolean(error) || (moved?.length ?? 0) === 0,
      "B can't hand their own subscription over to A",
      error ? `blocked: ${error.code}` : "",
    );
  }

  // Deleting
  {
    const { data } = await b.client
      .from("subscriptions")
      .delete()
      .eq("id", aRow.id)
      .select("id");
    const { data: still } = await a.client
      .from("subscriptions")
      .select("id")
      .eq("id", aRow.id);
    check(
      (data?.length ?? 0) === 0 && still?.length === 1,
      "B can't delete A's subscription",
    );
  }

  // Creating
  {
    const { error } = await b.client.from("subscriptions").insert(row(a.id));
    check(
      Boolean(error),
      "B can't create a subscription in A's name",
      error ? `blocked: ${error.code}` : "insert succeeded",
    );
  }

  // Logged out
  {
    const { data } = await anon.from("subscriptions").select("id");
    check(
      data !== null && data.length === 0,
      "A logged-out visitor can't read any subscriptions",
      `${data?.length ?? "no"} rows`,
    );
    const { error } = await anon.from("subscriptions").insert(row(a.id));
    check(
      Boolean(error),
      "A logged-out visitor can't create a subscription",
      error ? `blocked: ${error.code}` : "insert succeeded",
    );
    const { data: changed } = await anon
      .from("subscriptions")
      .update({ price: 999 })
      .eq("id", aRow.id)
      .select("id");
    check(
      (changed?.length ?? 0) === 0,
      "A logged-out visitor can't edit a subscription",
    );
  }
} finally {
  // Clean up: each user deletes their own test rows (RLS only allows that).
  await a.client.from("subscriptions").delete().eq("name", NAME);
  await b.client.from("subscriptions").delete().eq("name", NAME);
  const { data: leftA } = await a.client
    .from("subscriptions")
    .select("id")
    .eq("name", NAME);
  const { data: leftB } = await b.client
    .from("subscriptions")
    .select("id")
    .eq("name", NAME);
  const left = (leftA?.length ?? 0) + (leftB?.length ?? 0);
  console.log(
    left === 0
      ? "\nTest rows cleaned up."
      : `\nWARNING: ${left} test rows left behind.`,
  );
}

console.log(
  failures === 0
    ? "All RLS checks passed."
    : `${failures} RLS check(s) FAILED.`,
);
process.exit(failures === 0 ? 0 : 1);
