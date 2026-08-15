# Inventário detalhado — páginas JavaScript restantes

**SHA auditado:** `603bd6002ccc2030d0a0311958516fc20de69552`
**Gerado em:** 2026-08-15T04:44:55.249Z
**Status:** INVENTÁRIO OPERACIONAL — páginas `.js` classificadas por implementação canônica; wrappers que apenas reexportam `.ts` foram excluídos.

> Este relatório é gerado a partir do filesystem real. Uma página só sai da lista quando sua implementação canônica passa para `.ts`, o `.js` vira wrapper compatível e os gates comportamentais permanecem verdes.

## Resumo

Existem **9 páginas JavaScript canônicas restantes**. A onda de biblioteca, academia, ciberseg e robotica foi concluída; a próxima onda deve ser escolhida pelo risco documentado. Os wrappers de compatibilidade não são contados como dívida funcional.

| Grupo | Páginas restantes |
| --- | ---: |
| Arma 3, 3D e visualização | 4 |
| IA, Nexus e memória | 3 |
| Mídia, rádio e DSP | 2 |

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
| 8 | `src/pages/radio.js` | 625 | 21485 | Mídia, rádio e DSP | alto | tipar APIs de mídia, canvas e recursos externos |
| 9 | `src/pages/musicas.js` | 591 | 25622 | Mídia, rádio e DSP | alto | tipar APIs de mídia, canvas e recursos externos |

## Critérios de saída

Cada item deve sair desta lista somente após possuir implementação canônica `.ts`, wrapper `.js`, fronteiras `.d.ts` justificadas, typecheck estrito, testes comportamentais, build, smoke e documentação de rollback. Páginas de alto risco exigem ainda contratos de lifecycle, dados, browser APIs e testes específicos antes da conversão.

## Páginas de alto risco reservadas

As páginas JARVIS, Editor, Wiki Arma 3, Arma 3 Tutorial, Vanguard, Visão, Nexus, mídia e 3D permanecem reservadas para ondas próprias. O plano de contratos de JARVIS e Editor está em [`JARVIS_EDITOR_MIGRATION_PLAN.md`](./JARVIS_EDITOR_MIGRATION_PLAN.md).

## Referências

- [`TYPESCRIPT_REMAINING.md`](./TYPESCRIPT_REMAINING.md) — roadmap agregado da migração.
- [`TYPESCRIPT_MIGRATION.md`](./TYPESCRIPT_MIGRATION.md) — histórico de ondas e gates.

