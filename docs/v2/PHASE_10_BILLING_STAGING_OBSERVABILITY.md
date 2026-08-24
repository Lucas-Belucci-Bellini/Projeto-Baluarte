# PHASE 10 — Billing Staging Observability

**Estado:** observabilidade local implementada; connector Supabase continua desabilitado

## Objetivo

Preparar a validação de staging sem registrar dados pessoais, IDs de conta/workspace, tokens, URLs privadas, payloads ou mensagens internas do provider. A observabilidade é agregada por operação e código tipado.

## Métricas permitidas

`BillingReadMetrics` registra somente:

| Campo | Uso |
|---|---|
| `operation` | `getWorkspace`, `resolvePlan` ou `listUsage` |
| `success` | número de leituras concluídas |
| `errors` | número de falhas |
| `retryableErrors` | falhas de timeout/indisponibilidade que podem ser repetidas |
| `errorCodes` | contagem por código estável |
| `totalDurationMs` | soma de duração limitada e arredondada |

Não são armazenados `actorUserId`, `accountId`, `workspaceId`, `planId`, `idempotencyKey`, token, API key, URL, response body, stack trace ou payload.

## Checklist de staging real

Antes de habilitar uma conexão Supabase read-only, a equipe deverá confirmar um projeto de staging explicitamente aprovado, secret server-side, URL HTTPS, RLS aplicada à migração Billing Foundation, dois usuários de teste em contas diferentes e plano/assignment versionados.

A execução deve provar leitura autorizada de workspace, plano e usage; isolamento entre workspaces; isolamento entre contas; membership revogado; token ausente ou expirado; workspace privado não revelado; assignment fora da janela; plano inexistente; timeout; 429; 5xx; payload inválido; e ausência de writes.

A coleta deve exportar somente métricas agregadas e códigos, com retenção curta para staging. Qualquer log contendo token, API key ou body deve falhar o gate de segurança e bloquear a integração.

## Implementação

`BillingHttpReadDriver` aceita um `BillingReadObserver` opcional. `BillingReadMetrics` é um observer em memória para testes e pode ser substituído por um sink server-side que respeite o mesmo formato. O observer não altera o resultado das leituras nem converte falhas em sucesso.

## Limites

Nenhum connector foi habilitado e nenhum projeto remoto foi acessado nesta fase. O checklist não é autorização para aplicar migrações. A liberação de staging real exige revisão separada de credenciais, RLS, observabilidade e rollback.
