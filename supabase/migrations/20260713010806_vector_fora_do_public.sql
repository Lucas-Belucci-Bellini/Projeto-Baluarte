-- Lint 0014 (extension_in_public): a extensão vector morava no schema public.
-- Move pro schema padrão de extensões do Supabase — colunas e funções que
-- usam o tipo seguem funcionando (a referência é por OID, não por nome).
create schema if not exists extensions;
grant usage on schema extensions to postgres, anon, authenticated, service_role;
alter extension vector set schema extensions;

-- Obs. (lints 0028/0029): ingest_event/ingest_stat/ingest_memory e
-- bump_view/bump_visits continuam executáveis por anon+authenticated DE
-- PROPÓSITO — são a porta pública de telemetria; o portão real é a
-- ingest_key (bcrypt) dentro da função. Documentado em docs/NEXUS.md.
