# Benchmark de renderização das rotas reais — 2026-08-26

## Objetivo

Este documento registra uma medição local do caminho real de renderização das rotas do Baluarte. O instrumento usa o catálogo descoberto diretamente de `src/main.js`, abre cada rota em Chromium contra um preview de produção e mede dois tempos: navegação até `DOMContentLoaded` e tempo total observado após uma janela de settle bounded.

O `npm run smoke` continua sendo o gate funcional de rotas. Este benchmark não o substitui, não altera suas regras e não converte a medição em SLA ou threshold de produção.

## Método

O comando é:

```bash
npm run build
npm run bench:routes
```

A execução padrão usa `99` rotas descobertas por expressão no registro real, `3` repetições, `900 ms` de settle por rota e timeout de navegação de `15 s`. O valor de `900 ms` é intencionalmente alinhado à janela usada pelo smoke para que páginas lazy não sejam classificadas como vazias antes de completar a montagem. Os valores podem ser explicitamente ajustados por `ROUTE_BENCH_REPS`, `ROUTE_BENCH_SETTLE_MS`, `ROUTE_BENCH_TIMEOUT_MS` e `ROUTE_BENCH_PORT`, todos bounded no script.

Cada rota recebe uma página nova e essa página é fechada imediatamente após a observação, inclusive quando há timeout ou erro. A página é classificada como não-verde quando ocorre exceção JavaScript não capturada, rota não encontrada ou menos de `60` caracteres no conteúdo de `main`/`body`. Uma rodada incompleta e qualquer rota não-verde fazem o processo terminar com erro; não há truncamento silencioso.

A saída inclui JSON com a contagem de rotas, configuração, tempo de cada rodada, média, p50, p95 e máximo de navegação e settle, além das oito observações mais lentas. Os tempos são diagnóstico do sandbox e incluem o custo de abrir/renderizar a página sob o ambiente local.

## Execução observada

| Campo | Resultado |
|---|---:|
| Dataset | `src/main.js` — rotas reais descobertas |
| Rotas por rodada | `99` |
| Repetições | `3` |
| Settle | `900 ms` |
| Timeout de navegação | `15 s` |
| Estado | `passou` |
| Total da rodada 1 | `115030,943 ms` |
| Total da rodada 2 | `114779,153 ms` |
| Total da rodada 3 | `114626,039 ms` |

### Métricas agregadas

| Métrica | p50 | p95 | Média | Máximo |
|---|---:|---:|---:|---:|
| Navegação até DOMContentLoaded | `163,186 ms` | `190,465 ms` | `166,612 ms` | `404,826 ms` |
| Observação após settle | `1104,435 ms` | `1236,586 ms` | `1122,866 ms` | `1457,885 ms` |

As oito maiores observações de settle foram `/jarvis` (`1457,885 ms`, `1432,021 ms`, `1390,180 ms`), `/home` (`1388,665 ms`), `/tv` (`1327,472 ms`, `1274,740 ms`), `/modelos-3d` (`1261,099 ms`) e `/videos` (`1258,724 ms`). A lista contém observações repetidas porque o ranking é por medição de cada rodada, não por média de rota.

## Verificações e correções durante o ensaio

A primeira implementação manteve as 99 páginas abertas até o fim da rodada, provocando o fechamento do contexto Chromium. O cleanup foi corrigido para fechar cada página por rota, mantendo o browser compartilhado entre rodadas. Em seguida, uma execução com settle de `900 ms` passou as `99` rotas; o default foi fixado nesse valor.

Antes da correção do settle, `/gerar-codigo` foi observado como `quase-vazia` com `0` caracteres sob `150 ms`, mas passou o smoke direcionado e o benchmark completo sob `900 ms`. O evento foi tratado como falso negativo de janela temporal, não como motivo para relaxar a classificação estrutural.

## Escopo e limites

Esta é uma medição local, não um budget de produção. Os valores variam com máquina, versão do Node/Chromium, scheduler, cache, rede externa, carga do processo, GPU e ambiente de deploy. O benchmark não estabelece SLA, threshold, regressão estatística, comparação entre hardware ou critério de promoção.

O instrumento não faz escrita remota, não acessa Supabase, não cria staging, não muda Auth, RLS, tenancy, ownership, permissões ou autoridade, e não modifica o router, o smoke, a V1 ou o conteúdo das páginas. Recursos externos podem influenciar o tempo observado; o benchmark mede o comportamento do preview sob essas condições, enquanto a classificação funcional de falhas externas continua pertencendo ao smoke.

A próxima decisão de performance deve usar uma série histórica com ambiente fixado e uma política explícita de regressão. Nenhuma decisão desse tipo é tomada por este resultado isolado.
