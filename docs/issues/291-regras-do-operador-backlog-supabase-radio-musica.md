# #291 — 🧭 Regras do operador + backlog (Supabase, Rádio/Música offline, acesso ao banco)

> **Status:** open · **Criada:** 2026-06-22 · **Atualizada:** 2026-06-22 · **Comentários:** 1
> **Issue viva:** https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/291
>
> _Snapshot do corpo da issue (2026-06-27), parte do "issues → docs". Para comentários e estado mais recente, abra a issue no link acima._

---

## Objetivo
Consolidar, numa referência viva (junto do #248 manual e #240 roadmap), **(1) as regras/preferências** que o operador passou nesta linha de trabalho e **(2) tudo que falta fazer**. Continuidade entre sessões.

---

## 📏 Regras do operador (decisões a respeitar)

- **Branches = backup.** Cada versão/feature tem a **própria branch**, **preservada** como ponto de retorno — **não deletar** após o merge. Lema do operador: *"se tiver 500 mil versões vão ter 500 mil branchs (segurança pra, se um dia cair, ter onde voltar)"*. Ex. já preservadas: `claude/release-app-v0.2.0`, `claude/feat-contador-acessos`, e `claude/busy-hopper-9w0zw9` (#288 intacto).
- **Versão do app desktop:** esquema **0.x** (foi escolhido **0.2.0**, não 2.0.0).
- **Sidebar IA:** rótulo da entrada única = **"Núcleo de IA"** (#258).
- **Objetivo pessoal norteador:** poder ouvir as músicas do site (**Rádio** + **Música**) **em qualquer lugar, independente do WiFi** — inclusive em redes que bloqueiam serviços.
- **Split remoto/local do Supabase:** sessão **remota** (web) hoje **não** tem o Supabase MCP → ela **prepara código + SQL (migrations) + handoff**; o banco se **aplica** via dashboard ou sessão **local** (que tem o MCP).

---

## ✅ Já feito (contexto)
- App desktop **0.2.0** publicado — release `v0.2.0` + instaladores Win/Mac/Linux (#259).
- Sidebar enxuta — 1 entrada "Núcleo de IA" (#258, via #256/#257).
- Mural lê do **Supabase** (#287).
- **Contador de acessos** no Supabase no `main` (PR #290) — só **falta aplicar a migration** pra o número aparecer.

---

## 🛠️ A fazer

### 1. Acesso direto ao Supabase (pra um agente administrar o banco)
- [ ] Configurar o **Supabase MCP no ambiente remoto** (servidor MCP + `SUPABASE_ACCESS_TOKEN`). Feito 1×, **qualquer conversa nova na web** já roda SQL/cria tabela/mexe no RLS direto. Doc: https://code.claude.com/docs/en/claude-code-on-the-web
- [ ] (Alternativa) usar **sessão LOCAL** do Claude Code, que já tem o MCP (padrão do `HANDOFF-LOCAL.md`; a `0001` foi aplicada assim).
- ⚠️ Só **abrir outra conversa remota no mesmo ambiente, sem configurar o MCP, NÃO resolve** — mesma limitação.

### 2. Aplicar migrations no banco
- [ ] `supabase/migrations/0002_site_stats.sql` (contador) → **dashboard → SQL Editor → Run** (~1 min). Sem isso, a linha "👁 N visitas" fica oculta (zero erro).
- [ ] Confirmar `0001_mural_posts.sql` aplicada.
- [ ] Criar **`docs/SUPABASE.md`** com passo-a-passo + o SQL das migrations (copy-paste), pra ficar independente de quem aplica.

### 3. Rádio + Música tocando em qualquer rede
**Por que quebram hoje em WiFi restrito:** dependem de hosts externos — **Música** = embeds de YouTube/Spotify/SoundCloud; **Rádio** = API radio-browser + streams de servidores arbitrários + proxies CORS. Redes que bloqueiam esses serviços derrubam as duas.
- [ ] **Decisão-chave:** acervo **próprio / de uso livre** (hospedável) **OU** manter catálogo YouTube/Spotify (aí **não** há como garantir em rede que bloqueia esses serviços, e self-hostear o áudio deles fere ToS/direito autoral).
- [ ] **Offline / PWA** *(recomendado p/ música própria)*: hospedar o áudio (**Supabase Storage** ou Vercel) + cachear no **service worker** → toca **sem internet e em qualquer WiFi** depois do 1º load. É o que realmente cumpre "ouvir em qualquer lugar".
- [ ] **Proxy serverless** *(p/ rádio ao vivo)*: função no **próprio domínio** repassa o stream — o IP que aparece é o do servidor ("troca o IP daquele ponto específico"). Caveats: gasta banda da Vercel; YouTube/Spotify bloqueiam IP de datacenter + ToS; precisa o **site** não estar bloqueado.
- [ ] ❌ **VPN "dentro do site" não é possível** — página roda no sandbox do navegador (sem raw sockets / sem trocar o IP do aparelho). VPN real = **app separado** no dispositivo, fora do site. *(Registrado pra não reabrir a dúvida.)*

### 4. Login do dono no Mural (#288) — PARADO
- [ ] Destravar o **CodeQL** do #288: o operador precisa **colar os 2 rule ids** (1 high + 1 medium) que o scan aponta no PR. Sem isso, **publicar** no mural fica parado (leitura já funciona). Branch preservada: `claude/busy-hopper-9w0zw9`.

---

## Refs
#240 (roadmap) · #248 (manual/regras) · #238 (web leve / app completo) · #259 (release app) · #287 (mural no banco) · #288 (login do dono) · #258 (sidebar)

🤖 Gerado com [Claude Code](https://claude.com/claude-code)
