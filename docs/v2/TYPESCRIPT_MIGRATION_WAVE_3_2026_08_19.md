# TypeScript Migration — Wave 3 — Utilities

## Status

`IMPLEMENTED LOCALLY — PENDING PUBLICATION`

## Base

A terceira onda foi construída sobre o SHA publicado `953c96cec69a00e9dd99e55136d9f6e78de7a127`.

## Objetivo

Mover oito rotas de utilitários para implementações TypeScript canônicas diretamente no router V1, preservando lazy loading, exports e wrappers JavaScript de compatibilidade.

## Rotas migradas

| Rota | Implementação canônica | Export |
|---|---|---|
| `/esteganografia` | `src/pages/esteganografia.ts` | `esteganografiaPage` |
| `/graficos` | `src/pages/graficos.ts` | `graficosPage` |
| `/regex` | `src/pages/regex.ts` | `regexPage` |
| `/terminal` | `src/pages/terminal.ts` | `terminalPage` |
| `/morse` | `src/pages/morse.ts` | `morsePage` |
| `/tabela-periodica` | `src/pages/tabela-periodica.ts` | `tabelaPeriodicaPage` |
| `/guia-pc` | `src/pages/guia-pc.ts` | `guiaPcPage` |
| `/ocr` | `src/pages/ocr.ts` | `ocrPage` |

As oito origens correspondentes em `docs/nexus/dominios.json` foram atualizadas no mesmo changeset. `terminal-ia` não foi alterado: ele continua sendo uma rota Nexus separada, com contrato próprio.

## Inventário após a onda

O diretório `src/pages` mantém **108 implementações TypeScript** e **100 wrappers ou fronteiras JavaScript**. O `src/main.js` agora possui **24 rotas carregando `.ts` diretamente** e **66 imports lazy de páginas ainda passando por `.js`**. A contagem bruta de JS não representa implementações canônicas restantes; os wrappers continuam sendo mantidos até mapear todos os consumidores V1/V2.

## Contratos preservados

A onda altera somente o alvo de importação e a origem registrada no mapa Nexus. Não altera assinaturas de `router.register`, nomes de exports, permissões, lifecycle, ordem de boot ou superfície visual. `jarvis.ts`, `editor.ts`, módulos militares pesados e páginas com contratos de sessão complexos permanecem fora da onda.

## Validação local

`npm run verificar-nexus` passou com 99 rotas, 0 lacunas e 0 divergências. `npm run tipos:ts` passou. `npm run tipos:v2` passou. `npm run v2:integracao` passou em `21/21` após limpar um Vite órfão da porta 4193. A bateria completa de testes, build, smoke, caminho crítico, segurança e o workflow Rust será executada antes da publicação.

## Causa ambiental separada

A primeira tentativa isolada de integração falhou no campo `.cripto-entrada` porque um processo Vite anterior continuava ocupando a porta 4193. O processo foi removido sem tocar nos previews 4174, e a repetição limpa passou em `21/21`. Isso não foi causado pelas oito páginas migradas.

## Riscos e rollback

O risco principal é um consumidor legado depender diretamente de um wrapper JS. Por isso, nenhum wrapper foi apagado. O rollback consiste em reverter as oito extensões no `src/main.js`, as oito origens no `docs/nexus/dominios.json` e este documento; nenhuma implementação TypeScript precisa ser removida.

## Próximo passo

Selecionar a próxima onda por acoplamento controlado. As páginas pesadas `jarvis.ts` e `editor.ts` continuam bloqueadas para migração de entrada até a revisão dos contratos de sessão, ferramentas, memória e recursos do navegador.
