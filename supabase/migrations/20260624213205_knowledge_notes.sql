-- 0006_knowledge — Segundo Cérebro por usuário (Omega Prism, Fatia 1).
-- Notas/conceitos com tags e links, guardadas POR USUÁRIO. RLS dono-só:
-- cada um lê/escreve só as próprias linhas (auth.uid() = user_id). Idempotente.

create table if not exists public.knowledge_notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null default '',
  body       text not null default '',
  tags       text[] not null default '{}',
  links      text[] not null default '{}',   -- ids/títulos de notas ligadas
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists knowledge_notes_user_idx
  on public.knowledge_notes (user_id, updated_at desc);

alter table public.knowledge_notes enable row level security;

drop policy if exists "knowledge owner read" on public.knowledge_notes;
create policy "knowledge owner read"
  on public.knowledge_notes for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "knowledge owner insert" on public.knowledge_notes;
create policy "knowledge owner insert"
  on public.knowledge_notes for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "knowledge owner update" on public.knowledge_notes;
create policy "knowledge owner update"
  on public.knowledge_notes for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "knowledge owner delete" on public.knowledge_notes;
create policy "knowledge owner delete"
  on public.knowledge_notes for delete to authenticated
  using (auth.uid() = user_id);
