-- Billing Foundation — contrato de persistência V2.
--
-- Esta migração é deliberadamente sem provider financeiro: não cria checkout,
-- invoice, webhook ou cobrança. Ela cria a base de tenancy e auditoria para que
-- a camada server-side possa persistir assignments e consumo com RLS.
-- Aplicar somente após revisão no projeto Supabase correto.

create schema if not exists billing;

create table if not exists billing.workspaces (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth.users(id) on delete cascade,
  slug text not null,
  display_name text not null,
  created_at timestamptz not null default now(),
  unique (account_id, slug),
  check (slug = lower(slug) and length(slug) between 2 and 80),
  check (length(trim(display_name)) between 1 and 160)
);

create table if not exists billing.workspace_members (
  workspace_id uuid not null references billing.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id),
  check (role in ('owner', 'admin', 'dev', 'user'))
);

create table if not exists billing.plans (
  plan_id text not null,
  version integer not null,
  name text not null,
  description text not null default '',
  status text not null default 'draft',
  currency text not null,
  billing_period text not null,
  price_minor bigint not null default 0,
  trial_days integer not null default 0,
  entitlements jsonb not null default '[]'::jsonb,
  limits jsonb not null default '{}'::jsonb,
  features jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (plan_id, version),
  check (version > 0),
  check (status in ('draft', 'active', 'archived', 'retired')),
  check (currency in ('BRL', 'USD', 'EUR')),
  check (billing_period in ('monthly', 'yearly', 'weekly', 'custom')),
  check (price_minor >= 0),
  check (trial_days >= 0),
  check (jsonb_typeof(entitlements) = 'array'),
  check (jsonb_typeof(limits) = 'object'),
  check (jsonb_typeof(features) = 'array'),
  check (jsonb_typeof(metadata) = 'object')
);

create table if not exists billing.plan_assignments (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references billing.workspaces(id) on delete cascade,
  plan_id text not null,
  plan_version integer not null,
  status text not null default 'active',
  effective_from timestamptz not null,
  effective_to timestamptz,
  assigned_at timestamptz not null default now(),
  source text not null,
  foreign key (plan_id, plan_version) references billing.plans(plan_id, version),
  check (status in ('active', 'scheduled', 'revoked')),
  check (effective_to is null or effective_to > effective_from),
  check (length(trim(source)) > 0)
);

create unique index if not exists plan_assignments_one_active_window
  on billing.plan_assignments (workspace_id)
  where status = 'active' and effective_to is null;

create table if not exists billing.usage_events (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references billing.workspaces(id) on delete cascade,
  feature text not null,
  quantity numeric not null,
  idempotency_key text not null,
  occurred_at timestamptz not null default now(),
  source text not null,
  metadata jsonb not null default '{}'::jsonb,
  unique (workspace_id, idempotency_key),
  check (quantity >= 0),
  check (length(trim(feature)) > 0),
  check (length(trim(source)) > 0),
  check (jsonb_typeof(metadata) = 'object')
);

create or replace function billing.is_workspace_member(p_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = billing, public
as $$
  select exists (
    select 1
    from billing.workspace_members member
    where member.workspace_id = p_workspace_id
      and member.user_id = auth.uid()
  );
$$;

create or replace function billing.prevent_usage_mutation()
returns trigger
language plpgsql
security definer
set search_path = billing, public
as $$
begin
  raise exception 'billing.usage_events é append-only';
end;
$$;

drop trigger if exists usage_events_no_update on billing.usage_events;
create trigger usage_events_no_update
  before update or delete on billing.usage_events
  for each row execute function billing.prevent_usage_mutation();

alter table billing.workspaces enable row level security;
alter table billing.workspace_members enable row level security;
alter table billing.plans enable row level security;
alter table billing.plan_assignments enable row level security;
alter table billing.usage_events enable row level security;

-- O catálogo ativo é legível por usuários autenticados; escrita fica no backend
-- service_role, que não deve ser exposto no navegador.
drop policy if exists plans_authenticated_read on billing.plans;
create policy plans_authenticated_read
  on billing.plans for select to authenticated
  using (status = 'active');

-- Todo dado de workspace exige membership explícito.
drop policy if exists workspaces_member_read on billing.workspaces;
create policy workspaces_member_read
  on billing.workspaces for select to authenticated
  using (billing.is_workspace_member(id));

drop policy if exists workspace_members_self_read on billing.workspace_members;
create policy workspace_members_self_read
  on billing.workspace_members for select to authenticated
  using (user_id = auth.uid() or billing.is_workspace_member(workspace_id));

drop policy if exists plan_assignments_member_read on billing.plan_assignments;
create policy plan_assignments_member_read
  on billing.plan_assignments for select to authenticated
  using (billing.is_workspace_member(workspace_id));

drop policy if exists usage_events_member_read on billing.usage_events;
create policy usage_events_member_read
  on billing.usage_events for select to authenticated
  using (billing.is_workspace_member(workspace_id));

revoke all on schema billing from public, anon;
revoke all on all tables in schema billing from public, anon;
revoke execute on function billing.is_workspace_member(uuid) from public, anon;
revoke execute on function billing.prevent_usage_mutation() from public, anon, authenticated;
grant usage on schema billing to authenticated, service_role;
grant execute on function billing.is_workspace_member(uuid) to authenticated, service_role;
grant select on billing.plans to authenticated;
grant select on billing.workspaces, billing.workspace_members, billing.plan_assignments, billing.usage_events to authenticated;
