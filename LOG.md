# SubTrack — Dev Log

## 2026-11-14: Planning

**Done**
- Defined the project: SubTrack, a phone-first subscription and free-trial tracker with spending totals, renewal reminders, and shared-plan splitting.
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

## 2026-11-21: Week 6 scaffold

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
