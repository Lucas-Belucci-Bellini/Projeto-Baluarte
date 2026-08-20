# PHASE UI — Baluarte Design System & Information Architecture

**Status:** `PLANNED — SPECIFICATION PUBLISHED`

**Data de incorporação:** 20 de agosto de 2026

**SHA de publicação da especificação:** `1032437c93b686e7ec574ebf489c236cacd892ea`

**Origem:** proposta de arquitetura visual recebida nos anexos `pasted_content_4.txt` e `pasted_content_5.txt`

**Branch oficial de entrega:** `main`

**Autor:** Manus AI

## 1. Propósito

A PHASE UI transforma a proposta visual do Baluarte em uma frente arquitetural governada. O objetivo não é apenas deixar a interface mais bonita. O objetivo é impedir que o crescimento de Wikis, JARVIS, Git Nexus, IDE, 3D, perfil, ferramentas, módulos, marketplace, billing, configurações, administração, social, desktop e mobile transforme o site em um conjunto de páginas sem orientação comum.

A fase criará um **sistema operacional visual do Baluarte**: uma fonte de verdade para módulos, domínios, rotas, permissões, estados e padrões de interação, com um App Shell compartilhado e templates adequados para cada tipo de superfície.

> **Princípio:** uma nova página deve entrar em um domínio e em um template conhecidos; ela não deve inventar uma navegação, uma hierarquia ou um conjunto de componentes paralelo.

A fase também preserva uma decisão já existente: a web deve continuar leve, enquanto superfícies pesadas ou app-only, como partes do Núcleo JARVIS, Git Nexus e workloads 3D, continuam protegidas por fallback e disponibilidade de ambiente.

## 2. Reconciliação com a arquitetura existente

A proposta não cria uma segunda sidebar, um segundo router ou um segundo registro de módulos. O contrato existente de `Module Manifest` em `docs/v2/V2_ARCHITECTURE.md` já estabelece que nome, ícone, rota, ordem de navegação, permissões, storage, eventos e lifecycle devem nascer de uma declaração única e ser derivados pelo Core.

| Proposta recebida | Contrato que deve ser reutilizado |
|---|---|
| App Shell único | `src/layout/` e o shell compartilhado, evoluídos por contrato |
| Sidebar por domínios | `Module Manifest`, Nexus e manifesto de navegação, não lista paralela |
| Search e Command Palette | Event Bus, router e catálogo de comandos existentes, com registro único |
| Estado de módulo quebrado | Registry, health, quarentena e política de fallback da V2 |
| Profile, Settings e Billing | Auth, permissions, tenancy, Data Layer e Billing Foundation; a UI não decide autoridade |
| Knowledge, Wikis e Evidence | Evidence Layer, proveniência e contratos de fonte |
| Workspace e Projects | Project Registry e contratos externos, sem acoplamento direto ao Core |
| Design tokens e componentes | Nova camada `src/design-system/`, somente após contrato e inventário de estilos |

A proposta é, portanto, uma fase de integração da arquitetura existente, não uma autorização para criar abstrações duplicadas.

## 3. Information Architecture

A navegação deve agrupar rotas por intenção e domínio, em vez de expor dezenas de páginas na sidebar principal. O agrupamento inicial recomendado é:

| Domínio | Superfícies previstas | Regra de exposição |
|---|---|---|
| Global | Home, Search, Command Palette, Notifications, Profile, Settings | Sempre acessível conforme sessão e permissões |
| AI | JARVIS, Tools, Memory, Agents, Providers | JARVIS e ferramentas respeitam capability e ambiente |
| Knowledge | Discover, Wikis, Search, Evidence, Sources | Dados externos devem carregar proveniência e estado de evidência |
| Workspace | Projects, Files, Tasks, Activity, Team | Deve depender de workspace/tenancy quando esse contrato existir |
| Developer | IDE, Git Nexus, APIs, Modules, Integrations | Superfícies quebradas ou app-only não aparecem para usuário sem autoridade |
| Creative | 3D, Gallery, Audio, Media | Superfícies pesadas precisam de lazy loading e fallback |
| Community | Feed, Communities, Channels, Messages, Notifications | Depende de identidade, canais, storage e moderação |
| Business | Organization, Members, Billing, Usage, Analytics, Admin | Só aparece quando claims server-side e contratos de tenancy estiverem aceitos |

Esses nomes são categorias de informação, não necessariamente rotas novas. A primeira implementação deve preferir manter deep links existentes e mapear rotas atuais para domínios, evitando uma migração de router e layout no mesmo changeset.

## 4. App Shell

O App Shell é o contêiner de composição, não o dono da lógica de negócio. O modelo conceitual é:

```text
<BaluarteShell>
  <TopBar />
  <Sidebar />
  <Workspace />
  <StatusBar />
</BaluarteShell>
```

O shell deve oferecer:

| Região | Responsabilidade |
|---|---|
| TopBar | Marca, busca, command palette, notificações e conta, sem duplicar estado de sessão |
| Sidebar | Domínios e módulos derivados do manifesto, com estados loading/disabled/hidden |
| Workspace | Template da superfície corrente, breadcrumbs e conteúdo da rota |
| StatusBar | Saúde, notificações, conectividade e informações operacionais não sensíveis |

O shell deve suportar templates diferentes sem perder identidade comum:

| Template | Superfícies |
|---|---|
| Dashboard | Home, métricas, widgets e overview |
| Knowledge | Wiki, artigo, breadcrumbs, referências e Evidence |
| Workspace | Projetos, arquivos, tarefas e atividade |
| Developer / IDE | Explorer, editor, terminal, painel e status |
| 3D | Toolbar, viewport, inspector, assets e timeline |
| JARVIS | Contexto, chat, tools, activity e sources |
| Admin | Métricas, tabelas, auditoria e ações protegidas |
| Fullscreen | Visualização 3D, mídia e fluxos imersivos |

## 5. Design System

A biblioteca oficial deverá nascer em `src/design-system/`, mas a criação de dezenas de componentes não é o primeiro passo. Primeiro será feito inventário dos estilos e componentes já existentes, identificação de duplicações e definição de tokens. A primeira superfície deve ser pequena e observável.

A camada prevista inclui:

| Grupo | Conteúdo inicial |
|---|---|
| Tokens | Cores, tipografia, espaçamento, radius, sombras, motion, z-index e breakpoints |
| Primitivas | Button, Input, Select, Dialog, Tabs, Menu e Badge |
| Navegação | Sidebar, TopBar, Breadcrumbs, Toolbar e Command Palette |
| Conteúdo | Card, Table, Data Grid, Empty State, Loading State e Error State |
| Operação | Notification, Status Indicator, Health Badge, Permission Gate e Module Availability |
| Dados | Chart, metric, evidence/source marker e audit entry |

Os tokens devem reutilizar a identidade visual existente do Baluarte. A fase não autoriza adicionar uma biblioteca externa de UI apenas para acelerar protótipos; uma dependência nova exige justificativa de bundle, acessibilidade, manutenção e compatibilidade com V1/V2.

## 6. Command Palette, busca e deep links

A Command Palette será a superfície de escala para que a sidebar não vire uma lista de 80 ou 300 páginas. Ela deve abrir por atalho configurável, oferecer busca por módulos e comandos, mostrar contexto de domínio e respeitar permissões e disponibilidade do ambiente.

Cada comando precisa de:

```text
id
label
description
domain
keywords
route ou action
required permissions
required capabilities
availability
```

A busca não pode revelar uma ação que o usuário não pode executar. Uma ação pode estar `visible`, `disabled`, `hidden` ou `blocked`, mas o estado deve ser derivado dos contratos de módulo, autorização e ambiente.

Deep links estáveis continuam obrigatórios. Exemplos de organização futura:

```text
#/knowledge/arma3/weapons
#/workspace/projects
#/ai/jarvis
#/developer/git-nexus
#/business/billing
```

A adoção deverá ser incremental e compatível com as rotas hash atuais. Uma mudança de URL deve possuir alias, migração ou justificativa documentada.

## 7. Módulos quebrados, acesso e segurança

Quando uma página ou módulo da Wiki Arma 3 ou de qualquer outro domínio apresentar falha de health, contrato ou carregamento, o sistema deverá desabilitar o botão ou marcar a superfície como indisponível para o usuário normal. Isso reduz tentativas repetidas e evita que uma área defeituosa pareça funcional.

A regra de acesso é:

| Situação | Usuário normal | Admin / dev / owner autorizado |
|---|---|---|
| Módulo saudável | Acessa conforme permissão | Acessa conforme permissão |
| Módulo quebrado | Botão oculto ou desabilitado; rota protegida | Diagnóstico e acesso de manutenção se a autoridade server-side permitir |
| Módulo app-only | Fallback web ou indicação de ambiente | Acesso no Launcher se capability estiver presente |
| Módulo sem autorização | Não pode executar nem descobrir ação sensível | Só pode executar se claims e RLS confirmarem autoridade |

A UI jamais poderá decidir `admin`, `developer` ou `owner` usando somente `localStorage`, query string, atributo DOM ou metadata editável pelo cliente. A camada visual apenas representa uma decisão tomada por Auth, claims, tenancy, permissions, Module Registry e RLS.

## 8. Responsividade e acessibilidade

O App Shell deverá ser validado em larguras de 320, 375, 430, 768, 1024, 1280, 1440, 1920 e 2560 pixels, além de escalas de 100%, 125%, 150% e 200%. O comportamento esperado é sidebar completa em desktop, sidebar compacta em tablet e navegação por menu/command palette em mobile.

A validação deverá incluir foco visível, navegação por teclado, nomes acessíveis, contraste, redução de movimento, leitura em telas estreitas, estados de erro e ausência de overflow horizontal. A responsividade não será declarada concluída apenas porque a rota abre no Chromium padrão.

## 9. Fases de implementação

| Subfase | Escopo | Saída obrigatória |
|---|---|---|
| UI-00 | Inventário de shell, sidebar, header, estilos e rotas | Matriz de componentes, duplicações e dependências |
| UI-01 | Tokens e contrato de tema | Tokens versionados, sem alterar todas as páginas ainda |
| UI-02 | App Shell compatível | Shell derivado do manifesto, mantendo rotas e fallback V1 |
| UI-03 | Domínios e navegação adaptativa | Sidebar agrupada, breadcrumbs e estados de disponibilidade |
| UI-04 | Command Palette e busca | Catálogo de comandos com permissions/capabilities |
| UI-05 | Templates de superfície | Dashboard, Knowledge, Workspace, Developer, 3D, JARVIS e Admin |
| UI-06 | Migração incremental | Uma superfície por vez, com comparação visual e gates |
| UI-07 | Responsive/accessibility audit | Matriz de breakpoints, teclado, contraste e reduced motion |
| UI-08 | Stabilization | Regressão de rotas, performance, rollback e documentação |

A auditoria **UI-00** foi concluída em `docs/v2/UI_00_INVENTORY_2026-08-20.md`. Os contratos **UI-01**, **UI-02**, **UI-03 — observação do Registry**, **UI-04 — reconciliação controlada** e o **piloto de alinhamento por módulo** foram implementados em `docs/v2/UI_01_NAVIGATION_CONTRACT_2026-08-20.md`, `docs/v2/UI_02_AVAILABILITY_PILOT_2026-08-20.md`, `docs/v2/UI_03_REGISTRY_OBSERVATION_2026-08-20.md`, `docs/v2/UI_04_CATALOG_RECONCILIATION_2026-08-20.md` e `docs/v2/MODULE_ALIGNMENT_PILOT_2026-08-20.md`. A próxima subfase recomendada é alinhar uma única superfície com health, deep link, fallback e rollback documentados, sem iniciar uma reescrita ampla da sidebar.

## 10. O que está fora da primeira implementação

A PHASE UI não ativa Billing remoto, não cria Marketplace, não implementa WhatsApp, não publica conteúdo externo, não faz checkout, não cria uma rede social completa, não declara Auth/RLS concluídos e não substitui o Module Registry. Ela também não remove wrappers JavaScript nem altera as 99 rotas em lote.

A fase não deve introduzir um segundo event bus, sistema de permissões, logger, config, search index ou registry. Cada integração deverá localizar e reutilizar o contrato já existente.

## 11. Definition of Done

A PHASE UI só poderá avançar para implementação quando houver inventário e ADR aprovados no escopo da fase, sem duplicação de contrato. Cada subfase deve possuir implementação pequena, testes unitários/contratuais quando aplicável, build, smoke, caminho crítico quando tocar shell/router/storage, validação de segurança e documentação.

A PHASE UI não será marcada `COMPLETE` enquanto o App Shell apenas parecer correto em uma captura de tela. Será necessário validar rotas, permissões, módulo quebrado, fallback app-only, deep links, teclado, breakpoints, performance e regressão da V1.

## 12. Rollback

Cada subfase será revertível por commit. O rollback deve restaurar o shell e a navegação anterior sem apagar módulos, rotas ou dados. Mudanças de URL devem ter alias ou migração antes de remover o caminho antigo. Nenhuma alteração remota de Supabase deverá ser incluída sem staging saudável e confirmação explícita.

## Referências

[1]: ../v2/V2_MASTER_PLAN.md "Baluarte V2 — Master Construction Plan"
[2]: ../v2/V2_ARCHITECTURE.md "Baluarte V2 — arquitetura e Module Manifest"
[3]: ../v2/V2_RULES.md "Regras de construção da V2"
[4]: ../v2/PHASE_STATUS_MATRIX.md "Matriz de fases e estado atual"
[5]: ../../src/main.js "Router V1 e rotas existentes"
[6]: ../../docs/nexus/dominios.json "Mapa Nexus de domínios e arquivos"
