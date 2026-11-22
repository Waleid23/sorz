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
