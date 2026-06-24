-- 0007_memories — Memória do JARVIS por usuário (Omega Prism, Fatia 1).
-- Fatos duráveis ("lembre que ..."), estilo supermemory, guardados POR USUÁRIO.
-- RLS dono-só (auth.uid() = user_id). Idempotente.

create table if not exists public.memories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  text       text not null check (char_length(text) between 1 and 4000),
  source     text not null default 'jarvis',
  tags       text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists memories_user_idx
  on public.memories (user_id, created_at desc);

alter table public.memories enable row level security;

drop policy if exists "memories owner read" on public.memories;
create policy "memories owner read"
  on public.memories for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "memories owner insert" on public.memories;
create policy "memories owner insert"
  on public.memories for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "memories owner update" on public.memories;
create policy "memories owner update"
  on public.memories for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "memories owner delete" on public.memories;
create policy "memories owner delete"
  on public.memories for delete to authenticated
  using (auth.uid() = user_id);
