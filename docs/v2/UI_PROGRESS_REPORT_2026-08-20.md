# Relatório Consolidado — PHASE UI e Pilotos de Alinhamento

**Audited/published main:** `246856068e68960f6e1a428ad8ad719bf04a363e`

**Status:** `IMPLEMENTED — MAIN GREEN — EDITOR CANDIDATE ONLY`

**Data:** 20 de agosto de 2026

**Branch:** `main`

## Resumo executivo

A construção avançou da projeção passiva de navegação para uma cadeia de contratos que observa o Registry, mede divergências com a navegação V1, combina a matriz com health/deep link/fallback e produz uma candidatura individual para o editor. O trabalho foi publicado diretamente no `main`, sem PR e sem force push.

O resultado mais importante é uma separação operacional clara: **candidatura de promoção não é promoção visual, estabilidade não é health e health não é autorização**. O editor agora tem metadados de domínio alinhados com o catálogo V1 e é o único candidato auditável no harness V2, mas o shell público continua usando `renderSidebar()` da V1.

## Linha do tempo publicada

| Marco | Commit | Resultado |
|---|---|---|
| UI-02 — Registry availability contract | `3a0becee9355613ba7c9dc253f746e525833ce44` | Projeção Registry, maturidade separada de disponibilidade, 6/6 testes |
| UI-03 — Registry observation | `aa5af2bda614d3fb1ec941f991ef256f068e2b5c` | Observador read-only ligado ao Boot do harness, 8/8 testes, 22/22 V2 |
| UI-04 — Catalog reconciliation | `5e9dfddf85a926acf28e403b5782dbce8cc61295` | Matriz `aligned`/`metadata-mismatch`/`registry-only`/`legacy-only` |
| Matriz UI-04 publicada | `48f28baff08ac9794fd5b8fac62351c8fc6b4203` | SHA do UI-04 registrado na documentação |
| Piloto por módulo | `9b31d0944de51b7fc53806902566ab61b976346f` | Decisão auditável com health, deep link e fallback, 23/23 V2 |
| Editor single-surface pilot | `246856068e68960f6e1a428ad8ad719bf04a363e` | Domínio do editor alinhado; um candidato, sem promoção pública |

Cada marco teve backup branch antes da publicação. Os backups são `backup/2026-08-20-ui-02`, `backup/2026-08-20-ui-03`, `backup/2026-08-20-ui-04`, `backup/2026-08-20-module-alignment-pilot` e `backup/2026-08-20-editor-single-surface-pilot`.

## Implementação

`src/layout/registry-observer.ts` projeta o Registry e compara paths, labels, ícones e domínios com `NAV_GROUPS`, sem escrever no DOM. `src/layout/catalog-reconciliation.ts` classifica a união dos catálogos e bloqueia promoção automática de divergências. `src/layout/module-alignment.ts` exige health de fonte válida, deep link verificado e fallback V1 preservado antes de produzir `promotion-candidate`.

O `v2/harness/main.js` expõe as superfícies de observação apenas no banco de prova V2. `scripts/v2-integracao.mjs` valida que o Boot V2 continua dirigindo o router real V1 e agora também confirma que somente `/editor` é candidato após o alinhamento de `nav.section: 'Código & Dev'` no manifesto do módulo.

## Gates locais do marco final

| Gate | Resultado |
|---|---:|
| `git diff --check` | verde |
| `npm run verificar-nexus` | verde; 99 rotas, 0 lacunas, 21/21 domínios |
| `npm run tipos:ts` | verde |
| `npm run tipos:v2` | verde |
| `npx tsx --test test/ui-navigation.test.js` | 12/12 |
| `npm test` | verde |
| `npm run build` | verde; apenas warnings conhecidos de chunks grandes |
| `npm run v2:integracao` | 23/23 |
| `npm run smoke` | 99/99 |
| `npm run caminho-critico` | 15/15 |

O build continua emitindo warnings conhecidos para `three.js` e chunks pesados de Arma 3; eles não foram mascarados nem tratados como falha neste marco.

## Gates remotos do commit final

Todos os workflows associados a `246856068e68960f6e1a428ad8ad719bf04a363e` terminaram com `success`:

| Workflow | Resultado |
|---|---:|
| CI | success |
| Core CI | success |
| V2 Core | success |
| V2 Runtime | success |
| V2 Validation | success |
| Arma 3 Data CI | success |
| Vigia das rotas | success |
| CodeQL | success |

O CodeQL registrou apenas avisos de manutenção: actions baseadas em Node 20 sendo executadas sob Node 24 e futura depreciação do CodeQL Action v3 em dezembro de 2026. Nenhum alerta de segurança bloqueante apareceu.

## Limitação local conhecida

`npm run v2:runtime` local continua retornando `101` porque o Cargo local é `1.75.0` e não interpreta a metadata `edition2024` de `getrandom 0.4.3`. Isso não foi corrigido por alteração artificial de dependências, não foi mascarado e não representa o resultado do workflow remoto V2 Runtime, que passou.

## O que não foi alterado

O trabalho não alterou `src/main.js`, `src/layout/shell.ts`, `src/layout/sidebar.ts`, as 99 rotas públicas, Auth, RLS, Supabase, Billing, Service Worker, JARVIS, OpenClaw, PokeDesk ou o fluxo de release `1.2.5`. Nenhuma decisão de admin/dev/owner foi tomada no cliente. Nenhuma rota foi escondida e nenhum botão público foi desabilitado neste marco.

## Estado do editor

O editor é um **candidato auditável**, não um módulo promovido. Seu path, label, ícone e domínio agora coincidem com o item V1. No harness, o health é `healthy` com fonte `runtime-registry`, o deep link é `verified` e o fallback é `v1-preserved`. Ainda assim, a ação para usuário normal permanece `preserve-current-surface`.

Antes de uma promoção visual, faltam observabilidade server-side, claims/RLS aplicáveis, tratamento de deep link no ambiente de produção, instrumentação de rollback e aprovação explícita do contrato de disponibilidade. O próximo passo seguro é validar essa superfície operacional sem trocar a sidebar.

## Documentos principais

| Documento | Função |
|---|---|
| `UI_00_INVENTORY_2026-08-20.md` | Auditoria do shell e layout atual |
| `UI_01_NAVIGATION_CONTRACT_2026-08-20.md` | Projeção legada passiva |
| `UI_02_AVAILABILITY_PILOT_2026-08-20.md` | Registry e separação maturidade/health |
| `UI_03_REGISTRY_OBSERVATION_2026-08-20.md` | Observação read-only no Boot |
| `UI_04_CATALOG_RECONCILIATION_2026-08-20.md` | Matriz de divergências e ações |
| `MODULE_ALIGNMENT_PILOT_2026-08-20.md` | Health/deep link/fallback por módulo |
| `SINGLE_SURFACE_EDITOR_PILOT_2026-08-20.md` | Candidato individual do editor |
| `MASTER_EXECUTION_MATRIX.md` | Estado mestre e próximos gates |

## Próxima ordem recomendada

A sequência correta é validar observabilidade server-side e rollback do editor; somente depois avaliar uma promoção visual controlada atrás de flag de desenvolvimento. Em seguida, repetir o processo para outra superfície com contrato claro. Não é recomendável trocar a sidebar inteira, ocultar rotas para usuários normais ou iniciar Auth/RLS/Billing remoto como consequência direta deste piloto.

## Referências

[1]: ./PHASE_UI_DESIGN_SYSTEM.md "PHASE UI — Design System e Information Architecture"
[2]: ./PHASE_STATUS_MATRIX.md "Matriz de fases e estado atual"
[3]: ./MASTER_EXECUTION_MATRIX.md "Matriz mestre de execução"
[4]: ./SINGLE_SURFACE_EDITOR_PILOT_2026-08-20.md "Piloto individual do editor"
[5]: ../../scripts/v2-integracao.mjs "Gate browser da integração V2"
