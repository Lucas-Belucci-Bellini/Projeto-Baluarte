# ROADMAP COMPLETO — PROJETO BALUARTE

> **Documento mestre de produto, arquitetura e execução.** Este roadmap transforma em uma única sequência executável os objetivos do Projeto-Baluarte: preservar a V1, concluir a migração progressiva para TypeScript, construir a V2, criar o novo layout, lançar um protótipo de app quando houver estabilidade mínima, evoluir o JARVIS, integrar o OpenClaw, estruturar Wikis e PokeDesk, habilitar automações responsáveis e instituir testes mensais de todos os módulos.

**Estado:** planejamento consolidado e incremental
**Autor da proposta de layout:** Manus AI
**Repositório:** [Lucas-Belucci-Bellini/Projeto-Baluarte](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte)
**Issues-base:** [#420][1], [#422][2] e [#423][3]
**Atualizado:** 14 de agosto de 2026
**Estado publicado no momento da atualização:** a migração `jarvis-permissoes` está em `1f950d1e` e o roadmap, README e onboarding estão publicados no `main` em `6349b7bb`.

## 1. Visão executiva

O Baluarte será tratado como uma **plataforma modular de ferramentas, conhecimento, projetos e agentes**, e não apenas como uma coleção de páginas. A V1 continuará disponível como superfície estável de referência. A V2 será construída como uma reconstrução arquitetural independente, com contratos próprios, módulos isoláveis, dados rastreáveis e interfaces múltiplas: web, app, API, MCP e integrações com agentes.

A sequência correta não é tentar construir tudo simultaneamente. Primeiro é necessário manter uma linha estável, terminar a migração incremental dos contratos do frontend, fechar os fundamentos da V2 e comprovar um vertical slice completo. Depois entram o novo layout, o protótipo de app, os módulos de conhecimento, a evolução do JARVIS, o OpenClaw e as automações externas.

> **Princípio central:** crescer a capacidade do Baluarte sem transformar uma falha local em uma falha sistêmica.

| Horizonte | Resultado esperado | Condição de entrada |
|---|---|---|
| **Base estável** | V1 preservada, frontend progressivamente tipado e gates locais previsíveis | Nenhuma mudança estrutural sem baseline e testes |
| **V2 fundacional** | Core, Runtime, Module System, Data Layer, Evidence Layer e permissões com contratos claros | Dívida conhecida separada de regressões novas |
| **V2 preview** | Primeiro vertical slice completo e publicável para quem deseja acompanhar a reconstrução | Gates do marco verdes e documentação atualizada |
| **Nova experiência** | Command Shell Modular, tutorial, status de módulos e protótipo de app | Estabilidade mínima da base e fallback por módulo |
| **Ecossistema de agentes** | JARVIS mais leve, OpenClaw, MCP, Knowledge Mesh e automações autorizadas | Identidade, permissões, auditoria e proveniência fechadas |
| **V2 concluída** | Todos os módulos críticos testados, observados e documentados | Critérios de conclusão da seção 14 atendidos |

## 2. Regras que não mudam

A V1 será mantida como uma versão estável, reproduzível e recuperável. Durante a reconstrução existirão três superfícies distintas: **V1 Stable**, recomendada para uso normal; **V2 Preview**, para quem aceita acompanhar marcos publicados; e **V2 Development**, destinada a desenvolvimento e testes. Uma versão instável não deve substituir silenciosamente a versão recomendada.

A migração JavaScript → TypeScript permanece incremental. Cada módulo recebe uma implementação canônica TypeScript, um wrapper JavaScript de compatibilidade quando necessário, declarações de fronteira e validação comportamental. Não serão usados `any`, `@ts-ignore`, `@ts-nocheck`, exclusões artificiais ou relaxamento de `strict` para esconder falhas.

A V2 não poderá depender de permissões decididas no navegador. Papéis, acesso operacional, quarentena e publicação devem ser verificados no backend e no Supabase/RLS. A autorização de `user`, `developer`, `admin` e `owner` deve ser server-side e auditável.

> **Regra de segurança:** memória, conhecimento e Skills não podem virar conhecimento global apenas porque foram produzidos por uma IA. O fluxo deve ser `descoberta → evidências → confiança → revisão → publicação`, com histórico e possibilidade de auditoria.

## 3. Arquitetura-alvo

```text
                         PROJETO BALUARTE
                                │
        ┌───────────────────────┼────────────────────────┐
        │                       │                        │
     V1 Stable             V2 Platform              External World
        │                       │                        │
   Web + PWA              Core + Modules          OpenClaw / MCP / APIs
                                │
      ┌───────────────┬────────┼─────────┬─────────────────┐
      │               │        │         │                 │
   Runtime        Module    Data      Evidence          Agents
   (Rust)         System    Layer     Layer             / JARVIS
      │               │        │         │                 │
      └───────────────┴────────┴─────────┴─────────────────┘
                                │
                Web / Mobile App / Launcher / MCP
```

O **Core V2** concentra Runtime, Event Bus, Task Manager, Boot, Config, Context, lifecycle, observabilidade, permissões e contratos compartilhados. O **Module System** registra módulos, rotas, loaders, dependências, maturidade, health, fallback e permissões. A **Data Layer** define entidades e persistência. A **Evidence Layer** registra fonte, data, versão, confiança, relações, agente produtor e validação.

Nenhum módulo deve importar internals de outro módulo sem contrato. O JARVIS, o MCP e o OpenClaw devem consumir a mesma camada de capacidades que a interface web, não caminhos secretos dentro de páginas. A UI é uma superfície; o Core é a fonte das regras.

## 4. Stack e responsabilidades

| Tecnologia | Responsabilidade no roadmap | Limite |
|---|---|---|
| **TypeScript** | Páginas e utilitários migrados progressivamente; novos componentes e contratos de superfície | Não reescrever tudo de uma vez nem quebrar wrappers V1 |
| **JavaScript ES2022/ESM + JSDoc** | Compatibilidade V1 e contratos JS ainda não migrados, especialmente durante a transição do Core | Erros devem ser corrigidos pela causa; não mascarar `checkJs` |
| **Rust** | Runtime isolado, transporte, sandbox, política e fronteira de processo | Não duplicar regras do Core no frontend |
| **Python 3.12** | Parsers, ingestão, geração, workers e pipelines de dados | Artefatos devem ser reproduzíveis e validados |
| **SQL/PostgreSQL/Supabase** | Data Layer, Evidence Layer, Auth, RLS, auditoria e publicação controlada | Segurança nunca pode depender apenas do cliente |
| **HTML5/CSS3** | Shell, design system, layout responsivo e módulos visuais | Falha visual isolada não pode derrubar o shell |
| **YAML/GitHub Actions** | CI, smoke, releases, testes mensais e gates por domínio | Workflow deve detectar problemas, não escondê-los |
| **JSON/Markdown** | Manifests, schemas, fontes, decisões e documentação | Conteúdo precisa de contrato, versão e proveniência |

A integração OpenClaw seguirá a realidade documentada no projeto: o OpenClaw é self-hosted, opera como control plane e usa um gateway RPC; o conector atual do JARVIS fala formato compatível com OpenAI, portanto a próxima entrega técnica é um bridge RPC → `POST /v1/chat/completions`, com CORS e HTTPS adequados quando o gateway estiver fora da máquina local.[4]

## 5. Fases do roadmap

### Fase 0 — Governança, baseline e linha estável

**Objetivo:** congelar uma referência segura antes de ampliar a reconstrução.

| Entrega | Critério de saída |
|---|---|
| Registrar V1 Stable, V2 Preview e V2 Development | Branch/tag/link de cada superfície documentado |
| Separar gates V1, V2, segurança, dados, app e deploy | Cada workflow indica claramente seu escopo |
| Preservar a V1 em caso de falha da V2 | Rollback e caminho de acesso confirmados |
| Atualizar onboarding e mapa de erros | Colaborador novo consegue saber o que está estável e o que está quebrado |
| Desbloquear publicação GitHub | Token ou integração reautenticada; commits locais publicados |

A V1 recebe somente correções de segurança, estabilidade e problemas críticos enquanto a V2 estiver em reconstrução. O `main` só recebe um marco quando os gates correspondentes e a documentação estiverem verdes.

### Fase 1 — Migração incremental para TypeScript

**Objetivo:** reduzir a superfície JavaScript sem um rewrite destrutivo.

A migração segue por ondas: utilitários de baixo risco, adaptadores, páginas, contratos de dados e, por último, módulos de maior acoplamento. Cada onda deve manter um wrapper `.js`, adicionar `.d.ts` quando houver fronteira legada, crescer o `tsconfig.json` somente com arquivos realmente migrados e repetir a suíte completa.

| Gate por onda | Resultado mínimo |
|---|---:|
| `npm run tipos:ts` | 0 erros no escopo incremental |
| `npm test` | 871/871 ou novo baseline explicitamente documentado |
| `npm run build` | Build verde |
| Integração V2 | 13/13 |
| Smoke V1 | 98/98 rotas verdes |
| Caminho crítico | 15/15 |
| `npm run tipos:v2` | Sem crescimento da dívida conhecida até ela ser corrigida |

A dívida atual de `tipos:v2` deve continuar separada da migração de superfície. O próximo bloco de correção estrutural será `runtime-stdio.js`, `vertical-slice.js` e `runtime-transport.js`, com contratos reais de RuntimeManager, Group, Session e Transport.

### Fase 2 — Hardening do Core V2 e contratos arquiteturais

**Objetivo:** fechar os contratos que permitem que todos os módulos evoluam sem acoplamento destrutivo.

O trabalho inclui Runtime, Event Bus, Task Manager, Boot/Config/Context, Registry, lifecycle, Health/Supervisor/Restart, Session/Transport/Bridge, Data Layer, permissões, observabilidade e integrador de contratos. Os erros devem ser classificados em **causa raiz** e **efeito cascata** antes de cada correção.

A regra de módulos é: um módulo pode falhar, ser desligado ou entrar em quarentena sem derrubar o Core, o Router, a Home ou os demais módulos. O Registry deve controlar estados `enabled`, `degraded`, `disabled`, `maintenance`, `experimental` e `quarantined`, com fallback, limite de retry, auditoria e recuperação autorizada.

### Fase 3 — Data Layer, Evidence Layer e governança de conhecimento

**Objetivo:** garantir que o Baluarte consiga receber dados de várias fontes sem virar um conjunto de arquivos espalhados ou uma base de afirmações sem origem.

Cada entidade de conhecimento deve preservar identificação, tipo, conteúdo, versão, status, data de atualização, relações e evidências. A Evidence Layer deve registrar a fonte original, data de captura, versão da fonte, confiança, agente produtor, revisão e notas de conflito.

O fluxo de publicação será controlado por funções e gates, não por triggers ocultos:

```text
Memory / descoberta
        ↓
Knowledge ou Skill candidata
        ↓
fontes + evidências + confiança
        ↓
review
        ↓
quality gates
        ↓
publish_knowledge() / publish_skill()
        ↓
publicado e auditado
```

Knowledge e Skills privadas devem permanecer isoladas por RLS. Conteúdo publicado pode ser compartilhado conforme a política. Skills publicadas devem ser imutáveis; uma mudança deve criar uma nova versão, passar novamente por review e só então ser promovida. A decisão futura sobre a relação entre `ai_skills.version` e entidades de versão precisa ser registrada antes da implementação definitiva.

### Fase 4 — Primeiro vertical slice V2

**Objetivo:** provar a arquitetura em um fluxo pequeno, completo e real.

O slice deverá conectar **Core + Data Layer + Evidence Layer + um módulo + superfície mínima + testes de integração + observabilidade**. O número de commits é apenas uma referência; qualidade, evidência e gates são o critério real.

Uma fatia candidata é o módulo de Knowledge com consulta, fonte, evidência, permissão, health e interface mínima. Outra candidata é a Wiki Project Zomboid, desde que o contrato de dados seja fechado primeiro. A escolha final deve ser documentada como decisão arquitetural.

### Fase 5 — Novo layout: Command Shell Modular

**Objetivo:** construir uma nova experiência visual depois que a base estiver minimamente estável, sem trocar a estabilidade por estética.

A proposta de layout, creditada a **Manus AI**, é um **Command Shell Modular**: uma shell de comando com identidade militar/técnica/narrativa, mas organizada por domínios, maturidade, saúde e permissões.

| Região | Função |
|---|---|
| Barra superior | Marca, busca global, ambiente V1/V2, estado público e perfil |
| Sidebar por domínio | Ferramentas, Conhecimento, Militar, Mídia, Jogos, Núcleo e Desenvolvimento |
| Painel principal | Conteúdo isolado do módulo, breadcrumb, estado e ações contextuais |
| Barra de contexto | Favoritos, voltar, compartilhar, ajuda e tutorial |
| Área operacional | Incidentes, health checks, retry, manutenção e reativação protegidos |
| Home/Ponte de Comando | Atalhos, módulos destacados, favoritos, tutorial e saúde pública sem stack trace |

O layout deve funcionar para visitante, usuário autenticado, developer, admin e owner sem misturar diagnóstico interno com conteúdo público. Usuários comuns recebem uma mensagem neutra quando um módulo está indisponível. Desenvolvedores, administradores e proprietário podem acessar apenas o diagnóstico e as operações autorizadas no backend.

O tutorial de entrada será parte do produto: começar pela Home, escolher um domínio, abrir um módulo, consultar a busca global, usar a ajuda contextual e fazer login somente quando o recurso exigir identidade ou dados pessoais.

### Fase 6 — Protótipo de app após estabilidade mínima

**Objetivo:** disponibilizar uma primeira experiência de app sem transformar o app em um novo bloqueio para a V1.

O repositório já possui um caminho Capacitor/Android scaffoldado, scripts de sincronização, ícones/splash, permissão de câmera e workflow de Mobile Release; ainda faltam testes físicos, assinatura de produção, publicação interna Android e a trilha iOS/TestFlight.[5]

O protótipo será liberado somente depois que o marco mínimo da base atender: build web verde, navegação principal, offline básico, fallback quando `window.baluarte.native` não existir, câmera/OCR validado no Android e smoke das rotas. A distribuição inicial será de teste, não uma promessa de paridade total com a V1.

| Marco | Entrega |
|---|---|
| App Preview 0 | APK debug instalável, navegação, fallback web e offline básico |
| App Preview 1 | Câmera/OCR, permissões, ícones, splash e telemetria de erros |
| Android Internal | AAB assinado e faixa interna da Play Store |
| iOS Preview | Projeto iOS, permissões, arquivamento e TestFlight |
| App Stable | Critérios de estabilidade por módulo e processo de atualização |

### Fase 7 — JARVIS mais leve, rápido e modular

**Objetivo:** fazer o JARVIS trabalhar com menor consumo de memória e menor custo de contexto, sem perder ferramentas ou segurança.

A reengenharia priorizará um núcleo de orquestração pequeno, carregamento preguiçoso de ferramentas, cache de schemas, contexto resumido, memória local indexada, filas limitadas, cancelamento, timeouts, circuit breaker e seleção de modelos conforme a tarefa. O motor nativo Hermes e o WebLLM devem compartilhar um contrato de cérebro; se o nativo falhar, o fallback deve ser imediato e silencioso para o usuário.

A ordem técnica será: medir baseline de memória/latência; separar planner, executor, memory, knowledge, tools e permissions; reduzir prompts repetidos; carregar apenas ferramentas necessárias; limitar turns e tamanho de histórico; testar offline; e só depois adicionar subagentes, scheduler ou aprendizado mais autônomo.

O JARVIS não poderá executar vendas, publicar propaganda, enviar mensagens ou alterar dados externos sem a permissão adequada e, para ações de alto impacto, confirmação explícita do operador. O objetivo é aumentar capacidade, não remover controle humano.

### Fase 8 — OpenClaw, canais e MCP

**Objetivo:** usar o OpenClaw como camada de conexões externas e o Baluarte como núcleo de contexto, ferramentas e governança.

O OpenClaw deve permanecer self-hosted. O Baluarte não deve colocar credenciais de WhatsApp, Telegram ou outros canais no frontend, nem depender de uma API externa não documentada. A primeira integração é um bridge pequeno entre o endpoint compatível com OpenAI usado pelo JARVIS e o RPC real do OpenClaw. A implementação só começa depois de confirmar o método RPC oficial para enviar prompt e receber resposta.[4]

Depois do bridge, entram testes de canais, sessões, reconexão, idempotência, limites de mensagem, logs redigidos, CORS/HTTPS e permissões. O Baluarte MCP Server será independente da UI e poderá expor tools e resources como busca de conhecimento, projetos, Arsenal, documentos, diagnóstico e estado do sistema, sempre com contratos e permissões declarados.

```text
WhatsApp / Telegram / outros canais
                 ↓
            OpenClaw
                 ↓ RPC
              Bridge
                 ↓ contrato
        Baluarte Core / JARVIS / MCP
                 ↓
       Knowledge + Evidence + Modules
```

### Fase 9 — Notícias, briefings e inteligência contínua

**Objetivo:** manter o operador informado sem transformar o sistema em uma fonte não auditada de notícias.

O módulo de notícias deverá coletar fontes autorizadas, registrar URL, publicação, horário, idioma, tema, confiança e duplicatas, resumir com identificação de fonte e permitir correção. Um briefing periódico pode combinar regras determinísticas e uma etapa de análise de IA, mas a fonte original deve permanecer acessível.

Para verificações mensais ou diárias com lógica determinística, a preferência é um workflow automatizado do próprio projeto. Para resumos que exigem julgamento, poderá existir uma execução agendada de baixa frequência. Polling frequente ou recebimento contínuo de eventos deve usar um serviço persistente apropriado, e não uma tarefa que inicialize uma sessão completa a cada minuto.[6]

### Fase 10 — Automações comerciais e TikTok

**Objetivo:** transformar links e conteúdos autorizados em campanhas organizadas, sem spam, publicação indevida ou decisões comerciais sem aprovação.

O módulo comercial deverá receber links fornecidos pelo operador, extrair metadados permitidos, gerar variações de texto e roteiro, classificar público e registrar campanha, mas a publicação, o envio em massa, o pagamento e qualquer compromisso comercial devem exigir uma etapa de revisão e confirmação. Integrações com TikTok, links de afiliado, checkout, métricas e canais externos serão habilitadas somente com APIs oficiais, credenciais fornecidas pelo usuário e política de conformidade definida.

| Nível | Ação do Jarvis |
|---|---|
| Baixo risco | Organizar links, catalogar produtos, gerar rascunhos e métricas locais |
| Médio risco | Preparar campanha e sugerir público/horário; exige revisão |
| Alto risco | Publicar, enviar mensagens, alterar anúncios, comprar ou transferir; exige confirmação explícita |

### Fase 11 — Wiki Arma 3 e ícones existentes

**Objetivo:** melhorar a Wiki Arma 3 usando os assets já versionados no repositório, sem reintroduzir acoplamento ou conteúdo sem origem.

O inventário confirmou grande quantidade de assets versionados em `public/arma3/`, incluindo imagens `.webp`. A próxima implementação deve mapear IDs e categorias dos dados da Wiki para os arquivos existentes, gerar miniaturas lazy, `alt` textual, fallback quando um asset estiver ausente e carregamento por módulo. A tarefa não é copiar imagens indiscriminadamente: é criar um índice de assets com nome, categoria, origem, licença/observação e referência do item.

A integração deve cobrir armas, veículos, unidades, munições, facções e demais categorias que possuam dados compatíveis. O botão da Wiki Arma 3 ou de qualquer recurso interno poderá ser desligado individualmente quando o health monitor detectar falha. O módulo continuará disponível para developer/admin/owner somente conforme autorização server-side, enquanto usuários comuns verão uma mensagem neutra.

### Fase 12 — Wiki Project Zomboid e motor de conhecimento

**Objetivo:** transformar o levantamento de Project Zomboid em um módulo de conhecimento estruturado da V2, seguindo a issue #422.[2]

As fontes levantadas incluem mods, escadas, recuperação de Skills, automações, veículos, profissões, mapas e conteúdo de Build 42.20. Cada entrada deve ser tratada como candidata até possuir fonte, versão, data, compatibilidade, status e evidência.

```text
Fonte → ingestão → normalização → evidência → revisão → entidade consultável
```

A interface será construída depois do contrato. O módulo terá entidades, relações, fontes, compatibilidade por versão, busca, filtros, atualização incremental e testes de contrato. O mesmo padrão poderá servir à Wiki Arma 3, Arma 4, GTA, Zumbis e outras Wikis, sem duplicar motores.

### Fase 13 — PokeDesk completa

**Objetivo:** adicionar ao roadmap uma futura PokeDesk como módulo independente de conhecimento, consulta e planejamento Pokémon.

A PokeDesk é uma proposta de produto derivada diretamente da solicitação do usuário e ainda precisa de um contrato detalhado. O escopo inicial recomendado é: Pokédex pesquisável, tipos, habilidades, movimentos, evoluções, habitats/localizações, fraquezas e resistências, comparação, criação de equipes, favoritos, checklist de coleção, calculadoras de combate, importação/exportação de equipes, modo offline e fontes/versionamento dos dados.

| Submódulo | Entrega planejada |
|---|---|
| PokeDex | Busca, filtros, fichas e navegação por relações |
| Battle Desk | Tipos, dano, resistências e simuladores explicáveis |
| Team Builder | Equipes, papéis, fraquezas, exportação e compartilhamento controlado |
| Collection Desk | Favoritos, checklist e progresso local/sincronizado |
| Data Pipeline | Fonte, versão, atualização, schema e validação |
| PokeDesk AI | Consulta assistida pelo JARVIS sem inventar dados não presentes na fonte |

A PokeDesk só entra no Core depois que o contrato de módulo, Data Layer, Evidence Layer, permissões e testes estiverem disponíveis. O nome e o escopo final podem ser ajustados antes do primeiro commit de implementação.

### Fase 14 — Testes mensais de todos os módulos

**Objetivo:** depois que a V2 chegar ao marco final, instituir um ciclo mensal de saúde operacional para todos os módulos do site, do app e das integrações.

O teste mensal não será apenas uma visita manual às rotas. Ele deverá descobrir módulos pelo Registry, executar contratos, abrir superfícies públicas, testar fallback, validar permissões, medir recursos críticos e produzir um relatório versionado.

| Camada mensal | Verificação |
|---|---|
| Contratos | Entradas, saídas, schemas e compatibilidade |
| Core | Boot, Event Bus, Runtime, lifecycle e restart |
| Módulos | Load, health, fallback, estado e isolamento de falha |
| Rotas | Smoke completo das rotas públicas e rotas protegidas autorizadas |
| Dados | Schemas, migrações, RLS, proveniência e integridade |
| JARVIS | Memória, tools, permissões, fallback de modelo e limites |
| OpenClaw/MCP | Health check, bridge, autenticação redigida, idempotência e reconexão |
| App | APK/AAB de teste, navegação offline, câmera e permissões |
| Segurança | CodeQL, dependências, secrets, CORS, XSS e exposição indevida |
| Resultado | Relatório com causa raiz, efeito cascata, severidade e ação recomendada |

A execução determinística deve ficar em GitHub Actions ou em um serviço de automação apropriado. Um resumo narrativo pode ser gerado depois, mas não deve substituir os logs e artefatos técnicos. Falhas mensais abrem incidente; falhas repetidas podem colocar o módulo em `degraded`, `maintenance`, `disabled` ou `quarantined`.

### Fase 15 — Módulos futuros e expansão do ecossistema

A tabela abaixo transforma as ideias existentes em planos futuros, sem afirmar que já estejam implementadas.

| Módulo | Prioridade | Dependência | Primeiro marco |
|---|---:|---|---|
| **Baluarte MCP** | Alta | Core, permissions, Data/Evidence | Tools/read-only resources com autorização |
| **Knowledge Engine** | Alta | Data/Evidence, indexação, RLS | Busca com fonte e confiança |
| **JARVIS/Hermes** | Alta | Core, tools, memory, observabilidade | Orquestrador leve e fallback |
| **OpenClaw Bridge** | Alta | RPC oficial, bridge, CORS/HTTPS | Mensagem de teste em canal autorizado |
| **Wiki Arma 3** | Alta | Module Registry, asset index, health | Ícones por categoria e fallback |
| **Wiki Project Zomboid** | Alta | Data/Evidence | Entidades Build 42.20 versionadas |
| **PokeDesk** | Média | Data/Evidence, contrato de fontes | PokeDex consultável |
| **IDE/Terminal** | Média | permissions, sandbox, filesystem virtual | Ferramentas isoladas do JARVIS |
| **Baluarte Social** | Média | Auth, RLS, moderation | Conteúdo e comunicação com privacidade |
| **Nexus** | Média | Core, APIs, MCP, contratos entre projetos | Registry de projetos conectados |
| **Veritas** | Futura | Module System, Data/Evidence | Integração somente após contrato estável |
| **Stock Analyzer** | Futura | notícias, Evidence Mesh, Risk Engine | Sinais com fontes e revisão |
| **DailyPlanner** | Futura | scheduler, user data, permissions | Planejamento pessoal isolado |
| **Arma 4 / GTA / Zumbi** | Futura | motor de Wiki, parsers, Evidence Layer | Módulos derivados sem duplicação |
| **Parser Lua/SQF** | Futura | Python/Data, schemas, editor | Análise estática reproduzível |
| **Gemini CLI** | Futura | Editor/Terminal, MCP, segurança | Assistência local com permissões |
| **AERIS-10 / PLFM_RADAR** | Futura | decisão entre simulação e showcase | Radar documentado ou simulado |
| **3D Engine** | Futura | WebGL, assets, performance | Visualização isolada com budget |

## 6. Dependências e ordem correta

```text
V1 Stable
   ↓
TypeScript incremental + contratos
   ↓
Core V2 + Module Registry + Permissions
   ↓
Data Layer + Evidence Layer + RLS
   ↓
Vertical Slice
   ↓
Command Shell Modular
   ↓
App Preview
   ↓
JARVIS leve + Knowledge Engine
   ↓
OpenClaw Bridge + MCP
   ↓
Wiki Arma 3 / Zomboid / PokeDesk
   ↓
Notícias + automações comerciais autorizadas
   ↓
Testes mensais completos
   ↓
V2 final e substituição planejada da V1
```

Uma fase pode ser prototipada antes da fase anterior terminar, mas nenhuma integração de alto risco deve ser considerada pronta antes de sua dependência de segurança, dados, identidade e observabilidade estar fechada.

## 7. Critérios para “estabilidade mínima”

O protótipo de app e a mudança de foco para layout só serão liberados quando estes critérios forem atendidos no marco escolhido: build de produção verde; typecheck incremental sem erros; suíte comportamental no baseline; rotas públicas sem regressão; integração V2 verde; caminho crítico verde; fallback de módulos comprovado; nenhuma nova causa raiz crítica aberta; documentação e rollback disponíveis.

Estabilidade mínima não significa que todos os módulos estejam prontos. Significa que a base e o conjunto declarado do marco são previsíveis, recuperáveis e honestos sobre suas limitações.

## 8. Critérios para bater o martelo na V2

A V2 só será declarada concluída quando o Core, Runtime, Module System, Data Layer, Evidence Layer, especialistas, integrador de contratos, permissões, observabilidade, módulos prioritários, app mínimo, JARVIS, documentação e CI mensal cumprirem seus contratos.

Também será necessário demonstrar que uma falha na Wiki Arma 3, PokeDesk, OpenClaw, MCP ou qualquer outro módulo não derruba o Core; que conteúdo privado não vaza; que Skills publicadas são versionadas e imutáveis; que notícias e conhecimento possuem fontes; que ações comerciais de alto impacto exigem confirmação; e que o processo de contribuição de novas pessoas está documentado.

O “martelo” será um marco de governança, não somente uma tag de versão: haverá relatório de aceitação, matriz de módulos, histórico de incidentes, plano de rollback, resultados dos testes mensais e aprovação explícita das políticas de segurança e dados.

## 9. Permissões que serão necessárias ao longo do roadmap

Neste momento, a única permissão bloqueante é a **reautenticação da integração GitHub**, necessária para publicar o commit local `1f950d1e`. Futuramente, as permissões serão solicitadas somente quando a etapa chegar nelas.

| Etapa | Permissão/decisão necessária |
|---|---|
| Publicação atual | Reautenticar GitHub |
| App | Acesso ao workflow de Mobile Release, dispositivo Android e, para iOS, macOS/Xcode/TestFlight |
| OpenClaw | Método RPC oficial, URL local/túnel HTTPS e autorização dos canais |
| WhatsApp e canais | Conta, credenciais/API oficial e política de mensagens |
| Notícias | Fontes autorizadas e limites de coleta |
| TikTok/comercial | APIs oficiais, contas, links, aprovação de publicação e regras comerciais |
| Supabase | Credenciais de ambiente e aprovação para migrations/RLS quando necessário |
| PokeDesk | Definição final de fonte, licença e escopo de dados |
| Releases | Keystore Android, Apple signing e contas de distribuição |

Nenhum segredo deve ser colocado no frontend, no Git, em URLs públicas ou em prompts persistentes. Integrações devem usar connectors/variáveis protegidas e passar por revisão antes de serem habilitadas.

## 10. O que não deve ser feito

Não fazer um rewrite total do frontend para acelerar a aparência de progresso. Não misturar V1 Stable com V2 Development. Não habilitar módulos experimentais por padrão. Não publicar Knowledge, Skills, notícias ou campanhas sem fonte, evidência, permissão e revisão. Não permitir que um agente envie mensagens, publique conteúdo, execute compra ou altere anúncios sem confirmação adequada. Não criar um segundo Event Bus, Storage, Permission Manager ou sistema de configuração sem decisão arquitetural. Não colocar tokens no navegador. Não usar o número de commits como métrica de qualidade.

## 11. Checklist de cada marco

| Pergunta | Resposta obrigatória antes de publicar |
|---|---|
| O contrato está documentado? | Entradas, saídas, erros, lifecycle e permissões definidos |
| Os consumidores foram investigados? | Nenhuma alteração feita supondo uso inexistente |
| Há teste adequado? | Unitário, contrato, integração, E2E ou smoke conforme o risco |
| A falha está isolada? | Fallback, health, retry e quarentena avaliados |
| A segurança está no servidor? | Auth/RLS/política não dependem do cliente |
| A proveniência existe? | Fonte, versão, data e confiança quando houver conhecimento |
| Os gates passaram? | Tipo, teste, build, integração, smoke e domínio aplicável |
| A documentação foi atualizada? | Roadmap, decisão, changelog e onboarding coerentes |
| O rollback é possível? | Tag/branch/artefato e procedimento identificados |

## 12. Referências

[1]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/420 "Issue #420 — Fundação, Hardening e Transição V1 → V2"
[2]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/422 "Issue #422 — Wiki Project Zomboid na V2"
[3]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/423 "Issue #423 — Plano Mestre V2"
[4]: ./OPENCLAW.md "Integração OpenClaw no JARVIS e no Conselho"
[5]: ./HANDOFF-LOCAL.md "Handoff local e estado do app Capacitor"
[6]: ./INTEGRACOES-FUTURAS.md "Integrações futuras do Projeto-Baluarte"
[7]: https://chatgpt.com/share/6a7f6e29-e2c4-83e9-a26b-96cbae1ec1dd "Material compartilhado sobre Knowledge, Skills, RLS e versionamento"
[8]: https://docs.openclaw.ai/reference/rpc "Referência oficial do RPC OpenClaw"
