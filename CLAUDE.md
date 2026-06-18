# Projeto Baluarte — contexto pro agente

Plataforma narrativa/militar/ferramentas em **JavaScript puro + Vite 5** — sem
TypeScript, sem framework (Vite só empacota). Deploy estático no Vercel. Tem
também um **app desktop** em Electron (`desktop/`, "Baluarte Launcher").

## 🗺️ Continuar o projeto? Siga a issue #240

👉 **[Roadmap mestre #240](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/240)** — a fila ordenada do que falta (o que já foi feito p/ não refazer; o que vem, separado entre 🟢 **web/remoto** e 🖥 **máquina/local**). Pegue o **próximo item não-marcado** da fila certa e siga o fluxo padrão: branch → PR (draft) → CI verde → merge → atualizar `CHANGELOG` (backup branch antes do merge).

## ⚠️ Sessão LOCAL (com skills)? Leia primeiro

👉 **[`docs/HANDOFF-LOCAL.md`](docs/HANDOFF-LOCAL.md)** — tarefas que dependem das
skills locais (`freshtechbro/claudedesignskills` p/ design/3D, `gitnexus` p/ o
motor real) e da máquina (app desktop M3c/M4). São preparadas pelas sessões
**remotas** (que não têm as skills) pra uma sessão **local** executar.

## Mapa rápido

- `src/pages/` — uma página por rota · `src/styles/` — CSS (1 por página + tokens em `variables.css`)
- `src/core/` — router (hash), eventos, estado, storage · `src/layout/` — shell, sidebar, header
- `src/utils/` — helpers, jarvis-engine/tools, git-nexus-engine, scroll-reveal…
- `desktop/` — app Electron (main, preload, nexus, ipc) + workflow de release
- `historico/CHANGELOG.md` — registro do que entra no `main`
- Issues guarda-chuva: **#238** (app completo/site leve) · **#222** (app desktop) · **#231** (JARVIS↔Git Nexus) · **#195** (redesign)

## Regras do projeto

- **Por feature**: branch própria → commit → PR (draft) → merge quando o **CI ficar verde** → atualizar o `CHANGELOG.md`. Backup branch antes do merge.
- **JS puro (ES2022)**, sem TypeScript e sem framework. Verificar mudanças de UI no navegador (há a skill `run-projeto-baluarte`).
- **Mega-plano (#238)**: web = **leve** (conteúdo + ferramentas leves); app = **completo** (IA, Git Nexus, motor real). Gate o pesado por `window.baluarte.native`.
