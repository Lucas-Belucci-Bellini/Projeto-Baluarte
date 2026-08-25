# Task Manager — resumo de duração V2

**Data:** 2026-08-25  
**Fase:** 03 — Event Bus and Task Manager  
**Status:** contrato local read-only  
**Implementação:** `v2/core/trabalho.ts`

## Objetivo

O escalonador V2 já preservava contagens acumuladas de tarefas e enviava a métrica opcional `trabalho_ms`, mas `saude()` não mantinha nenhum resumo quando `deps.metricas` não era injetado. Este slice fecha essa lacuna de observabilidade local sem escolher uma política de falha, retry ou disponibilidade.

## Superfície

`escalonador.saude()` agora inclui `latencia`:

```ts
{
  n: number;
  mediaMs: number;
  minMs: number | null;
  maxMs: number | null;
}
```

O estado vazio é `{ n: 0, mediaMs: 0, minMs: null, maxMs: null }`. O estado é mantido por acumuladores `n/soma/min/max`; não existe array de amostras, histograma ou cardinalidade por tarefa.

| Regra | Comportamento |
|---|---|
| Início da amostra | Quando a tarefa passa a executar; tarefas ainda na fila não entram. |
| Sucesso | Registrado no encerramento normal. |
| Falha | Registrado no encerramento com rejeição ou exceção síncrona. |
| Cancelamento antes do início | Não registrado como duração. Continua apenas na contagem de cancelamentos. |
| Relógio | `performance.now()` quando disponível; `Date.now()` como fallback; `relogio` pode ser injetado para teste. |
| Relógio inválido | Exceção, valor não finito ou ajuste para trás não derruba o escalonador; a amostra é omitida ou clamped a zero. |
| Métrica legada | `trabalho_ms` mantém o relógio de parede e os rótulos `modulo`/`ok` existentes. |
| Readiness | Não muda. Só fila no teto produz `unhealthy`; duração não cria threshold. |

## Segurança e compatibilidade

A nova projeção é independente de `deps.metricas` e não inicia, para, cancela, repete ou reordena tarefas. A prioridade, os limites globais/por módulo, a fila, o AbortSignal, a propagação de erros e o formato das métricas existentes permanecem preservados.

O campo de duração não representa SLA, saúde operacional ou autoridade. Uma duração alta aparece somente como observação acumulada. Nenhum consumidor client-side pode usar o campo para conceder permissão, promover módulo, iniciar fallback ou alterar status.

## Testes

O contrato é coberto pelo teste focal `test/v2/trabalho-saude.test.js`: duas amostras determinísticas de sucesso/falha produzem `n`, média, mínimo e máximo esperados; relógio que lança exceção mantém o escalonador funcional e retorna resumo vazio. O teste canônico `test/v2/trabalho.test.js` continua protegendo métricas legadas, concorrência, prioridade, cancelamento e escalabilidade.

## Limites e próximo passo

Este slice não escolhe percentis, budgets universais, alertas, backpressure, retry, persistência, exportação, hardware real ou diagnóstico server-side. Um futuro budget operacional exige dados comparáveis por ambiente e uma decisão de política separada. A política de retry por classe de evento continua bloqueada por ADR, e Evidence ownership/retention continua dependente de contrato server-side e staging.

## Rollback

O rollback remove `latencia` da interface e dos acumuladores do escalonador, seus testes e este adendo documental. Os acumulados de contagem, o estado instantâneo, as métricas legadas, o Event Bus e a V1 não devem ser removidos como parte desse rollback.
