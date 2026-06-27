-- JetHealth initial schema
-- Tables: profiles, app_settings, triage_history, feedback, api_call_logs

-- ============================================================
-- profiles: extends auth.users with app data
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  consent_data_storage boolean not null default false,
  disabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on new auth user, reading metadata passed at signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, consent_data_storage)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce((new.raw_user_meta_data->>'consent_data_storage')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- app_settings: admin-managed configuration
-- ============================================================
create table if not exists public.app_settings (
  id serial primary key,
  key text unique not null,
  value text,
  category text not null default 'general' check (category in ('ai', 'facilities', 'general')),
  description text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

insert into public.app_settings (key, value, category, description) values
  ('openai_model', 'gpt-4o', 'ai', 'Modello OpenAI usato per la classificazione del triage'),
  ('openai_max_tokens', '1200', 'ai', 'Numero massimo di token nella risposta OpenAI'),
  ('openai_system_prompt', '', 'ai', 'System prompt personalizzato (vuoto = default)'),
  ('lazio_api_base_url', 'https://server.salutelazio.it/server/external-services/facilities/structures', 'facilities', 'URL base API Salute Lazio'),
  ('facilities_default_radius_km', '8', 'facilities', 'Raggio di ricerca predefinito (km)'),
  ('disclaimer_text', 'JetHealth non sostituisce il parere di un medico. In caso di emergenza o peggioramento rapido, chiama subito il 112/118.', 'general', 'Testo del disclaimer medico')
on conflict (key) do nothing;

-- ============================================================
-- triage_history: per-user triage records (only if consent given)
-- ============================================================
create table if not exists public.triage_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  symptoms_input jsonb not null,
  triage_result jsonb not null,
  recommended_facilities jsonb,
  created_at timestamptz not null default now()
);
create index if not exists triage_history_user_id_idx on public.triage_history(user_id);
create index if not exists triage_history_created_at_idx on public.triage_history(created_at);

-- ============================================================
-- feedback: post-triage feedback
-- ============================================================
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  triage_id uuid references public.triage_history(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- api_call_logs: technical logs of external API calls (no symptom data)
-- ============================================================
create table if not exists public.api_call_logs (
  id uuid primary key default gen_random_uuid(),
  service text not null check (service in ('openai', 'salute_lazio')),
  endpoint text,
  method text,
  status_code integer,
  response_time_ms integer,
  tokens_used integer,
  error_message text,
  created_at timestamptz not null default now()
);
create index if not exists api_call_logs_created_at_idx on public.api_call_logs(created_at);
create index if not exists api_call_logs_service_idx on public.api_call_logs(service);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.app_settings enable row level security;
alter table public.triage_history enable row level security;
alter table public.feedback enable row level security;
alter table public.api_call_logs enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles policies
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- app_settings policies (admin only)
drop policy if exists "app_settings_admin_all" on public.app_settings;
create policy "app_settings_admin_all" on public.app_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- triage_history policies
drop policy if exists "triage_select_own_or_admin" on public.triage_history;
create policy "triage_select_own_or_admin" on public.triage_history
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "triage_insert_own" on public.triage_history;
create policy "triage_insert_own" on public.triage_history
  for insert with check (user_id = auth.uid());

drop policy if exists "triage_delete_own_or_admin" on public.triage_history;
create policy "triage_delete_own_or_admin" on public.triage_history
  for delete using (user_id = auth.uid() or public.is_admin());

-- feedback policies
drop policy if exists "feedback_select_own_or_admin" on public.feedback;
create policy "feedback_select_own_or_admin" on public.feedback
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "feedback_insert_own" on public.feedback;
create policy "feedback_insert_own" on public.feedback
  for insert with check (user_id = auth.uid());

-- api_call_logs policies (admin reads; inserts via service role bypass RLS)
drop policy if exists "api_logs_admin_select" on public.api_call_logs;
create policy "api_logs_admin_select" on public.api_call_logs
  for select using (public.is_admin());
