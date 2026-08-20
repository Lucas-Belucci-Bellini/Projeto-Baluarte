# UI-02 — Paridade de Registry e Piloto de Disponibilidade

**Status:** `IMPLEMENTED — CONTRACT PILOT, NO GLOBAL UI WIRING`

**Data:** 20 de agosto de 2026

**Base:** UI-01 — projeção legada

**Objetivo:** provar que a navegação da V2 pode ser projetada a partir da navegação já selada pelo Registry, separando estabilidade do módulo de disponibilidade/health, sem ocultar rotas globalmente.

## Decisão

UI-02 estende `src/layout/navigation.ts` com `projectRegistryNavigation()`. A função recebe `RegistryNavigationEntry[]`, o tipo retornado por `ModuleRegistry.navegacao()` depois de `selar()`, e produz a mesma forma `NavigationProjection` usada pela projeção legada.

A fonte estrutural passa a ser o Registry V2: módulo, nome, ícone, seção, ordem, path e estabilidade. A disponibilidade não é inferida de `stabilidade`. Ela só pode ser fornecida por um callback explícito `availabilityForModule`, que neste slice existe como ponto de integração testável, mas ainda não é conectado ao DOM, à sidebar ou a um endpoint remoto.

> **Limite importante:** UI-02 prova o contrato de integração; não declara que o health de produção já é uma autoridade de disponibilidade para todas as páginas.

## Contrato projetado

| Campo V2 | Campo UI-02 | Regra |
|---|---|---|
| `modulo` | `moduleId` | Preservado como identidade operacional |
| `nome` | `label` e `title` | Preservado como nome público do módulo |
| `icone` | `icon` | Preservado |
| `secao` | `domainId`/domínio | Normalizado; usa `Sem seção` quando ausente |
| `ordem` | `order` | Preservado para futura ordenação derivada |
| `path` | `path` | Normalizado e protegido contra duplicações |
| `estabilidade` | `stability` e `maturity` | `estavel` vira `stable`; `beta` e `experimental` viram `planned` |
| callback explícito | `availability` | Default conservador `enabled`; health real ainda não é presumido |
| origem | `source` | Marcado como `registry` |

A normalização mantém `findNavigationEntry()` e permite que o shell futuro consulte uma projeção sem saber se a origem foi o catálogo legado ou o Registry. Essa compatibilidade torna possível uma migração incremental, mas UI-02 não troca o consumidor atual.

## Testes

`test/ui-navigation.test.js` agora contém seis testes. Os cinco testes anteriores preservam as invariantes da projeção legada; o sexto usa duas entradas no formato `RegistryNavigationEntry` para provar que um módulo `beta` pode ser `planned` e `degraded`, enquanto um módulo `estavel` pode ser `stable` e `enabled`.

Esse caso demonstra a separação essencial entre maturidade e disponibilidade. O teste não acessa Supabase, não usa Auth falsa, não lê `localStorage` e não finge que um callback local é uma decisão server-side.

## Segurança

O UI-02 não confia em papel, query string, `localStorage`, `user_metadata` editável no cliente ou uma flag visual para autorizar acesso. Um estado de navegação futuro deverá ser uma projeção de uma decisão operacional válida; a proteção da rota e a resposta do módulo devem permanecer no Registry/Runtime e nas autoridades server-side correspondentes.

Quando uma página estiver quebrada, o contrato futuro deverá distinguir pelo menos:

| Estado | Usuário normal | Autoridade autorizada |
|---|---|---|
| `enabled` | Abre normalmente | Abre normalmente |
| `degraded` | Abre com aviso neutro ou fallback | Pode abrir diagnóstico controlado |
| `disabled` | Botão desabilitado/oculto e deep link tratado | Diagnóstico e recuperação conforme permissão |
| `maintenance` | Mensagem de manutenção sem stack trace | Área operacional controlada |
| `experimental` | Visibilidade conforme política do produto | Acesso conforme ambiente e permissão |
| `quarantined` | Não expõe detalhes | Acesso de investigação somente com autoridade |

Essa tabela é contrato de produto a validar; UI-02 implementa apenas a forma de transportar os estados, não a decisão de concedê-los.

## Fora do escopo

Não houve alteração em `src/main.js`, `renderSidebar()`, `renderPage()`, `ShellRefs`, router V1, Module Registry runtime, Auth, RLS, Supabase, Billing, Command Palette ou rotas públicas. O mapa Nexus recebeu apenas o registro de `navigation.ts`; não houve nova rota, portanto a regra de sincronização router/Nexus permaneceu satisfeita.

## Gates do slice

| Gate | Resultado |
|---|---:|
| `git diff --check` | verde |
| `npx tsx --test test/ui-navigation.test.js` | 6/6 |
| `npm run tipos:ts` | verde |
| `npm run tipos:v2` | verde |
| `npm run verificar-nexus` | 99 rotas, 0 lacunas, 21/21 domínios |

Antes da publicação, serão repetidos os gates completos de testes, build, integração V2, smoke e caminho crítico. O runtime Rust local continua sujeito à limitação conhecida do Cargo 1.75.0 com `edition2024`; nenhum resultado será mascarado.

## Próximo marco

O próximo slice recomendado é **UI-03 — adaptador de leitura do Registry no shell**, inicialmente em modo observação ou feature flag de desenvolvimento. Ele deverá provar paridade entre a projeção Registry e o catálogo legado no ambiente de teste, sem substituir a sidebar para usuários normais até que exista uma fonte real de health e um tratamento de deep link consistente.

## Referências

[1]: ./UI_00_INVENTORY_2026-08-20.md "Inventário UI-00"
[2]: ./UI_01_NAVIGATION_CONTRACT_2026-08-20.md "Contrato UI-01"
[3]: ../../src/layout/navigation.ts "Projeções de navegação UI-01/UI-02"
[4]: ../../v2/core/registry.ts "Module Registry e RegistryNavigationEntry"
[5]: ../../v2/core/manifest.d.ts "Manifest e literais de Stability"
[6]: ../../test/ui-navigation.test.js "Testes de paridade e piloto"
