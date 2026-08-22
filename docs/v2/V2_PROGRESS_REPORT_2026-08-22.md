# Relatório de progresso da V2

**Código auditado:** `978e13e3c27628401425828d6edad81f46430958`

**Branch:** `main`

**Data da medição:** 2026-08-22

**Status:** medição do estado real; este documento não declara a V2 completa.

## Resumo executivo

O Projeto-Baluarte está **significativamente mais perto da primeira release Alpha da V2**, mas ainda está distante da conclusão da V2 estável como produto completo. A principal transição já vencida foi a migração de páginas: existem **0 páginas canônicas JavaScript**, **115 implementações canônicas TypeScript** e **115 wrappers JavaScript preservados para compatibilidade**. Esse objetivo específico está em 100% no escopo de páginas, mas os wrappers continuam corretamente no repositório e não devem ser removidos em lote [1].

A construção geral está no fim da fundação e entrando na etapa de primeiro vertical slice completo. O checkpoint mais recente ligou Briefing→Evidence pelo Registry/API real, sem capacidade ad-hoc, e tornou essa ligação observável na superfície V2. Core, Runtime, Event Bus, observabilidade read-only, contratos de sessão, JARVIS Mark XIII, presença Spotify, Registry piloto, Billing local e documentação já possuem implementação e evidência local. O que ainda impede a declaração de uma V2 pronta é a combinação de **Data/Evidence real, Auth/RBAC server-side, Supabase/RLS, isolamento operacional uniforme de módulos, estabilização, aceite físico do app e critérios de RC**.

Para responder objetivamente à pergunta “quanto falta”, esta medição usa dois indicadores diferentes. O índice ponderado de prontidão das 28 fases do mapa V2 é **57,3%**, calculado a partir dos estados documentados e com pesos explícitos; ele é uma métrica de planejamento, não uma promessa de produto. A migração de páginas está em **100%**, os gates locais executáveis estão em **21/21**, e a suíte comportamental está em **1250/1250**. A V2 está, portanto, **mais da metade construída como fundação**, porém ainda não está na metade final de uma release estável: os marcos Beta, RC, estabilização e COMPLETE continuam abertos.

## Estado observado

| Indicador | Estado observado |
|---|---:|
| `origin/main` auditado | `978e13e3` |
| Páginas canônicas JS restantes | **0** |
| Arquivos físicos `.js` em `src/pages/` | **115**, todos wrappers de compatibilidade |
| Implementações `.ts` em `src/pages/` | **115** |
| Arquivos `.d.ts` em `src/pages/` | **8** |
| Suíte completa | **1250/1250** |
| Integração V2 | **46/46** |
| Smoke de rotas | **99/99** |
| Caminho crítico | **15/15** |
| Gates do runner oficial | **21 passaram, 1 `blocked-known`, 0 falhas novas** |
| Focal Spotify/Soloist/Mark XIII | **19/19** |
| CI remoto aplicável | **8 workflows verdes no SHA; Supabase Preview não foi disparado neste push** |
| Última release operacional | **`1.2.6` publicada** |

O `blocked-known` é o teste Rust local com código 101 porque o Cargo disponível não interpreta a metadata `edition2024`; esse bloqueio já é conhecido e separado da aplicação. O check remoto de Rust foi observado como verde. O Supabase Preview permaneceu uma dependência externa, com a mensagem de versões de migrations remotas ausentes no diretório local; nenhuma migration, DDL, branch de staging ou escrita remota foi executada.

## Percentuais que não devem ser confundidos

| Dimensão | Percentual | Interpretação |
|---|---:|---|
| Migração de páginas canônicas JS → TS | **100%** | O objetivo de converter as páginas foi atingido. Os 115 `.js` restantes são wrappers deliberados. |
| Gates locais executáveis | **21/21 = 100%** | Todos os gates executáveis passaram; Rust fica separado como bloqueio conhecido de toolchain. |
| Testes comportamentais | **1250/1250 = 100%** | A suíte não apresenta falha nova neste SHA. |
| Smoke e jornada crítica | **99/99 e 15/15** | As rotas e a jornada principal continuam preservadas. |
| Índice ponderado das fases V2 | **57,3%** | Estimativa de prontidão de fases, calculada sobre estados da matriz, não sobre linhas de código. |
| V2 estável `2.0.0` | **não declarada** | Ainda faltam Beta, RC, estabilização, dados reais, autoridade server-side e testes mensais. |

O índice de 57,3% foi calculado atribuindo `1,0` a uma fase concluída no escopo declarado, `0,75` a uma fase avançada, `0,5` a uma fase parcial, `0,35` a uma fase experimental ou inicial e `0` a uma fase não iniciada ou adiada. Esse número é útil para acompanhar tendência, mas não substitui os critérios de saída das releases.

## Mapa de marcos

| Marco | Estado atual | Distância até a saída |
|---|---|---|
| Fundação e governança | Avançada | Consolidar contratos e evitar divergência documental. |
| Migração de páginas TypeScript | Concluída no escopo canônico | Manter wrappers até a auditoria de consumidores; tipar utilitários e fronteiras restantes quando houver evidência. |
| `2.0.0-alpha.1` — Frontend TypeScript | Tecnicamente elegível pelos gates de páginas | Atualizar inventário, release note e critérios no mesmo SHA; ainda não há tag pública Alpha. |
| `2.0.0-alpha.2` — Contratos V2 | Gates `tipos:v2` passam no SHA observado | Reconciliar o texto histórico de `ROOT-TYPES-001`, fechar contratos restantes e validar a matriz com o mesmo SHA. |
| `2.0.0-beta.1` — Primeiro vertical slice | Parcial | Conectar Runtime, Core, Data, Evidence, módulo, superfície e observabilidade em uma fatia completa; Supabase/RLS ainda bloqueia a parte real. |
| `2.0.0-beta.2` — Plataforma modular | Parcial/pilotos | Uniformizar health, quarentena, fallback, claims e operação autorizada sem papel decidido no cliente. |
| `2.0.0-rc.1` — Protótipo de app | Não iniciado como release | Exigir Beta sem bloqueios críticos, onboarding, auth, offline e aceite web/desktop/mobile. |
| `2.0.0` — V2 estável | Não iniciada | Exigir RC aprovado, módulos prioritários concluídos, gates obrigatórios verdes e testes mensais ativados. |

A release pública atual é `1.2.6`, com o visual JARVIS Núcleo V7 e os instaladores verificados. Ela é uma release operacional da linha existente, não a V2 estável. O próximo marco planejado é `2.0.0-alpha.1`, e a matriz de release confirma que a existência de páginas TypeScript não basta para declarar a V2 completa [2].

## O que já está construído

A fundação possui Core, Boot, Runtime, Event Bus, Storage local, permissões deny-by-default, contratos de observabilidade, sessão server-validated read-only, cliente HTTP read-only, doctor V2, pilotos de Module Registry, Billing local e integração de 46 asserções. O JARVIS também possui contexto bounded, recall cacheado, seleção lazy de schemas, visual Mark XIII lightweight, reação de playback e Spotify PKCE read-only. Essas entregas estão comprovadas por testes e gates, mas várias permanecem deliberadamente read-only até existir autoridade server-side [3].

A linha V1 continua preservada. O router, as 99 rotas do smoke, os wrappers de compatibilidade e a release `1.2.6` não devem ser reescritos apenas para acelerar um percentual. A arquitetura correta é continuar adicionando slices pequenos por cima da superfície estável, com fallback e rollback por módulo.

## O que falta para a conclusão real

| Área | Situação | Impacto na conclusão |
|---|---|---|
| Data Layer e Evidence Layer | Contratos e persistência local existem; proveniência, persistência comum e evidência de produto ainda não estão fechadas | Bloqueia o primeiro vertical slice completo. |
| Supabase/RLS | Contrato local e auditoria existem; produção está bloqueada por staging, migrations e aprovação de custo | Bloqueia Auth real, tenancy, RBAC, Billing remoto e evidência persistente. |
| Auth e permissões | Login/formulário, adapter e sessão read-only avançados; autoridade e roles reais precisam permanecer server-side | Bloqueia declarar developer/admin/owner operacionalmente. |
| Module Registry operacional | Pilotos de estados e observação existem | Falta health uniforme, incidentes, quarentena, retry, rollback e autorização formal por módulo. |
| JARVIS | A superfície e as otimizações locais estão avançadas | Faltam benchmark em hardware real, ponte protegida para integrações externas e operação com OpenClaw/notícias. |
| App/Desktop/Mobile | Infraestrutura e release 1.2.6 existem | Falta aceite físico e testes de dispositivo para o protótipo da V2. |
| Segurança e performance | CodeQL e gates principais passam; há hardening local | Faltam RLS/RBAC remoto, rate limit distribuído, threat model completo e matriz real de hardware. |
| Estabilização | Fase ainda não iniciada como ciclo formal | Faltam incidentes, drills de rollback, quarentena em uso e testes mensais. |

## Causas raiz versus efeitos cascata

As causas raiz atuais não são 1247 testes: a suíte está verde. A primeira causa raiz externa é o **drift de versões de migrations do Supabase Preview**, que impede validar a branch externa; os efeitos cascata são a impossibilidade de declarar RLS remoto, Auth/RBAC persistente, Data Layer real e Beta sem dependência externa resolvida. A segunda causa raiz de ambiente é o **Cargo local incompatível com `edition2024`**, que afeta somente o gate Rust local; não é uma falha nova do código web e o workflow remoto de Rust foi observado como verde.

As causas raiz arquiteturais são a ausência de um vertical slice completo Data/Evidence, a ausência de autoridade server-side de produção para claims/roles, a falta de um ciclo formal de estabilização e a falta de aceite físico do app. Os atrasos de Beta, RC, V2 estável e testes mensais são efeitos dependentes dessas causas; não devem ser contabilizados como defeitos independentes.

## Ordem correta para chegar ao fim

Primeiro, deve ser reconciliado o ambiente de staging e migrations do Supabase, somente após aprovação explícita de custo e staging. Em seguida, deve ser fechado um único vertical slice com Core, Runtime, Data, Evidence, módulo, superfície, observabilidade e rollback. Depois disso, a autoridade server-side deve ser ligada a Auth/RBAC/tenancy sem papéis vindos de `localStorage`, query string ou metadata editável pelo cliente.

Na sequência, o Module Registry deve receber operação uniforme de health, `degraded`, `disabled`, `maintenance`, `quarantined`, fallback e auditoria. Só então faz sentido avançar para o protótipo de app, medir hardware real, fechar a estabilização e iniciar testes mensais por módulo. OpenClaw, WhatsApp, notícias e PokeDesk devem continuar como trilhas posteriores e opt-in, sem se tornarem dependências do boot V1.

## O que não deve ser alterado sem necessidade

Não devem ser removidos os 115 wrappers JavaScript, porque eles preservam compatibilidade enquanto o grafo de consumidores legados não estiver formalmente fechado. Também não devem ser alterados em massa o router V1, as 99 rotas verdes, o fallback V1, `runtimeAuthority: not-authorized`, `publicPromotionAllowed: false`, a política deny-by-default, o registro único de presença musical ou o contrato read-only do JARVIS.

Não devem ser executados DDL, migrations, alterações de RLS, envio de WhatsApp, publicação de conteúdo, venda, controle de playback ou configuração de credenciais externas como atalho para aumentar o percentual. A conclusão da V2 depende de evidência verificável, não de ativar integrações sem rollback.

## Evidência executada nesta medição

| Comando ou evidência | Resultado |
|---|---|
| `git fetch origin main` | `origin/main` confirmado em `978e13e3`. |
| Inventário físico de `src/pages` | 115 `.js` wrappers, 115 `.ts` canônicos e 8 `.d.ts`. |
| Runner oficial | 21 gates código 0; Rust código 101 conhecido; nenhuma falha nova. |
| `npm test` dentro do runner | 1250/1250. |
| `npm run tipos:ts` | Passou. |
| `npm run tipos:v2` | Passou. |
| `npm run build` | Passou com warnings conhecidos de chunks grandes. |
| `npm run v2:integracao` | 46/46 |
| `npm run smoke` | 99/99. |
| `npm run caminho-critico` | 15/15. |
| CI remoto no SHA | 8 workflows verdes; Supabase Preview não foi disparado neste push. |
| Working tree no início da medição | Limpo. |

## Checkpoint mais recente — Briefing → Evidence pelo Registry — 978e13e3

O módulo Briefing agora declara `references.modules: ['evidence']` e resolve `ctx.talvez('evidence', { versao: 1 })` durante o lifecycle. O harness registra seis módulos ativos, Evidence permanece sem rota e a navegação continua com cinco entradas. A view do Briefing informa, em linguagem simples, quando a Evidence local está conectada. O teste focal passou 10/10; o runner oficial passou 21 gates, manteve Rust local como `blocked-known` código 101 e não registrou falha nova. O CI remoto deste SHA terminou com CI, Core CI, V2 Core, V2 Validation, V2 Runtime, CodeQL, Arma 3 Data CI e Vigia das rotas verdes. Nenhuma alteração Supabase, DDL, migration, RLS, Auth de produção, OpenClaw, WhatsApp ou ação externa de alto impacto foi executada.

## Referências

[1]: ./TYPESCRIPT_REMAINING.md "Inventário corrente de páginas TypeScript e wrappers"

[2]: ./RELEASE_PLAN.md "Plano de releases e critérios de promoção"

[3]: ./PHASE_STATUS_MATRIX.md "Matriz de fases e estado V2"

[4]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/420 "Issue #420 — Fundação, hardening e transição V1 → V2"

[5]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/422 "Issue #422 — Wiki Project Zomboid na V2"

[6]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/423 "Issue #423 — Plano Mestre V2"
