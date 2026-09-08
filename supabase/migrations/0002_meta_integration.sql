-- ============================================================================
-- Performance Copilot — integração com Meta Ads (estrutura preparatória)
--
-- Esta migration cria apenas o schema (tabelas, índices, RLS) para uma
-- futura integração direta com a Meta Marketing API. NENHUM código da
-- aplicação usa estas tabelas ainda — o MVP atual trabalha exclusivamente
-- via upload de CSV (ver supabase/migrations/0001_init.sql). Isso é
-- intencional: a integração direta com Meta Ads está fora do escopo deste
-- MVP e fica para uma versão futura.
--
-- Rode este arquivo no SQL Editor do seu projeto Supabase (ou via
-- `supabase db push`) depois de já ter aplicado 0001_init.sql. É seguro
-- rodar mais de uma vez: todos os objetos usam IF NOT EXISTS / DROP ... IF
-- EXISTS antes de recriar.
-- ============================================================================

create extension if not exists pgcrypto;

-- Reaproveita a função de updated_at criada em 0001_init.sql. Se por algum
-- motivo esta migration for aplicada isoladamente, garantimos que ela exista.
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
-- meta_connections
-- Uma conexão OAuth do usuário com a Meta (um "login com Facebook" concedido
-- ao Performance Copilot). O token nunca é guardado em texto puro — o campo
-- se chama access_token_encrypted para deixar explícito que a aplicação deve
-- cifrar o valor antes de gravar (ex.: com pgsodium/Vault, ou cifrado na
-- camada da aplicação antes do insert).
-- ============================================================================
create table if not exists public.meta_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meta_user_id text,
  access_token_encrypted text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists meta_connections_user_id_idx
  on public.meta_connections(user_id);

drop trigger if exists set_meta_connections_updated_at on public.meta_connections;
create trigger set_meta_connections_updated_at
  before update on public.meta_connections
  for each row execute function public.set_updated_at();

alter table public.meta_connections enable row level security;

drop policy if exists "meta_connections_select_own" on public.meta_connections;
create policy "meta_connections_select_own"
  on public.meta_connections for select
  using (auth.uid() = user_id);

drop policy if exists "meta_connections_insert_own" on public.meta_connections;
create policy "meta_connections_insert_own"
  on public.meta_connections for insert
  with check (auth.uid() = user_id);

drop policy if exists "meta_connections_update_own" on public.meta_connections;
create policy "meta_connections_update_own"
  on public.meta_connections for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "meta_connections_delete_own" on public.meta_connections;
create policy "meta_connections_delete_own"
  on public.meta_connections for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- meta_ad_accounts
-- As contas de anúncio da Meta que o usuário escolheu conectar, opcionalmente
-- vinculadas a um cliente cadastrado no Performance Copilot (client_id).
-- ============================================================================
create table if not exists public.meta_ad_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meta_connection_id uuid not null references public.meta_connections(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  ad_account_id text not null,
  account_name text,
  currency text,
  timezone_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists meta_ad_accounts_user_id_idx
  on public.meta_ad_accounts(user_id);
create index if not exists meta_ad_accounts_meta_connection_id_idx
  on public.meta_ad_accounts(meta_connection_id);
create index if not exists meta_ad_accounts_client_id_idx
  on public.meta_ad_accounts(client_id);

-- Evita conectar a mesma conta de anúncio da Meta duas vezes para o mesmo
-- usuário.
create unique index if not exists meta_ad_accounts_user_ad_account_key
  on public.meta_ad_accounts(user_id, ad_account_id);

drop trigger if exists set_meta_ad_accounts_updated_at on public.meta_ad_accounts;
create trigger set_meta_ad_accounts_updated_at
  before update on public.meta_ad_accounts
  for each row execute function public.set_updated_at();

alter table public.meta_ad_accounts enable row level security;

drop policy if exists "meta_ad_accounts_select_own" on public.meta_ad_accounts;
create policy "meta_ad_accounts_select_own"
  on public.meta_ad_accounts for select
  using (auth.uid() = user_id);

drop policy if exists "meta_ad_accounts_insert_own" on public.meta_ad_accounts;
create policy "meta_ad_accounts_insert_own"
  on public.meta_ad_accounts for insert
  with check (auth.uid() = user_id);

drop policy if exists "meta_ad_accounts_update_own" on public.meta_ad_accounts;
create policy "meta_ad_accounts_update_own"
  on public.meta_ad_accounts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "meta_ad_accounts_delete_own" on public.meta_ad_accounts;
create policy "meta_ad_accounts_delete_own"
  on public.meta_ad_accounts for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- Fim da migration de integração com Meta Ads
-- ============================================================================
