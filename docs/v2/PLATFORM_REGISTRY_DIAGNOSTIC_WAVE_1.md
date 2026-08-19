# Platform → Module Registry Diagnostic — Wave 1

## Status

`WAVE 1 PUBLISHED — WAVE 2 IMPLEMENTED LOCALLY`

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

## Próximo passo

A próxima onda deve ligar eventos de falha/restart do lifecycle ao mesmo `RuntimeHealth`, mantendo o isolamento por módulo e sem criar um segundo supervisor. Em paralelo, a autorização server-side/RLS deverá registrar quem colocou um módulo em manutenção, por qual motivo, quando e qual operador aprovou a mudança.
