# 🗄️ Supabase — banco oficial do Baluarte

> **Fonte única de verdade** do backend de dados do Baluarte. Explica o projeto,
> as credenciais (públicas por design), a **postura de segurança (RLS-first)**, o
> estado das *migrations* e **como aplicá-las** (independente de quem aplica —
> dashboard, MCP ou CLI). Referência viva: atualizar quando criar tabela/policy.
>
> Contexto: **web = leve (#238)** — o site fala com o Supabase **sem SDK**, direto
> na REST/Auth por `fetch` (`src/core/supabase.js`). A *publishable key* é pública
> por design; **quem protege é o RLS** no banco.

---

## 1. Projeto & credenciais

| Item | Valor |
| --- | --- |
| Projeto | `Lucas-Belucci-Bellini's Project` |
| Ref / `project_id` | `hcwzsxdcvmswebunznak` |
| URL | `https://hcwzsxdcvmswebunznak.supabase.co` |
| Publishable (anon) key | `sb_publishable_uR0aJkZN54dkQJY0Tnx6GA_-4ehyOCm` |
| Região | `us-west-2` · Postgres 17 |

**Config por env** (opcional — há *fallback* pro projeto oficial no código):

```bash
VITE_SUPABASE_URL=https://hcwzsxdcvmswebunznak.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_uR0aJkZN54dkQJY0Tnx6GA_-4ehyOCm
```

> Sem env e sem fallback, `supabaseConfigured()` é `false` e os recursos caem no
> **modo local** (ex.: o mural volta pro `localStorage`). A *anon key* ser pública
> **não** é vazamento: ela só dá o acesso que o RLS permitir.

---

## 2. Postura de segurança (RLS-first)

Toda tabela tem **Row Level Security** ligado. As policies definem quem pode o quê:

- **`mural_posts`** (#187/#287) — **leitura pública**; **escrita só do operador**:
  o `insert/update/delete` exige `auth.jwt() ->> 'email' = 'lucasbb2007@gmail.com'`.
  Mesmo que um estranho se cadastre e logue, o e-mail no JWT não bate → escrita negada.
- **`site_stats`** (contador, #290) — **leitura pública**; **sem policy de escrita**
  (logo, ninguém escreve direto na tabela). O incremento acontece **só** pela função
  `public.bump_visits()`, marcada `SECURITY DEFINER`: ela roda como o dono e ignora o
  RLS, então o visitante anônimo consegue **incrementar pelo RPC** sem ter permissão de
  escrever a tabela. Padrão de **escrita anônima SEGURA**.
- **Views por página** (#291) reusam a mesma `site_stats`: chaves `view:/rota`
  incrementadas por `public.bump_view(rota)` (mesmo padrão anônimo-seguro). A função
  **valida a rota** (`^/[a-z0-9/_-]{0,63}$`) pra não deixar criar chave-lixo. Leitura
  pública via `?key=like.view:*`; o cliente conta **1×/rota/sessão** (`page-views.js`).

> ℹ️ **Sobre o aviso do linter** "Public Can Execute SECURITY DEFINER Function"
> para `bump_visits()`: é **intencional e seguro** — a função só faz
> `count = count + 1` numa linha fixa (`key = 'visits'`) e devolve o total. É o
> mecanismo que permite contar visitas sem deixar o anon escrever na tabela.

**Trilho de segurança (defesa em profundidade):** existe um **event trigger**
`ensure_rls` (função `rls_auto_enable()`) que **liga RLS automaticamente em toda
tabela nova** do schema `public` — assim nenhuma tabela nasce sem RLS por
esquecimento. A migration `0003` revogou o `EXECUTE` público dessa função (ela não
precisa ser chamável pela API); o gatilho segue ativo (roda como dono).

---

## 3. Estado das migrations

Versionadas em `supabase/migrations/`. Idempotentes (podem rodar mais de uma vez).

| Arquivo | O quê | Status |
| --- | --- | --- |
| `0001_mural_posts.sql` | tabela `mural_posts` + RLS (mural #187) | ✅ aplicada (`20260622033728 create_mural_posts`) |
| `0002_site_stats.sql` | tabela `site_stats` + função `bump_visits()` (contador #290) | ✅ aplicada (22/06/2026, migration `site_stats`) |
| `0003_db_hardening.sql` | revoga `EXECUTE` público do event-trigger `rls_auto_enable()` | ✅ aplicada (22/06/2026, migration `db_hardening`) |
| `0004_page_views.sql` | função `bump_view(rota)` — views por página em `site_stats` (chaves `view:/rota`) | ✅ aplicada (22/06/2026, migration `page_views`) |
| `0005_profiles.sql` | contas de usuário: `profiles` (RLS dono-só) + trigger de criação no signup | ✅ aplicada (23/06/2026, migration `profiles`) |
| `0006_knowledge.sql` | `knowledge_notes` por usuário (Segundo Cérebro, Omega Prism) — RLS dono-só | ✅ aplicada (24/06/2026, migration `knowledge_notes`) |
| `0007_memories.sql` | `memories` por usuário (Memória do JARVIS, Omega Prism) — RLS dono-só | ✅ aplicada (24/06/2026, migration `memories`) |

Conferir o estado a qualquer momento (sessão com Supabase MCP):
`list_tables` (tabelas + RLS) e `list_migrations` (histórico aplicado).

---

## 4. Como aplicar uma migration (3 caminhos)

Escolha **um**. Todos chegam no mesmo lugar; o SQL completo está na **seção 5**.

### A) Dashboard → SQL Editor (não depende de ferramenta) — ~1 min
1. Abra o [SQL Editor](https://supabase.com/dashboard/project/hcwzsxdcvmswebunznak/sql/new).
2. Cole o bloco SQL da migration (seção 5) e clique **Run**.
3. Pronto — por ser idempotente, rodar de novo não quebra.

### B) Supabase MCP (sessão Claude Code que tenha o MCP — local **ou** remota configurada)
- `apply_migration({ project_id: "hcwzsxdcvmswebunznak", name: "<slug>", query: "<SQL>" })`
  para DDL (registra no histórico de migrations), ou `execute_sql` para conferências.
- ⚠️ Abrir **outra conversa remota no mesmo ambiente sem o MCP configurado NÃO resolve** —
  é preciso ter o servidor Supabase MCP + `SUPABASE_ACCESS_TOKEN`. Doc:
  https://code.claude.com/docs/en/claude-code-on-the-web

### C) Supabase CLI (máquina com a CLI logada)
```bash
supabase link --project-ref hcwzsxdcvmswebunznak
supabase db push        # aplica as migrations de supabase/migrations/
```

---

## 5. SQL das migrations (copy-paste)

### 5.1 `0001_mural_posts.sql` — Mural (#187)

```sql
create table if not exists public.mural_posts (
  id uuid primary key default gen_random_uuid(),
  author text not null default 'Operador',
  text text not null check (char_length(text) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists mural_posts_created_idx
  on public.mural_posts (created_at desc);

alter table public.mural_posts enable row level security;

drop policy if exists "mural public read" on public.mural_posts;
create policy "mural public read"
  on public.mural_posts for select using (true);

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
```

### 5.2 `0002_site_stats.sql` — Contador de acessos (#290)

```sql
create table if not exists public.site_stats (
  key        text primary key,
  count      bigint not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.site_stats (key, count)
  values ('visits', 0)
  on conflict (key) do nothing;

alter table public.site_stats enable row level security;

drop policy if exists "site_stats public read" on public.site_stats;
create policy "site_stats public read"
  on public.site_stats for select using (true);

-- Sem policy de insert/update/delete => ninguém escreve direto na tabela.

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

revoke all on function public.bump_visits() from public;
grant execute on function public.bump_visits() to anon, authenticated;
```

### 5.3 `0003_db_hardening.sql` — fecha exposição do event-trigger

```sql
-- rls_auto_enable() é função de event trigger (liga RLS em tabela nova). Não
-- precisa ser chamável pela API. Revogar não quebra o gatilho (roda como dono).
revoke execute on function public.rls_auto_enable() from anon, authenticated, public;
```

### 5.4 `0004_page_views.sql` — views por página (#291)

```sql
create or replace function public.bump_view(p_route text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key text; v_count bigint;
begin
  if p_route is null or p_route !~ '^/[a-z0-9/_-]{0,63}$' then
    raise exception 'rota invalida';
  end if;
  v_key := 'view:' || p_route;
  insert into public.site_stats (key, count) values (v_key, 1)
  on conflict (key) do update set count = site_stats.count + 1, updated_at = now()
  returning count into v_count;
  return v_count;
end;
$$;
revoke all on function public.bump_view(text) from public;
grant execute on function public.bump_view(text) to anon, authenticated;
```

### 5.5 `0005_profiles.sql` — contas de usuário

Cria `profiles` (RLS **dono-só** por `auth.uid()`) + trigger `handle_new_user`
(cria o perfil no cadastro) + revoga o `EXECUTE` da função de trigger. SQL completo
no arquivo `supabase/migrations/0005_profiles.sql`.

---

## 6. Verificar (como anônimo, pela REST pública)

Prova a postura de segurança ponta-a-ponta (use a *anon key* da seção 1):

```bash
URL=https://hcwzsxdcvmswebunznak.supabase.co
ANON=sb_publishable_uR0aJkZN54dkQJY0Tnx6GA_-4ehyOCm

# 1) Leitura pública do contador → 200 + linha visits
curl -s -w "\n%{http_code}\n" "$URL/rest/v1/site_stats?select=key,count" \
  -H "apikey: $ANON" -H "authorization: Bearer $ANON"

# 2) Incremento anônimo SEGURO via RPC → 200 + novo total
curl -s -w "\n%{http_code}\n" -X POST "$URL/rest/v1/rpc/bump_visits" \
  -H "apikey: $ANON" -H "authorization: Bearer $ANON" -H "content-type: application/json" -d '{}'

# 3) Escrita direta anônima → 401 (RLS bloqueia)
curl -s -w "\n%{http_code}\n" -X POST "$URL/rest/v1/site_stats" \
  -H "apikey: $ANON" -H "authorization: Bearer $ANON" -H "content-type: application/json" \
  -d '{"key":"hack","count":999}'
```

Esperado: **(1) 200**, **(2) 200** com o total incrementado, **(3) 401**
`new row violates row-level security policy`. (O mural foi validado igual em #287.)

---

## 7. Login do dono no Mural (OTP) — pendente (#288)

Pra **publicar** no mural pelo site (a leitura já é pública), o operador loga via
**código OTP de 6 dígitos** no e-mail. **1 ajuste no painel (uma vez):**

- **Authentication → Email Templates → Magic Link**: incluir `{{ .Token }}` no corpo
  do e-mail (pra mostrar o **código**, não só o link mágico).

O código do fluxo (`requestOtp`/`verifyOtp`/refresh em `src/core/supabase.js`) vem no
PR **#288** — hoje travado num achado de CodeQL que o operador precisa destravar.

---

## 8. Avisos do linter (Database → Advisors) — para revisar

Rodar `get_advisors` (MCP) ou o **Advisors** do dashboard após cada DDL:

- ✅ **`bump_visits()` executável por anon (SECURITY DEFINER)** — **intencional** (seção 2).
- ✅ **`public.rls_auto_enable()`** — **resolvido pela `0003`**. É uma função de **event
  trigger** (`ensure_rls`, em `ddl_command_end`) que liga RLS automaticamente em toda
  tabela nova do `public` (bom trilho de segurança). A `0003` revogou o `EXECUTE` de
  anon/authenticated/public — o gatilho segue funcionando (roda como dono), só não fica
  mais exposta como RPC. Os 2 avisos do linter pra ela sumiram.
- ⚠️ **Leaked Password Protection desligado** (Auth) — opcional ligar
  ([doc](https://supabase.com/docs/guides/auth/password-security)).

---

## 9. Contas de usuário — login (Google) + preferências (#291)

Cada visitante pode **logar com Google** e ter a **sua estética** (tema + skin de
universo) e **favoritos** salvos na nuvem, restaurados em qualquer dispositivo.

- **Tabela `profiles`** (`0005`): `id` (= `auth.users.id`), `display_name`, `theme`,
  `universe`, `favorites jsonb`, `prefs jsonb`. **RLS dono-só** (`auth.uid() = id`).
  Trigger `handle_new_user` cria o perfil no cadastro.
- **Cliente** (sem SDK): `src/core/supabase-auth.js` (login Google via
  `/auth/v1/authorize`, sessão em localStorage + refresh) + `src/core/user-prefs.js`
  (`loadProfile`/`saveProfile`). Sem login → modo local, sem regressão.

### ⚙️ Setup do Google (uma vez, no painel — só o operador faz)
1. **Google Cloud Console** → APIs & Services → Credentials → **Create OAuth client ID**
   → **Web application**. Em *Authorized redirect URIs* adicione:
   `https://hcwzsxdcvmswebunznak.supabase.co/auth/v1/callback`. Copie **Client ID** + **Client Secret**.
2. **Supabase** → Authentication → **Providers → Google** → ative e cole o Client ID + Secret.
3. **Supabase** → Authentication → **URL Configuration** → *Redirect URLs* → adicione
   `https://projeto-baluarte.vercel.app/**` e `http://localhost:5173/**`.

Feito isso, o botão "Entrar com Google" (próxima fatia) funciona ponta a ponta.

---

## Refs
#187 (mural) · #287 (mural no banco) · #288 (login do dono/OTP) · #290 (contador) ·
#291 (regras/backlog) · #238 (web leve). Código: `src/core/supabase.js` ·
`src/core/supabase-auth.js` · `src/core/user-prefs.js` · migrations: `supabase/migrations/`.
