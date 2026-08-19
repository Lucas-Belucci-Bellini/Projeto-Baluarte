# TypeScript Migration — Wave 5 — Media and Navigation

## Status

`PUBLISHED ON MAIN`

## Base

A quinta onda foi construída sobre o SHA publicado `c8847752d4519e670f8a007ab7f0e7b13e2b9083`, que também contém o merge seguro do JARVIS V7 remoto.

## Objetivo

Mover oito páginas de mídia e navegação para implementações TypeScript canônicas diretamente no router V1, preservando lazy loading, exports, wrappers JS e o mapa Nexus.

## Rotas migradas

| Rota | Implementação canônica | Export |
|---|---|---|
| `/media` | `src/pages/media.ts` | `mediaPage` |
| `/videos` | `src/pages/videos.ts` | `videosPage` |
| `/tv` | `src/pages/tv.ts` | `tvPage` |
| `/radar` | `src/pages/radar.ts` | `radarPage` |
| `/find` | `src/pages/find.ts` | `findPage` |
| `/triangulacao` | `src/pages/triangulacao.ts` | `triangulacaoPage` |
| `/sobre` | `src/pages/sobre.ts` | `sobrePage` |
| `/mapa` | `src/pages/mapa.ts` | `mapaPage` |

`/geo` e `src/pages/geopulse.js` ficaram fora desta onda. Durante a validação, o mapa Nexus foi corrigido para não declarar `geopulse.ts` antes de o router migrar essa rota. Essa foi uma divergência de seleção, detectada e corrigida localmente antes da publicação; não foi mascarada.

## Inventário após a onda

O diretório `src/pages` mantém **108 implementações TypeScript** e **100 wrappers ou fronteiras JavaScript**. O `src/main.js` agora possui **38 rotas carregando `.ts` diretamente** e **52 imports lazy de páginas ainda passando por `.js`**. A contagem de wrappers não representa sozinha a dívida de implementação: os wrappers continuam para compatibilidade enquanto houver consumidores V1/V2 não mapeados.

## Contratos preservados

A onda altera somente o alvo de importação e as origens do mapa Nexus. Não altera assinatura de `router.register`, exports, permissões, lifecycle, ordem de boot, contratos de rede ou superfícies visuais. Páginas com integração externa mais sensível ainda devem ser validadas por seus próprios contratos antes de remover wrappers.

## Validação local

`npm run verificar-nexus` passou com 99 rotas, 0 lacunas e 0 divergências. `npm run tipos:ts` passou. `npm run tipos:v2` passou. `npm run v2:integracao` passou em `21/21`. O primeiro Nexus check encontrou duas divergências de seleção (`geopulse.js` e `sobre.ts`); o estado final foi corrigido para as oito rotas efetivamente migradas e voltou a passar.

A bateria completa de testes, build, smoke, caminho crítico, segurança e o workflow Rust será executada antes da publicação.

## Riscos e rollback

O risco principal é um consumidor legado depender diretamente de um wrapper JS ou de uma página com integração externa. Nenhum wrapper foi removido. O rollback consiste em reverter as oito extensões em `src/main.js`, as oito origens no `docs/nexus/dominios.json` e este documento; nenhuma implementação TypeScript precisa ser removida.

## Próximo passo

Selecionar uma onda com páginas ainda menores ou revisar `geopulse.ts` e demais integrações externas. `jogos.ts`, `batalha-naval.ts`, `visao.ts`, `jarvis.ts` e `editor.ts` continuam fora até a análise individual de seus contratos maiores.
