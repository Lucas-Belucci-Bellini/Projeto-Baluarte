# Benchmark — latência do Event Bus V2

**Data da medição:** 2026-08-25  
**Script:** `scripts/event-bus-latency-benchmark.mjs`  
**Comando:** `npm run bench:event-bus`  
**Ambiente:** Linux x64, Node `v22.13.0`, Intel Xeon Processor `@ 2.50GHz`  
**Status:** diagnóstico local; não é threshold de CI nem promessa de hardware

## Objetivo

A alpha.4 publicou o resumo de latência em `bus.saude()`. Este benchmark fecha a lacuna de medição da Fase 03 com um instrumento repetível que exercita o caminho real de `criarBus().emit()`, incluindo matching de ouvintes, curinga, envelope e registro da latência interna.

O script aquece o JIT com 2.000 despachos por cenário e mede 20.000 despachos por cenário. Cada cenário usa uma instância nova do Bus, um payload bounded e uma origem explícita. O resultado falha se o número de handlers recebidos não coincidir com o esperado ou se `latencia.n` não coincidir com a quantidade de emissões.

## Resultado observado

| Cenário | Ouvintes diretos | Operações | Tempo externo médio | Operações/s | Média interna `bus.saude().latencia` | Máximo interno |
|---|---:|---:|---:|---:|---:|---:|
| 1 direto + curinga | 1 | 20.000 | 9,460 µs | 105.709 | 0,01 ms | 0,473 ms |
| 10 diretos + curinga | 10 | 20.000 | 9,586 µs | 104.319 | 0,01 ms | 0,395 ms |
| 20 diretos + curinga | 20 | 20.000 | 10,103 µs | 98.976 | 0,01 ms | 0,274 ms |

A média interna é arredondada pelo contrato do Bus a duas casas decimais em milissegundos; a medição externa usa microssegundos por despacho. Os valores não devem ser comparados entre máquinas sem repetir o mesmo script, versão de Node e condições de carga.

## Leitura arquitetural

A medição confirma que o caminho observado permanece bounded e que o contador interno acompanha todas as emissões. O cenário com 20 ouvintes diretos aumenta o custo externo observado em relação ao cenário com 1 ouvinte, mas esta execução isolada não é suficiente para estabelecer uma meta universal nem para afirmar regressão.

O benchmark não usa entrada de rede, banco, provider, storage, Supabase, Auth ou dados externos. Ele não adiciona retry, threshold, alerta, backpressure, cache, persistência ou autoridade. O número de operações por segundo é apenas uma observação deste sandbox.

> **Regra de interpretação:** medir o custo é evidência para uma decisão futura; não é autorização para mudar a semântica do Event Bus nem para declarar a V2 pronta.

## Reexecução

```bash
npm run bench:event-bus
BUS_BENCH_N=50000 npm run bench:event-bus
BUS_BENCH_WARMUP=5000 npm run bench:event-bus
```

`BUS_BENCH_N` é limitado entre 100 e 1.000.000; `BUS_BENCH_WARMUP` é limitado entre 10 e 100.000. Valores inválidos voltam aos defaults seguros. O JSON inclui data, versão do Node, plataforma, CPU, carga, aquecimento e os resultados por cenário.

## Próximos limites

Este benchmark não fecha retry, persistência, ownership, retenção operacional, revisão humana, Auth real, RLS, staging ou performance em hardware de usuário. Esses tópicos continuam sujeitos aos contratos próprios da matriz V2. A próxima decisão do Event Bus permanece a política de retry por classe de evento, que está bloqueada até existir um ADR explícito.
