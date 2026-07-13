-- (recuperada do remoto — aplicada via MCP em 2026-07-11)
-- Fix (Nexus 0010a): o ingest_event do Nexus estourava o check pré-existente
-- de nucleo_events — a tabela só aceitava os 5 tipos do /api/nucleo. Amplia a
-- lista com os tipos de TELEMETRIA do Mega Plano (page_view, click, …) sem
-- afetar o fluxo atual (os 5 originais continuam válidos).
alter table public.nucleo_events drop constraint nucleo_events_type_check;
alter table public.nucleo_events add constraint nucleo_events_type_check
  check (type = any (array[
    'command','telemetry','biometric','system','response',      -- originais (/api/nucleo)
    'page_view','click','interaction','session','voice','error','learning','custom'  -- Nexus/telemetria
  ]::text[]));

-- Hardening (advisor 0028): buscar_juris exige usuário autenticado por design
-- (nexus.is_member) — não precisa ser executável pelo papel anon.
revoke execute on function public.buscar_juris(uuid, vector, integer) from anon;
