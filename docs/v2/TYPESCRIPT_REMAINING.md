# JavaScript restante e roadmap de migração para TypeScript

**Audited commit:** `cc92bfc5cb3e64ead52fb34119ebc964d23280f5`
**Status:** INVENTÁRIO — nenhuma conversão foi executada nesta etapa.
**Objetivo:** responder exatamente o que ainda é JavaScript canônico, o que já é apenas compatibilidade e qual é a ordem segura para continuar a migração.

> **Conclusão executiva:** ainda há muito JavaScript no repositório, mas ele não representa um único bloco de trabalho. O próximo passo não deve ser converter todos os arquivos de uma vez. O caminho correto é continuar por contratos: páginas pequenas e de baixo risco, depois dados com declarações estruturais, depois Core/integrations e, em paralelo controlado, os contratos V2 que concentram os 61 erros atuais.

## 1. Fotografia atual

A contagem foi feita diretamente no workspace do commit auditado. Os arquivos `.d.ts` foram separados das implementações TypeScript, porque uma declaração de fronteira não significa que a implementação JavaScript já tenha sido convertida. Em `src` e `v2` existem **328 módulos JavaScript canônicos restantes** depois de retirar os 18 wrappers; `vite.config.js` é uma configuração opcional fora do domínio da aplicação.

| Área | JavaScript total | JavaScript canônico restante | TypeScript de implementação | `.d.ts` de fronteira |
| --- | ---: | ---: | ---: | ---: |
| `src/core` | 17 | 11 | 6 | 1 |
| `src/layout` | 5 | 1 | 4 | 1 |
| `src/pages` | 114 | 110 | 4 | 0 |
| `src/data` | 59 | 59 | 0 | 6 |
| `src/utils` | 96 | 96 | 0 | 17 |
| `v2/core` | 47 | 43 | 4 | 6 |
| `v2/modules` | 5 | 5 | 0 | 0 |
| `v2/harness` | 1 | 1 | 0 | 0 |
| `src/nexus` | 1 | 1 | 0 | 0 |
| `src/main.js` | 1 | 1 | 0 | 0 |
| `src/styles.d.ts` | 0 | 0 | 0 | 1 |
| `vite.config.js` | 1 | Opcional | 0 | 0 |
| **Total** | **347** | **329** | **18** | **32** |

A soma de `src` e `v2` também pode ser lida de forma mais simples: existem **293 arquivos JS em `src`**, **53 em `v2`**, **18 wrappers de compatibilidade** e **18 implementações TypeScript canônicas**. Os 18 módulos já migrados são a base atual: Event Bus, State, Router, Flags, Permissions, Storage, Layout, Home, Sobre, Arsenal, Find, Registry, Ciclo, Boot e Plataforma.

## 2. O que já não precisa ser convertido agora

Dezoito arquivos JavaScript são wrappers de compatibilidade que reexportam uma implementação TypeScript. Eles continuam no repositório de propósito, porque páginas e testes legados ainda importam os caminhos `.js`.

| Wrapper | Implementação canônica |
| --- | --- |
| `src/core/events.js` | `src/core/events.ts` |
| `src/core/flags.js` | `src/core/flags.ts` |
| `src/core/permissions.js` | `src/core/permissions.ts` |
| `src/core/router.js` | `src/core/router.ts` |
| `src/core/state.js` | `src/core/state.ts` |
| `src/core/storage.js` | `src/core/storage.ts` |
| `src/layout/header.js` | `src/layout/header.ts` |
| `src/layout/overlay.js` | `src/layout/overlay.ts` |
| `src/layout/shell.js` | `src/layout/shell.ts` |
| `src/layout/sidebar.js` | `src/layout/sidebar.ts` |
| `src/pages/arsenal.js` | `src/pages/arsenal.ts` |
| `src/pages/find.js` | `src/pages/find.ts` |
| `src/pages/home.js` | `src/pages/home.ts` |
| `src/pages/sobre.js` | `src/pages/sobre.ts` |
| `v2/core/boot.js` | `v2/core/boot.ts` |
| `v2/core/ciclo.js` | `v2/core/ciclo.ts` |
| `v2/core/plataforma.js` | `v2/core/plataforma.ts` |
| `v2/core/registry.js` | `v2/core/registry.ts` |

Esses wrappers **não são dívida de conversão funcional**. Removê-los agora quebraria consumidores V1, testes ou imports que ainda usam a extensão `.js`. A remoção só deve acontecer quando o grafo de consumidores tiver sido migrado e o build, o smoke e o caminho crítico comprovarem que nenhum caminho legado depende deles.

## 3. JavaScript canônico que ainda falta

### 3.1 Páginas — maior volume, mas não todo o maior risco

Ainda existem **110 módulos de páginas em JavaScript canônico**, somando aproximadamente **31.102 linhas**. A migração deve ser feita por risco, não apenas por tamanho.

| Grupo | Exemplos | Estado | Risco |
| --- | --- | --- | --- |
| Próxima onda segura | `src/pages/roadmap.js`, `src/pages/ferramentas.js`, `src/pages/elites.js`, `src/pages/universo.js` | Ainda JS canônico | Baixo a médio |
| Conteúdo estático militar | `guerras-conflitos.js`, `taticas-estrategias.js`, `historia-militar.js`, `tecnologia-militar.js`, `forcas-especiais.js`, `batalhas-historicas.js` | Ainda JS canônico | Baixo |
| Hubs e catálogos médios | `biblioteca.js`, `academia.js`, `ciberseg.js`, `robotica.js`, `jogos.js`, `modpack.js`, `zomboid.js` | Ainda JS canônico | Médio |
| Ferramentas interativas | `editor.js`, `terminal.js`, `qr-studio.js`, `calc-numerica.js`, `logic-sim.js`, `tabela-verdade.js`, `graficos.js` | Ainda JS canônico | Médio a alto |
| IA, Nexus e memória | `jarvis.js`, `jarvis-vision.js`, `git-nexus.js`, `git-nexus-nucleo.js`, `cerebro.js`, `memoria.js`, `llm-lab.js` | Ainda JS canônico | Alto |
| Arma 3 e 3D | `wiki-arma3.js`, `arma3-tutorial.js`, `vanguard.js`, `modelos-3d.js`, `visao.js` | Ainda JS canônico | Alto |
| Media, rádio e DSP | `radio.js`, `musicas.js`, `radar.js`, `videos.js`, `tv.js`, `media.js` | Ainda JS canônico | Alto |

As maiores páginas restantes são `arma3-tutorial.js` com 1.375 linhas, `jarvis.js` com 977, `editor.js` com 972, `visao.js` com 831, `vanguard.js` com 821, `wiki-arma3.js` com 755 e `jarvis-vision.js` com 711. Elas **não devem** ser as próximas, porque cada uma arrasta muitos contratos de dados, APIs do navegador ou integrações pesadas.

### 3.2 Dados — 59 módulos JavaScript, mas a conversão comportamental não é obrigatória em todos

Os módulos de dados somam aproximadamente **21.138 linhas**. A maioria é catálogo estático, e não lógica de aplicação. Portanto, existem duas estratégias válidas:

| Estratégia | Quando usar | Resultado |
| --- | --- | --- |
| Declaração `.d.ts` primeiro | Quando uma página precisa de tipos, mas o catálogo é grande ou estável | A página migra sem duplicar milhares de linhas de dados |
| Conversão para `.ts` | Quando o módulo possui funções, derivação, busca, normalização ou invariantes importantes | Dados e regras passam a ter tipos executáveis e testes próprios |
| Permanecer JS/JSON | Para conteúdo grande, gerado ou pouco comportamental | Não é falha arquitetural se a fronteira de consumo estiver tipada |

Já existem declarações para `arsenal`, `cronicas`, `elites`, `spline-scenes`, `universos` e `version`. Ainda faltam contratos explícitos para a maioria dos catálogos.

Os maiores módulos de dados são `arma3-colecao.js` com 4.057 linhas, `arma3-municao.js` com 1.936, `arma3-presets.js` com 1.464, `arma3-soldados.js` com 971, `arma3-veiculos.js` com 905, `terminal-commands.js` com 845, `arma3-tutoriais.js` com 834 e `wiki-arma3.js` com 646. Eles devem receber contratos e testes de esquema antes de uma conversão integral.

### 3.3 Utilitários — 96 módulos JavaScript canônicos

Os utilitários ainda não possuem implementações TypeScript canônicas. Existem declarações para alguns adaptadores visuais, DOM, tema, PWA e métricas, mas a lógica continua em JavaScript.

| Grupo | Exemplos | Prioridade |
| --- | --- | --- |
| Fronteiras DOM e visuais | `helpers.js`, `icons.js`, `effects.js`, `immersive.js`, `theme.js`, `toast.js`, `pwa.js` | Alta, depois das próximas páginas |
| Integrações e identidade | `auth-engine.js`, `fingerprint-engine.js`, `geo-tracker.js`, `supabase` callers | Alta, com revisão de segurança |
| Motores de ferramentas | `calc-engine.js`, `chart-engine.js`, `logic-parser.js`, `logic-sim-engine.js`, `qr-encoder.js`, `terminal-engine.js` | Média a alta |
| Motores de mídia/3D | `fft-engine.js`, `radar-dsp.js`, `radio-api.js`, `visor-3d.js`, `hero-webgl.js`, `hero3d.js` | Alta; converter por contrato e testes visuais/funcionais |
| Núcleo IA/Nexus | `jarvis-engine.js`, `jarvis-brain.js`, `git-nexus-engine.js`, `memory-ml.js`, `nucleo-scene.js` | Muito alta; não misturar com migração de página |
| Submódulos Vanguard | `src/utils/vanguard/*.js` | Alta; começar por tipos de geometria e balística, não pelo índice |

A Home já demonstrou o padrão recomendado: manter os motores visuais JS, adicionar uma fronteira `.d.ts` estreita, converter a composição da página e validar o comportamento real.

### 3.4 Core V1 e integrações — 11 arquivos JS canônicos

Ainda falta migrar a parte do Core que concentra estado global, política, autenticação e sincronização remota.

| Arquivo | Papel | Risco | Ordem sugerida |
| --- | --- | --- | --- |
| `src/core/politica.js` | Política de permissões, storage, flags e diagnóstico | Muito alto | Depois de contratos de Permission/Storage estabilizados |
| `src/core/supabase.js` | REST/PostgREST e configuração | Alto | Com testes de fallback offline e contratos de resposta |
| `src/core/supabase-auth.js` | Sessão, OAuth, refresh e redirect | Muito alto | Depois de tipar sessão e erros de rede |
| `src/core/dados-remotos.js` | Acesso a dados remotos | Alto | Depois de definir `unknown` e schemas de resposta |
| `src/core/realtime.js` | Atualizações em tempo real | Alto | Depois de contrato de eventos e reconexão |
| `src/core/comms.js` | Comunicação entre superfícies | Médio a alto | Após Event Bus e Session boundary |
| `src/core/media-sync.js` | Sincronização de mídia | Médio | Depois de tipos de player e lifecycle |
| `src/core/backup.js` | Backup/restauração | Alto | Com contrato de Storage e dados versionados |
| `src/core/memory-cloud.js` | Memória remota | Alto | Com sessão, RLS e schemas de dados |
| `src/core/user-prefs.js` | Preferências do usuário | Médio | Depois de Auth e Storage |
| `src/core/ciclo-vida.js` | Ciclo V1 legado | Médio | Avaliar depois do ciclo V2 para não duplicar semântica |

`src/main.js`, com 337 linhas, também continua JavaScript canônico. Ele deve ser um dos últimos arquivos V1 a migrar, porque registra todas as rotas, liga o shell, inicializa integrações e define a fronteira eager/lazy. Converter `main.js` antes de estabilizar as páginas aumentaria o raio de impacto de cada onda.

`vite.config.js` pode continuar JavaScript. Ele é configuração de build, não código de domínio da aplicação; convertê-lo para TypeScript é opcional e não deve ser confundido com a migração do frontend.

## 4. Dívida V2 restante: 61 erros em 12 arquivos

O `npm run tipos:v2` verifica JS + JSDoc com `checkJs: true` e `strict: true` por meio de `v2/jsconfig.json`.[2] Os 61 erros atuais estão concentrados nos seguintes arquivos:

| Arquivo | Erros | Natureza principal | Causa arquitetural provável |
| --- | ---: | --- | --- |
| `v2/core/runtime-stdio.js` | 28 | Node types, callbacks implícitos, estado `pending` e processo filho | Falta de contrato tipado da ponte stdio e dos tipos Node |
| `v2/core/vertical-slice.js` | 11 | Dependências e métodos de módulo sem tipo | Fronteira de módulo nativo ainda JS/JSDoc |
| `v2/core/runtime-supervisor.js` | 3 | Opções, snapshot e argumentos | Contratos de Supervisor/Group ainda divergentes |
| `v2/core/runtime-session-client.js` | 3 | Callbacks e resposta de sessão | União de respostas e contrato de autorização incompletos |
| `v2/core/runtime-manager-group.js` | 3 | Opções, `PromiseSettledResult` e `AggregateError` | Contrato de grupo e erro agregado incompleto |
| `v2/core/runtime-group-snapshot.js` | 3 | Registry opcional e módulos `unknown` | Tipo de snapshot não fechado |
| `v2/core/runtime-manager.js` | 2 | Opções e retorno de restart | Status e retorno de restart não são o mesmo tipo |
| `v2/core/runtime-module-readiness.js` | 2 | Manager opcional e literal `true` | Contrato de readiness excessivamente estreito |
| `v2/core/runtime-group-status.js` | 2 | Batches opcionais e módulos `unknown` | Tipo de status de grupo não fechado |
| `v2/core/runtime-bridge.js` | 2 | String versus `Permission` | Fronteira de grants ainda aceita valores sem estreitamento |
| `v2/core/runtime-transport.js` | 1 | `unknown` versus `RuntimeGrant[]` | Transporte não estreita envelope de permissões |
| `v2/core/runtime-readiness-wait.js` | 1 | Opções vazias | Construtor sem contrato obrigatório |

A tabela mostra uma distinção importante: não são 61 causas independentes. O maior bloco é `runtime-stdio.js`; os erros de snapshots, manager, supervisor e readiness pertencem a uma família de contratos de Runtime Manager/Group; e `vertical-slice.js` é a fronteira dos módulos nativos. A ordem correta para reduzir vários erros é fechar os contratos compartilhados, não corrigir linhas aleatórias.

## 5. Ordem recomendada das próximas ondas

| Onda | Escopo | Motivo | Critério de saída |
| --- | --- | --- | --- |
| 9 | `/roadmap` | Página quase estática, baixo acoplamento | `roadmap.ts`, wrapper, `tipos:ts`, build, smoke |
| 10 | `/ferramentas` | Hub importante, mas contratos já conhecidos | Tipos de query, DOM, debounce, toast e hero |
| 11 | `/elites` | Reutiliza declarações de equipes, crônicas e Storage | Filtros, busca, seleção e persistência preservados |
| 12 | `/universo` | Reutiliza declarações de universos e crônicas | Filtros, tema e seleção preservados |
| 13 | Páginas militares estáticas pequenas | Redução rápida do número de páginas JS | Cada página com teste de rota e wrapper |
| 14 | Dados pequenos e adaptadores simples | Fechar fronteiras usadas por várias páginas | `.d.ts` ou `.ts` com schema e testes |
| 15 | Core V1 de dados, sessão e política | Reduz dívida central, mas exige revisão de segurança | Testes de auth, offline, storage, permissions e RLS |
| 16 | V2 Runtime contracts | Reduz os 61 erros por causas compartilhadas | `tipos:v2` com queda mensurável e sem `any` |
| 17 | Ferramentas e páginas médias | Migrar comportamento depois dos contratos | Tests, build, smoke e caminho crítico |
| 18 | IA, Arma 3, 3D, mídia e `main.js` | Último bloco por maior raio de impacto | Suites específicas, performance e browser validation |

A próxima execução mais segura é `/roadmap`. Depois dela, `/ferramentas`, `/elites` e `/universo` já possuem uma linha natural, porque as fronteiras de dados e os contratos DOM usados por elas estão parcialmente preparados.

## 6. O que não deve ser feito

Não se deve transformar os 337 arquivos JavaScript canônicos em TypeScript num único commit. Isso misturaria páginas, dados estáticos, motores gráficos, Auth, Supabase, V2 e bootstrap, tornando impossível diferenciar regressão local de efeito cascata.

Também não se deve remover os 18 wrappers `.js`, incluir todo o `v2/core` no `tsconfig.json` raiz, silenciar os 61 erros com `any`, `@ts-ignore`, `@ts-nocheck` ou relaxamento de `strict`, nem corrigir o Supabase Preview criando ou apagando migrações sem obter o catálogo remoto oficial.

Os módulos Arma 3 grandes e os motores JARVIS/3D não devem ser escolhidos apenas porque possuem muitas linhas. Eles exigem contratos específicos, testes de browser e validação de performance. O tamanho é um indicador de risco, não uma ordem automática de migração.

## 7. Gatilhos de validação por onda

Cada página ou módulo migrado deve manter o seguinte ciclo: implementação canônica `.ts`, wrapper `.js`, declarações mínimas para dependências ainda JS, inclusão incremental no `tsconfig.json`, typecheck estrito, testes comportamentais, build Vite, integração V2, smoke de 98 rotas e caminho crítico de 15 afirmações.[1] O `tipos:v2` deve continuar sendo acompanhado separadamente, porque sua dívida pertence ao portão JS/JSDoc da V2 e não deve ser escondida dentro da migração de páginas.

| Validação | Obrigatória quando |
| --- | --- |
| `npm run tipos:ts` | Toda onda TypeScript |
| `npm test` | Toda onda que toca Core, páginas ou dados usados em testes |
| `npm run build` | Toda onda |
| `CHROME_PATH=/usr/bin/chromium npm run smoke` | Toda onda de página, router ou layout |
| `CHROME_PATH=/usr/bin/chromium node scripts/caminho-critico.mjs` | Toda onda que toca Home, Core, Router, Storage, Editor ou Terminal |
| `CHROME_PATH=/usr/bin/chromium node scripts/v2-integracao.mjs` | Toda onda que toca V2, boot, registry, permissões ou adapters |
| `npm run tipos:v2` | Toda onda V2; registrar a contagem, mesmo quando histórica |
| Testes de domínio específicos | Toda onda de Auth, Supabase, Arma 3, mídia, IA ou motores especializados |

## 8. Referências

[1]: ./TYPESCRIPT_MIGRATION.md "Histórico das ondas TypeScript, gates e contratos publicados"
[2]: ../../v2/jsconfig.json "Portão de checkJs estrito da V2"
[3]: ../../src/main.js "Registro de rotas, boot e divisão eager/lazy"
[4]: ../../relatorios/smoke-rotas.md "Smoke atual das 98 rotas"
[5]: ./MAIN_ERROR_AUDIT.md "Auditoria anterior de causas raiz e efeitos cascata"
