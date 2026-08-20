# Command Center — Matriz de Acessibilidade do Harness

**Data:** 20 de agosto de 2026  
**Status:** `IMPLEMENTADA NO HARNESS — NÃO PROMOVIDA AO SHELL PÚBLICO`  
**Repositório:** `Lucas-Belucci-Bellini/Projeto-Baluarte`  
**Branch:** `main`  
**SHA de origem:** `6b6218965ae0448cd2b1d89ac498bdaa5da414e9`  
**SHA de publicação:** será registrado após o commit deste marco  
**Escopo:** `v2/harness/index.html`, `v2/harness/main.js` e `scripts/v2-integracao.mjs`

## Objetivo

Esta matriz transforma a acessibilidade do protótipo visual do Command Center em um contrato testável. O escopo é deliberadamente limitado ao banco de prova V2: ele valida teclado, foco, comunicação semântica e preferência de movimento reduzido antes de qualquer decisão sobre o shell público.

> O Command Center continua sendo uma superfície `harness-only`. Esta matriz não substitui `renderSidebar()`, não altera o router V1, não cria um segundo catálogo de comandos, não cria um Event Bus paralelo e não concede permissões client-side.

## Contratos implementados

| Área | Implementação | Evidência automatizada |
|---|---|---|
| Busca semântica | A barra de busca está em um contêiner com `role="search"`; o campo possui label associado por `for`/`id`. | O gate verifica `role="search"` e o texto do label. |
| Atalho de busca | A tecla `/`, quando o foco não está em campo editável, move o foco para `#command-center-search`. | O gate dispara `/` no documento e confirma `document.activeElement.id`. |
| Atalho de limpeza | `Escape`, quando o campo de busca está focado e contém texto, limpa o valor e re-renderiza os resultados. | O gate preenche `editor`, envia `Escape` e confirma valor vazio. |
| Entrada nos resultados | `ArrowDown`, quando a busca está focada, move o foco para o primeiro link `.pilot-command`. | O gate confirma que o elemento ativo é o primeiro comando. |
| Relação busca/resultados | O campo expõe `aria-keyshortcuts="/"` e `aria-controls="command-center-categories"`. | A ponte `commandCenterAccessibilityPilot()` e o gate verificam os atributos. |
| Recolhimento | O botão de recolhimento mantém `aria-expanded` sincronizado com o estado visual e `aria-controls="command-center-body"`. | O contrato anterior e a matriz atual verificam `true`/`false`. |
| Resultados dinâmicos | A região de categorias permanece com `aria-live="polite"`, permitindo que alterações de busca sejam anunciadas sem interromper o usuário. | O markup é mantido no harness e a integração continua sem erros de JavaScript. |
| Foco visível | Os controles e comandos continuam sendo elementos nativos focáveis; o protótipo não remove o outline padrão nem implementa foco por `tabindex` artificial. | A navegação por teclado usa os elementos nativos e o gate valida a transição de foco. |
| Movimento reduzido | A regra `@media (prefers-reduced-motion: reduce)` desativa transições, animações e rolagem suave dentro do piloto. | A ponte expõe o estado detectado de `matchMedia`; o comportamento fica restrito à raiz `.visual-pilot`. |

## Matriz de teclado

| Tecla | Pré-condição | Resultado | Não faz |
|---|---|---|---|
| `/` | O foco não está em `input`, `textarea`, `select` ou elemento editável. | Foca o campo `#command-center-search` e impede a inserção literal da barra no documento. | Não sequestra a tecla enquanto o usuário edita outro campo. |
| `Escape` | O campo do Command Center está focado e possui valor. | Limpa a busca e atualiza a projeção visual. | Não fecha a página, não altera a sidebar V1 e não interfere em outros campos. |
| `ArrowDown` | O campo de busca está focado e existe pelo menos um comando visível. | Foca o primeiro comando da lista. | Não cria uma rotação de foco customizada nem altera rotas. |
| `Tab` | Foco em qualquer elemento nativo do piloto. | Usa a ordem natural do documento e dos controles. | Não implementa um focus trap global. |

## O que ainda não está implementado

A matriz é intencionalmente incremental. Ainda não existe um **focus trap global**, e isso é correto para um protótipo que não é modal. Também não existe uma gestão dedicada de foco entre categorias, uma rotação completa por setas, persistência de preferência de movimento reduzido ou anúncio específico da contagem de resultados após cada alteração de busca.

O protótipo ainda não anuncia uma frase dedicada como “1 resultado encontrado” para leitores de tela; o `aria-live="polite"` está preservado como base, mas a mensagem de contagem precisa de um contrato de conteúdo e idioma antes de ser promovida. Também não há validação com leitores de tela reais, navegação por toque assistivo, contraste medido por ferramenta especializada ou orçamento formal de acessibilidade para o shell de produção.

A ponte diagnóstica pode expor `reducedMotion`, mas isso é telemetria de harness e não uma autorização para habilitar ou desabilitar módulos. **Estabilidade não é health, health não é autoridade e preferência visual não é permissão.**

## Testes executados neste marco

O gate `npm run v2:integracao` passou com **32/32** afirmações, incluindo boot V2, Registry, Runtime, saúde, router V1, Command Center, ARIA, `/`, `Escape`, `ArrowDown`, fallback, módulos, permissões e ausência de erros JavaScript. Os testes completos de typecheck, suíte geral, build, smoke e caminho crítico devem ser executados antes da publicação deste marco.

## Risco e decisão de promoção

O risco principal seria interpretar esta matriz como autorização para trocar a sidebar global ou para inferir acesso privilegiado no cliente. Essa interpretação é proibida. O piloto não recebe claims server-side, não escreve em Supabase, não executa RLS, não altera Billing e não promove o editor quebrado para usuários normais.

A promoção permanece bloqueada até existir observabilidade server-side por módulo, claims verificáveis, deep links auditáveis, fallback reversível, rollback testado, orçamento de performance e aprovação explícita da PHASE UI. O próximo incremento válido é testar anúncio de contagem de resultados e uma matriz de foco entre categorias sem abandonar o fallback V1.

## Rollback

Para reverter este marco, remova o bloco de ajuda e os atributos ARIA adicionados em `v2/harness/index.html`, remova o listener de teclado e a ponte `commandCenterAccessibilityPilot()` de `v2/harness/main.js`, retire as quatro novas afirmações de `scripts/v2-integracao.mjs` e retorne ao SHA imediatamente anterior deste marco. O rollback não deve alterar `src/main.js`, `docs/nexus/dominios.json`, `src/layout/sidebar.ts`, rotas V1, Auth/RLS ou Supabase.

Antes de qualquer rollback publicado, execute `git diff --check`, `npm run v2:integracao`, `npm test`, `npm run build`, `npm run smoke` e `npm run caminho-critico`. Se houver push remoto concorrente, faça `git fetch origin main`, inspecione a divergência, integre com `git merge --no-edit origin/main` e publique sem force push.

## Referências

[1]: ./COMMAND_CENTER_VISUAL_HARNESS_PILOT_2026-08-20.md "Protótipo visual isolado do Command Center"
[2]: ./COMMAND_CENTER_NAVIGATION_CONTRACT_2026-08-20.md "Contrato read-only de navegação"
[3]: ./PHASE_STATUS_MATRIX.md "Matriz de fases da V2"
[4]: ../../v2/harness/index.html "Markup do harness V2"
[5]: ../../scripts/v2-integracao.mjs "Gate de integração browser"
