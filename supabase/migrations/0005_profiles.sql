-- 0005_profiles — contas de usuário (Supabase Auth) com preferências por usuário.
-- Cada visitante logado tem um perfil com a SUA estética (tema + skin de universo)
-- e favoritos, guardado por RLS: cada um só lê/escreve a PRÓPRIA linha. Um trigger
-- cria o perfil automaticamente no cadastro (padrão Supabase handle_new_user).
-- Idempotente.

create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  theme        text,
  universe     text,
  favorites    jsonb not null default '[]'::jsonb,
  prefs        jsonb not null default '{}'::jsonb,
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Cada usuário lê SÓ a própria linha.
drop policy if exists "profiles owner read" on public.profiles;
create policy "profiles owner read"
  on public.profiles for select to authenticated
  using (auth.uid() = id);

-- Cria SÓ a própria linha (defesa extra; o trigger já cria no signup).
drop policy if exists "profiles owner insert" on public.profiles;
create policy "profiles owner insert"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

-- Edita SÓ a própria linha.
drop policy if exists "profiles owner update" on public.profiles;
create policy "profiles owner update"
  on public.profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Cria o perfil automaticamente quando um usuário se cadastra (roda como dono).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name',
             new.raw_user_meta_data ->> 'full_name',
             split_part(coalesce(new.email, ''), '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- handle_new_user() é função de trigger — não precisa ser chamável pela API.
-- Revogar o EXECUTE evita a exposição como RPC (não quebra o trigger, que roda
-- como dono). Mesma higiene da 0003.
revoke execute on function public.handle_new_user() from anon, authenticated, public;

