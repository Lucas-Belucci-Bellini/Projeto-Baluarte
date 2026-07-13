-- (recuperada do remoto — aplicada via MCP em 2026-06-28; agora versionada
-- no repo pra o check do Supabase Preview parar de acusar divergência)
create table if not exists public.mil_curation (
  id text primary key,
  note text,
  featured boolean not null default false,
  sort integer not null default 0,
  updated_at timestamptz not null default now()
);

comment on table public.mil_curation is 'Curadoria do Centro Militar (/militar): sobrepoe a Wikipedia com nota/destaque/ordem do operador. Leitura publica; escrita so via service_role (dashboard/MCP).';

alter table public.mil_curation enable row level security;

drop policy if exists "mil_curation public read" on public.mil_curation;
create policy "mil_curation public read" on public.mil_curation
  for select to anon, authenticated using (true);
