# MAIN ERROR AUDIT

Audited commit:
`1fe3346866f3b93105190b925a7f15c40eb0aea4`

Status:
**AUDIT ONLY — NO FIXES**

Purpose:
Mapear causas raiz e efeitos cascata antes da próxima rodada de correções.

> **Regra desta auditoria:** nenhum código, teste, configuração, dependência ou workflow foi corrigido. O único artefato criado é este relatório. Um smoke de rotas gerou temporariamente dois relatórios versionados; eles foram restaurados imediatamente, e a `main` terminou sem diff de código ou configuração.

## 1. Resumo executivo

A auditoria foi executada sobre a `main` no commit `1fe3346866f3b93105190b925a7f15c40eb0aea4`, o merge de `v2/js-specialist-contract-hardening` publicado em 13 de agosto de 2026. No início e no fim, `HEAD` e `origin/main` apontaram para o mesmo SHA, e o workspace ficou limpo antes da criação deste relatório.

Foram observadas **80 falhas brutas de produto ou contrato**: 6 testes JavaScript, 71 diagnósticos TypeScript/JSDoc e 3 testes de processo Rust. Elas não representam 80 defeitos independentes. O agrupamento por evidência reduz o quadro a **11 famílias de causa raiz de produto/contrato**: uma incompatibilidade arquitetural de Supervisor/Health, uma entrada de processo Rust ausente, oito famílias de contratos JSDoc/TypeScript e uma dívida de dependências de desenvolvimento. Há ainda um problema de ambiente local do Cargo, que é relevante para reprodução, mas não é uma causa do código publicado.

Os **6 testes JavaScript** são um único cluster funcional: a composição atual exige um monitor de saúde com `definirEstado()` e `retrato()`, enquanto `criarMonitorSaude()` entrega `verificar()`. Os seis testes falham antes de testar suas próprias intenções. Os **3 testes Rust** e o smoke E2E também são um cluster: o binário `v2/runtime/src/main.rs` é apenas um banner e não inicia o loop JSON do protocolo. As demais 71 mensagens do TypeScript/JSDoc são oito grupos de contratos locais, não 71 causas independentes.

### Placar geral

| Dimensão | Resultado | Classificação |
| --- | --- | --- |
| Testes JavaScript agregados | 865 pass, 6 fail, de 871 | Vermelho; 1 causa raiz arquitetural principal |
| TypeScript/JSDoc V2 | 71 diagnósticos em 14 arquivos | Vermelho; 8 famílias de contrato |
| Runtime Rust estável | 7 testes de biblioteca verdes, 3 testes de processo vermelhos | Vermelho; binário não conectado ao protocolo |
| Build Vite | Passou | Verde; apenas warning de chunks grandes |
| V2 integração browser | 13/13 localmente | Verde neste vertical slice |
| Event Bus | 20/20 | Verde |
| Health/Supervisor/Restart isolados | 22/22 | Verde nos testes isolados; a composição com Platform/Orquestrador falha |
| Session/Transport/Bridge | 25/25 | Verde |
| Data/Storage | 42/42; catálogo com 72 chaves verde | Verde |
| Supabase/SQL/RLS | 18/18 | Verde; nenhum erro real nessa camada |
| Arma 3/Python/Data CI | Todos os cinco verificadores Python passaram; `verificar-arma3` sem diff gerado | Verde |
| Dependências de produção | `npm audit --omit=dev`: 0 vulnerabilidades | Verde |
| Dependências de desenvolvimento | 6 vulnerabilidades: 4 high e 2 moderate | Dívida de segurança não bloqueante no workflow atual |

## 2. Snapshot auditado e ambiente

| Campo | Valor |
| --- | --- |
| Repositório | [Lucas-Belucci-Bellini/Projeto-Baluarte][1] |
| Branch | `main` |
| SHA auditado | `1fe3346866f3b93105190b925a7f15c40eb0aea4` |
| Commit | `merge: integrar hardening do especialista JS V2` |
| Pais do merge | `915bcfe7` e `fe692647` |
| Timestamp final da auditoria | `2026-08-13T23:59:03+00:00` |
| Estado final do workspace antes deste relatório | `main...origin/main`, sem diff |

As versões observadas foram Node `v22.13.0`, npm `10.9.2`, Python `3.12.3`, TypeScript `7.0.2`, Playwright `1.62.1`, Vite `5.4.21` e Git `2.43.0`. O Cargo do sistema é `1.75.0`, enquanto o toolchain Rustup disponível é Cargo/Rust `1.97.1`.

O Cargo `1.75.0` não consegue reproduzir o Runtime porque não entende a edição 2024 exigida por `getrandom 0.4.3`; isso produz erro de lockfile/manifesto. O Rust estável `1.97.1`, que corresponde ao toolchain usado pelos workflows, compila o crate e expõe as três falhas reais do protocolo de processo. O problema de Cargo 1.75 foi registrado como **ENV-RUST-001**, não como defeito do produto.

## 3. Comandos executados e resultados

### 3.1. Gates principais

| ID | Comando | Exit | Resultado resumido |
| --- | --- | ---: | --- |
| CMD-001 | `npm test` | 1 | 871 testes; 865 pass, 6 fail |
| CMD-002 | `npm run tipos:v2` | 1 | 71 diagnósticos TypeScript/JSDoc |
| CMD-003 | `npm run build` | 0 | Build passou; warning de chunks acima de 500 kB |
| CMD-004 | `npm run v2:integracao` | 0 | 13/13 verificações passaram |
| CMD-005 | `npm run v2:runtime` com Cargo 1.75 | 101 | Toolchain não entende `edition2024` |
| CMD-006 | `npm run v2:runtime` com Cargo 1.97.1 | 101 | 7 testes de biblioteca pass; 3 testes de processo fail |

### 3.2. Testes por camada

| Camada | Comando/escopo | Resultado |
| --- | --- | --- |
| Event Bus | `bus.test.js`, `module-runtime-events.test.js`, `runtime-state-events.test.js` | 20/20 |
| Boot/Registry/Platform | `boot`, `registry`, `runtime-bootstrap`, `orquestrador`, `plataforma`, `ciclo` | 56 pass, 6 fail |
| Health/Supervisor/Restart | `saude`, `supervisor`, `runtime-supervisor`, `module-runtime-health`, `module-runtime-restart`, `module-runtime-supervisor` | 22/22 |
| Session/Transport/Bridge | `runtime-bridge`, `runtime-request-client`, `runtime-session-client`, `runtime-session`, `runtime-transport-security`, `runtime-transport` | 25/25 |
| Data Layer | `test/storage`, `storage-namespace`, `v2/trabalho` | 42/42 |
| Supabase/SQL/RLS | `test/security/supabase-contract`, `tenant-isolation-contract`, `supabase-timeout` | 18/18 |
| Smoke de rotas | `npm run smoke` | 98/98; o relatório gerado temporariamente foi restaurado |
| Jornada crítica | `npm run caminho-critico` | 15/15 |
| Memória | `npm run sonda-memoria` | Passou; nenhum timer, loop ou áudio acumulado |
| Offline | `npm run prova-offline` | 9/9 |
| Nexus | `npm run verificar-nexus` | 98 rotas, 96 com domínio, 0 lacunas |
| Python/Data | `compileall`, parsers, imagens, pipeline e modelos Arma 3 | Todos exit 0 |
| Bases geradas | `npm run verificar-arma3` em worktree descartável | Exit 0; `src/data` e `public/arma3` sem diff |

### 3.3. Dependências

| Comando | Resultado | Interpretação |
| --- | --- | --- |
| `npm audit --omit=dev --audit-level=high` | Exit 0; 0 vulnerabilidades | Nenhuma vulnerabilidade alta ou crítica chegou à dependência de produção analisada |
| `npm audit --audit-level=high` | Exit 1; 6 vulnerabilidades | 4 high e 2 moderate somente no conjunto completo, tratado como informativo pelo CI |
| `gen-tabela-estabilidade.mjs --verificar` | Exit 0 | Política e tabela sincronizadas |
| `gen-catalogo-eventos.mjs --verificar` | Exit 0 | 19 eventos e 8 namespaces sincronizados |
| `gen-catalogo-storage.mjs --verificar` | Exit 0 | 72 chaves de storage sincronizadas |

As vulnerabilidades de desenvolvimento estão em `brace-expansion`, `esbuild` via `vite`, `nanoid`, `postcss` e `tar`. O `npm audit fix --force` sugere upgrade de Vite para uma versão breaking; portanto, não deve ser executado como correção automática durante a próxima rodada.

## 4. Matriz de causas raiz

### ROOT-SUP-001 — Contrato Supervisor/Health incompatível

| Campo | Registro |
| --- | --- |
| Workflow/comando | `npm test`, `V2 Core`, `Core CI`, `CI` |
| Arquivos | `v2/core/supervisor.js:10-12`, `v2/core/saude.js:69-79`, `v2/core/plataforma.js:35-37`, `v2/core/orquestrador.js:15-24` |
| Funções | `criarSupervisor`, `criarMonitorSaude`, `criarPlataforma`, `criarOrquestrador` |
| Mensagem | `TypeError: Supervisor exige monitor de saúde` |
| Categoria | Contrato arquitetural de lifecycle/health |
| Severidade | Alta; impede as fachadas Platform/Orquestrador de serem montadas |
| Causa raiz | `criarSupervisor()` exige `saude.definirEstado` e `saude.retrato`, mas `criarMonitorSaude()` retorna somente `verificar()` |
| Efeitos cascata | Seis testes: os três de `orquestrador.test.js` e os três de `plataforma.test.js` falham antes de executar o comportamento pretendido |
| Dependências afetadas | Platform, Orquestrador, diagnóstico, health e estado público do supervisor |
| Contrato adicional | Os testes esperam `supervisor.estado` como propriedade, enquanto o supervisor atual expõe `estado()` como função; isso deve ser resolvido na mesma decisão de API |
| Correção sugerida | Definir uma única interface de Health e uma única forma de expor estado; adaptar composição e testes sem esconder tipos com `any` |
| Testes posteriores | `node --test test/v2/orquestrador.test.js test/v2/plataforma.test.js test/v2/supervisor.test.js test/v2/saude.test.js`; depois `npm test`, `npm run tipos:v2`, `npm run v2:integracao` |

Este é um **contrato arquitetural**, não seis defeitos locais. O supervisor isolado passa 22 testes porque os testes isolados fornecem a forma de Health esperada; a falha aparece quando as fachadas usam o monitor real.

### ROOT-RUNTIME-001 — Binário Rust não conecta o protocolo ao processo

| Campo | Registro |
| --- | --- |
| Workflow/comando | `V2 Runtime`, `V2 Runtime E2E`, `npm run v2:runtime` com Rust 1.97.1 |
| Arquivos | `v2/runtime/src/main.rs:2-3`, `v2/runtime/src/protocol.rs:30-46`, `v2/runtime/tests/protocol_process.rs:18-70`, `scripts/v2-runtime-smoke.mjs:15-69` |
| Funções | `main`, `protocol::handle`, `spawn_runtime`, `enviar` |
| Mensagens | Falta de `INVALID_JSON`, falta de `authorized`, falta de `REQUEST_TOO_LARGE`, `Broken pipe` |
| Categoria | Contrato arquitetural de Runtime/stdio |
| Severidade | Crítica para o Runtime executável; a biblioteca ainda passa seus testes |
| Causa raiz | `main.rs` apenas imprime `baluarte-runtime v0.1.0`; não lê stdin, não chama `protocol::handle` e não produz respostas JSON por linha |
| Efeitos cascata | `process_rejects_invalid_json_and_continues`, `process_ignores_blank_lines`, `process_rejects_oversized_request_and_continues` e o smoke JS E2E |
| Dependências afetadas | Runtime Host, protocolo, transport stdio, Session/Bridge E2E |
| Correção sugerida | Implementar o loop de processo conforme o contrato existente, mantendo respostas de erro e continuidade após linha vazia, JSON inválido e request acima do limite |
| Testes posteriores | `cargo test --all-targets`, `cargo clippy --all-targets --all-features -- -D warnings`, `node scripts/v2-runtime-smoke.mjs`, `npm run v2:runtime` |

`v2/runtime/src/protocol.rs` e os 7 testes de biblioteca estão verdes. Isso indica que o primeiro alvo não é reescrever o Host ou a política, mas ligar a entrada do binário à biblioteca já existente.

### TYPE-STDIO-001 — Transporte stdio sem ambiente Node tipado e sem anotações

| Campo | Registro |
| --- | --- |
| Diagnósticos | 28 de 71 |
| Arquivo/linhas | `v2/core/runtime-stdio.js:9-107` |
| Funções | `respostaError`, `parseResposta`, `criarRuntimeStdio`, `iniciar`, `enviar`, `autorizar`, `lerArquivo`, `fechar` |
| Mensagens | `Cannot find name 'node:child_process'`, `Cannot find name 'node:readline'`, `Cannot find name 'process'`, parâmetros e variáveis implicitamente `any`, `error` como `unknown` |
| Categoria | Contrato JSDoc/ambiente de execução |
| Severidade | Alta para o gate de tipos; runtime unitário do transporte passa |
| Causa raiz | O arquivo Node está dentro do escopo `checkJs`, mas o `jsconfig` não fornece os tipos Node e o estado de `child`, `lines`, `pending` e callbacks não está anotado |
| Cascata | 28 mensagens do mesmo transporte e falha do gate `tipos:v2`; não há falha isolada em `runtime-transport.test.js` |
| Correção sugerida | Modelar tipos mínimos de ChildProcess/Interface/pending ou configurar tipos Node de forma restrita ao transporte, sem `any` global |
| Testes posteriores | `npm run tipos:v2`, `node --test test/v2/runtime-transport.test.js test/v2/runtime-transport-security.test.js test/v2/runtime-bridge.test.js`, smoke E2E |

### TYPE-VERTICAL-001 — Vertical Slice sem contrato dos módulos e hooks

| Campo | Registro |
| --- | --- |
| Diagnósticos | 11 de 71 |
| Arquivo/linhas | `v2/core/vertical-slice.js:7-43` |
| Funções | `criarVerticalSlice`, `iniciar`, `parar` |
| Mensagens | Parâmetros `registry`, `permissoes`, `runtimeSession` e `id` implicitamente `any`; `init`, `start`, `dispose` e `stop` não existem em `{}` |
| Categoria | Contrato JSDoc de módulo/vertical slice |
| Severidade | Média no runtime atual; alta no gate de tipos |
| Causa raiz | `hooks` e módulos são inferidos como `{}`/`any` em vez de uma interface lifecycle explícita |
| Cascata | 11 diagnósticos; não há falha nos testes browser 13/13 |
| Correção sugerida | Definir tipos de módulo e hooks com lifecycle completo e resultado de sessão |
| Testes posteriores | `node --test test/v2/vertical-slice.test.js test/v2/contract-slice.test.js`, integração 13/13 e `npm run tipos:v2` |

### TYPE-SUP-001 — Supervisor global e Runtime Supervisor com snapshots incompletos

| Campo | Registro |
| --- | --- |
| Diagnósticos | 12 de 71: 9 em `supervisor.js` e 3 em `runtime-supervisor.js` |
| Arquivos | `v2/core/supervisor.js:10-83`, `v2/core/runtime-supervisor.js:24-42` |
| Funções | `criarSupervisor`, `mudar`, `iniciar`, `parar`, `status`, `criarRuntimeSupervisor`, `snapshot` |
| Mensagens | `boot`/`saude`/`novo` implicitamente `any`; `inicio`/`ultimaFalha` sem tipo; opções obrigatórias ausentes; `modules` como `unknown[]` não atribuído a `{id,state}[]`; chamada com aridade incompatível |
| Categoria | Contrato JSDoc de lifecycle e observabilidade |
| Severidade | Alta; combina com ROOT-SUP-001 |
| Causa raiz | A implementação e os tipos não concordam sobre opções, estado, health e forma do snapshot |
| Cascata | Mantém o gate TypeScript vermelho e pode esconder divergências de estado depois que a composição for corrigida |
| Correção sugerida | Consolidar typedefs de Boot/Health/Snapshot e decidir o API de estado antes de anotar retornos |
| Testes posteriores | Supervisor, plataforma, orquestrador, runtime-supervisor e `npm run tipos:v2` |

### TYPE-GROUP-001 — Snapshot e status de grupos com dependências opcionais e módulos `unknown`

| Campo | Registro |
| --- | --- |
| Diagnósticos | 5 de 71: 3 em `runtime-group-snapshot.js` e 2 em `runtime-group-status.js` |
| Arquivos | `v2/core/runtime-group-snapshot.js:16-30`, `v2/core/runtime-group-status.js:19-37` |
| Funções | `criarRuntimeGroupSnapshot`, `snapshot`, `criarRuntimeGroupStatus` |
| Mensagens | `registry`/`batches` possivelmente `undefined`; arrays `unknown[]` incompatíveis com `{id,state}[]` |
| Categoria | Contrato de estado coletivo |
| Severidade | Média |
| Causa raiz | Assinaturas aceitam `Partial<Options>`/default `{}`, mas retornam contratos que exigem dependências e itens fortemente tipados |
| Cascata | 5 diagnósticos; afeta consumidores de observabilidade e status, não o teste de grupo isolado |
| Correção sugerida | Separar opções de construção opcionais de dependências validadas e tipar os elementos retornados |
| Testes posteriores | Testes `runtime-group-snapshot`, `runtime-group-status`, `lifecycle-status`, `runtime-manager-group` e `tipos:v2` |

### TYPE-MGROUP-001 — Manager de grupos com defaults, PromiseSettled e AggregateError não tipados

| Campo | Registro |
| --- | --- |
| Diagnósticos | 3 de 71 |
| Arquivo/linhas | `v2/core/runtime-manager-group.js:22`, `66`, `73` |
| Funções | `criarRuntimeManagerGroup`, `startAll`, `stopAll` |
| Mensagens | `{}` não contém `manager`, `registry`, `dependencies`, `batches`; `reason` não existe em `PromiseSettledResult` sem narrowing; `details` não existe em `AggregateError` |
| Categoria | Contrato de orquestração de grupos |
| Severidade | Média/alta para rollback e shutdown |
| Causa raiz | Tipos declarados como obrigatórios são tratados com default vazio; narrowing e extensão de AggregateError não foram formalizados |
| Cascata | Pode bloquear o gate de tipos mesmo quando os testes de concorrência passam |
| Correção sugerida | Validar opções antes da execução, usar narrowing por `status === 'rejected'` e definir um erro agregado próprio ou tipo estendido seguro |
| Testes posteriores | Todos os `runtime-manager-group*.test.js`, especialmente concorrência e rollback, e `tipos:v2` |

### TYPE-READY-001 — Manager/readiness com opções e retornos incompatíveis

| Campo | Registro |
| --- | --- |
| Diagnósticos | 5 de 71: 2 em `runtime-manager.js`, 2 em `runtime-module-readiness.js`, 1 em `runtime-readiness-wait.js` |
| Arquivos | `v2/core/runtime-manager.js:12-47`, `runtime-module-readiness.js:9-25`, `runtime-readiness-wait.js:19` |
| Funções | `criarRuntimeManager`, `restartModule`, `status`, `criarRuntimeReadiness`, `ready`, `assertReady`, `esperarRuntimeReady` |
| Mensagens | Opções `{}` sem `supervisor/restart/health` ou `readiness/id`; `manager` possivelmente undefined; `boolean` não atribuível a `true`; retorno de restart não contém `id/lifecycle/health` no nível esperado |
| Categoria | Contrato de lifecycle/restart/readiness |
| Severidade | Média |
| Causa raiz | Defaults opcionais e tipos de retorno foram escritos para APIs diferentes: objeto aninhado versus status achatado e `boolean` versus literal `true` |
| Cascata | 5 diagnósticos; pode reaparecer quando o supervisor global passar a consumir restart/readiness |
| Correção sugerida | Validar opções no limite, alinhar a forma do status de restart e distinguir predicado booleano de função pós-condição |
| Testes posteriores | `runtime-manager`, `runtime-module-readiness`, `runtime-readiness-wait`, `module-runtime-restart`, `runtime-manager-group*` e `tipos:v2` |

### TYPE-SESSION-001 — Session client com parâmetros implícitos e resposta de autorização ampla demais

| Campo | Registro |
| --- | --- |
| Diagnósticos | 3 de 71 |
| Arquivo/linhas | `v2/core/runtime-session-client.js:37-54` |
| Funções | `lerArquivo`, `abrir`, `fechar` |
| Mensagens | `modulo` e `path` implicitamente `any`; retorno pode ser `{status: string}` mas a assinatura promete apenas `RuntimeSessionSuccessResponse` |
| Categoria | Contrato de Session/Transport |
| Severidade | Média; a camada de testes está verde |
| Causa raiz | O ramo de sessão já aberta devolve um shape mais amplo que o typedef do sucesso |
| Cascata | 3 diagnósticos no gate; não há falha nos 25 testes de Session/Transport/Bridge |
| Correção sugerida | Tipar parâmetros e separar resposta idempotente de resposta de autorização nova, sem alargar tudo para `any` |
| Testes posteriores | `runtime-session`, `runtime-session-client`, `runtime-request-client`, transport/security e `tipos:v2` |

### TYPE-BOUNDARY-001 — Referências de Boot/Registry/Platform/Transport divergentes

| Campo | Registro |
| --- | --- |
| Diagnósticos | 4 de 71: `boot.js` 1, `plataforma.js` 2, `runtime-transport.js` 1 |
| Arquivos/linhas | `v2/core/boot.js:79-81`, `v2/core/plataforma.js:13,35-37`, `v2/core/runtime-transport.js:15-16` |
| Funções | `criarBoot`, `criarPlataforma`, `criarRuntimeGroupStatus`, `serializarCargaRuntime` |
| Mensagens | `RuntimeBootRegistry` sem as propriedades do Registry completo; namespace sem `criarRegistry`; `boot.ciclo` como `object` sem `vivos/falhas/fase`; `unknown` não atribuível a `RuntimeGrant[]` |
| Categoria | Contrato de fronteira entre Core e tipos |
| Severidade | Alta para o gate, baixa para runtime atual |
| Causa raiz | O Registry real possui `criarRegistry()` e os métodos selados, mas os typedefs do consumidor apontam para uma forma incompleta ou importam o namespace de modo inadequado |
| Cascata | 4 diagnósticos; pode mascarar o ROOT-SUP-001 e contaminar Platform/Boot/Transport |
| Correção sugerida | Referenciar os tipos reais do Registry/Boot e validar o payload antes da serialização, sem reescrever o Registry que já passa seus testes |
| Testes posteriores | `boot`, `registry`, `runtime-bootstrap`, `runtime-transport`, `runtime-bridge`, `plataforma`, `orquestrador`, `tipos:v2` |

### DEP-001 — Vulnerabilidades de desenvolvimento

| Campo | Registro |
| --- | --- |
| Comando | `npm audit --audit-level=high` |
| Resultado | 6 vulnerabilidades: 4 high e 2 moderate |
| Pacotes | `brace-expansion`, `esbuild` via `vite`, `nanoid`, `postcss`, `tar` |
| Categoria | Dependência/transitiva; não é falha de produção observada |
| Severidade | Média no estado atual; high por advisory, mas fora do bundle de produção auditado |
| Causa provável | Dependências de build/CLI não atualizadas no lockfile |
| Cascata | Nenhum gate funcional; o workflow marca o audit completo como informativo |
| Correção sugerida | Planejar atualização de lockfile por pacote e revalidar build; não usar `npm audit fix --force` sem revisar o upgrade breaking de Vite |
| Testes posteriores | `npm ci`, ambos os `npm audit`, `npm run build`, `npm test`, `npm run tipos:v2` |

## 5. Efeitos cascata versus causas independentes

### Cluster de Supervisor

Os seis testes vermelhos são:

```text
orquestrador inicia e para sem duplicar responsabilidade
 diagnostico agrega supervisor, boot e health
falha do boot sobe para o supervisor
fachada expõe saúde e lifecycle no diagnóstico
iniciar delega ao Supervisor e preserva falhas como degraded
parar delega ao Supervisor
```

Todos falham em `criarSupervisor()` com a mesma mensagem, `Supervisor exige monitor de saúde`, originada em `v2/core/supervisor.js:12`. Eles não devem ser contados como seis problemas independentes. A incompatibilidade de `estado` como propriedade versus função é uma segunda divergência dentro do mesmo contrato arquitetural e poderá gerar novos sintomas depois que a primeira validação de Health for resolvida.

### Cluster de Runtime processual

Os três testes Rust vermelhos são:

```text
process_rejects_invalid_json_and_continues
process_ignores_blank_lines
process_rejects_oversized_request_and_continues
```

O primeiro e o segundo recebem EOF/saída que não contém as respostas esperadas; o terceiro escreve depois que o processo já encerrou e recebe `Broken pipe`. O smoke JS E2E é outro consumidor do mesmo binário stub. Não são quatro defeitos: é uma única ausência do loop de protocolo no `main.rs`.

### Cluster de TypeScript/JSDoc

As 71 mensagens são diagnósticos independentes do compilador, mas foram agrupadas em oito famílias de contrato. Elas não devem ser tratadas como 71 alterações sem relação. Os maiores multiplicadores são `runtime-stdio.js` com 28 e `vertical-slice.js` com 11. Fechar os contratos de `supervisor`, `stdio`, `vertical-slice` e as opções default deverá eliminar a maior parte do ruído do gate, mas cada retorno precisa ser validado contra os testes, não silenciado.

## 6. Mapa por arquivo

| Arquivo | Diagnósticos/erros | Causa ou efeito | Observação |
| --- | ---: | --- | --- |
| `v2/core/runtime-stdio.js` | 28 TS | TYPE-STDIO-001 | Maior concentração; Node APIs e estado assíncrono sem tipos |
| `v2/core/vertical-slice.js` | 11 TS | TYPE-VERTICAL-001 | Hooks de módulo inferidos como `{}` |
| `v2/core/supervisor.js` | 9 TS + 6 testes em consumidores | ROOT-SUP-001/TYPE-SUP-001 | Contrato global de Health e estado |
| `v2/core/runtime-supervisor.js` | 3 TS | TYPE-SUP-001 | Snapshot de módulos unknown |
| `v2/core/runtime-session-client.js` | 3 TS | TYPE-SESSION-001 | Union de resposta e parâmetros |
| `v2/core/runtime-manager-group.js` | 3 TS | TYPE-MGROUP-001 | Options, PromiseSettled, AggregateError |
| `v2/core/runtime-group-snapshot.js` | 3 TS | TYPE-GROUP-001 | Registry opcional e módulos unknown |
| `v2/core/runtime-module-readiness.js` | 2 TS | TYPE-READY-001 | Manager optional e literal `true` |
| `v2/core/runtime-manager.js` | 2 TS | TYPE-READY-001 | Default e retorno de restart |
| `v2/core/runtime-group-status.js` | 2 TS | TYPE-GROUP-001 | Batches optional e módulos unknown |
| `v2/core/plataforma.js` | 2 TS + 3 testes | ROOT-SUP-001/TYPE-BOUNDARY-001 | Monitor real incompatível e typedefs incompletos |
| `v2/core/runtime-transport.js` | 1 TS | TYPE-BOUNDARY-001 | Grants recebidos como unknown |
| `v2/core/runtime-readiness-wait.js` | 1 TS | TYPE-READY-001 | Options default `{}` |
| `v2/core/boot.js` | 1 TS | TYPE-BOUNDARY-001 | Registry do Boot incompleto |
| `v2/runtime/src/main.rs` | 3 testes Rust + E2E | ROOT-RUNTIME-001 | Binário é somente banner |
| `v2/runtime/src/protocol.rs` | Nenhum erro direto | Protegido | Biblioteca e testes unitários verdes |
| `v2/runtime/tests/protocol_process.rs` | 3 testes | Efeito de ROOT-RUNTIME-001 | Contrato processual correto, implementação ausente |
| `scripts/v2-runtime-smoke.mjs` | E2E fail | Efeito de ROOT-RUNTIME-001 | Espera `authorized`, `file` e erro de path |
| `v2/core/saude.js` | Nenhum erro isolado | Causa de ROOT-SUP-001 | Expõe `verificar`, não `definirEstado`/`retrato` |
| `v2/core/registry.js` | Nenhum erro isolado | Não alterar sem causa | `criarRegistry` existe e os testes de Registry passam |

## 7. Mapa arquitetural

```text
                    ┌──────────────────────────────┐
                    │ Vercel / Vite / rotas V1     │
                    │ BUILD VERDE · SMOKE VERDE    │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │ Core V2                       │
                    │ Platform / Orquestrador       │
                    │ ROOT-SUP-001                  │
                    │ TYPE-BOUNDARY / TYPE-VERTICAL │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │ Contracts JS/JSDoc            │
                    │ 71 diagnostics / 8 families  │
                    │ stdio, supervisor, groups,    │
                    │ readiness, session, slices   │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │ Runtime Bridge / Session      │
                    │ Abstract transport GREEN     │
                    │ Concrete stdio type debt     │
                    └──────────────┬───────────────┘
                                   │ JSON lines
                    ┌──────────────▼───────────────┐
                    │ Rust Runtime                  │
                    │ Library GREEN: 7/7            │
                    │ Binary ROOT-RUNTIME-001      │
                    │ Process/E2E RED: 3 + smoke   │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │ Data / Storage / Supabase      │
                    │ Storage 42/42 · Security 18/18│
                    │ Arma3/Data CI GREEN           │
                    └──────────────────────────────┘
```

A seta importante é que o fluxo de dados e autorização até o Runtime não está globalmente quebrado. O envelope, Bridge, Session e Transport abstrato passam. A falha mais profunda está na entrada do processo Rust; a falha paralela no Core está na composição de Health com Supervisor. Esses dois pontos devem ser corrigidos antes de investigar sintomas de camadas superiores.

## 8. Gates oficiais do GitHub

O SHA `1fe33468` disparou dez workflows de push na `main`. O painel final foi de **6 vermelhos e 4 verdes**.

| Workflow | Status | Por quê |
| --- | --- | --- |
| `CI / Build + invariantes` | Vermelho | O passo `npm test` encontrou os seis testes de Supervisor/Platform/Orquestrador; o workflow também contém o gate de tipos |
| `V2 Core` | Vermelho | `npm test` falha com seis testes e `npm run tipos:v2` falha com 71 diagnósticos |
| `V2 Validation` | Vermelho | O typecheck V2 falha nos 71 diagnósticos; a validação não deve ser considerada verde |
| `Core CI` | Vermelho | Build e Nexus não apontaram a causa principal; o passo de testes falhou no mesmo cluster do Supervisor |
| `V2 Runtime` | Vermelho | Os 7 testes da biblioteca passam, mas os 3 testes `protocol_process` falham |
| `V2 Runtime E2E` | Vermelho | O smoke processual não recebe `authorized`/`file` porque o binário é um banner |
| `Security Contracts` | Verde | Contratos de segurança passaram |
| `CodeQL` | Verde | Nenhuma falha de análise reportada |
| `Arma 3 Data CI` | Verde | Parsers, imagens, pipeline e modelos passaram |
| `Vigia das rotas` | Verde | Smoke e verificações de rota concluíram com sucesso |

Links dos runs oficiais: [CI][14], [V2 Core][15], [V2 Runtime][16], [V2 Runtime E2E][17], [Core CI][18], [V2 Validation][19], [Security Contracts][20], [CodeQL][21], [Arma 3 Data CI][22] e [Vigia das rotas][23].

Não foi identificado erro real de Vercel/deploy neste snapshot. O build local passou e os checks Vercel observados nos PRs relacionados estavam verdes. Não houve erro Supabase/SQL/RLS: os contratos de segurança locais passaram 18/18 e o preview Supabase apareceu como skipped nos PRs, não como failure.

## 9. Comparação com branches e PRs V2

A branch `v2/js-specialist-contract-hardening` (`fe692647`) é o segundo pai do merge auditado. Em relação à `main` atual, ela está integralmente incorporada; a `main` possui 39 commits exclusivos posteriores ao merge e a branch não possui commits que faltem na `main` nesse cálculo.

A reprodução anterior da branch especialista isolada registrou 853/853 testes JavaScript e build verde, mas os mesmos 71 erros de `tipos:v2`. Depois que ela foi mesclada com a `main` que ainda carregava consumidores e testes de Platform/Orquestrador, apareceram seis falhas funcionais de contrato. Isso é evidência de integração parcial: o hardening JS tratou muitos contratos internos, mas não consolidou a fronteira Supervisor/Health usada pelos consumidores da `main`.

| PR/branch | Estado observado | Relação com o mapa atual |
| --- | --- | --- |
| [#431 — JS specialist hardening][8] | Aberto, `UNSTABLE`; CI e V2 Core vermelhos | Mesma dívida de 71 tipos; não cobre a composição Platform/Orquestrador da main |
| [#429 — specialist JavaScript/JSDoc][9] | Aberto, `UNSTABLE`; CI e V2 Core vermelhos | Endureceu normalização e tipos, mas o gate ainda não zerou |
| [#428 — specialist CI por linguagem][10] | Aberto, `UNSTABLE`; CI e dois checks JavaScript vermelhos | O próprio gate especialista confirma que a tipagem não está pronta |
| [#426 — RuntimeManagerGroup observability][11] | Aberto, `UNSTABLE`; CI/V2 Core vermelhos | Relacionado aos contratos de grupo/status, parte do TYPE-GROUP/TYPE-MGROUP |
| [#425 — sync architecture work][12] | Aberto, `DIRTY`; V2 Runtime/Core/Validation vermelhos | Linha de continuidade contém trabalho que não deve ser mesclado cegamente |
| `v2-integration` (`930cd0bb`) | Incorporada anteriormente | Adicionou validação V2, mas não resolveu os contratos atuais |

A distância histórica não deve ser interpretada como quantidade de bugs: branches V2 carregam arquivos adicionados e removidos em paralelo. O valor da comparação é mostrar que os erros de tipos e de integração já eram visíveis em PRs anteriores; eles não nasceram somente no último push da `main`.

## 10. Ordem recomendada de correção

### 1. Fechar ROOT-RUNTIME-001

Ligar `main.rs` ao protocolo existente e manter o processo vivo depois de linhas vazias, JSON inválido e requests grandes. Esta correção elimina diretamente três testes Rust e o smoke E2E, além de desbloquear a leitura real de erros no transporte stdio.

### 2. Fechar ROOT-SUP-001

Definir a interface única de Health e estado. A decisão precisa cobrir `verificar()` versus `definirEstado()/retrato()` e propriedade `estado` versus função `estado()`. Essa correção deve ser feita antes de mexer nos seis testes individualmente, pois todos são efeitos do mesmo contrato.

### 3. Fechar TYPE-SUP-001 e TYPE-BOUNDARY-001

Com o contrato decidido, tipar Supervisor, Runtime Supervisor, Boot, Registry, Platform e Transport. A ordem evita escrever JSDoc para uma API que ainda muda.

### 4. Fechar TYPE-STDIO-001

Depois do processo Rust funcional, tipar a fronteira Node/stdio com tipos locais ou configuração restrita. Não adicionar `any` para obter exit 0; o estado assíncrono de `child`, `lines` e `pending` precisa continuar verificável.

### 5. Fechar TYPE-VERTICAL-001 e TYPE-SESSION-001

Formalizar o contrato de hooks do módulo e os resultados da Session. Esses arquivos compõem a ponte do vertical slice, que hoje passa em browser apesar do gate estático vermelho.

### 6. Fechar TYPE-GROUP-001, TYPE-MGROUP-001 e TYPE-READY-001

Alinhar opções validadas, snapshots, batches, rollback, restart e readiness. Executar os testes isolados já verdes depois de cada família para evitar regressões de concorrência.

### 7. Tratar DEP-001 sem upgrade cego

Atualizar as dependências de desenvolvimento em uma mudança separada e pequena, revisando o impacto do Vite/esbuild. Primeiro manter o bundle de produção como está, pois ele está sem vulnerabilidade alta/crítica no audit observado.

### 8. Reexecutar todos os gates

A ordem final é `npm test`, `npm run tipos:v2`, `npm run build`, `npm run v2:integracao`, `cargo test --all-targets`, `cargo clippy --all-targets --all-features -- -D warnings`, `node scripts/v2-runtime-smoke.mjs`, os testes de segurança e os verificadores Data/Arma 3.

## 11. O que não deve ser alterado sem necessidade

A auditoria encontrou várias áreas verdes que devem servir como proteção contra escopo excessivo:

1. **Event Bus e catálogo de eventos:** 20/20 testes e catálogo de 19 eventos/8 namespaces. Não alterar o barramento para resolver o supervisor.
2. **Registry:** `criarRegistry()` existe, os outputs selados existem e os testes de Registry/Bootstrap passam. O erro de `plataforma.js` é de referência de tipo, não prova de Registry quebrado.
3. **Transport abstrato, Bridge, Session e Bootstrap:** 25/25 testes de Session/Transport/Bridge e os testes de bootstrap passaram. O problema concreto está no `runtime-stdio` tipado e no binário Rust, não no envelope lógico.
4. **Runtime library e política de segurança:** os 7 testes de biblioteca Rust passaram. O primeiro alvo é a entrada do binário, não uma reescrita de `protocol.rs`, `host.rs` ou da policy.
5. **Data Layer, Storage e Supabase/RLS:** 42/42 testes de Data/Storage e 18/18 contratos de segurança passaram. Não alterar SQL/RLS sem um erro novo nessa camada.
6. **Build, V1, rotas, offline e memória:** build, 98 rotas, jornada 15/15, offline 9/9 e sonda de memória passaram. Não fazer refactor visual ou de V1 como tentativa de resolver o Core V2.
7. **Dependências de produção:** `npm audit --omit=dev` encontrou zero vulnerabilidades. Não aplicar `npm audit fix --force` no mesmo commit das correções arquiteturais.

## 12. Referências

[1]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte "Repositório Projeto-Baluarte"
[2]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/1fe3346866f3b93105190b925a7f15c40eb0aea4 "SHA auditado: merge do especialista JS V2"
[3]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/blob/main/v2/core/supervisor.js "Supervisor atual"
[4]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/blob/main/v2/core/saude.js "Health atual"
[5]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/blob/main/v2/runtime/src/main.rs "Entrypoint atual do Runtime"
[6]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/blob/main/v2/runtime/src/protocol.rs "Protocolo Rust"
[7]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/blob/main/v2/runtime/tests/protocol_process.rs "Testes de processo Rust"
[8]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/431 "PR #431 — JS specialist hardening"
[9]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/429 "PR #429 — JavaScript/JSDoc hardening"
[10]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/428 "PR #428 — specialist CI by language"
[11]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/426 "PR #426 — RuntimeManagerGroup observability"
[12]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/425 "PR #425 — architecture sync"
[13]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/blob/main/.github/workflows/ci.yml "CI geral"
[14]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/31754228771 "CI / Build + invariantes"
[15]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/31754228818 "V2 Core"
[16]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/31754228866 "V2 Runtime"
[17]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/31754228817 "V2 Runtime E2E"
[18]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/31754228831 "Core CI"
[19]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/31754228877 "V2 Validation"
[20]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/31754228824 "Security Contracts"
[21]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/31754228811 "CodeQL"
[22]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/31754228841 "Arma 3 Data CI"
[23]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/31754228794 "Vigia das rotas"
[24]: https://github.com/advisories/GHSA-rgw5-rvv9-x895 "brace-expansion advisory"
[25]: https://github.com/advisories/GHSA-67mh-4wv8-2f99 "esbuild advisory"
[26]: https://github.com/advisories/GHSA-28wg-ghj8-5hjv "nanoid advisory"
[27]: https://github.com/advisories/GHSA-r28c-9q8g-f849 "postcss advisory"
[28]: https://github.com/advisories/GHSA-r292-9mhp-454m "tar advisory"
