# #259 — 📦 Próxima release do app (Baluarte Launcher) com o novo design + Núcleo de IA

> **Status:** open · **Criada:** 2026-06-20 · **Atualizada:** 2026-06-22 · **Comentários:** 1
> **Issue viva:** https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/259
>
> _Snapshot do corpo da issue (2026-06-27), parte do "issues → docs". Para comentários e estado mais recente, abra a issue no link acima._

---

## Objetivo
Cortar a **próxima release do Baluarte Launcher** já com as **novas estéticas do redesign** (#195) e o **Núcleo de IA** (#231) — para quem usa o app ver a nova cara da plataforma.

## Contexto importante (o que já está pronto)
O launcher carrega a **produção** (`https://projeto-baluarte.vercel.app/` — `REMOTE_URL` em `desktop/src/main.js`), com **fallback offline embutido** (`embeddedIndex()` via `loadFile`).

➡️ Então, **online o app já mostra o novo design** assim que a produção atualiza (o redesign e o Núcleo de IA já estão no `main` e no deploy). O que falta pra uma **release formal** é empacotamento + a parte offline:

| Já no `main`/produção (online no app já aparece) | O que a release precisa |
|---|---|
| Redesign de todas as páginas (#251–#255) | Bump de versão + release notes |
| Núcleo de IA cockpit + nav unificada (#256, #257) | Refresh do **fallback offline embutido** |
| Gate web/app (#251) | Cortar instaladores (Win/Mac/Linux) + smoke-test |

## Plano (🖥 LOCAL — precisa da máquina + Actions)
- [ ] **Confirmar a produção** (Vercel) com o redesign + Núcleo de IA no ar.
- [ ] **Refresh do fallback offline**: garantir que o build embutido que o `embeddedIndex()` serve esteja **atualizado** com o novo design (senão, offline mostra a versão antiga). Verificar como o `desktop/` empacota esse build (script de copy/`npm run build` → pasta embutida).
- [ ] **Bump** `desktop/package.json`: `0.1.1` → **`0.2.0`** (release "novo visual").
- [ ] **Release notes**: redesign cinematográfico (conteúdo, mídia, catálogo, referência, economia, hubs, devtools) + **Núcleo de IA** (cockpit com 12 abas, navegação unificada, IA app-only).
- [ ] **Publicar**: Actions → **Desktop Release** (`.github/workflows/desktop-release.yml`) → *Run workflow* → instaladores Win/Mac/Linux (tag `desktop-v0.2.0`).
- [ ] **Aceite no app empacotado**:
  - [ ] Abre com o **novo design** (online e, idealmente, offline pelo fallback).
  - [ ] `/git-nexus` abre o **cockpit do Núcleo de IA** (não o teaser) — `window.baluarte.native` ativo.
  - [ ] As abas (JARVIS, memória, cérebro, …) carregam dentro do cockpit; rotas legadas (`#/jarvis`) caem na aba certa.
  - [ ] Auto-update funcionando (a versão anterior atualiza pra 0.2.0).
- [ ] **Atualizar** `historico/CHANGELOG.md` e a `/baixar` (lê a release em runtime — confirmar que aponta pra 0.2.0).

## Notas
- Publicar release é tarefa **local** (precisa da máquina + workflow), conforme `docs/HANDOFF-LOCAL.md` e a fila 🖥 do #240. Esta issue detalha essa entrada.
- Se o app **só** usa o REMOTE_URL (sem bundle offline real), a parte de "refresh offline" cai e a release vira só bump + notas + instaladores.

## Refs
#222 (app desktop / releases) · #195 (redesign) · #231 (Núcleo de IA) · #238 (app completo / site leve) · #240 (roadmap, fila local) · #258 (encolher sidebar).

🤖 Gerado com [Claude Code](https://claude.com/claude-code)
