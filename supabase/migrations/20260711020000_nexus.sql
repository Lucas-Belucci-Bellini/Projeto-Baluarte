-- ============================================================================
-- 0010 — NEXUS CENTRAL (multi-site + telemetria de IA + sistema de Direito)
--
-- ⚠️ REGISTRO/ESPELHO: este schema foi APLICADO no banco oficial em 10-11/07
-- pelo Claude do Chrome (via MCP) e ajustado pela sessão remota (fixes no fim).
-- O arquivo documenta o estado real — as assinaturas das RPCs abaixo foram
-- extraídas do banco (pg_get_functiondef), não do plano original.
-- Idempotente onde possível; NÃO precisa ser rodado de novo no banco oficial.
--
-- Pilares:
--   1. NEXUS multi-site — tenants + ingest_key (hash bcrypt) + RPCs de
--      ingestão SECURITY DEFINER: sites externos (baluarte/codevibe/essence)
--      gravam SEM ter INSERT direto; o portão é a chave validada na função.
--   2. IA/Telemetria — nucleo_events/memories/site_stats EXISTENTES ganharam
--      tenant_id (nada foi recriado; o fluxo /api/nucleo continua intacto).
--   3. Direito — esquema relacional completo (partes, processos, prazos,
--      jurisprudência com pgvector p/ RAG, peças com versões).
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "vector";
create schema if not exists nexus;

-- ===== Pilar 1 — Nexus multi-site =====
create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nome text not null,
  ingest_key_hash text,          -- bcrypt (crypt/gen_salt) — nunca em texto puro
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create table if not exists public.tenant_members (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  papel text not null default 'viewer' check (papel in ('viewer','admin')),
  criado_em timestamptz not null default now(),
  primary key (tenant_id, user_id)
);

create or replace function nexus.is_member(p_tenant uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.tenant_members m
                 where m.tenant_id = p_tenant and m.user_id = auth.uid());
$$;

create or replace function nexus.resolve_tenant(p_slug text, p_key text)
returns uuid language plpgsql stable security definer
set search_path = public, extensions as $$
declare v_id uuid; v_hash text;
begin
  select id, ingest_key_hash into v_id, v_hash from public.tenants where slug = p_slug and ativo = true;
  if v_id is null then raise exception 'Tenant inexistente ou inativo'; end if;
  if v_hash is null or v_hash <> crypt(p_key, v_hash) then raise exception 'Chave de ingestao invalida'; end if;
  return v_id;
end; $$;

-- ===== Pilar 2 — telemetria nas tabelas EXISTENTES =====
alter table public.nucleo_events add column if not exists tenant_id uuid references public.tenants(id) on delete set null;
alter table public.memories add column if not exists tenant_id uuid references public.tenants(id) on delete set null;
alter table public.site_stats add column if not exists tenant_id uuid references public.tenants(id) on delete set null;
alter table public.site_stats add column if not exists source_site text;
alter table public.site_stats add column if not exists dia date default current_date;
alter table public.site_stats add column if not exists metrica text;
alter table public.site_stats add column if not exists valor numeric default 0;
alter table public.site_stats add column if not exists dimensoes jsonb default '{}'::jsonb;
alter table public.site_stats add column if not exists atualizado_em timestamptz default now();
-- legados viram opcionais (telemetria externa nem sempre tem user/key antiga)
alter table public.memories alter column user_id drop not null;
alter table public.site_stats alter column key drop not null;

-- ===== Pilar 3 — Direito =====
create table if not exists public.partes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  tipo_pessoa text not null check (tipo_pessoa in ('PF','PJ')),
  nome text not null,
  documento text, email text, telefone text,
  papel text default 'cliente' check (papel in ('cliente','parte_contraria','terceiro')),
  criado_em timestamptz not null default now()
);

create table if not exists public.processos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  numero_cnj text, comarca text, vara text,
  area text not null check (area in ('Civil','Penal','Trabalhista','Tributario','Familia','Empresarial','Administrativo')),
  status text not null default 'ativo' check (status in ('ativo','arquivado','suspenso','encerrado')),
  cliente_id uuid references public.partes(id) on delete set null,
  valor_causa numeric, descricao text,
  criado_em timestamptz not null default now()
);

create table if not exists public.processo_partes (
  processo_id uuid not null references public.processos(id) on delete cascade,
  parte_id uuid not null references public.partes(id) on delete cascade,
  qualificacao text,
  primary key (processo_id, parte_id)
);

create table if not exists public.prazos_eventos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  processo_id uuid references public.processos(id) on delete cascade,
  tipo text not null check (tipo in ('prazo','audiencia','reuniao','diligencia')),
  titulo text not null,
  data_hora timestamptz not null,
  fatal boolean not null default false,
  concluido boolean not null default false,
  observacoes text,
  criado_em timestamptz not null default now()
);

create table if not exists public.juris_doutrina (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  tipo text not null check (tipo in ('jurisprudencia','doutrina','sumula','lei')),
  titulo text not null, tribunal text, ementa text, conteudo text,
  tags text[] default '{}',
  embedding vector(1536),
  criado_em timestamptz not null default now()
);
create index if not exists idx_juris_embedding on public.juris_doutrina
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create table if not exists public.pecas (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  processo_id uuid references public.processos(id) on delete cascade,
  titulo text not null, tipo text,
  is_template boolean not null default false,
  versao_atual int not null default 1,
  criado_em timestamptz not null default now()
);

create table if not exists public.pecas_versoes (
  id uuid primary key default gen_random_uuid(),
  peca_id uuid not null references public.pecas(id) on delete cascade,
  versao int not null, conteudo text, autor_ref text,
  criado_em timestamptz not null default now(),
  unique (peca_id, versao)
);

-- RLS: negar por padrão; SELECT/INSERT/UPDATE só membro do tenant (as policies
-- completas estão no banco; ver docs/NEXUS.md pro inventário).
alter table public.tenants enable row level security;
alter table public.tenant_members enable row level security;
alter table public.partes enable row level security;
alter table public.processos enable row level security;
alter table public.processo_partes enable row level security;
alter table public.prazos_eventos enable row level security;
alter table public.juris_doutrina enable row level security;
alter table public.pecas enable row level security;
alter table public.pecas_versoes enable row level security;

-- ===== RPCs de ingestão (assinaturas REAIS, adaptadas às tabelas legadas) =====
create or replace function public.ingest_event(
  p_slug text, p_key text, p_event_type text,
  p_payload jsonb default '{}'::jsonb, p_source text default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_tenant uuid; v_id uuid;
begin
  v_tenant := nexus.resolve_tenant(p_slug, p_key);
  insert into public.nucleo_events (tenant_id, type, source, payload)
  values (v_tenant, p_event_type, coalesce(p_source, p_slug), coalesce(p_payload,'{}'::jsonb))
  returning id into v_id;
  return v_id;
end; $$;

create or replace function public.ingest_memory(
  p_slug text, p_key text, p_text text,
  p_tags text[] default '{}'::text[], p_source text default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_tenant uuid; v_id uuid;
begin
  v_tenant := nexus.resolve_tenant(p_slug, p_key);
  insert into public.memories (tenant_id, text, tags, source)
  values (v_tenant, p_text, p_tags, coalesce(p_source, p_slug))
  returning id into v_id;
  return v_id;
end; $$;

create or replace function public.ingest_stat(
  p_slug text, p_key text, p_metrica text, p_valor numeric,
  p_dimensoes jsonb default '{}'::jsonb, p_dia date default current_date
) returns void language plpgsql security definer
set search_path = public, extensions as $$
declare v_tenant uuid; v_pk text;
begin
  v_tenant := nexus.resolve_tenant(p_slug, p_key);
  -- Satisfaz a PK legada "key" de forma determinística
  v_pk := 'nexus:' || p_slug || ':' || p_metrica || ':' || p_dia || ':' || md5(coalesce(p_dimensoes,'{}'::jsonb)::text);
  insert into public.site_stats (key, count, tenant_id, source_site, dia, metrica, valor, dimensoes)
  values (v_pk, p_valor::bigint, v_tenant, p_slug, p_dia, p_metrica, p_valor, coalesce(p_dimensoes,'{}'::jsonb))
  on conflict (tenant_id, dia, metrica, dimensoes)
  do update set valor = public.site_stats.valor + excluded.valor,
                count = public.site_stats.count + excluded.count,
                atualizado_em = now();
end; $$;

create or replace function public.buscar_juris(
  p_tenant uuid, p_query_embedding vector, p_limite integer default 5
) returns table(id uuid, titulo text, ementa text, distancia double precision)
language sql stable security definer set search_path = public as $$
  select j.id, j.titulo, j.ementa, (j.embedding <=> p_query_embedding) as distancia
  from public.juris_doutrina j
  where j.tenant_id = p_tenant and nexus.is_member(p_tenant) and j.embedding is not null
  order by j.embedding <=> p_query_embedding
  limit p_limite;
$$;

grant execute on function public.ingest_event(text,text,text,jsonb,text) to anon, authenticated;
grant execute on function public.ingest_memory(text,text,text,text[],text) to anon, authenticated;
grant execute on function public.ingest_stat(text,text,text,numeric,jsonb,date) to anon, authenticated;

-- ===== FIXES da sessão remota (11/07, aplicados via MCP) =====
-- (a) ingest_event estourava o check pré-existente de nucleo_events: a tabela
--     só aceitava os 5 tipos do /api/nucleo. Amplia com os tipos de telemetria.
alter table public.nucleo_events drop constraint if exists nucleo_events_type_check;
alter table public.nucleo_events add constraint nucleo_events_type_check
  check (type = any (array[
    'command','telemetry','biometric','system','response',
    'page_view','click','interaction','session','voice','error','learning','custom'
  ]::text[]));

-- (b) buscar_juris não deve ser executável sem login (advisor 0028): o EXECUTE
--     vinha do grant implícito a PUBLIC — revoga na raiz, concede só a auth.
revoke execute on function public.buscar_juris(uuid, vector, integer) from public;
revoke execute on function public.buscar_juris(uuid, vector, integer) from anon;
grant execute on function public.buscar_juris(uuid, vector, integer) to authenticated, service_role;
revoke execute on function nexus.resolve_tenant(text, text) from public;
revoke execute on function nexus.is_member(uuid) from public;

-- 🔑 ROTAÇÃO das chaves de ingestão (rodar com valores próprios — as chaves
-- semeadas nos testes são públicas nos transcripts; troque quando quiser):
-- update public.tenants set ingest_key_hash = crypt('NOVA_CHAVE', gen_salt('bf')) where slug = 'baluarte';
