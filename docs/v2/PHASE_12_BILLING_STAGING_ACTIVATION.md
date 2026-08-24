# PHASE 12 — Billing Staging Activation Gate

**Estado:** gate operacional implementado; nenhuma ativação remota executada

## Objetivo

Impedir que a conexão read-only de Billing seja ativada apenas porque secrets foram preenchidos. A ativação precisa passar por um conjunto explícito de verificações e permanecer limitada a staging.

## Checks obrigatórios

| Check | Requisito |
|---|---|
| `staging-environment` | configuração declara `staging` |
| `approved-project-host` | hostname da configuração corresponde exatamente ao host aprovado |
| `server-side-secrets` | secrets vêm de `server-env` ou `secret-manager` |
| `rls-reviewed` | policies RLS foram revisadas no projeto correto |
| `observability-reviewed` | métricas e redaction foram revisadas |
| `rollback-documented` | rollback da configuração e migração está escrito |
| `writes-disabled` | nenhum write de billing está habilitado |
| `connector-explicit` | aprovação do connector foi registrada explicitamente |

O resultado é permitido somente quando todos os checks passam. A função não recebe nem inclui secrets no resultado; erros contêm apenas nomes dos checks falhos.

## Procedimento de ativação

Primeiro deve ser aprovado o projeto de staging e seu hostname. Depois, a migração Billing Foundation deve ser aplicada em ambiente descartável, o RLS deve ser testado com duas contas e dois usuários, e o checklist de observabilidade deve ser executado sem armazenar identificadores ou payloads.

Somente depois dessas etapas o backend pode carregar secrets server-side, construir `BillingReadConfig`, executar `validateBillingStagingActivation` e injetar o transporte autorizado. O driver continua read-only; a ativação não libera checkout, webhook, invoice, usage write ou cobrança.

## Rollback

Em qualquer falha, remover o opt-in `BILLING_READ_DRIVER_ENABLED`, revogar ou rotacionar secrets, retirar o transporte do wiring server-side, preservar logs apenas agregados e registrar o código do check falho. A V1 deve continuar funcionando com o driver ausente porque a configuração desligada retorna `null`.

## Limites

Este gate é um contrato operacional local. Ele não habilita connectors, não aplica SQL e não comprova RLS remoto. Qualquer conexão real exige uma decisão separada, com projeto Supabase explicitamente autorizado e revisão de segurança.
