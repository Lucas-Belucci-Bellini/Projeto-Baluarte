# Platform → Module Registry Diagnostic — Waves 1–4

## Status

`WAVE 3 PUBLISHED — WAVE 4 IMPLEMENTED LOCALLY`

## Objetivo

Expor o resumo operacional do Module Registry dentro do diagnóstico da fachada Platform, sem criar uma segunda fonte de observabilidade e sem alterar o boot da V1. A integração conecta a superfície `Platform.diagnostico()` ao adaptador `module-registry-health.js` por uma opção explícita.

## Contrato

`criarPlataforma(registry, boot)` continua válido para consumidores existentes. Quando a terceira opção `registryHealth` não é fornecida, a fachada cria um retrato neutro dos módulos registrados: `mode = registered`, `status = unknown`, zero reinícios e ativação permitida pelo contrato local. Quando o adaptador é fornecido, `Platform.diagnostico().registry.modulos` devolve os modos reais `healthy`, `degraded`, `quarantined`, `maintenance` ou `disabled`.

Essa opção evita acoplamento obrigatório entre Platform e um mecanismo de health específico. O Registry continua responsável por registro/selagem, o Runtime Health continua responsável por falhas/restarts e a Platform apenas compõe diagnóstico.

## Segurança

O diagnóstico não concede acesso. A transição para `maintenance`, `disabled` ou `active` continua exigindo o callback de autorização server-side definido no piloto Registry. A fachada não lê claims client-side, não aceita service role e não permite que um módulo não registrado apareça como ativo.

## Testes

`test/v2/plataforma.test.js` mantém as asserções existentes de Supervisor, Health e Lifecycle e acrescenta a verificação do retrato neutro compatível e de um override `maintenance` autorizado. Os testes do Registry Health continuam cobrindo deny-by-default, quarentena e isolamento de módulos vizinhos.

## Rollback

O rollback é o revert da alteração em `v2/core/plataforma.ts`, do teste e deste documento. Consumidores antigos continuam usando a assinatura de dois argumentos, portanto o risco de incompatibilidade é limitado à nova propriedade de diagnóstico.

## Wave 2 — Bootstrap real do Runtime

### Objetivo

Fazer o harness real compartilhar uma instância de saúde do Runtime com o adaptador do Registry. O diagnóstico da Platform deixa de exibir apenas o retrato neutro ou um fake de teste e passa a refletir o resultado efetivo da partida dos módulos no banco de prova navegador.

### Implementação

`v2/harness/main.js` agora cria `criarRuntimeHealth()` e `criarModuleRegistryHealth(registry, runtimeHealth)`, injeta o adaptador em `criarPlataforma(registry, boot, { registryHealth })` e atualiza o monitor depois de `plataforma.iniciar()`. Cada módulo em `resultado.vivos` recebe `marcarSaudavel`; cada falha do boot passa por `marcarFalha` com o motivo observado. Nenhum segundo Registry, Supervisor ou Permission Manager foi criado.

A integração preserva o limite arquitetural: o adaptador só observa e classifica saúde. Ele não abre sessões, não concede permissões, não substitui RLS e não transforma a execução local do harness em autorização server-side.

### Contrato verificável

Com os cinco módulos do harness subindo sem falhas, `window.__v2.plataforma().registry.modulos` deve conter cinco entradas com `mode = healthy` e `status = healthy`. Um módulo que falhe deve ser classificado pelo monitor como `failed`/`degraded`, ou `exhausted`/`quarantined` após exceder a política de reinícios; módulos vizinhos continuam isolados.

### Testes executados

A suíte direcionada de Platform e Registry Health passou em `11/11`. `npm run tipos:v2` passou. O gate de navegador `npm run v2:integracao` passou em `20/20`, incluindo a nova asserção `Platform reflete a saúde real do Registry após o boot`. `git diff --check` também passou. Na bateria completa, `npm run tipos:ts`, `npm test` (`1068/1068`), build, smoke (`99/99`), caminho crítico (`15/15`) e contratos de segurança passaram. `npm run v2:runtime` não pôde ser executado localmente porque o sandbox possui Rust/Cargo `1.75.0`, enquanto a resolução atual de dependências usa um pacote com `edition2024`; o workflow remoto usa `dtolnay/rust-toolchain@stable`. O lockfile gerado localmente é ignorado pelo Git e foi removido; nenhuma configuração versionada foi alterada. Esta é uma limitação do toolchain local, não uma falha observada nesta integração. A validação remota do V2 Runtime será obrigatória após a publicação.

### Segurança e limitações

A saúde inicial é derivada do resultado do bootstrap. Esta onda ainda não cria persistência de incidentes, auditoria server-side ou integração com Supabase/RLS; portanto, não deve ser apresentada como autorização de produção. O callback local de `maintenance`/`disabled` continua deny-by-default. Falhas posteriores ao boot ainda exigirão uma futura costura de eventos de health/restart para atualizar o mesmo monitor em tempo real.

### Rollback

Reverter `v2/harness/main.js`, `scripts/v2-integracao.mjs` e esta documentação devolve o harness ao diagnóstico neutro da Wave 1. A assinatura compatível de `criarPlataforma(registry, boot)` permanece preservada, então consumidores existentes não precisam de alteração.

### Base e publicação

A Wave 2 foi construída sobre o SHA `3e6b79334d398cc6fc4f46cf2cb74e159167f310`. O SHA final de publicação será registrado no relatório de entrega e no histórico Git após a bateria completa de gates.

## Wave 3 — Health no ciclo canônico

### Objetivo

Levar a atualização de saúde para o ciclo real `Runtime → init → start → stop → dispose`, em vez de depender de uma marcação posterior no harness. O mesmo `RuntimeHealth` continua sendo compartilhado pela Platform e pelo Registry Health, sem criar outro supervisor ou outra fonte de verdade.

### Contrato

`criarCiclo(registry, deps, { health })` aceita um observador opcional. Depois que `runtime`, `init` e `start` terminam, o módulo recebe `marcarSaudavel`. Falhas diretas de runtime, init ou start, falhas de dependência em cascata e problemas de stop, fechamento do Runtime ou dispose recebem `marcarFalha`. O ciclo captura erro do observador e apenas registra aviso: telemetria não pode derrubar o lifecycle nem impedir o cleanup.

O restart continua sob responsabilidade de `module-runtime-restart.js`, que já aplica `marcarFalha`, orçamento, backoff e `marcarSaudavel` após reinício. Esta onda não cria um caminho concorrente de restart; apenas garante que o ciclo canônico alimenta a mesma política de saúde.

### Implementação

`v2/core/ciclo.ts` ganhou `RuntimeHealth` e `LifecycleOptions.health`. `v2/core/boot.ts` já propaga `BootOptions` para `criarCiclo`; `v2/harness/main.js` agora injeta o mesmo `runtimeHealth` no Boot e não repete marcações após a partida. A remoção da duplicação é importante: marcar a mesma falha duas vezes consumiria orçamento de restart e produziria um diagnóstico falso.

### Testes

Foram adicionados contratos no `test/v2/ciclo-runtime-host.test.js` para sucesso somente após `start`, falha isolada com vizinho saudável, falha de dependência sem esconder a cascata, falha durante descida e observador de health indisponível. A seleção direcionada passou em `26/26`; `npm test` passou em `1073/1073`; `npm run tipos:ts` e `npm run tipos:v2` passaram; `npm run v2:integracao` passou em `20/20`; smoke passou com `99/99` rotas verdes; caminho crítico passou em `15/15`; os contratos de segurança passaram em `34/34`; build e `git diff --check` passaram.

### Segurança, riscos e rollback

O health monitor é observabilidade e decisão de restart; ele não concede permissões, não altera RLS e não autoriza módulos em manutenção ou disabled. O risco principal é a disponibilidade temporária do monitor, tratado por callbacks opcionais e isolamento de exceções. O rollback consiste em reverter `v2/core/ciclo.ts`, `v2/harness/main.js`, os testes e este documento; consumidores sem `health` preservam o comportamento anterior.

A execução local de `npm run v2:runtime` continua bloqueada pelo Rust/Cargo `1.75.0` do sandbox ao resolver `edition2024`; o workflow remoto com Rust stable deve ser a autoridade para esse gate. Nenhum lockfile ignorado ou configuração de CI foi alterado para esconder a limitação.

### Base e publicação

A Wave 3 foi construída sobre o SHA publicado `3526082364e5d2fe59c397f72b5fec18d9a32968`. O SHA final desta onda será registrado no relatório de entrega e no histórico Git após a publicação direta no `main`.

## Wave 4 — Histórico limitado de incidentes

### Objetivo

Expor no diagnóstico da Platform os incidentes produzidos pelo mesmo `RuntimeHealth` que decide `healthy`, `failed`, `exhausted` e a possibilidade de restart. A retenção é limitada e em memória: esta onda melhora observabilidade local e de harness, mas não finge ser auditoria persistente de produção.

### Contrato

`criarRuntimeHealth()` passa a aceitar `maxIncidents` e `clock` opcionais. Cada transição para saudável ou falha gera um registro sanitizado com `type`, `id`, `timestamp`, `status`, `restarts` e, quando necessário, `error` sem stack trace. `incidentes()` devolve cópias defensivas e descarta os eventos mais antigos acima do limite. O Registry Health apenas adapta essa leitura; ele não mantém um segundo journal.

`Platform.diagnostico().registry` agora mantém `modulos` e acrescenta `incidentes`. Consumidores legados que não fornecem o método recebem `[]`, e a assinatura anterior da Platform permanece válida. O harness verifica cinco incidentes saudáveis após o boot e confirma que nenhum possui stack trace.

### Implementação e segurança

Foram atualizados `v2/core/module-runtime-health.js`, `v2/core/module-registry-health.js` e `v2/core/plataforma.ts`, além dos testes de health, Platform e integração. O histórico não concede acesso, não altera manutenção/disabled, não consulta claims client-side, não contém service role e não substitui auditoria server-side/RLS. O limite evita crescimento ilimitado no processo do navegador; persistência, retenção operacional e autorização de consulta continuam pendentes para uma camada protegida.

### Testes e correção encontrada

A primeira checagem `tipos:v2` encontrou uma inferência JSDoc que alargava o literal `healthy` para `string`. A correção foi uma anotação explícita `RuntimeHealthState`, sem `any`, sem relaxar `checkJs` e sem alterar configuração. Depois dela, os testes direcionados passaram em `19/19`, `npm test` passou em `1076/1076`, `npm run tipos:ts`, `npm run tipos:v2`, build, smoke (`99/99`), caminho crítico (`15/15`), integração (`21/21`), contratos de segurança (`34/34`) e `git diff --check` passaram.

O gate local `npm run v2:runtime` permanece bloqueado pelo Cargo `1.75.0` ao resolver metadata `edition2024`; o workflow remoto com Rust stable continua sendo a autoridade para esse gate. Nenhum lockfile ignorado ou configuração foi alterado para ocultar o bloqueio.

### Riscos e rollback

O risco principal é a retenção ser confundida com auditoria de produção. A documentação e o contrato deixam explícito que é um diagnóstico bounded/in-memory. O rollback reverte `v2/core/module-runtime-health.js`, `v2/core/module-registry-health.js`, `v2/core/plataforma.ts`, `scripts/v2-integracao.mjs`, os testes e este documento; sem `incidentes`, a Platform volta ao fallback `[]`.

### Base e publicação

A Wave 4 foi construída sobre o SHA publicado `5856689abfb6434b27cf044c32d79ab3374acbc9`. O SHA final desta onda será registrado após o commit e a validação remota no `main`.

## Próximo passo

A próxima onda deve tratar a auditoria server-side/RLS de mudanças `maintenance`/`disabled`, com identidade, motivo, timestamp, aprovador e cleanup idempotente em um projeto Supabase staging separado. Nenhuma conexão externa será feita sem aprovação explícita do operador. A superfície de incidentes em memória deve permanecer apenas como diagnóstico local até essa fundação protegida existir.
