# Auth Runtime Contract — Wave 1

## Status

`IMPLEMENTED LOCALLY — PENDING PUBLICATION`

## Escopo

Esta onda endurece o driver local de Supabase Auth sem ativar staging, sem usar credenciais reais e sem alterar policies remotas. A implementação canônica da página continua em `src/pages/login.ts`; a mudança é exclusivamente no contrato de sessão de `src/core/supabase-auth.js`.

## Causa raiz tratada

O driver aceitava uma resposta HTTP 200 de login sem `access_token` ou `refresh_token` e persistia valores indefinidos como sessão. O caminho de refresh também podia persistir uma resposta sem `access_token` e devolver um valor inválido ao consumidor.

Isso é uma causa raiz de integridade de sessão, não um problema de UI: uma sessão inválida poderia atingir vários consumidores autenticados e produzir falhas em cascata difíceis de atribuir ao login original.

## Contrato implementado

| Operação | Regra |
|---|---|
| Login por senha | HTTP bem-sucedido exige `access_token` e `refresh_token`; caso contrário, rejeita com erro legível |
| Cadastro | Mantém o contrato existente de sessão confirmada ou confirmação de e-mail pendente |
| Refresh | HTTP bem-sucedido sem `access_token` limpa a sessão e devolve `null` |
| Logout | Revogação remota continua best-effort; a sessão local sempre é removida |
| Staging/Supabase real | Não utilizado nesta onda |
| Autorização administrativa | Não inferida de claims client-side; continua dependente de RLS/servidor |

## Testes adicionados

`test/security/auth-runtime-contract.test.js` cobre quatro comportamentos determinísticos com `fetch` fake:

1. Login válido cria sessão.
2. Resposta 200 sem tokens não cria sessão.
3. Refresh incompleto limpa a sessão em vez de persistir token inválido.
4. Logout limpa a sessão quando a revogação remota falha.

## Validação e rollback

A onda deve passar `npm run tipos:ts`, `npm test`, `npm run build`, os gates V2, smoke e caminho crítico. O rollback é o revert do commit, removendo o teste e restaurando somente as duas validações do driver. Nenhum segredo, token real, usuário, policy ou banco remoto foi alterado.

## Limitações

Esta onda não prova a execução de RLS em um projeto Supabase remoto. Também não transforma claims decodificadas no navegador em autoridade. O próximo marco de identidade deve validar policies e persistência em staging aprovado, com dados de teste e sem service role no frontend.
