# PHASE 16 — Billing Transactional Write Contract

**Estado:** contrato transacional local implementado; adapter remoto e Supabase staging continuam desativados

## Objetivo

Adicionar uma operação in-memory que simula o limite transacional necessário para persistir um `plan_assignment` e um `usage_event` relacionados, sem permitir mutação parcial quando qualquer validação falhar.

## Operação

`BillingPersistenceAdapter.assignPlanAndAppendUsage(assignment, request)` executa sob o mesmo mutex usado para consumo concorrente. Antes de alterar o catálogo ou o ledger, valida workspace existente, account do usage, workspace/account do assignment, membership do actor, plano e versão registrados, janela temporal, idempotência e duplicação de IDs.

Quando todas as validações passam, a operação persiste assignment e usage no mesmo trecho protegido. Retries concorrentes com o mesmo assignment e a mesma chave de idempotência retornam os registros já persistidos sem duplicar linhas.

## Falhas sem mutação parcial

| Condição | Código ou erro |
|---|---|
| Workspace inexistente | `WORKSPACE_NOT_FOUND` |
| Actor sem membership | `MEMBERSHIP_REQUIRED` |
| Conta ou workspace divergente | `ACCOUNT_MISMATCH` |
| Plano/versão não registrados | `PLAN_NOT_FOUND` |
| Janela temporal inválida | `RangeError` de contrato |
| Chave reutilizada com payload diferente | `IDEMPOTENCY_CONFLICT` |
| Assignment ou `usage.id` duplicado | `DUPLICATE_RESOURCE` |

Em todas essas situações os testes confirmam que o ledger permanece sem novo evento e que o catálogo não recebe assignment parcial.

## Relação com SQL

A operação local espelha as fronteiras do SQL de `billing.plan_assignments` e `billing.usage_events`: foreign key do plano, account/workspace, membership, janela temporal, idempotência e append-only. Ela não substitui transação real de Postgres nem prova RLS remoto.

## Segurança e escopo

A operação é local/test-only e não recebe secrets, não chama rede e não altera o boot. Ela não habilita writes no navegador e não autoriza checkout, assinatura, invoice, webhook, refund ou provider financeiro.

## Rollback

O rollback desta fase é a reversão do commit, sem migration ou alteração remota. Como o novo método não é conectado ao boot, removê-lo não afeta a V1 nem o driver HTTP read-only.

## Próxima etapa

O próximo adapter remoto deve expor uma operação equivalente por endpoint transacional server-side, ou uma função Postgres/RPC revisada, porque duas requisições PostgREST independentes não garantem atomicidade entre assignment e usage. A implementação real só pode começar após o projeto Supabase staging e o contrato RPC/transação serem aprovados.
