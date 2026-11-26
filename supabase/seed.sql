-- Sorz seed data: the two potential users from PLAN.md, for testing.
--
-- Before running: create two users in the Supabase dashboard
-- (Authentication -> Users -> Add user -> Create new user, tick "Auto Confirm User"):
--   person1@sorz.test
--   person2@sorz.test
-- Then paste this whole file into the SQL Editor and run it.
--
-- Safe to re-run: it first deletes these two test users' subscriptions (shared
-- plans and members go with them via cascade) and inserts everything fresh.
-- It never touches any other user's data.
-- Dates are relative to today, so renewals always look upcoming.
-- Prices are sample values, not current real-world prices.

do $$
declare
  p1 uuid := (select id from auth.users where email = 'person1@sorz.test');
  p2 uuid := (select id from auth.users where email = 'person2@sorz.test');
  -- Next Oct 1 (start of the NBA season), this year or next.
  next_oct date := case
    when current_date < make_date(extract(year from current_date)::int, 10, 1)
      then make_date(extract(year from current_date)::int, 10, 1)
    else make_date(extract(year from current_date)::int + 1, 10, 1)
  end;
  crunchyroll_id uuid;
  plan_id uuid;
begin
  if p1 is null or p2 is null then
    raise exception 'Create person1@sorz.test and person2@sorz.test in Authentication -> Users first.';
  end if;

  delete from public.subscriptions where user_id in (p1, p2);

  insert into public.profiles (id, display_name) values
    (p1, 'Person 1'),
    (p2, 'Person 2')
  on conflict (id) do update set display_name = excluded.display_name;

  -- Person 1: streaming + sports, shares Crunchyroll, forgot about DashPass.
  insert into public.subscriptions
    (user_id, name, label, category, price, billing_cycle, season_start_month, season_end_month, next_billing_date, notes)
  values
    (p1, 'Hulu', null, 'streaming', 9.99, 'monthly', null, null, current_date + 4, null),
    (p1, 'Netflix', null, 'streaming', 15.49, 'monthly', null, null, current_date + 12, null),
    (p1, 'NBA League Pass', null, 'sports', 109.99, 'seasonal', 10, 6, next_oct,
       'Season runs Oct-Jun; price is for the whole season.'),
    (p1, 'DoorDash DashPass', null, 'food_delivery', 9.99, 'monthly', null, null, current_date + 2,
       'Forgot this one existed.');

  insert into public.subscriptions
    (user_id, name, category, price, billing_cycle, next_billing_date)
  values (p1, 'Crunchyroll', 'streaming', 11.99, 'monthly', current_date + 9)
  returning id into crunchyroll_id;

  insert into public.shared_plans (subscription_id, owner_id, split_type)
  values (crunchyroll_id, p1, 'equal')
  returning id into plan_id;

  insert into public.plan_members (shared_plan_id, name, status, paid_through_date) values
    (plan_id, 'Jordan', 'owes', null),
    (plan_id, 'Sam', 'paid', current_date + 9);

  -- Person 2: shopping, gaming (on a trial), several Twitch subs, cloud storage.
  insert into public.subscriptions
    (user_id, name, label, category, price, billing_cycle, next_billing_date, is_trial, trial_end_date)
  values
    (p2, 'Amazon Prime', null, 'shopping', 139.00, 'yearly', current_date + 120, false, null),
    (p2, 'Xbox Game Pass', 'Ultimate', 'gaming', 19.99, 'monthly', current_date + 2, true, current_date + 2),
    (p2, 'Twitch', 'streamerA', 'streaming', 5.99, 'monthly', current_date + 6, false, null),
    (p2, 'Twitch', 'streamerB', 'streaming', 5.99, 'monthly', current_date + 15, false, null),
    (p2, 'Twitch', 'streamerC', 'streaming', 5.99, 'monthly', current_date + 23, false, null),
    (p2, 'iCloud+', '200 GB', 'cloud_storage', 2.99, 'monthly', current_date + 18, false, null),
    (p2, 'Spotify', null, 'music', 11.99, 'monthly', current_date + 27, false, null);

  raise notice 'Seeded % subscriptions for the two test users.',
    (select count(*) from public.subscriptions where user_id in (p1, p2));
end $$;
