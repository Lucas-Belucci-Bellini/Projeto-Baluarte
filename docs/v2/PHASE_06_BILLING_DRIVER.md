# PHASE 06 — Billing Driver Contract

**Estado:** interface e fake local validados; driver Postgres/Supabase ainda não conectado

## Objetivo

Separar o contrato de negócio da tecnologia de persistência. O frontend e os módulos V2 não devem conhecer detalhes de Postgres, PostgREST, Supabase ou mensagens SQL. Eles devem consumir uma interface única que também possa ser exercitada localmente.

## Interface

`v2/data/billing-driver.ts` define `BillingDriver`, `DriverResult` e `BillingPersistenceError`. O contrato cobre criação de workspace, membership, verificação de membro, registro de plano, assignment, append de usage e leitura autorizada de usage.

O retorno aceita valor imediato ou `Promise`, permitindo que o fake local seja simples e que o driver remoto seja assíncrono sem duplicar os consumidores. Quando o driver remoto for introduzido, a implementação deverá manter as mesmas entradas, saídas e códigos de erro.

## Erros públicos

| Código | Significado | Retry automático |
| --- | --- | ---: |
| `WORKSPACE_NOT_FOUND` | Workspace inexistente | não |
| `MEMBERSHIP_REQUIRED` | Ator não pertence ao workspace | não |
| `ACCOUNT_MISMATCH` | Conta não corresponde ao workspace | não |
| `IDEMPOTENCY_CONFLICT` | Conflito de chave de idempotência | depende da resposta do driver |
| `DUPLICATE_RESOURCE` | Recurso ou membership duplicado | não |
| `PLAN_NOT_FOUND` | Plano/versão não encontrado | não |
| `INVALID_STATE` | Estado incompatível com a operação | não |

O frontend deve receber somente `publicMessage`; logs server-side podem registrar correlação e diagnóstico sem expor SQL, tokens ou stack trace.

## Fake de staging

`BillingPersistenceAdapter` implementa a interface em memória. Ele permanece útil para testes de contrato, integração local e desenvolvimento offline, mas não é fonte de verdade distribuída. O mutex é apenas uma aproximação de transação no processo atual; o driver Postgres deverá reproduzir a garantia com constraints, transações e tratamento de conflito.

## Não conectado ao Supabase

Nenhum connector ou credencial foi ativado nesta fase. A implementação remota só começa após confirmação do projeto Supabase de staging, revisão da migração `20260819060000_billing_foundation.sql`, execução das policies com usuários de teste e definição do rollback.

## Testes

`test/v2/billing-persistence.test.js` valida concorrência, idempotência, membership, account mismatch, duplicidade e códigos tipados. O teste não depende de rede e não altera dados externos.

## Próximo passo

Criar o driver Postgres/Supabase atrás dessa interface, começando por operações read-only de catálogo e membership em staging. Depois habilitar writes de assignment e usage em transação, com duas conexões concorrentes e reconciliação contra as constraints SQL.
