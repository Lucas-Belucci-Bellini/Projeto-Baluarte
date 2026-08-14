# Migração do Baluarte de JavaScript para TypeScript

**Status:** migração incremental ativa; Runtime Rust, Waves 4–6 e slice de Ciclo publicados
**Commit de referência do Runtime:** [`8f0062d6`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/8f0062d6b3a254a7b070bced5e3b43b3109b2674)
**Commit de referência da Wave 4:** [`e75619da`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/e75619dafa2d67dc68cef23715cc561f47779725)
**Commit de referência da Wave 5:** [`8ea0ae88`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/8ea0ae8833281fe3fe357c4449693a7492e8c80f)
**Commit de referência da Wave 6:** [`1d8e1f5e`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/1d8e1f5e1f37cdfd33ff9b99bad98b6c7667357b) — correção final do wrapper
**Commit de referência do slice de Ciclo:** [`cb4c0872`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/cb4c08724f91e9add6198e12ec19b54610c0bef5)
**Slice seguinte:** Boot V2; `v2/core/boot.ts` é a fonte canônica
**Regra:** preservar a V1, migrar por contratos e validar cada onda

## 1. Objetivo

O Core de Orquestração do Baluarte será migrado progressivamente de JavaScript para TypeScript. A migração não é um rewrite simultâneo: cada módulo convertido deve continuar sendo consumido pelas páginas JavaScript ainda não migradas, passar pelo build Vite e preservar seus testes comportamentais.

A decisão arquitetural define TypeScript para a interface web e para o Core de Orquestração. Rust permanece reservado ao Core de Runtime processual, Python aos workers/IA e PostgreSQL/Supabase à camada de dados.[1]

> **Princípio operacional:** a implementação canônica migra para `.ts`, enquanto o arquivo `.js` permanece como wrapper de compatibilidade até que os consumidores também possam ser convertidos.

## 2. Estado da linha de base e do Runtime

O commit `8f0062d6` publicou o Runtime Rust com protocolo JSON stdio por linha. O binário agora ignora linhas vazias, devolve `INVALID_JSON` para JSON inválido, devolve `REQUEST_TOO_LARGE` para entradas acima de 1 MiB, continua processando a sessão após esses erros e despacha requisições válidas para o host autorizado.

| Gate | Resultado no commit `8f0062d6` | Interpretação |
| --- | --- | --- |
| `cargo fmt --check` | Verde | Código Rust formatado |
| `cargo test --all-targets` | Verde: 12 unitários + 3 de processo | Contratos do Runtime e loop stdio preservados |
| `cargo clippy --all-targets --all-features -- -D warnings` | Verde | Nenhum warning permitido |
| `cargo build` | Verde | Binário compilável |
| `node scripts/v2-runtime-smoke.mjs` | Verde | Smoke E2E do protocolo passou |
| `V2 Runtime` | Verde | Gate remoto do Runtime passou |
| `V2 Runtime E2E` | Verde | E2E remoto passou |

Os gates gerais que permaneceram vermelhos não foram tratados como regressões do Runtime. `Core CI` continuou registrando as seis falhas conhecidas de `Supervisor/Health`; `V2 Core`, `V2 Validation` e `CI` continuaram expondo a dívida de contratos JS/JSDoc da V2. CodeQL, Arma 3 Data CI e Vigia das rotas passaram nesse commit. O relatório detalhado de causas e efeitos continua em [`MAIN_ERROR_AUDIT.md`](./MAIN_ERROR_AUDIT.md).

## 3. Ondas TypeScript publicadas

As ondas anteriores migraram os contratos centrais sem remover os caminhos de importação JavaScript.

| Módulo | Implementação canônica | Wrapper de compatibilidade | Estado |
| --- | --- | --- | --- |
| Event Bus | `src/core/events.ts` | `src/core/events.js` | Publicado |
| State | `src/core/state.ts` | `src/core/state.js` | Publicado |
| Router | `src/core/router.ts` | `src/core/router.js` | Publicado |
| Feature Flags | `src/core/flags.ts` | `src/core/flags.js` | Publicado |
| Permissions | `src/core/permissions.ts` | `src/core/permissions.js` | Publicado |
| Storage | `src/core/storage.ts` | `src/core/storage.js` | Publicado na Wave 4 |
| Header | `src/layout/header.ts` | `src/layout/header.js` | Publicado na Wave 5 |
| Sidebar | `src/layout/sidebar.ts` | `src/layout/sidebar.js` | Publicado na Wave 5 |
| Overlay | `src/layout/overlay.ts` | `src/layout/overlay.js` | Publicado na Wave 5 |
| Shell | `src/layout/shell.ts` | `src/layout/shell.js` | Publicado na Wave 5 |
| Manifesto — fronteira declarativa | `v2/core/manifest.d.ts` | `v2/core/manifest.js` | Contrato declarado na Wave 6 |
| Registry — invariantes do conjunto | `v2/core/registry.ts` | `v2/core/registry.js` | Publicado na Wave 6 |
| Ciclo de Vida — execução de fases | `v2/core/ciclo.ts` | `v2/core/ciclo.js` | Publicado no slice pós-Wave 6 |
| Boot — publicação para Router V1 | `v2/core/boot.ts` | `v2/core/boot.js` | Publicado no slice seguinte |

O Event Bus possui tipos explícitos para `EventMeta`, `EventHandler`, `EventBus`, mapas de handlers e buckets de eventos. O State possui `createStore<State>`, `StoreListener`, `Store` e `AppState`. Router, Flags e Permissions possuem fábricas, contratos de rota, níveis, ambientes, grants e estados de permissão tipados.

O Storage foi migrado sem duplicar a lógica. A implementação TypeScript cobre namespace `baluarte:`, fallback in-memory, envelopes versionados, migração de esquemas, classificação `publico`/`local`/`sensivel`/`secreto`, introspecção de esquemas e a API agregada `storage`. A fronteira de dados não confiáveis usa `unknown` e é estreitada no envelope; não foi usado `any`, `@ts-ignore`, `@ts-nocheck` ou relaxamento de `strict`.

A Wave 5 converteu o contrato de layout completo: Header, Sidebar, Overlay e Shell. A Sidebar agora exporta tipos explícitos para grupos, itens e referências de montagem; o Shell tipa as referências do layout, a troca de páginas, o estado de tema e a sobreposição de páginas vivas; o Overlay tipa o arrasto por ponteiro e a integração opcional com Media Session. Adaptadores `.d.ts` pequenos declaram as fronteiras JavaScript já estáveis — helpers DOM, efeitos visuais, PWA, tema e ciclo de vida — sem mover esses módulos para TypeScript antes da sua própria onda.

A Wave 6 migrou o Registry como fonte canônica TypeScript. O contrato declarativo do Manifesto foi exposto em `manifest.d.ts`, e `registry.ts` tipa o isolamento de módulos inválidos, colisões de rotas e chaves, dependências ausentes em cascata, ciclos, ordem topológica de carga, navegação, esquemas, permissões, catálogo de eventos e referências órfãs. O wrapper `registry.js` continua sendo a porta de compatibilidade para Boot, Ciclo, Plataforma, testes e módulos legados. Os consumidores JSDoc diretos foram alinhados à nova superfície sem ampliar o escopo para os demais arquivos V2.

O slice seguinte converteu o Ciclo de Vida. `ciclo.ts` preserva a execução `init → start`, o isolamento de falhas e de dependências mortas, o timeout de `init`, a chamada de `dispose` após falha parcial, a descida inversa `stop → dispose`, o estado operacional e a possibilidade de subir novamente após uma descida completa. `contexto.d.ts` e `log.d.ts` funcionam como adaptadores declarativos mínimos para não converter Contexto e Log fora de sua própria onda.

O slice de Boot converteu a publicação do conjunto para o Router V1: somente módulos vivos registram rotas, somente módulos vivos aparecem na navegação, referências órfãs são registradas como aviso e o diagnóstico deriva do Registry, do Ciclo e das dependências injetadas. `boot.ts` também preserva a política de permissões antes da subida e a superfície de diagnóstico de métricas, APIs e decisões de permissão.

## 4. Gates das ondas TypeScript

| Comando | Resultado das Waves 4–6 | Observação |
| --- | --- | --- |
| `npm run tipos:ts` | Verde | Inclui Storage, layout e `v2/core/registry.ts` |
| `npx tsx --test test/storage.test.js test/storage-namespace.test.js` | Verde: 20/20 | Testes de esquema, migração, namespace e classificação |
| `npx tsx --test test/v2/registry.test.js` | Verde: 22/22 | Registro, selagem, isolamento, dependências e saídas do Core |
| `npm run build` | Verde | Vite compilou a aplicação; há apenas o aviso histórico de chunks grandes |
| `CHROME_PATH=/usr/bin/chromium npm run smoke` | Verde: 98/98 rotas | Produção local, navegação e router V1 preservados [3] |
| `npm test` | 865/871 | Mesmas seis falhas preexistentes de Supervisor/Health |
| `npm run tipos:v2` | 70 erros históricos | O Registry não adiciona erros ao gate; os dois diagnósticos de fronteira introduzidos durante a migração foram corrigidos |
| `CHROME_PATH=/usr/bin/chromium node scripts/v2-integracao.mjs` | Verde: 13/13 | Boot V2 no navegador, 17 rotas no router V1, view nativa, contexto, permissões e adaptador V1 |
| `npx tsx --test test/v2/ciclo.test.js` | Verde: 17/17 | Ordem de fases, timeout, cascata, descida inversa e módulos reais |
| `npx tsx --test test/v2/boot.test.js` | Verde: 13/13 | Registry → Ciclo → Router V1, navegação, diagnóstico e isolamento |

As Waves 4–6 e os slices de Ciclo e Boot estão publicados no `main`. A Wave 6 foi publicada inicialmente em `92a5cc98` e recebeu a correção final do wrapper em `1d8e1f5e`, depois de o CI revelar um ciclo de resolução que impedia o boot V2 no navegador. A correção foi reproduzida localmente e remotamente: o Vigia voltou a passar e a integração V2 ficou verde em 13/13. O slice de Ciclo foi publicado em `cb4c0872`; no commit remoto, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia das rotas passaram. O Registry TypeScript preserva 22/22 testes específicos; o Ciclo preserva 17/17; o Boot preserva 13/13. O build permanece verde, a suíte geral em 865/871 e o smoke V1 em 98/98 rotas. O `tipos:v2` permanece em 70 diagnósticos históricos; os 70 restantes pertencem a módulos V2 ainda não migrados e não foram mascarados. `CI`, `Core CI`, `V2 Core` e `V2 Validation` continuam representando a dívida conhecida de Supervisor/Health e JS/JSDoc. O `tsconfig.json` raiz inclui somente os arquivos efetivamente migrados. Isso é intencional: o portão cresce junto com a conversão e não finge que arquivos ainda JavaScript já possuem contratos TypeScript.

Os testes de Storage continuam importando `../src/core/storage.js`. Isso verifica o caminho de compatibilidade real usado pelos consumidores legados, em vez de testar apenas o arquivo `.ts` diretamente.[2]

## 5. Ordem das próximas ondas

| Onda | Escopo | Critério de saída |
| --- | --- | --- |
| 1 | Event Bus e State | Tipos estritos, build verde e testes comportamentais preservados |
| 2 | Router e contratos de navegação | Rotas, aliases, 404, route error e loaders tipados |
| 3 | Permissions e Flags | Permissões, estados e ambientes tipados |
| 4 | Storage | Schemas, migrações, classificação e namespace tipados |
| 5 | Shell, Header, Sidebar e Layout | Publicada: boot, navegação, overlay e contratos DOM tipados por wrappers mínimos |
| 6 | Registry/Module System | Publicada: manifesto, isolamento, ordem topológica, fallback, referências e wrapper de navegador tipados |
| 7 | Ciclo, Boot e páginas de maior valor | Ciclo e Boot publicados por slice; depois páginas Wiki Arma 3, Arsenal, Biblioteca, JARVIS e diagnóstico |
| 8 | Data e integrações | Contratos de dados, Supabase, Evidence Layer e Runtime bridge |

A conversão de páginas deve ocorrer depois do Core, porque cada página depende de router, eventos, estado, permissões, shell e storage. Migrar páginas antes de fechar esses contratos apenas deslocaria a dívida para dezenas de arquivos.

## 6. Regras de compatibilidade e segurança

Durante a migração, consumidores JavaScript podem importar um wrapper `.js`, mas a lógica não pode existir em duas implementações. O `.ts` é a fonte canônica; o `.js` apenas reexporta. Cada onda deve reduzir o grafo de wrappers ou substituir os imports diretamente.

Não usar `any`, `@ts-ignore`, `@ts-nocheck`, relaxamento de `strict` ou exclusões para transformar o portão em verde. Se uma fronteira externa ainda não tem contrato, ela deve receber um tipo explícito de adaptador, uma declaração de módulo ou um `unknown` que seja estreitado no ponto de entrada.

O Storage mantém a regra de que uma chave classificada como `secreto` é recusada no frontend público. A classificação `sensivel` não significa que o dado seja seguro contra exposição; significa que ele precisa permanecer local para a funcionalidade atual e deve ser tratado com a política correspondente. A proteção real de sessões e dados de usuário continua dependendo da camada de autenticação, RLS e backend.

## 7. Comandos de desenvolvimento

```bash
npm run tipos:ts       # arquivos TypeScript já migrados
npm run tipos:v2       # portão existente da V2 em JS + JSDoc
npm test               # suíte JavaScript executada por tsx
npm run build          # build real do Vite

cargo fmt --manifest-path v2/runtime/Cargo.toml -- --check
cargo test --manifest-path v2/runtime/Cargo.toml --all-targets
cargo clippy --manifest-path v2/runtime/Cargo.toml --all-targets --all-features -- -D warnings
node scripts/v2-runtime-smoke.mjs
```

O próximo incremento recomendado é tipar a Plataforma/diagnóstico operacional por slice e, em seguida, começar as páginas de maior valor. A ordem deve continuar preservando o fallback de módulos, o Router V1 e a navegação funcional.

## 8. Referências

[1]: ../../../docs/architecture/decisions/ADR-004-stack-poliglota-por-responsabilidade.md "ADR-004 — Stack poliglota por responsabilidade"
[2]: ../../test/storage.test.js "Testes comportamentais do Storage"
[3]: ../../relatorios/smoke-rotas.md "Smoke de rotas mais recente"
