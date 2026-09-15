# V2 — Registro de construção

Este arquivo é um retrato de implementação, não substitui o Master Plan, Rules ou
Decision Log. Serve para uma sessão nova descobrir rapidamente o que já existe.

## Fundação operacional

- [x] Manifest validation
- [x] Module Registry
- [x] Permission System
- [x] Module lifecycle (`init → start`, `stop → dispose`)
- [x] Runtime Rust
- [x] Runtime capabilities
- [x] Runtime filesystem confinement
- [x] Runtime envelope v1
- [x] Runtime Host por módulo
- [x] Runtime Bridge
- [x] Runtime bootstrap
- [x] Transport abstraction
- [x] Health / readiness
- [x] Supervisor global
- [x] Per-module lifecycle status
- [x] Operational platform facade

## Portão de integração (`npm run v2:integracao`) — 15/15

- [x] roda no Windows
- [x] espera por condição, não por relógio

Duas correções, ambas no `scripts/v2-integracao.mjs`; nenhuma no módulo.

**Nunca tinha rodado no Windows.** `spawn('npx', …)` morre em `ENOENT` — o Node
24 recusa spawnar `.cmd` (CVE-2024-27980), e `npx` é `npx.cmd`. Morria antes da
primeira asserção: 0/14, não 13/14. Chamamos o bin do vite com o próprio Node.

**O `13/14` era do relógio, não do briefing.** O portão dormia um tempo fixo
(900 ms) antes de ler a tela. A view do `briefing` é a única importada sob
demanda com esse orçamento — onde a primeira transformação do Vite passa disso,
o portão reprova um módulo correto, e a mensagem mostra a tela *anterior*
(`Lab de Criptografia`), que parece defeito de render. Sleep fixo mede a
máquina, não o sistema.

Medido, com a view atrasada 2 s de propósito: relógio → `13/14`, condição →
`14/14`. E com `view` devolvendo o **módulo** (o defeito de
[`V2_MODULE_RULES.md`](./V2_MODULE_RULES.md)), a condição ainda reprova —
`view não é um nó: object`. Só o falso vermelho saiu; o verdadeiro ficou.

> A hipótese herdada era "view devolve o ELEMENTO". Ela está descartada: o
> `loadView` do `briefing` devolve o elemento desde o commit que o criou
> (`446a272e`), e a asserção do portão está certa — não foi afrouxada.

## Portão de tipos (`npm run tipos:v2`) — 0 erros

- [x] 61 → 0, sem afrouxar `strict`, `checkJs` ou `noImplicitAny`
- [x] o `V2 integration` do CI saiu do `skipped` e **passa**

Estava vermelho havia dias em três branches sem ninguém ver: os últimos commits
do `main` eram do bot de câmbio, e push de bot não dispara workflow. E como no
`v2-validation.yml` os passos são sequenciais, o typecheck vermelho deixava o
`V2 integration` `skipped` — o portão acima existia, mas **não era exercitado**.

Consertá-lo revelou mais duas camadas atrás dele: os dois geradores de catálogo
não enxergavam TypeScript (varriam só `.js` e liam o shim de re-export), e o
workflow nunca instalava o Chromium do Playwright.

## A fachada dirige o entrypoint, e a cadeia inteira tem contrato

- [x] a Plataforma sobe o sistema — supervisor, saúde e lifecycle em runtime
- [x] `Manifest → Registry → Permission → Runtime` testado com as peças **reais**

O `criarPlataforma` existia, tinha teste e não era usado por ninguém: o único
consumidor era o próprio teste. O `v2/harness/main.js` dirigia o `boot` na mão.
As três peças estavam prontas *em isolamento*; nada as compunha em execução
real, então "a fundação está de pé" era verdade em teste e hipótese em campo.

Medido depois de integrar: `partida.estado` = `ready`, supervisor em `ready`,
lifecycle com 4/4 `running` e 0 `failed`, e o portão em **14/14** — não 13/14,
porque a falha do briefing que a sessão anterior reportou como pré-existente era
justamente o falso vermelho que o `navegarAte` já tinha corrigido.

> A metade daquele commit que mexia no `scripts/v2-integracao.mjs` foi
> **descartada**: o `main` já tinha a correção do `npx` *e* estava à frente.
> Trazer o commit inteiro teria reintroduzido os sleeps fixos. Commit antigo é
> matéria-prima, não pacote — confira contra o `main` antes de aplicar inteiro.

O contract test cobre a costura que nenhum teste de unidade alcança, com as
quatro peças reais — o `contract-slice.test.js` faz o mesmo percurso com registro
e decisor falsos, e mock prova o mock (Regra 7).

**Um mutante sobreviveu na primeira rodada.** Removida a poda do
`conhecerModulos`, o teste seguia verde: o `avaliar()` barra por
"não-declarada" mesmo com a concessão ainda guardada. Duas defesas, a primeira
cobrindo a segunda — Regra 1 outra vez. Quem enxerga a poda sozinha é o estado
persistido: sem ela, `exportar()` mantém a permissão e o `importar()` do próximo
arranque a ressuscita sob um manifesto que não a declara mais.

## O ciclo passa pelo Runtime Host antes do `init`

- [x] `running` exige autorização aberta — quem não abre não chega ao `init`
- [x] a ordem do contrato (`open → init → start`, `stop → close → dispose`) é executada
- [x] o entrypoint injeta um Host real; o portão cobra que ele foi consultado

Terceira vez o mesmo padrão, e vale nomear: **peça pronta, testada e desligada.**
Primeiro o `criarPlataforma`, depois o contract test, agora o
`criarLifecycleRuntime` — o Host por módulo. Ele existia, tinha teste próprio, e
a busca textual pelos importadores achou **um** consumidor de produção
(`vertical-slice.js`), que não é o caminho por onde os módulos sobem. O
`ciclo.ts` ia direto ao `init`.

O efeito era um módulo declarado `running` cuja autorização nunca tinha sido
pedida uma única vez. O `V2_LIFECYCLE_RUNTIME_CONTRACT.md` descrevia a ordem
certa desde sempre; ninguém a executava. **Contrato sem executor é intenção** — e
o retrato mentia com todas as luzes verdes, porque peça correta e desligada dá
exatamente o mesmo diagnóstico que peça ligada.

O teto do `init` foi extraído (`comTeto`) e passou a valer para a abertura: um
Runtime que não responde pendura a subida do mesmo jeito que um `init` que trava,
e esse caminho novo não passava por teto nenhum.

**Oito mutantes plantados, oito mortos** — incluindo o mutante que É a doença
original (remover a chamada ao Host: 8 dos 12 testes caem). O portão foi de
14 para **15/15**, e a asserção nova é a única que enxerga o defeito: plantando-o
no entrypoint, as outras 14 seguem verdes e ela devolve `[]`.

> **Grant vazio é autorização disponível.** `militar` declara `NETWORK`, não
> recebe nada e continua subindo — como antes. Tratar "sem permissão concedida"
> como "sem autorização" derrubaria um módulo correto e transformaria
> deny-by-default em deny-tudo. A distinção quase virou defeito ao desenhar isto.

O `--strictPort` entrou no portão junto: sem ele o Vite troca de porta em
silêncio quando a escolhida está ocupada, e o portão mede um servidor zumbi.

## Próximo bloco

- [x] integrar a fachada ao entrypoint oficial da V2
- [x] contract test completo Manifest → Registry → Permission → Runtime
- [x] lifecycle + Runtime Host: módulo só fica `running` quando sua autorização estiver disponível
- [x] observabilidade de transições `starting/running/stopping`
- [x] transporte concreto depois do contrato estabilizado
      — o portão E2E (`scripts/v2-runtime-smoke.mjs`) **usa** o
      `criarRuntimeStdio` em vez de reimplementar o protocolo, e fala com o
      binário Rust de verdade. Antes havia duas implementações do mesmo
      protocolo, e a única que tocava o binário passava por fora do transporte —
      por isso ele não tinha consumidor, e por isso o E2E ficava verde sem provar
      nada sobre ele. Medido no Windows: `cargo test` 12+3, smoke OK pelo
      transporte, 12/12 no transporte, 9/9 mutantes.
      A ponte do app desktop entrou junto (`desktop/src/runtime.js` + canais
      `runtime:*` no `ipc.js` + empacotamento por `extraResources` + build do
      Rust no `desktop-release.yml`): **8/8**, com ponta a ponta atravessando
      ponte → transporte ESM → processo Rust. O smoke empacotado da alpha.18
      fecha o caminho `process.resourcesPath` no artefato Linux `linux-unpacked`:
      binário e transporte foram encontrados dentro de `resources/`, a leitura
      confinada passou e `../` foi recusado. O teste roda em diretório temporário
      com `--publish never`; Windows/macOS físicos, assinatura, instalador final
      e auto-update continuam fora deste aceite.
      Ver [`V2_RUNTIME_STDIO.md`](./V2_RUNTIME_STDIO.md) e
      [`V2_PACKAGED_RUNTIME_CONTRACT_2026-08-26.md`](./V2_PACKAGED_RUNTIME_CONTRACT_2026-08-26.md).
- [x] primeiro vertical slice de módulo nativo
      — a cadeia do [`V2_VERTICAL_SLICE.md`](./V2_VERTICAL_SLICE.md) percorrida
      com o Runtime **real** (`test/v2/slice-nativo.test.js`, 5/5): Registry →
      autorização pelo **processo Rust** → sessão → init → start → running → stop
      → dispose → close, com Registry, Permission System, ciclo, transporte e
      binário reais. Antes o Runtime era sempre espião ou duplo, e "só fica
      `running` com sessão aberta" valia sobre um Runtime que nunca existira.
      O `ModuleContext` ganhou `ctx.runtime.lerArquivo(caminho)` — a alça recebe
      *caminho, e só*, com o id do módulo fechado por closure; é isso que impede
      um módulo de nomear a raiz de outro. O `init` de `alpha` lê o próprio
      arquivo e o **Rust** recusa o `../`.
      A injeção em produção entrou junto: `v2/core/runtime-app.js` adapta
      `window.baluarte.invoke` à forma do contexto, e o entrypoint o injeta em
      `deps.runtime`. Fora do app devolve `null`, então o contexto na web fica
      idêntico ao de antes — `v2:integracao` segue **15/15**.
      O aceite empacotado da alpha.18 foi executado pelo workflow remoto
      `V2 Desktop Packaged Runtime` no SHA final `ca325d03`; o sandbox local
      não possui Cargo e mantém o mesmo caso como bloqueio ambiental honesto.

## Regra de manutenção

Uma caixa só vira `[x]` quando existe código e teste correspondente. Documentar
uma intenção não conta como implementação.


## Checkpoint publicado no código — Runtime desktop empacotado / alpha.18

A PR #510 integrou o comando `npm run v2:desktop-packaged` e o workflow `V2 Desktop Packaged Runtime` no SHA `ca325d03`. O workflow remoto passou no PR e novamente após o merge: compilou o Runtime Rust em release, empacotou o Electron com `desktop/package.json`, executou `linux-unpacked` sob Xvfb e confirmou o uso de `process.resourcesPath`, autorização, leitura confinada e recusa de `../`.

Os gates de regressão permaneceram verdes: suíte `1385` aprovados, `6` ignorados e zero falhas; integração V2, build, smoke `99/99`, caminho crítico `15/15`, offline `9/9`, memória, Security Contracts `73/73`, Project Registry e Module Mode Policy. O Doctor ficou em `16` green, `2` blocked-known, `1` unknown, `5` not-run e `0` failed, com exit `2` honesto. O smoke empacotado não foi concluído no sandbox porque `cargo` não está instalado; o bloqueio ambiental não foi mascarado.

Este checkpoint não fecha aceite físico multiplataforma, assinatura, auto-update, persistência, Auth/RLS ou Runtime como autoridade de produção. O contrato está em [`V2_PACKAGED_RUNTIME_CONTRACT_2026-08-26.md`](./V2_PACKAGED_RUNTIME_CONTRACT_2026-08-26.md) e a auditoria em [`V2_PACKAGED_RUNTIME_AUDIT_2026-08-26.md`](./V2_PACKAGED_RUNTIME_AUDIT_2026-08-26.md).


## Checkpoint integrado — Module Registry Health observável / alpha.19 com release pendente

O comando `npm run check:module-registry-health` agora exerce a implementação canônica de `criarModuleRegistryHealth` com uma fixture local bounded. São seis casos determinísticos: módulo desconhecido permanece `unregistered` e não ativável; módulo registrado pode ativar; módulo saudável permanece observável; falha isolada degrada; falhas excedentes colocam somente o módulo em `quarantined`; manutenção autorizada exige decisão auditada; negação server-side preserva o modo registrado; e o retrato retornado não permite alterar o estado interno por mutação do array devolvido.

O Doctor agora observa esse comando como `module_registry_health`, categoria `security-local` e política `safe`. O check não inicia, para, reinicia ou concede permissões a módulos reais; não consulta rede, armazenamento, Auth, RLS, Supabase ou fonte externa. A saída observada foi `6` casos, `3` allow, `3` deny, `1` entrada de auditoria, `3` incidentes e `network: not-used`.

Gates locais do slice: focal Health/Plataforma/Doctor `32/32`; suíte completa `1386` aprovados, `6` ignorados e zero falhas; integração V2 `58/58`; build; smoke `99/99`; caminho crítico `15/15`; offline `9/9`; memória; Security Contracts `73/73`; e Doctor `17` green, `2` blocked-known, `1` unknown, `5` not-run, `0` failed com exit `2` honesto pelo Cargo ausente. O candidato de Project Registry permanece `not-audited/defer`: buscas read-only não encontraram fonte oficial inequívoca com identidade e licença suficientes, portanto nenhum projeto externo foi promovido.

A implementação técnica deste checkpoint está integrada na `main` pelo SHA `17d1accdd036382b166ef430bc4b696f36436fec`; a documentação final e a tag/release ainda dependem de PR separada e dos gates correspondentes. O marco não fecha health remoto, restart real, RLS, tenancy, ownership, retenção operacional, Auth, billing, fontes externas, autoridade server-side de produção, Windows/macOS, assinatura ou auto-update.


## Checkpoint integrado — Platform Diagnostic com Task Manager Health / alpha.20 técnica — 0365f7f

A PR #519 integrou uma projeção opcional e somente leitura da saúde do escalonador local na fachada `criarPlataforma()`. `PlatformOptions.trabalho` aceita somente `saude()`, `PlatformDiagnostic.trabalho` retorna `SaudeEscalonador` quando a dependência é fornecida e retorna `null` sem ela. Uma dependência sem `saude()` é recusada no construtor. A Plataforma não reimplementa o Task Manager, não inicia ou cancela tarefas e não cria política de retry, threshold ou unhealthy.

A implementação técnica foi preparada no commit `dbfe5156b7c797390956aaf365e87010b25529af`, publicada na PR [#519](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/519) e squash-merged na `main` no SHA `0365f7fa451de20784c9eb745df853b363c7aeab`. O Vercel inicialmente ficou pending por rate limit e depois concluiu com sucesso; a PR só foi marcada ready após `CLEAN`/`MERGEABLE`. O backup remoto `backup/2026-08-27-before-v2-platform-task-diagnostic` preserva o SHA técnico.

Gates locais: focal Plataforma `7/7`; `tipos:ts`; `tipos:v2`; suíte `1388` aprovados, `6` skipped e `0` falhas; build; integração V2 `58/58`; smoke; caminho crítico `15/15`; offline `9/9`; memória; Security Contracts `73/73`. O Doctor terminou com `17` green, `2` blocked-known, `1` unknown, `5` not-run e `0` failed, com exit `2` honesto pelo Cargo ausente. Os oito workflows pós-merge do SHA `0365f7f` terminaram verdes.

Este checkpoint melhora a observabilidade local da Plataforma, mas não fecha retry do Event Bus/Task Manager, persistência, dashboards, incidentes operacionais duráveis, Auth, RLS, tenancy, ownership, billing, Knowledge Mesh, Risk Engine, OpenClaw, Hermes, aceitação física desktop/mobile, estabilização, RC ou V2 estável. A V1, router, shell, sidebar, wrappers, Service Worker e branches concorrentes foram preservados.


## Checkpoint documental final — alpha.20 após PR #521

A nota `docs/releases/v2.0.0-alpha.20.md`, o `MASTER_EXECUTION_MATRIX`, o `PHASE_STATUS_MATRIX` e o changelog foram integrados pela PR [#520](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/520) no SHA `fc90959a4186060a296d6632efb45ef9d20d1609`. A finalização de rastreabilidade foi integrada pela PR [#521](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/521) no SHA `1b7ce92fc5a0dff0e11bf362a470c14b6663f108`; os sete workflows pós-merge da finalização terminaram verdes.

A tag anotada `v2.0.0-alpha.20` aponta para o SHA final documental `f0a11e33a7163746c5d2087762c68a654e1a6dcb`, foi verificada com `refs/tags/v2.0.0-alpha.20^{}` e a prerelease foi publicada em [v2.0.0-alpha.20](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/releases/tag/v2.0.0-alpha.20). A alpha.20 permanece um marco bounded; sua publicação não fecha a V2.

## Checkpoint integrado — Runtime Restart Single-Flight / alpha.21 candidata — `25cbc9f3`

Após a alpha.20, as PRs [#517](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/517) e [#518](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/518) foram sincronizadas contra a `main` atual, passaram pelos gates e foram squash-merged nos SHAs `f62ece73eae089f0a42478f7ee2ef36b5cd2fcd3` e `9ca947816378180b41d2fe2939e9e5b96ff796bd`. A PR #517 corrige a ordem de encerramento `stop → Runtime.close → dispose`; a #518 preserva metadados autorizados do envelope através de `ctx.bus.emit`.

A PR [#523](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/523) adicionou single-flight bounded ao `criarRuntimeRestart()`: chamadas concorrentes do mesmo módulo compartilham a mesma promessa, evitando sequências simultâneas de `stop → sleep → start`, sem alterar o orçamento/backoff, o contrato de injeção do `RuntimeManager` ou qualquer superfície V1. O contrato está em [`RUNTIME_RESTART_SINGLE_FLIGHT_CONTRACT_2026-08-27.md`](./RUNTIME_RESTART_SINGLE_FLIGHT_CONTRACT_2026-08-27.md).

A slice passou localmente em focal `3/3`, `npm test` `1397` testes com `1391` pass, `6` skipped e `0` fail, `tipos:ts`, `tipos:v2`, build, integração `58/58`, smoke, caminho crítico, offline, memória e Security Contracts `73/73`. O Doctor terminou com exit `2` honesto por Cargo ausente, sem falhas mascaradas. A PR teve `11` checks verdes, `1` skipped por política e Vercel success; os oito workflows pós-merge do SHA `25cbc9f3` terminaram verdes, com a V2 Validation concluída na tentativa 2 após o job Rust original expirar no Checkout.

O marco melhora a serialização in-memory do restart, mas não adiciona restart automático, locks distribuídos, persistência, retry remoto, supervisão de dependências ou autoridade operacional. A próxima tag/release, se aprovada após documentação final e gates correspondentes, será uma prerelease separada; nenhuma alpha.21 é declarada neste checkpoint. Rollback: `git revert` normal do squash merge da #523; a backup `backup/2026-08-27-before-v2-runtime-restart-single-flight` aponta para o baseline real `9ca94781` anterior à PR.


## Checkpoint integrado — Auth Identity Claims Boundary / 2026-08-27

A PR [#528](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/528) foi squash-merged na `main` no SHA `09fff078fdf0912aee9f289919aaddd2127280de`, após backup real de `main` em `backup/2026-08-27-before-v2-auth-identity-claims-boundary` apontando ao baseline `006aa4c9f7f4d0bb550d1961c98d2841fdba205c`. O commit exige que a projeção local de identidade consuma `issuerMatched` e `audienceMatched`, além de fonte confiável, autenticação, sujeito presente e frescor. Issuer ou audience incompatíveis continuam `disabled`, com `claims-untrusted` e sem promoção pública.

A slice adicionou regressões para issuer/audience incompatíveis e asserções diretas do contrato do observador. Gates locais passaram: focal Auth Identity + Server Claims `13/13`; `tipos:ts`; `tipos:v2`; suíte, build, integração, smoke, caminho crítico, offline, memória e Security Contracts com exit 0. O Doctor terminou com exit 2 honesto: `17 green`, `2 blocked-known`, `1 unknown`, `5 not-run`, `0 failed`. Os nove workflows pós-merge do SHA `09fff078` terminaram verdes, incluindo V2 Core, V2 Runtime, Security Contracts, CodeQL, Core CI, CI, Arma 3 Data CI e Vigia das rotas.

Este checkpoint melhora a fronteira local deny-by-default, mas não é autenticação de produção. Não fecha login real, validação de assinatura, sessão Supabase, RLS, tenancy, persistência, autoridade server-side, billing ou qualquer integração externa. Rollback: `git revert` normal do squash merge; não usar reset ou force-push. A V2 permanece `IN PROGRESS`.
