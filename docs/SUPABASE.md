# 🗄️ Banco oficial — Supabase

O Baluarte usa um projeto **Supabase** (Postgres) como banco oficial. O acesso é
por **REST/Auth via `fetch`** (sem SDK — regra web=leve, #238). Cliente:
`src/core/supabase.js`. Migrations versionadas em `supabase/migrations/`.

## Config

A URL e a *publishable key* têm **fallback no código** (`src/core/supabase.js`) —
a publishable key é **pública por design** (a segurança é o RLS). Dá pra
sobrescrever por env (ex.: pra rotacionar ou usar outro projeto):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Na **Vercel**: Project → Settings → Environment Variables (Production + Preview).
Sem env, o app usa o fallback. **Nunca** colocar a `service_role`/secret key no
front (essa é server-only).

## Login do operador (código OTP de 6 dígitos)

O `/mural` deixa o **dono** publicar após login por **código OTP** no e-mail
(`requestOtp` → `verifyOtp`). O RLS só autoriza a escrita do e-mail
`lucasbb2007@gmail.com`.

### ⚙️ Ajuste necessário no painel do Supabase (uma vez)

Por padrão o e-mail manda **link mágico**, não o código. Pra mostrar o código:

1. Supabase → **Authentication → Email Templates → Magic Link** (e/ou *Confirm signup*).
2. Inclua o token no corpo, ex.:
   ```html
   <h2>Seu código do Baluarte</h2>
   <p>Use este código para entrar: <b>{{ .Token }}</b></p>
   ```
3. (Opcional) Authentication → Providers → Email: manter **Enable Email** ligado.
4. (Opcional, segurança) deixar **signups** restritos — o RLS já tranca a escrita
   ao e-mail do dono, mas limitar cadastro evita usuários soltos.

> Magic-link (clicar no link) também funcionaria, mas o site usa **hash routing**
> (`#/rota`), então o código OTP é mais robusto (sem redirect).

## Tabelas

| Tabela | RLS | Uso |
|---|---|---|
| `mural_posts` | leitura pública · escrita só do dono (e-mail no JWT) | `/mural` (#187) |

## Próximos candidatos a "oficial"

Perfil/config do operador (sync entre dispositivos), e — só com criptografia +
auth forte — o cofre do `/apis`. Sempre: **RLS primeiro**, depois expor.
