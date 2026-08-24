# Piloto de Alinhamento por Módulo — PHASE UI

**Status:** `IMPLEMENTED — OBSERVATION AND BLOCKING ONLY`

**Data:** 20 de agosto de 2026

**Base:** `48f28baff08ac9794fd5b8fac62351c8fc6b4203` publicado no `main`

**Objetivo:** combinar a matriz de reconciliação UI-04 com health do Registry, deep links e fallback V1 para produzir uma decisão auditável por módulo, sem promover a sidebar, ocultar rotas ou decidir autorização no cliente.

## Contrato

`src/layout/module-alignment.ts` expõe `decideModuleAlignment()`. A função recebe uma linha de `CatalogReconciliationRow` e evidências externas ao reconciliador:

| Evidência | Valores aceitos | Regra |
|---|---|---|
| Health mode | `registered`, `healthy`, `degraded`, `quarantined`, `maintenance`, `disabled`, `unregistered` | Deve refletir o Registry/Runtime existente |
| Health status | `unknown`, `healthy`, `failed`, `exhausted`, `unregistered` | Não pode ser inferido de estabilidade |
| Health source | `runtime-registry`, `server-authority`, `unknown` | `unknown` nunca promove |
| Deep link | `verified`, `unverified`, `broken` | Só `verified` permite candidatura |
| Fallback | `v1-preserved`, `registry-observation`, `none` | A promoção exige fallback V1 preservado |

A decisão final contém `outcome`, `allowPublicPromotion`, `reasons`, as evidências recebidas e a ação normal de usuário. Mesmo quando `allowPublicPromotion` é `true`, isso é apenas uma candidatura para um próximo gate; não registra rota, não monta DOM e não libera permissão.

## Regras de decisão

| Condição | Resultado |
|---|---|
| Catálogo alinhado + health saudável de fonte válida + deep link verificado + fallback V1 preservado | `promotion-candidate` |
| Health desconhecido ou inválido | `blocked` |
| Deep link quebrado | `blocked` |
| Módulo legado ainda não publicado pelo Registry | `keep-v1` |
| Módulo Registry-only ou metadados ainda divergentes, mas sem falha crítica | `observe-registry` |
| Qualquer cenário não promotor | `allowPublicPromotion: false` |

> **Princípio de segurança:** a ação para usuários normais continua `preserve-current-surface` em todos os resultados do piloto. O piloto não é uma autorização para alterar a experiência pública.

## Integração no Boot V2

O harness V2 agora expõe `window.__v2.moduleAlignmentPilot()`. A função usa `registryHealth.resumo()` como fonte de health, consulta as rotas realmente registradas no router para verificar deep links e classifica o fallback como `registry-observation` para entradas exclusivas do Registry ou `v1-preserved` para paths compartilhados.

A integração no browser confirmou cinco decisões para os cinco módulos V2. Todos possuem fonte `runtime-registry`, deep link verificado e ação de usuário normal preservada; nenhum foi promovido porque o catálogo atual ainda contém entradas Registry-only e metadados divergentes em paths compartilhados.

## Resultado da integração

| Gate | Resultado |
|---|---:|
| Boot V2 | verde |
| Módulos V2 ativos | 5/5 |
| Rotas no router real | 19/19 |
| Observação Registry↔V1 | verde |
| Piloto por módulo | verde |
| Integração V2 total | 23/23 |
| Erros JavaScript | 0 |

O resultado `23/23` inclui a nova asserção `piloto por módulo exige health e deep link antes da promoção`.

## Segurança e limites

O piloto não consulta ou fabrica `admin`, `dev` ou `owner`. Não há uso de `localStorage`, query string, atributo DOM ou metadata editável para aumentar autoridade. Mudanças operacionais como `maintenance`, `disabled` e `quarantined` continuam sob o adaptador de health e a autoridade server-side descritos em `module-registry-health.js`.

Nenhuma decisão de disponibilidade é aplicada à sidebar V1. A lista de decisões só deve ser consumida por uma superfície operacional autorizada até que Auth, claims, RLS, deep-link handling e health de produção sejam validados em conjunto.

## Fora do escopo

Não houve alteração em `src/main.js`, `src/layout/shell.ts`, `src/layout/sidebar.ts`, rotas públicas, Auth, RLS, Supabase, Billing, Service Worker, release version, JARVIS, OpenClaw ou PokeDesk. O harness continua sendo a superfície de prova; usuários normais continuam no shell V1.

## Próximo marco

O próximo passo é escolher um único módulo para alinhamento controlado, preferencialmente uma superfície com contrato de rota e health claros. A escolha deve registrar label, ícone, domínio, rota, deep link, fallback, fonte de health, permissões e rollback antes de qualquer promoção visual.

## Referências

[1]: ./UI_04_CATALOG_RECONCILIATION_2026-08-20.md "UI-04 — reconciliação controlada"
[2]: ./UI_03_REGISTRY_OBSERVATION_2026-08-20.md "UI-03 — observação do Registry"
[3]: ../../src/layout/module-alignment.ts "Contrato do piloto por módulo"
[4]: ../../v2/core/module-registry-health.js "Health e modo operacional do Registry"
[5]: ../../scripts/v2-integracao.mjs "Gate browser de integração V2"
