-- Create a profiles row automatically whenever a new user signs up.
-- Column defaults fill in currency (USD) and reminder_days_before (3);
-- display_name stays empty until the user sets it.

-- Runs as its owner (security definer) because the signing-up user has no
-- session yet, so RLS would block the insert. search_path is empty and every
-- name is schema-qualified, so the function can't be tricked into using
-- look-alike objects from another schema.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Only the trigger should run this; it isn't an API endpoint.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: give any existing accounts a profile. Existing rows (e.g. the
-- seeded test users' display names) are left alone.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;
