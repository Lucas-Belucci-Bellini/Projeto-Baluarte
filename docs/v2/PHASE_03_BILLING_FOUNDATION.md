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

## Ordem seguinte

A próxima fase deve definir a resolução de plano por conta/workspace e o mapeamento entre entitlement comercial e permissão arquitetural. Depois devem entrar persistência, RLS/tenancy e testes de concorrência. Provider financeiro deve ficar atrás de um adapter server-side e permanecer em sandbox até haver configuração e autorização explícitas.

## Testes

`test/v2/billing.test.js` cobre normalização de entitlements, limites finitos, limites ilimitados, limite ausente, append-only, totalização e idempotência.

## Riscos

O risco principal é confundir entitlement comercial com permissão técnica. Um plano pode conceder um direito de produto, mas a autorização efetiva ainda deve passar pelo Permission Controller e pelo contexto do módulo. O ledger local também não é uma fonte de verdade para produção; ele é um contrato de comportamento que deverá ser reproduzido em uma transação persistente posteriormente.
