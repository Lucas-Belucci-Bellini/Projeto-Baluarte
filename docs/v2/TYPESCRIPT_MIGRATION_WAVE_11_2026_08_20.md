# TypeScript Migration — Wave 11 — Military Content Expansion

## Status

`PUBLISHED — REMOTE CI GREEN`

## Base

A onda foi construída localmente sobre o SHA `52b476d3`, que contém a Wave 10 documentada e publicada no repositório. A entrega final foi publicada no SHA `f2474569d1b5e667591f20f42042d79bf76e881c`.

## Objetivo

Continuar a migração de páginas militares informativas de baixo acoplamento, sem promover superfícies que ainda atravessam papéis, WebGL, dados remotos ou contratos administrativos.

## Rotas preparadas localmente

| Rota | Implementação TypeScript | Export |
|---|---|---|
| `/militar` | `src/pages/militar.ts` | `militarPage` |
| `/orcamentos-militares` | `src/pages/orcamentos-militares.ts` | `orcamentosMilitaresPage` |
| `/arsenal-expandido` | `src/pages/arsenal-expandido.ts` | `arsenalExpandidoPage` |
| `/armas-por-pais` | `src/pages/armas-por-pais.ts` | `armasPorPaisPage` |
| `/batalhas-historicas` | `src/pages/batalhas-historicas.ts` | `batalhasHistoricasPage` |
| `/enciclopedia-militar` | `src/pages/enciclopedia-militar.ts` | `enciclopediaMilitarPage` |

`src/main.js` e `docs/nexus/dominios.json` foram atualizados localmente no mesmo changeset lógico.

## Escopo preservado

A auditoria deixou fora `/tecnologia-militar` e `/guerras-conflitos` por referências a papéis, `/modelos-3d` por WebGL e contrato de autorização, `/arsenal` por dados remotos, e `/wiki-arma3` por superfície extensa com papel administrativo. Essas páginas não foram alteradas.

## Validação local

`npm run verificar-nexus` passou com 99 rotas, 0 lacunas e 0 divergências. `npm run tipos:ts` passou. `npm run tipos:v2` passou. `npm test` passou com 1085/1085. `npm run build` passou com os avisos conhecidos de chunks grandes. `npm run v2:integracao` passou em 21/21 depois de remover os previews Vite órfãos em 4193/4194. `npm run smoke` passou em 99/99. `npm run caminho-critico` passou em 15/15. Os contratos direcionados passaram em 22/22. `git diff --check` passou. O gate local `npm run v2:runtime` permanece limitado pelo Cargo 1.75.0 e `edition2024`.

## Publicação

A tentativa inicial de monitoramento encontrou uma falha transitória de autenticação no cliente GitHub, mas a autenticação de transporte Git permaneceu funcional. A Wave 11 foi publicada diretamente no `main` no SHA `f2474569d1b5e667591f20f42042d79bf76e881c`, sem force push. Os oito workflows remotos passaram: CI, Core CI, V2 Core, V2 Runtime, V2 Validation, Vigia das rotas, Arma 3 Data CI e CodeQL.

## Riscos e rollback

Nenhuma página JavaScript foi removida e nenhum dado externo foi alterado. Para rollback local, reverter as seis extensões no router, as seis origens no Nexus e este documento. O próximo changeset documental deve repetir `git status`, `git fetch origin main`, integrar qualquer avanço remoto, executar os gates aplicáveis e publicar sem force push.

## Próximo passo

Continuar com `/tecnologia-militar`, `/guerras-conflitos`, `/arsenal` e `/wiki-arma3` somente após auditorias específicas de seus contratos.
