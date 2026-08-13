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

👉 **[`docs/PLANO-MESTRE.md`](docs/PLANO-MESTRE.md)** — handoff entre conversas:
onde paramos (Omega Prism, vendors, #299/#300) + os planos das frentes grandes
(organizar o repo, otimizar site/app, multi-repo hub, design/IA com nano-banana).

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
- **Migração Nexus** (#405/#406): `docs/NEXUS-INVENTARIO.md` (estado real + gate da 1.0.0) · `docs/NEXUS-CONTRATO.md` (contrato v1.0.0) · `docs/NEXUS-DECISOES.md` (decisões fechadas — não re-litigar) · `docs/nexus/dominios.json` (mapa dos **21** domínios + externos, cobrado por `npm run verificar-nexus`). Os repositórios `baluarte-*` existem mas estão **vazios** — enquanto um domínio não estiver `estavel`, **a versão que vale é a deste repositório**.
- Issues guarda-chuva (**não fechar**): **#248** (manual/regras) · **#240** (roadmap/fila) · **#238** (app completo/site leve) · **#222** (app desktop) · **#231** (JARVIS↔Git Nexus) · **#195** (redesign) · **#406** (Nexus/migração)

## Regras do projeto

- **Por feature**: branch própria → commit → PR (draft) → merge quando o **CI ficar verde** → atualizar o `CHANGELOG.md`. Backup branch antes do merge.
- **JS puro (ES2022)**, sem TypeScript e sem framework. Verificar mudanças de UI no navegador (há a skill `run-projeto-baluarte`).
- **Mega-plano (#238)**: web = **leve** (conteúdo + ferramentas leves); app = **completo** (IA, Git Nexus, motor real). Gate o pesado por `window.baluarte.native`.
