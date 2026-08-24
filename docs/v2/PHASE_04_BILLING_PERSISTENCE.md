# PHASE 04 — Billing Persistence Contract

**Estado:** contrato SQL criado e validado estruturalmente; migração remota ainda não aplicada

## Objetivo

Preparar a persistência da Billing Foundation sem ativar cobrança real. A primeira camada persistente deve resolver três problemas distintos: isolamento por workspace, versionamento de planos e registro idempotente de consumo.

## Migração criada

O arquivo `supabase/migrations/20260819060000_billing_foundation.sql` cria o schema `billing` e as tabelas `workspaces`, `workspace_members`, `plans`, `plan_assignments` e `usage_events`.

| Tabela | Responsabilidade | Isolamento |
| --- | --- | --- |
| `billing.workspaces` | Workspace pertencente a uma conta Auth | `account_id` referencia `auth.users` |
| `billing.workspace_members` | Relação usuário/workspace e papel | chave composta `workspace_id + user_id` |
| `billing.plans` | Catálogo versionado de planos | leitura apenas de planos `active` para autenticados |
| `billing.plan_assignments` | Plano efetivo de uma conta/workspace | membership obrigatório nas policies |
| `billing.usage_events` | Consumo append-only | membership obrigatório e chave idempotente por workspace |

## Tenancy e RLS

A função `billing.is_workspace_member(uuid)` é `security definer`, possui `search_path` explícito e é usada pelas policies para verificar membership. O schema e as tabelas são removidos dos grants de `public` e `anon`. O papel `authenticated` recebe apenas o uso necessário para leitura controlada e avaliação das policies.

A migração não cria uma policy ampla para escrita pelo navegador. Escrita de workspace, membership, plano, assignment e usage deverá ocorrer por backend protegido ou `service_role`, nunca expondo a chave administrativa no frontend.

## Append-only e idempotência

`usage_events` possui `unique (workspace_id, idempotency_key)`, evitando duplicação em retry. Um trigger bloqueia `UPDATE` e `DELETE` com a mensagem explícita `billing.usage_events é append-only`. O `account_id` é persistido no evento, mas a policy usa o workspace membership como fronteira de leitura; a camada server-side deverá validar que a conta do evento coincide com a conta do workspace antes do insert.

Assignments possuem versão de plano, janela temporal e status. O banco impede `effective_to` anterior ou igual a `effective_from` e possui índice para limitar uma assignment ativa aberta por workspace. A prevenção completa de janelas sobrepostas deve ser refinada com constraint de exclusão quando o provider Postgres e as extensões permitidas do projeto estiverem confirmados.

## O que não foi feito

A migração não foi aplicada ao Supabase remoto, não alterou RLS existente, não criou checkout, assinatura, invoice, webhook, refund, overage, provider financeiro ou sincronização de pagamento. A aplicação remota exige confirmação do projeto Supabase correto, revisão do SQL e um plano de rollback.

## Testes

`test/v2/billing-migration-contract.test.js` verifica estruturalmente tenancy, foreign keys, versionamento, idempotência, trigger append-only, RLS e grants. O teste não finge executar Postgres: ele protege o contrato textual até que exista um ambiente Supabase de integração autorizado.

## Próximos passos

A próxima fatia deve adicionar um adapter server-side que persista assignment e usage em transações, executar testes de concorrência com duas gravações do mesmo `idempotency_key`, testar membership revogado, verificar isolamento entre workspaces e validar a migração em um projeto Supabase de staging antes de qualquer produção.
