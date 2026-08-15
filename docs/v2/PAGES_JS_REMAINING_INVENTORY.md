# Inventário detalhado — páginas JavaScript restantes

**SHA auditado:** `6204dd7283498434c6fed020d90b3e5d35a9763d`
**Gerado em:** 2026-08-15T04:04:50.582Z
**Status:** INVENTÁRIO OPERACIONAL — páginas `.js` classificadas por implementação canônica; wrappers que apenas reexportam `.ts` foram excluídos.

> Este relatório é gerado a partir do filesystem real. Uma página só sai da lista quando sua implementação canônica passa para `.ts`, o `.js` vira wrapper compatível e os gates comportamentais permanecem verdes.

## Resumo

Existem **25 páginas JavaScript canônicas restantes**. A onda de biblioteca, academia, ciberseg e robotica foi concluída; a próxima onda deve ser escolhida pelo risco documentado. Os wrappers de compatibilidade não são contados como dívida funcional.

| Grupo | Páginas restantes |
| --- | ---: |
| IA, Nexus e memória | 10 |
| Mídia, rádio e DSP | 8 |
| Arma 3, 3D e visualização | 7 |

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

## Critérios de saída

Cada item deve sair desta lista somente após possuir implementação canônica `.ts`, wrapper `.js`, fronteiras `.d.ts` justificadas, typecheck estrito, testes comportamentais, build, smoke e documentação de rollback. Páginas de alto risco exigem ainda contratos de lifecycle, dados, browser APIs e testes específicos antes da conversão.

## Páginas de alto risco reservadas

As páginas JARVIS, Editor, Wiki Arma 3, Arma 3 Tutorial, Vanguard, Visão, Nexus, mídia e 3D permanecem reservadas para ondas próprias. O plano de contratos de JARVIS e Editor está em [`JARVIS_EDITOR_MIGRATION_PLAN.md`](./JARVIS_EDITOR_MIGRATION_PLAN.md).

## Referências

- [`TYPESCRIPT_REMAINING.md`](./TYPESCRIPT_REMAINING.md) — roadmap agregado da migração.
- [`TYPESCRIPT_MIGRATION.md`](./TYPESCRIPT_MIGRATION.md) — histórico de ondas e gates.

