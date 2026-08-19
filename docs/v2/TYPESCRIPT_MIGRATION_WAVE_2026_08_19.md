# TypeScript Migration — Wave 2026-08-19

## Status

`IMPLEMENTED LOCALLY — PENDING PUBLICATION`

## Base

Esta onda foi construída sobre o SHA `d0ecd6d85a55205ffade67bbeb0d4f45c2a19b0c` do `main`.

## Objetivo

Mover a resolução de oito rotas da V1 diretamente para as implementações TypeScript canônicas, mantendo os wrappers `.js` como fronteira de compatibilidade para consumidores legados. A onda não remove arquivos nem altera a API pública das páginas; ela reduz o caminho de produção que ainda passa pelo wrapper JavaScript.

## Páginas migradas nesta onda

| Rota | Implementação agora carregada | Export preservado |
|---|---|---|
| `/git-helper` | `src/pages/git-helper.ts` | `gitHelperPage` |
| `/simbolos` | `src/pages/simbolos.ts` | `simbolosPage` |
| `/biblioteca` | `src/pages/biblioteca.ts` | `bibliotecaPage` |
| `/ciberseg` | `src/pages/ciberseg.ts` | `cibersegPage` |
| `/academia` | `src/pages/academia.ts` | `academiaPage` |
| `/robotica` | `src/pages/robotica.ts` | `roboticaPage` |
| `/dolar` | `src/pages/dolar.ts` | `dolarPage` |
| `/gerar-codigo` | `src/pages/gerar-codigo.ts` | `gerarCodigoPage` |

O lazy loading, o nome dos exports e o registro do router não foram alterados. Os arquivos `.js` correspondentes continuam disponíveis como wrappers de compatibilidade e não devem ser removidos enquanto ainda houver consumidores legados, módulos V2 ou testes que dependam deles.

## Inventário atualizado

O diretório `src/pages` possui atualmente **108 implementações TypeScript** e **100 arquivos JavaScript**. Os 100 arquivos JavaScript restantes são wrappers de compatibilidade ou fronteiras legadas; não representam necessariamente 100 implementações canônicas ainda escritas em JavaScript. No `src/main.js`, havia 90 imports lazy de páginas: após esta onda, **8 rotas carregam `.ts` diretamente e 82 ainda carregam wrappers `.js`**.

A contagem de wrappers deve ser acompanhada separadamente da contagem de implementações. O objetivo da próxima onda é migrar mais referências de produção para `.ts`, não apagar wrappers por contagem bruta e quebrar importadores V1/V2.

## Validação

`npm run tipos:ts` passou. `npm run tipos:v2` passou. `npm run v2:integracao` passou em `21/21`, incluindo boot real V2, 19 rotas no router V1, renderização nativa, WebGL, permissões e ausência de erros JavaScript. A bateria completa de testes, build, smoke, caminho crítico e o workflow Rust será executada antes da publicação.

## Riscos e rollback

O principal risco é um consumidor importar diretamente o wrapper `.js` e depender de uma diferença de resolução ou de um export não declarado. Por isso, os wrappers permanecem no lugar. O rollback é reverter as oito substituições no `src/main.js` e este documento; nenhuma implementação TypeScript precisa ser apagada.

## Próximo passo

Selecionar a próxima onda por baixo acoplamento, atualizar seus imports de produção para `.ts`, executar a mesma matriz de gates e só então considerar a remoção de wrappers que não possuam consumidores. As páginas pesadas `jarvis.ts` e `editor.ts` continuam fora desta onda por exigirem análise de contrato e fronteira de recursos própria.
