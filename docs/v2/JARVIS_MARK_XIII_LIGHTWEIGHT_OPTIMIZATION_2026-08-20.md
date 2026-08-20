# JARVIS Mark XIII — Lightweight Optimization — 2026-08-20

## Resumo

Este marco reduz o custo do console visual Mark XIII para permitir que o JARVIS rode ao lado de processos locais como OpenClaw sem transformar a otimização em autoridade operacional. A mudança é pequena e reversível: reduz a quantidade de partículas, diminui o número de conexões candidatas e expõe `data-particles` para medição no benchmark existente.

> O objetivo desta onda é reduzir custo de desenho, não prometer desempenho universal. O resultado abaixo é uma medição reproduzível no Chromium do sandbox, não um aceite de hardware real.

## Mudança aplicada

| Item | Antes | Depois | Efeito esperado |
|---|---:|---:|---|
| Partículas em `full` | 96 | 72 | Menos pontos e menos iterações por quadro. |
| Partículas em `reduced` | 56 | 40 | Menor custo quando o orçamento adaptativo detecta FPS baixo ou pouca memória. |
| `connectionStride` em `full` | 1 | 2 | Menos pares candidatos para linhas de conexão. |
| `connectionStride` em `reduced` | 3 | 4 | Degradação adicional sob pressão. |
| Observabilidade | `data-performance` | `data-performance` + `data-particles` | O benchmark consegue registrar a qualidade efetiva. |

A animação continua usando `requestAnimationFrame`, `prefers-reduced-motion`, orçamento adaptativo e fallback de movimento. `runtimeAuthority` continua fixo em `not-authorized`. Nenhum botão de módulo, estado do Registry ou permissão é alterado por essa otimização.

## Medição antes/depois

O benchmark foi executado contra o mesmo build Vite servido em `127.0.0.1:4173`, com viewport `1440×900`, Service Worker bloqueado, janela de amostra de aproximadamente dois segundos e sem `prefers-reduced-motion`. Em ambas as medições o dispositivo reportou `deviceMemory: 16 GB` e o console acabou em qualidade `reduced` pelo orçamento adaptativo.

| Métrica | Baseline | Lightweight | Variação observada |
|---|---:|---:|---:|
| `mountMs` | 1056 ms | 1029 ms | -2,56% |
| FPS da amostra | 18,96 | 20,18 | +6,43% |
| `data-particles` | não exposto; qualidade reduced equivale a 56 | 40 | -28,57% contra a referência reduced |
| FPS reportado no dataset após janela | 15 | 14 | Variação de amostragem, não tratada como ganho |
| DOM nodes | 61 | 61 | Sem alteração |
| Canvas | 1 | 1 | Sem alteração |
| Heap usado | 9,54 MB | 9,54 MB | Sem alteração mensurável nessa amostra |
| Erros de console | 0 | 0 | Sem regressão |

A melhora de FPS da amostra foi de **6,43%** no sandbox. Como a janela é curta e o benchmark é sensível a carga do ambiente, o critério principal desta onda é a redução determinística de trabalho: 40 partículas no modo `reduced` e metade do stride de conexões em `full`.

## Validação

Foram executados:

```text
npx tsx --test test/jarvis-mark-xiii-console.test.js test/runtime-observation.test.js → 10/10
npm run tipos:ts → passou
npm run build → passou; warnings de chunks conhecidos permanecem
BASE=http://127.0.0.1:4173 npm run jarvis:performance → sem erros, 20,18 FPS, 40 partículas
```

Antes da alteração, o mesmo benchmark registrou `18,96 FPS`, `mountMs: 1056`, `domNodes: 61`, um canvas e heap de `9,54 MB`. Depois, registrou `20,18 FPS`, `mountMs: 1029`, `domNodes: 61`, um canvas e heap de `9,54 MB`.

Antes da publicação definitiva, a sequência completa continua obrigatória: catálogo de eventos, Nexus, tipos TS/V2, `npm test`, build, integração V2, smoke e caminho crítico. O `v2:runtime` permanece condicionado ao Cargo 1.75.0 e à dependência com metadados `edition2024`, conforme a limitação já documentada.

## Riscos e rollback

O risco é reduzir a densidade visual para usuários com hardware capaz. O rollback é local e seguro: restaurar `particleCount()` para `56/96`, `connectionStride` para `3/1` e remover a atribuição `data-particles`. Os contratos de Runtime, Event Bus, V2 PlatformDiagnostic, Auth/RLS, Supabase, OpenClaw e Spotify não dependem desses valores.

A próxima otimização não deve alterar simultaneamente o histórico do chat, seleção de ferramentas, WebLLM ou áudio. Essas áreas exigem métricas próprias de latência, tokens, memória e fallback. O benchmark de hardware real e a medição simultânea com OpenClaw ainda estão pendentes.

## Registro

- Repositório: `Lucas-Belucci-Bellini/Projeto-Baluarte`.
- Branch de entrega: `main`.
- Base: `8cbe77444ef00d62e907b251cee75f661f131ce7`.
- Publicação da otimização: `e78b39466465b11562dd25e7773f399af7b0fe5a`.
- Autor padrão: Manus AI.
