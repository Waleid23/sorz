# Sorz — Dev Log

Weeks are counted as the five-week moonshot. Week 1 was planning; week 2 was project setup. PLAN.md's "Week 6"–"Week 9" task lists are worked through in order from here, not tied to a specific moonshot week.

## 2026-11-14: Planning (week 1 of 5)

**Done**
- Defined the project: Sorz, a phone-first subscription and free-trial tracker with spending totals, renewal reminders, and shared-plan splitting.
- Wrote down feedback from two potential users (see PLAN.md) and turned it into requirements:
  - phone-first design
  - monthly, yearly, and seasonal billing (NBA League Pass)
  - several subscriptions of the same service (multiple Twitch subs)
  - categories beyond streaming (food delivery, gaming, shopping, cloud storage)
  - reminders, because someone forgot about DashPass
  - shared plans with automatic splits, because Crunchyroll is split by hand today
- Chose a stack: Next.js + TypeScript + Tailwind, Supabase (Postgres + Auth + RLS), Vercel, Resend + Vercel Cron for reminders. All have free tiers.
- Created PLAN.md (idea, users, data model, Weeks 6–9 tasks, stretch goals), CLAUDE.md, and this log.

**Decisions**
- Supabase over Firebase: the data is relational (subscriptions → shared plans → members → who owes what).
- Reminders run once a day because of the Vercel Hobby cron limit. That's fine for "renews in N days" alerts.
- Seasonal billing is stored as start and end months, so off-season months count as $0.

**Next**
- Week 6: scaffold the Next.js app, create the Supabase project, deploy to Vercel on day one, write the schema and RLS migrations, and add the cost-normalization helper with tests.

## 2026-11-21: Scaffold (week 2 of 5)

**Done**
- Scaffolded Next.js 16.4.6 (App Router, TypeScript, Tailwind v4, ESLint, `src/` directory, `@/*` import alias) into the repo root. It was generated in a temp folder and moved in so PLAN.md, CLAUDE.md, LOG.md, and README.md stayed untouched.
- `.gitignore` now uses the Next.js defaults plus an explicit `.env*.local` line (`.DS_Store` is still ignored).
- Added Prettier with `prettier-plugin-tailwindcss` (sorts Tailwind classes) and `eslint-config-prettier` (so ESLint and Prettier don't fight). New scripts: `npm run format` and `npm run format:check`. Markdown files are excluded so the planning docs aren't reformatted.
- `npm run lint`, `npm run format:check`, and `npm run build` all pass. Ticked the first Week 6 task in PLAN.md.

**Decisions**
- Kept the existing README.md instead of the create-next-app boilerplate.
- Kept the generated AGENTS.md: `next dev` re-creates it anyway, and it points agents at the bundled Next.js 16 docs.
- No Supabase yet.

**Next**
- Create the Supabase project and env vars, then deploy to Vercel.

## 2026-11-21: Rename to Sorz (week 2 of 5)

**Done**
- Renamed the project from SubTrack to Sorz. The GitHub repo is now github.com/Waleid23/sorz, and the local git remote points to it.
- Updated the name in package.json, package-lock.json, README.md, PLAN.md, CLAUDE.md, this log, and the app's page title and description metadata (replacing the create-next-app placeholder text).

**Next**
- Rename the local project folder (done by hand).
- Create the Supabase project and env vars, then deploy to Vercel.

## 2026-11-21: Connect Supabase (week 2 of 5)

**Done**
- Installed `@supabase/supabase-js` (2.119.2) and `@supabase/ssr` (0.12.7).
- Added `.env.local` with blank `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (filled in by hand, never pasted into chat) and a committed `.env.example` with the same names. `.env.local` is gitignored; added `!.env.example` so the template can be committed.
- Supabase helpers: `src/lib/supabase/client.ts` (browser), `src/lib/supabase/server.ts` (Server Components, Server Actions, Route Handlers), and `src/lib/supabase/proxy.ts` (`updateSession`).
- `src/proxy.ts` (Next.js 16's replacement for `middleware.ts`) calls `updateSession` on every non-static request to keep the login session fresh.
- Lint, format check, typecheck, and build pass; the dev server serves `/` with the env values still blank.

**Decisions**
- Used the new publishable key, not the legacy anon key. The service-role/secret key is not used anywhere yet.
- The proxy uses `supabase.auth.getClaims()` (verifies the JWT) rather than `getSession()`, and forwards the cache-control headers `@supabase/ssr` provides so CDNs don't cache auth cookies.
- The proxy skips Supabase when the env vars are empty, so the app still runs before they're filled in.
- No login redirect yet; that's the "protect routes" task later in Week 7.

**Next**
- Fill in `.env.local`, then add the same two vars in Vercel.
- Login/sign-up pages, then route protection in the proxy.

## 2026-11-21: Env vars and first Vercel deploy (week 2 of 5)

**Done**
- Filled in `.env.local` with the Supabase project URL and publishable key; checked the format and confirmed the Supabase auth API accepts the key (HTTP 200).
- Imported the GitHub repo into Vercel, added `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the project's environment variables, and redeployed.
- Live at https://sorz-eight.vercel.app (returns 200 with the "Sorz" title).
- Ticked the Week 6 "Supabase project + env vars" and "Deploy to Vercel" tasks in PLAN.md.

**Decisions**
- Skipped Vercel's optional Supabase integration: the Supabase project already exists, and the integration would add its own env vars (possibly including the service-role key) that the app doesn't use.

**Next**
- Database schema as SQL migrations, with RLS on every table.
- Phone app shell, seed data, and `toMonthly` / `toYearly` with Vitest tests.

## 2026-11-21: Week 2 of 5 wrap-up

**Done this week**
- Scaffolded the Next.js app (TypeScript, Tailwind, ESLint, Prettier).
- Renamed the project to Sorz.
- Connected Supabase: client helpers, session-refresh proxy, `.env.local` and `.env.example`.
- Added the env vars in Vercel and deployed: https://sorz-eight.vercel.app

Week 2 is done. The goal was to get the project set up, and it is.

**Next (week 3)**
- Database schema with RLS on every table.
- Phone app shell, seed data, and `toMonthly` / `toYearly` with tests.
- Then login and the subscription form.

## 2026-11-26: Database schema and RLS (week 3 of 5)

**Done**
- Added `supabase/migrations/20261126000000_initial_schema.sql`: `profiles`, `subscriptions`, `shared_plans`, `plan_members`, `reminders_sent`, following PLAN.md's data model.
- RLS is enabled on every table in the same migration, with owner-only policies. `plan_members` and `reminders_sent` check ownership through their parent row; `shared_plans` checks that you own both the plan and its subscription.
- Tested the migration in PGlite (in-memory Postgres) with stubbed `auth.users` / `auth.uid()`: 34 checks covering cross-user reads and writes, anonymous access, check constraints, the one-reminder-per-day rule, and cascade deletes. All pass, and the same tests fail when RLS is removed.
- Ticked the schema and RLS tasks in PLAN.md.

**Decisions**
- Categories, cycles and statuses are `text` with `check` constraints instead of Postgres enums, so adding one later is a simple constraint change.
- `subscriptions.name` is not unique; the optional `label` tells several subs of one service apart.
- Seasonal plans store the whole season's price; `season_start_month > season_end_month` means the season wraps the year end (Oct–Jun). Season months are required for seasonal plans and rejected otherwise.
- `user_id` / `owner_id` default to `auth.uid()`, so the app doesn't have to send them.
- `reminders_sent` has no insert policy: only the server-side cron (service role) writes to it. A unique key on (subscription, kind, date) stops duplicate reminders.
- No profile-on-signup trigger yet; that's the Week 7 task.

**Next**
- Apply the migration in the Supabase dashboard (SQL Editor).
- Phone app shell, seed data, and `toMonthly` / `toYearly` with Vitest tests.

## 2026-11-26: Phone app shell (week 3 of 5)

**Done**
- Moved the tab pages into a `src/app/(app)/` route group with its own layout, so the login page (week 7) can live outside it without the nav.
- `BottomNav` (client component): Home, Subs, Calendar, Shared, Settings with inline SVG icons; the active tab is highlighted and gets `aria-current="page"`. Each tab is 75×56px at 375px wide (target ≥ 44px).
- `PageHeader` (sticky title bar) and a `Placeholder` body; placeholder pages at `/`, `/subs`, `/calendar`, `/shared`, `/settings`.
- Root layout: `viewport-fit=cover` plus safe-area padding on the header and nav (iPhone notch and home indicator), and a light/dark `theme-color`.
- Fixed the font: an unlayered `body { font-family: Arial }` in globals.css was overriding Tailwind's `font-sans`, so Geist never loaded.
- Checked with Playwright emulating a 375px phone in light and dark mode: no horizontal scroll, the right tab is highlighted on every page, tapping between tabs and the back button both work. Lint, typecheck, format check, and build pass.

**Decisions**
- The nav is wrapped in `<Suspense>`: with `cacheComponents` on, `usePathname` suspends on dynamic routes like a future `/subs/[id]`. The fallback is the same nav with nothing highlighted.
- Each page renders its own `PageHeader`, so detail pages later can set their own title (and a back button).
- No icon library; five hand-drawn SVGs aren't worth a dependency.

**Next**
- Seed data, then `toMonthly` / `toYearly` with Vitest tests.

## 2026-11-26: Seed data (week 3 of 5)

**Done**
- Added `supabase/seed.sql`: Person 1 (Hulu, Netflix, seasonal NBA League Pass, DashPass, Crunchyroll shared with two friends) and Person 2 (yearly Prime, a Game Pass trial ending in 2 days, three Twitch subs with labels, iCloud+, Spotify). 12 subscriptions, one shared plan, two members, two profiles.
- Created test users `person1@sorz.test` and `person2@sorz.test` in Supabase Auth and ran the seed in the SQL Editor; 12 rows show in `subscriptions`.
- Tested in PGlite first: clear error if the test users are missing, re-running gives the same 12 rows, and another user's data is untouched.

**Decisions**
- There's one Supabase project (no local database), so the seed targets two dedicated test accounts and only ever deletes their rows. Deleting those users removes all seed data.
- Dates are relative to `current_date` so renewals always look upcoming; the seasonal plan bills on the next Oct 1.

**Next**
- `toMonthly` / `toYearly` with Vitest tests.

## 2026-11-26: Cost normalization (week 3 of 5)

**Done**
- `src/lib/costs.ts`: `toMonthly(sub, month)`, `toYearly(sub)`, plus `seasonLength` and `isInSeason`.
- Installed Vitest 5 (`npm test`, `npm run test:watch`; config in `vitest.config.mts`). Bumped `@types/node` from 20 to 24 to match the Node 24 runtime, which Vitest 5 requires.
- 16 tests in `src/lib/costs.test.ts`: every cycle, seasons that wrap the year end (Oct–Jun) and ones that don't, one-month and twelve-month seasons, a season's months adding back up to its price, bad or missing months, and a multi-sub total (three Twitch subs + Prime). Breaking the season-length formula makes 3 tests fail.
- That finishes the Week 6 (scaffold) list in PLAN.md.

**Decisions**
- `toMonthly` takes the calendar month, because a seasonal plan's monthly cost depends on it: in season it's price ÷ season length, off season it's 0. For monthly and yearly plans the month doesn't change the result.
- A seasonal plan's yearly cost is its season price (charged once a year).
- No rounding in the helpers; round only when displaying, so sums don't drift.
- Helpers throw on bad input (missing season months, month outside 1–12) instead of silently returning 0.

**Next**
- Week 7 list: sign up / log in / log out, then protect routes.

## 2026-11-26: Sign up, log in, log out (week 3 of 5)

**Done**
- `/login` and `/signup` pages in a `(auth)` route group (centered card, no bottom nav). Inputs are 48px tall with 16px text so iOS Safari doesn't zoom; email keyboard and password-manager autocomplete hints.
- Server Actions in `src/lib/auth/actions.ts`: `logIn` (`signInWithPassword`), `signUp` (with `emailRedirectTo` = this site's `/auth/confirm`), `logOut`. Forms use `useActionState` for errors and a pending button.
- `src/lib/auth/messages.ts`: form validation (valid email, 8+ character password on sign-up) and Supabase error codes mapped to short messages; raw errors never reach the UI. 6 new tests (22 total).
- `/auth/confirm` route exchanges the email link's code for a session; on failure it sends you to `/login?confirm=failed`, which explains what happened.
- Settings has an Account section (inside `<Suspense>`, since it reads the session cookie) showing the logged-in email and a Log out button.
- Supabase: Site URL set to the Vercel URL; `http://localhost:3000/**` and `https://sorz-eight.vercel.app/**` added to Redirect URLs.
- Tested: Playwright at 375px (wrong password error against the real project, sign-up validation, page links, bad confirmation code, Settings when logged out); logged in and out by hand as `person1@sorz.test`.

**Decisions**
- Email + password only for now; a magic-link option could come during polish.
- Sign-up with "Confirm email" on shows a "check your inbox" message instead of logging straight in.
- Not yet tested end to end: a brand-new sign-up through a real confirmation email (Supabase's built-in email is limited to a few per hour).

**Next**
- Protect routes: redirect logged-out users to `/login` in the proxy.
- Create a profile row when a user signs up.

## 2026-11-26: Protect routes (week 3 of 5)

**Done**
- `src/lib/auth/routes.ts`: `routeDecision(pathname, loggedIn)`. Logged out: every app page goes to `/login`; `/login`, `/signup` and `/auth/*` are let through. Logged in: `/login` and `/signup` go to `/`. 7 new tests (29 total), including look-alike paths such as `/login-help` and `/authx` staying protected.
- The proxy (`src/lib/supabase/proxy.ts`) applies it using the `getClaims()` result it already fetched, and copies refreshed auth cookies and cache-control headers onto the redirect.
- Tested: curl against a production build (all tabs and `/subs/123` redirect to `/login` when logged out; login, sign-up, and the confirm link stay open), and by hand while logged in (home after login, `/login` sends you home, log out then `/subs` goes to `/login`).

**Decisions**
- Next.js 16 calls middleware "proxy"; the PLAN.md task says middleware but it lives in `src/proxy.ts`.
- The proxy only controls which pages open; RLS still protects the data itself.
- No "return to the page you wanted after login" yet; it needs a safe-redirect check and isn't needed for the MVP.

**Next**
- Create a profile row when a user signs up.

## 2026-11-26: Profile row on sign-up (week 3 of 5)

**Done**
- Migration `20261126010000_create_profile_on_signup.sql`: an `after insert` trigger on `auth.users` calls `public.handle_new_user()`, which inserts a `profiles` row (defaults: USD, 3 reminder days, no display name). It also backfills profiles for existing accounts without overwriting the seeded display names.
- Tested in PGlite (7 checks, including that removing the trigger makes the sign-up check fail), then applied in the Supabase SQL Editor. Adding `person3@sorz.test` in the dashboard created its profile row.

**Decisions**
- The function is `security definer` (a brand-new user has no session, so RLS would block the insert) with an empty `search_path` and schema-qualified names, and `execute` is revoked from `anon` / `authenticated` so it can't be called as an API.
- `display_name` starts empty (NULL) rather than being guessed from the email; the app can fall back to the email and let users set a name in Settings.

**Next**
- "Add subscription" form: name, price, cycle, next billing date, category.

## 2026-11-26: "Add subscription" form (week 3 of 5)

**Done**
- `/subs/new` with fields for service name, price (`$9.99` and `1,200` accepted; decimal keypad), billed monthly/yearly (two big radio buttons), next billing date (native date picker), and category (all 8). The Subs tab has an "Add subscription" button and shows "Subscription saved." after a save. `PageHeader` gained an optional back arrow.
- `addSubscription` Server Action re-checks the session, validates with zod (`src/lib/subscriptions/schema.ts`), inserts the row, and redirects to `/subs?added=1`. Errors show under each field, and typed values stay filled in.
- Installed zod 4. 9 new tests (38 total): price parsing, real calendar dates including Feb 29 only in leap years, unknown cycles and categories, and duplicate names allowed.
- Saved the test account's login in `.env.local` (gitignored) so Playwright can test logged-in pages.
- Tested end to end with Playwright at 375px against the real Supabase project: login, empty-form errors, bad price, a valid yearly save, then read the row back through the API as person1 (correct owner; person1 sees only their own 6 rows). The test row was deleted afterwards.

**Decisions**
- Seasonal isn't offered in the form yet; it arrives with its season-month fields in the next task.
- Started using zod now rather than writing throwaway validation; the later "zod validation, empty and loading states" task still covers the rest.
- Price is capped at $10,000 in the form to catch typos (the column allows more).

**Next**
- Seasonal fields, the trial toggle, then the subscription list grouped by category.

## 2026-11-26: Subscription list grouped by category (week 3 of 5)

**Done**
- The Subs tab lists the user's subscriptions grouped by category, in the fixed category order, each with an emoji icon on a tinted circle, a count, and a monthly subtotal. Rows show name, label, Trial / Paused / Cancelled badges, "Renews Dec 8" (or "Trial ends ..."), and price with "/mo", "/yr" or "/season". There's an empty state, an error message, and a loading skeleton; the list streams in behind `<Suspense>` while the rest of the page is prerendered.
- `groupByCategory` (`src/lib/subscriptions/group.ts`) sorts active subs first, then by soonest renewal, then name and label, and totals each group with `toMonthly` for the current month. Paused and cancelled subs are listed last and left out of totals.
- `src/lib/format.ts`: `formatMoney`, `cycleSuffix`, `formatShortDate` (formats in UTC so "2026-12-01" never shows as Nov 30; adds the year when it isn't this year).
- 11 new tests (49 total), passing in both America/Los_Angeles and Asia/Tokyo time zones.
- Tested as person1 with Playwright at 375px in light and dark mode: 3 groups with correct subtotals (Streaming $37.47, Food Delivery $9.99, Sports $12.22 = $109.99 ÷ 9 in season), no horizontal scroll, and a subscription added through the form shows up immediately (test row deleted afterwards).

**Decisions**
- Built the list before the seasonal and trial form fields (PLAN.md order swapped) so saved subscriptions are visible in the app.
- Emoji icons instead of an icon library: colorful, native on phones, no dependency.
- Group subtotals use the current month (UTC), so a seasonal plan counts only in season.

**Next**
- Seasonal fields in the form, then the free-trial toggle.

## 2026-11-26: Seasonal fields in the form (week 3 of 5)

**Done**
- "Seasonal" joined Monthly and Yearly in the add form. Choosing it shows "Season starts" / "Season ends" month pickers, relabels the price "Price for the season" (with a hint), and adds a hint to the billing date. The pickers aren't rendered, or submitted, for other cycles.
- Schema: season months are required for seasonal plans (each missing one gets its own message) and cleared to null for monthly and yearly plans, matching the database constraint. Seasons can wrap the year end (Sep–Jan) or be a single month. 6 new tests (55 total).
- Tested with Playwright as person1: fields appear and disappear with the cycle, missing months and a bad price are all reported together, and a Sep–Jan $350 season saves as seasonal 9→1. The Sports subtotal shows $82.22 ($350 ÷ 5 + $109.99 ÷ 9 in November). Test row deleted.

**Bugs found and fixed**
- zod skipped the season-month check whenever another field (like price) failed to parse, so month errors only showed on a second try. Fixed with the refinement's `when` option.
- React 19 resets a form after its action runs. That snapped the controlled billing-cycle radios back to "Monthly" while the season fields stayed visible, so fixing an error and saving stored a monthly plan. Fixed by submitting through `onSubmit` + `startTransition`, which skips the reset and keeps everything the user entered.

**Noticed**
- iCloud is syncing the Desktop folder (`~/Desktop` is linked into iCloud Drive) and has been creating " 2" copies of files, including in `.next`, where `routes.d 2.ts` broke the typecheck. Removed the copies in `.next`; the untracked " 2" files in the repo are still there.

**Next**
- Free-trial toggle with a trial end date.

## 2026-11-26: Free-trial toggle (week 3 of 5)

**Done**
- Moved the project out of iCloud's Desktop folder to `~/Projects/sorz`, so no more " 2" duplicate files. Git, `.env.local`, and all tests came across fine. Updated the Status section in CLAUDE.md, which still said sign-up was next.
- The add form has a "Free trial" switch (a checkbox with `role="switch"`, the whole 58px row is tappable). Turning it on replaces "Next billing date" with "Trial ends" and adds "What you'll pay once the trial ends." under the price.
- Schema: `is_trial` comes from the checkbox; a trial needs an end date, which is also saved as `next_billing_date` (the first charge), the same way the seeded Game Pass trial is stored. Non-trials save `trial_end_date` as null. Missing-date errors show alongside other errors on the first try. Impossible dates now say "Choose a real date." instead of "Choose the next billing date." 8 new tests (63 total), including Feb 29 in leap and non-leap years and a seasonal trial.
- Tested with Playwright (Chrome, 375px, light and dark) as person1: the fields swap with the switch, price and end-date errors show together, the switch, cycle, and name survive an error, and a yearly trial saves with `is_trial = true` and `trial_end_date = next_billing_date = 2026-12-10`. The list shows the Trial badge and "Trial ends Dec 10". Test row deleted.

**Decisions**
- One date for trials instead of two: the first charge is the day the trial ends, so asking for both would invite mismatches.
- Trial end dates in the past are allowed (same 2000–2100 range as other dates), so an old trial can be entered after the fact. Week 8's trial actions handle converting or cancelling.
- Trials still count toward category subtotals at their after-trial price. Whether a trial should count before it converts is left for the Week 8 dashboard and trials work.

**Noticed**
- In dark mode, the native date picker's calendar icon is dark on a dark background (both date fields, not new). A `color-scheme: dark` on the inputs would fix it during polish.

**Next**
- Edit and delete a subscription; mark it as cancelled or paused.

## 2026-11-26: Edit, delete, pause, and cancel (week 3 of 5)

**Done**
- Rows in the Subs list are now links (with a chevron) to `/subs/[id]`, an edit page that reuses the add form filled in with the saved values. The edit form adds a Status choice (Active / Paused / Cancelled) with a note that paused and cancelled subs don't count toward spending.
- Delete button at the bottom of the edit page asks for confirmation first ("Delete Twitch (streamerA)?", with "Keep it" focused) and suggests Paused or Cancelled as the alternative.
- One `saveSubscription(id | null)` Server Action handles add and edit; `deleteSubscription(id)` handles delete. Both re-check the session, reject malformed ids, and use `.select("id")` to tell "saved" from "not found" (RLS hides other users' rows). After saving, `/subs` shows "Changes saved." or "Subscription deleted."
- The edit page reads `params` and the database inside `<Suspense>` (Cache Components) and shows Next's not-found page for unknown or malformed ids.
- Renamed `newSubscriptionSchema` to `subscriptionSchema` (it covers editing now) and moved the form to `src/app/(app)/subs/subscription-form.tsx`. Added `status` to the schema (defaults to active, so the add form doesn't send it) and `toFormValues` (`src/lib/subscriptions/form-values.ts`). 6 new tests (69 total), including that saving an unchanged monthly, seasonal, or trial sub gives back the same row.
- Tested with Playwright (Chrome, 375px, light and dark) as person1 on a throwaway row: tap a row, every field is filled in, bad price keeps the edits, saving turns a trial off and pauses it ($17.99, Paused badge, label untouched in the database), unknown and malformed ids show not found, "Keep it" cancels, delete removes the row from the list and the database. No console errors. Re-ran the trial test too.

**Bugs found and fixed**
- The dev server logged "encountered the unstable value `Date.now()` while prerendering" on `/subs` (already there before this change) and on the new edit page. Supabase checks token expiry with `Date.now()`; Next.js 16 wants such code marked request-time only. Fixed with `await connection()` in the server `createClient()`, which covers every page that reads the database.

**Decisions**
- Status lives in the edit form rather than separate quick buttons: one place to change things, and fewer actions to build. Quick actions could come with polish.
- The label isn't in the form yet, so editing leaves it untouched; the label field is the next task.

**Next**
- "Duplicate" action and an optional label field (multiple Twitch subs).

## 2026-11-26: Label field and Duplicate (week 3 of 5)

**Done**
- Pushed the trial toggle and edit/delete commits; Vercel deploys from `main`.
- "Label (optional)" field under Service in the add and edit forms, with a hint about telling several subs of one service apart. Trimmed; blank saves as null; up to 100 characters (matching the column).
- "Duplicate" button on the edit page opens `/subs/new?from=<id>`: the add form filled in from that subscription with the label cleared and status active, plus a "Copied from Twitch (streamerA). Add a label to tell them apart." note. Nothing is saved until you press Save. A malformed or unknown `from` just gives a blank form.
- `getSubscription(id)` (`src/lib/subscriptions/queries.ts`) is shared by the edit and add pages; `toDuplicateValues` builds the copy. The form skeleton and load-error message moved to `src/app/(app)/subs/form-skeleton.tsx`.
- 4 new tests (73 total): label optional, trimmed, 100-character limit, and duplicate values.
- Tested with Playwright at 375px as person1: the edit form shows the label; Duplicate copies name, price and date but not the label or status; a price error keeps the new label; saving gives two rows ("streamerA" still paused, "streamerB" active) in the list and the database; tapping "Add subscription" afterwards gives a blank form; clearing a label saves null. Re-ran the trial and edit tests (all pass). No console errors or server warnings.

**Decisions**
- Duplicate opens a pre-filled form instead of copying straight to the database, so you can give the copy its label before saving and nothing half-finished gets created.
- `/subs/new` now reads the URL, so the form streams in behind `<Suspense>` with a skeleton (it shows for a moment).

**Noticed**
- Next.js 16 keeps the previous page mounted but hidden after navigating (so two `#name` inputs can exist at once). The app behaves correctly; Playwright tests need `:visible` locators.

**Next**
- Quick-add presets for common services, then the zod validation, empty and loading states pass.

## 2026-11-26: Quick-add presets (week 3 of 5)

**Done**
- Pushed the label/Duplicate commit.
- "Quick add" row at the top of the add form: 16 chips (Netflix, Hulu, Disney+, YouTube Premium, Crunchyroll, Twitch, Spotify, Apple Music, DashPass, Uber One, Xbox Game Pass, PlayStation Plus, Amazon Prime, iCloud+, Google One, NBA League Pass) in a sideways-scrolling row, each with its category emoji. Chips are 44px tall; the page itself doesn't scroll sideways.
- Tapping a chip fills in the name, category and billing cycle (NBA League Pass also gets an Oct–Jun season), highlights the chip, and puts the cursor in Price (or Label for Twitch). Not shown on the edit page or when duplicating.
- Presets live in `src/lib/subscriptions/presets.ts`. 4 new tests (77 total): the services users named are there, names are unique, categories and cycles are valid, each preset passes the form schema once a price and date are added, and only seasonal presets have season months.
- Tested with Playwright at 375px (light and dark): Netflix, Prime, NBA League Pass, then Spotify (season fields go away), and a Twitch preset saved with a label; values survive a validation error; no presets on edit or duplicate; no console errors. Re-ran the trial, edit and duplicate tests (all pass).

**Decisions**
- Presets leave the price blank: prices differ by plan (Netflix has several tiers) and change often, and a stale number would quietly make totals wrong. Easy to add typical prices later if wanted.
- Prime defaults to yearly; it can be switched to monthly in the form.

**Next**
- Last Week 7 task: the zod validation, empty and loading states check (mostly in place already).

## 2026-11-26: Validation, empty and loading states (week 3 of 5)

**Done**
- Pushed the presets commit.
- Audited the task: the subscription forms already validate with zod on the server (add, edit, delete), the Subs list has empty, error and loading states, every data read has a `<Suspense>` skeleton, and every submit button has a pending label. Two gaps found and fixed:
  - Sign-up validation was hand-written and had no upper password limit, so a password over 72 bytes (Supabase's bcrypt limit) got "Something went wrong." It now uses zod (`z.email()`, 8+ characters, at most 72 bytes) and says "Password must be 72 characters or fewer." 2 new tests (79 total), including emoji passwords (4 bytes each).
  - On a phone, tapping Save at the bottom of the subscription form could put the error off screen (e.g. on Service at the top), so nothing seemed to happen. After a failed save the form now focuses and scrolls to the first field with a problem.
- Tested with Playwright at 375×667: a 73-character sign-up password shows the new message (no account created); an empty form saved from the bottom jumps to Service; a form missing only the date jumps to the date. Re-ran the trial, edit, duplicate and presets tests (all pass).
- That finishes the Week 7 list. Updated CLAUDE.md's status.

**Noticed**
- A one-off hydration warning in a test run came from Playwright hiding the text cursor for a screenshot before React hydrated (it adds `caret-color: transparent`), not from the app. Screenshots in the tests now use `caret: "initial"`; three clean re-runs.

**Decisions**
- Error boundaries (`error.tsx`) and the 404 page stay with the Week 9 "error handling and toasts; 404 page" task.

**Next**
- Week 8 list, starting with the renewal date math (moving past dates forward by cycle, skipping off-season months) and its tests, since the dashboard, calendar and "upcoming" list all depend on it.
