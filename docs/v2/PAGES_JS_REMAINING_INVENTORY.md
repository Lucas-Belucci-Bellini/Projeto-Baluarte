# Inventário detalhado — páginas JavaScript restantes

**SHA auditado:** `6768d074b7d680421480d2eca4acaad34168c15f`
**Gerado em:** 2026-08-14T23:37:22.297Z
**Status:** INVENTÁRIO OPERACIONAL — páginas `.js` classificadas por implementação canônica; wrappers que apenas reexportam `.ts` foram excluídos.

> Este relatório é gerado a partir do filesystem real. Uma página só sai da lista quando sua implementação canônica passa para `.ts`, o `.js` vira wrapper compatível e os gates comportamentais permanecem verdes.

## Resumo

Existem **91 páginas JavaScript canônicas restantes**. A onda de simbolos, gerar-codigo, git-helper e dolar foi concluída; a próxima onda deve ser escolhida pelo risco documentado. Os wrappers de compatibilidade não são contados como dívida funcional.

| Grupo | Páginas restantes |
| --- | ---: |
| Páginas utilitárias e conteúdo | 40 |
| Ferramentas interativas | 12 |
| Hubs e catálogos | 11 |
| IA, Nexus e memória | 10 |
| Mídia, rádio e DSP | 8 |
| Arma 3, 3D e visualização | 7 |
| Conteúdo militar | 3 |

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
| 28 | `src/pages/biblioteca.js` | 521 | 17630 | Hubs e catálogos | médio | tipar catálogo, filtros e persistência local |
| 29 | `src/pages/calc-numerica.js` | 509 | 15566 | Ferramentas interativas | médio | fechar tipos de entrada, estado e dependências |
| 30 | `src/pages/qr-studio.js` | 478 | 16719 | Ferramentas interativas | médio | fechar tipos de entrada, estado e dependências |
| 31 | `src/pages/jogos.js` | 443 | 19762 | Hubs e catálogos | médio | tipar catálogo, filtros e persistência local |
| 32 | `src/pages/calc-cientifica.js` | 437 | 13349 | Ferramentas interativas | médio | fechar tipos de entrada, estado e dependências |
| 33 | `src/pages/tabela-verdade.js` | 396 | 12899 | Ferramentas interativas | médio | fechar tipos de entrada, estado e dependências |
| 34 | `src/pages/regex.js` | 338 | 11298 | Ferramentas interativas | médio | fechar tipos de entrada, estado e dependências |
| 35 | `src/pages/codigo.js` | 324 | 13976 | Ferramentas interativas | médio | fechar tipos de entrada, estado e dependências |
| 36 | `src/pages/terminal.js` | 309 | 9926 | Ferramentas interativas | médio | fechar tipos de entrada, estado e dependências |
| 37 | `src/pages/aprendizado.js` | 304 | 14176 | Hubs e catálogos | médio | tipar catálogo, filtros e persistência local |
| 38 | `src/pages/graficos.js` | 269 | 8943 | Ferramentas interativas | médio | fechar tipos de entrada, estado e dependências |
| 39 | `src/pages/academia.js` | 247 | 8503 | Hubs e catálogos | médio | tipar catálogo, filtros e persistência local |
| 40 | `src/pages/ciberseg.js` | 231 | 7462 | Hubs e catálogos | médio | tipar catálogo, filtros e persistência local |
| 41 | `src/pages/modpack.js` | 224 | 9945 | Hubs e catálogos | médio | tipar catálogo, filtros e persistência local |
| 42 | `src/pages/ocr.js` | 217 | 9286 | Ferramentas interativas | médio | fechar tipos de entrada, estado e dependências |
| 43 | `src/pages/terminal-ia.js` | 217 | 9857 | Ferramentas interativas | médio | fechar tipos de entrada, estado e dependências |
| 44 | `src/pages/mural.js` | 168 | 7368 | Hubs e catálogos | médio | tipar catálogo, filtros e persistência local |
| 45 | `src/pages/zomboid-admin.js` | 129 | 5694 | Hubs e catálogos | médio | tipar catálogo, filtros e persistência local |
| 46 | `src/pages/robotica.js` | 107 | 3541 | Hubs e catálogos | médio | tipar catálogo, filtros e persistência local |
| 47 | `src/pages/zomboid.js` | 73 | 2881 | Hubs e catálogos | médio | tipar catálogo, filtros e persistência local |
| 48 | `src/pages/projetos.js` | 61 | 2531 | Hubs e catálogos | médio | tipar catálogo, filtros e persistência local |
| 49 | `src/pages/utilidades.js` | 613 | 31394 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 50 | `src/pages/esteganografia.js` | 440 | 14455 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 51 | `src/pages/perfil.js` | 430 | 20547 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 52 | `src/pages/apis.js` | 366 | 14773 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 53 | `src/pages/morse.js` | 337 | 11688 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 54 | `src/pages/color-studio.js` | 320 | 11599 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 55 | `src/pages/calculadoras/engenharia.js` | 319 | 12387 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 56 | `src/pages/fft.js` | 303 | 9939 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 57 | `src/pages/ia-proprietaria.js` | 289 | 10459 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 58 | `src/pages/calculadoras/financeira.js` | 278 | 9585 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 59 | `src/pages/calculadoras/conversores.js` | 270 | 9883 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 60 | `src/pages/calculadoras/saude.js` | 269 | 10312 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 61 | `src/pages/batalha-naval.js` | 253 | 10301 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 62 | `src/pages/economia.js` | 248 | 8251 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 63 | `src/pages/diagnostico.js` | 220 | 9304 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 64 | `src/pages/portas.js` | 213 | 8409 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 65 | `src/pages/json-studio.js` | 211 | 7148 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 66 | `src/pages/poder-militar.js` | 205 | 7752 | Conteúdo militar | baixo | tipar dados estáticos e preservar rota |
| 67 | `src/pages/baixar.js` | 201 | 9296 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 68 | `src/pages/geopulse.js` | 199 | 8125 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 69 | `src/pages/calculadoras/estatistica.js` | 195 | 7119 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 70 | `src/pages/triangulacao.js` | 173 | 7442 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 71 | `src/pages/shadow.js` | 170 | 6837 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 72 | `src/pages/orcamentos-militares.js` | 166 | 7834 | Conteúdo militar | baixo | tipar dados estáticos e preservar rota |
| 73 | `src/pages/guia-pc.js` | 163 | 6032 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 74 | `src/pages/tabela-periodica.js` | 162 | 5848 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 75 | `src/pages/cripto/otp.js` | 161 | 5307 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 76 | `src/pages/comms.js` | 147 | 5521 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 77 | `src/pages/militar.js` | 145 | 8540 | Conteúdo militar | baixo | tipar dados estáticos e preservar rota |
| 78 | `src/pages/cripto/index.js` | 123 | 3807 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 79 | `src/pages/cripto/aes.js` | 122 | 4128 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 80 | `src/pages/seguranca.js` | 120 | 4757 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 81 | `src/pages/git-nexus-gate.js` | 117 | 5572 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 82 | `src/pages/calculadoras/index.js` | 116 | 3430 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 83 | `src/pages/banco.js` | 115 | 4932 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 84 | `src/pages/cripto/base.js` | 101 | 3334 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 85 | `src/pages/_placeholder.js` | 93 | 3129 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 86 | `src/pages/cripto/morse.js` | 88 | 3272 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 87 | `src/pages/arsenal-expandido.js` | 84 | 2933 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 88 | `src/pages/cripto/caesar.js` | 80 | 2610 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 89 | `src/pages/cripto/vigenere.js` | 74 | 2555 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 90 | `src/pages/cripto/hash.js` | 63 | 2099 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |
| 91 | `src/pages/cripto/atbash.js` | 58 | 1831 | Páginas utilitárias e conteúdo | baixo | tipar estado local, DOM e dependências diretas |

## Critérios de saída

Cada item deve sair desta lista somente após possuir implementação canônica `.ts`, wrapper `.js`, fronteiras `.d.ts` justificadas, typecheck estrito, testes comportamentais, build, smoke e documentação de rollback. Páginas de alto risco exigem ainda contratos de lifecycle, dados, browser APIs e testes específicos antes da conversão.

## Páginas de alto risco reservadas

As páginas JARVIS, Editor, Wiki Arma 3, Arma 3 Tutorial, Vanguard, Visão, Nexus, mídia e 3D permanecem reservadas para ondas próprias. O plano de contratos de JARVIS e Editor está em [`JARVIS_EDITOR_MIGRATION_PLAN.md`](./JARVIS_EDITOR_MIGRATION_PLAN.md).

## Referências

- [`TYPESCRIPT_REMAINING.md`](./TYPESCRIPT_REMAINING.md) — roadmap agregado da migração.
- [`TYPESCRIPT_MIGRATION.md`](./TYPESCRIPT_MIGRATION.md) — histórico de ondas e gates.

