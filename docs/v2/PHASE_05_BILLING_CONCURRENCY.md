# PHASE 05 — Billing Adapter e Concorrência

**Estado:** adapter local implementado e validado; Supabase remoto ainda não aplicado

## Objetivo

Criar uma fronteira server-side pequena para reproduzir, em memória e sem rede, as invariantes que deverão existir na persistência Postgres: membership obrigatório, correspondência entre conta e workspace, idempotência de usage e serialização de gravações concorrentes.

## Adapter

`v2/data/billing-persistence.ts` adiciona `BillingPersistenceAdapter`, `WorkspaceRecord`, `WorkspaceMember`, `WorkspaceRole` e `UsageWriteRequest`.

O adapter cria workspaces, cria memberships, registra planos, atribui planos com validação de conta e workspace, registra consumo e lista usage somente para membros. A implementação não é uma substituta de Postgres; ela é um contrato executável para impedir que a camada server-side nasça sem as mesmas fronteiras de segurança.

## Concorrência

`AsyncMutex` serializa a região crítica de escrita de usage. Quando várias requests chegam com o mesmo `idempotency_key`, a primeira grava o evento e as seguintes retornam o evento existente. Requests com chaves diferentes continuam sendo preservadas. O teste usa 32 retries concorrentes para a mesma chave e 12 escritas concorrentes com chaves distintas.

| Invariante | Teste |
| --- | --- |
| Retry idêntico não duplica evento | 32 promises, 1 evento final |
| Requests distintas não desaparecem | 12 promises, 12 eventos finais |
| Membro externo não grava | `actorUserId` rejeitado |
| Conta não correspondente não grava | `accountId` divergente rejeitado |
| Slug repete somente em outra conta | duplicata intra-conta rejeitada |

## Limites

O mutex local protege um único processo. Em produção, o equivalente deve ser uma transação Postgres com unique constraint em `(workspace_id, idempotency_key)` e tratamento explícito de conflito. Não é permitido interpretar o adapter em memória como mecanismo de consistência distribuída.

A persistência remota ainda precisa validar membership em RLS, conta proprietária do workspace, concorrência entre duas instâncias server-side, retry após timeout e comportamento de transação abortada. O adapter não executa pagamento nem altera catálogo financeiro.

## Testes

Os testes novos estão em `test/v2/billing-persistence.test.js`. A rodada validou também o contrato SQL e os contratos de billing existentes.

## Próximo passo

A próxima etapa deve criar um driver Postgres/Supabase atrás de uma interface equivalente, primeiro em staging. A implementação precisa expor erros tipados para conflito de idempotência, membership ausente, workspace inexistente e plano inválido, sem vazar detalhes SQL ao frontend.
