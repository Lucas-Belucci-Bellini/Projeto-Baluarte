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

**Base V1 do navegador:** JavaScript ES2022/ESM + HTML5 + CSS3 + Vite 5, preservada como referência estável. A migração do frontend para TypeScript é incremental: módulos já migrados possuem implementação canônica `.ts` e wrapper `.js` de compatibilidade; páginas e utilitários ainda não migrados continuam no caminho V1 até serem convertidos com testes.

A V2 é multi-linguagem: **TypeScript** para novas superfícies e módulos migrados do frontend; JavaScript/JSDoc para contratos do Core ainda em transição; **Rust** para o Runtime isolado; **Python** para parsers e pipelines de dados; **SQL/PostgreSQL/Supabase** para persistência, evidências e RLS; e **YAML/GitHub Actions** para os gates de CI. O compilador TypeScript também verifica contratos JSDoc da V2. Nenhuma linguagem será trocada por moda: cada camada precisa de uma responsabilidade documentada.


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

A V2 é guiada por três planos complementares: [#420 — Fundação, Hardening e Transição V1 → V2](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/420), [#422 — Wiki Project Zomboid na V2](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/422) e [#423 — Plano Mestre V2](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/423). O **roadmap geral de produto, arquitetura, app, JARVIS, OpenClaw, PokeDesk, Wikis e testes mensais** está em [`docs/ROADMAP_COMPLETO.md`](docs/ROADMAP_COMPLETO.md). A documentação consolidada da V2, com a fonte completa das descrições e comentários coletados, está em [`docs/v2/roadmap/ROADMAP_V2_ONBOARDING.md`](docs/v2/roadmap/ROADMAP_V2_ONBOARDING.md) e [`docs/v2/roadmap/ISSUES_420_422_423_COMPLETE.md`](docs/v2/roadmap/ISSUES_420_422_423_COMPLETE.md).

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

As linguagens e responsabilidades da V2 são: **TypeScript** para páginas, componentes e superfícies do frontend, com migração progressiva da base existente; **JavaScript ES2022/ESM + JSDoc** para o Core de Orquestração e contratos legados durante a transição; **Rust** para o Runtime e a fronteira de processo; **Python 3.12** para parsers, geradores e workers de dados; **SQL/PostgreSQL/Supabase** para Data Layer, Evidence Layer e isolamento; **HTML5/CSS3** para as superfícies web; e **YAML/GitHub Actions** para CI/CD. JSON, Markdown e Shell apoiam contratos, documentação e automação reprodutível.

## Sistema modular e recuperação de páginas

## Disponibilidade de recursos e manutenção segura

Uma falha em uma funcionalidade não deve exigir a remoção ou indisponibilidade da página inteira quando o recurso puder ser isolado.

Cada página ou módulo pode controlar individualmente a disponibilidade de seus recursos. Por exemplo, se o visualizador 3D da Wiki Arma 3 apresentar problemas, a Wiki continuará disponível normalmente e somente o recurso 3D poderá ficar temporariamente bloqueado.

Durante a manutenção, o usuário comum recebe uma indicação neutra de que o recurso está temporariamente indisponível. O restante da página continua funcionando normalmente.

Recursos em manutenção podem permanecer acessíveis para `developer`, `admin` e `owner` quando isso for necessário para diagnóstico, desenvolvimento e validação. O acesso deve ser controlado no servidor e nunca depender apenas de código do cliente, `localStorage`, query string ou flags manipuláveis pelo usuário.

Quando o recurso estiver corrigido e validado, ele pode voltar ao estado `enabled` sem necessidade de remover ou reconstruir a página inteira.

### Papéis de acesso

| Papel | Acesso |
|---|---|
| `user` | Funcionalidades públicas e recursos `enabled` |
| `developer` | Funcionalidades públicas + recursos de desenvolvimento autorizados |
| `admin` | Operação e manutenção dentro das permissões concedidas |
| `owner` | Controle máximo do projeto, papéis, quarentena e reativação |

A autenticação dos colaboradores pode utilizar o GitHub como provedor de identidade através do sistema de autenticação do projeto. A autorização efetiva permanece sob controle do backend e das políticas do Supabase/RLS.

**Regra principal:** quebrar um recurso não deve significar quebrar o site inteiro.

## Novas ideias e contribuições de layout

O Baluarte está aberto a novas ideias para páginas, layouts, componentes, navegação e experiências de uso.

Colaboradores e membros da comunidade podem propor novas soluções visuais ou melhorias para páginas existentes. Uma proposta não precisa ser adotada automaticamente, mas será considerada de acordo com os objetivos do projeto, acessibilidade, usabilidade, desempenho, arquitetura e consistência do design system.

A intenção é que o Baluarte não fique limitado às ideias de uma única pessoa: **se você tem uma ideia melhor para uma página ou para a experiência do site, estamos de braços abertos para recebê-la.**

Toda contribuição deve passar pelo fluxo normal de revisão, testes e integração do projeto.

A escolha de TypeScript para o frontend da V2 é uma decisão de escalabilidade: o Baluarte possui centenas de páginas e continuará crescendo. A tipagem estática será usada para reduzir regressões, facilitar manutenção entre colaboradores e permitir que páginas e componentes evoluam sem quebrar contratos existentes. A migração será progressiva; a V1 permanece preservada como linha de referência. O plano e os marcos publicados estão documentados em [`docs/v2/TYPESCRIPT_MIGRATION.md`](docs/v2/TYPESCRIPT_MIGRATION.md) e no [`roadmap completo`](docs/ROADMAP_COMPLETO.md).
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

São **98 rotas registradas** no router atual, além de 114 arquivos JavaScript em `src/pages/` que incluem páginas, submódulos, gates e componentes de superfície. O menu lateral organiza as superfícies públicas por domínio. O inventário completo está em [`docs/v2/MODULE_SYSTEM_AND_PAGE_INVENTORY.md`](docs/v2/MODULE_SYSTEM_AND_PAGE_INVENTORY.md).

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
    ├── main.js               Bootstrap: registra as 98 rotas + monta o shell
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

## Sistema modular e recuperação de páginas

A próxima evolução transforma cada página em um módulo operacional com manifesto, estado de saúde, permissões, fallback e telemetria. A rota continua registrada, mas a disponibilidade pública passa a depender do estado do módulo. O objetivo é que um problema na Wiki Arma 3, por exemplo, não derrube a Home, o Router ou qualquer outra ferramenta.

Se `/wiki-arma3` apresentar falhas repetidas, o `Module Health Monitor` registra um incidente e o circuito muda o módulo para `disabled`, `maintenance` ou `quarantined`. O botão público é ocultado e o acesso direto recebe uma mensagem neutra. O código não é apagado: a área operacional permite diagnóstico e reativação controlada.

A área operacional usa a autenticação Supabase e papéis atribuídos no servidor, protegidos por RLS. **Usuários normais** não veem o painel, stack traces ou detalhes internos. **Desenvolvedores** podem consultar diagnósticos técnicos autorizados; **administradores** podem operar módulos dentro do escopo concedido; e o **proprietário** pode aprovar papéis, colocar módulos em quarentena e reativar componentes após validação. Nenhum papel pode ser confiado a `localStorage`, query string ou metadata controlada pelo cliente.

| Papel | Acesso ao site | Acesso a módulos com problema |
|---|---|---|
| `user` | Conteúdo público e módulos `enabled` | Mensagem neutra; sem painel interno |
| `developer` | Conteúdo público e experimentos autorizados | Diagnóstico técnico, retry e testes autorizados |
| `admin` | Conteúdo público | Gestão operacional de incidentes e módulos |
| `owner` | Conteúdo permitido pela política | Controle de papéis, quarentena e reativação |

A especificação completa, o inventário de todas as rotas, os estados `enabled/degraded/disabled/maintenance/experimental/quarantined` e o primeiro slice recomendado estão em [`docs/v2/MODULE_SYSTEM_AND_PAGE_INVENTORY.md`](docs/v2/MODULE_SYSTEM_AND_PAGE_INVENTORY.md).

## Proposta de layout: Command Shell Modular

> **Autoria da proposta:** Manus AI.
> **Status:** recomendação de produto e arquitetura visual; ainda não implementada como substituição do shell atual.

Com base nas issues #420, #422 e #423 e no inventário atual do site, a proposta é evoluir o shell para um **Command Shell Modular**. A ideia preserva a identidade militar, técnica e narrativa do Baluarte, mas torna visíveis os conceitos de módulos, maturidade, saúde e acesso por função. O layout deve orientar três públicos diferentes sem misturar a superfície pública com a área operacional protegida.

### Estrutura visual proposta

| Região | Conteúdo | Regra de comportamento |
|---|---|---|
| **Barra superior** | Marca Baluarte, busca global, status público do sistema, ambiente V1/V2 e login/perfil | Mostra somente informações públicas; nunca expõe stack trace, tokens ou diagnóstico interno. |
| **Sidebar por domínio** | Ferramentas, Conhecimento, Militar, Mídia, Jogos, Núcleo e Desenvolvimento | Os itens são derivados do estado público do Module Registry; módulos desligados não aparecem para usuários comuns. |
| **Painel principal** | Breadcrumb, título, conteúdo da página, estado do módulo e ações contextuais | Cada página fica isolada; uma falha deve renderizar seu fallback sem derrubar o shell. |
| **Barra de contexto** | Favoritos, voltar, compartilhar, ajuda/tutorial e ações da página | Ações dependem do módulo e das permissões, não de botões globais indiscriminados. |
| **Área operacional** | Incidentes, health checks, retry, manutenção e reativação | Separada da navegação pública e disponível somente após autenticação e autorização server-side. |

A Home deve funcionar como uma **Ponte de Comando**, não como um painel administrativo. Ela pode apresentar módulos em destaque, favoritos, atalhos, atividades recentes, saúde pública dos domínios e o tutorial inicial. Informações de incidente e controles de reativação permanecem exclusivamente na área operacional.

### Públicos e caminhos de entrada

| Público | Primeiro caminho recomendado | O que pode ver |
|---|---|---|
| **Visitante** | Home → domínio → página pública → tutorial | Conteúdo público, módulos ligados e mensagens neutras de manutenção. |
| **Usuário autenticado** | Login → perfil → favoritos → módulos disponíveis | Conteúdo público e recursos vinculados à própria conta, conforme RLS. |
| **Developer** | Login → diagnóstico técnico → módulo → testes/retry autorizados | Diagnóstico técnico redigido e ações explicitamente concedidas. |
| **Admin** | Login → área operacional → módulos/incidentes | Operações de manutenção e disponibilidade dentro do escopo administrativo. |
| **Owner** | Login → governança → papéis → módulos → auditoria | Controle máximo previsto pela política, incluindo aprovação de papéis e quarentena. |

O papel nunca deve ser obtido de `localStorage`, query string ou `user_metadata` controlada pelo navegador. A identidade vem do Supabase Auth; a autorização vem de uma fonte server-side, como perfis e papéis protegidos por RLS.

### Maturidade dos módulos

O README e a interface devem diferenciar claramente o que está pronto, o que está em teste e o que ainda é experimental. Um módulo não deve parecer estável somente porque possui uma rota.

| Estado | Significado para o produto | Visibilidade pública |
|---|---|---|
| **Stable** | Contrato, testes, fallback e operação previsíveis | Botão normal e conteúdo disponível. |
| **Beta** | Funciona, mas ainda possui critérios pendentes | Disponível com sinalização discreta. |
| **Experimental** | Pesquisa ou integração em desenvolvimento | Oculto por padrão ou visível apenas para perfis autorizados. |
| **Degraded** | Parte do módulo funciona, mas há risco ou dependência instável | Pode permanecer visível com aviso controlado. |
| **Maintenance** | Intervenção planejada | Botão pode permanecer visível com mensagem de manutenção. |
| **Disabled/Quarantined** | Falha persistente, risco ou desligamento administrativo | Botão oculto; usuário recebe mensagem neutra. |

### Exemplo de falha isolada na Wiki Arma 3

Se a Wiki Arma 3 apresentar uma falha repetida, o fluxo visual esperado é:

```text
Wiki Arma 3 falha
      ↓
Health Monitor registra o incidente
      ↓
Module Registry muda o estado para disabled ou quarantined
      ↓
Usuário normal: botão oculto + mensagem neutra
Developer/Admin/Owner: área operacional + diagnóstico autorizado
      ↓
Retry controlado → health check → reativação auditada, se estiver saudável
```

O sistema não apaga a página e não desliga o site inteiro. Ele remove a superfície pública defeituosa, conserva o incidente para investigação e exige autorização para tentar a recuperação. Usuários normais não devem receber stack trace, caminho de arquivo, tokens ou dados internos.

### Tutorial de entrada para visitantes

O layout proposto deve incluir uma ajuda simples e persistente para quem chega pela primeira vez:

1. **Comece pela Home.** A Ponte de Comando explica os domínios e oferece atalhos.
2. **Escolha um domínio.** Ferramentas, Conhecimento, Militar, Mídia, Jogos e Núcleo agrupam as páginas por finalidade.
3. **Abra um módulo.** A página informa seu propósito, estado de maturidade e como usar seus recursos.
4. **Use a busca global.** A busca deve localizar rotas, módulos e conteúdos sem exigir que a pessoa conheça o nome técnico do arquivo.
5. **Consulte a ajuda da página.** Cada módulo deve explicar entradas, resultados, limitações e como reportar um problema.
6. **Faça login somente quando necessário.** Conteúdo público deve continuar acessível sem conta; recursos pessoais ou operacionais usam Supabase Auth.

### Glossário rápido

| Termo | Definição |
|---|---|
| **Module Registry** | Catálogo central de módulos, rotas, loaders, dependências, permissões e estado operacional. |
| **Health Monitor** | Componente que observa carregamento, inicialização e falhas repetidas de um módulo. |
| **Circuit breaker** | Mecanismo que interrompe novas tentativas após falhas repetidas e abre espaço para recuperação controlada. |
| **Fallback** | Tela ou comportamento seguro apresentado quando a página não pode ser carregada. |
| **Evidence Layer** | Camada de fontes, evidências, versões, datas e validação para conteúdo de conhecimento. |
| **RLS** | Row Level Security do PostgreSQL/Supabase, usada para limitar dados por usuário e função no servidor. |
| **Runtime** | Processo isolado responsável por capacidades que não devem ficar diretamente no navegador. |
| **Core** | Camada de orquestração, eventos, estado, roteamento e contratos compartilhados. |

A especificação técnica do Module Registry, o inventário de rotas e a matriz detalhada de acesso estão em [`docs/v2/MODULE_SYSTEM_AND_PAGE_INVENTORY.md`](docs/v2/MODULE_SYSTEM_AND_PAGE_INVENTORY.md). O roadmap de fases está em [`docs/v2/roadmap/ROADMAP_V2_ONBOARDING.md`](docs/v2/roadmap/ROADMAP_V2_ONBOARDING.md).

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

1. **V1 preservada, V2 evolutiva.** A V1 permanece como referência estável; a V2 pode adotar novas tecnologias quando houver justificativa arquitetural.
2. **TypeScript é a linguagem das páginas e componentes da V2.** A adoção é progressiva e deve priorizar segurança de tipos, manutenção e escalabilidade.
3. **Sem JSX/React/Vue por obrigação histórica.** Frameworks ou tecnologias adicionais só devem entrar mediante decisão arquitetural documentada.
4. **Uma falha isolada não deve derrubar o site inteiro.** Recursos problemáticos devem poder ser colocados em manutenção, desabilitados ou isolados individualmente.
5. **Só fecha quando funciona no navegador** — não basta compilar.
6. **Trabalho incremental e versionado** no GitHub.
7. **Novas ideias são bem-vindas.** Layouts, componentes e melhorias de experiência podem ser propostos por colaboradores e comunidade e serão avaliados pelo projeto.
---



## Contato

Repositório: <https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte>
