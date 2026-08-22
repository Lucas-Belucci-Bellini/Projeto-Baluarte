# Relatório de progresso da V2

**Código auditado:** `9ae47cea549b886874a223b4adf9573cc07e1e29`

**Branch:** `main`

**Data da medição:** 2026-08-22

**Status:** medição do estado real; este documento não declara a V2 completa.

## Resumo executivo

O Projeto-Baluarte está **significativamente mais perto da primeira release Alpha da V2**, mas ainda está distante da conclusão da V2 estável como produto completo. A principal transição já vencida foi a migração de páginas: existem **0 páginas canônicas JavaScript**, **123 implementações canônicas TypeScript** e **115 wrappers JavaScript preservados para compatibilidade**. Esse objetivo específico está em 100% no escopo de páginas, mas os wrappers continuam corretamente no repositório e não devem ser removidos em lote [1].

A construção geral está no fim da fundação e avançou para slices verticais locais. O checkpoint mais recente publicou a fila Wiki Zomboid→Evidence pelo Registry/API real, sem capacidade ad-hoc, bounded e read-only para registros pendentes. Core, Runtime, Event Bus, observabilidade read-only, contratos de sessão, JARVIS Mark XIII, presença Spotify, Registry piloto, Billing local e documentação já possuem implementação e evidência local. O que ainda impede a declaração de uma V2 pronta é a combinação de **Data/Evidence real, Auth/RBAC server-side, Supabase/RLS, isolamento operacional uniforme de módulos, estabilização, aceite físico do app e critérios de RC**.

Para responder objetivamente à pergunta “quanto falta”, esta medição usa dois indicadores diferentes. O índice ponderado de prontidão das 28 fases do mapa V2 é **57,3%**, calculado a partir dos estados documentados e com pesos explícitos; ele é uma métrica de planejamento, não uma promessa de produto. A migração de páginas está em **100%**, os gates locais executáveis aplicáveis estão em **20 com código 0**, o Rust permanece separado como `blocked-known`, e a suíte comportamental está em **1254/1254**. A V2 está, portanto, **mais da metade construída como fundação**, porém ainda não está na metade final de uma release estável: os marcos Beta, RC, estabilização e COMPLETE continuam abertos.

## Estado observado

| Indicador | Estado observado |
|---|---:|
| `origin/main` auditado | `9ae47cea` |
| Páginas canônicas JS restantes | **0** |
| Arquivos físicos `.js` em `src/pages/` | **115**, todos wrappers de compatibilidade |
| Implementações `.ts` em `src/pages/` | **123** |
| Arquivos `.d.ts` em `src/pages/` | **8** |
| Suíte completa | **1254/1254** |
| Integração V2 | **49/49** |
| Smoke de rotas | **99/99** |
| Caminho crítico | **15/15** |
| Gates do runner oficial | **20 com código 0, 1 `blocked-known`, 0 falhas novas** |
| Focal Spotify/Soloist/Mark XIII | **19/19** |
| CI remoto aplicável | **8 workflows verdes no SHA; Supabase Preview não foi disparado neste push** |
| Última release operacional | **`1.3.0` publicada** |

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

O índice de 57,3% foi calculado atribuindo `1,0` a uma fase concluída no escopo declarado, `0,75` a uma fase avançada, `0,5` a uma fase parcial, `0,35` a uma fase experimental ou inicial e `0` a uma fase não iniciada ou adiada. Esse número não foi recomputado neste slice; os novos números são evidências de avanço, não uma porcentagem inventada. O índice é útil para acompanhar tendência, mas não substitui os critérios de saída das releases.

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

A release pública atual é `1.3.0`, com a fila local de revisão Evidence do piloto Wiki Zomboid e os instaladores verificados. Ela é uma release operacional incremental, não a V2 estável. O próximo marco planejado é `2.0.0-alpha.1`, e a matriz de release confirma que a existência de páginas TypeScript não basta para declarar a V2 completa [2].

## O que já está construído

A fundação possui Core, Boot, Runtime, Event Bus, Storage local, permissões deny-by-default, contratos de observabilidade, sessão server-validated read-only, cliente HTTP read-only, doctor V2, pilotos de Module Registry, Billing local e integração de 49 asserções. O JARVIS também possui contexto bounded, recall cacheado, seleção lazy de schemas, visual Mark XIII lightweight, reação de playback e Spotify PKCE read-only. Essas entregas estão comprovadas por testes e gates, mas várias permanecem deliberadamente read-only até existir autoridade server-side [3].

A linha V1 continua preservada. O router, as 99 rotas do smoke, os wrappers de compatibilidade e a release `1.3.0` não devem ser reescritos apenas para acelerar um percentual. A arquitetura correta é continuar adicionando slices pequenos por cima da superfície estável, com fallback e rollback por módulo.

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
| `git fetch origin main` | `origin/main` confirmado em `9ae47cea`. |
| Inventário físico de `src/pages` | 115 `.js` wrappers, 115 `.ts` canônicos e 8 `.d.ts`. |
| Runner oficial | 20 gates código 0; Rust código 101 conhecido; nenhuma falha nova. |
| `npm test` dentro do runner | 1254/1254. |
| `npm run tipos:ts` | Passou. |
| `npm run tipos:v2` | Passou. |
| `npm run build` | Passou com warnings conhecidos de chunks grandes. |
| `npm run v2:integracao` | 49/49 |
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


## Checkpoint posterior — Wiki Zomboid schema pilot / Release 1.2.8 — 2026-08-22

Desde o checkpoint `978e13e3`, o roadmap avançou com um slice local de Wiki Infrastructure e Vertical Integration. O módulo `wiki-zomboid` foi registrado no harness V2 com contrato TypeScript canônico, wrapper JavaScript preservado, catálogo local curado de 159 entradas e proveniência explícita por Workshop ID. A integração com Evidence permanece governada por referência fraca: `references.modules: ['evidence']` e `ctx.talvez('evidence', { versao: 1 })`.

A nova superfície `/wiki-zomboid` é read-only e bounded. Ela permite observar o resumo local, consultar um registro e anexar uma afirmação local `pending` quando Evidence está disponível; quando Evidence não está presente, o módulo degrada sem derrubar o boot. Não há scraping, fetch automático, banco remoto, roles client-side, claims operacionais ou promoção pública.

| Indicador atualizado | Resultado |
|---|---:|
| Páginas canônicas JavaScript restantes | 0; 115 wrappers preservados |
| Módulos ativos no harness V2 | 7 |
| Rotas internas no harness V2 | 20 |
| Itens de navegação internos | 6 |
| Teste focal Wiki Zomboid | 4/4 |
| Suíte completa | 1254/1254 |
| Integração V2 | 48/48 |
| Smoke de rotas V1 | 99/99 |
| Caminho crítico | 15/15 |
| Runner oficial | 21 gates verdes; Rust local 101 `blocked-known` |
| CI remoto do commit funcional | 8/8 workflows verdes |
| CI remoto do commit de versão | 8/8 workflows verdes |
| Release operacional | `v1.2.8` publicada; `desktop-v1.2.8` publicada |

A release 1.2.8 é um release operacional incremental e não declara a V2 estável. Permanecem pendentes o Data/Evidence persistente, Supabase/RLS com staging aprovado, autoridade server-side de produção, health operacional uniforme, aceite físico do app, estabilização, RC e testes mensais. O índice ponderado de 57,3% permanece a medição formal anterior até uma nova recomputação completa da matriz; os números deste checkpoint são evidências de avanço, não uma nova porcentagem inventada.


## Checkpoint posterior — Evidence status observability / Release 1.2.9 — 2026-08-22

O slice Wiki Zomboid/Evidence avançou com observabilidade bounded por status. O módulo expõe contagens de `pending`, `verified`, `rejected` e `superseded`; a view V2 mostra quantidade vinculada e pendente, mas não muda status, não mostra claims completas e não decide autoridade. A integração continua governada pelo Registry e por `ctx.talvez`, sem novo barramento, Storage ou permissão.

| Indicador | Resultado |
|---|---:|
| Teste focal Wiki Zomboid | 4/4 |
| Suíte completa | 1254/1254 |
| Integração V2 | 48/48 |
| Smoke / caminho crítico | 99/99 / 15/15 |
| Runner oficial | 21 gates verdes; Rust 101 `blocked-known` |
| CI remoto do commit funcional | 8/8 verdes |
| CI remoto do commit de versão | 8/8 verdes |
| Desktop Release | 3/3 sistemas verdes; instaladores verificáveis |
| Release operacional | `v1.2.9` publicada |

O índice ponderado formal continua em 57,3% até nova recomputação completa da matriz. O avanço deste checkpoint não fecha a V2: revisão humana, retenção, persistência, Supabase/RLS, autoridade server-side, aceite físico do app, estabilização, RC e testes mensais permanecem pendentes. A release `1.2.9` está documentada em [`docs/releases/v1.2.9.md`](../releases/v1.2.9.md).

## Checkpoint mais recente — Wiki Zomboid Evidence review queue / Release 1.3.0 — 2026-08-22

O slice `wiki-zomboid-evidence-review-queue` adicionou `reviewQueue(limit)` como read-model local, bounded e somente leitura. A fila filtra somente Evidence `pending`, aplica limite padrão 25 e máximo 100, congela a saída e retorna apenas `id`, `claimKey`, `status`, `confidence`, `observedAt` e `sourceRevision`. Não existe `markStatus` no Wiki e não há exposição de statement, fonte, URI, publisher, collector, `moduleId`, token, claims ou permissão. O fallback sem Evidence retorna `[]`; um registro `verified` não aparece na fila.

| Indicador | Resultado |
|---|---:|
| Commit funcional | `3f05e240` |
| Hardening de testes/documentação | `0ab6f428` |
| Commit de versionamento | `9ae47cea` |
| Teste focal Wiki Zomboid | 4/4 |
| Suíte completa | 1254/1254 |
| Integração V2 | 49/49 |
| Smoke / caminho crítico | 99/99 / 15/15 |
| Runner oficial | 20 gates código 0; Rust 101 `blocked-known` |
| CI remota do versionamento | 8/8 workflows verdes |
| Desktop Release | `32588898329`, Windows/macOS ARM64/Ubuntu verdes |
| Release operacional | `v1.3.0` e `desktop-v1.3.0` públicas; 8 assets e manifests verificados |

A release `1.3.0` não declara a V2 estável. O Service Worker foi sincronizado para `baluarte-v1.3.0`, a V1 e os wrappers foram preservados e os instaladores, blockmaps e manifests responderam HTTP 200. O próximo passo é definir retenção, auditoria de consumidor e revisão humana com autoridade server-side; persistência Supabase/RLS continua bloqueada sem aprovação explícita.
