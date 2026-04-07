create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  height_cm integer,
  experience_level text,
  goal text,
  split_key text,
  sessions_per_week integer,
  weekly_mapping jsonb,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.exercise_library (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  primary_muscle text not null,
  secondary_muscles text[] default '{}'::text[],
  equipment text not null,
  default_sets integer not null,
  default_reps text not null,
  instructions text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.workout_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  split_key text,
  day_key text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid references public.workout_templates(id) on delete set null,
  workout_date date not null,
  name text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_slug text not null,
  exercise_name text not null,
  set_number integer not null,
  reps integer,
  weight_kg numeric(6,2),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.bodyweight_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_at date not null,
  weight_kg numeric(6,2) not null,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.exercise_library enable row level security;
alter table public.workout_templates enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_sets enable row level security;
alter table public.bodyweight_entries enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "exercise_library_read_all" on public.exercise_library
  for select using (true);

create policy "templates_select_own" on public.workout_templates
  for select using (auth.uid() = user_id);

create policy "templates_insert_own" on public.workout_templates
  for insert with check (auth.uid() = user_id);

create policy "templates_update_own" on public.workout_templates
  for update using (auth.uid() = user_id);

create policy "sessions_select_own" on public.workout_sessions
  for select using (auth.uid() = user_id);

create policy "sessions_insert_own" on public.workout_sessions
  for insert with check (auth.uid() = user_id);

create policy "sessions_update_own" on public.workout_sessions
  for update using (auth.uid() = user_id);

create policy "sets_select_via_session" on public.workout_sets
  for select using (
    exists (
      select 1 from public.workout_sessions
      where workout_sessions.id = workout_sets.session_id
      and workout_sessions.user_id = auth.uid()
    )
  );

create policy "sets_insert_via_session" on public.workout_sets
  for insert with check (
    exists (
      select 1 from public.workout_sessions
      where workout_sessions.id = workout_sets.session_id
      and workout_sessions.user_id = auth.uid()
    )
  );

create policy "bodyweight_select_own" on public.bodyweight_entries
  for select using (auth.uid() = user_id);

create policy "bodyweight_insert_own" on public.bodyweight_entries
  for insert with check (auth.uid() = user_id);

create policy "bodyweight_update_own" on public.bodyweight_entries
  for update using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_profiles_timestamp on public.profiles;

create trigger update_profiles_timestamp
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();