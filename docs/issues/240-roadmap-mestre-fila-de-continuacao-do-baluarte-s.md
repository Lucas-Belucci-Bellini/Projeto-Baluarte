# #240 — 🗺️ Roadmap mestre — fila de continuação do Baluarte (siga esta issue)

> **Status:** open · **Criada:** 2026-06-16 · **Atualizada:** 2026-06-21 · **Comentários:** 2
> **Issue viva:** https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/240
>
> _Snapshot do corpo da issue (2026-06-27), parte do "issues → docs". Para comentários e estado mais recente, abra a issue no link acima._

---

> **Como usar (pra próximas conversas):** diga *"continue o Baluarte seguindo a issue #240"*. A conversa lê isto, pega o **próximo item não-marcado** da fila certa (🟢 remota = web, na nuvem · 🖥 local = precisa da máquina+skills), executa no **fluxo padrão** (branch → PR draft → CI verde → merge → atualizar `CHANGELOG`, com backup branch antes do merge) e marca o item aqui. JS puro (ES2022), sem TS/framework. Verificar UI no navegador (skill `run-projeto-baluarte` / Playwright).
>
> 📒 **Regras, fluxo e a divisão remoto/local estão no Manual → #248** (ler junto com esta). **Não fechar** nenhuma das duas.

## 🎯 A visão (mega-plano #238)
**Web = leve/vitrine. App = completo/pesado. Uma base de código, gated por `window.baluarte.native`** (no navegador o pesado vira teaser "baixe o app"; no launcher ativa de verdade).

---

## ✅ Já entregue (NÃO refazer)
- **Home**: herói 3D WebGL (sem dependência).
- **Git Nexus**: orbe 3D + Console (context/impact/path/rename) + drill-down por arquivo + nível de funções + **consome o grafo real do motor** (M3b).
- **App desktop (Baluarte Launcher)** M0→M3b: carrega a produção, auto-update, splash/tray/deep-link, **ponte IPC allowlisted**, detecção do motor (M3a) + grafo real (M3b). **Release v0.1.0 publicada** (+ bump v0.1.1 + ícone).
- **Página `/baixar`** (detecta SO, baixa o instalador certo, lê a release em runtime).
- **Logo**: selo vermelho (favicon, boot, sidebar, header, **ícone do app**).
- **JARVIS ↔ Git Nexus** (#231): 5 skills por arquivo (`nexus_impact/context/path/deps/rename`) + **5 skills por função** (`nexus_fn_impact/context/path/deps/hot`, #279).
- **Redesign #195**: `/perfil` (Dossiê do Operador), `/sobre` (timeline), **12 páginas da Seção Militar** (via `militar.css`), **Onda 2 — Geo/Tático** (6 págs, #242), **Onda 3 — Campo & Tático** (#243) e **páginas leves** `/projetos` `/roadmap` `/mural` (#244).
- **App desktop · M3c** — o launcher **sobe `gitnexus serve` (4747) sozinho** (cadeia override→vendored→global→npx, readiness no `/api/health`). **Código** mergeado (#245); *aceite local pendente* (ver fila 🖥).
- **Mega-plano #238 · Fase 1 — medição do bundle** ✅ ([comentário no #238](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/238#issuecomment-4746447576)): boot web ~111 kB gz; pesado é tudo lazy por rota; alvos = gate do Git Nexus + split do CSS global.
- **Scroll-reveal global** (leve, sem dep) em todas as páginas.
- **Infra de continuidade**: `docs/HANDOFF-LOCAL.md` + `CLAUDE.md` (auto-descoberta, aponta pro Manual) + Manual #248 + RFCs #222, #231, #232, #238.

---

## 🛠 Em voo agora
- **M3d · fatia REST** — `query`/`cypher`/`fluxos`/`clusters` do motor real plugados na ponte IPC + no Console do `/git-nexus` (fallback codemap/teaser na web). **PR #247 (draft)**, branch `claude/git-nexus-m3d-tools`. Verificado no remoto; **falta o aceite local** (motor no ar + repo analisado → comandos devolvem dados reais). Detalhes em `HANDOFF-LOCAL.md`.

---

## 🟢 Fila REMOTA (web — qualquer conversa faz, verificável na nuvem)
Ordem de prioridade (pegue de cima pra baixo):

- [x] ~~**Redesign #195 · Onda 2 — Geo/Tático**~~ — feito (#242): `/radar`, `/mapa`, `/geopulse`, `/triangulacao`, `/find`, `/visao`.
- [x] ~~**Redesign #195 · Onda 3 — Campo & Tático**~~ — feito (#243): `/elites`, `/dossie`, `/arsenal`, `/enciclopedia-militar`.
- [x] ~~**Redesign #195 · páginas leves restantes**~~ — feito (#244): `/projetos`, `/roadmap`, `/mural`.
- [x] ~~**Mega-plano #238 · Fase 1 — medir**~~ — feito ([medição no #238](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/238#issuecomment-4746447576)): boot ~111 kB gz, chunks pesados lazos (git-nexus 48.8 / arsenal 50.8 / dossie 43.3 kB gz), CSS num arquivo só. Metas definidas.
- [x] ~~**Mega-plano #238 · Fase 2 — piloto do gate**~~ — feito/verificado (#278): `/git-nexus` passa pelo gate leve (web → teaser "abre no app" + `/baixar`; app → experiência completa). O chunk pesado (git-nexus **438 KB / ~49 kB gz**) **não** é referenciado pelo entry do boot; `syncRepoMemories` do boot gateado por `isNative()`.
- [x] ~~**Mega-plano #238 · CSS split**~~ — feito (#278): folhas específicas de página importadas pelo módulo da página (code-split Vite); só fundação/shell/componentes/compartilhadas ficam no `` do boot. **Boot CSS 398→194 KB raw · 55→29.5 kB gz (−46%)**. Folhas multi-página (militar/cripto/calc/fase17-19…) seguem globais.
- [x] ~~**JARVIS ↔ Nexus #231 · nível de função**~~ — feito (#279): 5 skills sobre o grafo de chamadas (`codemap-symbols.json`, 1137 funções / 2457 chamadas): `nexus_fn_impact/context/path/deps/hot`. App-only (fora do boot da web).

> ✅ **Fila remota zerada (21/06)** — os itens web da fila foram entregues. O que resta exige **máquina local + skills** → fila 🖥 abaixo / `docs/HANDOFF-LOCAL.md`. Ideias remotas avulsas (não bloqueantes): polish de design nas páginas-ferramenta restantes (tokens/header padrão do #195) e split de CSS das folhas multi-página por consumidor.

## 🖥 Fila LOCAL (precisa da máquina + skills) → ver `docs/HANDOFF-LOCAL.md`
- [ ] **M3c — aceite do motor real (#222)**: com `gitnexus analyze` num repo, abrir o launcher → `/git-nexus` fica **verde** + grafo real. (Código já mergeado em #245.)
- [ ] **M3d — aceite REST + fatia MCP (#231/#222)**: validar local os comandos do PR #247 (`query`/`cypher`/`fluxos`/`clusters` devolvendo dados reais) → tirar o draft/mergear; depois plugar as tools profundas via **MCP-over-HTTP** (`POST /api/mcp`).
- [ ] **M4 — runtimes próprios (#232)**: provisionar Node 22 + Python 3.11 na pasta do app (preflight, zero-setup).
- [ ] **Design 3D pesado** (skill `claudedesignskills`): Three.js no **app**; GSAP ScrollTrigger refina o `scroll-reveal` no web; micro-interações (Anime.js/Lottie) leves.
- [ ] **gitnexus no Claude Code local**: `npx gitnexus analyze` + `setup` (16 tools MCP de grafo pro próprio agente).
- [ ] **Publicar releases**: bump em `desktop/package.json` → Actions → Desktop Release → Run workflow.

---

## 📌 Sub-issues
📒 **#248** Manual (regras/como trabalhar) · **#238** mega-plano (app/site) · **#222** app desktop (M0→M6) · **#231** JARVIS↔Nexus · **#232** M4 runtimes · **#195** redesign 3D. Handoff local: `docs/HANDOFF-LOCAL.md`.

https://claude.ai/code/session_01S1j1HX2j1zEJoPxTuek3yM
