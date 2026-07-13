-- 0003_db_hardening — fecha exposições desnecessárias no schema público.
-- Idempotente; aplicar no dashboard (SQL Editor) OU via MCP.
--
-- CONTEXTO: `public.rls_auto_enable()` é uma FUNÇÃO DE EVENT TRIGGER (gatilho
-- `ensure_rls`, em ddl_command_end) que LIGA RLS automaticamente em toda tabela
-- nova do schema `public` — um ótimo trilho de segurança (uma tabela nunca nasce
-- sem RLS). Porém, por ser SECURITY DEFINER e morar no schema `public`, o
-- PostgREST a expõe como RPC em /rest/v1/rpc/rls_auto_enable (anon/authenticated
-- podem chamar). A chamada direta é INÓCUA (a função só funciona dentro de um
-- event trigger, via pg_event_trigger_ddl_commands()), mas é exposição
-- desnecessária e o database linter alerta (lint 0028/0029).
--
-- CORREÇÃO: revogar o EXECUTE. Isso NÃO quebra o event trigger — event triggers
-- rodam com o dono (postgres), independente de quem tem EXECUTE na função. Só
-- remove a possibilidade de chamá-la diretamente pela API REST.

revoke execute on function public.rls_auto_enable() from anon, authenticated, public;

-- Nota: `public.bump_visits()` PERMANECE executável por anon/authenticated de
-- propósito — é o mecanismo de escrita anônima SEGURA do contador (o anon
-- incrementa pela função SECURITY DEFINER, sem poder escrever a tabela). O aviso
-- do linter para ela é esperado/by-design (ver docs/SUPABASE.md §2).
