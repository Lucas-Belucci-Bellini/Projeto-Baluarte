-- ============================================================================
-- 0009_nucleo_events.sql — Ponte AO VIVO do Núcleo SEM servidor próprio (#340).
--
-- O caminho: agente de voz (ElevenLabs) → função Vercel /api/nucleo (valida o
-- token) → INSERT aqui → Supabase Realtime empurra pro site → o Núcleo Mark
-- XIII reage na hora (cena pulsa, comando aparece/executa no chat).
-- Substitui o WebSocket do backend Java enquanto ele não tem deploy — mesma
-- forma de evento (`{type, source, payload, ts}`) do `nucleo-socket.js`.
--
-- Segurança: leitura pública (os eventos movem a cena; nada sensível),
-- escrita SÓ pela service key (a função Vercel) — nenhuma policy de escrita.
-- ============================================================================

create table if not exists public.nucleo_events (
  id         uuid primary key default gen_random_uuid(),
  type       text not null default 'command'
             check (type in ('command','telemetry','biometric','system','response')),
  source     text not null default 'api' check (char_length(source) between 1 and 40),
  payload    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.nucleo_events is
  'Eventos ao vivo do Núcleo (voz/API → site via Realtime). Escrita só via service key (função /api/nucleo).';

create index if not exists nucleo_events_created_idx
  on public.nucleo_events (created_at desc);

alter table public.nucleo_events enable row level security;

drop policy if exists "nucleo events public read" on public.nucleo_events;
create policy "nucleo events public read"
  on public.nucleo_events for select using (true);

-- sem policy de insert/update/delete → só a service role escreve

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime'
       and schemaname = 'public'
       and tablename = 'nucleo_events'
  ) then
    alter publication supabase_realtime add table public.nucleo_events;
  end if;
end $$;
