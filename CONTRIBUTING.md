# 🛠️ Guia de Contribuição — Projeto Baluarte (Mark XIII)

Bem-vindo! Este guia explica como o site é organizado para você conseguir
**continuar construindo** com segurança. (Issue #186 — documentação para o futuro.)

## Stack
- **JavaScript puro (ES2022)** — sem framework. UI montada com um hyperscript
  `h()` (ver `src/utils/helpers.js`).
- **Vite 5** para dev/build. **Sem TypeScript, sem testes automatizados.**
- **Roteador SPA por hash** (`src/core/router.js`).
- **Funções serverless em Python** (stdlib) na pasta `api/` (Vercel).

## Rodar
```bash
npm install
npm run dev      # servidor de desenvolvimento (Vite)
npm run build    # gera dist/ (valide SEMPRE antes de commitar)
```

## Mapa de pastas
| Pasta | O que tem |
|-------|-----------|
| `src/core/` | núcleo: `router`, `events` (bus), `state` (appState), `storage` (localStorage `baluarte:`) |
| `src/layout/` | `shell` (monta tudo), `sidebar` (menu/NAV_GROUPS), `header`, `overlay` (Sobrepor) |
| `src/pages/` | uma função por página, ex.: `export function jarvisPage() { … }` |
| `src/utils/` | helpers, ícones, motor de IA (`jarvis-*`), chart-engine, etc. |
| `src/data/` | dados (JSON/JS): `arsenal-expandido.json`, `codemap.json`, `cerebro.json`, … |
| `src/styles/` | um CSS por página + tokens em `variables.css` |
| `api/` | funções serverless (chat=Gemini, hermes, memory, health) |
| `scripts/` | geradores (`gen-codemap.mjs`, `gen-arsenal.mjs`) |
| `docs/` | documentação de features |
| `historico/CHANGELOG.md` | histórico do que entra no `main` |

## Convenções de código
- **Cabeçalho JSDoc** no topo de cada arquivo dizendo o que ele faz.
- Use os helpers: `h(tag, props, ...children)`, `cx()`, `empty()`, `mount()`,
  `debounce()` de `src/utils/helpers.js`. Não use innerHTML com dados externos.
- Persistência: `storage.get(k, fallback)` / `storage.set(k, v)` (namespace `baluarte:`).
- Eventos globais: `bus.emit('x')` / `bus.on('x', fn)` (`src/core/events.js`).
- Ícones de linha em `src/utils/icons.js` (`iconByPath` mapeia rota → ícone).

## Como adicionar uma página nova (5 pontos)
1. `src/pages/minha.js` — `export function minhaPage() { return h('div', …); }`
2. `src/main.js` — `router.register('/minha', lazy(() => import('./pages/minha.js'), 'minhaPage'));`
3. `src/layout/sidebar.js` — um item em algum `NAV_GROUPS`.
4. `src/layout/shell.js` — título no `pageTitleForRoute`.
5. `index.html` — `<link>` para `src/styles/minha.css` (se tiver CSS).
6. `src/utils/icons.js` — entrada em `iconByPath` (opcional).

## Sistema de IA (JARVIS)
- **Modos** (`src/pages/jarvis.js` + `src/utils/jarvis-engine.js`): local, navegador
  (WebLLM, inclui **Hermes**), claude, ollama, **servidor** (Gemini via `/api/chat`),
  **hermes** (`/api/hermes` → OpenRouter), **openclaw** (self-hosted), agente.
- **Conselho** (`src/utils/jarvis-council.js`): várias IAs respondem juntas; o
  **Hermes** sintetiza o consenso (Gemini só de reserva).
- **Memória** (`src/utils/jarvis-brain.js`): durável (localStorage) + **versionada
  no repo** (`src/utils/jarvis-repo-memory.js` + `api/memory.py`, branch `jarvis-memory`).
  Liga ao Segundo Cérebro (`/cerebro`) e ao Raio-X (`/codigo`).
- **Segurança do agente** (`src/utils/jarvis-guard.js`): veta ferramentas perigosas.

## Variáveis de ambiente (Vercel)
- `GEMINI_API_KEY` — modo Servidor (Gemini). Ver `docs/JARVIS-GEMINI.md`.
- `OPENROUTER_API_KEY` — modo/membro Hermes servidor. Ver `docs/HERMES-VERCEL.md`.
- `GITHUB_TOKEN` — memória versionada no repo. Ver `docs/MEMORIA-REPO.md`.

## Geradores de dados
- `node scripts/gen-codemap.mjs` → `src/data/codemap.json` (grafo do código).
- `node scripts/gen-arsenal.mjs` → `src/data/arsenal-expandido.json` (armas).
- Câmbio e Crônicas são atualizados por **GitHub Actions** a cada 12h.

## Fluxo de git (importante)
Antes de cada merge no `main`: **cria uma branch de backup** (`backup/AAAA-MM-DD-...`),
faz o **fast-forward no `main`** e **registra em `historico/CHANGELOG.md`**.
Desenvolva sempre numa branch, valide com `npm run build`, e só então consolide.

> Dica: o **Raio-X do Código** (`/codigo`) mostra o grafo dos imports e tem um
> modo **Git Nexus ao vivo** que lê o repo inteiro — ótimo para se orientar.
