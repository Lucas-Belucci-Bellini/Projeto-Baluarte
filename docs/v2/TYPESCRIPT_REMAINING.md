# JavaScript restante e roadmap de migração para TypeScript

**Base de trabalho:** `main` publicada em `07d815b83f308605a1f7baf0371088f7a5a4ab09`, com Identidade Preview integrada
**Status:** INVENTÁRIO ATUALIZADO — as páginas canônicas, incluindo `login.ts` da Identidade Preview, foram implementadas; **nenhuma continua canônica em JavaScript** (ver §0). O gate `tipos:v2` está verde após a fronteira Three.js do visor3d e a validação de Auth foi adicionada à suíte.
**Objetivo:** responder exatamente o que ainda é JavaScript canônico, o que já é apenas compatibilidade e qual é a ordem segura para continuar a migração.

> **As seções históricas abaixo preservam a fotografia anterior à conclusão das páginas.** A verificação atual do filesystem confirma **zero páginas canônicas JavaScript** em `src/pages`; o JavaScript restante está concentrado em dados, utilitários, Core V1/V2 e arquivos de configuração, que seguem um roadmap separado.

> **Conclusão executiva:** ainda há muito JavaScript no repositório, mas ele não representa um único bloco de trabalho. O próximo passo não deve ser converter todos os arquivos de uma vez. O caminho correto é continuar por contratos: páginas pequenas e de baixo risco, depois dados com declarações estruturais, depois Core/integrations e, em paralelo controlado, os contratos V2 que concentram os 61 erros atuais.

## 0. As 5 últimas páginas — ✅ CONCLUÍDO em 18/08/2026

**Não há mais página canônica em JavaScript.** O comando de verificação do
[`docs/PROMPT-MIGRACAO-TS.md`](../PROMPT-MIGRACAO-TS.md) imprime
`nenhuma pagina canonica em JS`: todo `.js` em `src/pages/` é wrapper de uma
linha, e são **114 implementações `.ts`** (contadas com
`globSync('src/pages/**/*.ts')`, subpastas incluídas).

| Página | Linhas | Sem tipo (antes) | Situação |
| --- | ---: | ---: | --- |
| `visao.js` | 832 | 0 | ✅ migrada (PR #455) |
| `wiki-arma3.js` | 756 | 3 | ✅ migrada (PR #456) |
| `vanguard.js` | 822 | 5 | ✅ migrada (PR #457) |
| `jarvis.js` | 999 | 5 | ✅ migrada (PR #457) |
| `arma3-tutorial.js` | 1376 | 9 | ✅ migrada (PR #457) |

### O que a migração custou de verdade: **declarações, não páginas**

A previsão deste documento estava certa — o bloqueio nunca foi a página, foram as
fontes. Ao todo, **41 arquivos de declaração** — 35 novos e 6 corrigidos
(`git diff --name-status 3998e8ff..HEAD -- '*.d.ts'`) —, e o trabalho neles foi
maior que o das cinco páginas somadas.

### O que os tipos acharam (o motivo de a migração existir)

Nenhum destes é erro de anotação: são defeitos que estavam no ar.

- **`A3ColInfo` era `any` em silêncio.** `wiki-arma3.d.ts` importava o tipo de
  `arma3-colecao.js`, que **não tinha `.d.ts`**. Sob `skipLibCheck`, import
  quebrado não vira erro — vira `any`. `const x: number = A3COL_INFO.nome`
  passava.
- **`replaceChildren(…, null)` renderiza a palavra `"null"` na tela.** Medido no
  Chromium: `d.replaceChildren(p, null, null)` → `"<p>ALGO</p>nullnull"`.
  Diferente do `h()`, que descarta filho nulo.
- **Quatro `carregar*()` devolvem o envelope, não o array** — declarar array teria
  posto um `.filter is not a function` esperando quem os usasse.
- **Seis exportações invisíveis**: `processNewsBriefing`, `healthCheckServer`,
  `isWebGPUAvailable`, `preloadWebLLM`, `HERMES_AGENT_DEFAULT` e
  `HERMES_LOCAL_DEFAULT_URL` existiam no `.js` e faltavam no `.d.ts`. Mais
  `Arma3Preset.id`, do qual a `/arma3-tutorial` inteira depende.
- **Duas assinaturas mentindo**: `getBaluarteBriefing()` declarada sem o
  `{ compact }` que recebe, e `WebLLMCallbacks.onProgress` com um parâmetro
  quando a implementação chama com dois (texto **e** fração — a barra de
  progresso usa a fração).
- **`MapLibreNamespace` não declarava `Marker`**, usado pelo mapa tático do
  `/vanguard` desde que ele existe.
- Comparações sobre campo opcional (`variantes > 1`, `fov.modos > 1`) que em
  JavaScript devolvem `false` calado, e subtração de `boolean` (`a.ehMod - b.ehMod`).

> **O padrão foi mantido, e é medido:** das **114** páginas em TypeScript,
> **nenhuma usa `any`** — zero ocorrências de `: any` ou `as any` em
> `src/pages/*.ts`. Página migrada com `any` passa no portão e não conserta
> defeito nenhum; é tipo decorativo, o oposto do motivo de a migração existir.

### Como cada página foi verificada

`tipos:ts` 0 · `tipos:v2` 0 · suíte **960/960** · `smoke` 98/98 rotas verdes · `v2:integracao` **19/19** · `caminho-critico` **15/15** · build verde com o aviso histórico de chunks grandes. E o portão foi confirmado **vendo** cada arquivo novo: com um defeito
plantado no `.ts`, o `tipos:ts` fica vermelho e volta a verde quando ele sai —
peça pronta e desligada daria o mesmo retrato verde que peça ligada.

Onde dava para comparar, o smoke mostrou o **mesmo** tamanho de render antes e
depois (`/vanguard` 12.141 caracteres e 659 nós; `/jarvis` 913 e 47), que é a
evidência de que o comportamento não mudou — não só de que a rota abre.

## 1. Fotografia atual

A contagem foi feita diretamente no workspace após a conclusão das cinco últimas páginas e a correção do visor3d. Os arquivos `.d.ts` foram separados das implementações TypeScript, porque uma declaração de fronteira não significa que a implementação JavaScript já tenha sido convertida. Em `src` e `v2` existem **213 módulos JavaScript canônicos restantes** depois de retirar 142 wrappers; `vite.config.js` continua sendo uma configuração opcional fora do domínio da aplicação.

| Área | JavaScript total | JavaScript canônico restante | TypeScript de implementação | `.d.ts` de fronteira |
| --- | ---: | ---: | ---: | ---: |
| `src/core` | 17 | 14 | 6 | 8 |
| `src/layout` | 5 | 3 | 4 | 1 |
| `src/pages` | 114 | 0 | 114 | 8 |
| `src/data` | 59 | 59 | 0 | 57 |
| `src/utils` | 98 | 79 | 28 | 88 |
| `v2/core` | 48 | 44 | 4 | 6 |
| `v2/modules` | 11 | 11 | 0 | 1 |
| `v2/harness` | 1 | 1 | 0 | 0 |
| `src/nexus` | 1 | 1 | 0 | 0 |
| `src/main.js` | 1 | 1 | 0 | 0 |
| `src/styles.d.ts` | 0 | 0 | 0 | 1 |
| `vite.config.js` | 1 | Opcional | 0 | 0 |
| **Total** | **355** | **213** | **156** | **171** |

A soma de `src` e `v2` também pode ser lida de forma mais simples: existem **299 arquivos JS em `src`**, **56 em `v2`**, **142 wrappers de compatibilidade** e **156 implementações TypeScript canônicas**. As implementações já migradas cobrem o Core V1, Layout, **114 páginas**, adaptadores visuais/integrações, os contratos J1, a Central de Música, os painéis de mídia/IDE e o Core V2 tipado; os wrappers permanecem para preservar os imports legados.

## 2. O que já não precisa ser convertido agora

Cento e quarenta e dois arquivos JavaScript são wrappers de compatibilidade que reexportam uma implementação TypeScript. Eles continuam no repositório de propósito, porque páginas e testes legados ainda importam os caminhos `.js`.

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
| `src/pages/dossie.js` | `src/pages/dossie.ts` |
| `v2/core/boot.js` | `v2/core/boot.ts` |
| `v2/core/ciclo.js` | `v2/core/ciclo.ts` |
| `v2/core/plataforma.js` | `v2/core/plataforma.ts` |
| `v2/core/registry.js` | `v2/core/registry.ts` |

Esses wrappers **não são dívida de conversão funcional**. Removê-los agora quebraria consumidores V1, testes ou imports que ainda usam a extensão `.js`. A remoção só deve acontecer quando o grafo de consumidores tiver sido migrado e o build, o smoke e o caminho crítico comprovarem que nenhum caminho legado depende deles.

## 3. JavaScript canônico que ainda falta

### 3.1 Páginas — maior volume, mas não todo o maior risco

Não existem mais módulos de páginas em JavaScript canônico: o inventário operacional registra **0**. A migração deve ser feita por risco, não apenas por tamanho; Dossiê, Simbolos, Gerar Código, Git Helper, Dólar, Biblioteca, Academia, CiberSeg, Robotica, Regex, Tabela-Verdade, Calculadora Científica, Jogos, QR Studio, Calculadora Numérica, Logic Sim, Editor, Conselho, TV, Filmes, Memes, Mini-LLM, Memória, Cockpit Nexus, Central de Vídeos, Media Hub, painel de Extração Arma 3, Segundo Cérebro, Dashboard JARVIS, Git Nexus, Núcleo Mark XIII, JARVIS Vision, Modelos 3D, Mapa Tático, Radar, Rádio e Musicas já saíram desta contagem.

| Grupo | Exemplos | Estado | Risco |
| --- | --- | --- | --- |
| Ondas concluídas | `dossie.ts`, `simbolos.ts`, `gerar-codigo.ts`, `git-helper.ts`, `dolar.ts`, `biblioteca.ts`, `academia.ts`, `ciberseg.ts`, `robotica.ts` + wrappers | Migrado até esta onda | Baixo a médio |
| Próxima onda segura | `wiki-arma3.js` e contratos de dados/ícones | Ainda JS canônico | Alto |
| Conteúdo estático militar | ondas militares já convertidas | Migrado | Baixo |
| Hubs e catálogos médios | nenhum canônico restante; Musicas concluída | Migrado | Médio a alto |
| Ferramentas interativas | contratos de Nexus, Arma 3 e visão | Reservado para ondas próprias | Alto |
| IA, Nexus e memória | `jarvis.js` | Ainda JS canônico | Alto |
| Arma 3 e 3D | `wiki-arma3.js`, `arma3-tutorial.js`, `vanguard.js`, `visao.js` | Ainda JS canônico | Alto |
| Mídia, música e DSP | páginas concluídas; motores JS permanecem atrás de contratos | Página migrada | Alto |

As maiores páginas restantes são `arma3-tutorial.js` com 1.375 linhas, `jarvis.js` com 977, `visao.js` com 831, `vanguard.js` com 821 e `wiki-arma3.js` com 755 linhas. Elas **não devem** ser as próximas, porque cada uma arrasta muitos contratos de dados, APIs do navegador ou integrações pesadas.

### 3.2 Dados — 59 módulos JavaScript, mas a conversão comportamental não é obrigatória em todos

Os módulos de dados somam aproximadamente **21.138 linhas**. A maioria é catálogo estático, e não lógica de aplicação. Portanto, existem duas estratégias válidas:

| Estratégia | Quando usar | Resultado |
| --- | --- | --- |
| Declaração `.d.ts` primeiro | Quando uma página precisa de tipos, mas o catálogo é grande ou estável | A página migra sem duplicar milhares de linhas de dados |
| Conversão para `.ts` | Quando o módulo possui funções, derivação, busca, normalização ou invariantes importantes | Dados e regras passam a ter tipos executáveis e testes próprios |
| Permanecer JS/JSON | Para conteúdo grande, gerado ou pouco comportamental | Não é falha arquitetural se a fronteira de consumo estiver tipada |

Já existem declarações para `arsenal`, `cronicas`, `elites`, `spline-scenes`, `universos` e `version`. Ainda faltam contratos explícitos para a maioria dos catálogos.

Os maiores módulos de dados são `arma3-colecao.js` com 4.057 linhas, `arma3-municao.js` com 1.936, `arma3-presets.js` com 1.464, `arma3-soldados.js` com 971, `arma3-veiculos.js` com 905, `terminal-commands.js` com 845, `arma3-tutoriais.js` com 834 e `wiki-arma3.js` com 646. Eles devem receber contratos e testes de esquema antes de uma conversão integral.

### 3.3 Utilitários — 98 módulos JavaScript no total, 71 canônicos restantes

Os utilitários ainda concentram 71 módulos JavaScript canônicos, embora 28 implementações TypeScript e 65 declarações de fronteira já tenham sido publicadas. A lógica restante deve avançar por contratos, especialmente em integrações, motores de mídia/3D e núcleo IA/Nexus.

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

A próxima execução segura é `wiki-arma3.js`, aproveitando os ícones já versionados em `public/arma3/` e os contratos de dados da Enciclopédia Militar. JARVIS, Editor, Arma 3 e WebGL continuam reservados às ondas próprias e aos contratos específicos documentados.

## 6. O que não deve ser feito

Não se deve transformar os 203 arquivos JavaScript canônicos restantes em TypeScript num único commit. Isso misturaria páginas, dados estáticos, motores gráficos, Auth, Supabase, V2 e bootstrap, tornando impossível diferenciar regressão local de efeito cascata.

Também não se deve remover os 149 wrappers `.js`, incluir todo o `v2/core` no `tsconfig.json` raiz, silenciar os 61 erros com `any`, `@ts-ignore`, `@ts-nocheck` ou relaxamento de `strict`, nem corrigir o Supabase Preview criando ou apagando migrações sem obter o catálogo remoto oficial.

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

## Fotografia corrente — Onda 4.52 de Identidade Preview

A integração da branch `v2/identity-login` foi reaplicada sobre a main atual. O inventário determinístico confirmou **0 páginas canônicas JavaScript** e a nova rota elevou o smoke para **99 rotas verdes**. Os números abaixo distinguem arquivos físicos de unidades agregadas do relatório:

| Indicador | Estado corrente |
|---|---:|
| Páginas canônicas JS restantes | **0** |
| Arquivos físicos `.js` em `src/pages/` | 100, incluindo wrappers |
| Arquivos físicos `.ts` em `src/pages/` | 108 |
| Implementações `.ts` em `src/` | 153 |
| Contratos `.d.ts` em `src/` | 164 |
| Testes | **965/965** |
| Smoke | **99/99** |
| Integração V2 | **19/19** |
| Caminho crítico | **15/15** |
| Offline | **9/9** |

A diferença entre os arquivos físicos e o relatório agregado é intencional: o inventário operacional conta unidades canônicas, wrappers e fronteiras por escopo; a contagem física também inclui arquivos auxiliares e submódulos. `login.js` permanece como compatibilidade e `login.ts` é a implementação canônica.

O próximo bloqueador de release é validar a configuração real de Supabase Auth/RLS e redirects permitidos em ambiente remoto; essa evidência ainda não está disponível neste ciclo. A UI não autoriza `developer`, `admin` ou `owner`; essas decisões devem continuar server-side. A conversão do login não autoriza, por si só, a declaração de `1.1.0`.
