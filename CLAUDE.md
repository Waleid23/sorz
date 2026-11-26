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
Week 2 of 5 done (week 1 was planning, week 2 setup). The Next.js app is scaffolded, Supabase is connected (client helpers in `src/lib/supabase/`, session refresh in `src/proxy.ts`), and the app is live at https://sorz-eight.vercel.app. Week 3 so far: the schema with RLS is applied (`supabase/migrations/`), the phone app shell with bottom nav is live, seed data for two test users is loaded (`supabase/seed.sql`), and `toMonthly` / `toYearly` are in `src/lib/costs.ts` with Vitest tests (`npm test`). Next: the Week 7 list in PLAN.md, starting with sign up / log in.
