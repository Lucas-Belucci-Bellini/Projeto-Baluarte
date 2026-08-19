# TypeScript Migration — Wave 2 — Tools

## Status

`IMPLEMENTED LOCALLY — PENDING PUBLICATION`

## Base

A segunda onda foi construída sobre o SHA publicado `368dce3646061579b120dc3565d18ee5fb45ad36`.

## Objetivo

Mover oito rotas de ferramentas para suas implementações TypeScript canônicas diretamente no router V1, mantendo o lazy loading, os exports públicos e os wrappers `.js` de compatibilidade.

## Rotas migradas

| Rota | Implementação canônica | Export |
|---|---|---|
| `/baixar` | `src/pages/baixar.ts` | `baixarPage` |
| `/ferramentas` | `src/pages/ferramentas.ts` | `ferramentasPage` |
| `/json-studio` | `src/pages/json-studio.ts` | `jsonStudioPage` |
| `/qr-studio` | `src/pages/qr-studio.ts` | `qrStudioPage` |
| `/calc-cientifica` | `src/pages/calc-cientifica.ts` | `calcCientificaPage` |
| `/calc-numerica` | `src/pages/calc-numerica.ts` | `calcNumericaPage` |
| `/tabela-verdade` | `src/pages/tabela-verdade.ts` | `tabelaVerdadePage` |
| `/color-studio` | `src/pages/color-studio.ts` | `colorStudioPage` |

As oito origens correspondentes em `docs/nexus/dominios.json` foram atualizadas na mesma onda. Isso evita o erro arquitetural da primeira onda, em que o router já carregava `.ts` mas o mapa Nexus ainda declarava `.js`.

## Inventário após a onda

O diretório `src/pages` continua com **108 implementações TypeScript** e **100 wrappers ou fronteiras JavaScript**. O `src/main.js` agora possui **16 rotas carregando `.ts` diretamente** e **74 imports lazy de páginas ainda passando por `.js`**. A contagem bruta de arquivos JS não é a contagem de implementações canônicas: os wrappers permanecem para compatibilidade e só devem ser removidos depois de mapear consumidores V1, V2 e testes.

## Contratos preservados

A onda altera apenas a extensão do alvo de importação. Não altera a assinatura de `router.register`, os nomes dos exports, a política de lazy loading, as permissões, a ordem de boot ou a superfície visual das páginas. `jarvis.ts`, `editor.ts` e outras páginas de maior acoplamento continuam fora da onda até que seus contratos pesados sejam revisados.

## Validação

`npm run verificar-nexus` passou com 99 rotas, 0 lacunas e 0 divergências. `npm run tipos:ts` passou. `npm run tipos:v2` passou. `npm run v2:integracao` passou em `21/21` após limpar um processo Vite órfão da porta 4193. A bateria completa de testes, build, smoke, caminho crítico, segurança e o workflow Rust será executada antes da publicação.

## Causa ambiental separada

A primeira tentativa isolada de integração falhou esperando `.cripto-entrada` porque um Vite anterior continuava escutando a porta 4193. O processo foi removido sem tocar nos previews 4174, e a repetição limpa passou em `21/21`. Isso é uma condição ambiental conhecida, não uma falha das oito páginas migradas.

## Riscos e rollback

O risco principal é algum consumidor legado importar o wrapper `.js` e depender de uma diferença incidental. Por isso, os wrappers não são apagados. O rollback consiste em reverter as oito extensões em `src/main.js`, as oito origens em `docs/nexus/dominios.json` e este documento; nenhuma implementação TypeScript precisa ser removida.

## Próximo passo

Selecionar uma nova onda por acoplamento, atualizar router e Nexus juntos, e só depois avançar para páginas pesadas. A migração de `jarvis.ts` e `editor.ts` permanece bloqueada por análise de contratos de sessão, ferramentas, memória, editor e recursos do navegador.
