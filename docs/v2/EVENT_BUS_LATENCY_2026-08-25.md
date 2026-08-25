# Contrato — latência do Event Bus

**Data:** 2026-08-25  
**Fase:** 03 — Event Bus e Task Manager  
**Implementação:** `v2/core/bus.js`  
**Verificação focal:** `test/v2/bus-saude.test.js`

## Objetivo

O Event Bus já expunha contagem de emissões, falhas de handler, readiness e a cadeia de correlação. Faltava uma medida operacional mínima para responder **quanto tempo um despacho ocupou o Core**, sem transformar health em um limiar de disponibilidade e sem criar um coletor remoto.

O contrato adiciona `latencia` ao retrato de `bus.saude()`. A medida cobre um `emit` desde o início do despacho até o fim do isolamento de todos os handlers daquele evento. Ela é registrada também quando um handler falha, porque falha e duração pertencem ao mesmo diagnóstico.

## Superfície

`bus.saude().latencia` sempre existe e tem o formato abaixo:

| Campo | Tipo | Significado |
|---|---:|---|
| `n` | `number` | Quantidade de despachos cuja duração pôde ser medida. |
| `mediaMs` | `number` | Média arredondada a duas casas decimais. |
| `minMs` | `number \| null` | Menor duração observada; `null` sem amostras. |
| `maxMs` | `number \| null` | Maior duração observada; `null` sem amostras. |

Sem emissões ou quando o relógio não fornece uma amostra válida, o retrato é `{ n: 0, mediaMs: 0, minMs: null, maxMs: null }`.

O retrato é derivado na leitura, como as demais partes de `saude()`. O estado interno guarda somente `n`, soma, mínimo e máximo. Não há array de amostras, histograma ou percentil exato; portanto, a memória usada pela latência é **O(1)** por instância do Bus.

## Relógio e tolerância a falhas

O Bus prefere `performance.now()`, que é apropriado para duração, e usa `Date.now()` como fallback. O construtor aceita `relogio` apenas como dependência de observabilidade e teste determinístico:

```js
const bus = criarBus({ relogio: () => performance.now() });
```

A função de relógio é protegida. Se lançar, retornar `NaN`, infinito ou outro valor não finito, o despacho continua normalmente e a amostra é omitida. Se o relógio retroceder, a duração é limitada a zero. A telemetria não pode interromper o caminho que está observando.

## Limites deliberados

Esta métrica é **global por instância do Bus**, não cria rótulos por nome de evento e não faz cardinalidade crescer com entrada externa. Ela não escolhe um `readiness` diferente, não cria `liveness`, não marca evento como lento e não promove qualquer autoridade.

A duração inclui despachos aninhados no tempo do evento pai. Isso representa o custo observado pelo chamador síncrono. Emissão depois de `await` continua sujeita às regras existentes de correlação; esta entrega não introduz `AsyncLocalStorage`, fila, retry ou alteração de semântica assíncrona.

`limpar()` remove também o resumo de latência. A operação continua sendo local, síncrona e sem escrita de rede, banco, storage ou provider.

## Relação com health

Latência é evidência operacional, não veredito automático. O campo `readiness` continua sendo determinado pela existência de ouvintes, e falhas de handler continuam aparecendo em motivos e contadores sem degradar o Bus por si só. Não foi escolhido um limiar como “acima de N milissegundos é unhealthy”, porque isso seria uma política de operação ainda não aprovada.

> **Observação não é autoridade:** `bus.saude()` informa estado do componente; não inicia, para, cancela, repete, autoriza ou publica uma operação.

## Verificação

Os testes focais cobrem média, mínimo, máximo, medição mesmo após exceção, relógio inválido, reset e preservação de readiness/ausência de autoridade. O contrato deve acompanhar os gates gerais da V2 antes de qualquer pré-release.

## O que permanece em aberto

A política de `retry` por classe de evento continua bloqueada. Também permanecem fora deste slice métricas remotas, persistência, dashboards operacionais, percentis, alertas, thresholds, backpressure novo e qualquer decisão de staging/RLS/Supabase. Essas extensões exigem contrato próprio e não devem ser inferidas deste resumo local.
