# PHASE 13 — Billing Staging Preflight

**Estado:** preflight implementado; conexão real e cobrança continuam desligadas

## Objetivo

Unir a configuração server-side e o gate operacional em uma única decisão segura antes da construção do `BillingHttpReadDriver`. O preflight não acessa rede nem habilita connector; ele decide se o sistema permanece desligado, bloqueado ou pronto.

## Estados

| Estado | Significado | Driver |
|---|---|---|
| `disabled` | opt-in ausente ou falso | `null` |
| `blocked` | configuração incompleta ou check de segurança falho | `null` |
| `ready` | ambiente, host, secrets, RLS, observabilidade, rollback, writes e aprovação passaram | construído read-only |

O relatório contém somente o estado, nomes de checks falhos e código de erro de configuração. Tokens, API keys, URLs completas, IDs e payloads não entram no relatório.

## Fluxo

`prepareBillingStagingReadDriver` carrega o contrato server-side, executa `validateBillingStagingActivation` e somente chama a factory do driver quando todos os checks passam. O transporte e o observer são injetados; o preflight não cria rede nem escolhe um provider sozinho.

## Garantias

A ausência de configuração mantém a V1 funcionando. Uma configuração incompleta não provoca fallback permissivo. Writes habilitados, RLS não revisado, rollback ausente, observabilidade não revisada, host diferente ou aprovação de connector ausente impedem a construção do driver.

## Rollback

Para voltar ao comportamento anterior, remover o opt-in ou retirar o wiring do preflight. O resultado passa a ser `disabled` e o restante da aplicação continua sem dependência do Billing Read Driver.

## Limites

O preflight não aplica SQL, não conversa com Supabase, não valida RLS remoto e não autoriza billing financeiro. A próxima integração real requer projeto de staging aprovado, secrets server-side, execução do checklist operacional e revisão humana do resultado antes de habilitar o transporte.
