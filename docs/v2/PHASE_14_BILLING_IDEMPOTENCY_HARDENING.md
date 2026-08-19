# PHASE 14 — Billing Write Idempotency Hardening

**Estado:** implementado localmente; adapter remoto e Supabase staging continuam desativados

## Objetivo

Endurecer o primeiro contrato da camada de escrita do Billing Foundation sem habilitar escrita no navegador ou em um projeto Supabase real. A mudança protege o replay de requests e evita que uma mesma chave de idempotência seja reutilizada para representar outro consumo.

## Contrato

Uma gravação com `idempotencyKey` já registrada pode ser repetida quando o payload de negócio é equivalente. O replay devolve o evento original e não cria uma segunda linha. A comparação ignora somente o `id` técnico usado pelo request e trata a ordem das chaves de metadata como irrelevante.

Se a mesma chave for enviada com `accountId`, `workspaceId`, `feature`, `quantity`, `timestamp`, `source` ou metadata diferente, o adapter lança `BillingPersistenceError` com o código estável `IDEMPOTENCY_CONFLICT`. O evento original permanece intacto.

## Segurança preservada

A consulta da chave ocorre depois da validação de workspace, account e membership. Portanto, um actor sem membership não pode usar uma chave existente para inferir ou modificar dados. A camada continua in-memory/test-only; não há `service_role` no frontend, checkout, invoice, webhook ou provider financeiro.

## Testes

A cobertura inclui retries concorrentes, replay compatível com metadata em ordem diferente, conflito por quantity, múltiplas chaves concorrentes, membership obrigatório e account/workspace mismatch. O gate TypeScript e os nove testes de persistência passaram no marco local.

## Rollback

Reverter o commit desta fase restaura o comportamento anterior do ledger. O rollback não exige alteração de banco, porque a mudança é limitada ao adapter local e aos contratos já existentes.

## Próxima etapa

Antes de qualquer adapter HTTP de escrita, deve ser definido o contrato transacional remoto, incluindo resposta de conflito da constraint `unique (workspace_id, idempotency_key)`, timeout, retry limitado, mapeamento de erro, observabilidade redigida e prova de RLS em staging autorizado.
