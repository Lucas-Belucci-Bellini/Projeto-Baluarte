# Piloto Individual — Editor de Código

**Status:** `CANDIDATE ONLY — NO PUBLIC SIDEBAR PROMOTION`

**Data:** 20 de agosto de 2026

**Escopo:** alinhar a metadata de domínio do módulo `editor` com o catálogo V1 e provar que ele pode ser candidato à promoção somente quando health, deep link e fallback estiverem válidos.

## Alteração mínima

O manifesto `v2/modules/editor/module.js` passou a declarar `nav.section: 'Código & Dev'`, igual ao domínio do item `/editor` em `src/layout/sidebar.ts`. O path, label `Editor de Código`, ícone `⌨`, estabilidade `beta`, permissões, storage e ordem operacional não foram alterados.

A alteração não promove o editor à sidebar Registry em produção. Ela apenas remove uma divergência de domínio para que o reconciliador UI-04 classifique o path como `aligned` quando as demais condições forem verdadeiras.

## Critérios de candidatura

| Critério | Resultado no harness |
|---|---|
| Path `/editor` compartilhado por Registry e V1 | verde |
| Label igual a `Editor de Código` | verde |
| Ícone igual a `⌨` | verde |
| Domínio igual a `Código & Dev` | verde |
| Health do Runtime Registry | `healthy` |
| Fonte de health | `runtime-registry` |
| Deep link no router real | `verified` |
| Fallback | `v1-preserved` |
| Ação de usuário normal | `preserve-current-surface` |
| Promoção automática da sidebar | não realizada |

O resultado é `promotion-candidate`, não `promoted`. O candidato só poderá mudar a UI pública depois de uma etapa posterior que valide Auth/claims, disponibilidade server-side, observabilidade de produção, tratamento de deep link, acessibilidade e rollback.

## O que permanece bloqueado

Os módulos `/militar`, `/cripto`, `/briefing` e `/visor3d` continuam sem promoção automática. Divergências de metadados, módulos Registry-only e decisões de health não são corrigidos ou escondidos pelo cliente. A estabilidade `beta` do editor também não é usada como health; a candidatura depende do retrato do Runtime Registry.

O shell V1, `renderSidebar()`, `src/main.js`, o router público, Auth, RLS, Supabase, Billing e a lista de permissões não foram alterados neste piloto.

## Testes

A suíte UI passou com `12/12` testes. O gate browser V2 passou com `23/23`, incluindo a asserção de que existe exatamente um candidato, `/editor`, e que todos os cinco módulos continuam com ação de usuário normal `preserve-current-surface`.

Os testes demonstram três propriedades separadas:

1. o editor está alinhado no catálogo;
2. health e deep link são requisitos independentes da estabilidade;
3. candidatura não equivale a alteração visual ou autorização.

## Rollback

O rollback é o revert do commit que altera apenas a seção `nav` do manifesto do editor e as asserções/documentação do piloto. Nenhum dado remoto, rota V1 ou configuração de produção é removido.

## Próximo passo

Antes de qualquer promoção visual, deve ser criada uma superfície operacional de observação com autorização server-side, incluindo o retrato de health, eventos de mudança de modo, deep link efetivamente testado em produção e plano de retorno à sidebar V1. O candidato editor não deve ser promovido apenas porque os gates do harness estão verdes.

## Referências

[1]: ./MODULE_ALIGNMENT_PILOT_2026-08-20.md "Piloto de alinhamento por módulo"
[2]: ./UI_04_CATALOG_RECONCILIATION_2026-08-20.md "UI-04 — reconciliação controlada"
[3]: ../../v2/modules/editor/module.js "Manifesto do módulo editor"
[4]: ../../src/layout/sidebar.ts "Catálogo V1 Código & Dev"
[5]: ../../scripts/v2-integracao.mjs "Gate browser V2"
