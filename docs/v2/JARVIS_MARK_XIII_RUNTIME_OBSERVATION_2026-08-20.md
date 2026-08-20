# JARVIS Mark XIII — Matriz de Observação do Runtime

**Data:** 20 de agosto de 2026  
**Status:** `PUBLICADO NO MAIN — GATES LOCAIS VERDES`
**SHA do marco funcional:** `c0e6607c69e4975af97a4628f1e7ba3633488748`
**Escopo:** console integrado da rota `/jarvis`, Event Bus V1 existente e health check manual; sem Auth/RLS, Supabase ou Billing remoto

## Objetivo

Este marco separa três coisas que anteriormente podiam parecer uma única mensagem visual: o núcleo gráfico local, um sinal de conectividade observado e a autoridade server-side. O console Mark XIII agora começa em `NÚCLEO VISUAL`, `REDE PENDENTE`, `SAÚDE OBS. UNKNOWN` e `AUTORIDADE NÃO AUTORIZADA`. Ele somente muda para uma observação conectada quando recebe um evento ou resultado de health que realmente fornece essa evidência.

> **Regra de governança:** observar uma conexão não autoriza um ator, não concede uma permissão, não promove um módulo e não prova que todos os serviços estão saudáveis.

## Contrato de estado

A projeção é definida por `MarkXiiiRuntimeObservation` em [`src/utils/jarvis-mark-xiii.ts`](../../src/utils/jarvis-mark-xiii.ts). O contrato possui `source`, `connection`, `health` e `detail`. `connection` aceita `unknown`, `connected` ou `disconnected`. `health` aceita `unknown`, `healthy`, `degraded`, `failed` ou `exhausted`. `runtimeAuthority` permanece sempre `not-authorized` nesta camada.

| Campo | Valores | Significado |
|---|---|---|
| `source` | `visual-only` | Nenhuma evidência externa foi recebida; é o estado inicial seguro. |
| `source` | `v1-nucleo-event` | A conectividade veio do evento existente `nucleo:status` do Event Bus V1. |
| `source` | `runtime-observed` | Um health check explícito respondeu e foi refletido no console. |
| `connection` | `unknown` | O console não deve adivinhar conectividade. |
| `connection` | `connected` | Uma fonte observou uma conexão; não significa health completo. |
| `connection` | `disconnected` | A fonte observou encerramento ou falha de conexão. |
| `health` | `unknown` | O sinal não mediu health. É o estado correto para conexão sem health. |
| `health` | `healthy` | O health check manual respondeu com a condição esperada. |
| `health` | `degraded` | O endpoint respondeu, mas informou uma dependência ausente, como chave Gemini. |
| `health` | `failed` | O health check não respondeu. |
| `runtimeAuthority` | `not-authorized` | A superfície visual não possui claims nem autoridade para controlar o Registry. |

## Severidade e fallback

A matriz agora também expõe `severity` e `fallback` como sinais de leitura. Esses campos ajudam a superfície a explicar o estado observado, mas não executam fallback operacional, não desabilitam botão e não mudam o modo do Registry.

| Condição observada | `severity` | `fallback` | Interpretação |
|---|---|---|---|
| Diagnóstico ausente ou estado ainda não medido | `info` | `available` para o visual local ou `unknown` para o Runtime | O console pode continuar desenhando, mas não deve afirmar health. |
| Runtime conectado, readiness healthy, sem falhas adversas | `none` | `available` | Estado observado saudável; autoridade permanece não autorizada. |
| Falha isolada, incidentes adversos ou readiness degradada | `warning` | `degraded` | A superfície pode informar degradação; promoção e disable continuam bloqueados. |
| Supervisor failed ou módulo exhausted/quarantined | `critical` | `blocked` | O sinal é grave, mas somente autoridade server-side pode decidir isolamento operacional. |
| Conexão desconectada sem health classificado | `info` | `blocked` | Desconexão observada não é automaticamente uma causa-raiz de health. |

Registros `healthy` gerados pelo `RuntimeHealth` são eventos normais do ciclo e não entram na contagem de incidentes adversos. Incidentes `failed` ou `exhausted` entram na matriz e alteram a projeção read-only.

## Fonte V1 compartilhada

A página importa o `bus` de [`src/core/events.js`](../../src/core/events.js), cuja implementação canônica está em TypeScript. Ela se inscreve em `nucleo:status`, sem criar um segundo Event Bus. O emissor existente em [`src/utils/nucleo-socket.js`](../../src/utils/nucleo-socket.js) publica `{ connected, url, detail }` quando o WebSocket do núcleo abre ou fecha.

Quando `connected` é verdadeiro, o console usa `source: v1-nucleo-event`, `connection: connected` e `health: unknown`. Quando a conexão fecha, usa `connection: disconnected` e mantém `health: unknown`, porque uma desconexão não permite inventar uma classificação de health.

## Health check explícito

No modo `servidor`, o botão `Testar conexão` já usa `healthCheckServer`. O resultado foi conectado à mesma projeção. Uma resposta com `hasKey` passa `connected + healthy`; uma resposta válida sem a chave passa `connected + degraded`; erro de rede passa `disconnected + failed`. Essas classificações descrevem somente o resultado daquela verificação e não promovem o servidor a autoridade do Registry.

O console informa a distinção na caption e exibe `SINAL OBSERVADO · SEM CLAIM`. A aparência de verde, dourado ou vermelho é apenas uma ajuda visual; a decisão operacional continua fora desta página, sujeita a health server-side, claims, auditoria, deep link, fallback e rollback.

## Fallback e compatibilidade

Sem evento e sem health check, o visual Mark XIII continua funcionando, mas permanece em estado pendente. O chat, sessões, modos de IA, memória, Spotify e o MPA V7 standalone permanecem preservados. Não houve alteração no contrato de Auth/RLS, no Supabase, no Billing, no Registry ou na sidebar V1.

O benchmark de performance usa contexto isolado com Service Worker bloqueado. Isso evita que a tela offline/cache de uma sessão anterior seja confundida com o build atual da rota. A evidência de inspeção contaminada foi registrada fora do repositório em `jarvis-observed-browser-finding.md` e não foi usada como conclusão funcional.

## Testes e evidência

O contrato estático está em [`test/jarvis-mark-xiii-console.test.js`](../../test/jarvis-mark-xiii-console.test.js). O benchmark está em [`scripts/jarvis-performance.mjs`](../../scripts/jarvis-performance.mjs). A integração V2 continua responsável pelo harness V2 e não foi transformada em uma segunda implementação de health para a rota V1.

Foram executados os cinco contratos direcionados do JARVIS, `npm run tipos:ts`, `npm run tipos:v2` e o benchmark isolado. A validação completa antes da publicação deverá repetir Nexus, tipos, testes, build, integração V2, smoke e caminho crítico.

## Adaptador compartilhado da V2

O contrato foi extraído para [`src/layout/runtime-observation.ts`](../../src/layout/runtime-observation.ts). A função `projectPlatformDiagnostic()` recebe o `PlatformDiagnostic` canônico da V2 e retorna a mesma projeção read-only usada pelo console: `source`, `connection`, `health`, `authority`, `detail`, `moduleCount` e `incidentCount`.

O harness V2 expõe `platformRuntimeObservation()` somente para testes de integração. Ele observa o diagnóstico da Plataforma, classifica registros `healthy` do Registry como estado normal — não como incidentes adversos — e mantém `authority: not-authorized`. O gate V2 confirma essa projeção junto com o boot, Runtime, Registry, router V1 e os demais contratos, totalizando `33/33` afirmações. Nenhum controle operacional foi delegado ao adaptador. Os testes unitários cobrem `healthy`, `degraded`, `failed`, `exhausted`, fallback e serialização da projeção.

## O que este marco não implementa

Este marco não implementa claims server-side, Auth/RLS, health persistente, ingestão do diagnóstico `PlatformDiagnostic` no shell público, promoção automática de módulos, disable/quarantine por cliente, telemetria remota, auditoria de atores ou autorização de ações. Ele projeta sinais já existentes no Event Bus V1, em um health check manual e no harness read-only da Plataforma V2.

## Rollback

Para reverter a ponte, remova `setRuntimeObservation` do console, a inscrição `nucleo:status` da página, o mapeamento do health check, os seletores CSS `data-runtime-*`, os testes correspondentes e esta documentação. Preserve o console visual, o orçamento adaptativo, o benchmark, a rota direta `/jarvis` e o MPA V7. Depois execute `git diff --check`, `npm run verificar-nexus`, `npm run tipos:ts`, `npm run tipos:v2`, `npm test`, `npm run build`, `npm run v2:integracao`, `npm run smoke` e `npm run caminho-critico`.

## Referências internas

[1]: ../../src/utils/jarvis-mark-xiii.ts "Contrato e projeção do console Mark XIII"

[2]: ../../src/pages/jarvis.ts "Página real do JARVIS e integração com o Event Bus"

[3]: ../../src/utils/nucleo-socket.js "Emissor V1 de nucleo:status"

[4]: ../../src/core/events.ts "Event Bus canônico"

[5]: ../../v2/core/plataforma.ts "Fachada V2 de diagnóstico não autoritativo"
