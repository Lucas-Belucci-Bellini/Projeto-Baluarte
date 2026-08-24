# UI-03 — Observação do Registry no Shell

**Status:** `IMPLEMENTED — OBSERVATION MODE`

**Data:** 20 de agosto de 2026

**Escopo:** conectar a navegação publicada pelo Boot V2 a um observador de paridade, sem substituir `renderSidebar()`, sem alterar `src/main.js` e sem esconder rotas para usuários normais.

## Resultado

O novo módulo `src/layout/registry-observer.ts` consome os `RegistryNavigationEntry[]` entregues pelo callback `BootAdapters.renderNav`. Ele gera a projeção Registry com `projectRegistryNavigation()`, gera uma projeção somente leitura do catálogo `NAV_GROUPS` e compara paths, rótulos, ícones e domínios.

O observador não monta elementos, não registra rotas, não calcula permissões, não consulta `localStorage`, não interpreta papel de usuário e não transforma estabilidade em health. Seu único estado é o último retrato observado, exposto no harness para asserções de integração.

A ligação operacional foi feita em `v2/harness/main.js`, que passa a chamar `navigationObserver.observe(itens)` dentro do callback já existente do Boot. A superfície `#nav` continua pertencendo exclusivamente ao banco de prova V2; o shell real V1 e sua sidebar não são tocados.

## Paridade

Há duas provas diferentes, porque o estado atual do Registry não contém todo o catálogo V1.

| Prova | Resultado | Significado |
|---|---:|---|
| Fixture unitária Registry↔`NAV_GROUPS` | 1/1 exata | O comparador detecta paridade completa quando os contratos representam o mesmo catálogo |
| Integração no harness V2 | 1/1 parcial explícita | Os cinco módulos V2 são observados, com paths compartilhados e divergências visíveis |

No harness, a projeção atual contém `/militar`, `/editor`, `/cripto`, `/briefing` e `/visor3d`. Ela compartilha `/editor`, `/cripto` e `/militar` com o catálogo V1, mas também possui entradas exclusivas e encontra diferenças de nomes/domínios em módulos que ainda não foram alinhados. Isso é uma divergência arquitetural observada, não um motivo para fingir paridade total nem para substituir a sidebar.

> A paridade total só poderá ser declarada quando o conjunto de módulos do Registry e o catálogo de navegação pública tiverem a mesma cobertura e os mesmos metadados por decisão documentada.

## Contrato do observador

`NavigationObservation` contém:

| Campo | Finalidade |
|---|---|
| `source` | Identifica o retrato como `registry-observer` |
| `projection` | Projeção Registry com `source: registry` por entrada |
| `legacyProjection` | Projeção derivada de `NAV_GROUPS`, sem mutá-la |
| `parity.exact` | Só `true` quando não existem entradas exclusivas nem metadados divergentes |
| `registryOnly` | Paths que já existem no Registry mas ainda não no catálogo V1 |
| `legacyOnly` | Paths V1 ainda não publicados pelo Registry |
| `mismatches` | Paths compartilhados com diferença de `label`, `icon` ou `domainId` |

O comparador preserva a ordem da projeção recebida e não faz reconciliação automática. A ausência de um path não é corrigida silenciosamente; ela aparece no retrato para orientar o próximo slice.

## Correção encontrada durante a implementação

A primeira asserção browser de UI-03 exigia que o Registry tivesse somente paths já presentes na sidebar V1. O próprio harness demonstrou que essa hipótese era incorreta: `/briefing` e `/visor3d` são módulos V2 válidos e ainda não fazem parte do catálogo V1. A asserção foi corrigida para exigir o comportamento real e mais seguro: paths compartilhados conhecidos, entradas `legacyOnly` e `registryOnly` visíveis e nenhum erro de JavaScript.

Esse episódio foi registrado como **efeito de teste excessivamente rígido**, não como defeito do Registry. A divergência permanece observável e deve ser resolvida por alinhamento de catálogo, não por filtragem no cliente.

## Segurança e disponibilidade

UI-03 não concede acesso. A proteção de rota continua no router/Runtime e a autoridade de permissão continua fora da projeção visual. Um módulo `beta` continua podendo ser `planned`; `disabled`, `maintenance`, `quarantined` e `degraded` continuam exigindo uma fonte de health/autoridade adequada.

Nenhum estado do retrato pode ser usado para liberar uma rota protegida. O observador também não deve receber segredos, tokens OAuth, dados pessoais ou stack traces. Diagnóstico operacional deve permanecer em superfícies autorizadas.

## Gates executados

| Gate | Resultado |
|---|---:|
| `npx tsx --test test/ui-navigation.test.js` | 8/8 |
| `npm run tipos:ts` | verde |
| `npm run tipos:v2` | verde |
| `npm run v2:integracao` após a correção | 22/22 |
| `npm run verificar-nexus` | será repetido antes do commit |
| `npm test` | será repetido antes do commit |
| `npm run build` | será repetido antes do commit |
| `npm run smoke` | será repetido antes do commit |
| `npm run caminho-critico` | será repetido antes do commit |

O runtime Rust local continua com a limitação ambiental conhecida: Cargo 1.75.0 não interpreta a metadata `edition2024` do `getrandom 0.4.3`. O workflow remoto V2 Runtime do commit UI-02 passou; nenhum gate será mascarado para ocultar a diferença entre ambiente local e CI.

## Fora do escopo

Não houve alteração em `src/main.js`, `src/layout/shell.ts`, `src/layout/sidebar.ts`, rotas públicas, Auth, RLS, Supabase, Billing, health server-side, tratamento de deep links ou visibilidade de módulos para usuários normais.

## Próximo marco

O próximo slice é **UI-04 — reconciliação controlada de catálogo**, começando pela definição de quais módulos V2 têm superfície de navegação pública e quais são internos/experimentais. A reconciliação deve produzir uma matriz explícita antes de qualquer troca visual da sidebar.

## Referências

[1]: ./PHASE_UI_DESIGN_SYSTEM.md "PHASE UI — Design System e roteiro"
[2]: ./UI_02_AVAILABILITY_PILOT_2026-08-20.md "UI-02 — piloto de Registry e disponibilidade"
[3]: ../../src/layout/registry-observer.ts "Contrato do observador UI-03"
[4]: ../../src/layout/navigation.ts "Projeção legada e Registry"
[5]: ../../v2/core/boot.ts "Boot V2 e BootAdapters"
[6]: ../../v2/harness/main.js "Harness de integração V2"
[7]: ../../scripts/v2-integracao.mjs "Gate de integração browser V2"
