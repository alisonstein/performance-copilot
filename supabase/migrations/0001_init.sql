-- ============================================================================
-- Performance Copilot — schema inicial
-- Rode este arquivo no SQL Editor do seu projeto Supabase (ou via Supabase CLI:
-- `supabase db push`). Ele é idempotente na maior parte (usa IF NOT EXISTS),
-- mas foi pensado para rodar uma única vez em um projeto novo.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Função utilitária: mantém updated_at sempre atualizado
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- profiles
-- Um registro por usuário autenticado (espelha auth.users).
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  company_name text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'agency')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Normalmente o profile é criado pelo trigger on_auth_user_created (abaixo),
-- mas esta policy permite que o próprio app crie o registro como fallback
-- (ex.: se a migration foi aplicada depois de usuários já existirem).
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Cria automaticamente um profile quando um novo usuário se cadastra.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, company_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'company_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- clients
-- ============================================================================
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_user_id_idx on public.clients(user_id);

drop trigger if exists set_clients_updated_at on public.clients;
create trigger set_clients_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

alter table public.clients enable row level security;

drop policy if exists "clients_select_own" on public.clients;
create policy "clients_select_own"
  on public.clients for select
  using (auth.uid() = user_id);

drop policy if exists "clients_insert_own" on public.clients;
create policy "clients_insert_own"
  on public.clients for insert
  with check (auth.uid() = user_id);

drop policy if exists "clients_update_own" on public.clients;
create policy "clients_update_own"
  on public.clients for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "clients_delete_own" on public.clients;
create policy "clients_delete_own"
  on public.clients for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- analyses
-- ============================================================================
create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  platform text not null check (platform in ('meta_ads', 'google_ads')),
  start_date date not null,
  end_date date not null,
  file_name text,
  status text not null default 'processing' check (status in ('processing', 'completed', 'failed')),
  total_spend numeric(14, 2) not null default 0,
  impressions bigint not null default 0,
  clicks bigint not null default 0,
  ctr numeric(10, 4) not null default 0,
  cpc numeric(10, 4) not null default 0,
  cpm numeric(10, 4) not null default 0,
  conversions numeric(14, 2) not null default 0,
  cpa numeric(10, 4) not null default 0,
  revenue numeric(14, 2) not null default 0,
  roas numeric(10, 4) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists analyses_user_id_idx on public.analyses(user_id);
create index if not exists analyses_client_id_idx on public.analyses(client_id);
create index if not exists analyses_client_platform_idx on public.analyses(client_id, platform, created_at desc);

drop trigger if exists set_analyses_updated_at on public.analyses;
create trigger set_analyses_updated_at
  before update on public.analyses
  for each row execute function public.set_updated_at();

alter table public.analyses enable row level security;

drop policy if exists "analyses_select_own" on public.analyses;
create policy "analyses_select_own"
  on public.analyses for select
  using (auth.uid() = user_id);

drop policy if exists "analyses_insert_own" on public.analyses;
create policy "analyses_insert_own"
  on public.analyses for insert
  with check (auth.uid() = user_id);

drop policy if exists "analyses_update_own" on public.analyses;
create policy "analyses_update_own"
  on public.analyses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "analyses_delete_own" on public.analyses;
create policy "analyses_delete_own"
  on public.analyses for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- analysis_items (linhas por campanha/conjunto/anúncio de cada análise)
-- ============================================================================
create table if not exists public.analysis_items (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  campaign_name text not null,
  adset_name text,
  ad_name text,
  spend numeric(14, 2) not null default 0,
  impressions bigint not null default 0,
  clicks bigint not null default 0,
  ctr numeric(10, 4) not null default 0,
  cpc numeric(10, 4) not null default 0,
  cpm numeric(10, 4) not null default 0,
  conversions numeric(14, 2) not null default 0,
  cpa numeric(10, 4) not null default 0,
  revenue numeric(14, 2) not null default 0,
  roas numeric(10, 4) not null default 0,
  raw_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analysis_items_analysis_id_idx on public.analysis_items(analysis_id);

alter table public.analysis_items enable row level security;

drop policy if exists "analysis_items_select_own" on public.analysis_items;
create policy "analysis_items_select_own"
  on public.analysis_items for select
  using (
    exists (
      select 1 from public.analyses a
      where a.id = analysis_items.analysis_id and a.user_id = auth.uid()
    )
  );

drop policy if exists "analysis_items_insert_own" on public.analysis_items;
create policy "analysis_items_insert_own"
  on public.analysis_items for insert
  with check (
    exists (
      select 1 from public.analyses a
      where a.id = analysis_items.analysis_id and a.user_id = auth.uid()
    )
  );

drop policy if exists "analysis_items_delete_own" on public.analysis_items;
create policy "analysis_items_delete_own"
  on public.analysis_items for delete
  using (
    exists (
      select 1 from public.analyses a
      where a.id = analysis_items.analysis_id and a.user_id = auth.uid()
    )
  );

-- ============================================================================
-- ai_analysis (diagnóstico gerado por IA ou pelo motor de regras)
-- ============================================================================
create table if not exists public.ai_analysis (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null unique references public.analyses(id) on delete cascade,
  diagnosis text,
  alerts jsonb not null default '[]'::jsonb,
  opportunities jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  executive_summary text,
  source text not null default 'rules' check (source in ('rules', 'ai')),
  created_at timestamptz not null default now()
);

create index if not exists ai_analysis_analysis_id_idx on public.ai_analysis(analysis_id);

alter table public.ai_analysis enable row level security;

drop policy if exists "ai_analysis_select_own" on public.ai_analysis;
create policy "ai_analysis_select_own"
  on public.ai_analysis for select
  using (
    exists (
      select 1 from public.analyses a
      where a.id = ai_analysis.analysis_id and a.user_id = auth.uid()
    )
  );

drop policy if exists "ai_analysis_insert_own" on public.ai_analysis;
create policy "ai_analysis_insert_own"
  on public.ai_analysis for insert
  with check (
    exists (
      select 1 from public.analyses a
      where a.id = ai_analysis.analysis_id and a.user_id = auth.uid()
    )
  );

-- ============================================================================
-- Fim da migration inicial
-- ============================================================================
