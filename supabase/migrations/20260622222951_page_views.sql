-- 0004_page_views — contagem de VIEWS por rota, reaproveitando a tabela site_stats.
-- Idempotente. As views ficam em chaves 'view:/home', 'view:/musicas', etc.
--
-- Postura: escrita anônima SEGURA (mesmo padrão do bump_visits). O visitante NÃO
-- escreve na tabela (RLS sem policy de escrita); ele só chama bump_view(rota), que
-- roda SECURITY DEFINER. A função VALIDA a rota (só /a-z0-9/_-, até 64 chars) pra
-- não deixar criar chaves-lixo arbitrárias. Leitura é pública (policy já existente).

create or replace function public.bump_view(p_route text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key   text;
  v_count bigint;
begin
  -- aceita só rota simples tipo /home, /git-nexus, /a/b — chars seguros, até 64.
  if p_route is null or p_route !~ '^/[a-z0-9/_-]{0,63}$' then
    raise exception 'rota invalida';
  end if;
  v_key := 'view:' || p_route;
  insert into public.site_stats (key, count)
       values (v_key, 1)
  on conflict (key)
    do update set count = site_stats.count + 1, updated_at = now()
  returning count into v_count;
  return v_count;
end;
$$;

-- anon e authenticated podem EXECUTAR a função (mas não escrever a tabela direto).
revoke all on function public.bump_view(text) from public;
grant execute on function public.bump_view(text) to anon, authenticated;
