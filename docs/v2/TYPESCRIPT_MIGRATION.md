# Migração do Baluarte de JavaScript para TypeScript

**Status:** migração incremental ativa; Runtime Rust, Waves 4–6, Ciclo, Boot, Plataforma e páginas Sobre, Arsenal e Home publicados; Health/Supervisor corrigidos
**Commit de referência do Runtime:** [`8f0062d6`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/8f0062d6b3a254a7b070bced5e3b43b3109b2674)
**Commit de referência da Wave 4:** [`e75619da`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/e75619dafa2d67dc68cef23715cc561f47779725)
**Commit de referência da Wave 5:** [`8ea0ae88`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/8ea0ae8833281fe3fe357c4449693a7492e8c80f)
**Commit de referência da Wave 6:** [`1d8e1f5e`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/1d8e1f5e1f37cdfd33ff9b99bad98b6c7667357b) — correção final do wrapper
**Commit de referência do slice de Ciclo:** [`cb4c0872`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/cb4c08724f91e9add6198e12ec19b54610c0bef5)
**Commit de referência do slice de Boot:** [`a23eaa5d`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/a23eaa5d6597f1037a6bd515b20f908fd043d57c)
**Commit de referência da correção Health/Supervisor e Plataforma:** [`df0dd975`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/df0dd975d23719d5f69dd047eb8144c7ff568fe2)
**Commit de referência da página Sobre TypeScript:** [`d310a02e`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/d310a02e681156342295dbbc4c1e1f9d595052a9)
**Commit de referência da página Arsenal TypeScript:** [`b35b6bd6`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/b35b6bd639e4fad82d6abc10b6eaa5f7367096e3)
**Commit de referência da página Home TypeScript:** [`a15523d5`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/a15523d5d2371ebe9f124d67db4a59d131aebfd4)
**Commit de referência de Roadmap/Ferramentas TypeScript:** [`b3f681c6`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/b3f681c64620222a1386215334c56b89cb94769e)
**Commit de referência de Elites/Universo TypeScript:** [`185cef09`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/185cef096879861737538c3d617230dc86364362)
**Commit de referência da onda militar estática:** [`22cd5c9a`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/22cd5c9afb8fcc38738a55c859a000ccd2d81f48)
**Commit de referência da segunda onda militar:** [`2b59380d`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/2b59380da45388df1d8c503ce2d2fbe723bbb195)
**Commit de referência da onda de catálogos militares:** [`baaa0ddc`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/baaa0ddc33b65f82f6be5c47e0cc08e395fbe973)
**Commit de referência da Enciclopédia Militar:** [`87c8e16c`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/87c8e16cbbe3cbfe739ba2a0c08b185b7eb646d9)
**Commit de referência da onda PWA/Toast:** [`50e6b2ef`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/50e6b2ef4ae4ae6c33b610964d65806ef58507ed)
**Commit de referência da onda Scroll Progress/Reveal:** [`e09877f9`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/e09877f92c19ac87d61b1098051dfc42e33fbeba)
**Commit de referência da onda Atmosphere:** [`1a312e71`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/1a312e715ffdc2b6ac21d44723b03201f5dce731)
**Commit de referência da onda Card Spotlight:** [`2d20a99e`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/2d20a99eeaa3e6f24793a5673a983abbd5247069)
**Commit de referência da onda Baluarte Status:** [`1e36051c`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/1e36051cb6667b36ba7b781e2cafe8d936b61471)
**Commit de referência da onda Theme:** [`6ee11efb`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/6ee11efb51038864d96f30b3c2d74c6909d1a0d2)
**Commit de referência da onda Mil Curation:** [`55332a00`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/55332a0066ff32165d9aebf1a017477d5147ba47)
**Commit de referência da onda MapLibre Loader:** [`95a0ff02`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/95a0ff02789f7740754cbee3a9ed3654eb158668)
**Commit de referência da onda Visit Counter:** [`6a97a1f0`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/6a97a1f0853ee2a1b006cffde80cb1d0f7b9958c)
**Commit de referência da onda Page Views:** [`7b466285`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/7b4662850b7a1b3cbba1d1264d0450e1aa31c1c8)
**Commit de referência da onda Triangulation:** [`22620963`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/226209631dd873d28c868d52f5e83ef84c688397)
**Commit de referência da onda hx Beacon:** [`b4a885c2`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/b4a885c2d8db5103f815f91241f3dab962e0be2e)
**Commit de referência da onda Markdown:** [`59bb1597`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/59bb1597f3e146fa41087fcd229f7901f67ea10b)
**Commit de referência da onda Immersive Hero:** [`78108a37`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/78108a3702d52caa824db126dfbd05c6119217f9)
**Commit de referência da onda WebGL Probe:** [`6142d423`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/6142d423f16001bcbd7007f75dbfefe94f9396da)
**Commit de referência da onda Arma 3 Extraction:** [`316ff718`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/316ff718f9dab9c224c64685e35722e8643e8be0)
**Commit de referência da onda Cor:** [`1a8e996e`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/1a8e996e128993c7affc4e50e24126372e562105)
**Commit de referência da onda Fingerprint Engine:** [`be643095`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/be64309547a7d455c96736f6b966e2c4d729c380)
**Commit de referência da onda GeoPulse:** [`b54a1fd0`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/b54a1fd0d1ddf02eea808e64e66a9e933be99531)
**Commit de referência da onda Hermes Native Bridge:** [`973c60f1`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/973c60f1cd7ca047026972166e778ebca9cc6a73)
**Commit de referência da onda Repo Memory:** [`1e299d18`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/1e299d18045702e1945615e4283e2f17f0aea2e8)
**Regra:** preservar a V1, migrar por contratos e validar cada onda
**Inventário atualizado do JavaScript restante:** [`TYPESCRIPT_REMAINING.md`](./TYPESCRIPT_REMAINING.md)

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
| Plataforma — fachada operacional | `v2/core/plataforma.ts` | `v2/core/plataforma.js` | Publicado com a correção Health/Supervisor |
| Health/Supervisor — fronteiras operacionais | `v2/core/saude.d.ts`, `v2/core/supervisor.d.ts` | `v2/core/saude.js`, `v2/core/supervisor.js` | Contrato corrigido junto da Plataforma |
| Sobre — página documental | `src/pages/sobre.ts` | `src/pages/sobre.js` | Publicado como primeiro slice de página |
| Arsenal — catálogo militar | `src/pages/arsenal.ts` | `src/pages/arsenal.js` | Publicado como segundo slice de página |
| Home — ponte de comando e primeira pintura | `src/pages/home.ts` | `src/pages/home.js` | Publicado como terceiro slice de página |
| Roadmap — visão do projeto e do Jarvis | `src/pages/roadmap.ts` | `src/pages/roadmap.js` | Publicado como quarto slice de página |
| Ferramentas — catálogo técnico e filtros | `src/pages/ferramentas.ts` | `src/pages/ferramentas.js` | Publicado como quinto slice de página |
| Elites — equipes, filtros e fichas | `src/pages/elites.ts` | `src/pages/elites.js` | Publicado como sexto slice de página |
| Universo — catálogo, detalhes e arcos | `src/pages/universo.ts` | `src/pages/universo.js` | Publicado como sétimo slice de página |
| Guerras & Conflitos — timeline histórica | `src/pages/guerras-conflitos.ts` | `src/pages/guerras-conflitos.js` | Publicado na onda militar estática |
| Táticas & Estratégias — princípios e doutrina | `src/pages/taticas-estrategias.ts` | `src/pages/taticas-estrategias.js` | Publicado na onda militar estática |
| Tecnologia Militar — sistemas por domínio | `src/pages/tecnologia-militar.ts` | `src/pages/tecnologia-militar.js` | Publicado na onda militar estática |
| Forças Especiais — catálogo SOF | `src/pages/forcas-especiais.ts` | `src/pages/forcas-especiais.js` | Publicado na onda militar estática |
| História Militar — timeline por eras | `src/pages/historia-militar.ts` | `src/pages/historia-militar.js` | Publicado na segunda onda militar |
| Batalhas Históricas — busca de conflitos decisivos | `src/pages/batalhas-historicas.ts` | `src/pages/batalhas-historicas.js` | Publicado na segunda onda militar |
| Organização Militar — patentes e unidades | `src/pages/organizacao-militar.ts` | `src/pages/organizacao-militar.js` | Publicado na segunda onda militar |
| Forças Armadas — efetivos e orçamento | `src/pages/forcas-armadas.ts` | `src/pages/forcas-armadas.js` | Publicado na onda de catálogos militares |
| Armas por País — filtros de sistemas | `src/pages/armas-por-pais.ts` | `src/pages/armas-por-pais.js` | Publicado na onda de catálogos militares |
| Enciclopédia Militar — base navegável por categoria | `src/pages/enciclopedia-militar.ts` | `src/pages/enciclopedia-militar.js` | Publicado com fronteira discriminada de `militar-db.js` |
| PWA — instalação e modo standalone | `src/utils/pwa.ts` | `src/utils/pwa.js` | Publicado com declaração corrigida |
| Toast — notificações sobre Event Bus | `src/utils/toast.ts` | `src/utils/toast.js` | Publicado sobre Event Bus TypeScript |
| Scroll Progress — barra de progresso da leitura | `src/utils/scroll-progress.ts` | `src/utils/scroll-progress.js` | Publicado com mount e throttling preservados |
| Scroll Reveal — observers de entrada da página | `src/utils/scroll-reveal.ts` | `src/utils/scroll-reveal.js` | Publicado com reduced-motion e opt-out preservados |
| Atmosphere — camada visual global idempotente | `src/utils/atmosphere.ts` | `src/utils/atmosphere.js` | Publicado com retorno DOM corrigido |
| Card Spotlight — brilho delegado sobre cards | `src/utils/card-spotlight.ts` | `src/utils/card-spotlight.js` | Publicado com root opcional e throttling preservado |
| Baluarte Status — snapshot global de diagnóstico | `src/utils/baluarte-status.ts` | `src/utils/baluarte-status.js` | Publicado com ponte `window` e valores serializáveis |
| Theme — paletas, variáveis CSS e persistência | `src/utils/theme.ts` | `src/utils/theme.js` | Publicado com oito IDs, kit Fábula e fallback histórico |
| Mil Curation — curadoria remota do Centro Militar | `src/utils/mil-curation.ts` | `src/utils/mil-curation.js` | Publicado com fallback offline e contrato Supabase explícito |
| MapLibre Loader — CDN sob demanda para mapas | `src/utils/maplibre-loader.ts` | `src/utils/maplibre-loader.js` | Publicado com promessa compartilhada e fallback nulo |
| Visit Counter — contagem de acessos por sessão | `src/utils/visit-counter.ts` | `src/utils/visit-counter.js` | Publicado com RPC, leitura e fallback `null` |
| Page Views — métricas agregadas por rota | `src/utils/page-views.ts` | `src/utils/page-views.js` | Publicado com RPC, guard por rota e leitura agregada |
| Triangulation — localização 2D por mínimos quadrados | `src/utils/triangulation.ts` | `src/utils/triangulation.js` | Publicado com pontos, bearings, residual e ruído tipados |
| hx Beacon — telemetria interna de sessão | `src/utils/hx-beacon.ts` | `src/utils/hx-beacon.js` | Publicado com payload e geolocalização estreitados |
| Markdown — preview seguro de conteúdo | `src/utils/markdown.ts` | `src/utils/markdown.js` | Publicado com escaping inicial e URL segura |
| Immersive Hero — herói WebGL, rays, fallback 2D e Spline | `src/utils/immersive.ts` | `src/utils/immersive.js` | Publicado com auto-limpeza e hero-rays declarado |
| WebGL Probe — sonda sem retenção de contexto | `src/utils/webgl-probe.ts` | `src/utils/webgl-probe.js` | Publicado com resultado de WebGL/WebGL2 e `WEBGL_lose_context` |
| Arma 3 Extraction — ponte web para o Launcher nativo | `src/utils/arma3-extracao.ts` | `src/utils/arma3-extracao.js` | Publicado com invoke tipado, fallback web e resultados desconhecidos estreitados |
| Cor — conversões RGB, HSL, OKLCH e WCAG | `src/utils/cor.ts` | `src/utils/cor.js` | Publicado com fórmulas puras e estruturas de cor explícitas |
| Fingerprint Engine — centroides e similaridade de cosseno | `src/utils/fingerprint-engine.ts` | `src/utils/fingerprint-engine.js` | Publicado com Storage estreitado e confiança tipada |
| GeoPulse — trilha de localização e estatísticas | `src/utils/geo-tracker.ts` | `src/utils/geo-tracker.js` | Publicado com Geolocation API, Haversine e persistência limitada |
| Hermes Native Bridge — motor nativo e fallback WebLLM | `src/utils/jarvis-hermes-native.ts` | `src/utils/jarvis-hermes-native.js` | Publicado com status, invoke e geração de texto estreitados |
| Repo Memory — memória versionada no GitHub/Vercel | `src/utils/jarvis-repo-memory.ts` | `src/utils/jarvis-repo-memory.js` | Publicado com fila serializada, gate de token e respostas estreitadas |

O Event Bus possui tipos explícitos para `EventMeta`, `EventHandler`, `EventBus`, mapas de handlers e buckets de eventos. O State possui `createStore<State>`, `StoreListener`, `Store` e `AppState`. Router, Flags e Permissions possuem fábricas, contratos de rota, níveis, ambientes, grants e estados de permissão tipados.

O Storage foi migrado sem duplicar a lógica. A implementação TypeScript cobre namespace `baluarte:`, fallback in-memory, envelopes versionados, migração de esquemas, classificação `publico`/`local`/`sensivel`/`secreto`, introspecção de esquemas e a API agregada `storage`. A fronteira de dados não confiáveis usa `unknown` e é estreitada no envelope; não foi usado `any`, `@ts-ignore`, `@ts-nocheck` ou relaxamento de `strict`.

A Wave 5 converteu o contrato de layout completo: Header, Sidebar, Overlay e Shell. A Sidebar agora exporta tipos explícitos para grupos, itens e referências de montagem; o Shell tipa as referências do layout, a troca de páginas, o estado de tema e a sobreposição de páginas vivas; o Overlay tipa o arrasto por ponteiro e a integração opcional com Media Session. Adaptadores `.d.ts` pequenos declaram as fronteiras JavaScript já estáveis — helpers DOM, efeitos visuais, PWA, tema e ciclo de vida — sem mover esses módulos para TypeScript antes da sua própria onda.

A Wave 6 migrou o Registry como fonte canônica TypeScript. O contrato declarativo do Manifesto foi exposto em `manifest.d.ts`, e `registry.ts` tipa o isolamento de módulos inválidos, colisões de rotas e chaves, dependências ausentes em cascata, ciclos, ordem topológica de carga, navegação, esquemas, permissões, catálogo de eventos e referências órfãs. O wrapper `registry.js` continua sendo a porta de compatibilidade para Boot, Ciclo, Plataforma, testes e módulos legados. Os consumidores JSDoc diretos foram alinhados à nova superfície sem ampliar o escopo para os demais arquivos V2.

O slice seguinte converteu o Ciclo de Vida. `ciclo.ts` preserva a execução `init → start`, o isolamento de falhas e de dependências mortas, o timeout de `init`, a chamada de `dispose` após falha parcial, a descida inversa `stop → dispose`, o estado operacional e a possibilidade de subir novamente após uma descida completa. `contexto.d.ts` e `log.d.ts` funcionam como adaptadores declarativos mínimos para não converter Contexto e Log fora de sua própria onda.

O slice de Boot converteu a publicação do conjunto para o Router V1: somente módulos vivos registram rotas, somente módulos vivos aparecem na navegação, referências órfãs são registradas como aviso e o diagnóstico deriva do Registry, do Ciclo e das dependências injetadas. `boot.ts` também preserva a política de permissões antes da subida e a superfície de diagnóstico de métricas, APIs e decisões de permissão.

A correção Health/Supervisor eliminou a divergência que fazia `criarSupervisor()` exigir `definirEstado()` enquanto `criarMonitorSaude()` expunha apenas `verificar()`. Health agora mantém o estado publicado pelo Supervisor e oferece `retrato()` derivado do Boot; o Supervisor aceita adaptadores legados com setter opcional e diagnósticos opcionais; o Orquestrador expõe `estado` como valor na sua fachada sem alterar a API funcional de baixo nível. Essa correção recuperou os 6 testes originais de Supervisor/Health/Plataforma e os 3 testes do Orquestrador.

A Plataforma foi convertida para `plataforma.ts`, com wrappers JavaScript e fronteiras declarativas para Health, Supervisor e Lifecycle Status. Seu diagnóstico continua sendo uma composição única de Supervisor, Health, Lifecycle e Boot, sem duplicar a lógica operacional desses módulos.

O primeiro slice de páginas converteu `/sobre` para `src/pages/sobre.ts`. A página preserva a linha do tempo, o mapa de áreas, o conteúdo educacional, o aviso de construção, o herói imersivo e as navegações para Roadmap, Git Nexus, Home e Biblioteca. `sobre.js` permanece somente como reexportação de compatibilidade. O typecheck revelou duas fronteiras reais e limitadas: imports CSS do Vite e atributos `null` aceitos pelo helper DOM; ambas receberam declarações explícitas, sem relaxar `strict`.

O segundo slice converteu `/arsenal` para `src/pages/arsenal.ts`. A página mantém filtros por categoria, equipe, tier e busca textual, estado persistido em Storage, seleção de detalhes, imagens Wikipedia com fallback, exportação JSON, aba de Doutrinas e hero imersivo. A fronteira declarativa de `arsenal.d.ts` descreve o catálogo sem duplicar os dados; `toast.d.ts` e o helper DOM fecham somente as APIs consumidas pela página.

O terceiro slice converteu a Home eager-loaded para `src/pages/home.ts`, preservando o wrapper JavaScript e o contrato `RouteArgs` do Router V1. A conversão foi dividida em três fronteiras de comportamento: o hero nativo com WebGL e fallback 2D, o bento com métricas/integrações opcionais e as prateleiras com navegação e limpeza de efeitos. Os dados de elites, crônicas, universos e cenas Spline receberam declarações estruturais mínimas; os adaptadores de efeitos, page views, contador de visitas e motores visuais continuam JavaScript, mas agora têm contratos explícitos. O ciclo de vida mantém `countUp`, `MutationObserver`, `requestAnimationFrame`, limpeza de listeners e destruição dos efeitos ao sair da página. Nenhuma lógica foi duplicada e não foram usados `any`, `@ts-ignore`, `@ts-nocheck` ou relaxamento de `strict`.

O quarto slice converteu `/roadmap` para `src/pages/roadmap.ts`. Como a página é editorial e estática, a migração fechou os tipos de níveis do Jarvis, status, áreas, listas concluídas e próximos passos sem criar estado global. O quinto slice converteu `/ferramentas` para `src/pages/ferramentas.ts`, tipando o catálogo, categorias, rotas, cores, busca, debounce, filtros e eventos de ponteiro. Durante essa onda, o contrato de `query` do hero imersivo foi corrigido de string para o mapa `Record<string, string>` que o Router V1 realmente entrega; Arsenal e Sobre foram alinhados à mesma fronteira. Os wrappers JS permanecem ativos e a lógica de runtime dos efeitos continua atrás de contratos declarativos.

O sexto slice converteu `/elites` para `src/pages/elites.ts`, tipando estado persistido, filtros por status/especialidade, busca, fichas, rosters parciais e navegação para a Biblioteca. O sétimo slice converteu `/universo` para `src/pages/universo.ts`, tipando seleção persistida, campos de lore, seções, crossovers e links para arcos. As declarações de `elites`, `universos` e `cronicas` foram estreitadas aos formatos reais, incluindo retornos `null` dos lookups. A onda também revelou e corrigiu um erro local em `src/data/elites-rosters.js`: a chave `FOXTROTT` não correspondia à equipe `FOXTROT`; a chave e os cinco nomes foram alinhados ao catálogo. Nenhuma lógica recebeu `any`, `@ts-ignore`, `@ts-nocheck` ou relaxamento de `strict`.

A onda militar estática converteu quatro páginas autocontidas: `/guerras-conflitos`, `/taticas-estrategias`, `/tecnologia-militar` e `/forcas-especiais`. Os datasets locais receberam interfaces estruturais, os estados de filtro e tabs foram estreitados, e os eventos de input e ponteiro passaram a usar `Event` com narrowing para elementos HTML. O comportamento visual continua dependente apenas de `militar.css`, `helpers` e `buildImmersiveHero`; nenhum novo contrato externo foi inventado.

A segunda onda militar converteu `/historia-militar`, `/batalhas-historicas` e `/organizacao-militar`. História preserva o accordion por era; Batalhas preserva a busca por nome, local e vencedor; Organização preserva as tabelas comparativas OF/OR, a estrutura de unidades e as três tabs. Os renderizadores de tabela foram isolados com tipos de linha explícitos, e o acesso dinâmico aos renderizadores foi fechado com a união `TabId`, sem coerções inseguras ou contratos externos adicionais.

A onda de catálogos militares converteu `/forcas-armadas` e `/armas-por-pais`. Forças Armadas recebeu tipos para dados numéricos, colunas, formatação, ordenação e filtros; a migração também corrigiu o uso de `event` global no cabeçalho da tabela, passando o evento explicitamente e estreitando `currentTarget`. Armas por País recebeu tipos para catálogo, status, filtros, selects e busca. As duas páginas continuam autocontidas e sem dependências externas novas.

A Enciclopédia Militar foi convertida para `src/pages/enciclopedia-militar.ts`. O banco `src/data/militar-db.js` recebeu uma fronteira `.d.ts` discriminada por `cards`, `list`, `units`, `battlespace`, `levels`, `eras`, `rank-pct` e `rank-bi`. Isso permitiu tipar os renderizadores sem duplicar os dados, mantendo a seleção persistida no Storage, a navegação por categorias, as tabelas, rankings e a fonte editorial.

A primeira onda de adaptadores do Core V1 converteu `pwa.js` e `toast.js`. O PWA passou a declarar o evento `beforeinstallprompt`, o retorno real de `promptInstall(): Promise<boolean>`, o unsubscribe de `onInstallChange()` e `isStandalone()`, corrigindo uma divergência que existia na declaração `.d.ts`. O Toast passou a consumir o Event Bus com payload `ToastEvent` tipado, preservando os timers, a substituição do toast ativo e a API de emissão existente. Nenhum consumidor precisou ser reescrito.

A segunda onda de adaptadores converteu `scroll-progress.js` e `scroll-reveal.js`. O primeiro preserva o mount único, os listeners passivos, o throttling via `requestAnimationFrame`, o `MutationObserver` do Shell e a variável CSS `--sp`. O segundo preserva os dois observers, a seleção de filhos diretos, `data-no-reveal`, `prefers-reduced-motion`, o fallback sem `IntersectionObserver`, o atraso `--reveal-delay` e a exclusão explícita da Home. O Shell continua chamando os wrappers `.js`, que agora encaminham para os módulos TypeScript.

A terceira onda converteu `atmosphere.js`. A camada global agora retorna `HTMLDivElement | null`, em vez de declarar `void`, preservando a idempotência, a composição CSS e o comportamento quando o root não existe. A correção fecha um contrato real entre o Shell e o adaptador visual sem alterar a camada de estilos.

A quarta onda converteu `card-spotlight.js`. O efeito mantém o listener delegado, o throttling por `requestAnimationFrame`, o respeito a `prefers-reduced-motion` e as variáveis CSS `--mx`/`--my`. A declaração foi corrigida para aceitar root ausente e nulo, que é a forma compatível com o fallback para `document.body`.

A quinta onda converteu `baluarte-status.js`. O estado global passou a ter tipos recursivos para valores serializáveis, as funções de publicação, remoção, seleção de rota e snapshot foram explicitadas, e `window.BaluarteStatus` recebeu uma declaração global sem permitir escrita arbitrária não tipada na API pública. O comportamento de somente leitura do snapshot e a recuperação segura para JSON inválido foram preservados.

A sexta onda converteu `theme.js`. As oito paletas (`neon`, `esmeralda`, `rubi`, `ambar`, `matrix`, `tatico`, `violeta` e `gelo`), o kit de variáveis CSS das paletas Fábula, a derivação de cores/glows, a limpeza de overrides, o evento `baluarte:theme` e a persistência via Storage foram mantidos. O contrato também deixou explícito que `setTheme` retorna o ID efetivamente aplicado, inclusive quando recebe um ID desconhecido.

A sétima onda converteu `mil-curation.js`. A resposta remota passou a ser `unknown` na fronteira e só entra no mapa depois de validar ID, nota, destaque e ordem. Linhas malformadas são descartadas, Supabase indisponível continua retornando `{}`, e o wrapper mantém o caminho V1. Para isso, `src/core/supabase.d.ts` formaliza a API REST sem introduzir `any` nem obrigar a migração do cliente inteiro nesta onda.

A oitava onda converteu `maplibre-loader.js`. O carregamento único da CDN, a promessa compartilhada, a inclusão do CSS, a limpeza da promessa após erro e o fallback `null` foram preservados. O contrato mínimo declara apenas `Map`, `NavigationControl`, `ScaleControl`, eventos de coordenadas e controles usados por `mapa.js` e `vanguard.js`, evitando fingir que o SDK inteiro já foi migrado.

A nona onda converteu `visit-counter.js`. O guard de uma contagem por sessão, a chamada `bump_visits()`, a leitura do total no PostgREST, o suporte a respostas numéricas/string e o fallback `null` foram preservados. A fronteira REST usa `unknown` e valida números finitos antes de expor o total ao chamador.

A décima onda converteu `page-views.js`. O guard por rota e sessão, a validação das rotas aceitas, o RPC `bump_view`, a leitura ordenada das métricas e o cálculo do total foram mantidos. A declaração legada foi corrigida de `Promise<boolean>` para `Promise<void>`, refletindo o comportamento real da função silenciosa.

A décima primeira onda converteu `triangulation.js`. Pontos, estações com bearing, resultado de mínimos quadrados, resíduo RMS, distância euclidiana e ruído gaussiano Box–Muller agora têm contratos explícitos. O limiar de degeneração, a fórmula das equações normais e o fallback numérico foram preservados sem ampliar o escopo para consumidores ainda JavaScript.

A décima segunda onda converteu `hx-beacon.js`. O fingerprint diário, a deduplicação por `sessionStorage`, a consulta opcional de geolocalização, o payload para `sendBeacon` e o comportamento totalmente silencioso foram preservados. A resposta externa passa por `unknown` e é convertida apenas para os campos de texto e coordenadas aceitos pelo payload.

A décima terceira onda converteu `markdown.js`. O escaping de `&`, `<`, `>`, aspas e texto integral antes das transformações foi mantido, assim como títulos, listas, ênfase, código, parágrafos e links. `urlSegura` continua removendo caracteres de controle, aceitando URLs relativas, `http`, `https` e `mailto`, e convertendo esquemas não permitidos para `#`.

A décima quarta onda converteu `immersive.js`. O contrato de opções dos heróis, CTAs com callbacks, descrições como `HChild`, escolha entre WebGL/rays/fallback 2D, montagem opcional de Spline, ponteiro, reduced-motion e auto-limpeza por `MutationObserver` foram preservados. `hero-rays.d.ts` formaliza somente o efeito mínimo necessário, sem declarar uma biblioteca visual maior do que o código usa.

A décima quinta onda converteu `webgl-probe.js`. A criação de canvas sem dependências, a detecção de WebGL 2 e fallback WebGL/experimental, o resultado booleano e a liberação por `WEBGL_lose_context` foram preservados. O contrato aceita `null` e não retém contextos gráficos abandonados.

A décima sexta onda converteu `arma3-extracao.js`. A ponte `window.baluarte.native`, o funil `invoke`, os canais `arma3:status`, `arma3:extrair` e `arma3:entregar`, a mensagem específica quando executado na web e os retornos usados pelo painel foram preservados. A resposta nativa é recebida como `unknown` e estreitada em contratos de status, extração e entrega, sem dar acesso web direto a filesystem ou Git.

A décima sétima onda converteu `cor.js`. As conversões HEX/RGB, RGB/HSL, HSL/RGB, sRGB/linear, RGB/OKLCH, luminância relativa, contraste WCAG e clamp foram mantidas como funções puras, com `null` explícito para HEX inválido.

A décima oitava onda converteu `fingerprint-engine.js`. A similaridade de cosseno, aprendizagem por centroide, classificação ordenada, confiança normalizada, listagem, remoção, limpeza e persistência pelo Storage foram preservadas. A leitura persistida agora valida estruturas e números antes de reintroduzi-los no motor.

A décima nona onda converteu `geo-tracker.js`. A distância Haversine, o limite de 5.000 pontos, o filtro de movimento mínimo de 2 metros, callbacks de atualização/erro, opções de alta precisão, parada do watcher, limpeza, injeção de pontos e estatísticas de distância, duração, média e velocidade máxima foram preservados. Pontos recuperados do Storage são validados antes do uso.

A vigésima onda converteu `jarvis-hermes-native.js`. A detecção de `window.baluarte.native`, o status silencioso `available:false`, os canais `hermes:status` e `hermes:generate`, os parâmetros de temperatura e tokens, os campos `text`/`content` e o fallback para o WebLLM foram preservados. O contrato do preload permanece restrito a `invoke`, sem expor `ipcRenderer`, filesystem ou o binding nativo ao navegador.

A vigésima primeira onda converteu `jarvis-repo-memory.js`. A fila global de gravações, o gate permanente quando `GITHUB_TOKEN` está ausente, o POST para `/api/memory`, os modos `save`/`list`, o retorno best-effort e o filtro de entradas textuais foram preservados. O cliente não recebe nem manipula tokens; a autenticação continua exclusivamente no handler serverless.

## 4. Gates das ondas TypeScript

| Comando | Resultado das Waves 4–6 e Plataforma | Observação |
| --- | --- | --- |
| `npm run tipos:ts` | Verde | Inclui Storage, layout, Registry, Ciclo, Boot, Plataforma, Sobre e Arsenal |
| `npx tsx --test test/storage.test.js test/storage-namespace.test.js` | Verde: 20/20 | Testes de esquema, migração, namespace e classificação |
| `npx tsx --test test/v2/registry.test.js` | Verde: 22/22 | Registro, selagem, isolamento, dependências e saídas do Core |
| `npm run build` | Verde | Vite compilou a aplicação; há apenas o aviso histórico de chunks grandes |
| `CHROME_PATH=/usr/bin/chromium npm run smoke` | Verde: 98/98 rotas | Produção local, navegação e router V1 preservados [3] |
| `npm test` | Verde: 871/871 | As seis falhas de Supervisor/Health/Plataforma e três do Orquestrador foram corrigidas |
| `npm run tipos:v2` | 61 erros históricos | Roadmap/Ferramentas não aumentaram a dívida; os 61 restantes pertencem a módulos V2 ainda não migrados |
| `CHROME_PATH=/usr/bin/chromium node scripts/v2-integracao.mjs` | Verde: 13/13 | Boot V2 no navegador, 17 rotas no router V1, view nativa, contexto, permissões e adaptador V1 |
| `CHROME_PATH=/usr/bin/chromium node scripts/caminho-critico.mjs` | Verde: 15/15 | Home no boot, navegação Arsenal → Home, estado do Editor/Terminal, persistência após reload e Home no fim da jornada |
| `npx tsx --test test/v2/ciclo.test.js` | Verde: 17/17 | Ordem de fases, timeout, cascata, descida inversa e módulos reais |
| `npx tsx --test test/v2/boot.test.js` | Verde: 13/13 | Registry → Ciclo → Router V1, navegação, diagnóstico e isolamento |
| `npx tsx --test test/v2/saude.test.js test/v2/supervisor.test.js test/v2/orquestrador.test.js test/v2/plataforma.test.js` | Verde: 18/18 | Health, estados do Supervisor, Orquestrador e fachada Plataforma |

### Gates remotos do `main` após a onda de catálogos militares

O código da onda foi publicado no commit [`baaa0ddc`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/baaa0ddc33b65f82f6be5c47e0cc08e395fbe973). O `Core CI`, o `V2 Runtime`, o `CodeQL`, o `Arma 3 Data CI` e o `Vigia das rotas` passaram no mesmo SHA. O Vigia confirmou build, 98 rotas, navegação, caminho crítico, limpeza dos efeitos e sobrevivência à perda de rede. CI, V2 Core e V2 Validation permaneceram vermelhos pela mesma causa-raiz já catalogada: 61 diagnósticos em arquivos JavaScript/JSDoc da V2, sem referência às duas páginas migradas.

O `Supabase Preview` continua com a falha real de integração `Remote migration versions not found in local migrations directory.` O repositório possui migrações SQL locais, mas não possui `supabase/config.toml` nem a CLI vinculada neste ambiente para comparar o catálogo remoto. Como nenhum arquivo `supabase/**` foi alterado nesta onda, a classificação permanece **drift preexistente entre o histórico remoto de migrações e o diretório versionado**, não regressão das páginas. A correção segura exige primeiro obter a lista oficial de versões remotas; não é correto criar, renomear ou apagar SQL/RLS por tentativa.

| Workflow remoto | Resultado | Evidência |
| --- | --- | --- |
| [`Core CI`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/31816906052) | Verde | Build/invariantes passaram |
| [`V2 Runtime`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/31816905955) | Verde | Runtime Rust passou |
| [`CodeQL`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/31816905928) | Verde | Análise de segurança passou |
| [`Arma 3 Data CI`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/31816906130) | Verde | Dados e parsers passaram |
| [`Vigia das rotas`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/31816905837) | Verde | 98/98 rotas e jornada preservadas |
| [`CI`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/31816906105) | Vermelho conhecido | 61 erros do `tipos:v2` |
| [`V2 Core`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/31816905931) | Vermelho conhecido | 61 erros do `tipos:v2`; sem referência às páginas migradas |
| [`V2 Validation`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/31816905936) | Vermelho conhecido | Runtime verde; typecheck V2 com os mesmos 61 erros |
| `Supabase Preview` ([check da onda de catálogos militares](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/baaa0ddc33b65f82f6be5c47e0cc08e395fbe973/checks)) | Vermelho de integração conhecido | Versões remotas de migração ausentes no diretório local; sem alteração em `supabase/**` nesta onda |

As Waves 4–6 e os slices de Ciclo, Boot, Plataforma, Sobre, Arsenal, Home, Roadmap, Ferramentas, Elites, Universo e as duas ondas militares estão publicados no `main`. A Wave 6 foi publicada inicialmente em `92a5cc98` e recebeu a correção final do wrapper em `1d8e1f5e`, depois de o CI revelar um ciclo de resolução que impedia o boot V2 no navegador. A correção foi reproduzida localmente e remotamente: o Vigia voltou a passar e a integração V2 ficou verde em 13/13. O slice de Ciclo foi publicado em `cb4c0872`; no commit remoto, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia das rotas passaram. O slice de Boot foi publicado em `a23eaa5d`; também passou nesses quatro gates. A correção Health/Supervisor e a Plataforma foram publicadas em `df0dd975`; no commit remoto, `Core CI` voltou a passar, além de `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia das rotas. A página Sobre foi publicada em `d310a02e` e preservou `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia das rotas verdes. Arsenal foi publicado em `b35b6bd6`; também preservou `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia das rotas. Arsenal passou localmente em `npm test` 871/871, build, `tipos:ts`, integração V2 13/13 e smoke V1 98/98; o `tipos:v2` permaneceu em 61 erros históricos. A Home foi publicada em `a15523d5`; a validação local desse commit passou em `npm test` 871/871, `npm run build`, `npm run tipos:ts`, integração V2 13/13, smoke V1 98/98 e caminho crítico 15/15. O `tipos:v2` permaneceu em 61 diagnósticos históricos, sem crescimento atribuído à Home. Roadmap e Ferramentas foram publicados em `b3f681c6`; localmente passaram em `npm test` 871/871, build, `tipos:ts`, integração V2 13/13, smoke 98/98 e caminho crítico 15/15. A onda também corrigiu o contrato de query do hero sem alterar o comportamento V1. Elites e Universo foram publicados em `185cef09`; localmente passaram em `tipos:ts`, `npm test` 871/871, build e smoke 98/98 após repetição de um timeout externo isolado em `/musicas`. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia das rotas passaram; CI, V2 Core e V2 Validation permaneceram vermelhos pela dívida V2 conhecida de 61 diagnósticos. A onda militar estática foi publicada em `22cd5c9a`; `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 e caminho crítico 15/15 passaram localmente. No remoto, os mesmos cinco gates operacionais passaram, enquanto CI, V2 Core e V2 Validation permaneceram nos 61 erros conhecidos. A segunda onda militar foi publicada em `2b59380d`; também passou localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 e caminho crítico 15/15. Os cinco gates operacionais remotos passaram novamente; os três gates de typecheck V2 permaneceram na mesma dívida conhecida. A onda de catálogos militares foi publicada em `baaa0ddc`; Forças Armadas e Armas por País passaram localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 e caminho crítico 15/15. Os cinco gates operacionais remotos passaram; CI, V2 Core e V2 Validation permaneceram nos 61 diagnósticos conhecidos. A Enciclopédia Militar foi publicada em `87c8e16c`; também passou localmente nos mesmos gates e preservou a mesma matriz remota: `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia verdes; CI, V2 Core e V2 Validation nos 61 diagnósticos V2 preexistentes. PWA e Toast foram publicados em `50e6b2ef`; `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 e caminho crítico 15/15 passaram localmente. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram; CI, V2 Core e V2 Validation permaneceram nos 61 erros V2 conhecidos. Scroll Progress e Scroll Reveal foram publicados em `e09877f9`; passaram localmente nos mesmos gates e, no remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram. A dívida V2 permaneceu inalterada nos três gates de typecheck. Atmosphere foi publicado em `1a312e71`; passou localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 e caminho crítico 15/15. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram; CI, V2 Core e V2 Validation permaneceram nos 61 erros V2 conhecidos. Card Spotlight foi publicado em `2d20a99e`; passou localmente nos mesmos gates. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram, enquanto CI, V2 Core e V2 Validation permaneceram na dívida V2 conhecida. Baluarte Status foi publicado em `1e36051c`; passou localmente nos mesmos gates. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram, enquanto CI, V2 Core e V2 Validation permaneceram nos 61 diagnósticos V2 preexistentes. Theme foi publicado em `6ee11efb`; passou localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 e caminho crítico 15/15. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram; CI, V2 Core e V2 Validation permaneceram nos mesmos 61 diagnósticos V2 preexistentes. Mil Curation foi publicado em `55332a00`; passou localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 e caminho crítico 15/15. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram; CI, V2 Core e V2 Validation permaneceram nos mesmos 61 diagnósticos V2 preexistentes. MapLibre Loader foi publicado em `95a0ff02`; passou localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 após repetir um timeout externo isolado em `/musicas`, e caminho crítico 15/15. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram; CI, V2 Core e V2 Validation permaneceram nos mesmos 61 diagnósticos V2 preexistentes. O CodeQL também registrou apenas avisos de manutenção sobre Node 20 e CodeQL Action v3, sem falha de análise. Visit Counter foi publicado em `6a97a1f0`; passou localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 e caminho crítico 15/15. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram; CI, V2 Core e V2 Validation permaneceram nos mesmos 61 diagnósticos V2 preexistentes. Page Views foi publicado em `7b466285`; passou localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 após repetir um timeout externo isolado em `/musicas`, e caminho crítico 15/15. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram; CI, V2 Core e V2 Validation permaneceram nos mesmos 61 diagnósticos V2 preexistentes. Triangulation foi publicada em `22620963`; passou localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 e caminho crítico 15/15. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram; CI, V2 Core e V2 Validation permaneceram nos mesmos 61 diagnósticos V2 preexistentes. hx Beacon foi publicado em `b4a885c2`; passou localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 e caminho crítico 15/15. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram; CI, V2 Core e V2 Validation permaneceram nos mesmos 61 diagnósticos V2 preexistentes. Markdown foi publicado em `59bb1597`; passou localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 e caminho crítico 15/15. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram; CI, V2 Core e V2 Validation permaneceram nos mesmos 61 diagnósticos V2 preexistentes. Immersive Hero foi publicado em `78108a37`; passou localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 e caminho crítico 15/15. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram; CI, V2 Core e V2 Validation permaneceram nos mesmos 61 diagnósticos V2 preexistentes. WebGL Probe foi publicado em `6142d423`; passou localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 e caminho crítico 15/15. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram; CI, V2 Core e V2 Validation permaneceram nos mesmos 61 diagnósticos V2 preexistentes. Arma 3 Extraction foi publicado em `316ff718`; passou localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 e caminho crítico 15/15. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram; CI, V2 Core e V2 Validation permaneceram nos mesmos 61 diagnósticos V2 preexistentes. Cor foi publicada em `1a8e996e`; passou localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 e caminho crítico 15/15. `Core CI`, `V2 Runtime`, Arma 3 Data CI e Vigia passaram no remoto; CI, V2 Core e V2 Validation permaneceram na dívida conhecida. O CodeQL dessa SHA ainda estava em execução quando a onda seguinte foi publicada; o CodeQL da onda Fingerprint, com o mesmo escopo de segurança, passou. Fingerprint Engine foi publicado em `be643095`; passou localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 e caminho crítico 15/15. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram; CI, V2 Core e V2 Validation permaneceram nos mesmos 61 diagnósticos V2 preexistentes. GeoPulse foi publicado em `b54a1fd0`; passou localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke após repetir um timeout externo em `/musicas` com 98/98 rotas verdes, e caminho crítico 15/15. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram; CI, V2 Core e V2 Validation permaneceram nos mesmos 61 diagnósticos V2 preexistentes. Hermes Native Bridge foi publicado em `973c60f1`; passou localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke após repetir um timeout externo em `/musicas` com 98/98 rotas verdes, e caminho crítico 15/15. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram; CI, V2 Core e V2 Validation permaneceram nos mesmos 61 diagnósticos V2 preexistentes. Repo Memory foi publicado em `1e299d18`; passou localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 e caminho crítico 15/15. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram; CI, V2 Core e V2 Validation permaneceram nos mesmos 61 diagnósticos V2 preexistentes.
O Registry TypeScript preserva 22/22 testes específicos; o Ciclo preserva 17/17; o Boot preserva 13/13; Health, Supervisor e Plataforma preservam 18/18. O `tsconfig.json` raiz inclui somente os arquivos efetivamente migrados. Isso é intencional: o portão cresce junto com a conversão e não finge que arquivos ainda JavaScript já possuem contratos TypeScript.

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
| 7 | Ciclo, Boot, Plataforma e páginas de maior valor | Publicada: Ciclo, Boot, Plataforma, Sobre, Arsenal, Home, Roadmap, Ferramentas, Elites e Universo por slices; o próximo grupo seguro são páginas militares estáticas pequenas |
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
CHROME_PATH=/usr/bin/chromium node scripts/caminho-critico.mjs
```

O próximo incremento recomendado é migrar páginas militares estáticas pequenas, começando por `/guerras-conflitos`, `/taticas-estrategias`, `/tecnologia-militar` e `/forcas-especiais`. Depois devem vir hubs médios e fronteiras de dados compartilhadas. Runtime Manager/Restart continua um corte de Core recomendado em paralelo, sempre preservando o fallback de módulos, o Router V1 e a navegação funcional.

## 8. Referências

[1]: ../../../docs/architecture/decisions/ADR-004-stack-poliglota-por-responsabilidade.md "ADR-004 — Stack poliglota por responsabilidade"
[2]: ../../test/storage.test.js "Testes comportamentais do Storage"
[3]: ../../relatorios/smoke-rotas.md "Smoke de rotas mais recente"


## 4.1 Marco 1 — JARVIS, contexto compacto e Briefing de Notícias

O Marco 1 adicionou `src/utils/jarvis-context.ts` como implementação canônica do briefing do JARVIS, com wrapper `jarvis-context.js`, cache por versão/contagens, variante compacta e janela limitada de mensagens. A camada `src/utils/news-briefing.ts` recebeu o contrato de notícias com wrapper JavaScript, normalização, URL segura, deduplicação, confiança e estados de revisão. As fronteiras `site-capabilities.d.ts` e `jarvis-brain.d.ts` foram declaradas para que o novo TypeScript não tratasse módulos JavaScript legados como `any` implícito.

O modo `Briefing` foi conectado à página existente do JARVIS e usa o backend de busca web já disponível para produzir rascunhos somente de leitura. O modo OpenClaw mantém o endpoint configurável, enquanto o bridge local em `scripts/openclaw-bridge.mjs` mantém tokens fora do navegador e encaminha apenas `/v1/chat/completions`.

O primeiro módulo nativo V2 de briefing está em `v2/modules/briefing/`, foi incluído no `v2/jsconfig.json` e registrado no harness. O manifesto declara `NETWORK`, storage próprio, evento de atualização, API de health/prompt/ingest/list e view lazy. O `npm run tipos:v2` voltou ao baseline documentado de 61 diagnósticos em 12 arquivos do Core, sem novo diagnóstico no módulo briefing.

A suíte comportamental passou em 876/876 após a adição dos cinco testes do marco. A integração V2 passou em 14/14, o smoke permaneceu em 98/98, o caminho crítico passou em 15/15, o build e `npm run tipos:ts` passaram. O Runtime Rust não pôde ser executado neste ambiente porque o Cargo disponível é 1.75 e rejeita o `Cargo.lock` versão 4; nenhum lockfile foi alterado e o gate remoto do Runtime continua sendo a referência adequada até a execução com toolchain compatível.


### Publicação do Marco 1

O Marco 1 foi publicado no commit [`446a272e`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/446a272e1c96113b715e90a3727184db8d84786a). A matriz remota desse SHA foi: `Core CI` verde, `V2 Runtime` verde, `CodeQL` verde, `Arma 3 Data CI` verde e `Vigia das rotas` verde; `CI`, `V2 Core` e `V2 Validation` vermelhos pelos mesmos 61 diagnósticos históricos do `tipos:v2`. O `Vigia` confirmou 98 rotas, build de produção, integração V2 14/14, caminho crítico e teste de perda de rede. CodeQL não encontrou vulnerabilidade; registrou apenas avisos de manutenção sobre Node 20 e CodeQL Action v3.


## 4.2 Onda Dossiê

A página `/dossie` foi convertida para `src/pages/dossie.ts`, mantendo `src/pages/dossie.js` como wrapper de compatibilidade. A implementação canônica tipa o estado persistido, o status de carregamento, o catálogo de seções e blocos, o parser defensivo do JSON gerado, a busca textual, a seleção de seção, a renderização do leitor e o carregamento lazy do asset. `src/assets.d.ts` declara a fronteira `*.json?url` usada pelo Vite.

O JSON gerado não foi duplicado nem convertido junto com a página. A entrada externa passa por `unknown` e valida título, identificador, nível e blocos antes de entrar no estado. A paginação, o sumário, os CTAs, o hero, a persistência e a mensagem de erro permanecem compatíveis com a V1.

Validação da onda: `npm run tipos:ts` verde; `npm run build` verde; `npm test` 876/876; `npm run smoke` 98/98; `npm run v2:integracao` 14/14; `npm run caminho-critico` 15/15. `npm run tipos:v2` permaneceu na dívida histórica de 61 diagnósticos, sem relação com Dossiê.


## 4.3 Onda de ferramentas e utilitários de baixo acoplamento

A segunda onda de páginas pequenas converteu `simbolos.js`, `gerar-codigo.js`, `git-helper.js` e `dolar.js` para implementações canônicas TypeScript. Cada página mantém um wrapper JavaScript no caminho original. Foram adicionadas fronteiras declarativas para `symbols.js`, `git-helper.js`, `editor-langs.js`, `jarvis-engine.js` e `syntax-highlight.js`; a migração não duplicou os catálogos ou datasets gerados.

`simbolos.ts` valida o estado de favoritos antes de persistir e preserva a busca por caractere, nome e code point. `gerar-codigo.ts` compartilha o catálogo de linguagens com Editor/JARVIS, tipa o request ao backend, remove cercas Markdown da resposta e valida o estado de tabs antes de abrir o resultado no Editor. `git-helper.ts` é uma composição estática de comandos e templates com clipboard assíncrono. `dolar.ts` valida o JSON de câmbio, estreita moedas e ranges, calcula estatísticas e preserva o SVG controlado do gráfico.

A onda também gerou o relatório determinístico [`PAGES_JS_REMAINING_INVENTORY.md`](./PAGES_JS_REMAINING_INVENTORY.md), com a matriz completa, grupo, risco, linhas, bytes e próxima ação. O total caiu de 95 para **91 páginas JavaScript canônicas restantes**. JARVIS e Editor não foram migrados: seus contratos pesados estão em [`JARVIS_EDITOR_MIGRATION_PLAN.md`](./JARVIS_EDITOR_MIGRATION_PLAN.md).

Validação da onda: `npm run tipos:ts` verde; `npm run build` verde; `npm test` 876/876; `npm run smoke` 98/98; `npm run v2:integracao` 14/14; `npm run caminho-critico` 15/15. `npm run tipos:v2` permaneceu nos 61 diagnósticos históricos, sem erro nos quatro módulos novos. A onda não executa envio externo, chamada WhatsApp ou ação comercial.


## 4.4 Onda de hubs de conhecimento e segurança

A onda seguinte converteu `biblioteca.js`, `academia.js`, `ciberseg.js` e `robotica.js` para implementações canônicas TypeScript, mantendo wrappers `.js` nos caminhos legados. Foram adicionadas fronteiras para `academia.js`, `ciberseg.js`, `robotica.js` e ampliado o contrato de `cronicas.js` para capítulos estruturados, arcos canônicos e retorno tipado de `loadSaga()`.

`biblioteca.ts` valida o estado persistido, preserva carregamento lazy da saga, filtros, favoritos, retomada, tema, tamanho de fonte e navegação entre capítulos; `academia.ts` fecha os contratos dos módulos de linguagem e abre tabs tipadas no Editor; `ciberseg.ts` usa severidades e categorias fechadas; `robotica.ts` valida o módulo persistido contra o currículo estático. Nenhuma dessas páginas cria uma nova camada de storage ou altera o Router V1.

O plano operacional da primeira onda de JARVIS está em [`roadmap/JARVIS_WAVE_1_CONTRACTS.md`](./roadmap/JARVIS_WAVE_1_CONTRACTS.md). A J1 tratará contratos de sessão, mensagem, configuração pública, adapters, eventos de streaming, fallback e permissões sem converter ainda a superfície `jarvis.js`. A J2 virá depois para memória e recall.

Validação local desta onda: `npm run tipos:ts` verde; `npm test` 876/876; `npm run build` verde; `npm run smoke` 98/98; `npm run v2:integracao` e `npm run caminho-critico` verdes. `npm run tipos:v2` permaneceu nos 61 diagnósticos JSDoc históricos, sem erro novo nos quatro hubs. O inventário operacional caiu de 91 para **87 páginas JavaScript canônicas restantes**.


## 4.5 Onda J1 do JARVIS e catálogo de modpacks/Zomboid

A primeira onda J1 do JARVIS foi implementada sem converter a superfície pesada de `jarvis.js`. `src/utils/jarvis-contracts.ts` agora define os 12 modos de sessão (`SESSION_MODES`), `JarvisMessage`, `JarvisSession`, `JarvisPublicConfig`, `ConversationRequest`, `AdapterEvent` e a interface `JarvisAdapter`, além de guards de tipo e detecção de chaves com aparência de segredo. `src/utils/jarvis-contracts-fakes.ts` fornece adapters determinísticos para todos os modos, eventos de texto, progresso, tool call, abort/timeout e falha controlada. O teste focal `test/jarvis-contracts-j1.test.js` cobre 8 cenários e passou integralmente. A J1 continua deliberadamente sem envio de WhatsApp, publicação, venda ou ação externa automática; OpenClaw permanece uma fronteira configurável e somente confirmável pelo operador.

A onda de páginas converteu `modpack.js`, `projetos.js`, `zomboid.js` e `zomboid-admin.js` para implementações canônicas TypeScript, mantendo os quatro wrappers `.js`. O Modpack tipa estado persistido, filtros de tier/categoria/busca, abas Minecraft/Arma 3, presets e DLCs. Projetos tipa o status, tags, rota e dados importados do JSON. Zomboid tipa a coleção, categorias, destaques e navegação para administração. Zomboid Admin tipa comandos, categorias, IDs, cópia para clipboard e busca debounced, preservando o princípio de não inventar `Mod ID` ou `Spawn ID` ausentes.

As fronteiras declarativas de `modpack`, `arma3-presets`, `arma3-instalacao`, `zomboid-mods` e `zomboid-admin` foram adicionadas ao `tsconfig.json`. As declarações preparatórias para o futuro módulo `Jogos` permanecem isoladas, mas `jogos.js` não foi convertido nesta onda: seu motor de jogadores, Code Quest e múltiplos runners exigem contratos comportamentais próprios antes da troca do wrapper. Essa decisão reduz o raio de regressão e mantém a próxima onda reversível.

O inventário determinístico foi regenerado sobre o workspace após a base `0762acfb`; o número de páginas JavaScript canônicas caiu de 87 para **83**. No conjunto `src`/`v2`, a árvore contém 351 arquivos `.js`, 72 wrappers reconhecidos, 140 implementações `.ts` e 67 declarações `.d.ts`; a contagem de páginas TypeScript canônicas chegou a 31. Esses números distinguem arquivos legados mantidos por compatibilidade de dívida funcional real.

Validação local desta onda: `npm run tipos:ts` verde; `npm test` **884/884**; `npm run build` verde com apenas o aviso histórico de chunks grandes; `npm run smoke` **98/98**; `npm run v2:integracao` **14/14**; `npm run caminho-critico` **15/15**. `npm run tipos:v2` continua vermelho com exatamente **61 erros em 12 arquivos**, sem crescimento e concentrado na dívida JSDoc preexistente de Runtime Manager/Group, stdio, supervisor, transporte e vertical slice. Os relatórios de smoke gerados localmente foram restaurados após a execução para não versionar timestamps de teste.

O próximo passo seguro é fechar J2 de memória/recall do JARVIS e, em paralelo, tipar Jogos com testes do motor de jogadores. `jarvis.js`, `editor.js`, Arma 3, 3D e mídia continuam reservados para ondas próprias conforme [`JARVIS_EDITOR_MIGRATION_PLAN.md`](./JARVIS_EDITOR_MIGRATION_PLAN.md).


## 4.6 Onda cripto de baixo acoplamento

A continuação da migração converteu três painéis pequenos para implementações canônicas TypeScript: `src/pages/cripto/atbash.ts`, `src/pages/cripto/hash.ts` e `src/pages/cripto/vigenere.ts`. Os caminhos `.js` continuam como wrappers de compatibilidade, preservando o contrato consumido pelo hub `/cripto`.

`atbash.ts` tipa a tabela de 26 pares, o textarea e a saída da involução. `hash.ts` fecha a união dos algoritmos SHA/MD5 informativo, estreita os resultados de `allHashes()` e mantém a cópia assíncrona para clipboard. `vigenere.ts` tipa texto, chave, encode/decode e a chave esticada exibida alinhada com o texto. A fronteira `src/utils/cripto-engine.d.ts` declara somente as funções reais consumidas pelos três painéis, sem converter o motor criptográfico inteiro nesta onda.

Validação local: `npm run tipos:ts` verde; `npm test` **884/884**; `npm run build` verde com o aviso histórico de chunks grandes; `npm run smoke` **98/98**; `npm run v2:integracao` **14/14**; `npm run caminho-critico` **15/15**. O inventário determinístico caiu de **83 para 80 páginas JavaScript canônicas restantes**. `tipos:v2` permanece acompanhado separadamente na dívida histórica de 61 diagnósticos, sem usar supressões ou relaxamento de strict.

A próxima sub-onda segura é `cripto/caesar.ts`, `cripto/base.ts` e, depois, os painéis de maior estado como OTP, AES e Morse. O hub cripto só deve ser convertido quando o ciclo de áudio e a troca de abas tiverem fronteiras próprias.


## 4.7 Onda do laboratório cripto completo

A sub-onda seguinte concluiu a conversão do laboratório `/cripto`: `caesar.ts`, `base.ts`, `otp.ts`, `aes.ts`, `morse.ts` e `cripto/index.ts` agora são as implementações canônicas TypeScript; os seis arquivos `.js` correspondentes permanecem como wrappers. O motor `src/utils/cripto-engine.js` continua JavaScript, mas sua fronteira foi ampliada de forma mínima e explícita para Caesar, Base64/Base32/Hex, OTP, AES-GCM, Morse, hashes e Vigenère/Atbash.

`caesar.ts` preserva encode/decode, ranking de brute force e seleção por clique. `base.ts` fecha o mapa de formatos, resultados nulos de decode e cópia para clipboard. `otp.ts` valida base64, tamanhos de mensagem/chave, geração de chave e ciclo encrypt/decrypt. `aes.ts` mantém os fluxos assíncronos de PBKDF2/AES-GCM, geração de senha e estados de erro. `morse.ts` tipa WPM, frequência e lifecycle do `AudioContext`; `cripto/index.ts` fecha os oito IDs de tab, persiste a aba ativa e sempre chama `stopMorse()` na troca.

Validação local: `npm run tipos:ts` verde; `npm test` **884/884**; `npm run build` verde com o aviso histórico de chunks grandes; `npm run smoke` **98/98**; `npm run v2:integracao` **14/14**; `npm run caminho-critico` **15/15**. O inventário determinístico caiu de **80 para 74 páginas JavaScript canônicas restantes**. Nenhuma API externa, segredo ou ação de alto impacto foi adicionada.

O próximo passo permanece incremental: finalizar páginas cripto já isoladas, depois calculadoras e páginas utilitárias pequenas. O hub só foi convertido depois que todos os painéis que ele monta estavam protegidos por contratos TypeScript.


## 4.8 Primeira onda de calculadoras

Foram convertidos `src/pages/calculadoras/financeira.ts`, `estatistica.ts` e `engenharia.ts`. Os três caminhos `.js` permanecem como wrappers para os importadores legados, enquanto o hub ainda pode montar os painéis restantes sem mudança de rota.

A calculadora financeira mantém juros simples e compostos, Price, VPL/TIR por Newton-Raphson e equivalência de taxas. A estatística mantém parsing de listas, descritiva com quartis/moda/desvios, regressão linear, Pearson, R² e predição. A engenharia mantém Lei de Ohm, divisor, código de cores de resistores, frequência/comprimento de onda e pressão hidrostática de Stevin. As fronteiras são locais: cada painel declara tipos de inputs, resultados e tabelas, sem introduzir `any` ou relaxar `strict`.

Validação local: `npm run tipos:ts` verde; `npm test` **884/884**; `npm run build` verde com o aviso histórico de chunks grandes; `npm run smoke` **98/98**; `npm run v2:integracao` **14/14**; `npm run caminho-critico` **15/15**. O inventário determinístico caiu de **74 para 71 páginas JavaScript canônicas restantes**.

A próxima etapa do catálogo é converter o hub de calculadoras somente depois de fechar os cinco painéis. Os painéis restantes — conversores e saúde — serão convertidos antes do hub para manter a fronteira de montagem completamente tipada.


## 4.9 Hub de Calculadoras concluído

Com os cinco painéis fechados, `src/pages/calculadoras/index.ts` substituiu o hub JavaScript canônico. O hub tipa os cinco IDs de tab, valida o valor persistido em storage, mantém a montagem de cada painel e preserva a superfície da rota `/calculadoras`; `index.js` continua como wrapper.

Também foram convertidos `conversores.ts` e `saude.ts`. Conversores agora tem categorias e unidades explícitas, conversão especial de temperatura, seleção de fonte e renderização de resultados tipadas. Saúde preserva IMC, Mifflin-St Jeor, macros, zonas de Karvonen e hidratação, com tipos para cada conjunto de entradas.

Validação local: `npm run tipos:ts` verde; `npm test` **884/884**; `npm run build` verde com o aviso histórico de chunks grandes; `npm run smoke` **98/98**; `npm run v2:integracao` **14/14**; `npm run caminho-critico` **15/15**. O inventário determinístico caiu de **71 para 68 páginas JavaScript canônicas restantes**.

A próxima frente de baixo risco passa para utilitárias e conteúdo estático menores, mantendo as páginas médias e os módulos de alto acoplamento reservados para contratos próprios.


## 4.10 Onda utilitária e conteúdo estruturado

Foram convertidas quatro páginas de baixo acoplamento: `arsenal-expandido.ts`, `_placeholder.ts`, `guia-pc.ts` e `tabela-periodica.ts`. Os wrappers `.js` permanecem para compatibilidade.

`arsenal-expandido.ts` deriva categorias e itens do JSON real, tipa a busca e a troca de abas e não duplica o catálogo. `_placeholder.ts` fecha o contrato de rota, 404 e falha de carregamento com navegação pelo Router existente. `guia-pc.ts` adiciona o contrato de `PC_PRESETS` à fronteira Modpack, preserva storage, seleção de builds e o tutorial de sete passos. `tabela-periodica.ts` adiciona `periodic.d.ts`, tipa os 118 elementos, categorias, posições do grid, filtros e configuração eletrônica.

Validação local: `npm run tipos:ts` verde; `npm test` **884/884**; `npm run build` verde com o aviso histórico de chunks grandes; `npm run smoke` **98/98**; `npm run v2:integracao` **14/14**; `npm run caminho-critico` **15/15**. O inventário determinístico caiu de **68 para 64 páginas JavaScript canônicas restantes**.

A fronteira de dados periódicos é declarativa e read-only; nenhuma camada Supabase, Router ou Runtime foi duplicada ou alterada.


## 4.11 Git Nexus Gate e fronteira de chunks nativos

`src/pages/git-nexus-gate.ts` substituiu o gate JavaScript da rota `/git-nexus`. A implementação mantém a regra web leve: no navegador, mostra apenas o teaser e não baixa o grafo 3D; no Launcher nativo, carrega sob demanda o Núcleo ou o cockpit legado. Foram criadas declarações separadas para `git-nexus-nucleo.js` e `git-nexus-cockpit.js`, evitando `any` implícito na fronteira dinâmica e sem migrar prematuramente os módulos pesados.

Validação local: `npm run tipos:ts` verde; `npm test` **884/884**; `npm run build` verde com o aviso histórico de chunks grandes; `npm run smoke` **98/98**; `npm run v2:integracao` **14/14**; `npm run caminho-critico` **15/15**. O inventário determinístico caiu de **64 para 63 páginas JavaScript canônicas restantes**.


## 4.12 Segurança do Agente e contrato Jarvis Guard

`src/pages/seguranca.ts` substituiu a página JavaScript de Segurança. A fronteira `jarvis-guard.d.ts` declara níveis `safe`, `caution` e `block`, logs read-only, decisões, estatísticas e o catálogo de ferramentas. A página preserva o toggle local, o log de decisões, a limpeza, as estatísticas e a classificação visual sem duplicar a política de segurança.

Validação local: `npm run tipos:ts` verde; `npm test` **884/884**; `npm run build` verde com o aviso histórico de chunks grandes; `npm run smoke` **98/98**; `npm run v2:integracao` **14/14**; `npm run caminho-critico` **15/15**. O inventário determinístico caiu de **63 para 62 páginas JavaScript canônicas restantes**.


## 4.13 Banco ao vivo e Centro Militar

`src/pages/banco.ts` substituiu o Painel do Banco com normalização explícita de retornos `unknown` do Supabase. As consultas continuam read-only (`site_stats` e `mural_posts`), o fallback offline permanece silencioso e nenhuma política RLS foi alterada.

`src/pages/militar.ts` substituiu o hub Centro Militar com tópicos imutáveis, índice de conteúdo, observers de viewport, links internos pelo Router, extratos da Wikipédia e curadoria best-effort do Supabase. Foram adicionados os tipos de `WikiSummary`; a curadoria existente em `mil-curation.ts` foi reutilizada sem duplicação.

Validação local: `npm run tipos:ts` verde; `npm test` **884/884**; `npm run build` verde com o aviso histórico de chunks grandes; `npm run smoke` **98/98**; `npm run v2:integracao` **14/14**; `npm run caminho-critico` **15/15**. O inventário determinístico caiu de **62 para 60 páginas JavaScript canônicas restantes**.


## 4.14 Poder Militar

`src/pages/poder-militar.ts` substituiu o ranking JavaScript local. O catálogo de 15 países, as cinco métricas, ordenação por GFP/efetivos/equipamentos, barras proporcionais, tags, resumo nuclear e hero imersivo agora usam contratos TypeScript explícitos. O wrapper `.js` permanece para a rota legada.

Validação local: `npm run tipos:ts` verde; `npm test` **884/884**; `npm run build` verde com o aviso histórico de chunks grandes; `npm run smoke` **98/98**; `npm run v2:integracao` **14/14**; `npm run caminho-critico` **15/15**. O inventário determinístico caiu de **60 para 59 páginas JavaScript canônicas restantes**.


## 4.15 Rede Neural Comms

`src/pages/comms.ts` substituiu a página de comunicações. Foram criados contratos para mensagens globais, status da ponte e handle de transporte em `core/comms.d.ts`, além da fronteira de sessão em `core/supabase-auth.d.ts`. A página preserva leitura pública, CTA de login Google, envio autenticado, histórico com teto visual, deduplicação delegada ao transporte, status Realtime e fechamento do socket ao deixar a rota.

Validação local: `npm run tipos:ts` verde; `npm test` **884/884**; `npm run build` verde com o aviso histórico de chunks grandes; `npm run smoke` **98/98**; `npm run v2:integracao` **14/14**; `npm run caminho-critico` **15/15**. O inventário determinístico caiu de **59 para 58 páginas JavaScript canônicas restantes**.


## 4.16 Baixar e releases do Launcher

`src/pages/baixar.ts` substituiu a página de download. A implementação tipa sistemas operacionais, assets e releases do GitHub, mantém detecção de SO, fallback para a página de releases, download do instalador correto, links de plataformas alternativas e busca do APK Android. Respostas externas são tratadas como `unknown` e normalizadas por guards locais; nenhum segredo ou token é introduzido.

Validação local: `npm run tipos:ts` verde; `npm test` **884/884**; `npm run build` verde com o aviso histórico de chunks grandes; `npm run smoke` **98/98**; `npm run v2:integracao` **14/14**; `npm run caminho-critico` **15/15**. O inventário determinístico caiu de **58 para 57 páginas JavaScript canônicas restantes**.


## 4.17 Enciclopédia de Portas Lógicas

`src/pages/portas.ts` substituiu a enciclopédia JavaScript de lógica digital. O contrato `logic-circuits.d.ts` tipa células de tabela verdade, portas fundamentais, blocos combinacionais/sequenciais, famílias de chips e estatísticas. A página preserva os símbolos SVG gerados, tabelas verdade, nota sobre NAND/NOR, catálogo 7400/4000 e link para o Logic Sim.

Validação local: `npm run tipos:ts` verde; `npm test` **884/884**; `npm run build` verde com o aviso histórico de chunks grandes; `npm run smoke` **98/98**; `npm run v2:integracao` **14/14**; `npm run caminho-critico` **15/15**. O inventário determinístico caiu de **57 para 56 páginas JavaScript canônicas restantes**.


## 4.18 Diagnóstico do sistema

`src/pages/diagnostico.ts` substituiu o painel de Diagnóstico. Foi criada a fronteira `politica.d.ts` para a fotografia completa de permissões, esquemas, flags, níveis e ambiente. A página preserva as sondas de capacidades do navegador, o estado de estabilidade, concessão/revogação de permissões, liga/desliga de flags, reset para padrão, divergência de esquemas e últimas decisões, sem `innerHTML`.

Validação local: `npm run tipos:ts` verde; `npm test` **884/884**; `npm run build` verde com o aviso histórico de chunks grandes; `npm run smoke` **98/98**; `npm run v2:integracao` **14/14**; `npm run caminho-critico` **15/15**. O inventário determinístico caiu de **56 para 55 páginas JavaScript canônicas restantes**.


## 4.19 Economia e cotações externas

`src/pages/economia.ts` substituiu o painel de Economia. `economia-api.d.ts` declara pares de moeda, cotações, criptoativos, funções de busca e formatadores. A implementação preserva atualizações concorrentes com `Promise.allSettled`, conversor BRL, cache local, status online/offline e mensagens de erro, normalizando respostas externas sem introduzir tipos frouxos.

Durante a validação foi encontrado e corrigido um erro local de build: a implementação nova havia importado `styles/economia.css`, arquivo que não existia e também não era importado pela página original. A correção removeu somente essa importação indevida; depois disso todos os gates voltaram a passar.

Validação final local: `npm run tipos:ts` verde; `npm test` **884/884**; `npm run build` verde com o aviso histórico de chunks grandes; `npm run smoke` **98/98**; `npm run v2:integracao` **14/14**; `npm run caminho-critico` **15/15**. O inventário determinístico caiu de **55 para 54 páginas JavaScript canônicas restantes**.

## 4.20 Orçamentos Militares

`src/pages/orcamentos-militares.ts` substituiu a implementação canônica de `/orcamentos-militares`. A página agora usa a interface `MilitaryBudget`, mantém o catálogo SIPRI 2024, ordenação por gasto, estatísticas, tabela, barras de comparação, alternância entre tabela e gráfico, fonte exibida e o hero imersivo. O arquivo `.js` permanece como wrapper de compatibilidade para consumidores V1.

A migração não criou nova lógica de negócio nem alterou os dados apresentados. A tipagem fechou o modelo de cada país e os modos de visualização, sem recorrer a `any`, `@ts-ignore` ou relaxamento do `strict`.

Validação final local: `npm run tipos:ts` verde; `npm test` **884/884**; `npm run build` verde com o aviso histórico de chunks grandes; `npm run smoke` **98/98**; `npm run v2:integracao` **14/14**; `npm run caminho-critico` **15/15**. O inventário determinístico caiu de **54 para 53 páginas JavaScript canônicas restantes**.

## 4.21 Shadow e gateway de sessão restrita

`src/pages/shadow.ts` substituiu a página canônica da Ponte Shadow. A implementação tipa o relatório de storage, as linhas de diagnóstico e os links restritos, preservando a regra de não revelar o setor sem `isShadowUnlocked()`, a abertura do gateway, o estado do Service Worker, a navegação para módulos profundos e o encerramento explícito da sessão com `lockShadow()`.

A nova fronteira `src/utils/shadow-gate.d.ts` declara somente `isShadowUnlocked`, `openShadowGate`, `lockShadow` e `initShadowGate`. O gateway e sua autenticação continuam em JavaScript legado isolado; nenhum segredo foi movido para TypeScript, exposto no frontend ou adicionado ao repositório.

Validação final local: `npm run tipos:ts` verde; `npm test` **884/884**; `npm run build` verde com o aviso histórico de chunks grandes; `npm run smoke` **98/98**; `npm run v2:integracao` **14/14**; `npm run caminho-critico` **15/15**. O inventário determinístico caiu de **53 para 52 páginas JavaScript canônicas restantes**.

## 4.22 Triangulação por rumos

`src/pages/triangulacao.ts` substituiu a página interativa de triangulação. A implementação tipa os presets de 3, 4 e 5 estações, pontos 2D, medições com bearing, estatísticas, controles de ruído e o ciclo de renderização em Canvas 2D. O cálculo continua delegado ao motor TypeScript existente em `src/utils/triangulation.ts`, sem duplicar mínimos quadrados, ruído gaussiano ou distância euclidiana.

A página preserva arraste do alvo, escolha do número de estações, slider de ruído, estimativa, erro, resíduo, linhas de rumo e a limpeza do `requestAnimationFrame` por `aoSair`. A declaração de ciclo de vida foi apenas estreitada para expor o callback real, mantendo `ciclo-vida.js` como fronteira legada.

Validação final local: `npm run tipos:ts` verde; `npm test` **884/884**; `npm run build` verde com o aviso histórico de chunks grandes; `npm run smoke` **98/98**; `npm run v2:integracao` **14/14**; `npm run caminho-critico` **15/15**. O inventário determinístico caiu de **52 para 51 páginas JavaScript canônicas restantes**.

## 4.23 GeoPulse e trilha de localização

`src/pages/geopulse.ts` substituiu a página canônica do GeoPulse. A implementação tipa estatísticas, referências de DOM, Canvas 2D, pontos geográficos e o `GeoTracker`, preservando o início/parada do rastreamento, limpeza, demo de Brasília, lista dos pontos mais recentes, projeção da trilha, distância, duração e velocidades.

A página continua usando a implementação TypeScript existente em `src/utils/geo-tracker.ts`; a migração não cria outra camada de geolocalização nem altera persistência. O callback de erro permanece visível via Toast, e `aoSair(page, () => tracker.stop())` garante que a permissão ativa não sobreviva à troca de rota.

Durante o typecheck foi corrigida uma referência de tipo local: a projeção do trajeto precisava importar explicitamente `Point2D` do motor de triangulação. Depois dessa correção, todos os gates passaram.

Validação final local: `npm run tipos:ts` verde; `npm test` **884/884**; `npm run build` verde com o aviso histórico de chunks grandes; `npm run smoke` **98/98**; `npm run v2:integracao` **14/14**; `npm run caminho-critico` **15/15**. O inventário determinístico caiu de **51 para 50 páginas JavaScript canônicas restantes**.

## 4.24 JSON Studio

`src/pages/json-studio.ts` substituiu o editor JSON canônico. A implementação define a união recursiva `JsonValue`, estreita o resultado de `JSON.parse`, tipa estatísticas de chaves/valores/profundidade, árvore navegável, status de validação, cálculo de linha/coluna e as transformações de formatação e minificação.

A página preserva o exemplo Baluarte, persistência em `storage`, cópia para clipboard, limpeza, árvore expandida, relatório de erro e publicação read-only de caracteres para o status global. Os erros externos e os valores desconhecidos são tratados defensivamente; não foram usados `any`, supressões ou alteração do contrato V1.

Validação final local: `npm run tipos:ts` verde; `npm test` **884/884**; `npm run build` verde com o aviso histórico de chunks grandes; `npm run smoke` **98/98**; `npm run v2:integracao` **14/14**; `npm run caminho-critico` **15/15**. O inventário determinístico caiu de **50 para 49 páginas JavaScript canônicas restantes**.

## 4.25 Batalha Naval

`src/pages/batalha-naval.ts` substituiu a página canônica de Batalha Naval. A implementação fecha os contratos de frota, navio, célula, coordenada, tabuleiro, fase da partida e estado da IA, preservando posicionamento aleatório, tabuleiros 10×10, acessibilidade por `aria-label`, modo caça com vizinhança, turnos, afundamento, vitória, derrota, reposicionamento e nova partida.

A conversão mantém o comportamento visual e os callbacks de jogo sem introduzir armazenamento, rede ou novos efeitos externos. O erro de definite assignment encontrado no primeiro typecheck foi corrigido inicializando as coordenadas potenciais da IA como opcionais e estreitando-as antes do acesso ao tabuleiro; nenhum diagnóstico foi silenciado.

Validação final local: `npm run tipos:ts` verde; `npm test` **884/884**; `npm run build` verde com o aviso histórico de chunks grandes; `npm run smoke` **98/98**; `npm run v2:integracao` **14/14**; `npm run caminho-critico` **15/15**. O inventário determinístico caiu de **49 para 48 páginas JavaScript canônicas restantes**.

## 4.26 IA Proprietária Mark 11

`src/pages/ia-proprietaria.ts` substituiu a página canônica da IA Proprietária Mark 11. A implementação tipa `Skill`, categorias, estado selecionado/filtro, catálogo built-in e skills customizadas persistidas, além dos controles de criação, remoção, seleção, cópia de `SKILL.md` e renderização do detalhe.

A nova fronteira `src/data/skills.d.ts` declara somente o catálogo real consumido pela página. O carregamento de storage passa por guards de `unknown`, a categoria do formulário é estreitada para a união válida e o renderizador Markdown mantém escaping antes de inserir a visualização controlada. Não foram adicionados serviços externos, execução de código ou permissões novas.

Validação final local: `npm run tipos:ts` verde; `npm test` **884/884**; `npm run build` verde com o aviso histórico de chunks grandes; `npm run smoke` **98/98**; `npm run v2:integracao` **14/14**; `npm run caminho-critico` **15/15**. O inventário determinístico caiu de **48 para 47 páginas JavaScript canônicas restantes**.

## 4.27 Visualizador FFT

`src/pages/fft.ts` substituiu a página canônica do Visualizador FFT. A nova fronteira `src/utils/fft-engine.d.ts` declara os 16 modos de renderização, fontes de microfone/áudio do sistema/elemento de mídia/tom de teste, controles de FFT, smoothing, ganho, Canvas, desconexão e eventos de encerramento do stream.

A página preserva a solicitação explícita de captura, as instruções de compartilhamento de aba, carregamento de arquivo, oscilador de teste, seletor de FFT, sliders, seleção de modo, reativação visual, status e encerramento ao sair da rota. Erros desconhecidos são convertidos em mensagens seguras; nenhum segredo, permissão adicional ou envio externo foi criado.

Validação final local: `npm run tipos:ts` verde; `npm test` **884/884**; `npm run build` verde com o aviso histórico de chunks grandes; `npm run smoke` **98/98**; `npm run v2:integracao` **14/14**; `npm run caminho-critico` **15/15**. O inventário determinístico caiu de **47 para 46 páginas JavaScript canônicas restantes**.

## 4.28 Color Studio

`src/pages/color-studio.ts` substituiu a página canônica do Color Studio. A implementação tipa o estado RGB, canais, entradas HEX/RGB/HSL, paletas de tons e harmonias, gradientes e verificação WCAG, reutilizando as conversões puras já publicadas em `src/utils/cor.ts`.

A página preserva persistência da cor atual, sincronização entre controles, cópia de valores, preview, gerador de gradiente, saída CSS, razão de contraste e badges AA/AAA. Valores externos são estreitados por `hexToRgb` antes de entrar no cálculo, sem duplicar matemática nem introduzir dependências ou permissões novas.

Validação final local: `npm run tipos:ts` verde; `npm test` **884/884**; `npm run build` verde com o aviso histórico de chunks grandes; `npm run smoke` **98/98**; `npm run v2:integracao` **14/14**; `npm run caminho-critico` **15/15**. O inventário determinístico caiu de **46 para 45 páginas JavaScript canônicas restantes**.

## 4.29 Morse standalone

`src/pages/morse.ts` substituiu a página canônica `/morse`, que é distinta de `src/pages/cripto/morse.ts`: a primeira é o gerador completo com transmissão de áudio e farol visual; a segunda é apenas o painel do laboratório cripto. A nova fronteira `src/data/morse-code.d.ts` declara a tabela internacional, codificação, decodificação e segmentos de timing PARIS.

A implementação preserva modo texto→Morse, Morse→texto, inversão, cópia, limpeza, sliders de WPM/frequência, oscilador Web Audio, flash sincronizado, parada manual, encerramento por `aoSair`, persistência local e tabela de referência. O estado da transmissão continua por instância da página, evitando que uma visita anterior deixe o Play bloqueado. O typecheck encontrou apenas uma comparação impossível de inicialização e ela foi corrigida sem supressão.

Validação final local: `npm run tipos:ts` verde; `npm test` **884/884**; `npm run build` verde com o aviso histórico de chunks grandes; `npm run smoke` **98/98**; `npm run v2:integracao` **14/14**; `npm run caminho-critico` **15/15**. O inventário determinístico caiu de **45 para 44 páginas JavaScript canônicas restantes**.

## 4.30 Central de APIs

`src/pages/apis.ts` substituiu a página canônica da Central de APIs. A implementação tipa o cofre local, os resultados de testes com latência/status, os cards de provedores, o diagnóstico do `/health`, as respostas desconhecidas do backend e a edição da configuração do JARVIS.

A fronteira de `jarvis-engine` foi ampliada somente com os exports reais utilizados: `saveConfig` e `resolveServerBase`, além dos campos mutáveis de configuração necessários para a ação explícita do usuário. A fronteira de `helpers` passou a declarar `uid`, usado para IDs aleatórios do cofre. As chaves continuam mascaradas por padrão e armazenadas apenas no navegador; nenhum segredo é enviado ao repositório ou introduzido em URL pública.

Os testes de provedor continuam explícitos e sob ação do usuário: Claude navegador, Claude servidor, Gemini, Hermes e Ollama não são chamados automaticamente na abertura da página. Os retornos externos são estreitados por guards de `unknown`, e falhas de rede/timeout são convertidas em status visíveis sem quebrar a UI.

Validação final local: `npm run tipos:ts` verde; `npm test` **884/884**; `npm run build` verde com o aviso histórico de chunks grandes; `npm run smoke` **98/98**; `npm run v2:integracao` **14/14**; `npm run caminho-critico` **15/15**. O inventário determinístico caiu de **44 para 43 páginas JavaScript canônicas restantes**.
