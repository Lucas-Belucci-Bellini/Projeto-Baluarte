# Identity versus Authorization — Wave 1

## Status

`IMPLEMENTED LOCALLY — PENDING PUBLICATION`

## Decisão arquitetural

A identidade responde **quem é o usuário**. A autorização responde **o que aquele usuário pode fazer**. O frontend pode usar a identidade decodificada localmente para exibir nome, e-mail e avatar, mas não pode transformar claims locais em autoridade administrativa.

A autorização efetiva continua dividida entre o Permission Manager local, para negar ações antes da execução no cliente, e as policies RLS/servidor, que são a autoridade para dados persistidos e operações administrativas.

## Contratos verificados

| Contrato | Regra validada |
|---|---|
| `profiles` read | Apenas `authenticated` e somente quando `(select auth.uid()) = id` |
| `profiles` insert | Apenas `authenticated` e `with check` vinculado ao próprio `auth.uid()` |
| `profiles` update | `using` e `with check` vinculados ao próprio `auth.uid()` |
| `tenant_members` | O usuário só lê a própria associação |
| Permission Manager | Permissões desconhecidas retornam negadas e `exigir` lança erro |
| Risco padrão | Permissão nova começa como `restrito` |
| Frontend | Não contém service role e não trata JWT decodificado como prova de autoridade |

## Teste adicionado

`test/security/identity-authorization-contract.test.js` lê a migration RLS efetiva `20260814034533_site_security_performance_hardening.sql`, o Permission Manager TypeScript canônico e o driver Auth. O teste é determinístico, não acessa Supabase remoto e não depende de usuários ou tokens reais.

## O que não foi feito

Não foi criado um segundo sistema de roles, não foi adicionada uma função client-side `isAdmin`, não foram alteradas policies remotas e não foi concedida autoridade baseada no e-mail exibido na interface. A autorização administrativa real continua pendente de validação em staging e deve permanecer server-side/RLS.

## Rollback e próximo passo

O rollback é o revert do commit documental/teste. O próximo marco é executar o contrato contra um projeto Supabase staging aprovado, cobrindo usuário anônimo, usuário autenticado dono da linha, usuário autenticado não dono e operador autorizado, sem colocar service role no navegador.
