# Auth Redirect Contract — Wave 1

## Status

`IMPLEMENTED LOCALLY — PENDING PUBLICATION`

## Contrato

O retorno OAuth usa o fragmento da URL para transportar tokens temporários. O boot deve capturar esse fragmento antes do router, persistir uma sessão somente quando `access_token` e `refresh_token` estiverem presentes e substituir imediatamente a URL por uma rota local sem tokens.

A navegação normal do hash-router, como `#/home`, não é um retorno OAuth e não deve alterar sessão nem histórico.

## Casos cobertos

| Caso | Resultado esperado |
|---|---|
| Hash normal `#/home` | Nenhuma sessão e nenhum `replaceState` |
| `access_token` + `refresh_token` | Sessão criada e URL reduzida a rota local |
| Somente `access_token` | Nenhuma sessão; fragmento removido |
| Erro do provedor | Nenhuma sessão; fragmento removido |
| URL final | Não contém `access_token` nem `refresh_token` |

## Teste

`test/security/auth-redirect-contract.test.js` executa os quatro cenários com `window` e `history` fakes. Nenhum navegador, credencial, usuário ou projeto Supabase remoto é utilizado.

## Limites de segurança

O redirect local confirma apenas a presença estrutural dos tokens retornados pelo provedor; ele não transforma a decodificação client-side do JWT em autorização. O RLS/servidor permanece responsável por decidir acesso a dados e operações administrativas. O `redirectTo` do login Google continua limitado à origem e ao pathname atuais, dependendo também do allow-list configurado no Supabase.

## Rollback e próximo passo

O rollback é o revert do teste/documentação. O próximo marco é validar o fluxo em staging autorizado, incluindo callback real, expiração, refresh, usuário não proprietário tentando ler/alterar uma linha e operador autorizado por policy server-side.
