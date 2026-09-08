-- ============================================================================
-- Performance Copilot — métricas estendidas de Meta Ads
--
-- Migration ADITIVA: apenas adiciona colunas NULLABLE a `analyses` e
-- `analysis_items` (0001_init.sql). Nada é removido ou renomeado, então
-- análises já existentes continuam funcionando exatamente como antes — as
-- novas colunas simplesmente ficam NULL para registros antigos.
--
-- Rode no SQL Editor do Supabase (ou `supabase db push`) depois de
-- 0001_init.sql e 0002_meta_integration.sql. Seguro rodar mais de uma vez
-- (tudo usa IF NOT EXISTS / DROP ... IF EXISTS).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- analyses: totais estendidos + qual é o "resultado principal" da análise
-- ----------------------------------------------------------------------------
alter table public.analyses
  add column if not exists primary_result_type text not null default 'other';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'analyses_primary_result_type_check'
  ) then
    alter table public.analyses
      add constraint analyses_primary_result_type_check
      check (primary_result_type in (
        'conversations', 'leads', 'purchases', 'registrations', 'landing_page_views', 'other'
      ));
  end if;
end $$;

alter table public.analyses
  add column if not exists reach bigint,
  add column if not exists frequency numeric(10, 4),
  add column if not exists link_clicks bigint,
  add column if not exists landing_page_views bigint,
  add column if not exists conversations_started numeric(14, 2),
  add column if not exists cost_per_conversation numeric(10, 4),
  add column if not exists leads numeric(14, 2),
  add column if not exists cost_per_lead numeric(10, 4),
  add column if not exists purchases numeric(14, 2),
  add column if not exists cost_per_purchase numeric(10, 4),
  add column if not exists registrations numeric(14, 2),
  add column if not exists checkouts numeric(14, 2),
  add column if not exists add_to_cart numeric(14, 2),
  add column if not exists contacts numeric(14, 2);

-- ----------------------------------------------------------------------------
-- analysis_items: mesmas métricas estendidas no nível do anúncio, mais
-- metadados de status e de criativo (usados nas abas Anúncios/Criativos).
-- ----------------------------------------------------------------------------
alter table public.analysis_items
  add column if not exists reach bigint,
  add column if not exists frequency numeric(10, 4),
  add column if not exists link_clicks bigint,
  add column if not exists landing_page_views bigint,
  add column if not exists conversations_started numeric(14, 2),
  add column if not exists cost_per_conversation numeric(10, 4),
  add column if not exists leads numeric(14, 2),
  add column if not exists cost_per_lead numeric(10, 4),
  add column if not exists purchases numeric(14, 2),
  add column if not exists cost_per_purchase numeric(10, 4),
  add column if not exists registrations numeric(14, 2),
  add column if not exists checkouts numeric(14, 2),
  add column if not exists add_to_cart numeric(14, 2),
  add column if not exists contacts numeric(14, 2),
  add column if not exists status text,
  add column if not exists ad_id text,
  add column if not exists creative_id text,
  add column if not exists thumbnail_url text,
  add column if not exists creative_type text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'analysis_items_status_check'
  ) then
    alter table public.analysis_items
      add constraint analysis_items_status_check
      check (status is null or status in ('active', 'paused', 'other'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'analysis_items_creative_type_check'
  ) then
    alter table public.analysis_items
      add constraint analysis_items_creative_type_check
      check (creative_type is null or creative_type in ('image', 'video', 'carousel', 'unknown'));
  end if;
end $$;

create index if not exists analysis_items_ad_id_idx on public.analysis_items(ad_id);

-- ============================================================================
-- Fim da migration de métricas estendidas
-- ============================================================================
