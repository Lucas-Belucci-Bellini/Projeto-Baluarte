# Baluarte V2 — Roadmap e guia de entrada

> **Documento de orientação para pessoas novas no projeto.** Este roadmap consolida as issues [#420][1], [#422][2] e [#423][3], que são a fonte de planejamento da reconstrução arquitetural do Baluarte.

**Estado do documento:** planejamento consolidado  
**Última coleta das issues:** 14 de agosto de 2026  
**Implementação:** parcial e incremental  
**Fonte completa das issues:** [`ISSUES_420_422_423_COMPLETE.md`](ISSUES_420_422_423_COMPLETE.md)  
**Histórico de reconstrução e merges:** [`../history/2026-08-13_V2_MERGE_HISTORY.md`](../history/2026-08-13_V2_MERGE_HISTORY.md)
**Inventário de páginas e módulos:** [`../MODULE_SYSTEM_AND_PAGE_INVENTORY.md`](../MODULE_SYSTEM_AND_PAGE_INVENTORY.md)

## 1. Como ler este roadmap

As três issues não têm a mesma função. A **#420 define a forma**: hardening, limites de segurança, separação V1/V2 e princípios arquiteturais. A **#422 define exemplos de produtos e conhecimento**: Wiki Project Zomboid, dados rastreáveis e módulos de conhecimento que podem entrar na V2. A **#423 define a ordem de execução**: governança, Core, Data Layer, especialistas, vertical slice, módulos e evolução colaborativa.

Uma ideia registrada nos comentários não significa que já tenha sido aprovada como requisito de implementação. O projeto deve diferenciar entre **decisão**, **contrato**, **plano**, **experimento** e **backlog**. A decisão só entra no código depois de ser documentada, testada e integrada ao marco correspondente.

> **Regra central:** a V2 é uma reconstrução arquitetural; não é uma V1.5. A V1 permanece como referência estável/compatível quando necessário, mas não deve ditar os contratos internos da V2.

## 2. As três issues em uma visão

| Issue | Papel no roadmap | Escopo principal | Estado coletado |
| --- | --- | --- | --- |
| [#420][1] | Plano 01 — forma e proteção | Hardening 1.0.0, segurança, permissões, storage, JARVIS, MCP, separação V1/V2 e arquitetura modular | Aberta; em execução |
| [#422][2] | Plano 02 — produtos e conhecimento | Wiki Project Zomboid, fontes, evidências, entidades, conteúdo versionado e módulos de conhecimento | Aberta; planejada |
| [#423][3] | Plano mestre — ordem e governança | Core, Data Layer, especialistas, CI, vertical slice, módulos e evolução colaborativa | Aberta; em construção |

## 3. Visão de produto

O Baluarte está evoluindo de uma aplicação web grande para uma **plataforma de ferramentas, conhecimento e projetos**. O frontend é uma interface; o núcleo deve concentrar contratos, estado, permissões, diagnósticos, registro de módulos e acesso controlado a dados.

A visão de longo prazo contempla uma base comum que pode atender diferentes superfícies:

```text
                         BALUARTE CORE
                              │
              ┌───────────────┼───────────────┐
              │               │               │
             Web           Mobile            MCP
              │               │               │
              └───────────────┼───────────────┘
                              │
                  ┌───────────┼───────────┐
                  │           │           │
                JARVIS      Nexus       Wiki/Data
```

Os produtos e módulos mencionados nas issues incluem o site atual, Arsenal, Arma 3, Biblioteca, JARVIS, Knowledge Engine, Wiki Project Zomboid, IDE web, Terminal, projetos conectados, Baluarte Social, 3D Engine, MCP e Nexus. Eles não devem ser implementados todos ao mesmo tempo. Cada módulo precisa entrar por contrato, teste e integração incremental.

## 4. Linguagens, ferramentas e responsabilidades

A V1 do navegador continua deliberadamente simples: JavaScript puro, HTML5, CSS3 e Vite, sem React, Vue, JSX ou TypeScript como linguagem de execução do frontend. A V2, porém, possui uma arquitetura multi-linguagem; negar essa realidade no README desorienta quem chega ao projeto.

| Linguagem/tecnologia | Uso planejado ou existente | Limite de responsabilidade | Gate principal |
| --- | --- | --- | --- |
| **JavaScript ES2022 + ESM** | Frontend V1, Core de Orquestração V2, Boot, Event Bus, módulos e fachadas | APIs e contratos do Core; não acessar internals de outros módulos sem contrato | `npm test`, `npm run build` |
| **JSDoc + TypeScript compiler (`checkJs`)** | Verificação estática dos arquivos JS da V2 | Typecheck sem transformar o produto em TypeScript; não usar `@ts-ignore`, `any` ou relaxamento de `strict` para esconder falhas | `npm run tipos:v2` |
| **Rust 2021/estável** | Core de Runtime, processo stdio, sandbox, política de filesystem e isolamento | Runtime executável separado do Core de Orquestração; falhar fechado e validar envelopes | `cargo fmt`, `cargo test --all-targets`, `cargo clippy` |
| **Python 3.12** | Parsers, geradores, pipeline e workers de dados, especialmente Arma 3 | Processamento e validação de dados; artefatos gerados precisam ser reproduzíveis | `compileall` e testes `scripts/arma3` |
| **SQL / PostgreSQL / Supabase** | Data Layer, Evidence Layer, persistência, migrations e RLS | Isolamento por tenant, proveniência e rastreabilidade; nenhuma regra de segurança somente no frontend | Contratos SQL/Supabase e testes de isolamento |
| **HTML5** | Shell da aplicação, páginas, superfícies de módulos e documentação de UI | Sem HTML gigante inline; renderização deve continuar modular | Build e smoke browser |
| **CSS3** | Design system Material 3 Dark + Neon, layout responsivo e superfícies dos módulos | Estilos devem permanecer separados por domínio quando a migração modular avançar | Build e verificação visual |
| **YAML / GitHub Actions** | CI por domínio: Core, Runtime, especialistas, segurança, dados, smoke e deploy | Workflows devem detectar falhas, nunca mascará-las; mudanças de CI precisam de revisão | Workflows do GitHub |
| **JSON / Markdown** | Contratos de dados, fontes, manifests, decisões, roadmap e documentação | Dados precisam de schema, fonte, versão, data e evidência quando aplicável | Verificadores de catálogo e documentação |
| **Shell** | Automação local e comandos de validação | Apenas orquestrar ferramentas; não substituir testes de contrato | Scripts reprodutíveis |

### O que significa “sem TypeScript”

A regra histórica da V1 significa que o navegador não deve ser reescrito em TypeScript nem receber um framework por conveniência. A V2 usa JSDoc e o compilador TypeScript como **verificador de contratos JavaScript**. Isso é diferente de tornar TypeScript a linguagem de produção. O Runtime, por sua vez, é Rust porque precisa de uma fronteira de processo e isolamento que não deve ser simulada no frontend.

## 5. Estado de estabilidade

A V1 é a superfície recomendada para uso normal enquanto a V2 estiver em reconstrução. A V2 pode ficar instável, incompleta ou indisponível durante longos períodos.

| Superfície | Estado esperado | Público-alvo |
| --- | --- | --- |
| **V1 Stable** | Versão preservada, testável e publicável | Pessoas que querem usar o Baluarte normalmente |
| **V2 Preview** | Marco publicado quando os gates mínimos estiverem verdes | Pessoas que querem acompanhar a evolução |
| **V2 Development** | Branches experimentais e integração em andamento | Colaboradores e agentes que estão construindo |
| **MCP/Nexus/Agent** | Experimental até contratos, permissões e observabilidade estarem fechados | Pesquisa e evolução posterior |

O roadmap não promete que todos os módulos estejam igualmente prontos. A estabilidade deve ser declarada por módulo: estável, beta ou experimental.

## 6. Inventário atual e sistema modular

O site atual possui 98 rotas registradas e 114 arquivos JavaScript em `src/pages/`. Esse inventário inclui Home, ferramentas, conhecimento, mídia, Arsenal, Wiki Arma 3, Project Zomboid, JARVIS, Núcleo, áreas militares e superfícies de desenvolvimento. A lista completa, com rota, módulo e estratégia de carregamento, está em [`../MODULE_SYSTEM_AND_PAGE_INVENTORY.md`](../MODULE_SYSTEM_AND_PAGE_INVENTORY.md).

A evolução da V2 transforma cada rota em uma unidade operacional: **Module Registry → loader → health monitor → estado público → permissões → fallback**. Uma página com defeito não deve derrubar o Core ou o restante do site. No caso da Wiki Arma 3, o sistema poderá marcar o módulo como `disabled`, ocultar o botão público e mostrar uma mensagem neutra para usuários normais, enquanto uma área protegida oferece diagnóstico e recuperação a desenvolvedores, administradores e proprietário autenticados.

O papel de uma pessoa não será aceito a partir de `localStorage`, query string ou `user_metadata` editável pelo cliente. A identidade vem do Supabase Auth; o papel e as permissões operacionais vêm de uma fonte server-side protegida por RLS. A especificação inclui estados `enabled`, `degraded`, `disabled`, `maintenance`, `experimental` e `quarantined`, além de retry limitado, auditoria e reativação controlada.

## 7. Roadmap por fases

### Fase 0 — Governança e separação V1/V2

O objetivo é proteger a linha estável, separar os gates da V1 dos gates da V2, definir estratégia de branches e documentar o que autoriza um marco no `main`.

As regras de entrada são: ler o contexto antes de alterar código, investigar consumidores e issues relacionadas, não assumir que o código existente está certo ou errado, e registrar decisões arquiteturais antes de implementá-las.

### Fase 1 — Core V2

O Core reúne Runtime, Event Bus, Task Manager, Boot, Config, Context e contratos compartilhados. Nesta fase, a prioridade é fechar os contratos e corrigir falhas de `checkJs` pela causa. Nenhum módulo pode derrubar o Core; falhas devem ser isoladas sempre que tecnicamente possível.

A fronteira Runtime deve permanecer lógica antes de escolher o transporte físico. O envelope de autorização, a política, a sessão, o isolamento e as respostas de erro precisam ser testados antes da expansão de produto.

### Fase 2 — Data Layer e Evidence Layer

A Data Layer deve definir persistência e entidades. A Evidence Layer deve registrar fonte, versão, data, revisão e confiança das informações. Dados não devem ficar espalhados como arquivos sem contrato, e conteúdo não verificado não pode ser promovido a fato.

A Wiki Project Zomboid entra aqui como um módulo de conhecimento: primeiro estrutura e fontes, depois automações e recursos de consulta. A interface não deve ser construída antes de o contrato de dados estar claro.

### Fase 3 — Especialistas e CI

A V2 possui especialistas por domínio: JavaScript/JSDoc, Rust, Python/Data, SQL/Supabase e YAML/GitHub Actions. O integrador de contratos verifica se as partes continuam compatíveis. Nenhum especialista pode esconder erro para produzir CI verde.

### Fase 4 — Primeiro vertical slice

O primeiro slice deve ser pequeno, completo e demonstrável: Core + Data Layer + um módulo + superfície mínima + testes de integração. O deploy aplicável deve ser validado. O marco só chega à `main` quando os gates relevantes estiverem verdes e a documentação estiver atualizada.

A meta de 30–50 commits é apenas uma referência de planejamento; qualidade e evidência prevalecem sobre contagem de commits.

### Fase 5 — Módulos independentes

Depois do Core e do slice, módulos entram sem acoplamento indevido. Cada módulo deve possuir contrato, lifecycle, permissões quando necessário, testes e invariantes próprias. A Wiki Project Zomboid e futuros projetos conectados entram nesta fase conforme o contrato de dados e a capacidade de integração.

### Fase 6 — Uso real e evolução colaborativa

A V2 deve receber incrementos publicáveis, observar o comportamento real e corrigir regressões rapidamente. O objetivo é permitir contribuições de outras pessoas sem quebrar os contratos do Core. Decisões importantes permanecem documentadas durante a evolução.

## 8. Hardening antes da 1.0.0

A #420 define que `1.0.0` não significa “todas as funcionalidades prontas”. Significa que tudo marcado como estável é **previsível, testado, recuperável e seguro**.

A fila de hardening inclui auditoria de XSS, HTML injection, `eval`/`Function`, DOM, URLs externas, uploads, armazenamento, tokens, CORS, Service Worker, iframe, Worker e futuras integrações MCP. O Terminal Web precisa permanecer em filesystem virtual; terminal real é responsabilidade de uma camada sandboxed da V2.

JARVIS deve usar permission boundaries e um Tool Registry. A camada de permissão deve existir antes de MCP. Armazenamento deve evoluir para uma camada trocável, com classificação `PUBLIC`, `LOCAL`, `SENSITIVE` e `SECRET`, além de versionamento/migração de dados.

Testes prioritários são jornadas de integração, Critical Path, memória, offline, Service Worker, tratamento de erro, validação de schemas e consistência entre fonte e dados gerados. A recomendação é refatoração cirúrgica, não um rewrite total.

## 9. Wiki Project Zomboid e Evidence Layer

A Wiki não deve ser somente uma coleção de textos. Ela deve organizar entidades, relações, fontes, evidências, versões, compatibilidade e atualização incremental.

O conteúdo levantado na #422 inclui mods, mapas, construções, profissões, veículos, armazenamento, automação, mídia, bases militares, interiores e recursos do Build 42.20. Esses itens devem ser tratados como **candidatos de conteúdo** até que tenham fonte identificável, versão, data e revisão.

Um modelo inicial recomendado é:

```text
WikiEntity
├── id
├── type
├── title
├── summary
├── version
├── status
├── updatedAt
└── relations[]

Evidence
├── sourceUrl
├── sourceType
├── capturedAt
├── version
├── confidence
├── reviewer
└── notes
```

O pipeline esperado é:

```text
fonte → ingestão → normalização → evidência → validação → conteúdo consultável
```

A Wiki deve integrar o Module System da V2, a Data Layer e a Evidence Layer sem depender da infraestrutura legada da V1.

## 10. JARVIS, Knowledge Engine, MCP e Nexus

A visão registrada na #420 recomenda começar com um JARVIS Core pequeno: entender uma pergunta, descobrir o contexto, consultar uma fonte/ferramenta e responder. A inteligência não deve depender apenas de um modelo maior. O sistema deve melhorar por meio de conhecimento, ferramentas, contexto e ranking de resultados.

A arquitetura proposta separa:

```text
JARVIS
├── Orchestrator
├── Context
├── Intent
├── Memory
├── Knowledge
├── Tools
└── Permission Manager
```

A base de conhecimento pode usar indexação e RAG controlado, mas ingestão automática precisa de verificação e proveniência. O futuro Baluarte MCP deve expor tools e resources por uma camada independente da interface web. O MCP não deve receber acesso irrestrito ao sistema; cada ferramenta precisa declarar capacidades e permissões.

Nexus é a evolução de integração entre projetos, conhecimento e serviços. Deve ser construído depois de o Core, as permissões, a proveniência e os contratos estarem estáveis.

## 11. Organização recomendada do repositório

A organização atual deve evoluir de modo cirúrgico:

```text
src/
├── core/
│   ├── router/
│   ├── state/
│   ├── events/
│   ├── storage/
│   ├── permissions/
│   ├── diagnostics/
│   └── registry/
├── modules/
│   ├── arsenal/
│   ├── arma3/
│   ├── academia/
│   ├── biblioteca/
│   ├── terminal/
│   ├── ide/
│   ├── jarvis/
│   └── ...
├── ui/
├── data/
│   ├── source/
│   ├── generated/
│   └── schemas/
└── main.js

services/
├── mcp/
├── nexus/
└── jarvis/

tests/
├── unit/
├── integration/
└── e2e/
```

A migração não deve mover tudo de uma vez. A ordem sugerida é Core/permissions/diagnostics/registry, depois `pages` para `modules`, depois redução de `utils`, depois `services`, depois organização de testes e somente então MCP.

## 12. Guia para novos colaboradores

Antes de alterar qualquer código da V2, leia o [Plano Mestre V2](../V2_MASTER_PLAN.md), as [Regras V2](../V2_RULES.md), a [Arquitetura](../V2_ARCHITECTURE.md), os padrões de código e os documentos específicos da área. Consulte também [`docs/v2/MAIN_ERROR_AUDIT.md`](../MAIN_ERROR_AUDIT.md) para conhecer o estado de erros que já foi observado.

Depois, siga este fluxo:

| Passo | Pergunta que precisa ser respondida |
| --- | --- |
| 1. Escolher uma área | Este trabalho pertence a Core, Runtime, Data, Module, Specialist ou V1? |
| 2. Ler consumidores | Quem chama o contrato que será alterado? |
| 3. Consultar issues | A mudança é parte de #420, #422 ou #423? Há uma decisão relacionada? |
| 4. Definir contrato | Entradas, saídas, erros, lifecycle, permissões e versionamento estão claros? |
| 5. Criar testes | Existe teste unitário, de contrato, integração ou E2E adequado? |
| 6. Implementar incrementalmente | O módulo está isolado e não derruba o Core? |
| 7. Executar gates | Testes, tipos, build, integração e gate do domínio passaram? |
| 8. Documentar | A decisão, o risco e o próximo passo foram registrados? |

Não use `@ts-ignore`, relaxe `checkJs`, introduza `any` para silenciar o compilador, crie um segundo Event Bus/Storage/Permission Manager sem justificativa ou acople uma interface diretamente a uma implementação interna. Se a mudança for arquitetural, documente a decisão antes da implementação.

## 13. Critérios para marcar um marco como pronto

Um marco pode ser publicado quando os contratos do escopo estiverem definidos, os testes relevantes passarem, os especialistas do domínio estiverem verdes, as invariantes críticas passarem, o deploy aplicável tiver sido validado e a documentação estiver atualizada.

A V2 só pode ser considerada concluída quando o Core, Data Layer/Evidence Layer, especialistas, integrador, módulos independentes e CI estiverem estáveis, com processo de contribuição documentado e V1 preservada como referência compatível quando necessário.

## 14. Histórico e referências

Para entender o estado atual sem confundir snapshots antigos com a `main` atual, leia [`../history/2026-08-13_V2_MERGE_HISTORY.md`](../history/2026-08-13_V2_MERGE_HISTORY.md). Ele preserva a transcrição completa da sessão e o relatório original dos merges, reconcilia os hashes históricos com o merge `1fe33468` publicado depois e aponta para a auditoria atual da `main`.

## 15. Referências

[1]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/420 "Issue #420 — Plano 01"
[2]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/422 "Issue #422 — Wiki Project Zomboid"
[3]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/423 "Issue #423 — Plano Mestre V2"
