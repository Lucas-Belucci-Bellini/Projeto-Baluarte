-- ============================================================================
-- 0008_universal_db.sql — "Banco de Dados Universal" do ecossistema J.A.R.V.I.S.
--
-- Três pilares (pedido do operador):
--   1. SYNC UNIVERSAL  — media_bookmarks: save-state de mídia por usuário
--      (timecode exato de vídeo/filme/música), sincronizado entre o app
--      desktop (Electron) e o mobile/web (v0.4.0). As preferências profundas
--      (tema, universo, favoritos, prefs jsonb) JÁ vivem em `profiles` (0005).
--   2. GLOBAL COMMS    — chat global em tempo real (Supabase Realtime /
--      postgres_changes): mensagens chegam por WebSocket, sem polling.
--   3. AÇO             — RLS dono-só nos save-states (ninguém altera o estado
--      de outro), anti-flood no chat por trigger, índices de performance nas
--      colunas de busca primárias.
--
-- Idempotente (pode rodar mais de uma vez). Postura RLS-first do projeto
-- (docs/SUPABASE.md): a anon key é pública por design; quem protege é o RLS.
-- ============================================================================

-- ========== 1. SYNC UNIVERSAL — bookmarks de mídia (save states) ============

create table if not exists public.media_bookmarks (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  media_key     text not null check (char_length(media_key) between 1 and 200),
  kind          text not null default 'video'
                check (kind in ('video','musica','filme','serie','radio','leitura','outro')),
  position_secs numeric not null default 0 check (position_secs >= 0),
  duration_secs numeric check (duration_secs is null or duration_secs >= 0),
  meta          jsonb not null default '{}'::jsonb,
  updated_at    timestamptz not null default now(),
  -- 1 save-state por (usuário, mídia) → upsert natural; o índice UNIQUE também
  -- é o índice de busca pontual (user_id, media_key) — lookup em milissegundos
  unique (user_id, media_key)
);

comment on table public.media_bookmarks is
  'Save-state de mídia por usuário (timecode onde parou) — sync desktop/mobile. RLS dono-só.';

-- "continuar assistindo": os N mais recentes do usuário, direto do índice
create index if not exists media_bookmarks_user_recent_idx
  on public.media_bookmarks (user_id, updated_at desc);

-- updated_at automático em todo UPDATE (o cliente não precisa mandar)
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists media_bookmarks_touch_trg on public.media_bookmarks;
create trigger media_bookmarks_touch_trg
  before update on public.media_bookmarks
  for each row execute function public.touch_updated_at();

alter table public.media_bookmarks enable row level security;

-- RLS DONO-SÓ: sob hipótese alguma um usuário lê/altera o save-state de outro
drop policy if exists "bookmarks owner select" on public.media_bookmarks;
create policy "bookmarks owner select"
  on public.media_bookmarks for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "bookmarks owner insert" on public.media_bookmarks;
create policy "bookmarks owner insert"
  on public.media_bookmarks for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "bookmarks owner update" on public.media_bookmarks;
create policy "bookmarks owner update"
  on public.media_bookmarks for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "bookmarks owner delete" on public.media_bookmarks;
create policy "bookmarks owner delete"
  on public.media_bookmarks for delete to authenticated
  using (auth.uid() = user_id);

-- ========== 2. GLOBAL COMMS — chat global em tempo real =====================

create table if not exists public.global_comms (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  author     text not null check (char_length(author) between 1 and 40),
  text       text not null check (char_length(text) between 1 and 500),
  created_at timestamptz not null default now()
);

comment on table public.global_comms is
  'Chat global (Rede Neural) — leitura pública, escrita autenticada (só como si mesmo), entrega via Realtime.';

-- histórico paginado por tempo (a consulta canônica do chat)
create index if not exists global_comms_created_idx
  on public.global_comms (created_at desc);
-- moderação/perfil: mensagens de um usuário no tempo
create index if not exists global_comms_user_idx
  on public.global_comms (user_id, created_at desc);

alter table public.global_comms enable row level security;

-- leitura pública (qualquer visitante vê a conversa; escrever exige login)
drop policy if exists "comms public read" on public.global_comms;
create policy "comms public read"
  on public.global_comms for select using (true);

-- escreve só autenticado E só como si mesmo (impossível forjar user_id)
drop policy if exists "comms self insert" on public.global_comms;
create policy "comms self insert"
  on public.global_comms for insert to authenticated
  with check (auth.uid() = user_id);

-- pode apagar a PRÓPRIA mensagem; editar não (histórico íntegro)
drop policy if exists "comms self delete" on public.global_comms;
create policy "comms self delete"
  on public.global_comms for delete to authenticated
  using (auth.uid() = user_id);

-- ANTI-FLOOD (aço): 1 mensagem a cada 2s por usuário, direto no banco —
-- nem um cliente adulterado consegue inundar a tabela.
create or replace function public.comms_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1 from public.global_comms
     where user_id = new.user_id
       and created_at > now() - interval '2 seconds'
  ) then
    raise exception 'rate limit: aguarde 2s entre mensagens';
  end if;
  return new;
end;
$$;

drop trigger if exists comms_rate_limit_trg on public.global_comms;
create trigger comms_rate_limit_trg
  before insert on public.global_comms
  for each row execute function public.comms_rate_limit();

-- REALTIME: publica INSERTs de global_comms no WebSocket (postgres_changes).
-- Idempotente: só adiciona se ainda não estiver na publicação.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime'
       and schemaname = 'public'
       and tablename = 'global_comms'
  ) then
    alter publication supabase_realtime add table public.global_comms;
  end if;
end $$;

-- ========== 3. AÇO — fecha exposição das funções de trigger =================
-- (padrão da 0003: função de trigger não precisa ser chamável pela API)
revoke execute on function public.touch_updated_at() from anon, authenticated, public;
revoke execute on function public.comms_rate_limit() from anon, authenticated, public;
