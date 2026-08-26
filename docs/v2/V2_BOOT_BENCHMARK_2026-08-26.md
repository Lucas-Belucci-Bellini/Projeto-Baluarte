# Benchmark do boot real da Plataforma V2 — 2026-08-26

## Objetivo

Este documento registra uma medição local do boot real da **Plataforma V2** no banco de prova existente em `v2/harness/`. O instrumento não recria o Core nem altera o harness: ele abre `v2/harness/index.html#/cripto` em Chromium, aguarda a exposição de `window.__v2.partida` e observa o resultado produzido por `criarPlataforma(...).iniciar()`.

A medição fecha uma evidência específica da Phase 02/21: o caminho real de startup dos sete módulos do harness consegue chegar a `ready` sem falhas e ainda entregar as vinte rotas V1 que o banco de prova verifica. Ela não transforma esse resultado em uma promessa para o site inteiro ou para produção.

## Método e contrato

O comando é:

```bash
npm run build
npm run bench:v2:boot
```

A execução padrão faz `5` repetições, com timeout de `25 s` por partida. Cada repetição cria um novo contexto de browser, navega para o harness, aguarda `window.__v2.partida` por condição e fecha o contexto em `finally`. O preview usa uma porta bounded (`4185` por padrão), `--strictPort` e é encerrado ao final.

O benchmark coleta dois relógios diferentes:

| Relógio | Definição |
|---|---|
| `bootInterno` | `window.__v2.partida.duracaoMs`, produzido pela Plataforma/Supervisor no caminho real de boot |
| `browserReady` | tempo observado pelo processo Node desde antes de `goto()` até `window.__v2.partida` ficar disponível |

O primeiro relógio mede a duração declarada pelo supervisor; o segundo inclui navegação, transformação/serving do Vite, execução dos módulos e a espera observável no browser. Eles não devem ser comparados como se fossem a mesma operação.

Cada amostra exige simultaneamente `estado: ready`, `duracaoMs` finito e não negativo, exatamente sete módulos vivos, zero falhas de boot e vinte rotas V1. Qualquer exceção JavaScript não capturada, estado diferente, contagem divergente, timeout ou rodada incompleta faz o processo falhar. Não existe threshold de performance escondido.

Para evitar medir um servidor errado, a espera inicial não aceita apenas HTTP `200`: ela exige que a resposta de `v2/harness/index.html` contenha os marcadores `Baluarte V2` e `id="saida"`. Isso impede que um preview V1 stale na mesma porta seja confundido com o banco de prova.

## Resultados

### Execução 1

| Configuração | Resultado |
|---|---:|
| Repetições | `5` |
| Estado de cada amostra | `ready` |
| Módulos vivos por amostra | `7` |
| Rotas V1 por amostra | `20` |
| Falhas de boot | `0` |

| Métrica | p50 | p95 | Média | Máximo |
|---|---:|---:|---:|---:|
| Boot interno | `14 ms` | `14 ms` | `14 ms` | `14 ms` |
| Browser até `partida` | `225,801 ms` | `783,116 ms` | `329,453 ms` | `783,116 ms` |

A amostra cold do browser foi a primeira (`783,116 ms`); as quatro seguintes ficaram entre `193,784 ms` e `228,060 ms`. O valor do boot interno permaneceu `14 ms` nas cinco amostras.

### Execução 2

| Configuração | Resultado |
|---|---:|
| Repetições | `5` |
| Estado de cada amostra | `ready` |
| Módulos vivos por amostra | `7` |
| Rotas V1 por amostra | `20` |
| Falhas de boot | `0` |

| Métrica | p50 | p95 | Média | Máximo |
|---|---:|---:|---:|---:|
| Boot interno | `14 ms` | `15 ms` | `14,2 ms` | `15 ms` |
| Browser até `partida` | `214,871 ms` | `855,046 ms` | `342,108 ms` | `855,046 ms` |

A primeira amostra novamente foi a mais lenta no browser (`855,046 ms`); as quatro seguintes ficaram entre `211,298 ms` e `217,993 ms`. O boot interno oscilou somente entre `14 ms` e `15 ms`.

## Ocorrência ambiental e correção

O primeiro ensaio não chegou a medir o boot porque a porta `4185` estava ocupada por um preview Vite antigo que devolvia o `index.html` do site V1. O processo respondia `200`, mas não expunha `window.__v2`, portanto o timeout era uma falha legítima do harness de medição, não um motivo para relaxar o contrato.

A execução confirmou o processo stale como Node/Vite do próprio repositório; somente esse PID foi encerrado. O benchmark foi então reforçado para validar os marcadores do HTML do harness antes de abrir o browser. Com a porta limpa e a proteção ativa, as duas execuções completas passaram todas as invariantes.

## Escopo, segurança e limites

O benchmark é local e read-only. Ele não altera `v2/harness/main.js`, `v2/core/plataforma.ts`, o boot, o router V1, o shell, páginas, Auth, Evidence, Supabase, RLS, tenancy, ownership, permissões, retry, persistência ou autoridade. O harness continua sendo um banco de prova separado do site público.

Os tempos dependem da máquina, do Node, do Chromium, do scheduler, do cache, do Vite, da carga do sandbox e da ordem cold/warm. O browser-ready inclui serving e carregamento do harness; o boot interno é a duração reportada pelo Supervisor. O resultado não é um Web Vital, não mede o site completo de 99 rotas, não mede hardware real, não estabelece SLA, threshold, budget de produção, critério de promoção ou política automática de regressão.

A próxima evolução de performance deve reunir série histórica, ambiente controlado e política explícita antes de qualquer gate quantitativo. Este marco somente torna o startup real mensurável e auditável.
