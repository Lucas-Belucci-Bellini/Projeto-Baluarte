# Resultados medidos — Fase 0

Máquina: Linux x86_64, Node v22.22.2, Python 3.11.15, Rust 1.94.1
Data: 2026-08-11

```

═══ 1. Validação de manifesto (por módulo) ═══
  validar() um manifesto                              0.9 µs/op   (200000x, 174.9 ms)

═══ 2. Selar o registro — ordenação topológica + colisões ═══
  selar() com 10 módulos                             63.6 µs/op   (2000x, 127.2 ms)
  selar() com 100 módulos                           347.8 µs/op   (2000x, 695.5 ms)
  selar() com 1000 módulos                          3.295 ms/op   (200x, 658.9 ms)

═══ 3. Boot completo — init de todos + registro de rotas ═══
  boot com 10   módulos                             5.28 ms
  boot com 100  módulos                             4.05 ms
  boot com 1000 módulos                           191.09 ms

═══ 4. Event Bus — o "sistema nervoso" ═══
  emit() com 1 ouvinte direto + 1 curinga             2.4 µs/op   (500000x, 1201.2 ms)

═══ 5. Escalonador — tarefas assíncronas ═══
  50000 tarefas triviais                             5.0 µs   (250 ms total)

═══ 6. Permissões — a consulta que roda em todo acesso ═══
  pode() concedida                                    0.0 µs/op   (2000000x, 83.0 ms)

═══ RESUMO ═══
  O Core gasta 2.4 µs por evento e 0.9 µs por manifesto.
  Subir 1000 módulos leva 191 ms — uma vez, no boot.
  Uma consulta de permissão custa 0.0 µs.

```

```

═══ A. O piso: atravessar sem fazer nada ═══
  JS      soma(a,b)                                       2.0 ns/op
  WASM    soma(a,b) — só o custo da travessia            11.8 ns/op

═══ B. O trabalho REAL do bus: casar um nome de evento ═══
  JS      despachar("ev:7")                              22.1 ns/op
  WASM    despachar(7)  — só número atravessa            11.2 ns/op
  WASM    despachar("ev:7") — com a cópia do texto      110.9 ns/op

═══ C. Onde WASM ganha de verdade: cálculo puro ═══
  JS      200 iterações de hash inteiro                 233.1 ns/op

═══ VEREDICTO ═══
  Travessia crua (soma):        11.8 ns  vs  2.0 ns em JS
  Despacho de evento real:      110.9 ns  vs  22.1 ns em JS
  Diferença por evento:         +88.7 ns MAIS CARO em WASM
  Razão (WASM texto / JS):      5.01×

  Leitura: a travessia por si só custa 11.8 ns. Qualquer operação do
  Core que custe MENOS que isso do lado JS fica mais lenta em WASM, por
  definição — a conta que se economiza é menor que o pedágio que se paga.

```

```
alvo: 17.9 MB

── Python 3.11 (json da stdlib) ──
  parse         292 ms
  passeio       130 ms   (532622 chaves)
  memória       114 MB (pico)

── Node 22 (JSON.parse) ──
  parse         250 ms
  passeio        64 ms   (532622 chaves)
  memória       130 MB (rss)

── Rust 1.94 (serde_json) ──
  parse         187 ms
  passeio        19 ms   (532622 chaves)
  memória       104 MB (pico)

════ E onde Rust GANHA de verdade: trabalho de byte, sem JSON ════
(varredura de assinatura + hash rolante sobre os mesmos bytes —
 é a forma do parser de .p3d/.pbo, que é CPU pura)

── Python ──
      4240 ms   (hash ae627395, 57162 chaves-abre)
── Node ──
        32 ms   (hash ae627395, 57162 chaves-abre)
── Rust ──
        18 ms   (hash ae627395, 57162 chaves-abre)
```

## 2026-08-25 — Event Bus latency health

Execução: `npm run bench:event-bus` · Linux x64 · Node v22.13.0 · Intel Xeon @ 2.50GHz · 2.000 warmup + 20.000 operações por cenário.

| Cenário | Média externa | Operações/s | Média interna | Máximo interno |
|---|---:|---:|---:|---:|
| 1 direto + curinga | 9,460 µs | 105.709 | 0,01 ms | 0,473 ms |
| 10 diretos + curinga | 9,586 µs | 104.319 | 0,01 ms | 0,395 ms |
| 20 diretos + curinga | 10,103 µs | 98.976 | 0,01 ms | 0,274 ms |

A medição é diagnóstica e não estabelece threshold, promessa de hardware ou gate de CI. O contrato e o método estão em [`docs/v2/EVENT_BUS_LATENCY_BENCHMARK_2026-08-25.md`](../docs/v2/EVENT_BUS_LATENCY_BENCHMARK_2026-08-25.md).

## 2026-08-26 — Task Manager duration health

Execução: `node --experimental-strip-types v2/bench/core-js.mjs` · Linux x86_64 · Node v22.13.0 · `limite: 8` · `50.000` tarefas triviais.

| Medida | Resultado |
|---|---:|
| Tarefas submetidas / observadas no health | `50.000 / 50.000` |
| Custo externo médio por tarefa | `5,6 µs` |
| Tempo externo total | `279 ms` |
| Média interna | `0,010 ms` |
| Mínimo / máximo interno | `0,002 / 80,656 ms` |
| Autoconsistência | passou: `latencia.n === 50.000` |

Esta execução é diagnóstico local. O custo externo e a duração interna são caminhos de medição diferentes; os valores não são SLA nem threshold de produção. O método completo está em [`docs/v2/TASK_MANAGER_LATENCY_BENCHMARK_2026-08-26.md`](../docs/v2/TASK_MANAGER_LATENCY_BENCHMARK_2026-08-26.md).


## 2026-08-26 — Evidence local bounded search

Execução: `npm run bench:evidence-search` · Linux x86_64 · Node v22.13.0 · dataset local `PZ_IDS` com 159 mods curados e 640 registros Evidence derivados · 250 repetições por cenário.

| Cenário | Limite | Disponíveis | Retornados | Média |
|---|---:|---:|---:|---:|
| Todos os metadados (`wiki-zomboid`) | 25 | 640 | 25 | 125,435 µs |
| Campo workshop (`workshopid`) | 100 | 159 | 100 | 202,140 µs |
| Revisão do dataset | 100 | 640 | 100 | 223,172 µs |
| Escopo + estado (`wiki-zomboid`) | 100 | 640 | 100 | 119,301 µs |

Todos os cenários confirmaram `returned <= limit` e `available` antes do corte. A medição é local e diagnóstica; não estabelece full-text, índice persistente, ranking, SLA, threshold ou budget de produção. O método está em [`docs/v2/EVIDENCE_SEARCH_BENCHMARK_2026-08-26.md`](../docs/v2/EVIDENCE_SEARCH_BENCHMARK_2026-08-26.md).


Repetição no mesmo ambiente e dataset: `94,968 µs` (todos), `173,501 µs` (workshop), `222,314 µs` (revisão) e `90,390 µs` (escopo + estado). As contagens permaneceram `640` disponíveis, limites `25`/`100` e `250` repetições. A variação confirma que os valores são diagnóstico local, não threshold.
