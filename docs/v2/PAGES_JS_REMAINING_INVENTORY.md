# Inventário detalhado — páginas JavaScript restantes

**SHA auditado:** `558015064ae451a672997d0721192756e8cc660d`
**Gerado em:** 2026-08-15T02:19:13.438Z
**Status:** INVENTÁRIO OPERACIONAL — páginas `.js` classificadas por implementação canônica; wrappers que apenas reexportam `.ts` foram excluídos.

> Este relatório é gerado a partir do filesystem real. Uma página só sai da lista quando sua implementação canônica passa para `.ts`, o `.js` vira wrapper compatível e os gates comportamentais permanecem verdes.

## Resumo

Existem **49 páginas JavaScript canônicas restantes**. A onda de biblioteca, academia, ciberseg e robotica foi concluída; a próxima onda deve ser escolhida pelo risco documentado. Os wrappers de compatibilidade não são contados como dívida funcional.

| Grupo | Páginas restantes |
| --- | ---: |
| Ferramentas interativas | 12 |
| IA, Nexus e memória | 10 |
| Páginas utilitárias e conteúdo | 9 |
| Mídia, rádio e DSP | 8 |
| Arma 3, 3D e visualização | 7 |
| Hubs e catálogos | 3 |

## Matriz completa

| # | Arquivo | Linhas | Bytes | Grupo | Risco | Próxima ação |
| ---: | --- | ---: | ---: | --- | --- | --- |
| 1 | `src/pages/arma3-tutorial.js` | 1376 | 76440 | Arma 3, 3D e visualização | alto | isolar dados grandes, WebGL e ciclo de vida visual |
| 2 | `src/pages/jarvis.js` | 999 | 47820 | IA, Nexus e memória | alto | tipar motores, transportes e memória antes da superfície |
| 3 | `src/pages/visao.js` | 832 | 32084 | Arma 3, 3D e visualização | alto | isolar dados grandes, WebGL e ciclo de vida visual |
| 4 | `src/pages/vanguard.js` | 822 | 39020 | Arma 3, 3D e visualização | alto | isolar dados grandes, WebGL e ciclo de vida visual |
| 5 | `src/pages/wiki-arma3.js` | 756 | 35414 | Arma 3, 3D e visualização | alto | isolar dados grandes, WebGL e ciclo de vida visual |
| 6 | `src/pages/jarvis-vision.js` | 712 | 27953 | IA, Nexus e memória | alto | tipar motores, transportes e memória antes da superfície |
| 7 | `src/pages/git-nexus-nucleo.js` | 707 | 38355 | IA, Nexus e memória | alto | tipar motores, transportes e memória antes da superfície |
| 8 | `src/pages/radar.js` | 689 | 24873 | Mídia, rádio e DSP | alto | tipar APIs de mídia, canvas e recursos externos |
| 9 | `src/pages/radio.js` | 625 | 21485 | Mídia, rádio e DSP | alto | tipar APIs de mídia, canvas e recursos externos |
| 10 | `src/pages/musicas.js` | 591 | 25622 | Mídia, rádio e DSP | alto | tipar APIs de mídia, canvas e recursos externos |
| 11 | `src/pages/mapa.js` | 533 | 21307 | Arma 3, 3D e visualização | alto | isolar dados grandes, WebGL e ciclo de vida visual |
| 12 | `src/pages/modelos-3d.js` | 459 | 25379 | Arma 3, 3D e visualização | alto | isolar dados grandes, WebGL e ciclo de vida visual |
| 13 | `src/pages/git-nexus.js` | 432 | 21928 | IA, Nexus e memória | alto | tipar motores, transportes e memória antes da superfície |
| 14 | `src/pages/media.js` | 318 | 9277 | Mídia, rádio e DSP | alto | tipar APIs de mídia, canvas e recursos externos |
| 15 | `src/pages/jarvis-dashboard.js` | 293 | 10279 | IA, Nexus e memória | alto | tipar motores, transportes e memória antes da superfície |
| 16 | `src/pages/cerebro.js` | 271 | 9749 | IA, Nexus e memória | alto | tipar motores, transportes e memória antes da superfície |
| 17 | `src/pages/videos.js` | 243 | 7521 | Mídia, rádio e DSP | alto | tipar APIs de mídia, canvas e recursos externos |
| 18 | `src/pages/arma3-extracao-painel.js` | 204 | 9225 | Arma 3, 3D e visualização | alto | isolar dados grandes, WebGL e ciclo de vida visual |
| 19 | `src/pages/memoria.js` | 189 | 8819 | IA, Nexus e memória | alto | tipar motores, transportes e memória antes da superfície |
| 20 | `src/pages/llm-lab.js` | 167 | 8660 | IA, Nexus e memória | alto | tipar motores, transportes e memória antes da superfície |
| 21 | `src/pages/git-nexus-cockpit.js` | 163 | 9233 | IA, Nexus e memória | alto | tipar motores, transportes e memória antes da superfície |
| 22 | `src/pages/memes.js` | 133 | 5041 | Mídia, rádio e DSP | alto | tipar APIs de mídia, canvas e recursos externos |
| 23 | `src/pages/filmes.js` | 126 | 3803 | Mídia, rádio e DSP | alto | tipar APIs de mídia, canvas e recursos externos |
| 24 | `src/pages/tv.js` | 106 | 3566 | Mídia, rádio e DSP | alto | tipar APIs de mídia, canvas e recursos externos |
| 25 | `src/pages/conselho.js` | 88 | 4250 | IA, Nexus e memória | alto | tipar motores, transportes e memória antes da superfície |
| 26 | `src/pages/editor.js` | 973 | 30614 | Ferramentas interativas | médio | fechar tipos de entrada, estado e dependências |
| 27 | `src/pages/logic-sim.js` | 523 | 17574 | Ferramentas interativas | médio | fechar tipos de entrada, estado e dependências |
| 28 | `src/pages/calc-numerica.js` | 509 | 15566 | Ferramentas interativas | médio | fechar tipos de entrada, estado e dependências |
| 29 | `src/pages/qr-studio.js` | 478 | 16719 | Ferramentas interativas | médio | fechar tipos de entrada, estado e dependências |
| 30 | `src/pages/jogos.js` | 443 | 19762 | Hubs e catálogos | médio | tipar catálogo, filtros e persistência local |
| 31 | `src/pages/calc-cientifica.js` | 437 | 13349 | Ferramentas interativas | médio | fechar tipos de entrada, estado e dependências |
| 32 | `src/pages/tabela-verdade.js` | 396 | 12899 | Ferramentas interativas | médio | fechar tipos de entrada, estado e dependências |
| 33 | `src/pages/regex.js` | 338 | 11298 | Ferramentas interativas | médio | fechar tipos de entrada, estado e dependências |
| 34 | `src/pages/codigo.js` | 324 | 13976 | Ferramentas interativas | médio | fechar tipos de entrada, estado e dependências |
| 35 | `src/pages/terminal.js` | 309 | 9926 | Ferramentas interativas | médio | fechar tipos de entrada, estado e dependências |
| 36 | `src/pages/aprendizado.js` | 304 | 14176 | Hubs e catálogos | médio | tipar catálogo, filtros e persistência local |
| 37 | `src/pages/graficos.js` | 269 | 8943 | Ferramentas interativas | médio | fechar tipos de entrada, estado e dependências |
| 38 | `src/pages/ocr.js` | 217 | 9286 | Ferramentas interativas | médio | fechar tipos de entrada, estado e dependências |
| 39 | `src/pages/terminal-ia.js` | 217 | 9857 | Ferramentas interativas | médio | fechar tipos de entrada, estado e dependências |
| 40 | `src/pages/mural.js` | 168 | 7368 | Hubs e catálogos | médio | tipar catálogo, filtros e persistência local |
| 41 | `src/pages/utilidades.js` | 613 | 31394 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 42 | `src/pages/esteganografia.js` | 440 | 14455 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 43 | `src/pages/perfil.js` | 430 | 20547 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 44 | `src/pages/apis.js` | 366 | 14773 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 45 | `src/pages/morse.js` | 337 | 11688 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 46 | `src/pages/color-studio.js` | 320 | 11599 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 47 | `src/pages/fft.js` | 303 | 9939 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 48 | `src/pages/ia-proprietaria.js` | 289 | 10459 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 49 | `src/pages/batalha-naval.js` | 253 | 10301 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |

## Critérios de saída

Cada item deve sair desta lista somente após possuir implementação canônica `.ts`, wrapper `.js`, fronteiras `.d.ts` justificadas, typecheck estrito, testes comportamentais, build, smoke e documentação de rollback. Páginas de alto risco exigem ainda contratos de lifecycle, dados, browser APIs e testes específicos antes da conversão.

## Páginas de alto risco reservadas

As páginas JARVIS, Editor, Wiki Arma 3, Arma 3 Tutorial, Vanguard, Visão, Nexus, mídia e 3D permanecem reservadas para ondas próprias. O plano de contratos de JARVIS e Editor está em [`JARVIS_EDITOR_MIGRATION_PLAN.md`](./JARVIS_EDITOR_MIGRATION_PLAN.md).

## Referências

- [`TYPESCRIPT_REMAINING.md`](./TYPESCRIPT_REMAINING.md) — roadmap agregado da migração.
- [`TYPESCRIPT_MIGRATION.md`](./TYPESCRIPT_MIGRATION.md) — histórico de ondas e gates.

