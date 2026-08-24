# TypeScript Migration — Wave 4 — Content

## Status

`IMPLEMENTED LOCALLY — PENDING PUBLICATION`

## Base

A quarta onda foi construída sobre o SHA publicado `3efa7882ffd5008dcee147e232f17cc4c1b5005d`.

## Objetivo

Mover seis páginas de conteúdo de baixo acoplamento para implementações TypeScript canônicas diretamente no router V1, mantendo lazy loading, exports públicos, wrappers JavaScript e o mapa Nexus sincronizado.

## Rotas migradas

| Rota | Implementação canônica | Export |
|---|---|---|
| `/filmes` | `src/pages/filmes.ts` | `filmesPage` |
| `/memes` | `src/pages/memes.ts` | `memesPage` |
| `/universo` | `src/pages/universo.ts` | `universoPage` |
| `/zomboid` | `src/pages/zomboid.ts` | `zomboidPage` |
| `/zomboid-admin` | `src/pages/zomboid-admin.ts` | `zomboidAdminPage` |
| `/modpack` | `src/pages/modpack.ts` | `modpackPage` |

As seis origens foram atualizadas em `docs/nexus/dominios.json` na mesma onda. As páginas maiores `jogos.ts` e `batalha-naval.ts` ficaram fora desta rodada para permitir revisão isolada de seus contratos, dados e comportamento antes da mudança de entrada.

## Inventário após a onda

O diretório `src/pages` mantém **108 implementações TypeScript** e **100 wrappers ou fronteiras JavaScript**. O `src/main.js` agora possui **30 rotas carregando `.ts` diretamente** e **60 imports lazy de páginas ainda passando por `.js`**. O número bruto de wrappers não deve ser tratado como número de implementações canônicas pendentes.

## Contratos preservados

A onda altera somente o alvo de importação e as origens do mapa Nexus. Não altera assinaturas de `router.register`, exports, permissões, lifecycle, ordem de boot, dados de conteúdo ou superfície visual. `jarvis.ts`, `editor.ts` e páginas militares pesadas continuam fora da migração direta até revisão específica.

## Validação local

`npm run verificar-nexus` passou com 99 rotas, 0 lacunas e 0 divergências. `npm run tipos:ts` passou. `npm run tipos:v2` passou. `npm run v2:integracao` passou em `21/21` depois de remover um processo Vite órfão da porta 4193. A bateria completa de testes, build, smoke, caminho crítico, segurança e workflow Rust será executada antes da publicação.

## Causa ambiental separada

A primeira integração falhou esperando `.cripto-entrada` porque um Vite órfão ocupava a porta 4193. O processo foi removido sem tocar nos previews 4174, e a execução limpa passou em `21/21`. A falha não foi causada pelas seis páginas migradas.

## Riscos e rollback

O risco principal é um consumidor legado depender do wrapper `.js`. Nenhum wrapper foi removido. O rollback consiste em reverter as seis extensões no `src/main.js`, as seis origens em `docs/nexus/dominios.json` e este documento; nenhuma implementação TypeScript precisa ser apagada.

## Próximo passo

Revisar páginas de conteúdo maiores, começando por `jogos.ts` e `batalha-naval.ts`, ou selecionar outra onda de baixo acoplamento. As páginas `jarvis.ts` e `editor.ts` continuam bloqueadas até a revisão dos contratos pesados de sessão, ferramentas, memória e editor.
