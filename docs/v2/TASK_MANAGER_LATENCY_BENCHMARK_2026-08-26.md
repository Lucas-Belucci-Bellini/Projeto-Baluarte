# Task Manager — benchmark de duração V2

**Data:** 2026-08-26  
**Comando:** `node --experimental-strip-types v2/bench/core-js.mjs`  
**Ambiente:** Linux x86_64, Node v22.13.0, sandbox local  
**Código:** `v2/bench/core-js.mjs`

## Objetivo

Este benchmark verifica o custo externo do caminho real de enfileirar e concluir tarefas triviais no Task Manager e confirma a autoconsistência do novo resumo `escalonador.saude().latencia`. Ele não define SLA, budget de produção, alerta, disponibilidade ou threshold universal.

O cenário usa o escalonador existente com `limite: 8`, `tetoFila: 200.000`, módulo `bench` e `50.000` tarefas triviais. O resultado externo mede o tempo entre o primeiro enfileiramento e a conclusão de todas as promises. O resumo interno usa o relógio de duração do próprio escalonador.

## Resultado observado

| Medida | Resultado |
|---|---:|
| Tarefas submetidas | `50.000` |
| Tarefas observadas no health | `50.000` |
| Custo externo médio por tarefa | `5,6 µs` |
| Tempo externo total | `279 ms` |
| Média interna `latencia.mediaMs` | `0,010 ms` |
| Mínimo interno | `0,002 ms` |
| Máximo interno | `80,656 ms` |
| Autoconsistência | passou: `latencia.n === 50.000` |

O máximo interno é uma amostra de execução deste sandbox, não uma garantia do pior caso. O custo externo inclui o comportamento da fila, promises e concorrência no ambiente observado; não deve ser comparado diretamente com a média interna sem considerar que são caminhos de medição diferentes.

## Método e limites

O benchmark aquece o caminho geral do arquivo e então executa o cenário do escalonador. A versão deste slice adiciona uma verificação explícita: se o resumo de health não registrar exatamente as `50.000` tarefas, o processo falha. Essa verificação protege perda silenciosa de observabilidade, não desempenho.

A medição é local, single-process e sem rede, banco, storage, browser, provider, Supabase ou runtime Rust. Ela não cobre tarefas bloqueadas, longa duração de I/O, cancelamento antes do início, múltiplos módulos concorrentes, carga de usuário, jitter de CI ou hardware de produção.

Não foram escolhidos percentis, janela móvel, amostra reservoir, budget, threshold, backpressure, retry, alerta ou política de degradação. Qualquer decisão operacional futura exige contrato próprio, ambiente comparável e evidência histórica suficiente.

## Relação com o contrato

O formato de `escalonador.saude().latencia` está definido em [`TASK_MANAGER_LATENCY_2026-08-25.md`](./TASK_MANAGER_LATENCY_2026-08-25.md). O benchmark apenas consome o campo de forma read-only. Ele não inicia, para, cancela, repete, reordena ou autoriza tarefas.
