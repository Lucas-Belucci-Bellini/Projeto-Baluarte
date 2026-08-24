# UI-04 — Reconciliação Controlada do Catálogo

**Status:** `IMPLEMENTED — NO GLOBAL SIDEBAR PROMOTION`

**Data:** 20 de agosto de 2026

**Base publicada:** `aa5af2bda614d3fb1ec941f991ef256f068e2b5c` (UI-03)

**Objetivo:** transformar as divergências observadas entre `RegistryNavigationEntry[]` e `NAV_GROUPS` em uma matriz de decisão explícita, sem apagar o fallback V1, registrar novas rotas ou decidir disponibilidade no cliente.

## Decisão

O novo módulo `src/layout/catalog-reconciliation.ts` consome a observação do UI-03 e classifica cada path na união dos dois catálogos. A reconciliação é uma ferramenta de governança e preparação de migração; não é uma segunda fonte de rotas e não autoriza a troca global da sidebar.

Cada linha possui uma disposição e uma ação recomendada. A única situação que vira candidata de promoção é `aligned`, quando path, label, ícone e domínio coincidem. Mesmo nesse caso, `promotionAllowed` não concede acesso e não substitui a validação de health, deep link, Router, Registry e autoridade server-side.

## Matriz de decisão

| Disposição | Significado | Ação | Promoção visual |
|---|---|---|---|
| `aligned` | Registry e V1 representam o mesmo path e metadados | `no-action` | Candidato, ainda sujeito aos gates de UI |
| `metadata-mismatch` | Path compartilhado, mas label, ícone ou domínio divergem | `align-metadata-before-promotion` | Bloqueada |
| `registry-only` | Módulo existe no Registry, mas não no catálogo V1 | `defer-registry-promotion` | Bloqueada; módulo continua superfície V2/harness |
| `legacy-only` | Rota existe no V1, mas ainda não foi publicada pelo Registry | `preserve-v1-fallback` | Bloqueada; V1 continua fonte pública |

> **Regra:** divergência é evidência a ser resolvida; nunca é uma permissão para esconder a rota, reescrever o título ou inferir que o usuário não pode acessar o módulo.

## Implementação

`reconcileNavigationCatalogs()` reutiliza `observeRegistryNavigation()` e retorna:

| Campo | Finalidade |
|---|---|
| `observation` | Preserva o retrato original Registry↔V1, inclusive divergências |
| `rows` | Uma decisão por path, ordenada de forma determinística |
| `summary.total` | Total de paths na união dos catálogos |
| `summary.aligned` | Número de linhas sem divergência de metadados |
| `summary.metadataMismatch` | Paths compartilhados com metadados diferentes |
| `summary.registryOnly` | Entradas presentes apenas no Registry |
| `summary.legacyOnly` | Entradas presentes apenas no V1 |
| `summary.promotionCandidates` | Apenas linhas `aligned`, sem efeito visual automático |

A função é pura em relação à UI: não chama `renderSidebar()`, não escreve no DOM, não registra no router, não lê sessão, não consulta role e não altera `NAV_GROUPS`.

## Evidência de testes

A suíte `test/ui-navigation.test.js` passou com 10/10 testes. Além dos contratos UI-01/UI-02/UI-03, os testes UI-04 comprovam:

1. um catálogo alinhado produz uma linha `aligned`, `no-action` e candidata;
2. um path compartilhado com label/domínio diferente produz `metadata-mismatch` e bloqueia promoção;
3. uma entrada exclusiva do Registry produz `registry-only` e permanece adiada;
4. uma entrada exclusiva do V1 produz `legacy-only` e mantém o fallback V1;
5. nenhuma divergência é removida pelo reconciliador.

## Relação com health, Auth e permissões

UI-04 não ativa Auth, RLS, Billing ou Supabase. A classificação de catálogo não é uma decisão de saúde. Um módulo pode ser `aligned` e ainda estar `degraded`, `maintenance`, `disabled` ou `quarantined` por uma autoridade operacional posterior. Da mesma forma, um módulo `registry-only` não é automaticamente proibido; ele apenas não está pronto para ser promovido à navegação pública unificada.

A regra de acesso para admin, dev e owner permanece server-side. Nenhuma coluna da reconciliação pode ser usada para falsificar uma claim, ampliar uma permissão ou revelar diagnóstico sensível a um usuário normal.

## Gaps que permanecem intencionais

O Registry atual do harness possui módulos V2 que não estão no catálogo legado, enquanto o catálogo V1 possui dezenas de paths ainda não publicados pelo Registry. Também existem diferenças de domínio e de label em paths compartilhados. Esses gaps são agora mensuráveis e nomeados; não foram “corrigidos” automaticamente porque isso exigiria decisão de produto e contrato por módulo.

O próximo slice deverá escolher um pequeno conjunto de módulos com autoridade de manutenção, definir o mapeamento de domínio e label e provar deep link/fallback antes de qualquer promoção visual. A Wiki Arma 3 permanece candidata a esse fluxo, mas não deve ser desabilitada somente por sua estabilidade `beta`.

## Gates do slice

| Gate | Resultado |
|---|---:|
| `npx tsx --test test/ui-navigation.test.js` | 10/10 |
| `npm run tipos:ts` | verde |
| `npm run tipos:v2` | verde |
| `npm run verificar-nexus` | será repetido após a documentação final |
| `npm test` | será repetido antes da publicação |
| `npm run build` | será repetido antes da publicação |
| `npm run v2:integracao` | será repetido antes da publicação |
| `npm run smoke` | será repetido antes da publicação |
| `npm run caminho-critico` | será repetido antes da publicação |

O runtime Rust local mantém a limitação conhecida do Cargo 1.75.0 com metadata `edition2024`; o gate remoto usa toolchain compatível e deve continuar sendo a autoridade de CI para esse componente.

## Rollback

O rollback é o revert do commit de UI-04, preservando UI-03 e a branch de backup correspondente. Como o slice não altera `src/main.js`, não cria rotas, não modifica o shell real e não aplica SQL remoto, o risco de rollback é limitado à superfície de observação e à documentação.

## Próximo marco

O próximo passo seguro é um piloto de alinhamento para um conjunto pequeno de módulos, com matriz por módulo, health real, deep link e fallback. Não é permitido promover o catálogo inteiro, ocultar páginas para usuários normais ou remover wrappers V1 com base apenas nesta reconciliação.

## Referências

[1]: ./UI_03_REGISTRY_OBSERVATION_2026-08-20.md "UI-03 — observação do Registry"
[2]: ./UI_02_AVAILABILITY_PILOT_2026-08-20.md "UI-02 — piloto de disponibilidade"
[3]: ../../src/layout/catalog-reconciliation.ts "Implementação do reconciliador UI-04"
[4]: ../../src/layout/registry-observer.ts "Observador de paridade UI-03"
[5]: ../../src/layout/sidebar.ts "Catálogo de navegação legado"
[6]: ../../v2/core/registry.ts "Contrato de navegação do Registry"
