# Contrato V2 — Runtime Restart Single-Flight

**Marco:** `runtime-restart-single-flight`
**Data:** 2026-08-27
**Autor:** Manus AI
**Estado:** slice local em validação; não é release e não fecha a V2

## Objetivo

O helper `criarRuntimeRestart()` já possuía orçamento bounded de falhas e backoff exponencial. Faltava impedir que dois consumidores que observassem a mesma falha ao mesmo tempo iniciassem duas sequências concorrentes de `parar → esperar → iniciar` para o mesmo módulo. Esta slice adiciona single-flight por `id`: enquanto existe uma operação de restart em andamento para um módulo, chamadas subsequentes compartilham a mesma `Promise` e observam o mesmo resultado.

A unidade é deliberadamente pequena e permanece no Core local. Ela não liga automaticamente o helper ao boot, ao Supervisor ou a um provider externo; o `RuntimeManager` continua recebendo o restart por injeção. Não há rede, persistência, fila remota, retry implícito, nova autoridade ou mudança de contrato da V1.

## API e semântica

| Elemento | Contrato |
|---|---|
| Entrada | `reiniciar(id, error)` continua aceitando o identificador do módulo e a falha observada |
| Primeira chamada livre | marca a falha no `RuntimeHealth`, calcula o backoff bounded, para, espera e inicia o módulo |
| Chamada concorrente para o mesmo `id` | retorna exatamente a mesma `Promise` da operação em andamento; não chama `marcarFalha`, `parar`, `sleep` ou `iniciar` novamente |
| Chamadas para `id` diferentes | podem progredir independentemente, pois o single-flight é por módulo |
| Operação encerrada | a chave é removida em `finally`; uma chamada posterior inicia uma nova operação e uma nova avaliação do orçamento |
| Orçamento esgotado | preserva `{ restarted: false, reason: 'restart_budget_exhausted' }` |
| Falha de stop/sleep/start | a rejeição original atravessa a API e o estado single-flight é liberado; não há erro engolido |

## Invariantes

A sequência bem-sucedida continua sendo exatamente `RuntimeHealth.marcarFalha → RuntimeSupervisor.parar → sleep → RuntimeSupervisor.iniciar → RuntimeHealth.marcarSaudavel`. Para um mesmo módulo, no máximo uma sequência dessa cadeia fica em andamento. Uma observação duplicada não consome duas posições do orçamento e não sobrepõe lifecycle. A política de backoff e o limite de restarts existentes não foram alterados.

O single-flight não transforma uma falha em sucesso. Se o Supervisor ou a espera falhar, todos os consumidores que receberam a promessa compartilhada observam a mesma rejeição, enquanto a limpeza em `finally` permite uma decisão posterior explícita. O helper continua sendo uma orquestração in-memory, não um mecanismo distribuído de deduplicação.

## Validação

O teste focal cobre três propriedades: cleanup e backoff de uma operação simples; crescimento do backoff entre operações sequenciais; e concorrência do mesmo módulo, provando identidade da promessa, uma única entrada em `stop`, um único atraso, um único consumo do orçamento e estado saudável ao final. A cobertura de integração do `RuntimeManager` continua preservada porque o contrato de injeção não mudou.

## Fora do escopo

Esta slice não adiciona restart automático por evento, políticas por classe de erro, persistência de incidentes, métricas remotas, locks distribuídos, execução em múltiplos processos, supervisão de módulos dependentes, Auth, RLS, tenancy, ownership, billing, OpenClaw, Hermes, Knowledge Mesh, Risk Engine, shell V1 ou aceite físico desktop/mobile.

## Rollback

O rollback é um `git revert` normal do commit desta slice, ou do squash merge que a integrar na `main`. O revert remove somente a tabela in-memory `emAndamento`, a função de execução interna e o teste de concorrência, retornando ao comportamento anterior de restart independente. Não há migration, dado persistente, tag ou release para desfazer nesta etapa.

— **Manus AI**
