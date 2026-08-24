# Command Center — Protótipo Visual Isolado

**Data:** 20 de agosto de 2026

**Status:** `IMPLEMENTADO NO HARNESS — NÃO PROMOVIDO AO SHELL PÚBLICO`

**Base:** `main` após a release `1.2.6`

## Objetivo

Este marco transforma o contrato read-only do Command Center em uma superfície visual executável dentro de `v2/harness/index.html`. O protótipo foi criado no banco de prova da V2 para validar composição, busca, categorias, recolhimento, foco e fallback antes de qualquer alteração no shell público.

> O protótipo não é a nova sidebar do site. A sidebar V1, `renderSidebar()`, `ShellRefs`, o router V1 e as rotas públicas continuam sendo as superfícies de produção.

## O que foi implementado

A superfície visual deriva exclusivamente de `projectCommandCenter()` e `searchCommandCenter()`. Ela renderiza categorias do Registry, comandos com título, path, disponibilidade e origem, além de uma categoria de fallback para domínios ainda não mapeados. O protótipo não cria rotas, não registra comandos em um Event Bus paralelo, não concede permissões e não toma decisões de disponibilidade pública.

A busca por `editor` reduz a visualização a um comando e uma categoria sem alterar o texto ou o conteúdo do `#nav` V2 existente. O toggle `Recolher`/`Expandir` usa `aria-expanded` e mantém o controle visível quando o corpo está recolhido. A área de resultados usa `aria-live="polite"`, e os comandos são construídos com `textContent`, não com HTML derivado do manifesto.

A visualização está marcada com `data-visibility="harness-only"`. A ponte de diagnóstico expõe `publicSidebarUntouched: true` para que o teste verifique a fronteira de segurança sem depender de pixels ou de uma decisão implícita.

## Contratos validados

| Contrato | Evidência |
|---|---|
| Fonte única de navegação | Categorias derivadas da projeção Registry existente |
| Fallback | Domínios sem mapeamento não desaparecem; ficam em `Outros sistemas` |
| Busca | `editor` retorna um único comando no visual |
| Compatibilidade V1 | `#nav` permanece inalterado antes e depois da busca |
| Acessibilidade | `label`, `aria-labelledby`, `aria-live`, `aria-controls` e `aria-expanded` |
| Recolhimento | Botão permanece operável e alterna `true`/`false` |
| Movimento reduzido | `prefers-reduced-motion` desativa animações/transições do piloto |
| Segurança | Sem autorização, Auth/RLS, Billing ou roles client-side |
| Escopo | Harness V2, sem montagem no shell público |

## Gate browser

O gate `npm run v2:integracao` passou com **28/28** afirmações. As três novas afirmações cobrem: restrição ao harness e quantidade derivada de comandos/categorias; busca visual sem alteração da sidebar; e recolhimento acessível.

O contrato unitário de navegação continua com **16/16** testes. O restante dos gates — typechecks, testes gerais, build, smoke e caminho crítico — deve ser executado antes da publicação no `main`.

## Riscos e limites

O protótipo ainda não é uma decisão de layout para usuários normais. O desenho visual, o mapa de teclado global, a persistência de preferências, a telemetria de acessibilidade e a integração com claims server-side não estão autorizados para produção neste marco. A categoria, a busca e o estado de disponibilidade são observacionais; estabilidade não é health e health não é autorização.

O rollback é remover o protótipo do `v2/harness/index.html`, remover o renderer de `v2/harness/main.js`, retirar as três afirmações do `scripts/v2-integracao.mjs` e retornar ao SHA anterior do harness. Nenhum rollback precisa alterar `src/main.js`, `src/layout/sidebar.ts` ou as rotas V1.

## Próximo marco seguro

O próximo marco deve testar navegação por teclado e foco visível em uma matriz de acessibilidade do harness, com reduced motion e deep links. A promoção para o shell público só pode ser reavaliada depois de observabilidade server-side, claims, rollback, orçamento de performance e aprovação explícita da PHASE UI.

## Referências

[1]: ./COMMAND_CENTER_NAVIGATION_CONTRACT_2026-08-20.md "Contrato read-only do Command Center"
[2]: ./PHASE_UI_DESIGN_SYSTEM.md "Especificação da PHASE UI"
[3]: ../../v2/harness/index.html "Superfície visual isolada"
[4]: ../../scripts/v2-integracao.mjs "Gate browser da V2"
