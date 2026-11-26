# CLAUDE.md

## Project
Sorz is a phone-first subscription tracker web app (Artifact 5 moonshot, a five-week solo project). Users track subscriptions and free trials, see monthly and yearly spending, get renewal reminders, and manage shared plans they split with friends.

**Read [PLAN.md](PLAN.md) first.** It has the user research, requirements, data model, and the week-by-week task list. Update the checkboxes there as tasks are finished.
**Add an entry to [LOG.md](LOG.md)** at the end of each work session (date, what was done, decisions, next steps).

## Stack
- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres, Auth, Row Level Security)
- Vercel hosting; Vercel Cron + Resend for reminder emails
- Vitest for unit tests

## Rules for this project
- **Phone first.** Design at ~375px wide first, then scale up. Tap targets ≥ 44px. Bottom navigation.
- **Billing cycles** are `monthly`, `yearly`, and `seasonal`. All totals go through the shared normalization helpers (`toMonthly` / `toYearly`). Never calculate totals inline.
- **Categories** include Streaming, Gaming, Food Delivery, Shopping, Cloud Storage, Music, Sports, and Other, not just streaming.
- **Multiple subscriptions of the same service** (e.g. several Twitch subs) must be supported. Use the `label` field; never assume names are unique.
- **Security:** every table has RLS enabled. Never expose the Supabase service-role key to the client; use it only in server code such as the cron route.
- **Date math** (renewals, trials, seasons) must have unit tests, including month-end and leap-year cases.
- Keep changes small and focused, matching the PLAN.md tasks. Don't write code for features outside the current week's scope unless asked.

## Status
Week 3 of 5 in progress (week 1 was planning, week 2 setup). The app is live at https://sorz-eight.vercel.app. Done so far: Supabase connected (client helpers in `src/lib/supabase/`, session refresh and route protection in `src/proxy.ts`), schema with RLS (`supabase/migrations/`), seed data for two test users (`supabase/seed.sql`), phone app shell with bottom nav, `toMonthly` / `toYearly` in `src/lib/costs.ts`, email + password auth with a profile row created on sign-up, the "Add subscription" form (monthly, yearly, seasonal) and the Subs list grouped by category. Tests: `npm test`. Next: the remaining Week 7 tasks in PLAN.md (free-trial toggle, edit/delete, duplicate + label, quick-add presets).
