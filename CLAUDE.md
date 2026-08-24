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

## 🛡️ Fase atual: hardening até a 1.0.0

A prioridade agora **não é funcionalidade nova**. A definição em vigor:
`1.0.0 = tudo que está marcado como estável é previsível, testado, recuperável e
seguro` — e a 1.0.0 é um **ponto de congelamento**, com a V2 só depois, alvo de
meados de 2027.

👉 **[`docs/HARDENING-1.0.0.md`](docs/HARDENING-1.0.0.md)** — a fila executável da
1.0.0: pegue o próximo item não-marcado. · 👉 **[`docs/architecture/`](docs/architecture/)**
— overview, `v2-vision.md` (**bússola, não obra**: diz o que *não* fazer agora) e
os ADRs (decisões fechadas, não re-litigar).

### 🧭 Antes de escrever qualquer linha da V2: o stack já foi decidido, e medido

👉 **[`docs/v2/V2_STACK_REVIEW.md`](docs/v2/V2_STACK_REVIEW.md)** + **[ADR-004](docs/architecture/decisions/ADR-004-stack-poliglota-por-responsabilidade.md)**

A V2 **não é JavaScript por padrão**. O princípio em vigor, do operador: *"A V1 é
uma referência de comportamento e dados. Ela **não** é uma referência obrigatória
de arquitetura ou linguagem."* Cada camada tem a linguagem escolhida pela função
que exerce, com benchmark em [`v2/bench/`](v2/bench/) — dá para rodar de novo:

| camada | linguagem | |
| --- | --- | --- |
| interface web e 3D | **TypeScript** | hoje JSDoc+`checkJs` (etapa 1) |
| Core de **Orquestração** (navegador) | **TypeScript** | WASM mediu **4,7× mais lento** no despacho real |
| Core de **Runtime** (processo local) | **Rust** | ⚠️ **ainda não existe** — é o próximo grande passo |
| IA, coleta, automação | **Python** | ecossistema é a razão inteira |
| parsers binários (`.p3d`/`.pbo`) | **Rust** | Python é 140× mais lento em laço de byte |
| dados e fila entre processos | **PostgreSQL** | `SKIP LOCKED`, sem broker |
| app desktop | **Tauri (Rust)** | migra do Electron, **pós-1.0.0** |

Go, C e C++ ficam de fora, com motivo escrito no ADR. **A fronteira entre
linguagens vai onde o volume por travessia é alto e a frequência é baixa** — onde
a frequência é alta e o volume é baixo, a fronteira é o gargalo.

> A lição mais cara da Fase 0: o escalonador media **1073 µs** por tarefa e virou
> **4,0 µs** — 265× mais rápido, **em JavaScript**, porque o defeito era O(n²).
> Trocar de linguagem para consertar algoritmo é pagar caro por um conserto que
> não aconteceu. **Meça antes de culpar a linguagem.**

### 📐 Os três planos da V2 (**não fechar** nenhum dos três · são os FIXADOS)

O operador **fixou estes três no topo do repositório** justamente para serem o
que se vê primeiro. Se você está numa sessão nova, é por aqui que se começa.

- **#423 — Master Construction Plan.** ⭐ O plano-mestre da reconstrução, agora
  transcrito para **[`docs/v2/`](docs/v2/)** — comece por lá, não pela issue:
  [`V2_MASTER_PLAN.md`](docs/v2/V2_MASTER_PLAN.md) (as 26 seções),
  [`V2_RULES.md`](docs/v2/V2_RULES.md) (as 40 regras) e
  [`V2_DECISION_LOG.md`](docs/v2/V2_DECISION_LOG.md) (**as 9 decisões que não
  estão no corpo do plano** — nasceram nos comentários e se perderiam).
  Em resumo: ordem de construção (arquitetura → Core → Module System → contratos
  → migração → só então módulos grandes), **"preparar ≠ implementar"**, regra
  contra feature creep, branches (`main` · `release/v1.x` · `v2-development`) e o
  roadmap V1→V10 com o Baluarte OS em 2030.
- **#420 — plataforma e arquitetura.** É onde a fase de hardening foi definida
  *e* onde a V2 foi desenhada: arquitetura modular, sistema de plugins, JARVIS
  como cérebro, Project Registry, calendário até meados de 2027. A decisão de
  **fechar a 1.0.0 antes** mora aqui (ADR-001).
- **#422 — produtos e projetos da V2.** O backlog: wikis (Arma 3 com motor
  refeito, Project Zomboid), parser framework Lua/SQF, Baluarte Social, IDE web,
  3D engine, Knowledge Engine, MCP.

Regra prática: **#423 = a ordem · #420 = a forma · #422 = a lista.** Ideia de
produto novo para a V2 vai para o #422; decisão arquitetural vai para o #420 e
vira ADR; *como e em que ordem construir* está no #423.

> ⚠️ **Issue antiga é matéria-prima, não requisito** (#423 §3). As 53 abertas
> foram trianguladas em [`docs/TRIAGEM-1.0.0.md`](docs/TRIAGEM-1.0.0.md): nenhuma
> descreve defeito no que está marcado estável. Não as transforme em backlog da
> V2 por existirem.

## ⚠️ Sessão LOCAL (com skills)? Leia primeiro

👉 **[`docs/HANDOFF-LOCAL.md`](docs/HANDOFF-LOCAL.md)** — tarefas que dependem das
skills locais (`freshtechbro/claudedesignskills` p/ design/3D, `gitnexus` p/ o
motor real) e da máquina (app desktop M3c/M4). São preparadas pelas sessões
**remotas** (que não têm as skills) pra uma sessão **local** executar.

## ⚠️ Sessão REMOTA? Leia primeiro

👉 **[`docs/HANDOFF-REMOTO.md`](docs/HANDOFF-REMOTO.md)** — o caminho contrário:
o que **só o remoto** consegue verificar, porque a máquina do operador é Windows
e quatro verificações não rodam lá (`v2:runtime` sem `cargo`, os verificadores
do Arma 3 em cp1252, `npm test`, e o `Supabase Preview`). Traz também o estado
do CI, a fila com o que trava cada item, e as armadilhas já pagas — a família
"Windows", espera por relógio, gerador que não enxerga TypeScript, e o fato de
que **push de bot não dispara workflow** (por isso o `main` fica vermelho sem
ninguém ver).

## Mapa rápido

- `src/pages/` — uma página por rota · `src/styles/` — CSS (1 por página + tokens em `variables.css`)
- `src/core/` — router (hash), eventos, estado, storage, **permissions** (deny-by-default; `JARVIS → Permission → Tool`), **flags** (estável/beta/experimental + gate web/app), **politica** · `src/layout/` — shell, sidebar, header
  - **`politica.js` é o lugar único onde o Baluarte declara o que existe**: permissões, esquemas de storage e a tabela de estabilidade. Capacidade nova (tool, chave, módulo) se declara **ali**, não espalhada. Rodada no topo do `boot()`.
  - `events.js` aceita curinga: `bus.on('*')` / `bus.on('arsenal:*')`, com o nome do evento em `meta.event`.
  - `storage.js` tem esquema por chave (versão + migração + classe). Mudou o formato de uma chave? **suba a `versao` e escreva o `migrar`** — o dado do operador não migra sozinho. Declarar esquema numa chave que **já tem dado** exige `migrar` (nem que seja identidade), senão o dado antigo do operador cai no fallback em silêncio.
  - Tool nova do JARVIS: mapeie a permissão em `src/utils/jarvis-permissoes.js`. Sem mapa ela nasce **negada** (padrão fechado) — é de propósito.
  - **`/diagnostico`** mostra tudo isso na tela (permissões, flags, esquemas, sondas do ambiente).
- `src/utils/` — helpers, jarvis-engine/tools, git-nexus-engine, scroll-reveal, **effects** (efeitos portados do react-bits: `.fx-*` + `attachSpotlight/Tilt`, `decryptTitles`), **hero-webgl/hero-rays** (fundos WebGL sem dep), **wikipedia** (Centro Militar)…
- **Camada de efeitos** (#246): `src/utils/effects.js` + `src/styles/effects.css` (no boot) — porta vanilla do **react-bits** (NÃO usar React; ver `docs/REACT-BITS.md`).
- **Centro Militar** (`/militar`, `src/pages/militar.js`): hub que **consolidou as 13 frentes militares + Arsenal** (sidebar = 1 entrada) com extrato vivo da Wikipédia (`src/utils/wikipedia.js`). As páginas individuais seguem registradas. Plano: `docs/CENTRO-MILITAR.md`.
- `desktop/` — app Electron (main, preload, nexus, ipc) + workflow de release · **Node 24** (engines do site e do app)
- `historico/CHANGELOG.md` — registro do que entra no `main`
- `docs/DESIGN-SYSTEM.md` — **contrato visual** (tokens/componentes/diretrizes do redesign #246/#195); todo design novo sai daqui · `docs/REACT-BITS.md` (efeitos) · `docs/CENTRO-MILITAR.md` (hub militar)
- **Migração Nexus** (#405/#406): `docs/NEXUS-INVENTARIO.md` (estado real + gate da 1.0.0) · `docs/NEXUS-CONTRATO.md` (contrato v1.0.0) · `docs/NEXUS-DECISOES.md` (decisões fechadas — não re-litigar) · `docs/nexus/dominios.json` (mapa dos **21** domínios + externos, cobrado por `npm run verificar-nexus`). Os repositórios `baluarte-*` existem mas estão **vazios** — enquanto um domínio não estiver `estavel`, **a versão que vale é a deste repositório**.
- Issues guarda-chuva (**não fechar**): 📌 **#423** (Master Construction Plan da V2 — *fixada*) · 📌 **#420** (hardening 1.0.0 + arquitetura da V2 — *fixada, fase atual*) · 📌 **#422** (produtos/backlog da V2 — *fixada*) · **#248** (manual/regras) · **#240** (roadmap/fila) · **#238** (app completo/site leve) · **#222** (app desktop) · **#231** (JARVIS↔Git Nexus) · **#195** (redesign) · **#406** (Nexus/migração)

## Regras do projeto

- **Por feature**: branch própria → commit → PR (draft) → merge quando o **CI ficar verde** → atualizar o `CHANGELOG.md`. Backup branch antes do merge.
- **JS puro (ES2022)**, sem TypeScript e sem framework. Verificar mudanças de UI no navegador (há a skill `run-projeto-baluarte`).
- **Mega-plano (#238)**: web = **leve** (conteúdo + ferramentas leves); app = **completo** (IA, Git Nexus, motor real). Gate o pesado por `window.baluarte.native`.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **Projeto-Baluarte** (19619 symbols, 51448 relationships, 818 execution flows).

> Index stale? Run `node .gitnexus/run.cjs analyze --index-only` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? Bootstrap with `npx`, `bunx`, or `pnpm dlx` — e.g. `bunx gitnexus@latest analyze` (npm 11 npx crash; #1939).

## Always Do

- **MUST run impact analysis before editing.** Use `impact({target: "symbolName", direction: "upstream"})` (MCP) or `node .gitnexus/run.cjs impact "symbolName" --direction upstream --repo .` (CLI fallback); report callers, processes, and risk. Never substitute grep for graph analysis.
- **MUST analyze graph changes before committing.** Use `detect_changes({scope: "all"})` (MCP) or `node .gitnexus/run.cjs detect-changes --scope all --repo .` (CLI fallback). `partial: true` or `truncated: true` is not a clean check — a zero means unseen, not unaffected; re-run it. For regression review: `detect_changes({scope: "compare", base_ref: "main"})` or `node .gitnexus/run.cjs detect-changes --scope compare --base-ref "main" --repo .`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- **MUST treat `risk: UNKNOWN` as unresolved, not as low.** An empty caller set is not evidence the symbol is unused — it can also mean the callers are not resolvable by the index (plain-object property access, dynamic dispatch, cross-language calls). `impact` pairs `UNKNOWN` with a `riskNote` saying so. Confirm with a text search before treating the symbol as safe to change or delete; do not proceed on the strength of a zero.
- When exploring unfamiliar code, use `query({search_query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

## Never Do

- NEVER edit a function, class, or method before MCP/CLI impact analysis.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis, and never read `UNKNOWN` as an all-clear — it means the walk could not answer, which is the one verdict that requires confirming by other means.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit before MCP/CLI graph change analysis.

## Resources

| Resource | Use for |
| --- | --- |
| `gitnexus://repo/Projeto-Baluarte/context` | Codebase overview, check index freshness |
| `gitnexus://repo/Projeto-Baluarte/clusters` | All functional areas |
| `gitnexus://repo/Projeto-Baluarte/processes` | All execution flows |
| `gitnexus://repo/Projeto-Baluarte/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
| --- | --- |
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
