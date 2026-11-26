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
