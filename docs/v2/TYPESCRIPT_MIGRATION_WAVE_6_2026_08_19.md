# TypeScript Migration — Wave 6 — Audio

## Status

`IMPLEMENTED LOCALLY — PENDING PUBLICATION`

## Base

A sexta onda foi construída sobre o SHA publicado `e61a786f9393ea71547f7be54272654eabc93285`.

## Objetivo

Mover as três páginas de áudio para implementações TypeScript canônicas diretamente no router V1, preservando lazy loading, exports, wrappers JS e o mapa Nexus.

## Rotas migradas

| Rota | Implementação canônica | Export |
|---|---|---|
| `/fft` | `src/pages/fft.ts` | `fftPage` |
| `/radio` | `src/pages/radio.ts` | `radioPage` |
| `/musicas` | `src/pages/musicas.ts` | `musicasPage` |

As três origens correspondentes em `docs/nexus/dominios.json` foram atualizadas no mesmo changeset. Os motores de áudio, APIs de rádio, dados musicais e estilos não foram reescritos nesta onda; somente a fronteira de carregamento da página foi movida para a implementação TypeScript já existente.

## Contratos preservados

A onda mantém a assinatura de `router.register`, os nomes dos exports, o lazy loading, o lifecycle de saída e as permissões existentes. A presença musical do JARVIS e a integração Spotify continuam sendo responsabilidades separadas de `src/utils/jarvis-music-presence.js` e `src/utils/jarvis-spotify-session.js`; não foram tornadas dependência obrigatória do boot V1.

## Inventário após a onda

O diretório `src/pages` mantém **108 implementações TypeScript** e **100 wrappers ou fronteiras JavaScript**. O `src/main.js` passa a possuir **41 rotas carregando `.ts` diretamente** e **49 imports lazy de páginas ainda passando por `.js`**. A contagem de wrappers não deve ser interpretada como contagem direta de implementações não migradas.

## Validação direcionada

`npm run verificar-nexus` passou com 99 rotas, 0 lacunas e 0 divergências. `npm run tipos:ts` passou. `npm run tipos:v2` passou. `npm run v2:integracao` passou em `21/21`. A bateria completa de testes, build, smoke, caminho crítico, segurança e workflow Rust será executada antes da publicação.

## Riscos e rollback

O risco principal é um consumidor legado depender do wrapper JS ou de efeitos colaterais de um módulo de áudio. Nenhum wrapper foi removido e nenhum motor externo foi alterado. O rollback consiste em reverter as três extensões no `src/main.js`, as três origens em `docs/nexus/dominios.json` e este documento.

## Próximo passo

Selecionar páginas de economia, perfil ou conteúdo por baixo acoplamento. Páginas pesadas como `jogos.ts`, `batalha-naval.ts`, `visao.ts`, `jarvis.ts` e `editor.ts` continuam fora até análise individual de seus contratos.
