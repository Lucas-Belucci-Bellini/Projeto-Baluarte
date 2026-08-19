# ⬡ Projeto Baluarte

<div align="center">

<a href="https://projeto-baluarte.vercel.app">
  <img src="./docs/assets/readme-hero.svg" alt="Projeto Baluarte — núcleo de comando J.A.R.V.I.S." width="100%">
</a>

**Plataforma narrativa, militar e técnica de Lucas Belucci Bellini**<br>
**V1 estável como base · V2 em reconstrução arquitetural · J.A.R.V.I.S. no centro da experiência**

[![CI](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/workflows/ci.yml/badge.svg)](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/workflows/ci.yml)
[![Core CI](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/workflows/core-ci.yml/badge.svg)](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/workflows/core-ci.yml)
[![V2 Validation](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/workflows/v2-validation.yml/badge.svg)](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/workflows/v2-validation.yml)
[![V2 Runtime](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/workflows/v2-runtime.yml/badge.svg)](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/workflows/v2-runtime.yml)

[**Abrir o Baluarte**](https://projeto-baluarte.vercel.app) · [**JARVIS Núcleo V7**](https://projeto-baluarte.vercel.app/project%20V2/Modelar%20objeto%203D/jarvis-nucleo-v7.html) · [**Issues**](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues) · [**Releases**](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/releases)

</div>

> [!WARNING]
> ## A V2 está em construção
>
> O Baluarte entrou na **reconstrução arquitetural da V2** pelas issues [#420](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/420), [#422](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/422) e [#423](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/423). Durante essa fase, partes do site e do app podem falhar, mudar ou ficar indisponíveis sem aviso.
>
> O dado do operador vive no `localStorage`. **Exporte ou guarde fora do navegador qualquer informação importante**, porque a superfície atual sabe apagar dados locais, mas ainda não oferece exportação completa.

## Acesso rápido

| Ação | Destino |
|---|---|
| **Usar a plataforma** | [projeto-baluarte.vercel.app](https://projeto-baluarte.vercel.app) |
| **Abrir o J.A.R.V.I.S. Núcleo V7** | [Modelagem 3D funcional](https://projeto-baluarte.vercel.app/project%20V2/Modelar%20objeto%203D/jarvis-nucleo-v7.html) |
| **Ler o roadmap completo** | [`docs/ROADMAP_COMPLETO.md`](docs/ROADMAP_COMPLETO.md) |
| **Entrar na V2** | [`ROADMAP_V2_ONBOARDING.md`](docs/v2/roadmap/ROADMAP_V2_ONBOARDING.md) |
| **Rodar localmente** | [`Como rodar`](#como-rodar) |
| **Propor uma mudança** | [Issues e discussões](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues) |

## Visão geral

O Projeto Baluarte é uma plataforma web narrativa, militar e de ferramentas técnicas. A experiência combina um catálogo de conhecimento, utilidades de programação, sistemas de lógica, Arsenal, mídia, universo narrativo, J.A.R.V.I.S. e uma infraestrutura V2 orientada a módulos isoláveis, contratos, evidências e recuperação segura.

A base V1 do navegador usa **JavaScript ES2022/ESM, HTML5, CSS3 e Vite**. A V2 adiciona **TypeScript** para novas superfícies e módulos migrados, **JavaScript/JSDoc** para contratos do Core durante a transição, **Rust** para o Runtime isolado, **Python** para parsers e pipelines, **SQL/PostgreSQL/Supabase** para persistência e RLS e **YAML/GitHub Actions** para os gates de CI.

> **Princípio central:** uma falha em um recurso não deve derrubar o site inteiro. Módulos podem entrar em `degraded`, `disabled`, `maintenance` ou `quarantined` sem levar a Home, o Router ou as demais ferramentas junto.

## Estado do projeto

| Superfície | Estado | Leitura rápida |
|---|---|---|
| **V1** | Estável | Linha de referência para uso normal e compatibilidade. |
| **V2** | Em reconstrução | Nova arquitetura com Runtime, contratos, módulos, dados e gates dedicados. |
| **Web/Desktop** | `1.1.5` em preparação | A release pública `1.1.0` permanece no histórico. |
| **Deploy** | Vercel | O deploy de produção é reconstruído a partir de `main`. |
| **Rotas** | 99 descobertas no smoke atual | O inventário completo está em [`MODULE_SYSTEM_AND_PAGE_INVENTORY.md`](docs/v2/MODULE_SYSTEM_AND_PAGE_INVENTORY.md). |
| **Contribuições** | Abertas | Toda mudança passa por revisão, testes, documentação e integração. |

## J.A.R.V.I.S. e o núcleo visual

O J.A.R.V.I.S. é a camada de assistente, memória, ferramentas e experiência inteligente do Baluarte. O núcleo visual V7 funciona como uma página HTML multipágina independente, com Three.js, Web Audio e artefato JavaScript compilado para produção.

| Entrada | Descrição |
|---|---|
| [Abrir o Núcleo V7](https://projeto-baluarte.vercel.app/project%20V2/Modelar%20objeto%203D/jarvis-nucleo-v7.html) | Experiência 3D executável no deploy público. |
| [`jarvis-nucleo-v7.html`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/blob/main/project%20V2/Modelar%20objeto%203D/jarvis-nucleo-v7.html) | Página visual e controles de interação. |
| [`jarvis-nucleo-v7.ts`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/blob/main/project%20V2/Modelar%20objeto%203D/jarvis-nucleo-v7.ts) | Fonte TypeScript canônica. |
| [`jarvis-nucleo-v7.js`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/blob/main/project%20V2/Modelar%20objeto%203D/jarvis-nucleo-v7.js) | Artefato compilado carregado em produção. |

## Roadmap e documentação V2

A reconstrução é conduzida por três planos complementares: [#420 — Fundação, Hardening e Transição V1 → V2](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/420), [#422 — Wiki Project Zomboid na V2](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/422) e [#423 — Plano Mestre V2](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/423).

| Área | Documento |
|---|---|
| Produto e arquitetura | [`docs/ROADMAP_COMPLETO.md`](docs/ROADMAP_COMPLETO.md) |
| Onboarding V2 | [`ROADMAP_V2_ONBOARDING.md`](docs/v2/roadmap/ROADMAP_V2_ONBOARDING.md) |
| Issues 420, 422 e 423 | [`ISSUES_420_422_423_COMPLETE.md`](docs/v2/roadmap/ISSUES_420_422_423_COMPLETE.md) |
| Plano mestre | [`V2_MASTER_PLAN.md`](docs/v2/V2_MASTER_PLAN.md) |
| Regras V2 | [`V2_RULES.md`](docs/v2/V2_RULES.md) |
| Migração para TypeScript | [`TYPESCRIPT_MIGRATION.md`](docs/v2/TYPESCRIPT_MIGRATION.md) |
| Projeto Nexus Baluarte | [`docs/PROJETO-NEXUS-BALUARTE.md`](docs/PROJETO-NEXUS-BALUARTE.md) |
| Histórico de merges | [`2026-08-13_V2_MERGE_HISTORY.md`](docs/v2/history/2026-08-13_V2_MERGE_HISTORY.md) |
| Plano de releases | [`RELEASE_PLAN.md`](docs/v2/RELEASE_PLAN.md) |

### Fases de evolução

| Fase | Objetivo | Entregáveis |
|---|---|---|
| **0 — Governança** | Separar V1, V2 Preview e V2 Development | Regras, decisões, branches e gates claros. |
| **1 — Core V2** | Fechar Runtime, Event Bus, Task Manager, Boot, Config e Context | Contratos, isolamento e testes de Core. |
| **2 — Dados** | Criar Data Layer, Evidence Layer e persistência | Schemas, proveniência, versionamento e RLS. |
| **3 — Especialistas** | Validar TypeScript, JavaScript/JSDoc, Rust, Python, SQL e CI | Gates por domínio e integrador de contratos. |
| **4 — Vertical slice** | Conectar Core, dados, módulo e superfície mínima | Integração, E2E e primeiro marco publicável. |
| **5 — Módulos** | Adicionar Wiki, Arsenal, JARVIS, IDE, Social e outros | Contratos e invariantes por módulo. |
| **6 — Evolução** | Observar uso real e receber contribuições | Incrementos testáveis e regressão controlada. |

<details>
<summary><strong>Contexto histórico da reconstrução</strong></summary>

A ideia de desmembrar o projeto em 20 repositórios dedicados para reescrever cada função e depois consolidar tudo em uma plataforma única é válida, mas somente quando tratada como migração arquitetural. O contexto completo está em [`2026-08-13_CHATGPT_SESSION_TRANSCRIPT.txt`](docs/v2/history/2026-08-13_CHATGPT_SESSION_TRANSCRIPT.txt) e [`2026-08-13_MERGE_AUDIT_SOURCE.md`](docs/v2/history/2026-08-13_MERGE_AUDIT_SOURCE.md).

A branch [`feature/login-cadastro`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/tree/feature/login-cadastro) é referência histórica. A implementação canônica está no `main` em `src/pages/login.ts`, com wrapper `login.js`; a branch histórica não deve ser mergeada diretamente. A reavaliação está em [`LOGIN_CADASTRO_MAIN_REEVALUATION.md`](docs/v2/LOGIN_CADASTRO_MAIN_REEVALUATION.md).

</details>

## Estabilidade dos módulos

A `1.0.0` é um ponto de congelamento: tudo marcado como estável precisa ser previsível, testado, recuperável e seguro. Ela não significa que todas as funcionalidades do catálogo estejam completas.

<!-- ESTABILIDADE:INICIO -->

| Módulo | Nível | Onde |
|---|---|---|
| `arsenal` — Arsenal e Centro Militar | 🟢 **Estável** | web e app |
| `biblioteca` — Biblioteca e Crônicas | 🟢 **Estável** | web e app |
| `calculadoras` — Calculadoras e conversores | 🟢 **Estável** | web e app |
| `core` — Router, estado, eventos, storage | 🟢 **Estável** | web e app |
| `cripto` — Criptografia e esteganografia | 🟢 **Estável** | web e app |
| `pwa` — PWA e Service Worker | 🟢 **Estável** | web e app |
| `editor` — Editor de código | 🟡 Beta | web e app |
| `gitNexus` — Git Nexus com o motor real (só no Launcher) | 🟡 Beta | só no app |
| `jarvis` — JARVIS (chat e provedores) | 🟡 Beta | web e app |
| `media` — Media, FFT e áudio | 🟡 Beta | web e app |
| `terminal` — Terminal web (filesystem virtual) | 🟡 Beta | web e app |
| `jarvisAgente` — JARVIS escolhendo ferramentas sozinho | 🔴 Experimental | web e app |
| `mcp` — Baluarte como servidor MCP (V2 — ver docs/architecture/v2-vision.md) | 🔴 Experimental | web e app |
| `nexusSync` — Sincronização distribuída do Nexus | 🔴 Experimental | web e app |

- 🟢 **Estável** — previsível, testado, recuperável e seguro — é o que a 1.0.0 promete
- 🟡 Beta — funciona e é usável, mas ainda não cumpre todos os critérios acima
- 🔴 Experimental — em construção; **não vem ligado** — precisa ser ativado à mão

> Gerado de [`src/core/politica.js`](src/core/politica.js) por `npm run gen-tabela-estabilidade`. O CI regera e falha se divergir — promessa que mora em dois lugares diverge.

<!-- ESTABILIDADE:FIM -->

A fase de hardening está em [`docs/HARDENING-1.0.0.md`](docs/HARDENING-1.0.0.md).

## Como rodar

### Desenvolvimento local

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`.

No Windows, também é possível executar:

```bat
start.bat
```

### Build e preview de produção

```bash
npm run build      # gera dist/
npm run preview    # serve dist/ para teste
```

**Requisitos:** Node.js 18 ou superior; o ambiente atual é testado com Node 22. O deploy de produção roda no Vercel a partir da branch `main`.

### Gates de qualidade

```bash
npm run tipos:ts
npm test
npm run build
npm run tipos:v2
npm run v2:integracao
npm run smoke
npm run caminho-critico
npm run v2:runtime
```

## Catálogo de superfícies

O Baluarte possui um catálogo extenso de páginas, submódulos e ferramentas. A organização abaixo prioriza descoberta rápida; o inventário completo está em [`MODULE_SYSTEM_AND_PAGE_INVENTORY.md`](docs/v2/MODULE_SYSTEM_AND_PAGE_INVENTORY.md).

### Contagens atuais

| Indicador | Quantidade |
|---|---:|
| Rotas descobertas no smoke | **99** |
| Itens do Arsenal | **251** |
| Equipes operacionais | **26** |
| Arcos narrativos | **24** |
| Capítulos | **33** |
| Universos | **21** |
| Módulos catalogados | **187** |

| Domínio | Principais superfícies |
|---|---|
| **Operações** | Ponte de Comando; Hub de Ferramentas. |
| **Ferramentas** | Editor de Código; Terminal Web; Calculadoras; Tabela Verdade; Lab de Cripto; Esteganografia; Lab de Regex; Gráficos; Símbolos; Logic Sim; Portas Lógicas; Código Morse. |
| **Conhecimento** | Biblioteca; Academia; Robótica; Universo; Tabela Periódica; Modpack Minecraft; Guia para Montar PC. |
| **Mídia** | Visualizador FFT; Media Hub; Central de Vídeos; Arquivo de Memes; Cinema. |
| **Tático** | Arsenal; Elites; CiberSeg; Economia. |
| **Sistema** | J.A.R.V.I.S.; IA Proprietária Mark 11; Perfil; Sobre o Projeto. |

### Destaques

- **Editor de Código:** 26 linguagens, multi-abas, runners JS/HTML/CSS/MD, auto-fechamento, auto-indentação e edição estilo VS Code.
- **Terminal Web:** mais de 60 comandos POSIX-like, filesystem virtual, pipes e histórico de comandos.
- **Lab de Cripto:** César, Base64/32, SHA, AES-GCM, Vigenère, Atbash e OTP.
- **Logic Sim:** 14 portas, fios, propagação em tempo real e realimentação.
- **Biblioteca:** Crônicas da Baluarte com 24 arcos e 1127 capítulos.
- **Arsenal:** 251 itens militares em 15 categorias, incluindo armas, aeronaves, frota naval, drones e veículos.
- **Elites:** 26 equipes operacionais de ALFA a ZULU.
- **J.A.R.V.I.S.:** modos local, Navegador/WebLLM, Claude API, Ollama, Servidor/Gemini e agente.

## Arquitetura

```text
Projeto-Baluarte/
├── index.html                SPA shell + <link> de todos os CSS
├── vite.config.js            Build Vite e entradas multipágina
├── public/
│   ├── manifest.json         PWA
│   └── sw.js                 Service Worker versionado
└── src/
    ├── main.js               Bootstrap e registro das rotas
    ├── core/                 Router, estado, eventos e storage
    ├── layout/               Header, sidebar e shell
    ├── pages/                Uma função por rota → HTMLElement
    ├── data/                 Datasets de Arsenal, Academia e narrativa
    ├── utils/                Engines e helpers
    └── styles/               Design system Material 3 Dark + Neon
```

Cada página é uma função que devolve um `HTMLElement`, montado pelo helper `h()` em `utils/helpers.js`. A V1 não depende de virtual DOM ou framework obrigatório.

### Stack e responsabilidades

| Camada | Tecnologia | Responsabilidade |
|---|---|---|
| **Frontend V1** | JavaScript ES2022/ESM, HTML5, CSS3 | Superfície compatível e estável. |
| **Core V2** | JavaScript ES2022 + JSDoc + TypeScript `checkJs` | Orquestração, contratos e módulos legados. |
| **Páginas V2** | TypeScript | Novas superfícies e migração progressiva. |
| **Runtime** | Rust | Processo, sandbox, política e isolamento. |
| **Dados** | Python 3.12 + SQL/PostgreSQL/Supabase | Parsers, geração, persistência, evidências e RLS. |
| **Build e CI** | Vite + GitHub Actions | Build, validação, segurança, smoke e deploy. |
| **APIs nativas** | Web Crypto, Web Audio, Canvas 2D | Criptografia, áudio e gráficos locais. |
| **Design** | Material 3 Dark + Neon | Cyan `#00f0ff`, magenta `#ff00aa` e dourado do Baluarte. |

## Sistema modular e recuperação de páginas

Cada página pode evoluir para um módulo operacional com manifesto, estado de saúde, permissões, fallback e telemetria controlada. Se uma Wiki ou ferramenta apresentar falhas repetidas, o `Module Health Monitor` registra o incidente e o `Module Registry` pode mudar o módulo para `disabled`, `maintenance` ou `quarantined`.

Usuários comuns recebem uma mensagem neutra. Desenvolvedores, administradores e o proprietário podem receber diagnóstico ou operar a recuperação somente após autenticação e autorização server-side. Nenhum papel pode depender de `localStorage`, query string ou metadata controlada pelo cliente.

| Papel | Acesso público | Acesso a módulos com problema |
|---|---|---|
| `user` | Conteúdo público e módulos `enabled` | Mensagem neutra; sem painel interno. |
| `developer` | Conteúdo público e experimentos autorizados | Diagnóstico técnico, retry e testes autorizados. |
| `admin` | Conteúdo público | Gestão operacional dentro do escopo concedido. |
| `owner` | Conteúdo permitido pela política | Papéis, quarentena e reativação. |

A especificação completa dos estados `enabled`, `degraded`, `disabled`, `maintenance`, `experimental` e `quarantined` está em [`MODULE_SYSTEM_AND_PAGE_INVENTORY.md`](docs/v2/MODULE_SYSTEM_AND_PAGE_INVENTORY.md).

<details>
<summary><strong>Proposta visual: Command Shell Modular</strong></summary>

A proposta preserva a identidade militar, técnica e narrativa, mas torna visíveis os conceitos de módulo, maturidade, saúde e acesso por função. O shell público deve orientar visitantes, usuários autenticados e colaboradores sem misturar diagnóstico interno com a navegação normal.

| Região | Conteúdo | Regra |
|---|---|---|
| **Barra superior** | Marca, busca, status público e ambiente V1/V2 | Nunca expõe stack trace, tokens ou diagnóstico interno. |
| **Sidebar** | Ferramentas, Conhecimento, Militar, Mídia, Jogos, Núcleo e Desenvolvimento | Derivada do estado público do Module Registry. |
| **Painel principal** | Breadcrumb, título, conteúdo e estado do módulo | Cada página possui fallback isolado. |
| **Barra de contexto** | Favoritos, voltar, compartilhar, ajuda e ações | Depende do módulo e da permissão. |
| **Área operacional** | Incidentes, health checks, retry e manutenção | Protegida por autenticação e autorização server-side. |

A Home deve funcionar como **Ponte de Comando**, não como painel administrativo. Ela pode mostrar módulos em destaque, favoritos, atalhos, atividades recentes, saúde pública e tutorial inicial; incidentes e reativação ficam na área operacional.

### Tutorial de entrada

1. Comece pela Home e escolha um domínio.
2. Abra um módulo e leia seu propósito, estado e limitações.
3. Use a busca global para encontrar rotas e conteúdos.
4. Consulte a ajuda contextual da página.
5. Faça login somente quando o recurso exigir conta ou permissão.

</details>

## O que a 1.0.0 promete

A `1.0.0` é o congelamento da arquitetura anterior, não a promessa de que todas as funcionalidades estão prontas. A definição é:

> **Tudo marcado como estável deve ser previsível, testado, recuperável e seguro.**

O hardening está documentado em [`docs/HARDENING-1.0.0.md`](docs/HARDENING-1.0.0.md), com a decisão arquitetural em [`ADR-001-1.0.0-como-ponto-de-congelamento.md`](docs/architecture/decisions/ADR-001-1.0.0-como-ponto-de-congelamento.md).

## Histórico de versões

O **Mark XIII** é a 13ª iteração do projeto. As 12 anteriores quebraram por TypeScript, stubs incompletos ou HTMLs gigantes inline. A versão atual foi construída incrementalmente em 21 fases, cada uma entregando algo funcional, até a `v1.0.0`.

A **v2.0.0** está em desenvolvimento e adiciona, entre outras evoluções, Logic Sim, Enciclopédia de Lógica Digital, Código Morse, Arquivo de Memes, Cinema, Robótica, Arsenal expandido, editor estilo VS Code e captura do áudio do PC no FFT.

## Regras de ouro

1. **V1 preservada, V2 evolutiva.** A V1 continua como referência estável.
2. **TypeScript é adotado progressivamente** nas páginas e componentes da V2.
3. **Sem framework por obrigação histórica.** React, Vue ou outras tecnologias só entram com decisão arquitetural documentada.
4. **Falhas devem ser isoláveis.** Recursos problemáticos podem entrar em manutenção, ser desabilitados ou colocados em quarentena.
5. **Só fecha quando funciona no navegador.** Compilar não é suficiente.
6. **Trabalho incremental e versionado** no GitHub.
7. **Novas ideias são bem-vindas** quando respeitam acessibilidade, usabilidade, desempenho e consistência do design system.

## Contribuir

Antes de alterar a V2, leia [`ROADMAP_V2_ONBOARDING.md`](docs/v2/roadmap/ROADMAP_V2_ONBOARDING.md), [`V2_MASTER_PLAN.md`](docs/v2/V2_MASTER_PLAN.md), [`V2_RULES.md`](docs/v2/V2_RULES.md), a documentação da área afetada e o [mapa atual de erros](docs/v2/MAIN_ERROR_AUDIT.md). Examine os consumidores do contrato, consulte as issues relacionadas, atualize testes e execute os gates antes de propor um marco.

Não use `@ts-ignore`, `any`, exclusões ou relaxamento de `strict`/`checkJs` para esconder falhas. Não crie um segundo Event Bus, Storage ou Permission Manager sem justificativa. Mudanças arquiteturais devem ser documentadas antes da implementação.

## Contato

**Repositório:** [github.com/Lucas-Belucci-Bellini/Projeto-Baluarte](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte)<br>
**Autor:** Lucas Belucci Bellini · Spartan Gamer BR<br>
**Deploy:** [projeto-baluarte.vercel.app](https://projeto-baluarte.vercel.app)
