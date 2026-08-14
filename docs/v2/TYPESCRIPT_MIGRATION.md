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

As Waves 4–6 e os slices de Ciclo, Boot, Plataforma, Sobre, Arsenal, Home, Roadmap, Ferramentas, Elites, Universo e as duas ondas militares estão publicados no `main`. A Wave 6 foi publicada inicialmente em `92a5cc98` e recebeu a correção final do wrapper em `1d8e1f5e`, depois de o CI revelar um ciclo de resolução que impedia o boot V2 no navegador. A correção foi reproduzida localmente e remotamente: o Vigia voltou a passar e a integração V2 ficou verde em 13/13. O slice de Ciclo foi publicado em `cb4c0872`; no commit remoto, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia das rotas passaram. O slice de Boot foi publicado em `a23eaa5d`; também passou nesses quatro gates. A correção Health/Supervisor e a Plataforma foram publicadas em `df0dd975`; no commit remoto, `Core CI` voltou a passar, além de `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia das rotas. A página Sobre foi publicada em `d310a02e` e preservou `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia das rotas verdes. Arsenal foi publicado em `b35b6bd6`; também preservou `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia das rotas. Arsenal passou localmente em `npm test` 871/871, build, `tipos:ts`, integração V2 13/13 e smoke V1 98/98; o `tipos:v2` permaneceu em 61 erros históricos. A Home foi publicada em `a15523d5`; a validação local desse commit passou em `npm test` 871/871, `npm run build`, `npm run tipos:ts`, integração V2 13/13, smoke V1 98/98 e caminho crítico 15/15. O `tipos:v2` permaneceu em 61 diagnósticos históricos, sem crescimento atribuído à Home. Roadmap e Ferramentas foram publicados em `b3f681c6`; localmente passaram em `npm test` 871/871, build, `tipos:ts`, integração V2 13/13, smoke 98/98 e caminho crítico 15/15. A onda também corrigiu o contrato de query do hero sem alterar o comportamento V1. Elites e Universo foram publicados em `185cef09`; localmente passaram em `tipos:ts`, `npm test` 871/871, build e smoke 98/98 após repetição de um timeout externo isolado em `/musicas`. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia das rotas passaram; CI, V2 Core e V2 Validation permaneceram vermelhos pela dívida V2 conhecida de 61 diagnósticos. A onda militar estática foi publicada em `22cd5c9a`; `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 e caminho crítico 15/15 passaram localmente. No remoto, os mesmos cinco gates operacionais passaram, enquanto CI, V2 Core e V2 Validation permaneceram nos 61 erros conhecidos. A segunda onda militar foi publicada em `2b59380d`; também passou localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 e caminho crítico 15/15. Os cinco gates operacionais remotos passaram novamente; os três gates de typecheck V2 permaneceram na mesma dívida conhecida. A onda de catálogos militares foi publicada em `baaa0ddc`; Forças Armadas e Armas por País passaram localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 e caminho crítico 15/15. Os cinco gates operacionais remotos passaram; CI, V2 Core e V2 Validation permaneceram nos 61 diagnósticos conhecidos. A Enciclopédia Militar foi publicada em `87c8e16c`; também passou localmente nos mesmos gates e preservou a mesma matriz remota: `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia verdes; CI, V2 Core e V2 Validation nos 61 diagnósticos V2 preexistentes. PWA e Toast foram publicados em `50e6b2ef`; `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 e caminho crítico 15/15 passaram localmente. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram; CI, V2 Core e V2 Validation permaneceram nos 61 erros V2 conhecidos. Scroll Progress e Scroll Reveal foram publicados em `e09877f9`; passaram localmente nos mesmos gates e, no remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram. A dívida V2 permaneceu inalterada nos três gates de typecheck. Atmosphere foi publicado em `1a312e71`; passou localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 e caminho crítico 15/15. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram; CI, V2 Core e V2 Validation permaneceram nos 61 erros V2 conhecidos. Card Spotlight foi publicado em `2d20a99e`; passou localmente nos mesmos gates. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram, enquanto CI, V2 Core e V2 Validation permaneceram na dívida V2 conhecida. Baluarte Status foi publicado em `1e36051c`; passou localmente nos mesmos gates. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram, enquanto CI, V2 Core e V2 Validation permaneceram nos 61 diagnósticos V2 preexistentes. Theme foi publicado em `6ee11efb`; passou localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 e caminho crítico 15/15. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram; CI, V2 Core e V2 Validation permaneceram nos mesmos 61 diagnósticos V2 preexistentes. Mil Curation foi publicado em `55332a00`; passou localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 e caminho crítico 15/15. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram; CI, V2 Core e V2 Validation permaneceram nos mesmos 61 diagnósticos V2 preexistentes. MapLibre Loader foi publicado em `95a0ff02`; passou localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 após repetir um timeout externo isolado em `/musicas`, e caminho crítico 15/15. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram; CI, V2 Core e V2 Validation permaneceram nos mesmos 61 diagnósticos V2 preexistentes. O CodeQL também registrou apenas avisos de manutenção sobre Node 20 e CodeQL Action v3, sem falha de análise. Visit Counter foi publicado em `6a97a1f0`; passou localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 e caminho crítico 15/15. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram; CI, V2 Core e V2 Validation permaneceram nos mesmos 61 diagnósticos V2 preexistentes. Page Views foi publicado em `7b466285`; passou localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 após repetir um timeout externo isolado em `/musicas`, e caminho crítico 15/15. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram; CI, V2 Core e V2 Validation permaneceram nos mesmos 61 diagnósticos V2 preexistentes. Triangulation foi publicada em `22620963`; passou localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 e caminho crítico 15/15. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram; CI, V2 Core e V2 Validation permaneceram nos mesmos 61 diagnósticos V2 preexistentes. hx Beacon foi publicado em `b4a885c2`; passou localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 e caminho crítico 15/15. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram; CI, V2 Core e V2 Validation permaneceram nos mesmos 61 diagnósticos V2 preexistentes. Markdown foi publicado em `59bb1597`; passou localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 e caminho crítico 15/15. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram; CI, V2 Core e V2 Validation permaneceram nos mesmos 61 diagnósticos V2 preexistentes. Immersive Hero foi publicado em `78108a37`; passou localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 e caminho crítico 15/15. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram; CI, V2 Core e V2 Validation permaneceram nos mesmos 61 diagnósticos V2 preexistentes. WebGL Probe foi publicado em `6142d423`; passou localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 e caminho crítico 15/15. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram; CI, V2 Core e V2 Validation permaneceram nos mesmos 61 diagnósticos V2 preexistentes. Arma 3 Extraction foi publicado em `316ff718`; passou localmente em `tipos:ts`, `npm test` 871/871, build, integração V2 13/13, smoke 98/98 e caminho crítico 15/15. No remoto, `Core CI`, `V2 Runtime`, CodeQL, Arma 3 Data CI e Vigia passaram; CI, V2 Core e V2 Validation permaneceram nos mesmos 61 diagnósticos V2 preexistentes.
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
