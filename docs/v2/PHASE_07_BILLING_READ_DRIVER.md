# PHASE 07 — Billing Read Driver

**Estado:** superfície read-only implementada no fake local; Supabase remoto não conectado

## Decisão de integração

O ambiente atual possui conectores Supabase desabilitados. Como não existe autorização nem necessidade técnica para habilitar um connector nesta rodada, o marco foi implementado com um fake local compatível com a interface `BillingReadDriver`. Nenhuma credencial foi solicitada, criada ou exposta.

## Superfície read-only

`BillingReadDriver` agora define três leituras controladas:

| Operação | Regra |
|---|---|
| `getWorkspace` | exige membership e retorna apenas o workspace autorizado |
| `resolvePlan` | exige membership e confirma que `accountId` corresponde ao workspace |
| `listUsage` | exige membership e filtra eventos pelo workspace solicitado |

`BillingDriver` estende esse contrato com as operações de escrita já existentes. Um futuro driver Postgres/Supabase poderá ser substituído sem alterar os consumidores V2.

## Segurança

A leitura do workspace ocorre antes da avaliação de membership para produzir `WORKSPACE_NOT_FOUND` quando apropriado. Um usuário externo recebe `MEMBERSHIP_REQUIRED`; uma conta divergente recebe `ACCOUNT_MISMATCH`. O frontend nunca recebe detalhes SQL ou tokens.

Os erros são instâncias de `BillingPersistenceError`, com código estável, mensagem pública e indicação de retry. O conjunto de códigos continua preparado para mapear erros de Postgres, PostgREST ou Supabase sem acoplar a aplicação às mensagens de provider.

## Limites

O fake local não é uma conexão de staging e não comprova que as policies remotas estão corretas. Ele protege o contrato da aplicação até que exista um projeto Supabase de staging explicitamente aprovado. A próxima integração real deverá começar com leitura autenticada e somente depois habilitar writes transacionais.

## Testes

`test/v2/billing-persistence.test.js` cobre leitura autorizada, membership negado, conta divergente, workspace ausente, idempotência concorrente e isolamento de workspace. Os testes não fazem rede nem modificam dados externos.

## Próximo passo

Criar uma implementação HTTP/PostgREST apenas quando o ambiente de staging estiver autorizado. Ela deverá aceitar uma configuração server-side, recusar URLs ausentes ou inseguras, impor timeout, não repetir leituras sem limite e converter status do provider em `BillingPersistenceError`.
