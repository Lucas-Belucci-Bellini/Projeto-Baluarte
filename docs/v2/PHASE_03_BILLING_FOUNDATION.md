# PHASE 03 — Billing Foundation

**Estado:** primeiro contrato implementado, sem cobrança real

## Objetivo

Transformar o master prompt de planos, assinaturas, uso e billing em uma base incremental compatível com a arquitetura V2, sem criar um segundo sistema de usuários, permissões, storage ou autenticação.

## Contrato implementado

`v2/data/billing.ts` contém os tipos `Plan`, `LimitValue` e `UsageEvent`, além de `normalizePlan`, `hasEntitlement`, `decideUsage` e `UsageLedger`.

O fluxo inicial é:

```text
Plan
↓
entitlements + limits
↓
decideUsage
↓
UsageLedger append-only
↓
idempotencyKey contra retries
```

O preço é representado em unidade monetária menor (`priceMinor`) e a moeda é explícita. Nenhum preço concreto foi embutido no código. O limite `unlimited` é uma união discriminada, não um número mágico ou uma string ambígua.

## Garantias

| Garantia | Implementação |
| --- | --- |
| Entitlements sem `if plan === ...` | `hasEntitlement(plan, key)` |
| Limites configuráveis | `Readonly<Record<string, LimitValue>>` |
| Unlimited explícito | `{ kind: 'unlimited' }` |
| Auditoria de consumo | `UsageLedger.list()` preserva a ordem append-only |
| Retry sem duplicação | `idempotencyKey` retorna o evento original |
| Duplicata real detectável | IDs diferentes com o mesmo registro causam erro |
| V1 preservada | nenhuma rota ou autenticação existente foi substituída |

## Não implementado nesta fase

Ainda não existe persistência Postgres/Supabase, provider de pagamento, checkout, assinatura, invoice, webhook, refund, overage, marketplace, payout, cupom ou tela de preços. Isso é intencional: primeiro o contrato local precisa ser estabilizado e conectado ao sistema existente de identidade, permissões, workspace e Evidence.

## Resolução por conta e workspace

A segunda fatia da fase adicionou `BillingCatalog`, `PlanAssignment` e `PlanResolution`. A resolução exige `accountId` e `workspaceId`, considera a janela temporal de vigência e escolhe a assignment ativa mais recente. Um workspace diferente não herda silenciosamente o plano de outro workspace. Plano inexistente, inativo ou sem assignment retorna uma razão explícita, sem fallback comercial implícito.

## Fronteira com permissões

`v2/core/billing-permissions.ts` transforma entitlements em candidatos de permissão. Ele não importa o Permission Manager, não chama `conceder` e não cria autorização automática. O Permission Controller continua sendo a autoridade técnica; o adapter apenas informa quais permissões poderiam ser avaliadas depois, evitando que um plano pago seja confundido com uma elevação de privilégio.

Mappings conflitantes são rejeitados e entitlements sem mapping são devolvidos como `unmappedEntitlements`. Isso torna incompleta uma configuração comercial visível em vez de conceder mais acesso do que foi declarado.

## Evidence interno

`v2/data/billing-evidence.ts` transforma uma resolução em uma claim interna com URI `baluarte://billing/assignments/...`, `moduleId` `v2.billing`, confiança explícita e status `verified`. Essa Evidence descreve o estado observado pelo catálogo local; ela não é uma fonte externa e não deve ser apresentada como prova de pagamento até que a persistência e a reconciliação financeira existam.

## Ordem seguinte

A próxima fase deve persistir assignments e eventos em Postgres/Supabase, definir RLS/tenancy e executar testes de concorrência. O Permission Controller deverá receber uma API de avaliação que considere identidade, papel, workspace, entitlement e flag do módulo, nessa ordem, sem permitir que billing contorne `owner`, `admin`, `dev` ou usuário normal. Provider financeiro deve ficar atrás de um adapter server-side e permanecer em sandbox até haver configuração e autorização explícitas.

## Testes

Os testes cobrem normalização de entitlements, limites finitos, limites ilimitados, limite ausente, append-only, totalização, idempotência, resolução temporal por account/workspace, mappings conflitantes, isolamento de permissões e serialização de Evidence interna. Os arquivos são `test/v2/billing.test.js`, `test/v2/billing-permissions.test.js` e `test/v2/billing-evidence.test.js`.

## Riscos

O risco principal é confundir entitlement comercial com permissão técnica. Um plano pode conceder um direito de produto, mas a autorização efetiva ainda deve passar pelo Permission Controller e pelo contexto do módulo. O ledger local também não é uma fonte de verdade para produção; ele é um contrato de comportamento que deverá ser reproduzido em uma transação persistente posteriormente.
