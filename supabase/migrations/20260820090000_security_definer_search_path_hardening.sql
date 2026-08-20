-- Hardening dos RPCs SECURITY DEFINER sinalizados pelo Supabase Advisor.
--
-- Escopo deliberadamente pequeno:
--   * fixa search_path vazio;
--   * qualifica relações e schemas usados pelos corpos;
--   * preserva assinaturas, retornos, callers e grants já aprovados.
--
-- Não revogar EXECUTE nesta migration: os contadores são RPCs públicos
-- intencionais e os RPCs autenticados são usados por policies/consumers.
-- subscription_events e Auth leaked-password protection permanecem em seus
-- contratos próprios e não são alterados aqui.

create or replace function public.bump_view(p_route text)
returns bigint
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_key text;
  v_count bigint;
begin
  if p_route is null or p_route !~ '^/[a-z0-9/_-]{0,63}$' then
    raise exception 'rota invalida';
  end if;

  v_key := 'view:' || p_route;
  insert into public.site_stats (key, count)
  values (v_key, 1)
  on conflict (key) do update
    set count = public.site_stats.count + 1,
        updated_at = pg_catalog.now()
  returning count into v_count;

  return v_count;
end;
$function$;

create or replace function public.bump_visits()
returns bigint
language sql
security definer
set search_path = ''
as $function$
  update public.site_stats
     set count = count + 1,
         updated_at = pg_catalog.now()
   where key = 'visits'
  returning count;
$function$;

create or replace function public.buscar_juris(
  p_tenant uuid,
  p_query_embedding extensions.vector,
  p_limite integer default 5
)
returns table(
  id uuid,
  titulo text,
  ementa text,
  distancia double precision
)
language sql
stable
security definer
set search_path = ''
as $function$
  select
    j.id,
    j.titulo,
    j.ementa,
    (j.embedding operator(extensions.<=>) p_query_embedding) as distancia
  from public.juris_doutrina j
  where j.tenant_id = p_tenant
    and nexus.is_member(p_tenant)
    and j.embedding is not null
  order by j.embedding operator(extensions.<=>) p_query_embedding
  limit pg_catalog.greatest(1, pg_catalog.least(pg_catalog.coalesce(p_limite, 5), 50));
$function$;

create or replace function public.current_tenant_role(p_tenant_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $function$
  select tm.papel
    from public.tenant_members tm
   where tm.tenant_id = p_tenant_id
     and tm.user_id = (select auth.uid())
   limit 1;
$function$;

create or replace function public.veritas_is_project_owner(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
      from public.veritas_circuit_projects p
     where p.id = p_project_id
       and p.user_id = (select auth.uid())
  );
$function$;

create or replace function public.veritas_can_collaborate(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select public.veritas_is_project_owner(p_project_id)
      or exists (
        select 1
          from public.veritas_circuit_collaborators c
         where c.project_id = p_project_id
           and c.user_id = (select auth.uid())
      );
$function$;

create or replace function public.veritas_can_edit_project(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select public.veritas_is_project_owner(p_project_id)
      or exists (
        select 1
          from public.veritas_circuit_collaborators c
         where c.project_id = p_project_id
           and c.user_id = (select auth.uid())
           and c.role = 'editor'
      );
$function$;

create or replace function public.veritas_add_circuit_collaborator(
  p_project_id uuid,
  p_user_id uuid,
  p_role text default 'editor'
)
returns public.veritas_circuit_collaborators
language plpgsql
security definer
set search_path = ''
as $function$
declare
  result public.veritas_circuit_collaborators;
begin
  if not public.veritas_is_project_owner(p_project_id) then
    raise exception 'Only the project owner can manage collaborators';
  end if;

  if p_user_id is null or p_user_id = (select auth.uid()) then
    raise exception 'Invalid collaborator user';
  end if;

  if p_role not in ('editor', 'viewer') then
    raise exception 'Invalid collaborator role';
  end if;

  insert into public.veritas_circuit_collaborators (project_id, user_id, role)
  values (p_project_id, p_user_id, p_role)
  on conflict (project_id, user_id) do update
    set role = excluded.role
  returning * into result;

  return result;
end;
$function$;

create or replace function public.veritas_remove_circuit_collaborator(
  p_project_id uuid,
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if not public.veritas_is_project_owner(p_project_id) then
    raise exception 'Only the project owner can manage collaborators';
  end if;

  delete from public.veritas_circuit_collaborators
   where project_id = p_project_id
     and user_id = p_user_id;
end;
$function$;

comment on function public.bump_view(text) is
  'Public metrics RPC; route is validated and only site_stats is updated.';
comment on function public.bump_visits() is
  'Public metrics RPC; only the visits row in site_stats is updated.';
comment on function public.buscar_juris(uuid, extensions.vector, integer) is
  'Authenticated tenant-scoped legal retrieval RPC.';
comment on function public.current_tenant_role(uuid) is
  'Authenticated tenant membership helper used by RLS policies.';
