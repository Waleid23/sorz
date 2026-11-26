import Link from "next/link";
import { logOut } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";

const buttonClass =
  "flex h-12 w-full items-center justify-center rounded-xl text-base font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";

/** Shows who is logged in, with a log-out button. Reads the session, so render it inside <Suspense>. */
export async function AccountSection() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims.email;

  if (!email) {
    return (
      <Link
        href="/login"
        className={`${buttonClass} bg-indigo-600 text-white hover:bg-indigo-500`}
      >
        Log in
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Logged in as{" "}
        <span className="font-medium break-all text-zinc-900 dark:text-zinc-100">
          {email}
        </span>
      </p>
      <form action={logOut}>
        <button
          type="submit"
          className={`${buttonClass} border border-zinc-300 text-red-600 hover:bg-red-50 dark:border-zinc-700 dark:text-red-400 dark:hover:bg-red-950/40`}
        >
          Log out
        </button>
      </form>
    </div>
  );
}
