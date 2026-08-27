# Contrato — consistência do plano de dependências no Runtime Manager Group

**Data:** 2026-08-27
**Escopo:** `v2/core/runtime-manager-group.js`
**Estado:** slice bounded candidata à próxima prerelease; não encerra o Module System nem a V2.

## Decisão

`criarRuntimeManagerGroup()` valida, antes de executar `startAll()` ou `stopAll()`, que as duas projeções in-memory recebidas pelo grupo descrevem o mesmo plano: `dependencies.order()` fornece a ordem linear observada, enquanto `batches.batches()` fornece a partição em unidades de paralelismo.

A validação considera o plano coerente quando:

1. `order` e a concatenação dos batches têm exatamente os mesmos IDs, sem omissões, extras ou duplicatas;
2. nenhum batch é vazio;
3. quando o Registry fornecido contém entradas, ele descreve exatamente os mesmos IDs do plano;
4. quando essas entradas expõem `dependsOn`, cada dependência e seu consumidor aparecem no plano, a dependência precede o consumidor em `order` e ambos estão em batches distintos, com o batch da dependência vindo primeiro.

A sequência dos IDs **dentro de um mesmo batch não é comparada**. Esses módulos são a unidade de execução paralela, e a ordenação lexicográfica interna produzida por `criarRuntimeDependencyBatches()` pode diferir da ordem de registro preservada por `criarRuntimeDependencyGraph().order()` sem representar divergência. O grupo continua usando os batches fornecidos para executar o lifecycle; ele não reordena nem recalcula o grafo.

Quando a validação falha, o grupo lança `Error` com a mensagem `Plano de dependências e batches divergentes` e expõe em `error.details` somente as representações observadas: `{ order, batches }`. Nenhuma chamada a `manager.start()` ou `manager.stop()` é realizada nesse caso.

## Fonte de verdade e compatibilidade

A slice não duplica a política de construção do grafo nem a formação de batches. O Registry é usado para conferir a identidade dos módulos e, quando disponível, a precedência declarada em `dependsOn`. Um Registry vazio continua sendo aceito para preservar stubs estruturais já existentes nos testes do Group; nesse caso, a validação comprova apenas a consistência estrutural entre `order` e batches, sem inventar dependências que o stub não fornece.

A validação também não transforma uma divergência em uma nova ordem “corrigida”. O erro é antecipado e explícito, mantendo o diagnóstico reversível e evitando que o grupo execute um plano cuja origem não pode ser auditada.

## Invariantes preservadas

1. A ordem topológica continua pertencendo ao objeto `dependencies`; a slice não recalcula nem altera `criarRuntimeDependencyGraph()`.
2. Os batches continuam sendo a unidade de paralelismo; módulos do mesmo batch podem iniciar ou parar em paralelo conforme o contrato existente.
3. `startAll()` continua aguardando todos os resultados de cada batch, preservando rollback seletivo dos módulos realmente iniciados.
4. `readinessWait`, eventos estruturados e a ordem reversa de `stopAll()` não mudam quando o plano é consistente.
5. A validação não implementa `blocked`, `degraded` ou `ignore`; esses estados permanecem no contrato isolado de `runtime-dependency-state.js` até uma slice própria de wiring.
6. O erro de divergência não é convertido em sucesso, fallback silencioso ou reordenação automática.
7. `error.details` permanece bounded: não carrega stack trace, credenciais, objetos de runtime nem dados externos.

## Evidência local

O teste focal `test/v2/runtime-manager-group.test.js` cobre a recusa antecipada de uma precedência invertida, preserva `error.details`, comprova ausência de chamadas a `start`/`stop`, aceita independentes registrados como `b,a` quando o batch os apresenta como `a,b` e rejeita IDs repetidos antes do lifecycle.

O conjunto focal ampliado de Group, lifecycle, observability, readiness, falhas concorrentes, batches e dependências passou **24/24** após a correção. A sequência local completa passou `diff-check`, `tipos:ts`, `tipos:v2`, `test`, `build`, `v2:integracao`, `smoke`, `caminho-critico`, `prova-offline`, `sonda-memoria` e Security Contracts. O Doctor `verify:v2` permaneceu honesto em `exit=2`, conforme o bloqueio conhecido de capacidade externa no sandbox; esse estado não é convertido em verde.

A evidência remota, o SHA de integração, a backup pré-merge e qualquer tag/release devem ser registrados somente depois da PR, dos checks aplicáveis e do pós-merge real. Esta nota, por si só, não autoriza merge nem publicação.

## Limites

A slice não adiciona persistência, migração, autoridade server-side, tenancy, ownership, billing, retry distribuído, automação externa, Supabase, MCP, OpenClaw, Hermes, Knowledge Mesh ou Risk Engine. Ela também não declara o grupo como concluído: apenas fecha uma inconsistência observável entre duas representações in-memory do plano de startup/shutdown.

A validação não reexecuta o algoritmo topológico do grafo. Ela verifica somente as propriedades que podem ser demonstradas com segurança pelas interfaces atuais: identidade dos módulos, unicidade, precedência declarada pelo Registry quando disponível e separação por batches. Qualquer política de estados efetivos (`blocked`, `degraded`, `ignore`) permanece fora desta slice.

## Rollback

O rollback é um `git revert` normal do squash merge da PR desta slice. Não há migration nem dado persistente para restaurar. A backup pré-merge deve apontar para o SHA real da `main` imediatamente anterior ao merge; uma branch que aponte para o head da PR não substitui essa referência.

— **Manus AI**
