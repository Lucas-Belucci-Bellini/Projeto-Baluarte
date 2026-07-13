-- 0001_mural_posts — Mural do Baluarte (#187) no banco oficial.
-- Aplicada no projeto Supabase via MCP; versionada aqui pra rastreio.
-- Postura: leitura PÚBLICA, escrita SÓ do operador (travada pelo e-mail no JWT).

create table if not exists public.mural_posts (
  id uuid primary key default gen_random_uuid(),
  author text not null default 'Operador',
  text text not null check (char_length(text) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists mural_posts_created_idx
  on public.mural_posts (created_at desc);

alter table public.mural_posts enable row level security;

-- Leitura pública (qualquer visitante vê o mural).
drop policy if exists "mural public read" on public.mural_posts;
create policy "mural public read"
  on public.mural_posts for select
  using (true);

-- Escrita SÓ do dono (mesmo que alguém se cadastre, o e-mail no JWT precisa bater).
drop policy if exists "mural owner insert" on public.mural_posts;
create policy "mural owner insert"
  on public.mural_posts for insert to authenticated
  with check (auth.jwt() ->> 'email' = 'lucasbb2007@gmail.com');

drop policy if exists "mural owner update" on public.mural_posts;
create policy "mural owner update"
  on public.mural_posts for update to authenticated
  using (auth.jwt() ->> 'email' = 'lucasbb2007@gmail.com')
  with check (auth.jwt() ->> 'email' = 'lucasbb2007@gmail.com');

drop policy if exists "mural owner delete" on public.mural_posts;
create policy "mural owner delete"
  on public.mural_posts for delete to authenticated
  using (auth.jwt() ->> 'email' = 'lucasbb2007@gmail.com');
