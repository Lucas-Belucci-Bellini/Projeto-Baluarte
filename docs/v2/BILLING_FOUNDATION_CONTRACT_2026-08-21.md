# Billing Foundation — Contrato local v1

**Status:** CONTRACT FIRST — local-only
**Repository:** `Lucas-Belucci-Bellini/Projeto-Baluarte`
**Base SHA:** `08e0455295c784a6c2fe0863f3a53e9e7e617f0c`
**Escopo:** formalizar preflight de consumo, replay idempotente e observabilidade de mutações sem provider ou persistência remota.

## 1. Objetivo

O contrato complementa `v2/data/billing.ts` e `v2/data/billing-persistence.ts`. Ele **não cria um segundo ledger**. O ledger canônico continua sendo `UsageLedger`; o adapter local continua sendo `BillingPersistenceAdapter`; a fonte de plano continua sendo `BillingCatalog`.

A mudança consiste em transformar a verificação de entitlement e limite em uma fronteira explícita para o caminho novo de escrita. A decisão ocorre antes da mutação dentro do mesmo mutex local. O replay idempotente de uma operação já persistida retorna o evento original sem criar um segundo evento e sem exigir que um plano que existia no primeiro commit ainda esteja ativo no momento do retry.

## 2. Preflight de consumo

A função pura `evaluateBillingPreflight()` recebe plano resolvido, feature, entitlement opcional, uso consumido e quantidade solicitada. Ela retorna um resultado bounded, sem lançar para decisões normais:

| Reason | Meaning | Allowed |
|---|---|---|
| `allowed` | Entitlement, limite e quantidade permitem o consumo | `true` |
| `plan-unavailable` | Nenhum plano ativo foi resolvido | `false` |
| `entitlement-missing` | O plano não contém o entitlement solicitado | `false` |
| `limit-missing` | A feature não possui limite declarado | `false` |
| `limit-exceeded` | O uso projetado excede limite finito | `false` |
| `invalid-input` | Uso ou quantidade não são finitos/não negativos | `false` |
| `invalid-limit` | Limite finito não é finito/não negativo | `false` |

O resultado contém apenas `planId`, `planVersion`, `feature`, `consumed`, `requested`, `projected`, `limit`, `requiredEntitlement` e `reason`. Não contém account ID, workspace ID, subject, token, payload de provider ou autoridade de segurança.

## 3. Escrita protegida

`BillingPersistenceAdapter.appendUsageWithPreflight()` é o caminho explícito para uma nova escrita de uso. Ele deve:

1. validar workspace, account e membership antes de qualquer mutação;
2. normalizar o evento;
3. verificar primeiro o `idempotencyKey` existente;
4. retornar replay seguro para payload equivalente;
5. rejeitar `idempotencyKey` com payload diferente;
6. resolver o plano ativo no timestamp do evento;
7. executar o preflight dentro do mesmo mutex;
8. rejeitar com código público bounded quando o preflight negar;
9. somente então chamar `UsageLedger.append()`;
10. retornar `{ usage, preflight, replayed }` sem expor detalhes internos.

O método legado `appendUsage()` permanece compatível para não quebrar a V1 e os consumidores existentes. O novo método é a superfície que exige preflight. Nenhuma permissão de aplicação será concedida por entitlement; `v2/core/billing-permissions.ts` continua emitindo apenas candidatos e não autoridade.

## 4. Erros públicos novos

O driver pode expor os códigos bounded `ENTITLEMENT_REQUIRED`, `LIMIT_NOT_CONFIGURED`, `LIMIT_EXCEEDED` e `INVALID_LIMIT`. Eles não devem carregar SQL, stack trace, token, URL de provider ou identificadores. Falhas de identidade e tenancy continuam usando os códigos existentes.

## 5. Observabilidade bounded

`buildBillingMutationAudit()` produz `billing-mutation/v1` com:

| Campo | Regra |
|---|---|
| `operation` | Operação bounded, inicialmente `append-usage` |
| `outcome` | `committed`, `replayed` ou `rejected` |
| `reason` | Reason code bounded, sem mensagem arbitrária |
| `statusClass` | `2xx`, `4xx` ou `5xx` |
| `requestedQuantity` | Quantidade limitada a uma faixa numérica segura |
| `requestIdPresent` | Booleano, nunca o request ID |

O evento não inclui IDs, e-mails, subject, role, feature livre, metadata, token, IP, SQL, provider ou conteúdo do evento. A observabilidade é projeção; não executa fallback, cobrança, retry externo ou alteração de estado.

## 6. Invariantes

A implementação deve preservar as seguintes invariantes:

- `UsageLedger` continua append-only;
- um `idempotencyKey` compatível produz no máximo um evento;
- um `idempotencyKey` com payload divergente falha closed;
- preflight negado não cria assignment nem usage;
- membership, account e workspace continuam isolados;
- `runtimeAuthority` continua `not-authorized`;
- `publicPromotionAllowed` continua `false`;
- nenhum provider remoto, Supabase DDL, staging ou cobrança real é tocado;
- o método legado não ganha uma exigência retroativa que quebre os testes existentes.

## 7. Testes obrigatórios

O slice deve cobrir: plano ausente, entitlement ausente, limite ausente, limite excedido, plano ilimitado, limite finito permitido, input inválido, replay idempotente, conflito de idempotência, preflight negado sem mutação, concorrência com mesma chave, observabilidade sem identificadores e regressão das suítes Billing/V2 existentes.

## 8. Rollback

Rollback é a reversão do commit local do contrato/implementação/testes/documentação. Não há rollback remoto porque o slice não executa provider, staging, migrations, DDL, webhook ou cobrança.

— **Manus AI**
