# TypeScript Migration — Wave 9 — Identity and Profile

## Status

`PUBLISHED — REMOTE CI GREEN`

## Base auditada

A Wave 9 foi construída sobre o SHA `6ef6c4423e7eac31da4f2799bbe28a2603d402c8`, que contém a Wave 8 publicada e todos os workflows remotos verdes. Durante a sincronização, o commit remoto `ca803a40` (`fix(jarvis): integrar html com fonte typescript no vite`) foi integrado sem conflito antes da publicação da onda.

## Objetivo

Promover `/perfil` e `/login` para as implementações TypeScript canônicas, mantendo os wrappers JavaScript de compatibilidade e sem alterar o contrato de Supabase Auth, OAuth PKCE, sessão, ownership ou RLS.

## Rotas migradas

| Rota | Implementação canônica | Export | Domínio Nexus |
|---|---|---|---|
| `/perfil` | `src/pages/perfil.ts` | `perfilPage` | `baluarte-profile` |
| `/login` | `src/pages/login.ts` | `loginPage` | `baluarte-profile` |

`src/main.js` e `docs/nexus/dominios.json` foram atualizados juntos.

## Contrato de identidade preservado

A página de login continua delegando Google, password login, criação de conta e logout a `src/core/supabase-auth.js`. A página de perfil continua usando `currentUser`, `isLoggedIn`, `loadProfile` e `saveProfile` apenas através das fronteiras existentes. Não foram adicionados tokens, claims locais, service role ou persistência de senha no frontend. O backup local continua sendo validado pelo contrato existente antes de restaurar dados.

Os testes prévios específicos de Auth, identity, ownership e sessão passaram em `29/29`; os contratos completos de segurança da onda passaram em `39/39`.

## Validação local

| Gate | Resultado |
|---|---|
| `npm run verificar-nexus` | Passou: 99 rotas, 0 lacunas, 0 divergências |
| `npm run tipos:ts` | Passou |
| `npm run tipos:v2` | Passou |
| `npm test` | Passou: 1085/1085 |
| `npm run build` | Passou; somente avisos conhecidos de chunks grandes |
| `npm run v2:integracao` | Passou: 21/21 |
| `npm run smoke` | Passou: 99/99 |
| `npm run caminho-critico` | Passou: 15/15 |
| Contratos de segurança | Passou: 39/39 |
| `git diff --check` | Passou |

A primeira execução pós-merge de `npm run v2:integracao` encontrou o timeout ambiental conhecido em `.cripto-entrada`, por previews Vite órfãos nas portas 4193/4194. Após encerrar somente esses processos, a repetição passou em `21/21`. O gate local `npm run v2:runtime` permanece bloqueado pelo Cargo 1.75.0 ao interpretar a dependência com `edition2024`; não foi alterada configuração para ocultar a limitação. O workflow remoto V2 Runtime continua sendo o gate autoritativo.

## Escopo não alterado

Não houve conexão a Supabase staging, alteração de schema, migração SQL, mudança de RLS, alteração de Vercel, criação de usuário, login real, publicação externa ou uso de credenciais. A validação foi somente local e contratual.

## Riscos e rollback

O risco é regressão de uma fronteira legada que dependa do wrapper JavaScript ou uma mudança futura na estrutura de `AuthUser`. Os wrappers permanecem. Rollback: reverter as duas extensões em `src/main.js`, as duas origens no Nexus e este documento; nenhum dado externo foi alterado.

## Próximo passo

A divergência foi inspecionada, o commit remoto `ca803a40` foi integrado e a Wave 9 foi publicada no SHA que será registrado após o push desta documentação. Depois, selecionar uma onda de páginas militares leves ou iniciar a análise contratual de `/geo` e `/visao`, mantendo `jarvis.ts` e `editor.ts` bloqueados até seus contratos pesados serem tratados.
