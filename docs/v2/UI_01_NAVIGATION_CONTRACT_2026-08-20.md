# UI-01 — Contrato de Navegação Projetada

**Status:** `IMPLEMENTED — LEGACY PROJECTION ONLY`

**Data:** 20 de agosto de 2026

**Branch:** `main`

**Base:** UI-00 em `de393407c3ebd8390f6c600b07b21f5f1d558c65`

**Objetivo:** criar o contrato de navegação que a PHASE UI poderá consumir progressivamente, sem substituir o router V1, a sidebar existente ou o Module Manifest.

## Resumo

UI-01 adiciona `src/layout/navigation.ts`, uma projeção TypeScript do catálogo real `NAV_GROUPS` de `src/layout/sidebar.ts`. O módulo achata grupos e entradas em uma estrutura de domínios, normaliza paths, cria IDs estáveis, preserva labels/ícones/fases e permite derivar títulos e estados de disponibilidade por rota.

O módulo é deliberadamente **passivo**: nenhum import do shell foi trocado, nenhuma rota foi removida, nenhum botão foi ocultado e nenhum papel de usuário foi inferido no cliente. A V1 continua usando `renderSidebar()` e o router atual. A projeção serve como contrato testável para a próxima migração, reduzindo o risco de criar uma segunda sidebar ou uma segunda fonte de rotas.

> **Regra de segurança:** disponibilidade visual não é autorização. `disabled`, `maintenance`, `quarantined` e outros estados só podem ser aplicados no produto final depois que router, Registry, health e autoridade server-side concordarem.

## Contrato implementado

`src/layout/navigation.ts` exporta:

| Export | Papel |
|---|---|
| `AVAILABILITY_STATES` | Lista fechada dos seis estados de disponibilidade UI |
| `AvailabilityState` | Tipo union dos estados de disponibilidade |
| `NavigationMaturity` | Maturidade `stable` ou `planned`, derivada da fase |
| `NavigationEntry` | Entrada projetada com `id`, `path`, `label`, `title`, `icon`, `phase`, `maturity`, `availability`, `domainId` e `source` |
| `NavigationDomain` | Grupo projetado com ID, label e entradas |
| `NavigationProjection` | Coleção de domínios e entradas achatadas |
| `NavigationProjectionOptions` | Callbacks de título, disponibilidade e fase corrente |
| `projectLegacyNavigation()` | Projeta o catálogo sem alterar a fonte |
| `findNavigationEntry()` | Consulta uma rota normalizada dentro da projeção |

A fonte declarada no resultado é sempre `legacy-sidebar` nesta primeira etapa. Isso torna explícito que UI-01 ainda não afirma que o catálogo legado é o manifesto definitivo da V2.

## Estados e maturidade

A projeção separa duas dimensões que não devem ser confundidas:

| Dimensão | Valores | Origem atual |
|---|---|---|
| Maturidade | `stable`, `planned` | Comparação da fase da entrada com `currentPhase` |
| Disponibilidade | `enabled`, `degraded`, `disabled`, `maintenance`, `experimental`, `quarantined` | `enabled` por padrão; callback explícito para o piloto/teste |

Uma rota pode ser madura e estar degradada, como o caso de `/wiki-arma3` usado no teste. Isso evita usar `phase` como uma falsa permissão ou assumir que uma rota pronta nunca pode estar em manutenção.

## Invariantes protegidas

A implementação rejeita paths duplicados e IDs duplicados em vez de escolher silenciosamente uma entrada. Paths são normalizados para iniciar com `/` e não terminar com `/`, exceto a raiz. Labels e ícones são preservados do catálogo legado. A quantidade de grupos e entradas projetadas deve ser igual à quantidade do catálogo de origem.

Essas invariantes são cobertas por `test/ui-navigation.test.js`, que valida cinco comportamentos: paridade de contagem, preservação de dados, separação entre maturidade e disponibilidade, consulta normalizada e rejeição de duplicação.

## Limites intencionais

UI-01 não substitui `NAV_GROUPS`, não conecta a projeção ao DOM, não muda `ShellRefs`, não altera `src/main.js`, não cria Command Palette, não move rotas para novos domínios de URL e não registra permissões no cliente. Também não aplica estado de quarentena por configuração local, query string ou `localStorage`.

A próxima evolução deve obter disponibilidade de um contrato de Registry/health autorizado, manter uma política neutra para usuários normais e reservar diagnóstico detalhado para autoridade server-side. A sidebar só poderá esconder/desabilitar uma entrada quando a rota também rejeitar ou tratar o deep link de modo consistente.

## Nexus e compatibilidade

`src/layout/navigation.ts` foi registrado no domínio `baluarte-shell` de `docs/nexus/dominios.json`. Os wrappers `shell.js`, `header.js`, `sidebar.js` e `overlay.js` permanecem intactos. A regra de sincronização de `src/main.js` não foi acionada porque o router V1 não foi modificado neste slice.

## Evidências do slice

| Gate | Resultado |
|---|---:|
| `git diff --check` | verde |
| JSON do Nexus | válido |
| `npx tsx --test test/ui-navigation.test.js` | 5/5 |
| `npm run tipos:ts` | verde |
| `npm run tipos:v2` | verde |
| `npm run verificar-nexus` | 99 rotas, 0 lacunas, 21/21 domínios |

Os gates completos de integração, smoke, caminho crítico, testes e build serão repetidos antes da publicação do commit. O runtime Rust local permanece sujeito à limitação conhecida do Cargo 1.75.0 com metadata `edition2024`.

## Próximo passo

O próximo slice é **UI-02 — paridade automatizada e piloto de disponibilidade**, ainda sem substituir a sidebar inteira. Ele deverá conectar a projeção a uma fonte de estado de módulo somente depois de definir o contrato autorizado de health e fallback. A primeira superfície piloto recomendada continua sendo `/wiki-arma3` ou `/baixar`, escolhida com base em um contrato de disponibilidade real e não apenas em um flag visual.

## Referências

[1]: ./UI_00_INVENTORY_2026-08-20.md "Inventário UI-00"
[2]: ./PHASE_UI_DESIGN_SYSTEM.md "Especificação da PHASE UI"
[3]: ../../src/layout/navigation.ts "Implementação do contrato UI-01"
[4]: ../../src/layout/sidebar.ts "Catálogo NAV_GROUPS legado"
[5]: ../../test/ui-navigation.test.js "Testes de paridade da UI-01"
[6]: ../../docs/nexus/dominios.json "Mapa Nexus"
[7]: ./V2_ARCHITECTURE.md "Arquitetura V2 e Module Manifest"
