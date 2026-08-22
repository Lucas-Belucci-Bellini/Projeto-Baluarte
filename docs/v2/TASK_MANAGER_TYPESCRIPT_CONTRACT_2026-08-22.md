# Task Manager V2 — Contrato TypeScript

**Status:** implementação desta onda  
**Data:** 2026-08-22  
**Escopo:** tornar `v2/core/trabalho.ts` a implementação canônica do escalonador, mantendo `v2/core/trabalho.js` como wrapper de compatibilidade.

## Objetivo

O escalonador é a fila local de trabalho usada pelo Core e pelos módulos V2. Ele limita concorrência global e por módulo, aplica prioridade determinística, cancela tarefas que ainda aguardam na fila, entrega `AbortSignal` à função já iniciada, rejeita filas cheias sem pendurar promessas e publica métricas bounded. Esta onda tipa a implementação sem mudar a API pública ou a semântica já coberta pelos testes.

## Fronteira de compatibilidade

A implementação canônica será `v2/core/trabalho.ts`. O arquivo `v2/core/trabalho.js` continuará sendo um wrapper ESM que reexporta os símbolos do TypeScript. Consumidores V2 existentes continuarão importando o caminho `.js`, e o teste focal continuará exercitando a API pública por essa fronteira.

A configuração `v2/jsconfig.json` passará a incluir `core/**/*.ts` no portão de tipos. O wrapper `.js` não será incluído como fonte duplicada do mesmo módulo. Não haverá `allowJs`, exclusão nova, relaxamento de `strict`, `any`, `@ts-ignore` ou `@ts-nocheck`.

## API preservada

| Símbolo | Contrato |
|---|---|
| `INTERATIVO` | prioridade numérica `10` |
| `NORMAL` | prioridade numérica `100` |
| `FUNDO` | prioridade numérica `500` |
| `Cancelado` | erro específico de cancelamento |
| `FilaCheia` | erro específico quando o teto da fila é atingido |
| `criarEscalonador(opcoes?, deps?)` | cria fila com limite global, limite por módulo e teto de espera |
| `enfileirar(modulo, nome, fn, opts?)` | retorna `Promise<T>` e preserva inferência do resultado |
| `paraModulo(id).fazer(nome, fn, opts?)` | carimba o módulo antes do trabalho |
| `estado()` | expõe contadores de execução, fila, limites e contagem por módulo |

## Invariantes

O limite global nunca pode ser ultrapassado. O limite por módulo impede que uma origem monopolize o escalonador. Prioridade menor executa antes; empates respeitam ordem de chegada. Cancelamento enquanto aguarda retira imediatamente o item lógico da fila e rejeita com `Cancelado`. Um sinal já abortado não inicia o trabalho. Uma tarefa já iniciada recebe o sinal, mas a função decide como interromper sua própria operação. Falha síncrona ou assíncrona encerra os contadores e não trava o escalonador. A fila cheia rejeita imediatamente com `FilaCheia`.

A seleção e o cancelamento em massa devem permanecer amortizados por heaps e descarte preguiçoso; os testes de escala existentes devem continuar cobrando que a razão de tempo não volte ao comportamento quadrático. Nenhuma métrica deve incluir token, conteúdo de conversa ou dado pessoal.

## Lifecycle e rollback

O módulo não inicia worker, timer ou conexão externa. Toda tarefa termina por resolução, rejeição ou cancelamento lógico; a responsabilidade de interromper um `fetch` permanece no `AbortSignal` recebido pela função. O rollback é restaurar o wrapper para a implementação JavaScript anterior e remover a entrada TypeScript do portão, sem alterar consumidores.

## Gates desta onda

Antes do commit: `npm run tipos:v2`, teste focal `test/v2/trabalho.test.js`, `npm test`, `npm run tipos:ts`, `npm run build`, `npm run v2:integracao`, `npm run smoke` e `npm run caminho-critico`. O slice só poderá ser publicado na `main` se os resultados forem verdes ou explicitamente classificados como bloqueio conhecido sem regressão.

## Limitações

Esta onda tipa o Task Manager; não implementa retry automático, persistência, filas remotas, Supabase, RLS, OpenClaw, WhatsApp, captura de áudio, playback Spotify ou autorização de módulo. Retry, correlation ID e cancelamento distribuído continuam contratos posteriores do Event Bus/Orchestrator.
