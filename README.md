# ⬡ Projeto Baluarte — Mark XIII

> ## 🚧 A V2 está em construção — o site e o app podem não funcionar direito
>
> A partir de agora o Baluarte entrou na **reconstrução arquitetural da V2**
> (issues [#420](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/420)
> e [#422](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/422)).
> Enquanto ela durar, **partes do site e do app podem falhar, sumir ou mudar sem
> aviso**.
>
> Não dá para blindar isso, então fica dito: quem usa o Baluarte no dia a dia
> deve esperar instabilidade. A mesma faixa aparece no topo do site.
>
> ⚠️ **Guarde o que for importante fora do navegador.** O dado do operador mora
> no `localStorage`, e hoje o Baluarte sabe apagá-lo mas **não sabe exportá-lo**.

Plataforma web narrativa, militar e de ferramentas técnicas de **Lucas Belucci
Bellini**.

**Stack V1 do navegador:** JavaScript puro (ES2022/ESM) + HTML5 + CSS3 + Vite 5.
Sem React, Vue, JSX ou TypeScript como linguagem de execução do frontend.

A V2 é multi-linguagem: JavaScript/JSDoc para o Core de Orquestração, Rust para o Runtime isolado, Python para pipelines de dados, SQL/PostgreSQL/Supabase para persistência e RLS, e YAML/GitHub Actions para os gates de CI. O compilador TypeScript é usado apenas para verificar contratos JSDoc da V2; não transforma o produto em TypeScript.


> Esta é a 13ª iteração do projeto. As 12 anteriores quebraram por TypeScript,
> stubs incompletos ou HTMLs gigantes inline. O Mark XIII foi construído
> incrementalmente em **21 fases** — cada uma entregando algo funcional — até a
> **v1.0.0**. A partir dela, a **v2.0.0** expande a plataforma com novas
> ferramentas, mais conteúdo e um catálogo militar completo.

## Nota de rumo: Projeto Nexus Baluarte

A ideia de desmembrar o projeto em 20 repositórios dedicados para reescrever
cada função com mais calma e depois consolidar tudo em uma plataforma única é
válida, mas só faz sentido se for tratada como uma migração arquitetural, e não
como uma fragmentação sem controle. O plano completo de transição, domínios,
contratos de integração e fases de execução está em [docs/PROJETO-NEXUS-BALUARTE.md](docs/PROJETO-NEXUS-BALUARTE.md).

---

## Roadmap V2 e guia para novos colaboradores

A V2 é guiada por três planos complementares: [#420 — Fundação, Hardening e Transição V1 → V2](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/420), [#422 — Wiki Project Zomboid na V2](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/422) e [#423 — Plano Mestre V2](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/423). A documentação consolidada, com a fonte completa das descrições e comentários coletados, está em [`docs/v2/roadmap/ROADMAP_V2_ONBOARDING.md`](docs/v2/roadmap/ROADMAP_V2_ONBOARDING.md) e [`docs/v2/roadmap/ISSUES_420_422_423_COMPLETE.md`](docs/v2/roadmap/ISSUES_420_422_423_COMPLETE.md).

O contexto das sessões de reconstrução e dos merges também está preservado em [`docs/v2/history/2026-08-13_V2_MERGE_HISTORY.md`](docs/v2/history/2026-08-13_V2_MERGE_HISTORY.md). Esse índice reconcilia o relatório histórico com o estado atual da `main` e aponta para a [transcrição completa da sessão](docs/v2/history/2026-08-13_CHATGPT_SESSION_TRANSCRIPT.txt) e o [relatório original dos merges](docs/v2/history/2026-08-13_MERGE_AUDIT_SOURCE.md).

> **A V2 é uma reconstrução arquitetural, não uma V1.5.** A V1 continua sendo a superfície estável para uso normal; a V2 pode permanecer instável, incompleta ou indisponível durante a reconstrução.

| Fase | Objetivo | Entregáveis principais |
|---|---|---|
| **0 — Governança** | Separar V1, V2 Preview e V2 Development | Regras, decisões, branches e gates claros |
| **1 — Core V2** | Fechar Runtime, Event Bus, Task Manager, Boot, Config e Context | Contratos, isolamento de falhas e testes de Core |
| **2 — Dados** | Criar Data Layer, Evidence Layer e persistência | Schemas, proveniência, versionamento e RLS |
| **3 — Especialistas** | Validar JS/JSDoc, Rust, Python/Data, SQL/Supabase e YAML/CI | Gates por domínio e integrador de contratos |
| **4 — Vertical slice** | Conectar Core + dados + módulo + superfície mínima | Integração, E2E e primeiro marco publicável |
| **5 — Módulos** | Adicionar Wiki, Arsenal, JARVIS, IDE, Social e outros sem acoplamento indevido | Contratos e invariantes por módulo |
| **6 — Evolução** | Observar uso real e receber contribuições com segurança | Incrementos testáveis, documentação e regressão controlada |

As linguagens e responsabilidades da V2 são: **JavaScript ES2022/ESM** para o frontend e Core de Orquestração; **JSDoc + `checkJs`** para verificar contratos JavaScript; **Rust** para o Runtime e a fronteira de processo; **Python 3.12** para parsers, geradores e workers de dados; **SQL/PostgreSQL/Supabase** para Data Layer, Evidence Layer e isolamento; **HTML5/CSS3** para as superfícies web; e **YAML/GitHub Actions** para CI/CD. JSON, Markdown e Shell apoiam contratos, documentação e automação reprodutível.

Antes de alterar a V2, leia [`docs/v2/roadmap/ROADMAP_V2_ONBOARDING.md`](docs/v2/roadmap/ROADMAP_V2_ONBOARDING.md), [`docs/v2/V2_MASTER_PLAN.md`](docs/v2/V2_MASTER_PLAN.md), [`docs/v2/V2_RULES.md`](docs/v2/V2_RULES.md), a documentação da área afetada e o [mapa atual de erros](docs/v2/MAIN_ERROR_AUDIT.md). Examine os consumidores do contrato, consulte as issues relacionadas, escreva ou atualize testes e execute os gates antes de propor um marco.

Não use `@ts-ignore`, `any`, exclusões ou relaxamento de `strict`/`checkJs` para esconder falhas. Não crie um segundo Event Bus, Storage ou Permission Manager sem justificativa. Mudanças arquiteturais devem ser documentadas antes da implementação.

---

## O que a 1.0.0 promete

A 1.0.0 **não** é "todas as funcionalidades prontas" — é um **ponto de
congelamento**: a última versão da arquitetura atual considerada estável, a
linha-base para onde voltar enquanto a V2 é construída
([ADR-001](docs/architecture/decisions/ADR-001-1.0.0-como-ponto-de-congelamento.md)).

A definição em vigor é:

> **1.0.0 = tudo que está marcado como estável é previsível, testado,
> recuperável e seguro.**

Por isso esta tabela existe, e por isso ela é honesta sobre o que ainda não é
estável. O nível não é adjetivo: `src/core/flags.js` **recusa** uma flag
experimental que tente nascer ligada.

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

A fase de hardening que leva até lá está em
[`docs/HARDENING-1.0.0.md`](docs/HARDENING-1.0.0.md) (issue #420).

---

## Como rodar

### Windows (duplo-clique)

```
start.bat
```

### Qualquer plataforma (terminal)

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

### Build de produção

```bash
npm run build      # gera dist/
npm run preview    # serve dist/ para teste
```

**Requisitos:** Node.js 18+ (testado com 22). O deploy de produção roda no
Vercel, reconstruído a partir da branch `main`.

---

## O que tem no Baluarte

São **36 rotas**, todas implementadas. O menu lateral organiza tudo em 6 grupos.

### Operações
- **Ponte de Comando** — painel inicial com status do sistema.
- **Hub de Ferramentas** — catálogo navegável de todas as ferramentas.

### Ferramentas
- **Editor de Código** — 26 linguagens, multi-abas, runners JS/HTML/CSS/MD e
  edição estilo VS Code (auto-fechamento de pares, auto-indentação, `Ctrl+/`,
  mover/duplicar linha).
- **Terminal Web** — 60+ comandos POSIX-like, filesystem virtual, pipes.
- **Calculadoras** — científica, numérica (IEEE 754) e o hub com financeira,
  conversores, estatística, engenharia e saúde.
- **Tabela Verdade** — parser lógico, Mapa de Karnaugh e Quine-McCluskey.
- **Lab de Cripto** — César, Base64/32, SHA, AES-GCM, Vigenère, Atbash, OTP.
- **Esteganografia** — esconde/revela texto em imagens via LSB (Canvas), com
  opção de cifrar com AES-256 antes de esconder. Exporta PNG sem perda.
- **Lab de Regex** — tester com destaque de matches e cheatsheet.
- **Gerador de Gráficos** — 12 tipos em Canvas 2D puro.
- **Símbolos** — 1200+ caracteres Unicode pesquisáveis.
- **Logic Sim** — simulador de lógica digital interativo (14 portas, fios,
  propagação em tempo real, realimentação).
- **Portas Lógicas** — enciclopédia de lógica digital: símbolos, tabelas verdade,
  blocos construtivos e catálogo de CIs 7400/4000.
- **Código Morse** — texto ↔ Morse, áudio por oscilador e flash visual.

### Conhecimento
- **Biblioteca** — as Crônicas da Baluarte (24 arcos, 1127 capítulos).
- **Academia** — 16 linguagens de programação + recursos externos de estudo.
- **Robótica** — currículo de 12 módulos, do básico ao avançado.
- **Universo** — 10 universos narrativos cruzados.
- **Tabela Periódica** — 118 elementos.
- **Modpack Minecraft** e **Guia para Montar PC**.

### Mídia
- **Visualizador FFT** — 6 modos via Web Audio; capta microfone, arquivo,
  oscilador e o áudio do próprio PC.
- **Media Hub** — player local de áudio/vídeo/imagem.
- **Central de Vídeos** — playlists temáticas.
- **Arquivo de Memes** — catálogo curado dos memes de 2016.
- **Cinema** — acervo de filmes com player embutido.

### Tático
- **Arsenal** — catálogo militar completo: armas leves, artilharia, defesa
  aérea, aeronaves, frota naval, drones e veículos (251 itens, 15 categorias).
- **Elites** — 26 equipes operacionais ALFA→ZULU.
- **CiberSeg** — enciclopédia de cibersegurança.
- **Economia** — cotações de câmbio e cripto ao vivo.

### Sistema
- **J.A.R.V.I.S.** — assistente em 6 modos (local, Navegador/WebLLM, Claude API,
  Ollama, Servidor/Gemini, agente). O modo Navegador roda um LLM real 100% no
  cliente via WebGPU; o modo Servidor usa o backend Python opcional com busca web.
- **IA Proprietária Mark 11** — sistema de Skills modular.
- **Perfil** — identidade do operador, estatísticas e configurações.
- **Sobre o Projeto** — a história das 13 iterações.

---

## Arquitetura

```
Projeto-Baluarte/
├── index.html                SPA shell + <link> de todos os CSS
├── vite.config.js            Build Vite 5
├── public/
│   ├── manifest.json         PWA
│   └── sw.js                 Service Worker (stale-while-revalidate, versionado)
└── src/
    ├── main.js               Bootstrap: registra as 36 rotas + monta o shell
    ├── core/                 Engine
    │   ├── router.js         Router SPA por hash (#/home, #/arsenal…)
    │   ├── state.js          Store reativo
    │   ├── events.js         Event bus pub/sub
    │   └── storage.js        localStorage com fallback em memória
    ├── layout/               header, sidebar, shell
    ├── pages/                Uma função por rota → retorna HTMLElement
    ├── data/                 Datasets (arsenal, academia, fanfic.json…)
    ├── utils/                Engines e helpers (h(), fft-engine, logic-sim…)
    └── styles/               Design system — Material 3 Dark + Neon
```

Cada página é uma função pura que devolve um `HTMLElement`, montado pelo `h()`
— um helper de ~30 linhas em `utils/helpers.js`. Não há virtual DOM nem
framework.

---

## Stack e responsabilidades

- **Frontend V1:** JavaScript ES2022 em módulos ESM nativos, HTML5 e CSS3.
- **Core V2:** JavaScript ES2022 com contratos JSDoc verificados por TypeScript `checkJs`.
- **Runtime V2:** Rust estável para processo, sandbox, política e isolamento do Runtime.
- **Dados:** Python 3.12 para parsers e geração; SQL/PostgreSQL/Supabase para persistência, evidências e RLS.
- **Build:** Vite 5.
- **Persistência local:** localStorage + IndexedDB, sempre atrás dos contratos de Storage.
- **Cripto:** Web Crypto API nativa.
- **Áudio:** Web Audio API nativa.
- **Gráficos:** Canvas 2D puro.
- **CI/CD:** YAML/GitHub Actions, com gates de Core, Runtime, especialistas, segurança, dados, smoke e deploy.
- **Fontes:** Inter + JetBrains Mono.
- **Design:** Material 3 Dark + Neon (cyan `#00f0ff` / magenta `#ff00aa`).

---

## Histórico de versões

O **v1.0.0** consolidou 21 fases incrementais (Foundation, Editor, Terminal,
Calculadoras, Cripto, Arsenal, Biblioteca, Elites, FFT, Universo, PWA, JARVIS,
IDE + IA Proprietária). Cada fase fechou com tag e Release no GitHub.

A **v2.0.0** está em desenvolvimento na branch `v2.0.0` e adiciona, entre
outras coisas: o Logic Sim interativo, a Enciclopédia de Lógica Digital, o
gerador de Código Morse, o Arquivo de Memes, o Cinema, o currículo de Robótica,
o Arsenal como catálogo militar completo, a edição estilo VS Code no editor e a
captura do áudio do PC no FFT.

---

## Regras de ouro

1. **Nada de TypeScript.** Nunca — 12 versões anteriores quebraram por isso.
2. **Nada de JSX/React/Vue.** JavaScript puro + funções que retornam `HTMLElement`.
3. **Só fecha quando funciona no navegador** — não basta compilar.
4. **Trabalho incremental e versionado** no GitHub.

---

## Contato

Repositório: <https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte>
