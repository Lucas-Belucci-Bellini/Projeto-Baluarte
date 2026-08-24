# Inventário detalhado — páginas JavaScript restantes

**SHA auditado:** `ca5b259e4dce5ac649262b9279e8c4a2d20270ef`
**Gerado em:** 2026-08-20T13:44:00-03:00
**Status:** INVENTÁRIO OPERACIONAL — zero páginas `.js` canônicas; os arquivos `.js` físicos restantes são wrappers de compatibilidade que reexportam `.ts`.

> Este relatório é gerado a partir do filesystem real. Uma página só sai da lista quando sua implementação canônica passa para `.ts`, o `.js` vira wrapper compatível e os gates comportamentais permanecem verdes.

## Resumo

Existem **0 páginas JavaScript canônicas restantes**. A onda de biblioteca, academia, ciberseg e robotica foi concluída; a próxima onda deve ser escolhida pelo risco documentado. Os wrappers de compatibilidade não são contados como dívida funcional.

| Indicador | Quantidade / resultado |
| --- | ---: |
| Páginas canônicas JavaScript restantes | **0** |
| Wrappers físicos `.js` em `src/pages/` (incluindo subpastas) | **115** |
| Implementações TypeScript em `src/pages/` (incluindo subpastas) | **123** |
| Consumers TypeScript ainda carregando wrapper de página `.js` | **0** após a Wave 43 |
| Rotas no smoke | **99/99** verdes |
| Mapa Nexus | **21/21** domínios, 0 lacunas |

## Matriz completa

| # | Arquivo | Linhas | Bytes | Grupo | Risco | Próxima ação |
| ---: | --- | ---: | ---: | --- | --- | --- |

## Critérios de saída

Cada item deve sair desta lista somente após possuir implementação canônica `.ts`, wrapper `.js`, fronteiras `.d.ts` justificadas, typecheck estrito, testes comportamentais, build, smoke e documentação de rollback. Páginas de alto risco exigem ainda contratos de lifecycle, dados, browser APIs e testes específicos antes da conversão.

## Páginas de alto risco reservadas

As páginas JARVIS, Editor, Wiki Arma 3, Arma 3 Tutorial, Vanguard, Visão, Nexus, mídia e 3D permanecem reservadas para ondas próprias. O plano de contratos de JARVIS e Editor está em [`JARVIS_EDITOR_MIGRATION_PLAN.md`](./JARVIS_EDITOR_MIGRATION_PLAN.md).

## Referências

- [`TYPESCRIPT_REMAINING.md`](./TYPESCRIPT_REMAINING.md) — roadmap agregado da migração.
- [`TYPESCRIPT_MIGRATION.md`](./TYPESCRIPT_MIGRATION.md) — histórico de ondas e gates.

