# Projeto Baluarte — contexto pro agente

Plataforma narrativa/militar/ferramentas em **JavaScript puro + Vite 5** — sem
TypeScript, sem framework (Vite só empacota). Deploy estático no Vercel. Tem
também um **app desktop** em Electron (`desktop/`, "Baluarte Launcher").

## 🧭 Continuidade entre sessões — comece por aqui

Cada conversa começa **sem o histórico** das anteriores e (se for remota) **sem as
skills locais** do operador — o que precisa sobreviver mora no repo e nas issues.
Antes de mexer, leia:

👉 **issue #248** — Manual de operação: como eu trabalho, as regras e a divisão
remoto/local. · 👉 **issue #240** — Roadmap mestre: a fila de continuação (pegue o
próximo item não-marcado). **Não feche** essas issues (são referência viva).

## ⚠️ Sessão LOCAL (com skills)? Leia primeiro

👉 **[`docs/HANDOFF-LOCAL.md`](docs/HANDOFF-LOCAL.md)** — tarefas que dependem das
skills locais (`freshtechbro/claudedesignskills` p/ design/3D, `gitnexus` p/ o
motor real) e da máquina (app desktop M3c/M4). São preparadas pelas sessões
**remotas** (que não têm as skills) pra uma sessão **local** executar.

## Mapa rápido

- `src/pages/` — uma página por rota · `src/styles/` — CSS (1 por página + tokens em `variables.css`)
- `src/core/` — router (hash), eventos, estado, storage · `src/layout/` — shell, sidebar, header
- `src/utils/` — helpers, jarvis-engine/tools, git-nexus-engine, scroll-reveal, **effects** (efeitos portados do react-bits: `.fx-*` + `attachSpotlight/Tilt`, `decryptTitles`), **hero-webgl/hero-rays** (fundos WebGL sem dep), **wikipedia** (Centro Militar)…
- **Camada de efeitos** (#246): `src/utils/effects.js` + `src/styles/effects.css` (no boot) — porta vanilla do **react-bits** (NÃO usar React; ver `docs/REACT-BITS.md`).
- **Centro Militar** (`/militar`, `src/pages/militar.js`): hub que **consolidou as 13 frentes militares + Arsenal** (sidebar = 1 entrada) com extrato vivo da Wikipédia (`src/utils/wikipedia.js`). As páginas individuais seguem registradas. Plano: `docs/CENTRO-MILITAR.md`.
- `desktop/` — app Electron (main, preload, nexus, ipc) + workflow de release · **Node 24** (engines do site e do app)
- `historico/CHANGELOG.md` — registro do que entra no `main`
- `docs/DESIGN-SYSTEM.md` — **contrato visual** (tokens/componentes/diretrizes do redesign #246/#195); todo design novo sai daqui · `docs/REACT-BITS.md` (efeitos) · `docs/CENTRO-MILITAR.md` (hub militar)
- Issues guarda-chuva (**não fechar**): **#248** (manual/regras) · **#240** (roadmap/fila) · **#238** (app completo/site leve) · **#222** (app desktop) · **#231** (JARVIS↔Git Nexus) · **#195** (redesign)

## Regras do projeto

- **Por feature**: branch própria → commit → PR (draft) → merge quando o **CI ficar verde** → atualizar o `CHANGELOG.md`. Backup branch antes do merge.
- **JS puro (ES2022)**, sem TypeScript e sem framework. Verificar mudanças de UI no navegador (há a skill `run-projeto-baluarte`).
- **Mega-plano (#238)**: web = **leve** (conteúdo + ferramentas leves); app = **completo** (IA, Git Nexus, motor real). Gate o pesado por `window.baluarte.native`.
