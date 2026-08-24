# Ownership Isolation Contract — Wave 1

## Status

`IMPLEMENTED LOCALLY — PENDING PUBLICATION`

## Decisão

O cliente não decide sozinho se uma linha pertence ao usuário. O Data Layer envia o JWT presente na sessão como `Authorization: Bearer ...`, enquanto as policies RLS do Supabase vinculam a linha ao `auth.uid()` do token validado pelo servidor.

Sem token explícito, o Data Layer usa apenas a publishable/anon key como Bearer. Isso não concede ownership: o acesso efetivo continua sujeito à policy e ao papel do request.

## Contratos cobertos

| Camada | Invariante |
|---|---|
| Auth | A sessão fornece o JWT do usuário, nunca service role |
| Data Layer | `dbFetch(..., { token })` envia `Bearer <token>` |
| Fallback público | Sem token, usa somente a publishable key |
| RLS | `knowledge_notes`, `memories` e `media_bookmarks` possuem policies owner vinculadas a `auth.uid()` |
| Administração | Não é inferida por e-mail ou claim client-side; exige policy/server-side própria |

## Testes

`test/security/ownership-runtime-contract.test.js` cobre o cabeçalho Bearer com JWT do usuário, o fallback sem JWT e a existência das policies owner nas tabelas pessoais atuais.

## Limitações

O teste local não executa PostgreSQL nem Supabase remoto. Ele verifica o contrato do Data Layer e a migration vigente. A prova definitiva deverá ocorrer em staging aprovado com quatro identidades: anônimo, usuário dono, usuário não dono e operador autorizado.

## Rollback

O rollback é o revert do teste e desta documentação. Nenhuma tabela, policy remota, sessão real ou credencial foi alterada.
