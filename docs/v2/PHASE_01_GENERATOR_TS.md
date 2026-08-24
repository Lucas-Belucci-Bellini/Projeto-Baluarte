# PHASE 01 — Compatibilidade dos geradores com TypeScript

**Status:** concluída e validada localmente  
**Causa raiz:** `GEN-TS-001`  
**Base:** `0b79ab7e470f3ac8d53de0ada340c6a08398bce3`  
**Objetivo:** fazer os geradores de catálogo executarem a implementação TypeScript canônica sem duplicar a política ou mascarar o gate.

## Problema

`gen-catalogo-storage.mjs` e `gen-tabela-estabilidade.mjs` importavam `src/core/politica.js`. Esse wrapper importa `src/core/permissions.ts`, mas os scripts eram executados diretamente com `node`. Depois da migração incremental do Permission Manager para TypeScript, os dois verificadores falhavam com `ERR_UNKNOWN_FILE_EXTENSION: .ts` antes de testar seus invariantes.

Isso era uma causa raiz compartilhada, não duas falhas de catálogo. O catálogo de eventos, a política e o conteúdo gerado continuavam sendo os mesmos; o problema estava no executor da fronteira script → módulo TypeScript.

## Decisão

Os comandos npm `gen-tabela-estabilidade` e `gen-catalogo-storage` passaram a usar o `tsx` já presente em `devDependencies`. O workflow `.github/workflows/ci.yml` passou a chamar esses scripts npm com `-- --verificar`, em vez de duplicar a chamada direta com `node`.

Não foi adicionada dependência. Não houve mudança na política, nos schemas, no README gerado, no catálogo de storage, no Event Bus ou no Permission Manager. A solução mantém um único dono para a regra e permite que o CI execute a mesma forma que o desenvolvimento local.

## Arquivos

| Arquivo | Alteração |
|---|---|
| `package.json` | Executor `tsx` para os dois geradores |
| `.github/workflows/ci.yml` | Chamada pelos scripts npm oficiais |
| `docs/v2/PHASE_01_GENERATOR_TS.md` | Este relatório |

## Validação

| Gate | Resultado |
|---|---:|
| `npm run gen-catalogo-storage -- --verificar` | Verde — 72 chaves |
| `npm run gen-tabela-estabilidade -- --verificar` | Verde |
| `npm run tipos:ts` | Verde |
| `npm run tipos:v2` | Verde |
| `npm test` | **960/960** |
| `npm run build` | Verde; warning conhecido de chunks grandes |
| `npm run v2:integracao` | **19/19** |
| `npm run smoke` | **98/98** |
| `npm run caminho-critico` | **15/15** |

A falha local do `npm run v2:runtime` por Cargo `1.75.0` e lockfile v4 não foi alterada por este marco; continua classificada como `ENV-RUST-001` e depende de toolchain compatível.

## Segurança e rollback

A mudança não altera permissões, credenciais, armazenamento, rede ou dados do operador. O rollback é simples: restaurar os quatro comandos para o executor anterior, embora isso reintroduza a falha documentada após a migração TypeScript. O commit deve ser revertido apenas se o CI demonstrar incompatibilidade com o `tsx` suportado; nesse caso, a alternativa será criar um entrypoint compilado/testado, não remover o typecheck.

## Próximo marco

Com os verificadores locais corrigidos, o próximo marco é a integração controlada de `feature/login-cadastro`: converter `src/pages/login.js` para `login.ts`, adicionar testes de autenticação e reaplicar a branch sobre a main atual. A promoção depende de Auth, RLS, redirects, smoke e gates completos.
