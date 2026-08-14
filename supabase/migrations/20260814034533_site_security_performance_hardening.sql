-- Baluarte site: harden RLS evaluation and remove redundant permissive policy.
-- No data is changed; only policies/indexes are adjusted.

-- site_stats: the public SELECT policy already covers authenticated users.
drop policy if exists "sel_stats" on public.site_stats;

-- Avoid per-row re-evaluation of auth.uid()/auth.jwt() in RLS policies.
drop policy if exists "comms self insert" on public.global_comms;
create policy "comms self insert" on public.global_comms
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "comms self delete" on public.global_comms;
create policy "comms self delete" on public.global_comms
  for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "knowledge owner read" on public.knowledge_notes;
create policy "knowledge owner read" on public.knowledge_notes
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "knowledge owner insert" on public.knowledge_notes;
create policy "knowledge owner insert" on public.knowledge_notes
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "knowledge owner update" on public.knowledge_notes;
create policy "knowledge owner update" on public.knowledge_notes
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "knowledge owner delete" on public.knowledge_notes;
create policy "knowledge owner delete" on public.knowledge_notes
  for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "memories owner read" on public.memories;
create policy "memories owner read" on public.memories
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "memories owner insert" on public.memories;
create policy "memories owner insert" on public.memories
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "memories owner update" on public.memories;
create policy "memories owner update" on public.memories
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "memories owner delete" on public.memories;
create policy "memories owner delete" on public.memories
  for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "bookmarks owner select" on public.media_bookmarks;
create policy "bookmarks owner select" on public.media_bookmarks
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "bookmarks owner insert" on public.media_bookmarks;
create policy "bookmarks owner insert" on public.media_bookmarks
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "bookmarks owner update" on public.media_bookmarks;
create policy "bookmarks owner update" on public.media_bookmarks
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "bookmarks owner delete" on public.media_bookmarks;
create policy "bookmarks owner delete" on public.media_bookmarks
  for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "profiles owner read" on public.profiles;
create policy "profiles owner read" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "profiles owner insert" on public.profiles;
create policy "profiles owner insert" on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "profiles owner update" on public.profiles;
create policy "profiles owner update" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "sel_members" on public.tenant_members;
create policy "sel_members" on public.tenant_members
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Mural operator policies: evaluate JWT once per statement instead of once per row.
drop policy if exists "mural owner insert" on public.mural_posts;
create policy "mural owner insert" on public.mural_posts
  for insert to authenticated
  with check ((select auth.jwt() ->> 'email') = 'lucasbb2007@gmail.com');

drop policy if exists "mural owner update" on public.mural_posts;
create policy "mural owner update" on public.mural_posts
  for update to authenticated
  using ((select auth.jwt() ->> 'email') = 'lucasbb2007@gmail.com')
  with check ((select auth.jwt() ->> 'email') = 'lucasbb2007@gmail.com');

drop policy if exists "mural owner delete" on public.mural_posts;
create policy "mural owner delete" on public.mural_posts
  for delete to authenticated
  using ((select auth.jwt() ->> 'email') = 'lucasbb2007@gmail.com');

-- Covering indexes for foreign keys flagged by the performance advisor.
create index if not exists idx_pecas_processo_id on public.pecas (processo_id);
create index if not exists idx_prazos_eventos_processo_id on public.prazos_eventos (processo_id);
create index if not exists idx_processo_partes_parte_id on public.processo_partes (parte_id);
create index if not exists idx_processos_cliente_id on public.processos (cliente_id);
create index if not exists idx_tenant_members_user_id on public.tenant_members (user_id);
