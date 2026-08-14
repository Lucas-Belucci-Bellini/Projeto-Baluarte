# Migração do Baluarte de JavaScript para TypeScript

**Status:** migração incremental ativa; Runtime Rust e Wave 4 de Storage publicados
**Commit de referência do Runtime:** [`8f0062d6`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/8f0062d6b3a254a7b070bced5e3b43b3109b2674)
**Commit de referência da Wave 4:** [`e75619da`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/e75619dafa2d67dc68cef23715cc561f47779725)
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

O Event Bus possui tipos explícitos para `EventMeta`, `EventHandler`, `EventBus`, mapas de handlers e buckets de eventos. O State possui `createStore<State>`, `StoreListener`, `Store` e `AppState`. Router, Flags e Permissions possuem fábricas, contratos de rota, níveis, ambientes, grants e estados de permissão tipados.

O Storage foi migrado sem duplicar a lógica. A implementação TypeScript cobre namespace `baluarte:`, fallback in-memory, envelopes versionados, migração de esquemas, classificação `publico`/`local`/`sensivel`/`secreto`, introspecção de esquemas e a API agregada `storage`. A fronteira de dados não confiáveis usa `unknown` e é estreitada no envelope; não foi usado `any`, `@ts-ignore`, `@ts-nocheck` ou relaxamento de `strict`.

## 4. Gates das ondas TypeScript

| Comando | Resultado da Wave 4 | Observação |
| --- | --- | --- |
| `npm run tipos:ts` | Verde | Inclui agora `src/core/storage.ts` |
| `npx tsx --test test/storage.test.js test/storage-namespace.test.js` | Verde: 20/20 | Testes de esquema, migração, namespace e classificação |
| `npm run build` | Verde | Vite compilou a aplicação; há apenas o aviso histórico de chunks grandes |
| `npm test` | 865/871 | Mesmas seis falhas preexistentes de Supervisor/Health |
| `npm run tipos:v2` | 71 erros históricos | Dívida JS/JSDoc fora do escopo desta onda |

A Wave 4 foi publicada no `main` e o `V2 Runtime` remoto passou novamente no commit `e75619da`; os demais gates verdes também permaneceram verdes, enquanto os quatro gates vermelhos repetiram exclusivamente a dívida conhecida de Supervisor/Health e JS/JSDoc. O `tsconfig.json` raiz inclui somente os arquivos efetivamente migrados. Isso é intencional: o portão cresce junto com a conversão e não finge que arquivos ainda JavaScript já possuem contratos TypeScript.

Os testes de Storage continuam importando `../src/core/storage.js`. Isso verifica o caminho de compatibilidade real usado pelos consumidores legados, em vez de testar apenas o arquivo `.ts` diretamente.[2]

## 5. Ordem das próximas ondas

| Onda | Escopo | Critério de saída |
| --- | --- | --- |
| 1 | Event Bus e State | Tipos estritos, build verde e testes comportamentais preservados |
| 2 | Router e contratos de navegação | Rotas, aliases, 404, route error e loaders tipados |
| 3 | Permissions e Flags | Permissões, estados e ambientes tipados |
| 4 | Storage | Schemas, migrações, classificação e namespace tipados |
| 5 | Shell, Header, Sidebar e Layout | Boot e navegação consumindo contratos TS por wrappers mínimos |
| 6 | Registry/Module System | Manifesto, estados de módulo, fallback e circuit breaker tipados |
| 7 | Páginas de maior valor | Wiki Arma 3, Arsenal, Biblioteca, JARVIS e diagnóstico por slices |
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

O próximo incremento recomendado é Shell, Header, Sidebar e Layout. Ele deve começar pelo contrato de montagem e desmontagem, não pela conversão visual das páginas, para preservar a navegação V1 e preparar o Module Registry.

## 8. Referências

[1]: ../../../docs/architecture/decisions/ADR-004-stack-poliglota-por-responsabilidade.md "ADR-004 — Stack poliglota por responsabilidade"
[2]: ../../test/storage.test.js "Testes comportamentais do Storage"
