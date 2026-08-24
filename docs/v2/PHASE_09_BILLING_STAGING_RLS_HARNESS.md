# PHASE 09 — Billing Staging RLS Harness

**Estado:** harness local implementado; Supabase remoto permanece desabilitado

## Objetivo

Criar uma aproximação determinística de staging para exercitar o `BillingHttpReadDriver` contra cenários que devem ser garantidos por RLS, sem usar rede, connector ou credencial real. O harness não substitui o banco; ele fixa o comportamento esperado antes da conexão com um projeto Supabase de staging aprovado.

## Superfície simulada

`v2/data/billing-staging-harness.ts` implementa um transporte PostgREST fake para `workspaces`, `plan_assignments`, `plans` e `usage_events`. A sessão de teste é representada por um Bearer controlado no formato `staging-user:<id>`; esse formato existe somente no fixture e não é aceito como segredo de produção.

| Cenário | Comportamento esperado |
|---|---|
| Usuário membro | lê workspace, plano resolvido e usage do próprio workspace |
| Usuário fora do workspace | recebe `403` em usage ou `404` quando a policy não divulga o workspace |
| Mesmo slug em contas diferentes | continua isolado pelo `account_id` |
| Sessão ausente | recebe 401 |
| Recurso inexistente | recebe 404 e `WORKSPACE_NOT_FOUND` |
| Assignment temporal | somente assignments efetivas no instante consultado entram na resposta |
| Plano versionado | a consulta exige `plan_id + version` |

## Decisão de privacidade

O harness permite `WORKSPACE_NOT_FOUND` para um usuário externo ao consultar workspace, porque uma policy real pode esconder a existência do recurso. O contrato não deve obrigar o provider a revelar se um workspace privado existe. Para usage e assignment, o cenário de membership é explicitamente protegido.

## Limites

Nenhuma policy remota foi avaliada. Nenhum write é simulado. O harness não deve ser usado como evidência de que o RLS do Supabase está correto; ele é um contrato de pré-integração. A próxima etapa de staging real deverá repetir os mesmos cenários com duas contas, dois usuários, membership revogado e um token expirada, registrando apenas resultados sem dados sensíveis.

## Testes

`test/v2/billing-staging-harness.test.js` cobre as três superfícies read-only, isolamento entre contas, ausência de sessão, workspace ausente e resolução do dataset controlado. Os testes são locais e não alteram arquivos do banco.
