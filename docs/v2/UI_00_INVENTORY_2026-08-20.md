# UI-00 — Inventário de Shell, Navegação e Design Baseline

**Status:** `COMPLETE — AUDIT ONLY`

**Audited main:** `f63fcfde5e8b0a6654c745344417de0f032e700f`

**Data:** 20 de agosto de 2026

**Branch oficial:** `main`

**Release de referência:** `v1.2.5`, com assets do Launcher verificados

**Objetivo:** mapear a superfície UI atual antes de implementar o App Shell da PHASE UI, sem reescrever a sidebar, sem criar um segundo router e sem alterar o comportamento da V1.

## 1. Resultado executivo

A auditoria confirma que o Baluarte já possui um **App Shell funcional e parcialmente tipado**. O shell atual é composto por `shell.ts`, `header.ts`, `sidebar.ts` e `overlay.ts`, com wrappers `.js` preservados para compatibilidade incremental. A navegação ainda é declarada em um catálogo estático `NAV_GROUPS` dentro de `sidebar.ts`, enquanto títulos de página são mantidos em um segundo mapa `pageTitleForRoute()` dentro de `shell.ts`. Essa duplicidade é o principal risco arquitetural que a futura navegação derivada do Module Manifest deverá resolver.

A auditoria não encontrou justificativa para uma reescrita visual imediata. A próxima implementação segura é criar contratos de inventário e disponibilidade que possam ser consumidos pelo shell existente, migrando uma superfície por vez. O shell já possui estados collapsed, mobile/off-canvas, overlay, reduced motion, theme pill, links externos, PWA install e pinning de páginas; esses comportamentos devem ser preservados durante qualquer evolução.

> **Decisão UI-00:** preservar o shell atual como compatibilidade V1; iniciar a V2 por inventário, contratos e derivação progressiva, não por substituição em lote.

## 2. Arquivos e responsabilidades

| Área | Arquivo canônico | Estado | Responsabilidade observada |
|---|---|---|---|
| Composição | `src/layout/shell.ts` | TypeScript | Monta shell, sidebar, header, main, overlay, tema, aviso V2, scroll progress e renderização de páginas |
| Barra superior | `src/layout/header.ts` | TypeScript | Marca, toggles mobile/collapse, status, data, relógio, versão, clearance e evento de pin |
| Navegação | `src/layout/sidebar.ts` | TypeScript | `NAV_GROUPS`, links, grupos, ícones, fases, PWA install, links externos e persistência de collapse |
| Sobreposição | `src/layout/overlay.ts` | TypeScript | Pinning, minimização, fechamento, drag, z-index e Media Session opcional |
| Aviso V2 | `src/layout/aviso-v2.js` | JavaScript | Banner temporário de transição e aviso de estado V2 |
| Compatibilidade | `src/layout/*.js` | Wrapper/legado | Mantém imports JavaScript enquanto os consumers terminam a migração |
| Tokens | `src/styles/variables.css` | CSS global | Cores, tipografia, spacing, radius, shadows, motion, layout e z-index |
| Shell visual | `src/styles/layout.css` | CSS global | Grid, header, sidebar, main, collapsed state, mobile drawer e overlay |
| Primitivas | `src/styles/components.css` | CSS compartilhado | Botões, cards, badges, section headers, page headers, theme pill e touch targets |

O diretório `src/layout` contém quatro implementações TypeScript canônicas (`header.ts`, `sidebar.ts`, `shell.ts` e `overlay.ts`), quatro wrappers JavaScript correspondentes e `aviso-v2.js` com declaração `.d.ts`. A migração TypeScript das implementações principais do layout já está concluída; UI-00 não deve remover os wrappers sem uma auditoria separada de consumers.

## 3. Contrato atual do App Shell

O shell usa uma grade CSS com duas colunas e duas linhas:

```text
┌──────────────┬─────────────────────────────────────────┐
│ Sidebar      │ Header                                  │
│              ├─────────────────────────────────────────┤
│              │ Main / página atual                     │
└──────────────┴─────────────────────────────────────────┘
```

`mountShell(rootEl)` limpa o root, monta atmosfera e card spotlight, cria `main`, renderiza sidebar e header, instala overlay, theme pill e aviso V2, conecta scroll progress, registra eventos do sidebar e retorna `ShellRefs`. `renderPage(pageEl, route)` encerra a página anterior, monta a nova, atualiza navegação, título, estado de rota, status de função e scroll.

O contrato atual de referências é:

```text
ShellRefs
├── shell
├── sidebar
├── header
├── main
└── overlay
```

Qualquer App Shell V2 deve manter essa superfície ou fornecer uma camada de compatibilidade explícita. Não é permitido criar uma segunda função de montagem que dispute o mesmo `#app` sem ADR e teste de coexistência.

## 4. Navegação atual e duplicações

`sidebar.ts` mantém `NAV_GROUPS` com dez grupos de navegação e aproximadamente cem entradas de rota. Cada item declara `path`, `label`, `icon` e `phase`. O item é considerado pronto quando `phase <= CURRENT_PHASE`, atualmente `CURRENT_PHASE = 21`; itens futuros recebem badge `F{phase}` e continuam navegáveis no código atual, o que não é equivalente a um estado de disponibilidade seguro.

`sidebar.ts` também contém a lógica de renderização e interação. `shell.ts` mantém um segundo mapa `pageTitleForRoute()` com títulos de rota. O router e `docs/nexus/dominios.json` possuem ainda seus próprios registros. Isso cria três fontes relacionadas para rota, título, label e agrupamento:

| Dado | Fonte atual | Risco |
|---|---|---|
| Path e lazy import | `src/main.js` | Divergência entre execução e documentação |
| Label, grupo e fase | `src/layout/sidebar.ts` | Sidebar não é derivada do Module Manifest |
| Título da página | `src/layout/shell.ts` | Um novo título precisa ser incluído em outro arquivo |
| Domínio e ownership | `docs/nexus/dominios.json` | Mapa arquitetural pode divergir de UI |
| Permissões e saúde | Core/Registry e contratos separados | A UI ainda não deriva estados `disabled`, `maintenance` e `quarantined` |

A PHASE UI deverá convergir esses dados para um manifesto consumível, mas não deve remover as fontes atuais no primeiro slice. A estratégia segura é gerar ou adaptar uma projeção de navegação a partir do contrato existente, manter fallback para `NAV_GROUPS` durante a transição e adicionar testes de igualdade entre projeções.

## 5. Tokens e compatibilidade visual

`src/styles/variables.css` define o baseline atual:

| Categoria | Contrato observado |
|---|---|
| Marca | `--color-cyan` e `--color-magenta` permanecem como nomes de compatibilidade, embora o tema atual use ouro e ouro-claro |
| Tipografia | Spectral/Georgia para sans declarada, IBM Plex Mono/JetBrains Mono para mono e Cormorant Garamond para display |
| Espaçamento | Escala de 2, 4, 8, 16, 24, 32, 48 e 64 pixels |
| Radius | 4, 8, 12, 16, 24 e pill |
| Layout | Header 56px, sidebar 240px, collapsed 64px, content max 1440px |
| Camadas | sticky 100, overlay 500, modal 1000, toast 1500 |
| Acessibilidade | `prefers-reduced-motion: reduce` reduz animações e transições |

O comentário do arquivo registra que dezenas de folhas e efeitos ainda leem os nomes legados de cyan/magenta. Portanto, UI-01 não deve renomear tokens globalmente. A evolução deve adicionar aliases documentados ou tokens semânticos sobre o baseline existente, medindo o impacto antes de substituir nomes.

## 6. Responsividade observada

`layout.css` define os seguintes estados:

| Faixa | Comportamento |
|---|---|
| Até 719px | Marca textual e data ficam ocultas; header reduzido |
| Até 900px | Shell vira uma coluna; sidebar vira drawer fixo de até 320px; overlay aparece ao abrir |
| 720px ou mais | Marca textual e data podem aparecer |
| 1024px ou mais | Status NÚCLEO/REDE/VERSÃO aparece no header |
| Desktop | Sidebar 240px ou 64px collapsed; main com padding 24px |
| Mobile | Sidebar off-canvas; main com padding 16px; collapse não remove conteúdo |

O CSS já possui touch target overrides em `components.css` e reduced motion em `variables.css`, mas UI-00 ainda não é um aceite completo de acessibilidade. Faltam uma matriz automatizada de teclado, contraste, foco, zoom de 125–200%, leitura em telas estreitas e validação de todos os estados `disabled`/`blocked`.

## 7. Dependências e riscos

| ID | Risco | Categoria | Efeito provável | Tratamento recomendado |
|---|---|---|---|---|
| UI00-R1 | Criar manifesto de navegação paralelo a `NAV_GROUPS` | Arquitetural | Labels, títulos e rotas divergem | Reutilizar Module Manifest e gerar projeção; teste de paridade |
| UI00-R2 | Ocultar botão sem proteger a rota | Segurança | Usuário acessa área quebrada/protegida por deep link | Router e autorização devem validar disponibilidade server-side |
| UI00-R3 | Confiar em `phase` como permissão | Segurança | Fase de roadmap vira falsa autoridade | Separar maturidade, health, capability e permission |
| UI00-R4 | Renomear tokens legados em massa | Regressão visual | Dezenas de estilos e efeitos quebram | Aliases e migração incremental |
| UI00-R5 | Migrar shell e router no mesmo commit | Operacional | Smoke e navegação V1 quebram em cascata | Slices pequenos, fallback e smoke por etapa |
| UI00-R6 | Expor diagnóstico interno na sidebar pública | Privacidade | Stack traces, capabilities ou tokens aparecem ao usuário | Estados neutros para user; diagnóstico só após autorização server-side |
| UI00-R7 | Introduzir Command Palette sem catálogo de comandos | Arquitetural | Segunda busca e ações inconsistentes | Definir contrato de comando e reutilizar router/Event Bus |

## 8. Escopo da próxima implementação UI-01

UI-00 fica concluída como auditoria. A próxima subfase recomendada é **UI-01 — contrato de navegação projetada**, ainda sem trocar o shell visual. Ela deve:

1. definir tipos para `NavigationDomain`, `NavigationEntry`, `AvailabilityState` e `CommandDescriptor` sem criar um novo permission manager;
2. projetar os dados existentes de `NAV_GROUPS` para um formato de domínio, preservando paths e labels atuais;
3. definir como `enabled`, `degraded`, `disabled`, `maintenance`, `experimental` e `quarantined` aparecem para usuário normal e autoridade autorizada;
4. criar um teste de paridade entre o catálogo atual, o router V1 e o mapa Nexus;
5. adicionar uma entrada de manifesto para uma única superfície piloto, preferencialmente `/baixar` ou `/wiki-arma3`, sem substituir as demais rotas;
6. manter o App Shell, a API de `ShellRefs`, o fallback V1 e os wrappers JavaScript intactos.

UI-01 não deve criar o Command Palette completo, mover todas as rotas para `/ai` ou `/knowledge`, ativar Auth/RLS remoto, ou alterar o visual global. Esses itens dependem da prova de paridade e do contrato de disponibilidade.

## 9. Gates da auditoria

A auditoria foi somente leitura sobre o comportamento: nenhum código funcional foi alterado. A baseline pós-release permanece com os gates principais verdes, incluindo Nexus, TypeScript V1/V2, testes, build, integração V2 `21/21`, smoke `99/99`, caminho crítico `15/15`, workflows remotos verdes e release `v1.2.5` pública com oito assets HTTP 200.

O runtime Rust local continua classificado como limitação de ambiente conhecida, porque Cargo 1.75.0 não interpreta metadata `edition2024`. A auditoria não aplicou DDL Supabase, não ativou Auth/RLS remoto e não criou uma nova integração externa.

## Referências

[1]: ./PHASE_UI_DESIGN_SYSTEM.md "Especificação da PHASE UI"
[2]: ./V2_ARCHITECTURE.md "Arquitetura V2 e Module Manifest"
[3]: ../../src/layout/shell.ts "App Shell canônico"
[4]: ../../src/layout/sidebar.ts "Sidebar e catálogo de navegação atual"
[5]: ../../src/styles/layout.css "Contrato visual e responsivo do shell"
[6]: ../../src/styles/variables.css "Tokens globais e compatibilidade visual"
[7]: ../../src/styles/components.css "Primitivas compartilhadas e page header"
[8]: ../../docs/nexus/dominios.json "Mapa Nexus de domínios e ownership"
[9]: ../../src/main.js "Router V1 e lazy imports"
[10]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/releases/tag/v1.2.5 "Release 1.2.5 e assets públicos"
