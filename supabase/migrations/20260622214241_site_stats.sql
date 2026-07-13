-- 0002_site_stats — Contador global de acessos do Baluarte.
-- Versionada aqui; aplicar no projeto Supabase (dashboard SQL Editor OU MCP numa
-- sessão local). Idempotente: pode rodar mais de uma vez sem quebrar.
--
-- Postura de segurança: escrita anônima SEGURA. O visitante NÃO escreve na
-- tabela (RLS sem policy de insert/update/delete = negado). Ele só chama a
-- função bump_visits() (SECURITY DEFINER), que incrementa o contador rodando
-- como dono. Leitura do total é pública.

create table if not exists public.site_stats (
  key        text primary key,
  count      bigint not null default 0,
  updated_at timestamptz not null default now()
);

-- Linha do contador de visitas (não zera se já existir).
insert into public.site_stats (key, count)
  values ('visits', 0)
  on conflict (key) do nothing;

alter table public.site_stats enable row level security;

-- Leitura pública dos contadores (qualquer visitante vê o número).
drop policy if exists "site_stats public read" on public.site_stats;
create policy "site_stats public read"
  on public.site_stats for select
  using (true);

-- Sem policy de insert/update/delete => ninguém escreve direto na tabela.

-- Incremento atômico via função. SECURITY DEFINER faz a função rodar como o
-- dono (ignora o RLS), então o anon consegue incrementar SÓ por aqui.
create or replace function public.bump_visits()
returns bigint
language sql
security definer
set search_path = public
as $$
  update public.site_stats
     set count = count + 1, updated_at = now()
   where key = 'visits'
  returning count;
$$;

-- anon e authenticated podem EXECUTAR a função (mas não escrever a tabela).
revoke all on function public.bump_visits() from public;
grant execute on function public.bump_visits() to anon, authenticated;
