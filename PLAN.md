# Sorz — Project Plan

Artifact 5 moonshot · solo · five weeks (Weeks 6–9 for core work, plus stretch time)

## The idea

Sorz is a phone-first web app for keeping track of subscriptions and free trials. Users can:

- See every subscription in one place, grouped by category
- See what they spend per month and per year
- Get reminders before a renewal or a free trial's end
- Track shared plans they split with friends: who is on which plan, each person's share, and who still owes money

## Who it's for

People with a lot of subscriptions spread across streaming, gaming, food delivery, shopping, and cloud storage, who:

- lose track of what they pay for (and forget subscriptions they no longer use)
- split plans with friends and work out each person's share by hand
- mostly use their phone

## What potential users said

**Person 1**
- Pays for Hulu, Netflix, Crunchyroll, and NBA League Pass.
- Shares Crunchyroll with other people.
- Forgot about a DoorDash DashPass subscription.
- Splits shared plans by working out the price themselves and sending money.
- Would use it on their phone.

**Person 2**
- Pays for Amazon Prime, Xbox Game Pass, Twitch subscriptions, and iCloud+, among others.

### What this means for the design

| What users said | Requirement |
|---|---|
| "Would use it on my phone" | Phone-first layout (designed for ~375px wide first), big tap targets, bottom navigation, installable as a PWA later |
| NBA League Pass, Prime, Netflix | Billing cycles: **monthly**, **yearly**, and **seasonal** (pays only for part of the year, e.g. Oct–Jun) |
| Several Twitch subs | Adding many small subscriptions of the same kind should be quick: a "duplicate" button and an optional label like "Twitch — streamerA" |
| DashPass, Game Pass, iCloud+, Prime | Categories beyond streaming: Streaming, Gaming, Food Delivery, Shopping, Cloud Storage, Music, Sports, Other |
| Forgot about DashPass | Renewal and trial-end reminders; a dashboard that makes forgotten charges easy to spot |
| Shares Crunchyroll and works out the split by hand | Shared plans with members, automatic per-person share, and paid/owed status |

## Stack

| Layer | Choice | Free tier |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | — |
| Styling | **Tailwind CSS** (mobile-first by default) | — |
| Database + Auth | **Supabase** (Postgres + Supabase Auth + Row Level Security) | 500 MB database, 50k monthly active users |
| Hosting | **Vercel** (Hobby plan) | Free for personal, non-commercial use |
| Reminder emails | **Resend** | ~100 emails/day |
| Scheduled jobs | **Vercel Cron** | Hobby plan: runs once a day |

### Why this stack
- One repo and one language (TypeScript) for the frontend and backend. Server Actions and route handlers replace a separate API server.
- Supabase gives a real Postgres database (relational data suits users → subscriptions → shared plans → members) plus login (email/password, magic link, Google) without writing auth code.
- Row Level Security enforces in the database that each user can only see their own rows.
- Vercel deploys every push, including preview URLs for branches.

### Tradeoffs and risks
- **Supabase free projects pause after about a week of no activity.** It's a one-click restore, but do it before demos. A scheduled ping can keep the project awake.
- **Vercel Hobby cron runs at most once a day**, so reminders are checked daily rather than at an exact hour. That's fine for "renews in 3 days" alerts.
- **Vendor lock-in**: Supabase Auth and RLS are specific to Supabase. The data itself is plain Postgres and easy to export.
- **Learning curve**: App Router (server vs. client components) and RLS policies are the hardest new concepts. Week 6 covers both early.
- **Alternatives considered:**
  - *Firebase*: easy auth, but its NoSQL database makes shared-plan and owed-money queries awkward.
  - *Neon + Prisma + Auth.js*: more control, more setup, and more pieces to connect.
  - *Separate React + Express on Render*: Render's free servers sleep (slow cold starts), and it means two deploys to manage.

## Data model (draft)

- **profiles**: id (= auth user), display_name, currency, reminder_days_before (default 3)
- **subscriptions**: id, user_id, name, label (e.g. the streamer's name), category, price, currency, billing_cycle (`monthly` | `yearly` | `seasonal`), season_start_month, season_end_month, next_billing_date, is_trial, trial_end_date, status (`active` | `paused` | `cancelled`), notes, created_at
- **shared_plans**: id, subscription_id, owner_id, split_type (`equal` | `custom`)
- **plan_members**: id, shared_plan_id, name, contact (optional), share_amount, paid_through_date / status (`paid` | `owes`)
- **reminders_sent**: id, subscription_id, kind (`renewal` | `trial_end`), for_date. This stops the same reminder from being sent twice.

**How costs are normalized:** monthly cost = price for monthly plans; price ÷ 12 for yearly plans; for seasonal plans, the season's total price spread across the active months (shown as "in season" and "off season").

## Weekly breakdown

Each item is meant to be a small, testable piece (roughly one sitting).

### Week 6: Scaffold
- [x] Create a Next.js + TypeScript + Tailwind app; set up ESLint and Prettier
- [x] Create the Supabase project; add env vars to `.env.local` and Vercel
- [x] Deploy "hello world" to Vercel (deploy on day one)
- [x] App shell for phones: header, bottom nav (Home, Subs, Calendar, Shared, Settings), placeholder pages
- [x] Write the database schema as SQL migrations (tables above) and commit them
- [x] Turn on RLS for every table, with owner-only policies
- [x] Add seed data (Person 1's and Person 2's subscriptions) for local testing
- [x] Write a cost-normalization helper (`toMonthly`, `toYearly`) plus unit tests (Vitest), including seasonal cases

### Week 7: Accounts and adding subscriptions
- [x] Sign up, log in, log out (email + password or magic link)
- [x] Protect routes with middleware; send logged-out users to login
- [ ] Create a profile row when a user signs up
- [ ] "Add subscription" form: name, price, cycle, next billing date, category
- [ ] Seasonal fields appear only when "seasonal" is selected
- [ ] Free trial toggle with a trial end date
- [ ] Subscription list grouped by category, with category icons/colors
- [ ] Edit and delete a subscription; mark it as cancelled or paused
- [ ] "Duplicate" action and an optional label field (multiple Twitch subs)
- [ ] Quick-add presets for common services (Netflix, Hulu, Crunchyroll, DashPass, Game Pass, iCloud+, Prime, Twitch...)
- [ ] Form validation (zod) and empty and loading states

### Week 8: Dashboard, calendar, and trials
- [ ] Dashboard: total per month and per year (normalized)
- [ ] Spending by category (simple bar or donut chart)
- [ ] "Upcoming in the next 7 days" list
- [ ] Calendar view: month grid with dots on renewal days; tap a day to see what renews
- [ ] Calculate next renewal dates (move past dates forward by cycle; skip off-season months)
- [ ] Trials section: days left, with trials ending in under 3 days highlighted
- [ ] "Convert trial to paid" and "Cancelled before charge" actions
- [ ] Tests for date math (month-end edge cases like Jan 31 → Feb 28, leap years)

### Week 9: Shared plans, reminders, and polish
- [ ] Mark a subscription as shared; add members by name
- [ ] Even split calculated automatically; custom amounts as an option
- [ ] For each member: paid / owes, and a "mark paid" button
- [ ] "Who owes me" summary on the Shared tab and dashboard
- [ ] Show only your own share in your spending totals, with an option to show the full price
- [ ] Settings: how many days before to remind, on/off for email reminders
- [ ] Daily Vercel Cron route: find upcoming renewals and trial ends, email them with Resend, record them in `reminders_sent`
- [ ] Polish: accessibility check (labels, contrast, focus), dark mode, check on real phones (iOS Safari, Android Chrome)
- [ ] Error handling and toasts; 404 page
- [ ] README with screenshots and the live link; final deploy

### Stretch goals
- [ ] Installable PWA (manifest + icons) and web push notifications
- [ ] Invite friends via link so they can see their own share and mark it as paid
- [ ] Payment links (Venmo/Cash App deep links) in "owes" reminders
- [ ] Prices in multiple currencies
- [ ] "Unused?" prompts: ask whether a subscription is still used after N months
- [ ] Price change history ("Netflix went up $2")
- [ ] CSV export / import
- [ ] Other billing cycles: weekly, quarterly, custom number of months
- [ ] Spending trends over time

## Definition of done (MVP)
A new user on a phone can sign up, add their subscriptions (including a seasonal one, a trial, and several of the same service), see accurate monthly and yearly totals, see upcoming renewals on a calendar, split a plan with friends and track who has paid, and receive a reminder email before a renewal. All of this works on the deployed Vercel URL.
