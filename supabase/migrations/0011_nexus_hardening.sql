-- ============================================================================
-- 0011_nexus_hardening.sql — Blindagem das tabelas de Direito (Nexus, 0010).
--
-- Contexto: a 0010 LIGOU o RLS das tabelas de Direito, mas as policies em si
-- ficaram só no banco (nao no arquivo). Esta migration ESPELHA as policies
-- (padrao nexus.is_member) para o repo voltar a ser fonte unica de verdade,
-- + adiciona indices nas FKs e reforcos de integridade.
--
-- Idempotente (drop policy if exists / if not exists). Postura RLS-first.
-- ANTES DE APLICAR: rode o diagnostico (pg_policies / pg_indexes) para
-- confirmar que nao ha policies com padrao divergente.
-- ============================================================================

-- ===== PARTE A — INDICES DE PERFORMANCE (Postgres nao indexa FK sozinho) =====
create index if not exists idx_processos_tenant    on public.processos (tenant_id);
create index if not exists idx_processos_cliente   on public.processos (cliente_id);
create index if not exists idx_partes_tenant       on public.partes (tenant_id);
create index if not exists idx_prazos_tenant       on public.prazos_eventos (tenant_id);
create index if not exists idx_prazos_processo     on public.prazos_eventos (processo_id);
-- "prazos abertos por data" — a consulta de agenda mais comum:
create index if not exists idx_prazos_agenda       on public.prazos_eventos (tenant_id, data_hora) where concluido = false;
create index if not exists idx_procpartes_parte    on public.processo_partes (parte_id);
create index if not exists idx_juris_tenant        on public.juris_doutrina (tenant_id);
create index if not exists idx_pecas_tenant        on public.pecas (tenant_id);
create index if not exists idx_pecas_processo      on public.pecas (processo_id);
create index if not exists idx_pecas_versoes_peca  on public.pecas_versoes (peca_id);
create index if not exists idx_tenant_members_user on public.tenant_members (user_id);

-- ===== PARTE B — INTEGRIDADE =====
-- Impede o mesmo processo (numero_cnj) duplicado dentro de um tenant.
-- Se ja existirem duplicatas, o CREATE UNIQUE falha; confira antes:
--   select tenant_id, numero_cnj, count(*) from public.processos
--   where numero_cnj is not null group by 1,2 having count(*) > 1;
create unique index if not exists uq_processos_cnj_por_tenant
  on public.processos (tenant_id, numero_cnj) where numero_cnj is not null;

-- atualizado_em automatico (reusa touch_updated_at() criado na 0008)
alter table public.processos add column if not exists atualizado_em timestamptz not null default now();
drop trigger if exists processos_touch_trg on public.processos;
create trigger processos_touch_trg before update on public.processos
  for each row execute function public.touch_updated_at();

-- ===== PARTE C — POLICIES RLS "MEMBRO DO TENANT" (espelhadas no repo) =====
-- Padrao: membro do tenant (nexus.is_member) faz tudo na linha daquele tenant.
do $$
declare t text;
begin
  foreach t in array array['partes','processos','prazos_eventos','juris_doutrina','pecas'] loop
    execute format('drop policy if exists %I on public.%I', t||'_member_all', t);
    execute format($f$create policy %I on public.%I for all to authenticated
              using (nexus.is_member(tenant_id)) with check (nexus.is_member(tenant_id))$f$,
              t||'_member_all', t);
  end loop;
end $$;

-- tabelas-filhas sem tenant_id proprio: herdam via join do pai
drop policy if exists processo_partes_member_all on public.processo_partes;
create policy processo_partes_member_all on public.processo_partes for all to authenticated
  using (exists (select 1 from public.processos p where p.id = processo_id and nexus.is_member(p.tenant_id)))
  with check (exists (select 1 from public.processos p where p.id = processo_id and nexus.is_member(p.tenant_id)));

drop policy if exists pecas_versoes_member_all on public.pecas_versoes;
create policy pecas_versoes_member_all on public.pecas_versoes for all to authenticated
  using (exists (select 1 from public.pecas pc where pc.id = peca_id and nexus.is_member(pc.tenant_id)))
  with check (exists (select 1 from public.pecas pc where pc.id = peca_id and nexus.is_member(pc.tenant_id)));

-- tenant_members: cada um enxerga a propria adesao (ou se for membro do tenant)
drop policy if exists tenant_members_self on public.tenant_members;
create policy tenant_members_self on public.tenant_members for select to authenticated
  using (user_id = auth.uid() or nexus.is_member(tenant_id));
