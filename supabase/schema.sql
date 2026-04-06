-- Hero's Logbook - Supabase SQL schema
-- Optimized for A/B PPL tracking, nutrition logging, and progressive overload analytics.

create extension if not exists "pgcrypto";

create type public.workout_day as enum (
  'push-a',
  'pull-a',
  'legs-a',
  'push-b',
  'pull-b',
  'legs-b',
  'rest'
);

create type public.saga_phase as enum (
  'foundation',
  'density',
  'shred'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  target_weight_kg numeric(5,2) not null default 75.00,
  program_start_date date not null default date '2026-04-06',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workout_templates (
  id uuid primary key default gen_random_uuid(),
  workout_day public.workout_day not null,
  title text not null,
  focus text not null,
  day_order smallint not null check (day_order between 1 and 7),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.workout_template_exercises (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.workout_templates (id) on delete cascade,
  exercise_code text not null,
  exercise_name text not null,
  exercise_order smallint not null check (exercise_order > 0),
  target_sets smallint not null check (target_sets > 0),
  target_reps text not null,
  focus_note text,
  finisher_option_a text,
  finisher_option_b text,
  unique (template_id, exercise_code)
);

create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  session_date date not null,
  workout_day public.workout_day not null,
  saga_phase public.saga_phase not null,
  body_weight_kg numeric(5,2),
  duration_min smallint,
  notes text,
  total_volume_kg numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, session_date, workout_day)
);

create table public.workout_set_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions (id) on delete cascade,
  exercise_code text not null,
  exercise_name text not null,
  set_number smallint not null check (set_number > 0),
  reps smallint,
  weight_kg numeric(6,2),
  rir smallint,
  created_at timestamptz not null default now(),
  unique (session_id, exercise_code, set_number)
);

create table public.nutrition_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  log_date date not null,
  calories integer not null default 0,
  protein_g integer not null default 0,
  carbs_g integer not null default 0,
  fats_g integer not null default 0,
  calorie_goal integer not null default 2700,
  protein_goal_g integer not null default 160,
  carbs_goal_g integer not null default 320,
  fats_goal_g integer not null default 75,
  created_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create index workout_sessions_user_date_idx
  on public.workout_sessions (user_id, session_date desc);

create index workout_sessions_user_day_date_idx
  on public.workout_sessions (user_id, workout_day, session_date desc);

create index workout_set_logs_session_exercise_idx
  on public.workout_set_logs (session_id, exercise_code, set_number);

create index nutrition_logs_user_date_idx
  on public.nutrition_logs (user_id, log_date desc);

-- Latest per-day exercise targets for progressive overload ghost hints.
create view public.v_previous_week_targets as
with per_session_exercise as (
  select
    ws.user_id,
    ws.workout_day,
    ws.session_date,
    sl.exercise_code,
    sl.exercise_name,
    max(sl.weight_kg) as best_weight_kg
  from public.workout_sessions ws
  join public.workout_set_logs sl on sl.session_id = ws.id
  where sl.weight_kg is not null
  group by
    ws.user_id,
    ws.workout_day,
    ws.session_date,
    sl.exercise_code,
    sl.exercise_name
), ranked as (
  select
    user_id,
    workout_day,
    session_date,
    exercise_code,
    exercise_name,
    best_weight_kg,
    row_number() over (
      partition by user_id, workout_day, exercise_code
      order by session_date desc
    ) as recency_rank
  from per_session_exercise
)
select
  user_id,
  workout_day,
  session_date as source_session_date,
  exercise_code,
  exercise_name,
  best_weight_kg
from ranked
where recency_rank = 1;

alter table public.profiles enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_set_logs enable row level security;
alter table public.nutrition_logs enable row level security;

create policy "profiles_owner_select"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "profiles_owner_insert"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "profiles_owner_update"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "workout_sessions_owner_all"
  on public.workout_sessions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "workout_set_logs_owner_all"
  on public.workout_set_logs
  for all
  using (
    exists (
      select 1
      from public.workout_sessions ws
      where ws.id = session_id
        and ws.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.workout_sessions ws
      where ws.id = session_id
        and ws.user_id = auth.uid()
    )
  );

create policy "nutrition_logs_owner_all"
  on public.nutrition_logs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
