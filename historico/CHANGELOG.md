# 📜 Histórico de Alterações — Projeto Baluarte

Registro do que entra no `main`. Fluxo de segurança: **antes de cada merge** é
criada uma branch de backup (`backup/AAAA-MM-DD-...`); **depois** registra-se
aqui o que mudou.

---

## 2026-08-22 — Release `1.3.2`: auditoria estrutural local Evidence publicada

A release `1.3.2` adiciona ao módulo V2 Evidence uma projeção `auditPreview(options?)` local, estrutural, bounded e somente leitura. Ela permite filtrar por `moduleId`, limitar a saída e observar contagens dos registros devolvidos por status, sem criar um event log operacional, sem apagar dados e sem conceder autoridade.

Cada registro projetado contém somente `id`, `moduleId`, `status` e `observedAt`; o resumo contém `returned`, contagens de `pending`, `verified`, `rejected` e `superseded`, além de `truncated`. Statement, source, URI, publisher, revision, collector, confidence, claimKey, retrievedAt, supersededBy, tokens, claims e permissões não atravessam a fronteira.

Os testes focais do contrato passaram `11/11`; a integração browser passou `51/51`; o runner oficial passou os gates de código aplicáveis, mantendo Rust local como `blocked-known` código 101 por incompatibilidade de toolchain. O commit funcional `dbd09f52` e o commit de versionamento `5d2142d7` foram publicados diretamente na `main`, com CI remota aplicável verde.

**Status:** publicada com as tags `v1.3.2` e `desktop-v1.3.2`. A CI remota do commit de versionamento passou em 8/8 workflows; o Desktop Release `32595313050` terminou verde em Windows, macOS ARM64 e Ubuntu. A release pública não é draft nem prerelease e possui oito assets verificados.

**Assets verificados HTTP 200:** `Baluarte-Launcher-Setup-1.3.2.exe` (644.015.829 bytes), `Baluarte-Launcher-1.3.2.AppImage` (773.768.687 bytes), `Baluarte-Launcher-1.3.2-arm64.dmg` (406.309.979 bytes), dois blockmaps e os manifestos `latest.yml`, `latest-linux.yml` e `latest-mac.yml`, todos declarando `version: 1.3.2`.

**Release pública:** https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/releases/tag/v1.3.2

**Documentação:** [`docs/releases/v1.3.2.md`](../docs/releases/v1.3.2.md), [`docs/v2/EVIDENCE_AUDIT_PREVIEW_CONTRACT_2026-08-22.md`](../docs/v2/EVIDENCE_AUDIT_PREVIEW_CONTRACT_2026-08-22.md) e [`docs/v2/PHASE_02_EVIDENCE_SLICE.md`](../docs/v2/PHASE_02_EVIDENCE_SLICE.md).

---

## 2026-08-22 — Release `1.3.1`: preview local de retenção Evidence publicada

A release `1.3.1` adiciona ao módulo V2 Evidence uma projeção `retentionPreview(options)` local, determinística, bounded e somente leitura. Ela classifica registros pela idade relativa a uma data `now` explícita, sem apagar, alterar, verificar ou promover evidências. A saída omite conteúdo de claims, fontes, tokens e permissões.

Os testes focais do contrato passaram `9/9`; a integração browser passou `50/50`; o runner oficial corrigido para a porta padrão passou todos os gates de código, mantendo apenas Rust local como `blocked-known` código 101 por incompatibilidade de toolchain. O commit funcional `752206fb` foi publicado diretamente na `main` e a CI remota aplicável terminou verde.

**Status:** publicada no commit de versionamento `9b7343940c82c3ba487a0129b0171e38794c6567`, com as tags `v1.3.1` e `desktop-v1.3.1`. A CI remota aplicável passou em 8/8 workflows; o Desktop Release `32592402608` terminou verde em Windows, macOS ARM64 e Ubuntu. A release pública não é draft nem prerelease e possui oito assets verificados.

**Assets verificados HTTP 200:** `Baluarte-Launcher-Setup-1.3.1.exe` (644.015.682 bytes), `Baluarte-Launcher-1.3.1.AppImage` (773.768.691 bytes), `Baluarte-Launcher-1.3.1-arm64.dmg` (406.508.904 bytes), dois blockmaps e os manifestos `latest.yml`, `latest-linux.yml` e `latest-mac.yml`, todos declarando `version: 1.3.1`.

**Release pública:** https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/releases/tag/v1.3.1

**Documentação:** [`docs/releases/v1.3.1.md`](../docs/releases/v1.3.1.md), [`docs/v2/EVIDENCE_RETENTION_CONTRACT_2026-08-22.md`](../docs/v2/EVIDENCE_RETENTION_CONTRACT_2026-08-22.md) e [`docs/v2/PHASE_02_EVIDENCE_SLICE.md`](../docs/v2/PHASE_02_EVIDENCE_SLICE.md).

---

## 2026-08-22 — Release `1.3.0`: fila local de revisão Evidence publicada

A release `1.3.0` adiciona ao piloto Wiki Zomboid uma `reviewQueue(limit)` local, bounded e somente leitura. A fila considera apenas evidências `pending`, usa limite padrão 25 e máximo 100, congela a saída e retorna somente `id`, `claimKey`, `status`, `confidence`, `observedAt` e `sourceRevision`. Não há `markStatus` no Wiki, conteúdo de claim, fonte, URI, publisher, token, role ou permissão expostos.

O teste focal cobre dois registros pendentes, limite, campos omitidos, imutabilidade, argumentos inválidos, fallback sem Evidence e exclusão após `verified` usando a API do módulo Evidence apenas no teste. A integração browser passou `49/49`; o runner oficial passou os gates locais aplicáveis, com Rust `blocked-known` código 101 mantido por incompatibilidade de toolchain. O commit funcional `3f05e240` e o hardening `0ab6f428` foram publicados diretamente na `main`, com CI remota aplicável verde.

**Status:** publicada no commit de versionamento `9ae47cea549b886874a223b4adf9573cc07e1e29`, com as tags `v1.3.0` e `desktop-v1.3.0`. Os oito workflows remotos aplicáveis passaram; o Desktop Release `32588898329` terminou verde em Windows, macOS ARM64 e Ubuntu. A release pública não é draft nem prerelease.

**Assets verificados HTTP 200:** `Baluarte-Launcher-Setup-1.3.0.exe` (644.015.736 bytes), `Baluarte-Launcher-1.3.0.AppImage` (773.768.732 bytes), `Baluarte-Launcher-1.3.0-arm64.dmg` (406.515.679 bytes), dois blockmaps e os manifestos `latest.yml`, `latest-linux.yml` e `latest-mac.yml`, todos declarando `version: 1.3.0`.

**Release pública:** https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/releases/tag/v1.3.0

**Documentação:** [`docs/releases/v1.3.0.md`](../docs/releases/v1.3.0.md), [`docs/v2/WIKI_ZOMBOID_SCHEMA_PILOT_2026-08-22.md`](../docs/v2/WIKI_ZOMBOID_SCHEMA_PILOT_2026-08-22.md) e [`docs/v2/PHASE_02_EVIDENCE_SLICE.md`](../docs/v2/PHASE_02_EVIDENCE_SLICE.md).

---

## 2026-08-22 — Release `1.2.9`: observabilidade de status da Evidence publicada

A release `1.2.9` continua o piloto V2 Wiki Zomboid/Evidence com contagens bounded por status (`pending`, `verified`, `rejected` e `superseded`). A view informa somente a quantidade de registros vinculados e pendentes; não há ação de aprovação, alteração de status, exposição de statements ou autoridade client-side.

O módulo continua local/read-only, sem permissões novas, rede, scraping, persistência, Supabase, Auth, RLS, OpenClaw ou WhatsApp. O teste focal passou 4/4, a integração browser passou 48/48 e o runner oficial passou 21 gates, com Rust local 101 mantido como `blocked-known`.

**Status:** publicada no commit `55690622e3d3254da6fd7f5e7c856771d641c1a7`, com as tags `v1.2.9` e `desktop-v1.2.9`. Os oito workflows remotos do commit passaram. O Desktop Release `32586471279` terminou verde em Windows, macOS ARM64 e Ubuntu.

**Assets verificados HTTP 200:** `Baluarte-Launcher-Setup-1.2.9.exe` (644.015.671 bytes), `Baluarte-Launcher-1.2.9.AppImage` (773.768.702 bytes), `Baluarte-Launcher-1.2.9-arm64.dmg` (406.495.909 bytes), dois blockmaps e os manifestos `latest.yml`, `latest-linux.yml` e `latest-mac.yml`, todos declarando `version: 1.2.9`.

**Release pública:** https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/releases/tag/v1.2.9

**Documentação:** [`docs/releases/v1.2.9.md`](../docs/releases/v1.2.9.md) e [`docs/v2/WIKI_ZOMBOID_SCHEMA_PILOT_2026-08-22.md`](../docs/v2/WIKI_ZOMBOID_SCHEMA_PILOT_2026-08-22.md).

---

## 2026-08-22 — Release `1.2.8`: piloto Wiki Zomboid e Evidence publicada

A release `1.2.8` adiciona o piloto V2 Wiki Zomboid com schema TypeScript, catálogo local bounded e proveniência explícita. O módulo declara `references.modules: ['evidence']`, resolve Evidence por `ctx.talvez('evidence', { versao: 1 })` e mantém fallback funcional quando Evidence não está disponível.

O harness V2 passa a registrar sete módulos, 20 rotas internas e seis itens de navegação. A superfície `/wiki-zomboid` permanece local/read-only e não substitui as rotas públicas V1 `/zomboid` e `/zomboid-admin`. O slice passou teste focal `4/4`, suíte `1254/1254`, integração browser `48/48` e runner oficial com 21 gates verdes; Rust local código 101 permanece `blocked-known`.

**Status:** publicada no commit `77dbfff135c788903c7f87a6618b38063f097a59`, com as tags `v1.2.8` e `desktop-v1.2.8`. Os oito workflows remotos do commit passaram. O Desktop Release `32584486665` terminou verde em Windows, macOS ARM64 e Ubuntu.

**Assets verificados HTTP 200:** `Baluarte-Launcher-Setup-1.2.8.exe` (644.015.586 bytes), `Baluarte-Launcher-1.2.8.AppImage` (773.768.715 bytes), `Baluarte-Launcher-1.2.8-arm64.dmg` (406.549.251 bytes), dois blockmaps e os manifestos `latest.yml`, `latest-linux.yml` e `latest-mac.yml`. Os manifestos declaram `version: 1.2.8` e os SHA-512 dos instaladores.

**Release pública:** https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/releases/tag/v1.2.8

**Documentação:** [`docs/releases/v1.2.8.md`](../docs/releases/v1.2.8.md) e [`docs/v2/WIKI_ZOMBOID_SCHEMA_PILOT_2026-08-22.md`](../docs/v2/WIKI_ZOMBOID_SCHEMA_PILOT_2026-08-22.md).

---

## 2026-08-22 — Release `1.2.7`: Briefing→Evidence pelo Registry publicada

A release `1.2.7` sincroniza a versão web e do Launcher e promove o vínculo do Briefing com a Evidence Layer pelo contrato real de módulos V2: `references.modules: ['evidence']` e `ctx.talvez('evidence', { versao: 1 })`. O harness registra seis módulos ativos, Evidence continua sem rota e a navegação V1 permanece com cinco entradas.

A superfície do Briefing informa quando a Evidence local está conectada. O marco continua local/read-only: não adiciona Supabase, DDL, migrations, RLS, Auth de produção, OpenClaw, WhatsApp, publicação automática ou ações externas. A suíte anterior passou em `1250/1250`, a integração em `46/46`, smoke em `99/99`, caminho crítico em `15/15` e o runner manteve 21 gates verdes com Rust local `blocked-known` código 101.

**Status:** publicada no commit `0e200328612c64299f550363fe3440712e491806`, com as tags `v1.2.7` e `desktop-v1.2.7`. Os oito workflows remotos do commit passaram; o Desktop Release `32581796791` terminou verde nos três sistemas. A release pública não é draft nem prerelease e os três instaladores responderam HTTP 200.

**Assets verificados:** `Baluarte-Launcher-Setup-1.2.7.exe` (644,015,362 bytes), `Baluarte-Launcher-1.2.7.AppImage` (773,768,701 bytes), `Baluarte-Launcher-1.2.7-arm64.dmg` (406,313,600 bytes), dois blockmaps e os manifestos `latest.yml`, `latest-linux.yml` e `latest-mac.yml`, todos publicados na release.

**Release pública:** https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/releases/tag/v1.2.7

**Documentação:** [`docs/releases/v1.2.7.md`](../docs/releases/v1.2.7.md).

---

## 2026-08-20 — Release `1.2.6`: JARVIS Núcleo V7 publicada

A linha `1.2.6` promove o visual **JARVIS Núcleo V7 — Astrolábio Sonoro** como entrypoint 3D canônico do Vite. A experiência usa TypeScript como fonte, artefato JavaScript standalone, Three.js, Web Audio reativo, deteção de batida, FFT, temas ouro/rubi/jade, vistas, pulso, varrimento e captura.

O bump de versão foi sincronizado em `package.json`, `package-lock.json`, `desktop/package.json`, `desktop/package-lock.json`, `src/data/version.js`, `public/sw.js` e no default do workflow Desktop Release. O Service Worker usa `baluarte-v1.2.6` para invalidar os caches anteriores.

O contrato `test/jarvis-v7-release.test.js` comprova a existência do HTML, TypeScript e artefato compilado e verifica que `vite.config.js` empacota a variante da pasta `project V2/Modelar objeto 3D`. Os gates locais executados antes da publicação foram: Nexus verde, TypeScript V1/V2 verde, testes verdes, build verde, integração V2 `25/25`, smoke `99/99` e caminho crítico `15/15`.

O workflow `32405066321` terminou com sucesso em Windows, macOS ARM64 e Ubuntu. A tag `v1.2.6` está pública, não é draft e não é prerelease; a API de releases passou a retornar `v1.2.6` como Latest.

**Main SHA auditado:** `e3dcf5b8f8bf751da8dfafc9d332d8adf19cc652`.

**Tags:** `v1.2.6` e `desktop-v1.2.6`, ambas apontando para o SHA auditado.

**Assets verificados HTTP 200:** `Baluarte-Launcher-Setup-1.2.6.exe` (644,007,179 bytes), `Baluarte-Launcher-1.2.6.AppImage` (773,760,467 bytes), `Baluarte-Launcher-1.2.6-arm64.dmg` (406,503,539 bytes), dois blockmaps e os manifestos `latest.yml`, `latest-linux.yml` e `latest-mac.yml`. Os manifestos declaram `version: 1.2.6` e os SHA-512 dos instaladores.

**Release pública:** https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/releases/tag/v1.2.6

**Documentação:** [`docs/releases/v1.2.6.md`](../docs/releases/v1.2.6.md).

---

## 2026-08-20 — Release `1.2.5`: artefatos baixáveis do Baluarte Launcher

A release `1.2.5` alinha a versão do site e do `Baluarte Launcher`, atualizando `package.json`, `package-lock.json`, `desktop/package.json`, `desktop/package-lock.json`, `src/data/version.js` e `public/sw.js`. O Service Worker usa `baluarte-v1.2.5`, invalidando os caches da linha anterior.

O pipeline Desktop Release foi endurecido para conferir a versão do `desktop/package.json` contra o tag `desktop-v1.2.5` quando acionado por tag e contra a versão solicitada quando acionado manualmente. O workflow `32382473203` terminou com sucesso nos jobs Windows, macOS e Ubuntu.

O Launcher deixa de anunciar a linha textual `1.1.5` na mensagem de atualização e passa a descrever a linha `1.2.5`. O comportamento continua opt-in: `autoDownload = false`, confirmação antes do download e confirmação antes da instalação.

A causa da inconsistência anterior foi documentada: o site estava em `1.2.0`, o `desktop/package.json` estava em `1.1.5`, e a cadeia de release desktop era independente da tag web. A página `/baixar` consome `/releases/latest`; após a publicação, a API retornou `v1.2.5` como release Latest, pública e não-prerelease.

**Release pública:** https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/releases/tag/v1.2.5

**Main SHA auditado:** `56d026c4b51c4339ce8723c29059ad5822c54e00`.

**Assets verificados:** `Baluarte-Launcher-Setup-1.2.5.exe` (644,006,334 bytes), `Baluarte-Launcher-1.2.5.AppImage` (773,756,395 bytes), `Baluarte-Launcher-1.2.5-arm64.dmg` (406,513,285 bytes), dois blockmaps e os manifests `latest.yml`, `latest-linux.yml` e `latest-mac.yml`. Os oito assets responderam HTTP 200.

---

## 2026-08-20 — Release `1.2.0`: frontend TypeScript incremental e fundação V2

A release `1.2.0` consolida as Waves 23–35 da construção incremental do Projeto-Baluarte. A V1 permanece funcional e compatível, enquanto as fronteiras canônicas do frontend e da camada de utilitários avançam para TypeScript com wrappers `.js` preservados onde consumidores legados ainda existem.

Entre as entregas estão a promoção dos contratos de boot e contexto do JARVIS, presença musical e sessão Spotify, `baluarte-status`, Markdown, briefing de notícias, cor e triangulação, curadoria militar, toast, efeitos imersivos, atmosfera, progresso de scroll, scroll reveal, PWA, contador de visitas, page views, carregadores MapLibre/WebGL, fingerprint engine e card spotlight. O mapa Nexus foi mantido sincronizado com cada promoção arquitetural.

A release também registra a continuidade da fundação V2: Runtime, Registry, Platform, saúde, permissões deny-by-default, integração com o router V1, Data Layer em evolução e contratos de observabilidade. O JARVIS continua tratado como módulo isolável, sem tornar OpenClaw, Spotify ou notícias dependências obrigatórias do boot da V1.

**Validação do SHA da Wave 35 (`561aff89f90fac275d892ba0764cfdddd6c9a7bc`):** `verificar-nexus`, `tipos:ts`, `tipos:v2`, testes, build, integração V2 `21/21`, smoke `99/99` e caminho crítico `15/15` verdes. Os oito workflows remotos — CI, V2 Runtime, V2 Core, Core CI, V2 Validation, CodeQL, Arma 3 Data CI e Vigia das rotas — terminaram com sucesso. O runtime Rust local continua com a limitação conhecida do Cargo 1.75.0 diante de dependência `edition2024`; o workflow remoto correspondente passou.

A versão foi alinhada em `package.json`, `package-lock.json`, `src/data/version.js`, `public/sw.js` e README. A alteração do Service Worker usa `baluarte-v1.2.0`, invalidando caches das releases anteriores conforme o contrato de atualização offline.

Relatório técnico da onda: [`docs/v2/TYPESCRIPT_MIGRATION_WAVE_35_2026_08_20.md`](../docs/v2/TYPESCRIPT_MIGRATION_WAVE_35_2026_08_20.md).

---

## 2026-08-18 — `/arma3-tutorial` fecha a migração: **nenhuma página canônica em JavaScript**

A última das cinco. Com ela, o comando de verificação do
`docs/PROMPT-MIGRACAO-TS.md` imprime `nenhuma pagina canonica em JS` — todo
`.js` em `src/pages/` é wrapper de uma linha, e são **114 implementações `.ts`**
(contadas com `globSync('src/pages/**/*.ts')`, subpastas incluídas).

**A página mais bloqueada era a mais bloqueada por um motivo:** 13 fontes sem
declaração, somando ~6.500 linhas de catálogo gerado. Todas ganharam `.d.ts` com
as formas **medidas** sobre o dado real, não supostas.

**O que o tipo achou, e não era pouco:**

- **Quatro `carregar*()` devolvem o ENVELOPE, não o array.** `carregarAcessorios`,
  `carregarVeiculos`, `carregarEquipamento` e `carregarSoldados` chamam
  `buscarDataset` **sem** `campo`, então entregam `{ acessorios: […] }`,
  `{ veiculos: […], faccoes: … }` e assim por diante. Só `carregarArsenal` passa
  `campo: 'armas'` e devolve a lista. Declarar array nos quatro teria posto um
  `.filter is not a function` esperando a primeira pessoa que os usasse.
- **`Arma3Preset` não declarava `id`** — e a página inteira depende de
  `ARMA3_PRESETS.find((p) => p.id === PRESET_ID)`. O campo existe no dado desde
  sempre; para o TypeScript, não existia.
- **O `find` do preset podia devolver `undefined`** e a página seguia montando
  `preset.mods` e `preset.arquivo`. Agora, se o preset oficial sumir do catálogo,
  a tela diz isso em uma linha em vez de estourar no meio da montagem.
- **Um termo de busca morto na aba Soldados.** O filtro concatenava
  `${(s.classes || []).join(' ')}`, e **soldado não tem campo `classes`** —
  medido: 0 de 940 (quem tem é o equipamento, 241 de 241). O termo sempre somou
  string vazia. Saiu; a busca faz exatamente o que já fazia.

**O depósito `D` é a peça que mais ganhou com o tipo.** Ele recebe módulos por
`import()` dinâmico conforme a aba abre, e antes era `{}` — qualquer acesso
passava. Agora é a interseção dos nove namespaces, cada um `Partial`, porque
"ainda não chegou" é o estado normal. Ler dele exige `exigirBase()`, que **falha
alto** dizendo qual base faltou, em vez de deixar um `undefined.filter` estourar
cinco quadros depois, longe da causa.

Zero `any`: as **114** páginas em TypeScript seguem sem nenhuma ocorrência de
`: any` ou `as any`.

✅ `tipos:ts` 0 · `tipos:v2` 0 · suíte **954/954** · smoke **98/98 rotas verdes**
· build limpo. Portão confirmado vendo o arquivo: defeito plantado em
`arma3-tutorial.ts` deixa o `tipos:ts` vermelho.

`/arma3-tutorial` rendeu **29.101 caracteres e 957 nós** — o **mesmo** número da
medição anterior à migração. As quatro páginas desta rodada bateram exatamente o
tamanho de antes (`/wiki-arma3` 3.658/263, `/vanguard` 12.141/659, `/jarvis`
913/47), que é a evidência de que o comportamento não mudou — não só de que a
rota abre.

## 2026-08-18 — `/jarvis` em TypeScript, e quatro exportações que o TypeScript não enxergava

Quarta das cinco últimas páginas. Implementação em `src/pages/jarvis.ts`; o `.js`
virou re-export e o `src/main.js` não mudou.

**O padrão do dia se repetiu: o defeito estava nas declarações, não na página.**
Cinco fontes não tinham `.d.ts` (`jarvis-memory`, `jarvis-recall`,
`jarvis-skills`, `jarvis-style`, `jarvis-tools` — 1.091 linhas), e as que
existiam estavam **incompletas de um jeito que só aparece quando alguém tenta
usá-las**:

- `processNewsBriefing` e `healthCheckServer` são exportadas pelo
  `jarvis-engine.js` e **não estavam declaradas** — para o TypeScript elas não
  existiam, embora a página importe as duas desde sempre. Mesma coisa com
  `isWebGPUAvailable` e `preloadWebLLM` (`jarvis-webllm`),
  `HERMES_AGENT_DEFAULT` (`jarvis-hermes-agent`) e `HERMES_LOCAL_DEFAULT_URL`
  (`hermes-local`). Seis exportações invisíveis, todas em uso.
- `getBaluarteBriefing()` estava declarada **sem argumento**, mas a implementação
  real (`jarvis-context.ts`) recebe `{ compact }` — e a página passa. O
  `compact` é o que encurta o briefing em todos os modos **menos** os de agente,
  que precisam do texto inteiro para escolher ferramenta.
- `WebLLMCallbacks.onProgress` estava declarada com **um** parâmetro; a
  implementação chama com **dois** (`texto, fração 0..1`). A barra de progresso
  do download usa a fração — declarar só o texto tornaria o segundo parâmetro um
  erro de tipo justamente em quem já o consome.

O `role` das mensagens virou união fechada (`'user' | 'jarvis' | 'tool'`), o que
alinha a memória com o `jarvis-engine` e deixa a conversa ir direto para os
motores sem conversão nem asserção.

**Na página, o TypeScript pegou uma bolha que ele achava que nunca existia:** no
modo Navegador a bolha de streaming é criada dentro do callback `onToken`, e o
compilador não enxerga atribuição feita em closure — concluía que ela seguia
`null` depois do `await` e estreitava para `never`. A bolha passou a morar num
objeto, que é o que a análise de fluxo consegue acompanhar.

As peças que só existem depois do boot (`messagesEl`, `inputEl`, `config`) ganharam
um acessor `exigir()` que **lança** se forem usadas antes — o mesmo desfecho que
a versão JavaScript já tinha (`TypeError`), de propósito: `return` mudo ali daria
exatamente o retrato verde de peça desligada.

Zero `any`: nenhuma página em TypeScript tem uma ocorrência sequer.

✅ `tipos:ts` 0 · `tipos:v2` 0 · suíte **954/954** · build limpo. Portão
confirmado vendo o arquivo: defeito plantado em `jarvis.ts` deixa o `tipos:ts`
vermelho.

## 2026-08-18 — `/vanguard` em TypeScript: o motor de tiro inteiro ganha declaração, e um `"null"` que ia parar na tela

Terceira das cinco últimas páginas. A implementação foi para
`src/pages/vanguard.ts`; o `.js` virou re-export e o `src/main.js` não mudou.

**O trabalho não foi a página, foram as fontes.** A `/vanguard` consome 5 módulos
que não tinham tipo, e um deles é o motor do Project Vanguard inteiro —
`src/utils/vanguard/`, ~2.000 linhas de matemática pura reexportadas por um
`index.js` de `export *`. Declarar só os 7 símbolos que a página usa teria
deixado os outros ~50 invisíveis, e **`export *` que não resolve não vira erro
sob `skipLibCheck`: vira `any` em silêncio**, que é exatamente o defeito
consertado ontem no `A3ColInfo`. Então foram os 9 arquivos, um `.d.ts` cada:
`angles`, `geo`, `mgrs`, `gridref`, `arma3-grid`, `ballistics`, `charges`,
`fire-mission` e o `index`. Mais `arma3-armas`, `arma3-terrenos`,
`arma3-balistica` e `arma3-grade`.

As declarações não são decorativas — foram testadas com o defeito plantado, e
**recusam as seis coisas erradas** que interessam: sistema de mil inventado
(`radToMil(1, 'inventado')`), ler `elevacaoRad` de uma solução que não resolveu,
misturar `lat` com `x/y` numa posição, tratar `A3ARM[0].v0` como `number` (é
`number | null`), tratar `tamanhoM` como `number` (4 dos 31 mundos não declaram),
e ignorar o `null` de `gradeParaMetros`.

**O que o tipo achou na página.** `saida.replaceChildren(…, preferida ? … : null,
avisos.length ? … : null)`. Diferente do `h()`, que descarta filho nulo,
`replaceChildren` converte o que não é `Node` em **texto** — medido no Chromium:
`d.replaceChildren(p, null, null)` → `"<p>ALGO</p>nullnull"`. A palavra "null"
ia para a tela. Agora a lista é montada e filtrada antes de entrar.

Achou também que **`MapLibreNamespace` não declarava `Marker`**, embora a página
faça `new ml.Marker(...).setLngLat(...).addTo(mapa)` desde que o mapa tático
existe — a única consumidora de `Marker` no repo. Entrou no `maplibre-loader.ts`
e no `.d.ts` que anda com ele.

E `a.ehMod - b.ehMod` no `sort` dos terrenos: subtração de `boolean`, que o
JavaScript aceita coagindo. Virou `Number(a.ehMod) - Number(b.ehMod)`.

Zero `any`: nenhuma página em TypeScript tem uma ocorrência sequer.

✅ `tipos:ts` 0 · `tipos:v2` 0 · suíte **954/954** · smoke **98/98 verdes**.
`/vanguard` rendeu **12.141 caracteres e 659 nós** — o **mesmo** número da
medição anterior à migração, que é a evidência de que o comportamento não mudou.
Portão confirmado vendo o arquivo: defeito plantado em `vanguard.ts` deixa o
`tipos:ts` vermelho.

## 2026-08-18 — `/wiki-arma3` em TypeScript, e um `any` que estava escondido atrás do `skipLibCheck`

Segunda das cinco últimas páginas (`docs/v2/TYPESCRIPT_REMAINING.md §0`). A
implementação foi para `src/pages/wiki-arma3.ts`; o `.js` virou o re-export de
uma linha, e o `src/main.js` **não mudou** — continua importando o `.js`, como
nas 103 páginas anteriores.

**O achado não estava na página, estava na declaração.** `src/data/wiki-arma3.d.ts`
importava `A3ColInfo` de `./arma3-colecao.js` — e esse arquivo de declaração
**não existia**. Como o portão roda com `skipLibCheck`, o import quebrado nunca
virou erro: virou `any` em silêncio. Medido antes de consertar, com o tipo mais
errado que se consegue escrever:

```ts
const x: number = A3COL_INFO.nome;   // passava
```

Um tipo que não recusa nada é tipo decorativo, que é exatamente o que esta
migração existe para não produzir. Daí `src/data/arma3-colecao.d.ts` (novo), com
as formas **medidas** sobre os 237 itens do catálogo, não supostas: `guia`
aparece em 95 deles e `dlcs` em 12 — os dois opcionais; o resto está nos 237. A
mesma linha agora é vermelha, e a declaração já serve a `/arma3-tutorial`, que é
a outra consumidora do catálogo.

**O que o tipo achou na própria página:** quatro comparações `variantes > 1` sobre
campo opcional (`number | undefined`), que em JavaScript devolvem `false` calado
quando o config não declarou o número — em armas, acessórios, equipamentos e
soldados. Agora são `(variantes ?? 0) > 1`. Também saiu dali a duplicação de
`n()`, que era a mesma função copiada em cinco fichas: virou uma `num()` só.

Zero `any`: as 103 páginas em TypeScript seguem sem nenhuma ocorrência de
`: any` ou `as any`.

✅ `tipos:ts` 0 · `tipos:v2` 0 · suíte **954/954** · smoke **98/98 rotas verdes**,
com `/wiki-arma3` em 3.658 caracteres e 263 nós (título "Wiki de Arma 3", zero
erros de JavaScript). O portão foi confirmado **vendo** o arquivo novo: com um
defeito plantado em `wiki-arma3.ts` o `tipos:ts` fica vermelho, e volta a verde
quando ele sai — peça pronta e desligada daria o mesmo retrato verde.

## 2026-08-17 — `.gitattributes` fixa `*.md` em LF (e a renormalização não existiu)

A outra metade da decisão do fim de linha. O conserto cirúrgico
(`scripts/lib/eol.mjs`) normaliza os dois lados da **comparação**; este arquivo
tira a variável do jogo antes: `.md` é LF no disco em qualquer sistema, em vez de
depender do `core.autocrlf` de cada máquina.

**Confirmado antes num Windows de verdade**, que é o que faltava — o remoto só
tinha reproduzido o sintoma no Linux convertendo os destinos à mão. Nesta máquina
o `core.autocrlf` é `true` e os três destinos estão em CRLF puro no disco; os três
verificadores passam. E o verde é do conserto, não de acaso: neutralizado o
`comLF`, os três ficam vermelhos sobre o mesmo disco, com a mesma mensagem
enganosa de sempre.

**A renormalização esperada não aconteceu, porque não havia o que renormalizar.**
A previsão registrada era um diff grande, tocando todo `.md` versionado. Medido:
os **167** `.md` já estão LF no índice (`git ls-files --eol`) — o `core.autocrlf`
converte na escrita, então nunca houve blob CRLF de `.md` para desfazer. O diff é
**um arquivo novo**, e mais nada.

Consequência que vale saber, porque é contra-intuitiva: nesta árvore de trabalho
os 160 `.md` **continuam CRLF no disco** mesmo com o atributo valendo. O git não
os vê como modificados — o filtro `clean` converte CRLF→LF e o resultado bate com
o blob — então não tem por que reescrevê-los. O atributo passa a valer em checkout
novo.

Por isso os dois consertos **se somam de propósito**, e não é defesa em
profundidade por acaso: o `eol.mjs` é o que protege toda árvore que já existe,
inclusive esta. Um efeito colateral disso é que, em árvore já renormalizada, o
mutante do `eol.mjs` deixa de ficar vermelho — a proteção continua correta, mas
some o sintoma que a testava.

Sem regra `* text=auto`: existem blobs CRLF versionados de propósito
(`android/gradlew.bat`, os presets `.html` do Arma 3, um transcript `.txt`), e uma
regra geral os reescreveria. O escopo é `.md`, que é onde a classe do problema
vive — os únicos verificadores que comparam texto de arquivo inteiro são os três,
e os três leem `.md`. O `verificar-nexus` usa `JSON.parse`, imune a fim de linha.
## 2026-08-17 — `starting` e `stopping` deixam de ser palavra e viram estado

`starting` estava em `ESTADOS_MODULO` desde o começo e **nada o produzia**. O
retrato só via estados assentados, então quem observasse o ciclo no meio do voo
recebia uma resposta errada com todas as luzes verdes — a assinatura do defeito
que este repositório já pagou três vezes.

**`stopping` não existia.** A fila dizia "o vocabulário já existe"; existia para
`starting`, não para `stopping`. Então este item **acrescenta um estado ao
contrato**, e não apenas liga um que estava lá.

O ciclo passou a ser a fonte: `emTransicao()` devolve `{ modulo, direcao, etapa }`
enquanto uma fase executa, e `null` quando nada está em voo. `etapa` reusa o
vocabulário de `LifecycleFailure.fase` de propósito — é a mesma pergunta ("em que
fase?"), respondida antes de haver falha em vez de depois. O status apenas
traduz, e **exige** a peça: ciclo sem `emTransicao` é recusado na construção,
porque retrato que nunca acusa transição é indistinguível de sistema que nunca
transiciona.

**A transição é decidida antes de `vivos()`, e isso é necessidade, não estilo.**
Na descida o módulo continua vivo enquanto desce; perguntar a `vivos()` primeiro
devolveria `running` justamente para quem está parando. Invertida a ordem, três
testes caem.

Duas mentiras vizinhas caíram junto, ambas do mesmo formato:

- **Módulo ainda não alcançado na subida saía como `stopped`** — "saiu do ar"
  sobre quem nunca entrou. Agora é `registered`, que é a definição escrita no
  contrato.
- **Quem já desceu continuava em `vivos()` até o fim da descida**, então durante
  todo o desligamento o `boot.diagnostico()` listava o sistema inteiro com rotas
  e permissões, dizendo que estava no ar enquanto era desmontado. A saída passou
  a ser progressiva.

E um terceiro achado, do mesmo formato e fora do enunciado: **falha em `start`
era reportada como falha em `init`**. `'start'` estava em `LifecycleStage` e nada
o emitia — a etapa não avançava antes da chamada. Rótulo errado manda quem lê o
diagnóstico para o handler errado, que é exatamente o motivo de a fase `runtime`
ter sido criada na rodada anterior. Nenhum teste fixava o comportamento antigo.

**Sete mutantes plantados, sete mortos.** O da transição pendurada também derruba
um teste pré-existente (`sem autorização o módulo NÃO vira running`), o que mostra
que a ordem nova sustenta a garantia do Runtime Host, e não só a nova. Suíte
905 → **916**.

> O harness de mutação tropeçou primeiro na família "Windows", **sétima
> instância**: trecho multilinha nunca casava, porque o disco é CRLF e os
> literais do script eram LF. Mesma lição do `scripts/lib/eol.mjs` — normalize
> antes de comparar. Dois mutantes "sobreviveram" por isso antes do conserto:
> ferramenta de medição quebrada dá exatamente o mesmo verde que peça correta.

Muda contrato e formato de dado (`ESTADOS_MODULO`, `ModuleLifecycleState`,
`LifecycleSummary` com `starting`/`stopping`, e `ModuleCycle.emTransicao`), então
**para para revisão** em vez de ir direto ao `main`.
## 2026-08-17 — o transporte por stdio ganha consumidor, e o protocolo para de ser dois

**Quarta peça pronta e desligada.** O `criarRuntimeStdio` existia, tinha
documento próprio (`docs/v2/V2_RUNTIME_STDIO.md`) descrevendo o protocolo linha a
linha, e a busca textual pelos importadores achou **zero** — nem produção, nem
teste. Depois da fachada, do contract test e do Runtime Host, o padrão já não
surpreende; o que muda é que agora se procura por ele antes.

Os testes novos falam com **processo real**, não com duplo de `spawn`. A opção
`spawnFn` existe e teria sido mais fácil, mas duplo prova o formato das mensagens
e para aí. O que só um processo de verdade expõe é I/O — e era exatamente ali que
estava o defeito.

**O defeito:** resposta inválida fazia o `parseResposta` lançar **dentro do
handler de `line`**, com o `pending` já zerado uma linha antes. O erro subia como
exceção não capturada **e a promessa do chamador nunca assentava**. Um Runtime
que respondesse lixo penduraria o Core em silêncio — mesma família do "init que
trava não pendura o Baluarte", agora na fronteira do processo.

Medido nos dois sentidos, e a medida é o argumento: sem o conserto os dois testes
de resposta inválida **não falham, eles travam** — a suíte do arquivo leva
**71,8 s** (dois testes queimando o teto do runner) contra **639 ms** com ele.
Nove mutantes plantados, nove mortos; dois deles matam por travamento, que é o
defeito reaparecendo.

**Um sobreviveu na primeira rodada, e o motivo vale mais que o conserto.**
Remover o `clearTimeout` do assentamento passava por todos os testes de
comportamento: o timer órfão dispara, o `retirarDeVoo` é seguro contra nulo, e
ele não acha ninguém. O estrago só existe se o órfão pegar a requisição
**seguinte** em voo — e os dois timers ficam separados apenas pela duração da
requisição anterior, uma janela de milissegundos. Pegá-la por tempo pediria
margens apertadas, e portão instável troca um defeito estreito por um vermelho
aleatório. A saída foi observar o recurso em vez do comportamento:
`process.getActiveResourcesInfo()` conta os `Timeout` vivos, e o delta entre uma
requisição e a seguinte só cresce se um teto tiver ficado armado. Determinístico,
sem relógio.

O `pending = null` continua **antes** do parse de propósito: a requisição sai de
voo quando a linha dela chega, tenha a linha sentido ou não. Zerar depois faria a
próxima resposta cair sobre uma requisição já respondida.

### E aí apareceu por que a peça nunca tinha sido ligada

O `scripts/v2-runtime-smoke.mjs` — o portão E2E que o CI roda — **reimplementava
o protocolo à mão**: `spawn` próprio, serialização própria, buffer de linhas
próprio, teto próprio. Existiam **duas implementações do mesmo protocolo**, e a
única que falava com o binário passava por fora do transporte.

Isso não era duplicação estética, era a explicação inteira. O transporte não
tinha consumidor porque quem fazia I/O concreto o contornava; e o E2E ficava
verde provando o protocolo *do script*, não o do transporte. O transporte podia
estar quebrado sem que nada acusasse — **e estava**, com o pendura acima.

Agora o smoke usa o `criarRuntimeStdio`. O portão passa a exercitar a peça que o
resto do sistema usaria, e some a segunda implementação.

### O teto virou requisito, não escopo extra

`enviar()` não tinha teto; o smoke tinha um de 5 s. Fazer o smoke usar o
transporte sem teto teria **removido uma proteção existente** — então
`TETO_RUNTIME_MS` entrou junto, com `tetoMs` para sobrescrever.

O `clearTimeout` mora num lugar só (`retirarDeVoo`) porque são **quatro** os
caminhos que assentam uma requisição: resposta, erro do processo, saída do
processo, falha de escrita. Esquecê-lo em qualquer um faz o teto disparar sobre
requisição já respondida, e o estrago aparece na requisição **seguinte** — o pior
lugar para procurar. Há mutante para os dois lados.

### O Rust rodou nesta máquina pela primeira vez

`cargo` não existia aqui; agora existe, e com ele caiu a fronteira que separava
"do remoto" de "do local". Instalado o Rust 1.97.1. As Build Tools do Visual
Studio **não** deram: o instalador precisa de elevação e sai com `1602`
(cancelado) numa sessão não-interativa. O caminho que funcionou foi o toolchain
**GNU** com um MinGW portátil por winget, sem admin.

Com isso, três verificações que o handoff listava como exclusivas do remoto
passaram a rodar aqui:

| | |
| --- | --- |
| `npm run v2:runtime` | **12 + 3 testes, 0 falhas** |
| smoke E2E contra o `.exe` real | **OK** |
| testes do transporte | **12/12**, com 9/9 mutantes mortos |
| suíte | 905 → **917** |

E os três testes de processo que a `MAIN_ERROR_AUDIT` listava como quebrados
(`process_rejects_invalid_json_and_continues` e irmãos) passam — o que confirma
**por execução** o que a anotação de ROOT-RUNTIME-001 só tinha confirmado por
leitura.

### E a cadeia do vertical slice rodou com o Runtime de verdade

`test/v2/slice-nativo.test.js` percorre o desenho do `V2_VERTICAL_SLICE.md` —
Registry → autorização → sessão → init → start → running → stop → dispose →
close — com **todas** as peças reais, inclusive o binário.

A diferença não é de grau. O `abrir` do Host, no entrypoint, chama
`criarGrantRuntime`: autorização **sem transporte**, porque no navegador não há
processo com quem falar. Todo teste anterior usou espião ou duplo. Então a
propriedade central — "um módulo só entra em `running` depois de abrir seu
Runtime" — era verdadeira sobre um Runtime que **nunca tinha existido**. Agora
quem decide se o módulo sobe é o processo Rust.

Três propriedades cobradas, e a terceira é a que garante que o teste não passa à
toa: **declarar não é receber.** Sem concessão, o módulo sobe (grant vazio é
autorização disponível — tratá-lo como negação transformaria deny-by-default em
deny-tudo) e a leitura é **negada pelo Rust**. Mesma rota, permissão diferente,
resultado diferente: a discriminação vem do outro lado da fronteira, não do
JavaScript. Remover o Host do `criarCiclo` derruba o primeiro teste.

### E o módulo passou a USAR o Runtime, não só a ser autorizado por ele

`criarContexto` ganhou a dependência opcional `runtime`, e o `ModuleContext`
ganhou `ctx.runtime.lerArquivo(caminho)`. Com isso o `init` de um módulo lê um
arquivo pelo Runtime nativo — a cadeia de **uso**, que faltava.

**A propriedade está na aridade.** A alça entregue ao módulo recebe *caminho, e
só*: o id fica fechado por closure, preenchido pelo contexto. Se aceitasse o
módulo como argumento, `alpha` poderia nomear a raiz de `beta`, e o confinamento
por módulo seria convenção em vez de garantia. O mutante que troca a alça por uma
que aceita o módulo derruba dois testes; o que remove o runtime do contexto
derruba os mesmos dois.

**A permissão não é rechecada no contexto** — quem cobra é o Rust, do outro lado.
Repetir seria defesa em profundidade escondendo mutante (Regra 1), o mesmo motivo
pelo qual o status de lifecycle não recheca autorização.

O portão de tipos pegou o que a suíte não pegaria: `Deps` não declarava
`runtime`, e depois `deps.runtime` ficou "possivelmente undefined" dentro da
closure — a checagem no spread não estreita lá dentro. Resolvido capturando antes
do `return`, e não com `!`: `deps` é objeto de quem chama, e calar o compilador
esconderia o caso real.

### E a injeção em produção fechou o circuito

`v2/core/runtime-app.js` adapta `window.baluarte.invoke('runtime:ler', …)` à forma
que o contexto espera, e o entrypoint o injeta em `deps.runtime`. Renderer → IPC →
main → Runtime, com a alça chegando ao módulo pelo `ctx`.

**Fora do app devolve `null`**, e `null` deixa o contexto exatamente como era. Um
adaptador que fingisse existir na web daria aos módulos uma alça que sempre falha
— pior do que não ter alça. Gate do #238: web leve, app completo. O portão
`v2:integracao` segue **15/15** no navegador, que é a prova de que o caminho web
não mudou.

Três decisões, cada uma com mutante:

- **Ambiente meio montado é ausência.** `native` sem `invoke` é ponte quebrada;
  tratá-la como pronta empurraria o erro para dentro do `init` de um módulo, longe
  da causa. E `native` tem de ser `true`, não apenas verdadeiro — o mutante que
  troca por `!ponte.native` morre.
- **O envelope é remontado a cada chamada.** Congelá-lo no boot faria a leitura
  responder sobre o passado: conceder depois do arranque não alcançaria o módulo,
  revogar tampouco. Mesma razão de `declarado.concedidas` ser função. O teste cobre
  os três instantes — antes, depois de conceder, depois de revogar.
- **O Host continua autorizando localmente, mesmo no app.** Trocar
  `criarGrantRuntime` pela autorização nativa faria um binário ausente derrubar
  módulos que hoje sobem. E não afrouxa nada: quem nega a leitura de quem não
  recebeu `READ_FILES` é o Rust, na hora do uso.

**Aberto:** ninguém abriu um Baluarte empacotado com o Runtime dentro. A cadeia
está provada em Node com as peças reais e o adaptador contra ponte falsa; o ramo
`process.resourcesPath` continua sem exercício.

### E a ponte do app desktop entrou junto

O `desktop/` era uma ilha CommonJS **sem um único teste**, e nada nele importava
de `v2/`. Agora há `desktop/src/runtime.js`, com os canais `runtime:status`,
`runtime:autorizar` e `runtime:ler` na allowlist do `ipc.js`.

Escrito sem `require('electron')` de propósito — a raiz confiável entra injetada
(`app.getPath('userData')/runtime-root`, seguindo o M4/RFC #232), calculada no
`buildHandlers` e não no topo do módulo, porque `app.getPath` depende do app
pronto. É o que permitiu testar a ponte em Node puro, e é o primeiro teste que o
`desktop/` já teve: **8/8**, incluindo o ponta a ponta que atravessa ponte →
transporte ESM → processo Rust, no Windows.

Duas armadilhas pagas no caminho:

- **`pathToFileURL` no `import()` dinâmico.** O transporte é ESM e o `main` é
  CommonJS. Em Windows, `import()` de caminho absoluto (`C:\...`) falha sem URL
  `file://` — família "Windows", oitava instância.
- **`extraResources` com `filter` não falha quando a origem falta**, só não
  copia. Declarar o empacotamento sem compilar o Rust antes teria produzido uma
  release sem o Runtime, degradando educadamente, sem ninguém notar. Por isso o
  `desktop-release.yml` ganhou o build do Rust **antes** de empacotar, por SO da
  matriz.

**Ausência não é erro:** sem binário, `status()` devolve
`{ disponivel: false, motivo }`, mesmo contrato do `hermes:status`. Hoje é o
estado normal de qualquer máquina que não rodou `cargo build`.

**O que isto não prova:** o app empacotado. O ponta a ponta prova a ponte, não o
instalador — o caminho `process.resourcesPath` só existe em app empacotado e
segue sendo o único ramo não exercitado. E nada sobre o alvo **MSVC**: o binário
aqui é GNU.

## 2026-08-17 — `running` passa a exigir autorização de Runtime

Pela terceira vez seguida o defeito foi o mesmo: **peça pronta, testada e
desligada.** O `criarLifecycleRuntime` — o Runtime Host por módulo — existia,
tinha teste próprio, e a busca textual pelos importadores achou **um** consumidor
de produção (`vertical-slice.js`), que não é o caminho por onde os módulos sobem.
O `ciclo.ts` ia direto ao `init`.

O `docs/v2/V2_LIFECYCLE_RUNTIME_CONTRACT.md` descrevia desde sempre a ordem certa
— `Runtime.open → init → start`, e `stop → Runtime.close → dispose`. Ninguém a
executava. O resultado era um módulo declarado `running` cuja autorização nunca
tinha sido pedida uma única vez: o retrato afirmava sobre o Runtime uma coisa que
o Runtime não sabia, com todas as luzes verdes. Peça correta e desligada dá
exatamente o mesmo diagnóstico que peça ligada — até alguém perguntar por ela.

Agora o ciclo abre o Host antes do `init`. Quem não abre não executa fase nenhuma,
não entra em `vivos()` e portanto não pode ser `running`; a falha é reportada na
fase **`runtime`**, e não em `init`, porque `init` não rodou e o rótulo errado
manda quem lê o diagnóstico para o arquivo errado. O teto do `init` foi extraído
(`comTeto`) e passou a valer para a abertura — Runtime que não responde pendura a
subida igual a um `init` que trava, e o caminho novo não passava por teto nenhum.

O Host é opcional no ciclo (sem ele o comportamento é o de antes, o que mantém
honestos os testes de unidade das outras peças), **mas o entrypoint passa um
real**: opcional que ninguém injeta era justamente a doença anterior.

**Oito mutantes plantados, oito mortos** — incluindo o que É a doença original:
removida a chamada ao Host, 8 dos 12 testes novos caem. Suíte 893 → 905.

O portão de integração foi de 14 para **15/15**. A asserção nova é a única que
enxerga o defeito: plantando-o no entrypoint, as outras 14 seguem verdes e ela
devolve `[]` — o estado exato de antes desta mudança.

> **Grant vazio é autorização disponível.** `militar` declara `NETWORK`, não
> recebe nada e continua subindo. Tratar "sem permissão concedida" como "sem
> autorização" derrubaria um módulo correto e transformaria deny-by-default em
> deny-tudo. A distinção quase virou defeito ao desenhar isto.

O que isto **não** prova: nada sobre o Runtime Rust, que não existe no navegador.
A sessão injetada no entrypoint é a autorização sem transporte
(`criarGrantRuntime`); o transporte concreto é item posterior da fila.

Junto veio o `--strictPort` no `scripts/v2-integracao.mjs`: sem ele o Vite troca
de porta em silêncio quando a escolhida está ocupada, e o portão passa a medir um
servidor zumbi de outra execução.

### E os verificadores de catálogo pararam de dar vermelho falso no Windows

Os três geradores comparavam a string gerada (`join('\n')`) com o que o
`readFileSync` traz do disco. Em qualquer checkout Windows o disco tem CRLF — não
há `.gitattributes`, então o `core.autocrlf` converte no checkout — e a
comparação falhava por `\r`, e por mais nada.

O sintoma era traiçoeiro porque a mensagem mandava fazer a coisa errada: *"rode o
gerador e commite o resultado"*. Regenerar não muda linha nenhuma, o `git diff`
sai vazio, e o operador ficava olhando um vermelho sem conteúdo com um conserto
que não conserta. No Linux não há conversão, então o CI é verde e o defeito é
invisível de um lado só.

**Medido, não deduzido:** o sintoma foi reproduzido no Linux convertendo os três
destinos para CRLF de verdade no disco. Com o conserto os três passam; com ele
removido, os três ficam vermelhos sobre o mesmo disco. O caminho de escrita não
mudou — os geradores seguem emitindo `\n`, e rodá-los deixa `git diff` vazio.

Das duas saídas possíveis, o operador escolheu as duas em ordem: a cirúrgica
(esta) agora, e o `.gitattributes` com `*.md text eol=lf` depois — ela
renormaliza todo `.md` versionado e merece branch e diff próprios.

## 2026-08-16 — a fachada da V2 saiu do teste e foi para o ar

O `criarPlataforma` existia, tinha teste e **não era usado por ninguém**: busca
textual pelos importadores mostrou que o único consumidor era o próprio teste. O
`v2/harness/main.js` — o entrypoint oficial da V2 na prática — dirigia o `boot`
na mão, sem supervisor, sem saúde, sem status de lifecycle. As três peças
estavam marcadas como prontas, e estavam, *em isolamento*. Em execução real nada
as compunha.

Agora quem sobe é a Plataforma. Medido no navegador: `partida.estado` = `ready`,
supervisor em `ready`, lifecycle com 4/4 `running` e 0 `failed`. A superfície
`window.__v2` cresceu sem mudar — `diagnostico()` continua sendo o do boot,
porque o portão de integração lê `.modulos` dali.

O portão foi a **14/14**, não 13/14. A falha `a superfície de briefing V2
renderiza`, que a sessão anterior reportou como pré-existente, era o falso
vermelho que o `navegarAte` (espera por condição, não por relógio) já tinha
corrigido no `main`.

**O que não veio junto.** A implementação vinha de uma branch onde a fachada
estava misturada com 8 scripts sem relação, e o commit dela também mexia no
`scripts/v2-integracao.mjs`. Essa metade foi descartada de propósito: o `main`
já tinha aquela correção *e* estava à frente. Aplicar o commit inteiro teria
reintroduzido os sleeps de 900/1800 ms — regredido o `main` para consertar algo
que já estava consertado melhor.

Junto veio o contract test completo `Manifest → Registry → Permission → Runtime`,
com as quatro peças **reais** — o `contract-slice.test.js` percorre o mesmo
caminho com registro e decisor falsos, e mock prova o mock. São 9 casos novos
(suíte 884 → 893).

Dos seis mutantes plantados, **um sobreviveu**: removida a poda do
`conhecerModulos`, o teste seguia verde, porque o `avaliar()` já barra por
"não-declarada". Duas defesas, a primeira cobrindo a segunda. Quem enxerga a
poda sozinha é o estado persistido — sem ela o `exportar()` mantém a permissão e
o `importar()` do próximo arranque a ressuscita sob um manifesto que não a
declara mais. Com as asserções sobre `exportar()` e sobre o rastro `podar`, o
sexto mutante morre.

## 2026-08-16 — o portão de tipos da V2 estava vermelho, e ninguém via

`npm run tipos:v2` saiu de **61 erros para zero**. Estava assim havia pelo menos
um dia, em três branches — e o `main` não acusava porque os últimos commits eram
do bot de câmbio, e o GitHub **não dispara workflow em push feito com o
`GITHUB_TOKEN` padrão**. O primeiro push humano acendeu a luz.

O que isso custava: no `v2-validation.yml` os passos são sequenciais, então com o
`Typecheck V2` falhando o `V2 integration` ficava `skipped`. O portão de
integração da V2 — o mesmo que a entrada abaixo deixou em 14/14 — **não estava
sendo exercitado no CI**.

Nenhuma regra foi afrouxada: `strict`, `checkJs` e `noImplicitAny` seguem
ligados, sem `@ts-ignore`, sem tirar arquivo do `include`.

Os 61 eram quatro causas repetidas: `@types/node` que não chegava ao `jsconfig`
(e `types: ["node"]` sozinho *piorava* para 131, arrastando um `.js` de dentro
do `node_modules` — `maxNodeModuleJsDepth: 0` corta); `options = {}` com typedef
de campos obrigatórios, um default que mentia; estreitamento de guarda que não
atravessa função declarada; e `map(Object.freeze)` passado como referência, que
resolve para a sobrecarga genérica errada.

Duas discrepâncias eram reais, e foram corrigidas **no contrato, não no código**:
`RuntimeStateOf` dizia `() => unknown` embora `stateOf` sempre tenha recebido o
id do módulo; e `RuntimeManager.restart` prometia os campos de status planos
enquanto o código sempre devolveu o status aninhado em `status`. Nenhum
consumidor lia os campos planos — mudar o retorno para casar com um contrato que
nunca valeu seria trocar mentira de documentação por quebra de comportamento.

## 2026-08-16 — o portão da V2 nunca tinha rodado no Windows

`npm run v2:integracao` está em **14/14**. A correção não foi no módulo: foi no
portão, e em dois lugares.

`spawn('npx', …)` morria em `ENOENT` antes da primeira asserção — o Node 24
recusa spawnar `.cmd` (CVE-2024-27980) e `npx` é `npx.cmd`. Ou seja, aqui o
portão não dava 13/14: dava **0/14**, e ninguém tinha visto porque ele nunca
havia rodado nesta plataforma. Passa a chamar o bin do vite com o próprio Node.

O `13/14` relatado era do **relógio**. As três navegações dormiam tempo fixo
(900/900/1800 ms) antes de ler a tela. A view do `briefing` é a única importada
sob demanda com orçamento de 900 ms: onde a primeira transformação do Vite passa
disso, o portão reprova um módulo correto — e imprime a tela *anterior*
("Lab de Criptografia"), o que parece defeito de render. Sleep fixo mede a
máquina, não o sistema.

A hipótese herdada era *"view devolve o ELEMENTO"*
([`V2_MODULE_RULES.md`](../docs/v2/V2_MODULE_RULES.md)). Está descartada: o
`loadView` do briefing devolve o elemento desde o commit que o criou. A asserção
também estava certa e **não foi afrouxada** — os predicados seguem inalterados
byte a byte. Medido, com a view atrasada 2 s de propósito: relógio → 13/14;
condição → 14/14. E com `view` devolvendo o módulo, a condição ainda reprova
(`view não é um nó: object`). Saiu o falso vermelho, ficou o verdadeiro.

## 2026-08-10 — três bloqueadores achados às vésperas do congelamento

A varredura final da 1.0.0 não era para achar nada. Achou três, e o pior deles
era meu.

### ⛔ A 1.0.0 apagaria o dado de quem já usa o app

A ADR-003 mandava o app apontar para `v1.projeto-baluarte.vercel.app`, para o
launcher não drenar para a V2 sem instalar nada. A intenção estava certa; a
execução era um apagador silencioso.

`localStorage` é escopado por **origem**. O app publicado (0.9.2) aponta para o
endereço principal, e `v1.` é outra origem. Quem atualizasse encontraria as
**71 chaves vazias**: abas do editor, conversas e memórias do JARVIS, histórico
do terminal e o cofre de chaves de API. Sem erro, sem aviso, sem desfazer.
Pareceria que o app apagou tudo — numa versão chamada "ponto de congelamento".
E o passo 1 do handoff mandava criar o alias **antes** de publicar, ou seja: a
ordem escrita levava direto ao estrago.

A correção inverte quem se muda. A **V1 fica onde o dado já está**; a **V2**
nasce em endereço próprio. O pin continua valendo, porque quem fica parado é a
V1. A ADR-003 foi corrigida **com o erro registrado**, não reescrita em silêncio.

### ⛔ 59 chaves de storage sem esquema declarado

Só 12 estavam em `politica.js`. A varredura de `src/` achou outras 59 em uso —
quase todas acessadas por constante (`const KEY = 'ui:theme'`), forma que um
grep pelo literal dentro de `storage.get(...)` não enxerga. Passaram batido
porque quem procurou procurou pelo padrão errado.

Chave sem esquema não tem versão, e congelar assim deixaria a V2 **sem contrato
para ler o dado da V1**. Entre elas: `apis:vault`, `voice:elevenKey`,
`nucleo:wsToken`, `shadow:auth`, `jarvis:history`, `jarvis:memories`.

Nenhuma virou `secreto` — `secreto` é recusado na gravação, e chave de API que o
operador digita precisa viver no navegador; marcar assim quebraria o cofre em
vez de protegê-lo. Ficou **21 `sensivel` · 48 `local` · 2 `publico`**.

### ⛔ `cripto` marcado estável com 24 exports sem teste

O motor tem 372 linhas e 26 exports; os testes importavam **dois**. AES, OTP,
base64/32/hex, vigenère, atbash, césar e os hashes sustentavam uma promessa que
nada verificava — e `estavel`, pela definição em vigor, inclui *testado*.

O motor passou de primeira nos 26 testes novos. Plantando defeitos, dois foram
pegos e o terceiro (IV fixo no AES-GCM) **passou** — furo no teste, não no
produto: ele se chamava "salt/IV novos" mas só comparava a saída inteira, e o
salt aleatório já basta para a saída diferir. Reescrito para decompor
`salt(16) || iv(12) || cifra` e conferir cada campo.

### 🚧 Aviso de V2 em construção, e a peça que ele exigia

Decisão do operador, com o trade-off na mesa: não há como impedir que a
construção da V2 afete o site e o app, então o certo é **avisar**. Faixa
dispensável no topo do site — e o app vê a mesma coisa, porque o launcher é uma
casca que carrega o site ao vivo. A dispensa é gravada **por versão do aviso**,
não como booleano: quando o texto mudar de verdade, a faixa reaparece para quem
já tinha fechado, em vez de nascer invisível justamente para quem acompanha.

O aviso mandava *"guarde o que for importante fora do navegador"* — e não existia
como fazer isso a não ser pelo DevTools. Aviso que pede o impossível ensina a
ignorar avisos, então veio o **exportar/importar** (`src/core/backup.js` + botões
em `/perfil`, antes do "limpar todos os dados", porque quem chega ali pensando em
apagar tudo deve passar primeiro pela opção de salvar).

O arquivo carrega **versão por chave**: seria absurdo fechar esse buraco no
`localStorage` e reabri-lo no backup. `auth:session` fica **de fora** — JWT de
vida curta, inútil restaurado e perigoso num arquivo que o operador manda por
e-mail para si mesmo. A importação recusa chave não declarada, versão futura e
entrada malformada: é a única porta pela qual dado externo entra no storage, e
não pode virar a janela por onde os buracos fechados voltam.

Com isso, as quatro palavras da definição da 1.0.0 têm lastro:
**previsível** (esquemas + catálogos gerados) · **testado** (463 testes + 5
passagens de navegador no CI) · **recuperável** (offline + backup) ·
**seguro** (permissões negadas por omissão + as 72 chaves classificadas).

### Também entrou

- **Catálogos gerados** (`docs/architecture/events.md` e `storage.md`): 19
  eventos em 8 namespaces, 71 chaves com classe e dono. Gerados do código e
  cobrados pelo CI, como a tabela de estabilidade — catálogo à mão mente no
  primeiro rename. O de storage **se recusa a rodar** com chave fora da política.
- **Geradores do Arma 3 corrigidos**: a migração para `dados-remotos` tinha sido
  feita à mão em seis arquivos **gerados**, e a próxima execução do gerador a
  desfaria calada. O CI pegou — é exatamente o que aquele passo existe para pegar.
- **`.smart-env/` fora do versionamento**: 19 MB de índice do Smart Connections,
  derivado dos nossos próprios READMEs, sem gerador nem consumidor nosso.
- **Triagem das 53 issues** (`docs/TRIAGEM-1.0.0.md`): nenhuma descreve defeito
  no que está marcado estável.

**463 testes.**

---

## 2026-08-09 (13)

### 📦 Os datasets buscados em runtime — o último 🟠

Medido antes de executar: são **7** (as 6 bases do Arma 3 e a saga das Crônicas).
Eles são uma categoria diferente do resto de `src/data/`, e a diferença é a que
importa: dataset **importado** quebrado falha o **build**, e alguém conserta
antes de publicar; dataset **buscado** quebrado falha **na cara do operador**.

A garantia do item — *"um JSON quebrado não derruba a página"* — **já estava de
pé**: os dois consumidores (`/arma3-tutorial` e `/biblioteca`) tratam a rejeição
e mostram "falhou — tentar de novo" e "capítulos indisponíveis". Registrar isso
importa tanto quanto consertar o que falta.

**O que faltava eram outras duas coisas:**

*Teto de espera.* A base de armas tem ~1,9 MB crus. Sem timeout, uma rede
pendurada deixava o botão em "baixando…" para sempre — mesmo modo de falha que
o `dbFetch` tinha. 20 s aqui, não os 8 s do banco: o teto é contra rede
*pendurada*, não contra rede lenta, e um teto curto demais transformaria conexão
ruim em erro.

*Conferência de forma.* Este era o sutil: `d.armas` de um JSON **válido** sem a
chave `armas` resolvia `undefined`, a promessa **cumpria**, e o erro só aparecia
lá na frente como "Cannot read properties of undefined" — sem mencionar dataset
nenhum. Agora rejeita dizendo o que faltou.

Extraído para `src/core/dados-remotos.js`, com uma terceira garantia que os
loaders já tinham e valia preservar explicitamente: **o cache não guarda
fracasso**. Se guardasse, o primeiro erro condenaria a sessão inteira e o botão
"tentar de novo" mentiria.

10 testes. Verificado no navegador: `/biblioteca` carrega os **1178 capítulos**,
sem erro de JS.

Proveniência (fonte, data, confiança por campo) segue sendo **V2** — #422.

422 testes verdes.

---

## 2026-08-09 (12)

### 📴 Prova de offline — e um teste que travava em vez de falhar

"Recuperável" é uma das quatro palavras da definição de 1.0.0, e `pwa` está
marcado **estável**. Um PWA que instala Service Worker e mesmo assim mostra o
dinossauro do navegador quando o wi-fi cai não é estável — é decorativo.

`scripts/prova-offline.mjs` percorre: online (SW assume o controle) → **offline**
→ recarrega → navega → **online de volta**. Passou nas 9 afirmações.

O percurso distingue dois casos porque a arquitetura os separa: com roteamento
por **hash**, trocar de rota offline **não** dispara requisição de navegação — o
shell já está na memória. O que pode faltar é o **chunk** de uma página nunca
visitada, já que cada rota é um `import()` separado. Então:

- rota já visitada → tem que abrir normalmente (chunk em cache);
- rota nunca aberta → tem que dizer "falha ao carregar" e seguir de pé. **Tela
  branca é o defeito.**

**A parte que interessa.** A primeira versão do script **travava** quando não
havia Service Worker — `navigator.serviceWorker.ready` nunca resolve nesse caso;
ele não rejeita, pendura. Descobri porque o teste de quebra (desligar o registro
do SW para ver o script ficar vermelho) estourou o tempo em vez de falhar. Em CI
isso queimaria o job inteiro por timeout — e justamente no cenário que o teste
existe para detectar. Teste que trava é pior que teste que falha.

Agora tem teto de 15 s e para na hora, dizendo a causa.

412 testes verdes; 4 passagens de navegador no CI (rotas · jornada · vazamento ·
offline).

---

## 2026-08-09 (11)

### 🧹 Auditoria do Service Worker — e um bug que eu mesmo plantei hoje

`pwa` está marcado **estável**, e este é o componente que já deixou gente presa
em cache velho **duas vezes** neste projeto. A primeira metade da auditoria já
estava fechada: `test/versao.test.js` impede a VERSION do `sw.js` de ficar para
trás. Esta é a segunda.

**O bug.** A limpeza de caches antigos comparava por **prefixo**:

```js
keys.filter((k) => k.startsWith('baluarte-') && !k.startsWith(VERSION))
```

E `'baluarte-v1.0.0-rc-static'.startsWith('baluarte-v1.0.0')` é **`true`**. Ou
seja: na subida de `1.0.0-rc` para `1.0.0`, os caches da rc **sobreviveriam para
sempre** — invisíveis, ocupando espaço, nunca servidos. O mesmo valeria de `v1.0`
para `v1.0.1`.

E o cenário foi criado **hoje**, pela renumeração para `-rc` de dois commits
atrás. Um item da fila achando o defeito que outro item da fila plantou.

Agora a comparação é por **nome exato** contra a lista dos caches desta versão.

**O teste executa o `sw.js` de verdade.** O arquivo é servido cru e usa globais
de Service Worker, então não dá para importar. Em vez de reimplementar a lógica
no teste — que testaria uma cópia, não o código —, ele roda num sandbox `vm` com
`self` e `caches` de mentira, e o handler de `activate` é chamado com chaves
semeadas. Verificado revertendo para o prefixo: o teste acusa com o nome do cache
que sobreviveria.

412 testes verdes.

---

## 2026-08-09 (10)

### 📋 A tabela de estabilidade entra no README — gerada, não escrita

O `README.md` ganhou a seção **"O que a 1.0.0 promete"**: a definição em vigor,
o que ela significa (ponto de congelamento, não "tudo pronto") e a tabela do que
está `estavel`, `beta` e `experimental` — hoje **6 · 5 · 3**.

**Gerada de `src/core/politica.js`**, não escrita à mão, e o CI regera com
`--verificar` e falha se divergir — o mesmo padrão que o repositório já usa para
as bases do Arma 3.

O motivo é específico: esta tabela é a **promessa pública da 1.0.0**. Promessa
que mora em dois lugares diverge, sempre — alguém promove uma flag para
`estavel` no código, esquece o README, e a partir daí o README mente para quem
lê. Com a política como fonte, mentir exige passar pelo CI.

Verificado promovendo `jarvis` de beta para estável em `politica.js` sem
regenerar: o verificador acusou e saiu com código 1.

E a tabela é honesta sobre o que **não** está pronto, que é o ponto do ADR-001 —
uma 1.0.0 que promete menos e cumpre vale mais que uma que promete tudo.

---

## 2026-08-09 (9)

### 🔌 A 1.0.0 é a última versão que o app instala sozinho

Regra do operador, e ela é mais precisa do que o ADR-003 tinha registrado.
A primeira redação dizia "o app trava na linha 1.x e recebe correção"; a decisão
real é outra: **o auto-update termina na 1.0.0**. Depois dela, instalar é escolha
de quem usa — por conta e risco, porque o que vem depois é código novo. Quem usa
o **site** continua recebendo tudo, inclusive a V2. ADR-003 corrigido com a
correção marcada, não reescrito em silêncio.

`desktop/src/main.js`: `autoDownload` vira **`false`**. O app ainda avisa que
existe versão nova — avisar é serviço, baixar sozinho é decidir pelo outro — e o
botão padrão do aviso é **"Agora não"**, para que quem não decidir nada fique
onde está.

**A metade que quase passou batido.** O launcher não embute conteúdo: ele faz
`loadURL` do site ao vivo. Existem **dois** canais de atualização, e desligar o
auto-update fecha só um — se a V2 subisse no mesmo endereço, o app "congelado"
mostraria a V2 sem instalar nada, e o congelamento seria enfeite. Por isso o app
passa a apontar para um alias fixado da linha 1.x, enquanto o endereço principal
segue recebendo o que for publicado.

A distinção que sustenta a regra: *no site você escolhe a cada visita; no app
você escolheu uma vez, ao instalar.*

⚠️ Nada disso vale até sair uma **release empacotada com essas mudanças dentro**,
e o alias `v1.` precisa existir **antes** — um app que aponta para endereço que
não resolve não abre. Passo a passo, na ordem, em `HANDOFF-LOCAL.md` (seção A0):
é trabalho de sessão local.

---

## 2026-08-09 (8)

### ⏱️ Teto de espera nas idas ao mundo externo — o último 🔴

O item dizia "toda chamada externa" e não tinha critério de pronto. Medido antes
de executar: nas superfícies marcadas **estável** são **5 pontos de chamada**,
não 100 páginas.

**O modo de falha coberto é o que não parece falha.** Rede que *recusa* é fácil:
o `fetch` rejeita, o `catch` roda, a UI mostra o erro. Rede que **pendura** é o
problema — o `await` nunca resolve, nenhum `catch` dispara, nenhum fallback
acontece, e o operador fica olhando a tela girar sem nada no console. Não parece
defeito, parece lentidão.

O pior caso era **`getAccessToken()`**: ele roda antes de quase toda operação
autenticada, então um refresh pendurado penduraria junto tudo que depende de
dado. Agora tem teto de 8 s.

Também ganharam teto: **`dbFetch`** (caminho de toda ida ao banco — 8 s, e a
falha vira mensagem legível em vez de um `TimeoutError` cru que ninguém entende
num toast), **`signOut`** (4 s — revogar no servidor é bônus, *sair* é o que o
operador pediu, e um servidor pendurado não pode travar o botão) e a **Wikipédia
do Centro Militar** (6 s, o mesmo teto que `pages/arsenal.js` já usava — o padrão
certo já existia no repo, só não estava em todo lugar).

6 testes com um `fetch` que pendura de verdade e honra o `AbortSignal`.
Verificado que todos ficam vermelhos sem o `signal`.

Detalhe de quem for mexer: `AbortSignal.timeout()` em Node usa timer **unref'd**,
que não segura o event loop — sem um timer comum por perto, o processo encerra
antes de o abort disparar e o runner derruba o arquivo inteiro com "promise still
pending". No navegador não existe esse detalhe. Está comentado no teste.

406 testes verdes.

---

## 2026-08-09 (7)

### 🧪 Sonda de vazamento — e veio limpa

`core/ciclo-vida.js` existe para desmontar o que a página montou, mas ninguém
cobrava. `scripts/sonda-memoria.mjs` visita as rotas pesadas (`/home`,
`/cerebro`, `/radio`, `/visao`, `/mapa`) **6× cada** e mede o que sobra.

**Resultado: nada sobra.** Nem timer, nem contexto de áudio, nem laço de
animação. O ciclo de vida está fazendo o trabalho dele — este é o primeiro item
da fase que não achou defeito, e isso também é resultado.

**Por que não mede heap.** Heap depois de GC é o instrumento óbvio e o pior:
oscila com o coletor, com o cache de imagem, com o JIT. Para não dar falso
positivo precisa de limiar grande, e limiar grande não pega vazamento pequeno —
que é exatamente o que se acumula em cem trocas de rota. Heap entra como número
informativo e não reprova nada.

**O que reprova** são contadores determinísticos instrumentados antes do boot:
`setInterval` sem `clearInterval`, `AudioContext` sem `close()`, e — o que mais
importa neste código, onde 12 páginas rodam laço de animação — **quantos quadros
são pedidos enquanto se está FORA da rota**. Um laço de `requestAnimationFrame`
não cancelado continua queimando CPU numa tela fechada, e cada visita deixa mais
um rodando.

Mede **inclinação**, não valor absoluto: número alto e estável é legítimo (a
página abre 3 timers e fecha 3); o que acusa é crescer a cada visita.

A primeira versão instrumentava só `setInterval` e deu tudo plano — o que era
suspeito, não tranquilizador, já que essas páginas usam `rAF`. Confirmado
plantando um `setInterval` e um laço de `rAF` sem limpeza em `/cerebro`: a sonda
acusou `timers 2→3→4→5→6→7` e quadros ociosos subindo.

---

## 2026-08-09 (6)

### 🧭 Critical Path Test — e duas versões dele que passavam com o defeito presente

O `smoke` abre as 99 rotas, mas **cada uma numa aba nova**. Isso o deixa cego
para a classe de defeito mais chata de um SPA: estado que corrompe *entre*
navegações. A página que só quebra depois de você ter passado por outras três é
verde no smoke e vermelha para quem usa.

`scripts/caminho-critico.mjs` percorre **uma sessão contínua** — boot → arsenal →
home → editor (escreve) → terminal → volta no editor → diagnóstico (revoga
permissão) → **reload** → a escolha sobreviveu? São 15 afirmações de **estado**,
não de pixel. Roda no CI junto do smoke.

**A parte que importa: as duas primeiras versões deste teste eram inúteis.**

A primeira comparava estado *relativo* — "depois do reload é o contrário do que
era antes". Com a persistência quebrada, o boot re-semeia o padrão e o valor
"volta ao que era", que a comparação relativa não distingue de "nunca mudou".
Verde com o defeito presente.

A segunda corrigiu para estado absoluto (revoga → recarrega → **exige negada**) e
**continuou verde**. O motivo era outro: `goto()` para uma URL que difere só no
fragmento é navegação *no mesmo documento* — o JavaScript não recarrega. O passo
chamado "reload de verdade" nunca recarregou, e o teste lia o heap achando que
lia o disco. Corrigido com `reload()` explícito.

Só a terceira versão morde. Verificado quebrando `persistirPermissoes` e vendo a
afirmação do reload ficar vermelha com `concedida=true`.

Um teste que passa com o defeito presente é pior do que não ter teste: ele
compra confiança que não existe. Os dois motivos ficaram escritos em comentário
no próprio script, porque são exatamente os erros que se repetem.

400 testes de unidade + 15 afirmações de jornada.

---

## 2026-08-09 (5)

### 🔒 O sandbox do terminal, provado — e a fila cortada ao que cabe

**O terminal já estava fechado.** O VFS é uma árvore de objetos em memória
(persistida pelo wrapper), o `..` era contido por construção (`stack.pop()` em
array vazio é no-op) e nenhum dos 60+ comandos referencia rede, execução de
código ou a ponte do Launcher — os únicos toques no mundo real são `location`
para navegar e recarregar, que é UI.

O que faltava não era conserto, era **prova**. `test/terminal-sandbox.test.js`
executa comandos de verdade contra a fronteira: `cat /etc/passwd` (o arquivo
existe na máquina do CI — se o terminal alcançasse o disco, apareceria),
`rm -rf /`, escrita com `/../../../../tmp/`, `ls /` conferindo que `proc`,
`sys` e `root` não aparecem. Mais uma varredura que reprova o commit se algum
dos três arquivos passar a citar `fetch`, `eval`, `import(` ou `baluarte.invoke`
— verificada introduzindo um `fetch` e vendo o teste falhar.

E roda em **Node puro**, sem navegador e sem DOM: se o terminal precisasse de
filesystem real, nada disso teria funcionado.

Nota honesta: a única falha da rodada foi **do teste**, não do código. A primeira
versão confundia substring com segmento e acusava `....` — nome de diretório
perfeitamente legítimo — de ser travessia. O invariante certo é por segmento.

**Corte de escopo em dois itens da fila**, decidido junto com o operador:

- *Error handling nas bordas* passa a valer só para as superfícies marcadas
  **`estavel`**. A versão anterior ("toda chamada externa") não tinha critério de
  pronto — são ~100 páginas, a maioria `beta` — e item sem fim definido segura
  release para sempre. Beta não promete recuperabilidade; estável promete.
- *Vazamento de memória* vira uma sonda nas ~5 rotas mais pesadas (3D, áudio,
  canvas). Limpo, fecha; acusou, vira item próprio com o vazamento nomeado.

400 testes verdes (14 novos).

---

## 2026-08-09 (4)

### 🩹 XSS no preview de markdown — a única das 58

Item 🔴 da fila: triar os 58 `innerHTML`. Feita uma a uma. **Uma era
vulnerabilidade de verdade**; as outras 57 são seguras, e agora o motivo de cada
categoria está escrito em vez de suposto.

**O buraco.** O renderizador de markdown da `/utilidades` escapava `<`, `>` e `&`
do texto e parava aí. Mas `href` **não precisa de tag nenhuma**:

```
[clique](javascript:alert(1))
  → <a href="javascript:alert(1)" target="_blank">clique</a>
```

e executava no clique. O escape do texto nunca tocou nisso, porque o problema
nunca esteve no texto — esteve no atributo. É o caminho de quem cola markdown de
qualquer lugar no preview.

**A correção.** Filtro de esquema: sem esquema (relativo, âncora, caminho) passa;
com esquema, só `http`, `https` e `mailto`. Qualquer outro vira `#` — inerte e
visível, o link continua lá e não faz nada. Caracteres de controle são removidos
antes de olhar o esquema, porque o navegador também os ignora ao resolver a URL
(`java<TAB>script:` executaria enquanto uma checagem ingênua não veria esquema).
Aspas passaram a ser escapadas junto com `<`/`>`/`&`.

Extraído para `src/utils/markdown.js` para poder ser testado sem navegador — um
renderizador que produz HTML a partir de texto de fora precisa de teste. **15
testes**, e 4 deles falham se o comportamento antigo voltar (verificado).

**As outras 57, por categoria:** 21 são `innerHTML = ''`; 8 são HTML literal
estático; 17 interpolam só números calculados; 3 passam por `highlight()`, que
escapa nos três caminhos; 1 usa `escapeHtml()` explícito; 6 interpolam
identificadores internos. E 1 é o console do runner do editor, que roda dentro de
um iframe `sandbox="allow-scripts"` **sem** `allow-same-origin` — origem opaca,
sem acesso ao DOM ou storage do pai. Executar ali é o propósito do recurso.

Verificado no navegador: `javascript:` vira `href="#"`, o clique não dispara
nada, o link legítimo continua funcionando e a tag no texto sai escapada.
386 testes verdes.

---

## 2026-08-09 (3)

### 🗄️ O storage direto some — e dois bugs saem junto

Item 🔴 da fila: 11 chamadas cruas a `localStorage` viviam fora do wrapper, sem
versão e sem classificação. Sobraram **2**, ambas intencionais e documentadas.
Mas o valor não foi a arrumação — foram os dois defeitos que a varredura achou.

**O "Limpar todos os dados locais" mentia.** `utils/wikipedia.js` gravava o cache
como `wiki:sum:pt:Título`, **cru, sem o `baluarte:`**. O botão do `/perfil`
sempre filtrou por esse prefixo — então nunca alcançou essas chaves. O operador
clicava, lia *"todos os dados locais foram apagados"*, e o registro do que ele
consultou continuava no disco. O relatório de storage da `/shadow` também não os
contava. Agora a gravação é namespaced, e o botão varre o legado que ficou para
trás (varredura descartável depois da 1.0.0).

**O terminal caía com uma entrada corrompida.** `loadHistory()` fazia
`JSON.parse` direto, sem `try` — `saveHistory()` tinha proteção, a leitura não.
Cota estourada no meio de uma gravação e a página inteira parava de abrir. O
wrapper trata e devolve o fallback.

**Classificação.** `auth:session` é **`sensivel`, não `secreto`** — e a distinção
importa: `secreto` é recusado na gravação, e a sessão *precisa* viver no
navegador; é assim que auth web funciona. O que a protege não é escondê-la do
frontend (impossível), é ser o JWT do próprio usuário, curto, renovável, com o
RLS decidindo o alcance. Classificar como `secreto` não deixaria mais seguro,
deixaria o login quebrado. `terminal:history` também é `sensivel` (é o que o
operador digitou).

**As 14 chamadas a `sessionStorage` ficam diretas, por decisão.** O wrapper é
`localStorage`, que persiste para sempre, e essas flags existem justamente para
morrer com a aba. Migrá-las trocaria a semântica — "já recarreguei uma vez"
virando permanente transformaria a guarda anti-loop do boot num bloqueio
permanente. Justificado em `core/politica.js`.

**`test/storage-namespace.test.js`** impede a reincidência: falha se um arquivo
novo tocar `localStorage` fora da lista de exceções — que tem teto e exige
justificativa por linha, senão vira o lugar onde a regra morre aos poucos.

Verificado no navegador com dado legado semeado: o histórico do terminal
sobreviveu e foi migrado (`{"__bv":1,"d":[…]}`), a sessão continuou válida
(ninguém foi deslogado) e o "limpar tudo" apagou inclusive a chave fora do
namespace. 371 testes verdes.

---

## 2026-08-09 (2)

### 🔐 A fronteira de permissão sai do papel — política, boot e `/diagnostico`

O PR anterior entregou os motores; eles estavam **vazios**. Este liga tudo.

**`src/core/politica.js` (novo) — o lugar único onde o Baluarte declara o que
existe.** Lido de cima a baixo responde três perguntas: o que o sistema é capaz
de fazer (**19 permissões**, 7 delas `restrito`), o que ele guarda no navegador
(9 chaves com versão e classificação) e o que está pronto para a 1.0.0 (6
estáveis, 5 beta, 3 experimentais). Espalhado por 100 páginas ninguém consegue
responder *"o que um agente com acesso total conseguiria fazer aqui?"* — e é
justamente essa a pergunta da fase.

Quatro permissões estão declaradas **antes de existirem** (`terminal.executar`,
`arquivos.ler`, `arquivos.escrever`, `rede.chamar`). No dia em que a ferramenta
aparecer, ela já nasce atrás de uma permissão que ninguém concedeu, em vez de
nascer aberta e "ser protegida depois".

**Uma armadilha que quase entrou.** Declarar esquema numa chave que já tem dado
gravado faz o storage tratar esse dado como versão 0 — e sem `migrar` o `get()`
devolve o fallback. Na prática: as abas do editor do operador sumiriam no
primeiro deploy, sem um erro no console. Na máquina de quem programa isso nunca
aparece, porque lá o dado já nasceu versionado. Todo esquema declarado leva
`migrar` identidade (v0 e v1 têm o mesmo formato), e há teste cobrando que
**nenhuma chave declarada perca dado legado**.

**JARVIS atrás da fronteira.** `runTool()` é o gargalo por onde toda chamada do
agente passa; agora ele exige a permissão antes de executar — e **antes do
guard**, porque perguntar "esse comando é perigoso?" sobre uma ação que nem devia
estar disponível é responder tarde. O mapa mora em `src/utils/jarvis-permissoes.js`
(separado para poder ser testado sem navegador). Ferramenta fora do mapa cai no
padrão **fechado**: tool nova nasce negada, com mensagem dizendo qual permissão
falta e onde liberar.

**O padrão do operador não quebra o que já funcionava.** Concede `'*'` — que por
construção exclui `restrito` — mais as três capacidades restritas que a interface
**já expunha** (`jarvis.memoria.ler`, `jarvis.skills.escrever/executar`),
escritas uma a uma por extenso. Conceder `restrito` por engano não pode ser
possível. A escolha do operador persiste: revogar não volta no boot seguinte.

**`/diagnostico` (rota nova).** O painel do item 8 do #420: 9 sondas do ambiente,
a tabela de estabilidade, as 19 permissões com liga/desliga, os esquemas com
versão gravada vs. esperada, e o rastro das últimas decisões. Sem `innerHTML` em
lugar nenhum — nada que venha do storage do operador vira markup. Flag de outro
ambiente mostra a explicação no lugar do botão: botão que não faz nada é pior que
botão nenhum.

Verificado no navegador (Chromium): a página desenha, o liga/desliga funciona e a
gravação sai no envelope versionado — `{"__bv":1,"d":{…}}`, o storage novo
trabalhando ponta a ponta.

29 testes novos (19 política · 10 mapa de tools). Suíte: **365 verdes**. Build ok.

---

## 2026-08-09

### 🛡️ Começa a fase de hardening até a 1.0.0 (#420)

A issue #420 fixou o que a 1.0.0 significa — *"tudo que está marcado como estável
é previsível, testado, recuperável e seguro"* — e que ela é um **ponto de
congelamento**, com a V2 (plataforma/TypeScript/MCP) só depois. Este é o primeiro
PR dessa fase: a fundação do Core, mais a fila e as decisões que sobrevivem à
sessão.

**Auditoria de segurança — primeira varredura.** Resultado melhor que o esperado:
**nenhum segredo** no frontend (nada de `sk-`/`AIza`/`ghp_`/JWT em código), e o
único `new Function` do repositório (`utils/jarvis-skills.js`) já estava
sandboxed em duas camadas. Os buracos reais eram outros — 58 `innerHTML` a
triar, 25 chamadas diretas a `localStorage` fora do wrapper, e nenhuma fronteira
de permissão. Tabela completa em `docs/HARDENING-1.0.0.md`.

**`src/core/permissions.js` — a fronteira de acesso (novo).** `JARVIS → Permission
→ Tool`, nunca `JARVIS → Tool`. Deny-by-default; permissão precisa ser
**declarada** antes de usada — `exigir('arsenl.read')` com typo falha alto em vez
de virar negação silenciosa que a UI tenta consertar pedindo autorização ao
operador; e curinga (`arsenal.*`) **nunca** alcança risco `restrito`, enquanto
revogar por curinga alcança tudo (tirar acesso é sempre seguro, dar não é).
Motivo e alternativas descartadas em `ADR-002`.

**`src/core/events.js` — curinga.** `bus.on('*')` e `bus.on('arsenal:*')`, com o
nome real do evento em `meta.event`. É o que permite histórico, telemetria,
diagnóstico e o contexto do JARVIS existirem sem manter uma lista fixa de
eventos — a lista que ninguém lembra de atualizar. A API antiga não mudou:
handler de um argumento só ignora o `meta`.

**`src/core/storage.js` — versionamento e classificação.** Uma chave pode
registrar esquema (versão + `migrar` + classe de dado); o valor passa a ser
gravado num envelope e o dado legado é migrado a partir da versão 0, uma vez, e
regravado. Dado de uma versão **mais nova** (o operador usou o app atualizado e
depois abriu uma aba com o bundle em cache) é preservado em vez de adivinhado.
E a classe `secreto` é **recusada na gravação**: o frontend é público, e a regra
"nunca segredo no frontend" agora é cobrada em vez de lembrada.

**`src/core/flags.js` — estabilidade e liberação (novo).**
`estavel`/`beta`/`experimental` + gate `web`/`app` do #238. Uma flag experimental
**não pode** nascer ligada por padrão — é o que impede a 1.0.0 de prometer
estabilidade e entregar experimento. E nem a escolha do operador liga uma flag
app-only na web: o gate do #238 não pode ter porta dos fundos.

**CI: auditoria de dependências.** `npm audit --omit=dev --audit-level=high`
bloqueia; o audit completo fica informativo. As 6 vulnerabilidades atuais são
**todas** de devDependency (`postcss` via vite, `tar` via `@capacitor/cli`) e
nenhuma chega ao navegador de quem visita o site — reprovar merge por causa
delas ensinaria a ignorar o vermelho.

**Documentação que sobrevive à sessão.** `docs/HARDENING-1.0.0.md` (fila
executável, com o resultado da auditoria), `docs/architecture/` com `overview.md`,
`v2-vision.md` (**bússola, não obra** — lista explicitamente o que *não* fazer
até a 1.0.0 fechar) e dois ADRs. `CLAUDE.md` aponta para a fase atual.

79 testes novos (23 flags · 22 permissions · 18 storage · 16 events). Suíte
completa: **336 verdes**. Build ok.

---

## 2026-08-03

### 🐞 `call _fnc_lim` recebia ARRAY: todo texto dos dumps novos saiu embrulhado

Os dumps antigos chamam o helper de limpeza como `(x) call _fnc_lim` — string
direta. Os sete novos chamavam `[x] call _fnc_lim`, e em SQF isso faz `_this`
ser o **array** `[x]`. O helper só sabe limpar string, cai no
`exitWith { str _s }` e devolve a representação do array:

```
"nome":  "[\"Economic Victory Marker\"]"
"icone": "[\"\\x\\A3A\\...\\EconomicVictory.paa\"]"
```

8841 campos embrulhados só em simbologia — e é por isso que simbologia, dlc,
manual e varredura acusaram 1390 imagens "sem PBO": o caminho não era um
caminho, era o texto de um array.

Pior que feio: campo **ausente** virava `[""]` em vez de `""`. "O config não
declara" passava a parecer "declara e está vazio" — exatamente a distinção que
esta pipeline existe para preservar.

Dois consertos, de propósito:

1. os 48 usos de `[x] call` viraram `(x) call` nos sete `.sqf`, e uma guarda no
   CI impede a volta. A diferença é um caractere, não dá erro nenhum, e some
   dentro de um dump de 900 linhas;
2. `desembrulhar()` em `a3dump_comum`, aplicado em `registros()`, desfaz o
   embrulho **ao ler**. Quem já rodou o dump antigo só reprocessa o `.rpt`, sem
   voltar ao jogo. Ele avisa quantos campos desembrulhou, para não virar
   conserto silencioso; só desfaz o caso inequívoco (`[" ... "]`), porque o
   `_fnc_lim` dos dumps antigos troca aspas duplas por simples e nunca casa.

Passou por dois testes verdes porque o `.rpt` sintético era escrito à mão, com
os valores já limpos. Terceira vez que o formato estava provado e o
**transporte** não — as outras duas foram o UTF-8 e o comentário.

### 🎯 Motor do Vanguard sincronizado, com os 65 testes que nunca vieram

A cópia vendorizada em `src/utils/vanguard/` estava atrasada em uma feature
inteira: faltava `arma3-grid.js` e o `fire-mission.js` estava 33 linhas atrás.
Justamente a integração dos terrenos do Arma 3 — a peça que converte referência
de grade do jogo em metros e resolve o vetor de tiro nos 31 mundos medidos, que
é o que liga o computador de tiro ao acervo da wiki.

O passo 1 do `Project-Vanguard/docs/INTEGRACAO-BALUARTE.md` manda copiar o motor
**e** os testes. Só a primeira metade tinha sido feita: o Baluarte rodava o motor
do Vanguard sem nenhum teste dele. Agora são 65 (11 de grade do Arma 3, 30 de
balística, 24 de coordenadas), e a suíte do repositório foi de **136 para 201**.

Única adaptação: o import da base de terrenos, que em `src/utils/vanguard/` está
um nível mais fundo que em `src/engine/`. Nada mais foi tocado — a regra do
`src/utils/vanguard/LEIA-ME.md` vale: conserto vai no repositório de origem
(`Project-Vanguard`) e volta por cópia.

---

## 2026-08-02

### 📡 App extrai o Arma 3 e manda pro repositório · **0.9.1**

O caminho do dado deixou de ter cinco ferramentas. Era: colar o `.sqf` no jogo →
abrir o terminal → rodar o parser Python → abrir o git → commitar → empurrar.
Agora o app cuida de tudo depois do jogo, na aba **📡 Extrair** de
`/arma3-tutorial` (só dentro do Launcher).

Três passos separados **de propósito** — um botão único que fizesse tudo
esconderia o momento de conferir, e o que sai daqui vira commit no repositório:

1. **ver** — lê o `.rpt` e diz o que o jogo já dumpou, com contagem de registros
   e aviso de dump incompleto; lista o que falta colar no console, com o caminho
   de cada `.sqf`;
2. **extrair** — roda os parsers e mostra o log inteiro, destacando os avisos
   (placar divergente, campo truncado) que são o sinal de que algo se perdeu;
3. **entregar** — commita num ramo próprio. Empurrar é um segundo clique.

#### As quatro regras que definem a ponte

- **Nenhum segredo nosso.** O app não guarda token do GitHub, não pede senha e
  não fala com a API. Quem empurra é o `git` da máquina, com a credencial que já
  existe. Guardar token de repositório num app de desktop seria trocar
  conveniência por mais um segredo para vazar — e contradiria a postura que o
  `arquivos.js` já sustenta.
- **Nunca no ramo principal.** Só empurra para `arma3/extracao-*`, e recusa
  `main`/`master`/`HEAD`/`production` explicitamente. O que sai daqui vira PR.
- **Só o que a extração produz.** O `git add` recebe lista fixa de JSONs de
  `scripts/arma3/out/`. Alteração pendente fora dali **bloqueia** a entrega —
  extração não carrega edição alheia junto.
- **Uma implementação do parsing.** Os parsers continuam em Python; o app
  orquestra. Portar seis parsers para Node criaria duas versões da mesma
  leitura — o defeito que já apareceu aqui (o `/cripto` tinha uma segunda
  implementação de Morse e ela engolia letra em silêncio).

Tudo por `execFile` com argv fixo — nunca `shell`.

`desktop/testar-arma3.js` prova as regras num repositório descartável com
`origin` local: ramo protegido recusado (4 nomes), arquivo alheio bloqueado,
arquivo de nome estranho na pasta de saída não commitado, e o empurrão só
acontecendo com `empurrar: true`. O teste pegou um defeito real antes do
commit — `git status --porcelain` agrupa diretório não rastreado numa linha só
(`?? out/`), então a peneira por nome não via nada e a entrega diria "nada
mudou" com a pasta cheia. Justamente no caso que mais importa: a primeira
extração de uma base nova.

### 🧰 Seis extratores novos para o Arma 3

Antes de acrescentar coisa nova, tirar do jogo o que o config já tem:

| etapa | o que traz |
|---|---|
| `grupos` | **ordem de batalha** — a composição de cada esquadrão por facção, na ordem, com quem lidera |
| `funcoes` | catálogo das ~3000 funções SQF |
| `manual` | o Field Manual inteiro |
| `simbologia` | marcadores de carta (APP-6), cores de lado, patentes, insígnias |
| `terreno-fisico` | superfícies: quanto freiam o passo, som, poeira; vegetação e clima |
| `proveniencia` | `CfgPatches`/`CfgMods` — quem **registra** cada classe |

`proveniencia` conserta algo hoje mantido à mão: o `DIR_DLC` de
`gerar_base_armas_comum.py` é um dicionário escrito manualmente porque o campo
`fonte` do dump é `configSourceMod` — quem patcheou por último, e com ACE
carregado quase todo o vanilla apareceria como do ACE. Dicionário à mão
envelhece calado. O índice `donoDe` responde a pergunta certa.

`npm run testar-parsers-arma3` roda os seis contra `.rpt` sintético: formato
lido, campo picado remontado, ausência preservada (vazio → `null`, nunca zero).
Pegou um defeito meu — a conversão de cor usava `round()`, que em Python
arredonda meio para o **par**: 0,3 × 255 = 76,5 virava 76, e navegador dá 77.

#### Nenhum dos seis rodava no jogo — dois defeitos, a mesma causa raiz

O teste provava que o **parser** lia o formato. Não provava que o `.sqf`
**sobrevive ao caminho até o jogo** — e ele é colado no debug console, que é
bem menos tolerante que um arquivo.

- **Acento e caractere de caixa** (PR #410). Os seis saíram em UTF-8, com
  acentuação e 502 ocorrências de `─`/`│` desenhando moldura de comentário. O
  campo de entrada do console não é UTF-8. Os seis que funcionam são `us-ascii`.
- **Comentário** (PR #411). Colando, as quebras de linha não sobrevivem: o
  script vira uma linha só, e aí um `//` deixa de comentar uma linha e comenta
  **todo o resto do arquivo**. O jogo acusa erro de sintaxe apontando para um
  ponto que não tem nada de errado. A correlação foi exata — os seis que
  funcionam têm **zero** comentário, os seis novos tinham 23 a 31.

Os comentários saíram e a documentação foi para [`scripts/arma3/DUMPS.md`](../scripts/arma3/DUMPS.md),
que é onde ela podia morar: o que cada dump traz, o formato que emite, e as
ressalvas que estavam nos cabeçalhos (o que **não** existe no config, a licença
do Field Manual, `size`/`scope` que valem zero legitimamente, `coefVelocidade`
ausente ≠ 1).

`testar-parsers.py` ganhou a etapa 0, que cobra as duas regras nos doze `.sqf`
e roda no CI. As duas foram conferidas reintroduzindo cada defeito.

A lição vale além do Arma 3: **teste de formato não é teste de transporte.**
O dado passava no parser e morria no caminho.

### 🖼️ O extrator de ícones cobria 9% do jogo — e não dizia

Pedido: extrair os ícones de tudo. Extrair exige a máquina do operador (os
`.paa` estão nos PBOs da instalação, e o `Pal2PacE.exe` é do Arma 3 Tools). Mas
o que travava não era a máquina — eram **dois defeitos já no ar**.

**O extrator só pegava armas.** `alvos_do_dump()` lia `arma3-config.json` e
`arma3-catalogo.json`. O segundo **nunca existiu**: o plano previa um
`dump-catalogo.sqf` que foi substituído por `dump-itens.sqf` e
`dump-veiculos.sqf` — que rodaram, e cujos JSONs estavam em `out/` desde 26/07
com 67.368 itens, 24.261 veículos e 44.761 soldados. Arquivo ausente não dá
erro em Python: ele pulava tudo que não fosse arma, calado. **2.417 imagens no
site contra 26.956 que o config declara.** O `HANDOFF-LOCAL.md` também mandava
rodar `parse-catalogo.py` e `gerar-catalogo.py`, que também não existem.

**310 imagens receberiam a foto de outra.** O nome do arquivo saía do *basename*
do caminho virtual, e `\fir_f14\icon.paa` e `\fir_f15\icon.paa` têm o mesmo
basename — o segundo reaproveitava a imagem do primeiro pela checagem de "já
existe no destino". No dado real: **186 basenames colidindo, 12 deles em armas
já publicadas.** O `scripts/arma3/README.md` já tinha diagnosticado isso e
concluído que estender exigia "uma mudança de projeto, não só um parâmetro
novo" — estava certo.

`imagens_catalogo.py` separa **o quê** extrair (testável sem o jogo) de **como**
(precisa dos PBOs):

- dedupe pelo caminho virtual inteiro, normalizado — o config escreve o mesmo
  `.paa` com `/` ou `\`, com e sem barra inicial, em qualquer caixa;
- nome desambiguado por hash, e o **grupo inteiro** ganha sufixo, não só os
  repetidos: se só o segundo ganhasse, quem fica com o nome limpo dependeria da
  ordem de iteração, e um mod novo faria dois ícones trocarem de lugar sem nada
  no diff explicando;
- uma pasta por categoria, porque a garantia de unicidade é intracategoria;
- **dump ausente devolve `None`, não `{}`** — "não rodei" e "rodei e não achei
  nada" pararam de ser a mesma coisa. É o primeiro defeito em uma linha.

Os 16.550 `editorPreview` são renders grandes do editor, não ícones: vão para
`out/renders/`, fora de `public/` (mega-plano #238 — web leve, app completo).

`npm run testar-imagens-arma3` prova injetividade, determinismo e independência
de ordem, e roda a propriedade contra os 26.956 caminhos reais quando os dumps
estão na máquina. Os dois defeitos foram conferidos reintroduzindo cada um.

Falta rodar na máquina: `docs/HANDOFF-LOCAL.md` § E1-b. É retomável.

### 🗺️ `dump-icones.sqf` — a varredura do config inteiro

Os doze dumps existentes varrem **árvores nomeadas** (`CfgWeapons`,
`CfgVehicles`, `CfgGlasses`) com **lista de campo fixa**. Imagem declarada em
qualquer outra classe era invisível para o pipeline — foi assim que ele chegou a
2.417 ícones enquanto o config declara 26.956. Este visita **toda classe do
`configFile`** e recolhe toda propriedade de texto que aponta para `.paa`/`.pac`.

Mods e DLCs entram de graça: o config da sessão em execução já é a união de tudo
que está carregado.

```
I |id|caminho              imagem distinta, numerada na ordem de aparição
R |classe|propriedade|id   a classe DECLARA este retrato
PLACAR|classes|imagens|retratos
```

O `id` existe para a linha `R` não repetir o caminho — o mesmo `.paa` é
declarado por milhares de classes. Por dentro: pilha explícita em vez de
recursão (sem limite de profundidade), `createHashMap` para deduplicar em O(1)
(`pushBackUnique` sobre dezenas de milhares de caminhos seria O(n²) e travaria
o jogo), e teste barato antes da limpeza cara, para não rodar quatro
`regexReplace` em milhões de propriedades.

**Três limites declarados**, porque nenhum é óbvio:

- **um `.sqf` não extrai imagem.** A única saída do motor é texto no `.rpt`; não
  existe API para despejar os bytes de um `.paa`. Este dump diz *quais imagens
  existem*, e os pixels continuam saindo do PBO com `Pal2PacE`;
- **nem toda imagem do config é ícone.** A varredura pega qualquer textura
  declarada como texto — fundo de interface, textura de material, arte de
  carregamento. Só as propriedades que **significam** "a cara desta coisa"
  alimentam a extração; o inventário completo serve para diagnóstico;
- **não diz qual imagem cada classe EFETIVAMENTE usa.** Lê só o que a classe
  declara, sem herança, e a maioria dos itens herda o `picture` do pai. Quem
  resolve herança são os dumps específicos.

É o mais caro dos treze — visita todas as classes do config, o que num jogo bem
modificado passa de 200 mil, e emite `ANDAMENTO` a cada 20 mil para dar sinal de
vida.

O sétimo parser entrou no teste e foi conferido reintroduzindo dois defeitos. O
primeiro conferidor que escrevi para a linha `ANDAMENTO` **testava algo
impossível** — procurava o nome do tipo num dado de onde o tipo já tinha sido
removido, e por isso passava com o defeito presente. Trocado pela asserção do
conjunto exato de classes, que pega `ANDAMENTO` e `PLACAR` virando retrato.

### ⚙️ `npm run atualizar-arma3` — um comando que só mexe no que mudou

O pipeline tinha treze parsers, um extrator de imagem e sete geradores de base,
cada um chamado à mão. Agora há um comando que percorre o grafo inteiro e roda
só o que ficou para trás.

O ganho maior não é a conveniência. `achar_rpt` lia **cada `.rpt` inteiro**
procurando **uma** marca; chamado pelos treze parsers, eram treze leituras
completas de uma pasta cujos arquivos passam de 1 GB. Agora é uma passada,
procurando as treze marcas ao mesmo tempo.

| degrau | como decide |
|---|---|
| parse | cada `out/*.json` guarda em `fonte` o `.rpt` de onde saiu — mesmo nome e mais velho que o JSON? já foi lido |
| imagens | já era retomável: imagem no destino não é reextraída |
| bases | mtime — entrada mais nova que saída, regera |

Por que mtime e não hash: o `.rpt` passa de 1 GB, e ler tudo para decidir se
vale a pena ler tudo não faz sentido. Misturar hash nos intermediários criaria
dois conceitos de "mudou" no mesmo pipeline. mtime é o critério do `make` há
cinquenta anos e o modo de errar dele é conhecido — `touch` regera à toa, o que
custa tempo, não corretude.

`pipeline_arma3.py` guarda o grafo e as regras, separado do executor: decisão é
lógica pura, e lógica pura dá para provar sem ter o jogo. A escolha do `.rpt` é
conferida por **equivalência com o `achar_rpt` de verdade**, não contra uma
reimplementação da regra — se divergisse, rodar um parser sozinho daria um
resultado e pelo orquestrador daria outro.

### 🐛 `alvos()` assumia dicionário, e os dumps novos escrevem lista

As categorias de imagem que eu criei para `simbologia`, `dlc` e `manual`
estourariam com `AttributeError` **na máquina do operador**, no instante em que
esses dumps existissem: os parsers novos emitem `[{classe: ...}]` e os antigos
emitem `{classe: {...}}`.

Nenhum teste pegava, porque esses JSON não estavam no repositório — o caminho
nunca era exercitado. Só o CI tropeçou, e o traceback nem dizia qual categoria.

`registros()` lê as duas formas; a categoria **declara** qual campo do item é o
nome dele (o de `mods` é `mod`, não `classe` — adivinhar e cair em string vazia
juntaria todas as entradas numa só, calado); item sem o campo-chave é
descartado; e a checagem contra o dado real reporta a categoria em vez de
estourar. Validado contra a extração de 02/08: **28.310 caminhos, zero colisão,
12 categorias**.

### 🔧 As bases não tinham sido regeradas depois da extração

Os commits `528eec0b`, `5fefd6f9` e `94b73ae5` deixaram o `main` **vermelho**: a
extração nova entrou em `out/`, mas `src/data` e `public/arma3` continuaram com
o conteúdo derivado do dump de julho, e o passo *"As bases geradas batem com o
commit?"* reprovou. Regeradas aqui:

```
.rpt de origem        2026-07-26 → 2026-08-02
grupos de compat.     107 → 580
registros CfgVehicles 24261 → 23531
facções               248 → 237
```

O teste dos totais pegou `A3EQP_TOTAL` defasado (988 na tabela, 987 na base).

### 🧊 Modelo 3D: medir antes de montar o Blender

Um `.p3d` diz o que é nos primeiros quatro bytes — `MLOD`/`P3DM` (editável, o
Arma Toolbox importa) ou `ODOL` (binarizado, sem leitor confiável). O que o jogo
distribui é quase tudo ODOL, porque binarizar **é** o passo de publicação.

`npm run diagnostico-modelos` dá a proporção em dois segundos, lendo só o
cabeçalho: sem jogo, sem Blender, sem Arma 3 Tools. Se der zero MLOD, montar o
Blender não resolveria nada — e é melhor saber disso antes de gastar a tarde.

Havendo MLOD, `converter-modelos.py --sonda` roda o Blender **sem janela** sobre
um modelo e relata o que achou na máquina: addon instalado, addon ligado, que
operador de importação existe, e se a importação funciona em `--background`.

`blender_p3d_glb.py` **procura** o operador em vez de chamar pelo nome: o Arma
Toolbox não é nosso, muda de versão e já mudou de nome de operador. Fixar o nome
e errar daria `AttributeError`, que não distingue "addon faltando" de "addon
desligado" de "nome mudou".

### 👂 O ouvido do J.A.R.V.I.S. (#405)

Ele **falava e não ouvia**. `jarvis-voice.js` tem três motores de fala desde a
0.5.0 — ElevenLabs local, ElevenLabs pelo servidor, `speechSynthesis` offline —
mas não havia `SpeechRecognition` nem detecção de palma em lugar nenhum. O
gatilho que a issue pede em detalhe simplesmente não existia.

`escuta-nucleo.js` é a metade que dá para provar: zero DOM, zero dependência.
O `fft-engine` cuida do áudio; aqui entra energia por quadro e saem eventos.

O teste que importa **não é "palma dispara"** — é **música alta não dispara**. O
primeiro é fácil, qualquer som passa de um limiar. O segundo decide se dá para
deixar ligado, porque um detector ingênuo dispara a noite inteira e ninguém
entende por quê. A discriminação é por forma, não por volume: palma sobe muito
acima do fundo, sobe rápido e cai quase tão rápido; música e voz sustentam.

O gesto é palma **dupla** de propósito — palma sozinha acontece o tempo todo:
porta batendo, objeto caindo, aplauso na TV.

Um dos 17 testes reprovou, e o defeito era do **teste**: o gerador de sinal
decaía em número de quadros, então a mesma palma durava 100 ms a 60 fps e
200 ms a 30 fps. Palma real dura o que dura.

Privacidade: a janela guarda um número por quadro, nunca amostra de áudio.

### 📈 Análise de série temporal — o núcleo de decisão

Portado de `server/indicators.ts` do `stock-analyzer-bot`. O nome do repo de
origem engana o escopo: SMA, EMA, RSI, MACD e Bollinger não são operadores
financeiros, são operadores de **série temporal**. Servem para qualquer número
que chegue periodicamente.

**Dois defeitos do original não foram portados:**

- **o histograma do MACD era sempre zero.** A linha de sinal estava marcada
  como `Placeholder - would need full history` e recebia o próprio MACD, então
  `histograma = macd − macd`. O histograma *é* o sinal do MACD;
- **`determineTrend` devolvia "Sideways" por falta de dado.** Com coleta a cada
  2h30, a SMA(200) exige **21 dias** de histórico — três semanas dizendo "está
  de lado" quando o certo é "ainda não sei". Só um dos dois autoriza agir.

Os dois viraram teste de regressão, conferidos reintroduzindo cada defeito.

O intervalo entre amostras viaja junto e cada indicador reporta a janela em
horas: RSI(14) a cada 2h30 cobre 35 h. E `analisar()` devolve o que ainda
**não** dá para afirmar, com quantas amostras faltam.

### 🎯 Três domínios, um motor

Economia, saúde do próprio ecossistema e comunidade usam o mesmo cérebro. O que
permite isso é a **polaridade declarada**:

```
direção é MATEMÁTICA     → analise-serie.js
significado é DECLARAÇÃO → a polaridade da fonte
```

Bitcoin subindo é uma coisa; bundle inchando é outra. A matemática devolve
"alta" nas duas e está certa nas duas — sem a polaridade, o relatório anunciaria
regressão como boa notícia. O teste central prova isso: a **mesma série** dá
`MELHORANDO` em jogadores online e `PIORANDO` em peso de bundle.

Polaridade não declarada não vira palpite, vira `indefinido`. Limites de
plausibilidade são por fonte — zero rota quebrada é ótimo, bitcoin a zero é a
API falhando.

### 🧊 Modelo 3D: medido, e a resposta é não

Os 1.302 `.p3d` extraídos foram classificados pelo cabeçalho:

```
MLOD (converte)      0
ODOL (binarizado) 1302     v71 ×85 · v73 ×586 · v75 ×631
```

**Zero MLOD.** O importador do Arma Toolbox lê MLOD, então o Blender não
resolve este acervo — e três versões de engine no mesmo conjunto são a
demonstração de por que não existe leitor confiável de ODOL.

O diagnóstico levou dois segundos e dispensou montar a ferramenta. O que sobra:
**Arma 3 Samples** (a Bohemia publica modelos de exemplo em MLOD), ou pedir o
fonte a autores de mod. O pipeline funciona neles sem mudar uma linha.

### 🔍 Auditoria página a página — as 97 telas

Nove rodadas, agrupadas por domínio do Nexus. **Vazamento 0/97 ·
acessibilidade 0/97 · estreito 0/97.** 136 testes (eram 21), cada conserto
conferido reintroduzindo o próprio defeito.

Oito defeitos reais, sendo três que davam **resposta errada em silêncio**:

- **Morse decodificava I como Í em toda mensagem** — "SIM" saía "SÍM". A tabela
  tinha código repetido e o último vencia na inversa;
- **o NOT bit-a-bit devolvia 0 para qualquer entrada** — `(1 << 32) - 1` é zero
  em JavaScript, e 32 bits é o padrão da tela;
- **`/cripto` engolia letras** — segunda implementação de Morse, que descartava
  em silêncio o que não estava na tabela;
- **a carga fria resolvia a rota duas vezes** — `router.start()` chamava
  `resolve()` e ainda registrava `DOMContentLoaded`, que dispara depois porque
  módulo é deferido. As 25 páginas que guardam elemento em variável de módulo
  ficavam apontando para a cópia órfã: link direto, F5 e favorito entregavam
  tela que renderiza e não obedece. A `/calc-cientifica` abria com o teclado
  inteiramente morto;
- **`/modelos-3d` retinha um contexto WebGL por visita** — o navegador só
  permite ~16, então a galeria parava de renderizar depois de algumas idas e
  vindas;
- `/fft` deixava o AudioContext ligado ao sair; `/morse` ficava com o Play morto
  ao voltar; as 200 casas da batalha naval não tinham nome.

**`/arma3-tutorial`: 1885 kB → 122 kB.** Importava 15 bases estaticamente para
mostrar uma aba de 33 kB. O que prendia era a barra de abas mostrar o total de
cada base — o número só existia dentro dos megabytes. Os totais saíram para
`arma3-totais.js` (1 kB, gerado, com teste conferindo contra a base real) e as
bases passaram a descer por aba. `/wiki-arma3` caiu de 1595 para 480 kB junto.

`src/core/ciclo-vida.js` deu ao shell o gancho de saída que faltava — 19 páginas
vigiavam o `document.body` inteiro com `MutationObserver` só para descobrir que
tinham saído.

O limite do instrumento ficou registrado em `docs/nexus/grupos-auditoria.json`:
o vigia não pega defeito que só aparece ao ACIONAR a tela, nem na CARGA FRIA,
nem resposta errada. As três classes só apareceram lendo o código. Verde no
vigia é o piso, não o teto.

---

## 2026-07-27

### 📚 Wiki de Arma 3 **0.9.1** — 459 → 1.816 artigos, tudo medido no config

A wiki deixou de ser "o jogo base + os mods + o arsenal" e passou a cobrir o
acervo inteiro que a extração da #398 trouxe. **Quatro portais novos**, todos
com o mesmo contrato das armas: o número existe porque foi lido do config, e o
que não foi medido aparece como ausente em vez de virar zero.

- 🔭 **Miras & acessórios (211 artigos)** — 3.218 acessórios classificados pelo
  `itemInfoType` do engine (101 boca · 201 óptica · 301 apontador · 302 bipé),
  não por heurística.
  - ⚠️ **A ampliação NÃO sai de `0,75 / FOV`.** Medido: nas 215 ópticas que
    trazem os dois valores, **159 discordam** da conta — o ELCAN SpecterOS dá
    12× calculado contra "Magnification: 2x" escrito pela própria Bohemia. A
    ampliação só é publicada quando o jogo a declara em texto (**241 de 1.167**);
    nas outras **926** o campo é `null` e o FOV cru aparece rotulado como FOV.
- 🗺️ **Terrenos (31 artigos)** — os mundos jogáveis com a **grade REAL** de
  cada um. ⚠️ **30 dos 31 contam o northing de cima pra baixo e 1 conta pra
  cima**; assumir uma convenção só erra o eixo N-S em **180°**. O
  `verificar-grade.mjs` cobra isso nos 31 por propriedade estrutural
  (ida-e-volta, sinal do norte, anti-simetria, vizinhança).
- 🛡️ **Veículos (874 artigos)** — 5.425 veículos de verdade, com **blindagem
  por parte**: o 2S9 Sochor tem casco 425 e tanque de combustível em 0,5.
  - ⚠️ **`armor` negativo não é blindagem menor.** São **19.223 partes** do
    acervo (rodas, periscópios, ERA) e o sinal é convenção do engine: negativo
    é *relativo* ao casco. Um `min()` sobre os dois juntos anunciava
    "ponto fraco: −100". Agora o resumo só compara absolutos e conta os
    relativos à parte — com invariante no gerador e no verificador.
  - `ehVeiculo` corta **24.261 → 5.425**: `CfgVehicles` guarda parede, arbusto
    e marcador do editor. Publicar 24.261 "veículos" seria número grande e falso.
- 🦺 **Equipamento (241 artigos)** — coletes, capacetes, uniformes, mochilas e
  óculos com **proteção POR PONTO DO CORPO** e o `passThrough`. Um número só
  esconde a diferença entre "peito 25, abdômen descoberto" e "os dois em 25";
  e proteção sem a passagem sugere imunidade que não existe (Plate Carrier:
  peito 16, **30% do dano atravessa**). **19.616 itens** trazem esse dado.
  - **71.373 classes → 988** colapsando variante cosmética; o JSON sob demanda
    saiu de **29,7 MB para 641 kB**. Cada entrada registra `variantes` e os
    nomes, então nada some sem deixar rastro.

### 🧭 Vanguard acoplado de verdade

- 🗺️ **Mapa tático** (`/vanguard`): marcar peça e alvo no mapa, ler MGRS,
  azimute de **GRADE** e distância, e despejar tudo no computador de tiro num
  clique. O vetor sai do `gridVector()` vendorizado — o mesmo que reprojeta o
  alvo no fuso UTM da peça quando os dois caem em fusos diferentes.
- 🧭 **Azimute de grade nos terrenos do Arma 3**: duas grades como no jogo →
  azimute em mil NATO e MRAD, distância e retro-azimute, na grade daquele mundo.
- A **altitude é manual e a tela diz isso**: a web não tem DEM (regra #238).

### 🔬 Procedência derivada, não digitada

- A capa da wiki mostra **quanto saiu do jogo, contado no dump**, com o `.rpt`
  de origem de cada bloco. Antes era texto escrito à mão, que envelhece calado
  — e é justamente o número que sustenta "os dados são medidos".
- O gerador se pagou na primeira execução: escrito com os nomes de campo
  errados devolveu **0 armas com balística completa**, que publicado viraria
  "0% do acervo tem balística". Virou invariante que **recusa gerar** em vez de
  publicar zero. Com os nomes certos: **10.679 de 10.822 (99%)**.
- A **fila fica declarada**: 44.761 soldados e 4.011 gestos aparecem como
  "extraído, ainda sem tela" em vez de sumirem.

### 🔧 Infraestrutura

- ✅ **CI de build e invariantes** (`.github/workflows/ci.yml`) — o repo não
  tinha nenhum workflow que conferisse que o site compila. Ele **regera as
  bases a partir do dump versionado e falha se divergir do commit**; pegou um
  defeito na primeira execução (a base de armas estava gerada de um dump
  anterior ao das outras).
- 🚀 **Deploy consertado**: o bundle das funções Python estourava o limite
  (340,98 MB contra 225 MB) porque `scripts/` nunca esteve no `.vercelignore`.
  Somado a `excludeFiles`, `public/` deixa de contar pra um bundle que não o lê.
- 🧹 **Aba "Catálogo" removida** — dizia aguardar extração que já rodou, e
  prometia veículos e miras que agora têm aba própria.
- 🔒 CodeQL deixa de analisar os **3.711 arquivos do GitNexus 1.6.7** (código de
  terceiro commitado na raiz), que geravam alerta que ninguém deste projeto
  pode corrigir.
- 🔄 SW `baluarte-v0.9.1` · app `0.9.1`.

**Pendente**: o 3D segue sem UI. Os 20 quadros do turntable não servem (00–09
verdes de visão noturna, 10–19 estourados e com cenário no lugar da arma); o
`.sqf` está ajustado e carimbado `v4`, mas **não testado** — depende de rodada
na máquina do operador.

---

## 2026-07-26

### 🔬 Armas com valores MEDIDOS do jogo + pipeline pra extrair TODO o resto (veículos, miras, gear)
- 🎯 **Fecha a pendência registrada na 0.9.0**: a database de armas deixou de usar "velocidade de referência por calibre" e passou a usar o **`v0` e o `airFriction` REAIS**, lidos do config do jogo em execução com o preset completo carregado (dump da #398, parte LOCAL). A calculadora de trajetória agora resolve com o número **daquela arma**, não da família do calibre.
- 📊 **10.822 classes → 1.477 armas de verdade** (`scripts/arma3/gerar-base-armas.py`). O que colapsou foi variante cosmética: óptica pré-montada (`_ACO_F`, `_Holo_pointer_snds_F`) e camuflagem (`(Arid)`, `(Lush)`) — 34 entradas só de MX. A chave de agrupamento é (modelo + balística), então o que muda o tiro **continua em linhas separadas**: o mesmo `mxm_f.p3d` aparece com v₀ 774 e 857 (carregador diferente).
  - **Núcleo** (jogo base + DLC + CDLC, 106 armas) vai no bundle; o **arsenal modado** (1.371) desce sob demanda de `public/arma3/armas-db.json` — 1,7 MB cru, ~100 kB no fio.
  - **96,3%** têm balística completa · **95,1%** têm ícone.
- 🖼️ **Coluna de imagem ligada** na tabela: os 2.417 WebP extraídos dos PBOs aparecem por arma. Arma sem ícone **não ganha placeholder que finja ser a arma** — ganha um selo com o motivo (`sem-picture-no-config` ou `paa-nao-extraido`, que é o `.ebo` cifrado das CDLC, que nem o Arma 3 Tools abre).
- 🧠 **`tipoSugerido` substituído**: a heurística antiga jogava **9.090 das 10.822 em "fuzil"** — um default, não uma classificação. Agora a inferência é encadeada e **cada arma declara em que evidência caiu** (`tipoFonte`): `config` (o campo `type` do engine) > `descricao` (o rótulo do próprio jogo: "Sniper Rifle", "Marksman rifle") > `classe` (prefixo de slot) > `desc-generica` > `numerico`. O que não dá pra classificar vira **`primaria`** — honesto — em vez de virar "fuzil" por default.
- 🚀 **Foguete e míssil recusados na calculadora, de propósito**: no config, munição de lançador tem `airFriction` **positivo** e `v0` de ejeção (~30 m/s), porque segue outro modelo de voo. Jogar esse par no integrador de arrasto daria uma bala **acelerando**. `resolverTiro()` agora falha alto nesse caso e `dadosBalisticos()` filtra antes.
- 🎒 **Aba nova "🎒 Catálogo"** + **pipeline completo pra extrair todo o resto**: `dump-catalogo.sqf` (novo) despeja `CfgVehicles` (veículos, soldados, mochilas, armamento estático), os itens do `CfgWeapons` com `ItemInfo` (**miras com zoom real**, supressores, apontadores, bipés, **uniformes e coletes com proteção por ponto do corpo**, capacetes, NVG, binóculos, GPS, rádio) e `CfgGlasses` — **23 categorias** já definidas com as colunas de cada uma. Enquanto o operador não roda o dump no jogo, a aba mostra **"aguardando extração"** com o passo a passo, não tabela vazia sem explicação.
  - ⚠️ **`getNumber` do SQF devolve 0 pra propriedade que não existe** — "sem blindagem declarada" viraria "blindagem 0". O dump testa `isNumber` antes e emite vazio; o parser converte em `null`. É a regra `hit: null ≠ hit: 0` num lugar onde ela é fácil de perder.
- 🔬 **Painel de procedência** na aba de armas: de onde vem cada número, quantas armas têm balística/ícone, e a distribuição das evidências de classificação. Dá pra auditar a tabela sem sair dela.
- 📚 **O arsenal entrou na WIKI (`/wiki-arma3`): 353 → 459 artigos.** Furo que o operador apontou: a wiki é a camada de **navegação** do conteúdo, e o arsenal estava fora dela — dava pra ver a tabela em `/arma3-tutorial`, mas não dava pra *chegar* nela pela wiki nem buscar "MX" e achar a arma. Portal novo **🔫 Arsenal** (106 artigos), com o formato "infobox + artigo" que a própria wiki descreve: capa (o ícone extraído do jogo), ficha técnica e texto. O corpo é montado **só do que foi medido** — cada frase só existe se o dado existir, e lançador ganha a frase dizendo que a calculadora não se aplica. Traz o comando SQF pra spawnar e link pra abrir na calculadora.
- 🎯 **Precisão em CENTÍMETROS** (coluna nova): o config guarda dispersão em radianos por modo de tiro; converter pra cm a 100 m é regra de três. **M200 Intervention 1,8 cm · MX 8,7 cm · MP-443 Grach 43,5 cm.** Usa a MENOR dispersão entre os modos — a precisão no melhor caso, que é o que faz sentido comparar.
- 💥 **Aba de munições (472)** com o que nenhuma wiki de Arma 3 mostra: **furtividade** (`audibleFire` de 0,05 na fumígena a 120 no .50 BMG, `visibleFire` 0,07–32) e as **71 munições subsônicas**. O cartão da aba explica os dois campos de nome enganoso, que é onde erra quem lê config do Arma: o `caliber` da MUNIÇÃO **não é o calibre em mm** (é o multiplicador de penetração), e explosivo mata pelo **dano indireto** — olhar só o `hit` faz foguete parecer fraco.
- 🧰 **Aba de carregadores (1.432)**, até então 100% ignorados. Mostra o que a tabela de armas não explicava: **cada carregador tem `v0` próprio**, e é por isso que a mesma arma aparece em mais de uma linha — não é duplicata, é balística diferente (o mesmo `mxm_f.p3d` com v₀ 774 e 857).
- 🔢 **Modos de tiro por arma**: a tabela mostrava um RPM só, mas o MX tem **6 modos** no config. A célula agora abre uma linha com cada modo, seu RPM e sua dispersão própria.
- ↕️ **Tabelas ordenáveis** (armas, munições, carregadores) por uma spec de coluna única. `val()` (comparar) e `cel()` (mostrar) são separados, então "8.7 cm" ordena como 8.7 e não como texto; **ausente vai sempre pro fim nos dois sentidos** — virar 0 e liderar a coluna crescente seria a mentira de sempre.
- 🎯 **Cartão de tiro MRAD em `/vanguard`** — é onde os dois projetos se encostam de verdade: os NÚMEROS vêm da extração do Baluarte (v₀ e airFriction medidos) e o MODELO do `arma3-balistica.js`; o Vanguard entra com o formato de cartão. A página passa a ter os dois problemas **inversos** lado a lado: computador de morteiro ("dado o alvo, qual o ângulo?") e cartão MRAD ("dado o ângulo, onde cai?"). M200 zerada em 300 m → **+14,31 mrad a 1500 m**.
  - ⚠️ **MRAD ≠ mil NATO** e as duas colunas aparecem juntas de propósito: o retículo do Arma é milirradiano (≈6283/volta), o mil NATO divide em 6400 — 1 mrad ≈ 1,019 mil NATO, o que a 1000 m passa de 1,8 m de erro.
  - A coluna é a **correção**, não a queda: se a bala cai 2 mrad, sobe-se 2 mrad. Mostrar a queda e chamar de correção é o erro clássico.
- 🔭 **Miras por arma, tiradas do config** — o config não tem "lista de miras compatíveis", mas tem as variantes pré-montadas (`arifle_MX_ACO_F` é o MX com o ACO no trilho), que o colapso de variantes jogaria fora junto com a camuflagem. MX → ACO, Hamr, Holosight, RCO; M200 → LRPS, SOS. **62 das 106** armas do núcleo. Declarado o que NÃO é: lista o que aparece montado (não o que a arma aceita), e a ampliação de cada mira depende do dump do catálogo.
- 🐞 **Fuzil com lança-granadas deixou de ser "lançador"** — bug encontrado por auditoria dos deep-links, não por leitura de código. O engine diz `type: 1` (arma primária) pro MX 3GL, mas a descrição traz "Grenade Launcher" e o classificador deixava o texto vencer o config. Resultado: 68 fuzis viravam lançadores e **perdiam a calculadora**, apesar de terem a balística do fuzil (o MX 3GL tem o v₀ e o airFriction do MX). O UGL é boca **secundária**, não o tipo da arma. `lancador` 120 → **52**, `fuzil` 743 → **804**.
- 🧰 **Wiki: infobox virou ficha técnica** — o objeto da arma já era anexado ao artigo e **nada consumia**, então uma arma mostrava os mesmos 5 campos de um artigo de texto. Agora 19 linhas: calibre, v₀, airFriction, precisão em cm, dano, cadência, carregador, zeragem, massa, munição, miras, acessórios, variantes, classe. Ausente some, em vez de virar "0".
- 🔗 **Deep-link que cumpre o que promete** — o botão dizia "Abrir na tabela e na calculadora" e caía numa lista de 106 linhas com a calculadora em outra arma. Agora `?arma=<id>` abre já na arma certa, e o **rótulo segue o que ela permite**: 94 prometem calculadora e entregam, 12 dizem só "Abrir na tabela" (foguete, sinalizador e as sem v₀ no config). Link interno também parou de abrir em aba nova.
- 🛡️ **Os dois bugs acima ficaram travados** — eram silenciosos (a página abre, o número aparece, e é de outra arma), então não voltariam com barulho. O gerador passa a **recusar gerar** se classificar como lançador algo que o config diz ser arma primária, e `scripts/verificar-wiki-arsenal.mjs` (novo, `npm run verificar-arma3`) checa o vão entre wiki, base e calculadora — que nenhum módulo enxerga sozinho. Junto: campo interno (`_`) parou de vazar pro `armas-db.json` público.

- 🔒 **Três vulnerabilidades reais corrigidas** no caminho: **ReDoS polinomial** no conversor de coordenadas (medido: 16 mil espaços, 238 ms → 0,02 ms), **path injection** pelo nome de classe no `extrair-modelos.py`, e **Zip Slip** no `pbo.py` — este pré-existente e o mais sério: o nome da entrada vem do cabeçalho do PBO, os PBOs vêm da Steam Workshop, e no Windows a contrabarra é separador, então um mod mal montado escrevia fora da pasta de destino.
- 🗺️ **Camadas de mapa agora são compartilhadas** com o Project Vanguard (`src/data/camadas-mapa.js`, API idêntica nos dois repos — a mesma decisão do `helpers.js`). O `/mapa` tinha 7 camadas e o Vanguard tinha 3 próprias; as duas listas já divergiam. Agora camada nova entra nos dois de uma vez, e o seletor de base do `/mapa` se monta a partir do catálogo (ganhou a 2ª fonte de satélite).
- ⌖ **Project Vanguard aparece no Baluarte**: rota **`/vanguard`** na sidebar (*Conhecimento*), com o **computador de tiro** e o **conversor MGRS/UTM** funcionando de verdade — o motor zero-dependência do repo irmão vendorizado em `src/utils/vanguard/` (~10,6 kB gzip, dentro do "leve" da #238). Os dois modelos balísticos convivem: `arma3-balistica.js` é tiro **tenso** ("dado o ângulo, onde cai"), o motor do Vanguard é tiro **curvo** ("dado o alvo, qual o ângulo").
- ✅ Verificado no navegador (Playwright): 106 armas em tabela com 76 ícones carregando e 30 marcados como ausentes (todos CDLC cifradas), calculadora abrindo no MX com **v₀ 752,5 · airFriction −0,000774** (bate com a conferência in-game do operador), `/vanguard` resolvendo missão (carga 2 preferida, 1203 mil, 29,3 s) e conversor MGRS, `/mapa` com as 4 bases do catálogo. Zero erros de página. Vanguard: 54/54 testes.

---

## 2026-07-24

### 🔫 Launcher 0.9.0 — DATABASE de armas estilo Fallout + CALCULADORA de balística (a "inveja da Bohemia")
- 🎯 **Pedido do operador** (masterplan em **#398**): "fazer algo parecido ou melhor que a wiki de Fallout, que mostra cada arma e o que ela faz — separando todos os tipos — inclusive **como calcular a trajetória da bala**. Quero fazer a Bohemia ter inveja." A Bíblia do Arma 3 ganhou a **8ª aba: "🔫 Armas (database)"**.
- 📊 **Tabela estilo Fallout, separada por tipo** (`src/data/arma3-armas.js`): **40 armas vanilla** (7 tipos — fuzil de assalto, DMR, sniper & anti-materiel, SMG, LMG/MMG, pistola, lançador) com colunas Variante · Calibre · Vel. de saída · Cadência · Carregador · Modos · Zeroing · DLC · Observações — ordenável, filtrável por chip de tipo e por busca. Rolagem horizontal (não estoura no mobile).
- 🧮 **Calculadora de trajetória com o MODELO REAL do engine** (`src/utils/arma3-balistica.js`): resolve o MESMO cálculo do jogo — arrasto `airFriction × v²` + gravidade 9.81, por **integração numérica** (não é fórmula fechada). Escolhe a arma e o alvo e devolve: **queda no alvo (cm + mils)**, correção no retículo, **tempo de voo**, **velocidade e energia residual**, **deriva por vento lateral** e o **ângulo de zeragem** — com o **desenho da trajetória** (SVG) cruzando a linha de mira. Cada linha da tabela tem botão 🧮 que carrega a arma na calc.
- 🧭 **Honestidade mantida**: entram os fatos estáveis (calibre, carregador, modos, cadência, zeroing, DLC); a velocidade/arrasto é de **referência por calibre** (`A3ARM_CALIBRES`/`AIR_FRICTION_REF`, editável na calc), e os **decimais exatos de config (airFriction/hit) + o arsenal modado + as imagens "como no jogo"** virão da **extração local dos PBOs do Drive** — documentado em `docs/HANDOFF-LOCAL.md` (seção D) e no #398, **incluindo as regras de commit** pra sessão local (pedido do operador).
- 📦 **Coleção (0.8.0) completada**: o raspador terminou — os **113 itens novos** agora com dependências/autor (regenerado `arma3-colecao.js`).
- 🔄 SW `baluarte-v0.9.0` · app `0.9.0`.
- ✅ Verificado (Playwright, 15/15): 8 abas, database com 40 armas em 7 tabelas, calculadora produz queda/mils/tempo/energia + SVG da trajetória, trocar arma/alvo/vento recalcula (Mk-I EMR zerado 300 m → −224 cm em 600 m), botão 🧮 da tabela, chips por tipo, busca, deep-link `?aba=armas`, coleção 221 intacta, zero erros.

### 📖 Wiki de Arma 3 (`/wiki-arma3`) — a camada de navegação: capa, índice e artigo por assunto
- 🎯 **Pedido do operador**: "tudo isso tem que ser visível de uma forma fácil, do mesmo jeito que é fácil ver as coisas complexas e tem imagens… uma mega wiki sobre Arma 3 com tudo explicado tanto para iniciantes quanto para veteranos". O conteúdo já existia (0.8.0), mas morava numa página só de 7 abas — **sem entrada na sidebar** e sem link por assunto.
- 🧭 **Rota nova `/wiki-arma3`** (entra na sidebar em *Conhecimento*), com três vistas e **deep-link de verdade** (o botão voltar funciona):
  - **Capa** — 6 portais (Começar a jogar · Mods & instalação · A coleção · Missões & campanhas · Console & comandos · Arquivos & backup) + trilha **iniciante ↔ veterano** + busca global.
  - **Índice** (`?p=<portal>`) — **grade com capa** ou **tabela ordenável** (estilo wiki de Fallout: miniatura, artigo, categoria, nível, autor), com filtros de categoria e nível cujas contagens acompanham a busca.
  - **Artigo** (`?a=<id>`) — **infobox lateral** (capa, tipo, categoria, nível, autor, tamanho, id do Workshop, REQUER, DLC, tags), corpo, teclas em `<kbd>`, dicas, bloco SQF com copiar, guia original do autor colapsado e **"veja também"**.
- 🔗 **Índice unificado** (`src/data/wiki-arma3.js`): **353 artigos** normalizados a partir das 7 fontes já existentes — não duplica conteúdo, só lê (quem escreve continua editando `arma3-vanilla`, `arma3-tutoriais`, etc.). Um item da coleção e o tutorial do **mesmo id do Workshop viram UM artigo**: a capa vem da coleção, a explicação vem do tutorial.
- 📦 **Coleção atualizada para a nova (id 3770621777): 221 → 237 itens** (+16: Ravage e Ravage: Livonia, DayZ Ravage, Pilgrimage 1/1.951, The Forgotten Few 2, NIArms Core + HK416, Reload action rework CORE/compats, RHSTERRACORE, Gorkas 'n' Gear, Tinter-Furniture, Project Infinite, Eden Objects, Australian Commando Weapon Pack). **Autoria completa: 113 → 237/237** itens com autor creditado.
- 🩹 Corrigido no caminho: as **tags da Steam** apareciam sem rótulo logo abaixo de "REQUER" na ficha técnica, passando por dependência (o ACE mostrava `CBA_A3, Content Review, x64` — só `CBA_A3` é dependência de verdade).
- ♻️ `/arma3-tutorial` **intacta** — a capa da wiki linka pra ela como "modo tutorial (abas)".

---

## 2026-07-22

### 📖 Launcher 0.8.0 — a MEGA-WIKI do Arma 3: coleção completa (221 itens), enciclopédia e os arquivos reais no Drive
- 🎯 **Pedido do operador**: "todas as informações sobre tudo dessa coleção… isso sim é uma wiki, tem tudo que eu possa e não possa precisar". A Bíblia do Arma 3 virou a **página única** do jogo no site e no app — agora com **7 abas**.
- 📦 **Aba nova "Coleção completa · 221"**: TODOS os itens da coleção Steam oficial do site (`projeto-baluarte.vercel.app`, id 3769819471, por Spartan Gamer BR) catalogados um a um — **capa do Workshop em cada card**, tamanho, autor, tags, DLCs exigidas, dependências (REQUER) e o **guia completo do autor embutido** (expandível) nos 95+ itens que não tinham tutorial. Categorias: 117 mods · 62 cenários & missões · 33 composições · 8 terrenos · 1 campanha. Os 100+ itens que já têm tutorial detalhado ganharam botão que **pula direto pro card na aba Mods**. Dados coletados da **Steam Web API oficial** (`GetPublishedFileDetails`, 221/221) + raspagem das páginas.
- ☁️ **Aba nova "Arquivos (Drive) · 19"**: o operador espelhou a INSTALAÇÃO INTEIRA no Google Drive — a aba navega nela **ao vivo, sem sair do site** (iframe `embeddedfolderview`, mesmo espírito da aba Filmes) com 8 pastas mapeadas (jogo, Workshop/107410, perfis, GHOST, composições, Bohemia). E mais:
  - 👻 **Perfil GHOST decifrado**: baixamos o `GHOST.Arma3Profile` REAL e lemos campo a campo — dificuldade Custom com **IA no máximo** (skillAI=1, precisionAI=1, AILevelHigh), HUD de veterano, vídeo (view distance 3000 m, terrainGrid 12.5), progresso de campanha (East Wind em "Blackfoot Down", Old Man, Spearhead 1944, Contact, Western Sahara) e os keybinds de mod gravados (Antistasi Y/R/H, RHS FCS, BettIR, Unsung…).
  - 🧱 **Composições próprias catalogadas**: a frota SPARTAN TIME (HEAVY/AIR/WATER/TANK/RECON/DELTA…), OSPREY, BRASIL 1-2, BASE OLD MEN e 50+ — com o guia de como importar em outro PC.
  - 💾 **Saves & vars explicados**: GHOST.vars de 27 MB (onde Vindicta/Antistasi/KP salvam de verdade), AntistasiUltimate.vars, Saved/UserSaved.
  - 🔬 **Anatomia dos arquivos (nível programador)**: formato do .Arma3Profile (Param File), PBO/bisign/bikey, mission.sqm, arma3.cfg/.rpt e por que o id do Workshop é a chave de tudo.
- 📚 **Jogo base virou enciclopédia (42 tópicos, +10)**: seções novas — **Enciclopédia** (ficha técnica 2013/Real Virtuality 4, a linhagem OFP→Arma 4, o engine por dentro: SQF/scheduler/locality/remoteExec, por que o jogo é difícil), **DLCs & Creator DLCs** (o catálogo completo 2014-2024), **Facções do universo 2035** (OTAN/CSAT/AAF/FIA/CTRG/Syndikat/Viper/LDF/IDAP) e **Terrenos oficiais** (Stratis 20 km² → Altis 270 km², Tanoa, Malden, Livonia).
- 🔄 SW `baluarte-v0.8.0` (a wiki chega pra quem já visitou) · app `0.8.0`.
- ✅ Verificado (Playwright, 15/15): 7 abas, 221/221 na coleção com 221 capas e 95 guias, busca filtra, pulo Coleção→Mods funciona, visualizador do Drive com 8 pastas e troca de iframe, 19 tópicos do Drive, deep-link `?aba=colecao`, zero erros de página. Capas conferidas por HTTP direto no CDN (200 image/jpeg).

### 🔦 Launcher 0.7.10 — ACHEI a tela preta do 3D: modelo sem luz (só IBL) → luzes explícitas
- 🎯 **O laudo do operador fechou o caso.** Tudo passava (GPU RX 6650 XT via ANGLE/D3D11, WebGL DESENHA o pixel, GLB/DRACO 200, SW v0.7.9, o visor MONTA com 11.376 triângulos) — MAS a janela abria PRETA. O diagnóstico só confirmava que *montou*, não que *aparece*.
- 🐛 **Causa raiz**: a cena do visor não tinha NENHUMA luz explícita — 100% da iluminação vinha do `PMREMGenerator` + `RoomEnvironment` (IBL). Esse pipeline (render targets half-float) sai **preto em algumas GPUs AMD via ANGLE/D3D11**. O modelo carregava, contava os triângulos, montava — e renderizava **todo preto por falta de luz**. Rodava no nosso swiftshader (software) e falhava só na GPU real — por isso nunca reproduziu no dev.
- ✨ **Correção**: **luzes explícitas** no visor (HemisphereLight + 3 DirectionalLight key/fill/back, posicionadas em função do tamanho do modelo) — o modelo fica visível SEMPRE, com ou sem IBL. As luzes até **sobem de intensidade quando o IBL falha** (`environment ? menor : maior`). O PMREM agora é `try/catch` (se explodir, não derruba mais o mount).
- 🩺 **Diagnóstico mais esperto**: novo `amostraLuminancia()` no visor LÊ o pixel central do quadro renderizado — a etapa 7 do laudo agora diz **"montou e APARECE · brilho N/255"** ou **"montou mas o quadro saiu PRETO"**, distinguindo os dois casos que antes eram indistinguíveis.
- ✅ Verificado (Playwright, swiftshader, 7/7): galeria abre com 11.376 triângulos + animação, `amostraLuminancia` mede brilho 39/255 (não-preto), canvas 480×360, laudo reporta APARECE.


## 2026-07-20 (parte 2)

### 🏴 Launcher 0.7.9 — aba CAMPANHAS: guia Vindicta completo (do repo e docs oficiais)
- 🏴 **5ª aba da Bíblia do Arma 3**: "Campanhas" — o guia de campanha do **Vindicta** com **14 tópicos em 5 seções**, TODOS extraídos do README oficial (Sparker95/Vindicta) e do guia oficial Vindicta-Docs (pedido do operador: "usa isso para melhorar o guia"):
  - **Começando**: menu U (CREATE/facções/INITIAL ENEMY %), o save PRÓPRIO de 6 slots no .vars (com o alerta oficial de backup), mapas suportados (Altis/Enoch/Tanoa/Malden/Weferlingen + CUP) e os avisos honestos — mods de IA são INCOMPATÍVEIS (FAQ oficial) e o projeto foi encerrado (alpha jogável, sem features novas).
  - **Suspeita & Undercover** com os números oficiais: <50% invisível, 50–100% sujeito a PRISÃO, 100% atiram; fontes documentadas (correr conta! arma/roupa militar/capacete; exposição no veículo) e o coldre ACE no 0.
  - **Civis, Influência & Intel**: as 5 interações de diálogo, os 2 tipos de intel (forças = sempre velha; ações futuras = sincronizada com "Ended"), tablets táticos nos uniformes e interceptação por rádio.
  - **Camps, Recrutamento & Ordens**: raio de recrutamento (o círculo no mapa), as 3 condições do alistamento (local + Arsenal com armas + alojamento), e a pegadinha documentada do Split-antes-de-mover (senão o local é ABANDONADO).
  - **Construção, Arsenal & Veículos**: Build UI pela roda, o Arsenal LIMITADO de propósito (economia = saque) com o truque "Inventory to Arsenal", e o LOCKPICK de veículos militares (item que já vem no uniforme — o segredo do FAQ).
- 🔗 O card do mod Vindicta na aba de mods agora aponta pro guia completo.
- ✅ Verificado (Playwright, 20/20): 5 abas, 14 tópicos na aba campanhas via deep-link `?aba=campanhas`, números 50%/100% presentes, lockpick/arsenal limitado/aviso de IA no texto, busca "lockpick" filtra, regressão completa das outras abas.


## 2026-07-20

### 🎒 Launcher 0.7.8 — preset atualizado (109 mods): APS + BackpackOnChest + Vindicta + FileXT
- 🪖 **Preset "projeto baluarte vercel app" atualizado** (upload do operador): 105 → **109 mods** (total geral: **334**). Os 4 novos, com tutoriais escritos a partir das descrições oficiais do Workshop:
  - **Armor Plates System (APS)** — sistema médico alternativo: placas cerâmicas no colete viram HP extra (inspiração COD Warzone); revive próprio sem ACE medical.
  - **BackpackOnChest - Redux** — mochila no peito E nas costas (o combo de paraquedas); preserva rádio TFAR/ACE Gunbag no peito.
  - **Vindicta (Alpha)** — campanha dinâmica de guerrilha com persistência TOTAL por unidade e comandante IA que reage (QRF, patrulhas, bloqueios); a alternativa ao Antistasi no mesmo preset.
  - **FileXT** — a extensão de gravar/ler arquivos que dá a persistência do Vindicta.
- 🎉 **A integração do EBI fechou o ciclo**: com APS e BackpackOnChest agora INCLUSOS, o slot de placas com barra de HP e o botão de mochila no peito do EBI (recursos-manchete dele) ficam ativos — os cards do EBI/APS/BoC se cruzam explicando o trio.
- ✅ Verificado (Playwright, 13/13 + 14/14 de regressão): 109 mods + destaque = 110 cards, 123 chips REQUER, cobertura 109/109 por script, abas/busca/comandos intactos.

### ⌨️ Launcher 0.7.7 — Comandos & Spawn (console SQF) + FOB do KP Liberation por comando
- ⌨️ **4ª aba da Bíblia do Arma 3**: "Comandos & Spawn" — **21 comandos de console** em 5 seções (Console de Debug, KP Liberation, Veículos & Objetos, Unidades & Grupos, Utilitários), cada um com o **SQF pronto num bloco com botão ⧉ copiar**, explicação e dicas. Busca e chips funcionam como nas outras abas; deep-link `?aba=comandos`.
- 🏗️ **O pedido do operador — FOB do KP Liberation — com COLETA DE DADOS REAL**: extraído do código oficial (github.com/KillahPotatoes/KP-Liberation): a caixa de FOB é `FOB_box_typename` (= `B_Slingload_01_Cargo_F` no preset padrão) e a própria missão a cria com `createVehicle` puro (startgame.sqf) sendo reconhecida por CLASSNAME (do_build.sqf) — logo o comando de console é idêntico ao oficial. Bônus verificados no código: **FOB instantânea** via `[getPosATL player, true] remoteExec ["build_fob_remote_call", 2]` (assinatura confirmada), caminhão-FOB/respawn/Huron pelas variáveis do preset, e **caixas de recurso com valor de verdade** via `KPLIB_fnc_createCrate [recurso, quantidade, posição]` (fn_createCrate.sqf — createVehicle cru nasceria valendo zero).
- 🧰 Demais comandos: descobrir classname (`copyToClipboard typeOf cursorObject`), spawns (createVehicle simples/array/`BIS_fnc_spawnVehicle` tripulado, createUnit+createGroup, `BIS_fnc_spawnGroup`, waypoints), utilitários (teleporte por clique no mapa, cura/munição/combustível, god mode, arsenal BIS, tempo/clima, splendid camera) — com a regra de ouro repetida: console é pro SEU host/SP; em servidor alheio é ban.
- ✅ Verificado (Playwright, 14/14): 21 comandos em 5 seções, blocos SQF renderizados, copiar → clipboard com feedback, comandos do FOB presentes, busca "FOB" filtra, 4 abas, vanilla segue padrão, zero erro.

### 🩺 Launcher 0.7.6 — Diagnóstico do 3D NA MÁQUINA do operador + Bíblia do Arma 3 (jogo + mods + config)
- 🩺 **Diagnóstico do "3D não abre" que roda AÍ, não aqui.** As correções remotas (SW, WebGL no app, aviso do Sketchfab) não resolveram e o sintoma não reproduz no dev — então em vez de mais um chute, a `/modelos-3d` ganhou um botão **"🩺 O 3D não abre? Clique pra diagnosticar"** que testa a cadeia inteira NA MÁQUINA do operador e mostra onde quebra, com **copiar laudo**: (1) GPU/contexto WebGL + nome do renderizador real; (2) teste DECISIVO em WebGL cru — limpa de vermelho e LÊ o pixel de volta (prova que a GPU desenha); (3) baixar o `Soldier.glb` (status/MB/ms); (4) baixar o decoder DRACO; (5) estado do service worker (controla a aba? qual cache?); (6) montar o visor three.js real e contar triângulos — capturando o erro EXATO se falhar. Verificado (Playwright): com WebGL dá tudo verde + GPU + 11.376 triângulos; sem WebGL aponta a etapa que quebra e ainda confirma que GLB/DRACO baixam.
- 📖 **A `/arma3-tutorial` virou uma BÍBLIA** (pedido: "quase uma bíblia de como jogar com ou sem mods e tudo pra mexer e configurar os mods"): terceira aba **🔧 Instalar & configurar mods** (6 seções · 19 tópicos) — instalar do zero (Workshop + importar preset arrastando), **ordem de load & dependências** (CBA primeiro, compat por último; o que "Required Items" quer dizer), **CBA Addon Options & Configure Addons** (onde ficam config e teclas dos mods; o conflito real Zeus×Antistasi na tecla Y), **multiplayer com mods** (casar mods do servidor, chaves de assinatura/verifySignatures, mesmo preset pra galera), **performance & parâmetros** (o que ajuda de verdade vs lenda; busca binária do mod pesado) e **troubleshooting** (os erros clássicos: "you cannot play/edit this mission", crash no boot, achar e ler o `.rpt`, "atualizou e quebrou").
- 🎮 **Jogo base mais fundo**: nova seção **Táticas de combate** (cobertura vs concealment, supressão & fogo de manobra, distância de engajamento/queda da bala, operações noturnas) — vanilla agora com **11 seções · 32 tópicos**.
- ✅ Verificado (Playwright, 13/13): 3 abas (vanilla 32 / config 19 / mods 105+destaque), buscas nas novas seções, deep-link `?aba=config`, e o diagnóstico 3D rodando com as 6 etapas + copiar.

### 📚 Launcher 0.7.5 — Tutorial VANILLA completo + 105 mods com dados OFICIAIS do Workshop + Dual Arms
- 🎮 **Tutorial completo do JOGO BASE** (pedido: "tutorial completo tudo do jogo, do vanilla"): aba nova na `/arma3-tutorial` com **10 seções · 28 tópicos** — primeiros passos (Bootcamp/Field Manual), movimento & posturas (ajuste fino Ctrl+WASD), armas & tiro (zeroing, granadas, lançadores), inventário/ações/saúde, **comando de IA (F1-F10 + menus 1-0)**, mapa & navegação (marcadores, azimute), veículos terrestres, helicópteros/aviões/drones, editor Eden/Zeus/campanha e multiplayer & etiqueta milsim — tudo com atalhos em `<kbd>` e dicas.
- 🕵️ **Os 105 tutoriais de mods reescritos com a fonte oficial**: as descrições das 105 páginas do Steam Workshop foram coletadas (em lotes, driblando rate limit — sugestão do operador) e cada card ganhou o que o AUTOR documenta: teclas reais (Corner Shooting Shift+Q/E, Canting C, stack-move Shift/Ctrl do Better Inventory…), dependências oficiais (chips **REQUER** gerados por script) e correções de conteúdo — ex.: Advanced Unit Positioning é "lean out" sobre beiradas (Ctrl+W com arma apoiada), HWF é moveset de arma pesada, Wings of Fury é pack de aeronaves, Binocular-Artillery opera pelo designador a laser, Immersive Voices é vozes temáticas (40K/HALO/SW).
- 🎯 **Dual Arms em destaque** (pedido: "aquele que permite ter 2 armas principais"): card destacado no topo da aba de mods com o aviso honesto — o mod é o **Dual Arms - Two Primary Weapons** e **NÃO está no preset** (o Better Inventory daqui tem compat nativa); como funciona (2ª primária no slot de lançador) e o atalho real (bindar **Use Action 16**).
- ⚠️ **Conflito real descoberto e avisado**: o EBI declara-se **incompatível** com o Better Inventory original — os DOIS estão no preset; os cards agora avisam "ative um por vez".
- 🗑️ **Gerador de CPF/CNPJ REMOVIDO** da Caixa de Ferramentas (pedido do operador: "pode dar merda real") — card, funções de gerar/validar e menções; gerar documento com dígito verificador válido é material pronto pra fraude, fora do escopo do site.
- ✅ Verificado (Playwright, 13/13): aba vanilla padrão com 28 tópicos/10 seções, aba mods com 105+destaque, chips REQUER, buscas ("zeroing", "tarkov"), deep-link `?aba=mods` e caixa de ferramentas sem CPF/CNPJ. Cobertura 105/105 conferida por script.

### 📖 Launcher 0.7.4 — preset Arma 3 atualizado + Tutorial detalhado dos 105 mods
- 🪖 **Preset "projeto baluarte vercel app" atualizado** (upload do operador): 96 → **105 mods** (9 novos, incl. TRF Blackthorn, EBI, AAS Core, Advanced Rappelling/Pickup Rope/Urban Rappelling, OPCOM, AEW Helmets, CV-22 Osprey). Placar geral da Central: **330 mods** somando os 5 presets.
- 📖 **Página nova `/arma3-tutorial`** (pedido do operador: "tutorial sobre cada um desses mods… comandos, atalhos, como funciona, tudo detalhado em uma página"): os **105 mods explicados um a um** — o que é, como funciona, comandos & atalhos (em `<kbd>`) e dicas — organizados em **11 categorias** (Fundação, Movimento & Imersão, Interface & HUD, Cordas & Breach, Apoio de Fogo, Armas, Facções, Equipamento, Aeronaves, Construção, Admin & Performance) com **busca** e chips de filtro.
- ⌨️ **Honestidade nos atalhos**: teclas listadas são os padrões conhecidos (jogo/ACE); onde o mod não documenta padrão, o card diz "configurável" e aponta o caminho real (Options → Controls → Configure Addons, do CBA). Todo card linka a página oficial do Workshop.
- 🔗 A Central de Modpacks (aba Arma 3) ganhou o botão direto pro tutorial; cobertura garantida por script (105/105 mods do preset têm tutorial — zero faltando, zero sobrando).
- ✅ Verificado (Playwright, 12/12): 105 cards em 11 seções, 131 atalhos renderizados, busca e chips filtrando, links do Workshop nos 105, placar 330 na Central e navegação Central ↔ tutorial.

### 🧊 Launcher 0.7.3 — a caça completa ao "3D não funciona" (cache velho + WebGL no app)
- 🕵️ **Análise total pedida pelo operador.** Produção estava certa (código novo, GLBs e DRACO respondendo 200, render verificado) — os culpados estavam em VOLTA do visor:
- 🐛 **Service worker preso na v0.5.0** (o maior): o `sw.js` em produção ficou com `VERSION = baluarte-v0.5.0` por DUAS releases — quem visitou naquela época tinha um SW com cache **stale-while-revalidate** servindo site velho (por isso "mesmo assim não vai" com o site novo no ar). Agora: versão bumpada pra **v0.7.3** (instala, purga os caches antigos e assume), `/modelos-3d/**` **fora do cache** (binários grandes + risco de modelo/decoder de release velha) e a aba **recarrega 1x sozinha** quando um SW de release nova assume (com trava anti-loop).
- 🐛 **WebGL sem fallback no app**: o Launcher só tinha o switch de WebGPU — em GPU da blocklist, o Chromium 126 desliga o WebGL **sem** render por software e o visor morre "WebGL desativado" dentro do app. Agora o main sobe com `ignore-gpu-blocklist` (tenta a GPU real) + `enable-unsafe-swiftshader` (garante o software render) — o 3D passa a funcionar no Launcher mesmo em máquina com GPU vetada.
- 🖼️ **Aviso no acervo Sketchfab**: os cards do acervo continuam sendo iframe externo (tela preta com cookies de terceiros bloqueados — padrão dos navegadores). O modal agora avisa na hora e dá as duas saídas: "Abra no Sketchfab ↗" ou a Galeria 3D (que renderiza aqui no site).

### 🩺 Visor 3D com autodiagnóstico (site) — o "mesmo assim não vai" agora se explica
- 🔍 O operador testou a 0.7.2 e o visor seguiu sem abrir — e a produção está comprovadamente com o código novo (galeria, DRACO local e GLBs respondendo 200). Suspeito nº 1: **WebGL desligado/bloqueado na máquina** (consistente com o histórico da GPU: WebGPU desligado, sem shader-f16).
- ✨ Agora o visor **se diagnostica sozinho**: (1) a Galeria mostra um aviso vermelho NA HORA se o WebGL estiver desativado no navegador ("ative a aceleração de hardware e recarregue"); (2) ao clicar, o erro fala claro o que falta em vez do erro críptico do three.js; (3) GPU fraca que recusa antialias ganha segunda tentativa sem antialias.
- ✅ Verificado (Playwright, 4/4): com WebGL renderiza sem aviso; com `--disable-webgl` o aviso aparece na galeria e o erro do clique explica a correção.
- 📝 Nota do operador registrada: o tema militar do site é **hobby/interesse pessoal** — nada de trabalho militar real nem propaganda.

### 🧊 Launcher 0.7.2 — visor 3D que FUNCIONA de verdade (Galeria 3D no site)
- 🐛 **A causa do "não funciona"**: clicar num modelo do acervo abria um **iframe embed do Sketchfab**, que depende de **cookies de terceiros** (bloqueados por padrão nos navegadores modernos) → tela preta na máquina do operador.
- ✨ **Galeria 3D** nova na `/modelos-3d`: modelos LIVRES hospedados no próprio site que **renderizam aqui** no motor three.js (clicar e ver, sem depender de nada externo) — Soldado animado, Capacete sci-fi (PBR), Buggy e Lanterna, cada um com autor + licença + link. O operador adiciona os dele soltando o `.glb` em `public/modelos-3d/` + 1 entrada em `src/data/galeria-3d.js`.
- 🐛 **Bug do caminho local**: a validação de URL do visor (do fix de XSS) barrava caminhos same-origin (`/modelos-3d/x.glb`) como "Endereço inválido" — a Galeria não abria. Agora aceita `/caminho` de uma barra (rejeitando `//host` e `/\`).
- 🖼️ **Enquadramento correto pra skinned-mesh**: a caixa envolvente de modelos com esqueleto (soldado) vinha em rest-pose e minúscula → câmera nascia dentro do modelo (só as botas). Agora expande pelas posições reais dos **ossos** + fit-to-view pelo FOV/aspecto real. Palco do visor mais alto.
- 🔌 **DRACO decoder self-hosted**: antes vinha do `gstatic` CDN (quebrava `.glb` comprimido se a rede/CSP bloqueasse) — agora mora em `public/modelos-3d/draco/`, zero dependência externa.
- 🪖 **Arma 3 no site? Não.** O Drive do operador é a instalação completa do jogo (executáveis, DLLs, DLCs) — os modelos `.p3d` são conteúdo protegido da Bohemia e não podem ser republicados (#386). O caminho certo: abrir os seus localmente pelo Visualizador universal.
- ✅ Verificado (Playwright, render real com swiftshader): Galeria 10/10 (canvas monta, 11.376 triângulos + 4 animações no soldado, DRACO local servido, dispose limpo) + visor universal 10/10 (regressão) + screenshot do soldado inteiro enquadrado.

### 🛡️ Launcher 0.7.1 — Sentinela (fase 4 do #369) + Central de Modpacks + Minhas Redes
- 🛡️ **Sentinela** — a fase 4 do Arquivista, visibilidade DEFENSIVA 100% read-only (sem promessa de antivírus): comando **`sentinela`** no Núcleo varre Downloads/Desktop e relata **🔴 iscas de dupla extensão** (`boleto.pdf.exe` — "NÃO ABRA"), **🟡 executáveis** pra conferência humana, **⚡ o que inicia junto com o sistema** (autostart Windows/Linux — exceção cirúrgica à zona proibida: só os caminhos exatos, só NOMES) e **⚪ peso morto** (200 MB+ parado 6+ meses). Nada é tocado — a decisão é sempre do operador. Tool `sentinela_pc` no agente (read-only).
- 🎮 **Central de Modpacks**: a `/modpack` virou o hub de TODOS os jogos — abas **Minecraft** (catálogo com busca/tiers/categorias) e **Arma 3** (5 presets · 321 mods), placar geral no topo e deep-link `?jogo=arma3`. Jogo novo = mais uma aba + data file.
- 🌐 **Minhas Redes** (`/perfil`): os perfis públicos do operador em cards — GitHub, YouTube (@Spartan_Gamer_BR), TikTok (@lucasbeluccioficial), Instagram (@lucas_belucci_bellini), Steam, Nexus Mods (SpartanGamerBRoficial) e Wattpad (SPARTAN_BR). **Sempre em expansão**: perfil novo = 1 linha em `src/data/perfis.js`.
- ✅ Verificado: Sentinela 6/6 em Node puro (isca achada, pdf limpo ignorado, autostart listado) + navegador 13/13 (comando no Núcleo com "NÃO ABRA", abas da Central funcionando, 7 redes no perfil).

### ✋ Launcher 0.7.0 — Arquivista fase 3 (#369): organizar COM A MÃO DO OPERADOR
- ✨ Primeira capacidade de ESCRITA do Arquivista, com as regras do plano viradas em código: **`mover <de> para <destino>`** e **`apagar <arquivo>`** preparam uma ação e **NADA executa** até o operador digitar **`confirmar`** (`cancelar` ou qualquer outra mensagem desarma na hora — nada roda por acidente).
- 🗑️ **"Apagar" não apaga**: manda pra **lixeira do Baluarte** (`Documentos/Baluarte/lixeira` + manifesto) — `lixeira` lista, **`restaurar <id>`** devolve pro caminho original. `fs.unlink` em arquivo do operador não existe no módulo.
- 🛡️ Regras duras no motor: **1 arquivo por vez** (pasta é recusada), origem E destino validados (raiz + cofre pessoal + zona proibida + symlink), destino **nunca sobrescreve**, move entre volumes só solta o original depois de conferir a cópia. O **agente NÃO recebe** as tools de escrita nesta fase — só comandos digitados.
- ✅ Verificado: motor 13/13 em Node puro (fuga da raiz, cofre, sobrescrita, pasta, nome proibido — recusados; apagar→lixeira→restaurar ida-e-volta com conteúdo intacto) · Núcleo 6/6 (confirmação exige `confirmar`, pendência morre com `cancelar` OU com qualquer outro comando).

### 🪖 Presets ARMA 3 na /modpack (5 presets · 321 mods)
- 🎮 A página `/modpack` ganhou a seção **Presets Arma 3**: os 5 presets do operador (ALFA, Bravo, Charlie, GIT HUB, projeto baluarte vercel app) exportados do Arma 3 Launcher, servidos em `/arma3/preset-*.html` — **baixar e arrastar na janela do Launcher importa tudo**. Cada card expande a lista de mods com links do Steam Workshop (CBA, ACE, RHS, CUP…) + DLCs.
- ✅ Verificado (Playwright): 5 cards com download apontando pra `/arma3/`, lista expande com 37+ links do Workshop, preset servido íntegro (`arma:PresetName` presente).

## 2026-07-12

### 🔬 Launcher 0.6.1 — Arquivista fase 2 (#369): agora o JARVIS ANALISA
- ✨ Três capacidades novas, todas read-only: **`ler <arquivo>`** (conteúdo de texto/código, máx 256 KB — recusa binário, credencial e tudo que estiver no cofre), **`analisar <pasta>`** ("o que é isto?": classifica projeto/fotos/música/documentos/backups, totais, top extensões, maiores/mais recentes, **duplicados** por tamanho+hash e **gordura** — arquivos de 100 MB+ parados há 90+ dias) e **`procurar <trecho> em <pasta>`** (busca por CONTEÚDO, substring literal sem regex, só em tipos de texto seguros).
- 🛡️ **Fronteira nova blindada**: agora entram CAMINHOS como input — cada um passa por `validarCaminho`: dentro da raiz, nenhum segmento do cofre pessoal/zona proibida, **nenhum symlink no trajeto**; arquivos com cara de segredo (`.env`, `.pem`, `id_rsa`, `*senha*`, `*token*`…) são recusados até fora do cofre.
- 🤖 Tools novas no agente (`ler_arquivo`, `analisar_pasta`, `buscar_conteudo`) — dá pra pedir em linguagem natural no `hermes-agente`.
- ✅ Verificado: motor 19/19 em Node puro (escape de raiz `../..`, cofre por caminho direto, `.env`, `.exe`, binário disfarçado de `.js`, symlink pra `/etc` — todos recusados com mensagem amigável; duplicados e classificação de pasta certos) · Núcleo 5/5 no Playwright.

### 🔑 Login Google FUNCIONA no app + conversas não se perdem mais + Supabase em ordem
- 🐛 **Login Google no Launcher (a causa era dupla)**: (1) o `will-navigate` bloqueava o trajeto do OAuth (site → `supabase.co/auth` → `accounts.google.com` → volta) e jogava pro navegador EXTERNO — a sessão nascia lá fora e o app ficava deslogado; (2) mesmo sem isso o Google recusa navegador embutido quando o User-Agent entrega o `Electron`. Corrigido: origens de AUTENTICAÇÃO (e só elas) navegam dentro da janela + UA limpo (tokens `Electron/…` e `baluarte-launcher/…` removidos). Qualquer conta Google agora entra pelo app.
- 💾 **Conversas persistidas no Nexus (Supabase)**: o operador perdeu conversas importantes porque tudo vivia só no navegador (localStorage/IndexedDB). Agora cada troca do Núcleo E cada mensagem do `/jarvis` são espelhadas via `ingest_memory` (tags `conversa/jarvis/...`), best-effort — material pra treinar os modelos de IA do projeto.
- 🗄️ **Supabase Preview verde de novo**: o check acusava "Remote migration versions not found in local migrations directory" — as migrations locais (`0001_…`) não batiam com as versões timestamp do remoto e 3 migrations só existiam lá (`mil_curation` + 2 fixes do nexus aplicados via MCP). Repair completo: locais renomeadas pros timestamps reais, as 3 ausentes recuperadas do banco (`schema_migrations.statements`), a `nexus` base registrada no remoto — **14/14 espelhadas**.
- 🛡️ **Lints do Supabase**: extensão `vector` movida do `public` pro schema `extensions` (lint 0014; `juris_doutrina` e `ingest_event` verificados funcionando após o move). Os avisos de `SECURITY DEFINER` executável por anon (`ingest_*`, `bump_*`) são **por design** — porta pública de telemetria com portão de `ingest_key` bcrypt dentro da função. Falta 1 ação de dashboard pro operador: ativar *Leaked Password Protection* (Auth → Settings).

### 🗂️ Launcher 0.6.0 — JARVIS Arquivista, fase 1 (#369): os olhos do JARVIS no PC
- ✨ **O JARVIS agora enxerga os arquivos da máquina** (como Codex/Claude Code) — read-only: no motor não EXISTE API de escrever/mover/apagar. Novo `desktop/src/arquivos.js` + canais `arquivos:status|buscar|relatorio` no funil IPC allowlisted.
- 🛡️ **Cofre pessoal**: pastas com `pessoal`, `privado`, `senha(s)`, `secret`… são puladas inteiras — nem o NOME aparece em busca ou relatório, só a contagem de "protegidas". Zona técnica proibida (`.ssh`, cofres de credenciais, `AppData`, `node_modules`, dotfolders) e symlinks nunca seguidos. Limites duros (300k entradas / prof. 14 / 2 min) → resultado parcial sinalizado, nunca app travado.
- 💬 **Comandos no Núcleo**: `arquivos` (status) · `arquivos <nome>` (busca sem acento/caixa, caminhos completos) · `relatorio arquivos` (inventário: salva `.md` com totais/top extensões/20 maiores/por pasta + **listagem completa de caminhos** em `.txt` em `Documentos/Baluarte` — o pedido do notebook novo).
- 🤖 **Ferramentas do agente**: `buscar_arquivos` e `relatorio_arquivos` entram no catálogo do `hermes-agente` SÓ no app (`jarvis-arquivos.js`); na web nem existem (#238).
- ✅ Verificado: motor em Node puro com raiz fake armadilhada — 17/17 (cofre invisível até buscando o nome exato, `.ssh`/`node_modules` bloqueados, symlink pra `/etc` ignorado, relatório não conta o próprio arquivo) · Núcleo via Playwright — 7/7 (status/busca/relatório com ponte mockada; na web o gate segue no teaser). Plano completo das fases 2–4 no **#369**.

### ⬡ Visor 3D universal (#310 fase 2) — qualquer modelo 3D, direto no site
- ✨ A página `/modelos-3d` ganhou o **Visualizador universal**: arraste um arquivo (`.glb`, `.gltf`, `.stl`, `.obj`, `.fbx`), escolha do disco ou cole uma **URL** — o modelo abre em 3D ali mesmo (three.js: iluminação de estúdio RoomEnvironment + ACES, enquadramento automático, OrbitControls, contagem de triângulos, animação embutida com play/pause, girar automático e recentrar). Botão **✦ Exemplo** abre o capacete oficial da Khronos.
- 🧳 `.gltf` multi-arquivo funciona: solte o `.gltf` junto com o `.bin` e as texturas que o loader resolve os caminhos por nome (blob-URLs). DRACO comprimido também (decoder oficial sob demanda).
- 🔗 Deep-link compartilhável: `#/modelos-3d?src=<url-do-modelo>` abre o visor direto. Telemetria Nexus registra `ver_3d_arquivo`.
- 🪶 Peso zero no boot (#238): o three.js (~218 KB gzip) é chunk **lazy** — só baixa quando um modelo é aberto. O acervo Sketchfab continua igual (embed oficial + créditos).
- ✅ Verificado (Playwright, GLB real da Khronos): 10/10 checks — render de verdade (screenshot com PBR ok), info de triângulos, dispose limpo ao fechar, deep-link, erro amigável pra URL quebrada, 0 erros de página.
- 📦 **Launcher 0.5.3 → 0.5.4**: entrega o site novo no app — e é o teste de fogo do diálogo "Reiniciar agora" da 0.5.3 com um update de verdade.

### 🔔 Launcher 0.5.3 — versão visível no `motor` + "Reiniciar agora" no update (fim da armadilha da bandeja)
- 🕳️ **A armadilha da bandeja, diagnosticada**: o operador atualizou pro 0.5.2 e continuou vendo o erro antigo — porque **fechar a janela NÃO fecha o app** (ele vive na bandeja) e o electron-updater só instala **no quit**. O update baixava e ficava eternamente esperando um "Sair" que nunca vinha; o operador seguia rodando a versão velha sem saber.
- ✨ **Diálogo "Reiniciar agora"**: quando o update termina de baixar, o app mostra a janela (se estava escondida) e pergunta — `Reiniciar agora` aplica na hora (`quitAndInstall`); `Depois` mantém o comportamento antigo (aplica no Sair). Também passa a **re-checar updates a cada 2 h** (antes só checava no boot — num app que nunca fecha, nunca mais checava).
- 🏷️ **Versão do launcher em toda resposta do `motor`**: o `hermes:status` agora devolve `appVersion` (via `app.getVersion()`, à prova de contexto sem Electron) e o comando `motor` do Núcleo imprime `· launcher vX.Y.Z` nos 5 ramos (pronto/aviso de modo/baixando/fatal/web) — acabou o "não sei qual versão está rodando" no diagnóstico.
- ✅ Verificado: `hermes.js` em Node puro degrada limpo (`appVersion:null`, sem crash); Playwright no Núcleo com a ponte mockada — versão aparece no ramo feliz e no fatal, e status sem `appVersion` (launcher antigo) não quebra. Launcher **0.5.2 → 0.5.3**.

### 🎯 Launcher 0.5.2 — motor nativo RESPONDE (fix do "modelResponse is not iterable")
- 🐛 O diagnóstico do comando `motor` na máquina do operador entregou a causa exata: `NATIVE_INIT_FAILED · modelResponse is not iterable`. O módulo carregou ✓, o modelo carregou ✓ — o `generate` morria no **formato do histórico**: a API v3 do node-llama-cpp exige `{type:'model', response:[texto]}` (lista) e mandávamos `{type:'model', text}`. Um campo errado derrubava o motor no 1º diálogo com histórico.
- ✅ Corrigido e provado com mock que valida o formato v3 (reproduz o erro com o código antigo; o novo passa com a conversa exata do operador). Launcher **0.5.1 → 0.5.2** — auto-update entrega; sem desinstalar nada.


### 🧯 WebLLM em GPU sem shader-f16 + falha dupla transparente (aceite on-device, parte 2)
- 🐛 No aceite do operador, o `modo hermes-agente` caiu no fallback WebLLM e morreu com **"requires WebGPU extension shader-f16"** — TODO o catálogo era q4f16; em GPU sem a extensão, nenhum modelo WebLLM funcionava (era também o motivo original do "hermes não funciona").
- ✨ **Auto-fallback f16 → f32**: o load detecta o erro de shader-f16 **uma vez**, troca pro gêmeo `q4f32_1` (Mistral-7B, sem gêmeo publicado, mapeia pro Hermes-2-Pro-Llama-3-8B-f32) e **grava a lição** (`webllm:semF16`) — nas próximas cargas vai direto pro f32. Catálogo ganhou 3 variantes f32 escolhíveis no `modelos`.
- 🔍 **Falha dupla transparente**: quando o motor NATIVO falha em pleno voo E o WebLLM também, o erro agora mostra OS DOIS motivos + "diga motor pra detalhes" (antes o motivo do nativo sumia no console e o operador só via o erro do WebLLM).


### 🩺 Comando `motor` cruza com o MODO ativo (a pegadinha do 402)
- ⚠️ No aceite on-device do operador, o motor NATIVO ligou (0.5.1 ✓) mas o chat devolvia **HTTP 402 do OpenRouter** — o modo de IA salvo era `hermes` (servidor/nuvem), não `hermes-agente`: o motor estava pronto e **parado no banco**. O `motor` dizia "no controle" mesmo assim.
- ✅ Agora o comando cruza com `loadConfig().mode`: se o modo ativo não usa o nativo, avisa quem realmente responde o chat (ex.: "OpenRouter na nuvem — gasta créditos!") e ensina o `modo hermes-agente`. Verificado (Playwright) reproduzindo o cenário exato do operador.


### 🔧 Launcher 0.5.1 — o motor NATIVO liga de verdade (fix do WEB (WEBLLM) eterno)
- 🐛 **Bug raiz achado e corrigido**: `node-llama-cpp` v3 é **ESM-only** e o main do Electron carregava com `require()` — no Node 20 do Electron 31 isso estoura `ERR_REQUIRE_ESM` em **toda** máquina → motor marcado FATAL → HUD preso em **WEB (WEBLLM)** pra sempre (o sintoma que o operador viu). Agora a carga é `import()` dinâmico (async, cacheado, mesma blindagem zero-crash).
- 🐛 **Deadlock do download desfeito**: o front só usava o nativo com `available:true`, que exigia modelo baixado — mas o download só começava no 1º `generate`, que nunca vinha. Agora a **sondagem de status dispara o download em segundo plano** (abrir o Núcleo já prepara o motor; o WebLLM cobre enquanto baixa; HUD mostra `NATIVO ⬇ N%`).
- 🖥️ **WebGPU garantido no app** (`enable-unsafe-webgpu` no main): em máquinas onde o Chromium desliga o WebGPU, nem o WebLLM funcionava ("o hermes não funciona") — onde já era suportado, é no-op.
- 🩺 **Comando novo `motor` no Núcleo**: diagnóstico on-device sem DevTools — disponível/baixando N%/fatal com código, motivo e correção; a própria sondagem já dispara o preparo do motor.
- 🏷️ Classificador de erro ganhou `ERR_REQUIRE_ESM`/`ERR_MODULE_NOT_FOUND` (códigos do `import()`).
- ✅ Verificado: caminho de degradação em Node puro (módulo ausente → fatal limpo, generate rejeita sem crash) e caminho feliz com mock ESM-only (o `import()` carrega o que o `require()` não conseguia); Launcher **0.5.0 → 0.5.1** (auto-update entrega o fix).

### 🎻 Músicas Próprias — +14 faixas (43 → 57) e a 1ª faixa LOCAL (#356)
- 🎵 **+14 variações novas** de "A Baluarte" coletadas dos comentários da issue (57 no total, todas com capa).
- 🎻 **Primeira faixa local no repo**: "DaVinci Intro — dark cello arpeggio" (`public/musicas/davinci-intro-dark-cello.mp3`, 4,3 MB, 192 kbps) — o operador subiu o arquivo (já era MP3 puro, sem trilha de vídeo pra extrair); toca num `<audio>` nativo com `preload="none"` (o site não baixa nada até dar play). Novo export `MUSICAS_LOCAIS`.
- ✅ Verificado (Playwright): 57 cards com capa, faixa local renderiza e o MP3 responde `206 audio/mpeg` (range requests ok); 0 erros.

## 2026-07-11

### 🖼️ Músicas Próprias — capas + 12 faixas novas (#356)
- 🎨 **Cada faixa agora tem a CAPA** (arte gerada no Suno): a grade virou galeria — card com a arte quadrada + número/nome. A capa vem do `og:image` da página de cada faixa (variações podem compartilhar arte, comportamento do próprio Suno); `loading="lazy"` (43 imagens não pesam a carga).
- 🎵 **+12 faixas novas** dos comentários recentes da issue: **31 → 43 variações** de "A Baluarte".
- ✅ Verificado (Playwright): 43 cards com 43 capas do CDN do Suno, lazy, player abre ao clicar, 0 erros.


### 🚀 Releases 0.5.0 — instalador novo (Baluarte Launcher) + APK celular
- 📦 **Launcher 0.5.0** (`desktop/package.json` 0.4.0 → 0.5.0): leva TUDO da v0.5.0 — Hermes default + seletor de modelos, voz do J.A.R.V.I.S. (3 camadas), modo `hermes-local` (LM Studio/Ollama da máquina), Núcleo com Fase D rica (coração na cena, telemetria no HUD, token na ponte), Nexus multi-site e o Corpo Total consertado. Release cortada pelo workflow **Desktop Release** (Win/Mac/Linux, auto-update pelos apps instalados).
- 📱 **Mobile 0.5.0**: release `mobile-v0.5.0` (prerelease — não vira "latest") com o **APK direto** via workflow **Mobile Release** (`workflow_dispatch` + `publish_tag`); o `/baixar` resolve a release `mobile-v*` mais recente em runtime.


### 🎤 Músicas Próprias na Central de Música (#356)
- 🎵 Nova seção **"Músicas Próprias"** no `/musicas`: a obra **"A Baluarte"** do operador em **31 variações** geradas no Suno AI (conta spartangamerbr68), coletadas dos 37 comentários da issue (deduplicadas 37 → 31).
- 🪶 **Player LAZY**: a página não carrega nenhum iframe do Suno — só o da faixa clicada (1 por vez), mantendo a página leve (#238). Grade numerada, faixa ativa destacada, crédito com link pra faixa e pro perfil.
- 🗂️ Data-driven: `src/data/musicas-proprias.js` (adicionar faixa = 1 linha).
- ✅ Verificado (Playwright): 31 faixas, 0 iframes antes do clique, player carrega o embed certo ao clicar, crédito ok, 0 erros.


### 🧠 Núcleo 10x — Fase D RICA: telemetria no HUD, coração na cena e token na ponte (#316)
- 📊 **Telemetria → HUD**: eventos `telemetry` atualizam o vital novo **TELEMETRIA** (🔋 bateria/métricas + origem) — o cockpit mostra o aparelho remoto ao vivo.
- ❤️ **Biometria → energia**: eventos `biometric` com `heartRate` atualizam o vital **BIOMETRIA** (♥ bpm, alerta fora de 45–120) e a cena ganha `setHeartRate(bpm)` — **o núcleo passa a BATER no ritmo do coração do operador** (clamp de segurança 0.6–3.2×).
- 🗣️ **Voz → ação**: eventos `voice` (tipo novo do check da 0010) executam a intenção como os `command` — abrir/fechar funções por voz.
- 🔐 **Token na ponte WS**: `nucleo-socket.js` manda `?token=` no handshake quando configurado (backend Java com `NUCLEO_TOKEN`); comando novo **`ponte token <valor>`** (fica só no navegador). `simular bio|telemetria|voz` demonstra cada reação sem backend.
- ✅ Verificado (Playwright, app simulado): `simular bio` → "♥ 94 bpm · demo"; `simular telemetria` → "🔋65% · demo"; `ponte token` guarda e reconecta; 0 erros.


### 🧊 Modelos 3D — deep-link, compartilhar e telemetria (#310 → #348)
- ✅ **Auditoria do visualizador**: as 7 coleções da issue (+3 extras) já estavam cobertas — 432 modelos semeados, busca por nome/autor, grupos, paginação ao vivo da API do Sketchfab e crédito completo (autor/licença/link) em card + player. Verificado no navegador: tudo funcional, 0 erros.
- 🔗 **Deep-link compartilhável**: `#/modelos-3d?m=<uid>` abre o modelo direto; botão **⧉ compartilhar** no player copia o link.
- 📡 **Ligado ao Nexus (#348)**: abrir um modelo registra `interaction` (`ver_modelo_3d` + uid/nome/autor) — a IA aprende quais modelos chamam atenção. Lazy e best-effort (telemetria nunca atrapalha o viewer).


### 🕸️ Nexus Central — multi-site + telemetria + Direito no Supabase (0010) + voz do servidor
- 🗄️ **Migration 0010 aplicada no banco oficial** (iniciada pelo Claude do Chrome via MCP, finalizada por esta sessão): **Pilar 1** — `tenants` (baluarte/codevibe/essence, `ingest_key_hash` bcrypt) + `tenant_members` + `nexus.is_member()`; **Pilar 2** — `nucleo_events`/`memories`/`site_stats` existentes ganharam `tenant_id` (o `/api/nucleo` segue intacto) e RPCs `SECURITY DEFINER` de ingestão (`ingest_event`/`ingest_stat`/`ingest_memory` — sites externos gravam SEM insert direto, portão = ingest_key); **Pilar 3 (Direito)** — partes, processos (N:N), prazos (flag fatal), `juris_doutrina` com **pgvector**+ivfflat (RAG) e peças com versões; RLS em tudo. Espelho fiel no repo: `supabase/migrations/0010_nexus.sql`.
- 🐛 **2 fixes aplicados no banco** (a validação anterior não pegou): `ingest_event` estourava o `nucleo_events_type_check` legado → check ampliado com os tipos de telemetria (`page_view`, `click`…); `buscar_juris` executável por `anon` via grant implícito a PUBLIC → revogado na raiz (advisor 0028). Advisors re-rodados: warns restantes são by-design.
- 📡 **Cliente Nexus no site** (`src/utils/nexus.js`, sem SDK): `nexusEvent/Stat/Memory` + **telemetria automática** lazy pós-boot — `page_views` por rota e `tempo_tela_seg` por sessão (flush no `pagehide`, keepalive). Best-effort, nunca quebra o site. Snippet portátil pros outros sites em `docs/NEXUS.md`.
- 🗣️ **Voz pelo SERVIDOR** (`api/voz.py` + `speak()` em 3 camadas): `POST /api/voz {text}` → MP3 ElevenLabs com a chave nas **envs do Vercel** (`ELEVENLABS_API_KEY` — o navegador nunca vê; 503 desliga a tentativa na sessão) + `GET ?signed=1` (signed URL do agente). Ordem: chave local → servidor → speechSynthesis. `scripts/testar-elevenlabs.mjs` valida chave/TTS/agente.
- ✅ Verificado: RPC real em produção (`ingest_stat` somou, `page_view` aceito pós-fix, **chave errada rejeitada**); Playwright — o site dispara os `ingest_stat` certos por rota, 0 erros; grants conferidos no catálogo; `py_compile` limpo. Pendências do operador em `docs/NEXUS.md` (chaves ElevenLabs, `NUCLEO_TOKEN`, rotação das ingest keys).

## 2026-07-10

### ⚙️ v0.5.0 — fatia 5: instaladores 1-clique do Hermes local (Bash + PowerShell) (#340)
- 📜 **`scripts/instalar-hermes.sh`** (Linux/macOS) e **`scripts/instalar-hermes.ps1`** (Windows): automação completa em 6 etapas com feedback colorido `[OK]/[!]/[ERRO]` — (1) checa ambiente (curl/PowerShell, ~6 GB livres); (2) instala o **Ollama** silenciosamente (Linux: script oficial; macOS: brew; Windows: winget com fallback pro `OllamaSetup.exe /VERYSILENT`); (3) sobe o servidor em segundo plano na `:11434` **já com `OLLAMA_ORIGINS` configurado** (systemd drop-in no Linux, `setx` no Windows, env+nohup no macOS) — o CORS é o único ajuste que o site exige; (4) baixa o modelo (**`hermes3`** default, `BALUARTE_HERMES_MODELO` troca); (5) **teste de vida real**: `GET /v1/models` + chat `POST /v1/chat/completions` ("BALUARTE OK"); (6) imprime os comandos do site (`hermes ollama` → `modo hermes-local` → `voz on`).
- 🧪 Bash validado de ponta a ponta com **stub do ollama** (binário + API fake na 11434): 6 etapas, health checks e parse da resposta ok; `bash -n` limpo. PowerShell 5.1-compatível (sem operadores PS7).
- 📖 `docs/HERMES-LOCAL.md` ganhou a seção "Instalação automatizada".

### 🖥️ v0.5.0 — fatia 4: Hermes LOCAL DA MÁQUINA (LM Studio/Ollama) + voz (#340)
- ⬢ **Novo modo `hermes-local`** (`src/utils/hermes-local.js`): conecta o J.A.R.V.I.S. a QUALQUER servidor de LLM rodando na máquina do operador via **API OpenAI-compatível** (`/v1/chat/completions`) — LM Studio (`:1234/v1`, default), Ollama (`:11434/v1`), text-generation-webui (`:5000/v1`)… 100% privado, nada passa por nuvem. Timeout largo (2 min — modelo carregando), erros **acionáveis** (servidor fora → como subir + CORS; 404 → conferir `/v1`; mixed content → guard com correção).
- 🎛️ **Núcleo (sem menu, Regra de Ouro)**: `hermes status` (health check + modelos), `hermes url <endereço>`, presets `hermes lmstudio|ollama|textgen`, `modo hermes-local`, e o `modelos` agora lista o **catálogo VIVO** do servidor local (`GET /v1/models`); `modelo <nome>` troca. `/jarvis`: modo no seletor + campos ENDPOINT/MODELO com notas de CORS.
- 🗣️ **Pipeline completo Hermes→ElevenLabs já fecha**: a resposta local flui pelo `speak()` existente — com `voz on` (+`voz chave`), o texto do Hermes da máquina sai FALADO (ElevenLabs; fallback navegador). Áudio sem código novo.
- 🐛 Fix de quebra latente: `processOllama` chamado do Núcleo recebia `{role:'assistant', content}` e mandava `content: undefined` pro Ollama (e assistant virava user) — agora aceita os dois formatos, como o modo novo.
- 📖 **`docs/HERMES-LOCAL.md`**: portas, envs do lado do servidor (`OLLAMA_ORIGINS`, Enable CORS no LM Studio), troubleshooting.
- ✅ Verificado (Playwright + mock LM Studio real na `:1234` com CORS): `hermes status` acha o servidor e o modelo, `modelos` lista vivo, mensagem no chat volta do servidor local e renderiza, preset troca a URL, servidor desligado → erro acionável; 0 erros de página.

### 🧭 v0.5.0 — fechamento: SW bump + estado real da ponte de voz (#340)
- 🗄️ **Service Worker `baluarte-v0.4.0` → `baluarte-v0.5.0`** (`public/sw.js`): as fatias 1–3 da v0.5.0 (Hermes default, voz, ponte /api/nucleo) entraram sem bump do cache — navegadores que já tinham o SW antigo seguravam assets velhos. Agora o SW novo instala e limpa os caches da v0.4.0.
- 📡 **Ponte `/api/nucleo` verificada em produção**: função no ar (`{"ok": true}`), mas **`configured: false`** — falta o operador setar `NUCLEO_TOKEN` (+ conferir `SUPABASE_SERVICE_ROLE_KEY`) nas envs do Vercel e redeployar (checklist de ~2 min no comentário do #340). A voz→Núcleo só liga depois disso.
- ☑️ Issue #340 atualizada: checkboxes das 4 diretrizes marcados (parte remota completa desde os PRs #341–#345).

### 🗂️ Zomboid Admin — banco de IDs povoado com os 159 mods REAIS da coleção
- 📦 `src/data/zomboid-admin.js` agora tem os **159 mods** da coleção "alfa" com **Workshop ID real** (extraído das URLs da Steam coladas pelo operador — vai direto no `WorkshopItems=` do servidor). Mod ID/Spawn ID preenchidos só onde o mod declara (Caution Pack, tsarslib, M60, `Base.ArmoredMotorhome`); o resto fica "—" — **nenhum ID inventado**.
- 🏷️ Categorias expandidas de 5 → **8** (veículo, blindado, aeronave, arma, uniforme, mapa, utilidade, item), cada uma com **cor própria no badge** pra varrer os 159 cards; busca ao vivo cobre tudo.
- 📝 Nota da página atualizada: explica a origem dos dados e como achar Spawn ID de veículo no jogo.

## 2026-07-06

### ⌘ Zomboid — Administração de Servidor (comandos + banco de IDs com busca)
- 🖥️ Nova página **`/zomboid-admin`** (tema sobrevivência: escuro + verde-oliva + vermelho-perigo, escopado pra não vazar no tema Ouro): **Seção 1** — tabela de **comandos de admin** (Comando / Função / Exemplo) com botão **copiar**; `godmod` e `setaccesslevel` marcados como perigosos (borda vermelha). **Seção 2** — **banco de IDs** (mods/veículos) com **busca ao vivo em JS** (nome, categoria, Mod/Workshop/Spawn ID) e cards com copiar por campo.
- ✅ Comandos com a **grafia correta do jogo** (`/additem`, `/addvehicle`, `/setaccesslevel` — o que realmente funciona no console).
- 🗂️ Data-driven (`src/data/zomboid-admin.js`): 6 comandos + 17 mods da coleção semeados; os IDs ficam “—” até o operador colar a lista real (nenhum ID inventado). Link cruzado com `/zomboid`.
- ✅ Verificado (Playwright): 6 comandos, 17 cards, busca por categoria/nome filtra certo, estado vazio ok, 0 erros.

### 🧟 Modpack Zomboid — vitrine da coleção "alfa" (Spartan Gamer BR)
- 🎮 Nova página **`/zomboid`**: espelho no Baluarte da coleção da Steam Workshop do operador — modpack militar tático de **Project Zomboid** (159 mods). Herói imersivo + chips (jogo/autor/total) + **botão direto pra Steam** + **destaques por frente** (veículos KI5, aeronaves, blindados, uniformes, mundo/estruturas).
- 🗂️ Data-driven (`src/data/zomboid-mods.js`): metadados + destaques curados — a lista completa segue na Steam. Nota de crédito aos autores dos mods.
- 🧩 Entrada na sidebar (🧟 Modpack Zomboid, ao lado do Modpack Minecraft) + título/ícone. CSS módulo-escopado (fora do boot). Não toca no `/modpack` (Minecraft).
- ✅ Verificado (Playwright): página renderiza (3 chips, CTA pra Steam, 5 frentes, 17 mods em destaque), 0 erros.

## 2026-07-05

### 📡 v0.5.0 — Fatia 3: a VOZ comanda o Núcleo — ponte /api/nucleo sem servidor (#340)
- 🌉 **Ponte serverless completa**: agente de voz (ElevenLabs) → **`POST /api/nucleo`** (função Vercel, valida `X-Nucleo-Token`) → INSERT em **`nucleo_events`** (Supabase, migration 0009, escrita só via service key) → **Realtime empurra pro site** → o Núcleo reage NA HORA. Substitui o WebSocket do backend Java enquanto ele não tem deploy — mesmo shape de evento.
- 🗣️ **Comando remoto EXECUTA no site**: evento `command` aparece no transcript ("📡 voz: …") e as intenções de abrir/fechar função rodam de verdade (dizer "mostrar corpo total" pro agente no celular **abre o painel no site**). Segurança: texto vindo de fora **nunca** vai pro cérebro (não gasta tokens nem executa tools do agente).
- 🔌 `nucleo-socket.js`: além do WS opt-in do Java, agora assina `nucleo_events` via Supabase Realtime **sempre que configurado** (lazy, best-effort). Comando `simular` demonstra: abre a Memória por evento.
- 🔐 Envs da função (Vercel): `NUCLEO_TOKEN` + `SUPABASE_SERVICE_ROLE_KEY` (aceita também o alias `SUPABASE_SERVICE_KEY`) — sem elas responde 503 explicando; token errado 401. GET = health.
- ✅ Verificado: INSERT no banco chegou **ao vivo** no listener vanilla (`{type:"command", text:"mostrar corpo total"}`); no site (Playwright), evento de comando → bolha 📡 + contador + **painel MEMÓRIA abriu sozinho**; sintaxe da função ok; 0 erros.

### 🗣️ v0.5.0 — Fatia 2: Voz do J.A.R.V.I.S. + APK direto no site (#340)
- 🗣️ **Voz do J.A.R.V.I.S.** (`src/utils/jarvis-voice.js`): o Núcleo agora FALA as respostas. Dois motores: **ElevenLabs** (voz de referência `Gubgw9l4dtIoQA9YZHgx`, `eleven_multilingual_v2` — fala qualquer idioma) quando o operador colar a chave, e **`speechSynthesis` do navegador** (grátis/offline) como padrão e fallback automático. Texto limpo pra fala (markdown/URLs/código fora), teto de 600 chars.
- 🎚️ **Tudo por comando, sem menu** (Regra de Ouro): `voz on/off` · `voz idioma <código>` (pt-BR default; en/es/fr/de/it/ja) · `voz chave <key>` (guardada SÓ no navegador) · `silêncio`. Fala para ao sair da rota.
- 📱 **APK direto no site** (`/baixar`): nova seção **Celular** — o botão Android resolve em runtime a release `mobile-v*` mais recente e baixa o `.apk` **sem loja e sem login** (a solução temporária pedida pelo operador); nota de instalação ("fontes desconhecidas") e alternativa PWA pro iOS.
- 🔒 Workflow `mobile-release.yml` marcado **`prerelease: true`** — a release do APK NÃO vira a "latest" (protege o auto-update do launcher e o /baixar desktop, que leem `/releases/latest`).
- ✅ Verificado (Playwright): comandos de voz respondem e persistem (`voice:on/lang`); `/baixar` mostra a seção Celular com botão Android e notas; 0 erros.

### 🧠 v0.5.0 — Fatia 1: Hermes é o motor PADRÃO + seletor de modelos + Corpo Total resiliente (#340)
- ⚙️ **Hermes agente = default** (`jarvis-engine.js`): quem nunca configurou o J.A.R.V.I.S. agora nasce no **`hermes-agente`** (IA de verdade, local, sem API — WebLLM no site, motor embutido no app com a blindagem #310). Config já salva não é tocada.
- 🎛️ **Alternância dinâmica de modelos por comando** (Núcleo, sem menu — Regra de Ouro #324): **`modelos`** lista o catálogo com o ativo marcado; **`modelo <nº|nome>`** troca na hora (hermes-agente/webllm → catálogo WebLLM; ollama/claude → nome livre). O `/jarvis` já tinha o seletor visual por modo.
- 🤖 **Corpo Total consertado na web** (o bug: exceção sem tratamento matava o recurso): (1) **mãos viraram opcionais** — MediaPipe falhou (CDN/wasm/`window.Hands`), degrada e o **corpo segue rastreando**; (2) `loadScript` com **teto de 20s** — CDN pendurada (rede móvel ruim) vira mensagem acionável em vez de "Carregando…" eterno; (3) botão **nunca trava** (try/finally). Canvas já era responsivo.
- ✅ Verificado (Playwright): perfil novo → MODO `HERMES-AGENTE` nos vitais; `modelos`/`modelo 2` listam e persistem; CDN pendurada → status acionável + botão reabilitado; 0 erros.

### 🚀 Launcher 0.4.0 + Corpo Total reconhecido no app (#338)
- 🎥 **P0 — causa raiz do Corpo Total corrigida**: o `main.js` do Electron **não tinha `setPermissionRequestHandler`** — o pedido de câmera do `getUserMedia` era **negado em silêncio** (por isso o Corpo Total "não era reconhecido" no app do PC). Agora a sessão registra request+check handlers com **allowlist**: só permissão `media` e só pra origem confiável do site. No macOS, o handler dispara o prompt do sistema (`askForMediaAccess`) e o `Info.plist` ganhou `NSCameraUsageDescription`/`NSMicrophoneUsageDescription` (`build.mac.extendInfo`).
- 📦 **P1 — launcher 0.4.0**: `desktop/package.json` **0.3.0 → 0.4.0** (leva junto a blindagem do motor nativo, o Núcleo de tela única #324 e o fix do P0). Release cortada pelo workflow **Desktop Release**.
- 🖥️ **P2 — validação on-device** (local): registrada no `docs/HANDOFF-LOCAL.md` — PC (câmera acende no Corpo Total via Núcleo), Android (APK do Mobile Release + permissão) e iOS (Info.plist no Xcode).

## 2026-07-04

### 📡 Rede Neural no site (/comms) + "continuar de onde parou" no acervo
- 💬 **Página `/comms` — Rede Neural**: o chat global do 0008 ganhou a interface — histórico (últimas 50), **mensagens chegando ao vivo** pelo WebSocket (ponto de status da ponte), envio pra quem tá logado (CTA "Entrar com Google" pra quem não tá), bolhas próprias destacadas, anti-flood do banco vira toast amigável ("Calma, soldado"). Entrada na sidebar (📡, grupo Início), título e ícone registrados. Rede pendurada não trava: **teto de 8s** no histórico com aviso gracioso (as msgs ao vivo seguem chegando).
- ▶️ **Acervo de músicas retoma de onde parou** (`/musicas`): cada faixa do acervo salva o timecode (`saveBookmark`, local-first + nuvem com debounce) e, ao tocar de novo — **em qualquer aparelho logado** — retoma do ponto salvo (só se caiu no meio da faixa; começo/fim recomeça normal).
- ✅ Verificado (Playwright, produção local): página renderiza (feed/CTA/título), timeout gracioso aos 8s, `/musicas` sem regressão, 0 erros. (REST+Realtime contra o banco real já provados na fatia 0008 — o sandbox bloqueia rede do navegador.)

### 🗄️ Banco de Dados Universal — sync de mídia + Rede Neural (Supabase 0008)
- 📼 **Sync Universal** (`media_bookmarks`): save-state de mídia por usuário — o timecode exato onde parou (vídeo/filme/música/rádio/leitura) — sincronizado entre desktop (Electron) e mobile/web pelo mesmo login. `UNIQUE (user_id, media_key)` = upsert de 1 request; índice `(user_id, updated_at desc)` pro "continuar assistindo"; `updated_at` automático por trigger. Preferências profundas seguem em `profiles` (0005).
- 🌐 **Rede Neural** (`global_comms`): chat global entre todos os usuários — leitura pública, escrita autenticada só como si mesmo, entrega **instantânea** via **Supabase Realtime** (tabela na publicação `supabase_realtime`; INSERTs chegam por WebSocket, zero polling/recarregar).
- 🔐 **Segurança de Aço**: RLS **dono-só nas 4 operações** dos save-states (impossível alterar o estado de outro); chat sem `update` (histórico íntegro), delete só da própria mensagem; **anti-flood no banco** (trigger, 1 msg/2s por usuário — nem cliente adulterado fura); funções de trigger com `EXECUTE` revogado da API.
- 🪶 **Cliente sem SDK** (regra web=leve): `media-sync.js` (local-first + debounce 4s + upsert), `realtime.js` (protocolo Phoenix do Realtime em ~90 linhas: `postgres_changes`, heartbeat, backoff) e `comms.js` (histórico + send + dedupe).
- ✅ **Aplicada e verificada em produção**: migration `universal_db` no banco oficial; leitura pública do chat 200, escrita anônima **401 RLS**, save-state anônimo bloqueado; INSERT no banco chegou **ao vivo** no cliente WebSocket vanilla; advisors sem avisos novos. Doc: `docs/SUPABASE.md` §10.

### 🛡️ Motor Hermes nativo — blindagem e fallback absoluto (zero-crash) (#310/#222)
- 🧯 **Try/Catch de Aço no main do Electron** (`desktop/src/hermes.js`): o node-llama-cpp é interceptado nos DOIS pontos onde ABI estoura — o `require` e o `getLlama()/loadModel()` (ERR_DLOPEN_FAILED, `NODE_MODULE_VERSION` mismatch, ELF/arch errado) — e também no runtime (`generate`). O erro é **classificado** (abi/módulo-ausente/init), o motor vira **FATAL na sessão** (falhou 1x → nunca re-tenta; resposta imediata, sem timeout) e **nada sobe** pro app (Zero Crash Policy).
- ⚡ **Chave automática em pleno voo** (`jarvis-hermes-agent.js`): o cérebro nativo é embrulhado num interceptador — se falhar no meio de uma conversa, o **WebLLM assume NA HORA, na mesma conversa**, sem erro pro usuário. Sem app/motor, já nasce no WebLLM (comportamento anterior preservado).
- 📟 **HUD do motor** na tela do Núcleo (sinais vitais): linha **MOTOR** mostra `NATIVO (GGUF)` / `WEB (WEBLLM)` / `NATIVO ⬇ N%` (baixando) — sondada na entrada e **ao vivo** via evento `hermes:engine` (qualquer fallback aparece no HUD no ato).
- 🧾 **Log estruturado** (console de dev / main): `onde / código / motivo / correção` — aponta `npx electron-rebuild -m node_modules/node-llama-cpp` quando é ABI — e avisa que **o fallback já assumiu o controle**; 1 warn só (idempotente).
- ✅ Verificado: teste de unidade em Node com ABI simulado (status fatal instantâneo c/ hint, `generate` rejeita limpo em 0ms, log único, idempotente) + Playwright no build de produção (HUD nos 3 estados: NATIVO/WEB/baixando).

### 📱 v0.4.0 — M4: Android com Capacitor pronto pra buildar no CI (#323)
- ✅ **Validado de ponta a ponta**: o workflow **Mobile Release #1** rodou verde em ~3 min — artefatos `baluarte-android-debug-apk` (9,2 MB) e `baluarte-android-release-aab` (7,8 MB) gerados no CI.
- 📦 **Capacitor no repo**: `capacitor.config.json` (`com.baluarte.app`, `webDir: dist`, fundo `#0e0c16`) + projeto **`android/` scaffoldado e commitado** (Gradle; o `assets/public` sincronizado e os builds ficam fora do git). Scripts `npm run mobile:sync` / `mobile:open`.
- 📷 **Permissão de câmera** no `AndroidManifest.xml` (Corpo Total/OCR, runtime via WebView) + paleta Baluarte (`colors.xml`, ícone adaptativo com fundo `#0e0c16`).
- 🖼️ **Ícones e splash** gerados do `logo.svg` em todas as densidades (launcher/round/foreground mdpi→xxxhdpi + splash port/land) — fontes de 1024/2732px em `assets/` pro iOS reusar.
- 🤖 **Workflow Mobile Release** (`.github/workflows/mobile-release.yml`): tag `mobile-v*` ou Run workflow → **APK de debug** (teste no aparelho) + **AAB de release não assinado** (pronto pra assinar → Play), anexados à release. Runner ubuntu (SDK pré-instalado), Java 21, Node 24.
- 🖥️ O que segue **local** (HANDOFF M7 atualizado): testar o APK no aparelho, assinatura de produção → Play Console, e o **iOS** (macOS/Xcode → TestFlight).

### 🧹 Núcleo Mark XIII — tela única 100% LIMPA, sem menus (#324)
- 🏆 **Regra de Ouro aplicada**: `/git-nexus` no app agora abre a **tela única** (`git-nexus-nucleo.js`) — só a **cena 3D do Mark XIII** (protagonista, tela cheia), o **painel de sinais vitais** (NÚCLEO/REDE/EVENTOS/ENERGIA/MODO IA) e o **chat do J.A.R.V.I.S.** **ZERO abas, botões ou menus** — os 14 menus do cockpit sumiram da interface.
- 🗣️ **Funções viram capacidades por comando**: "mostrar memória", "abrir conselho", "gerar código", "grafo"… → o J.A.R.V.I.S. **materializa a função inline** num painel de vidro por cima da cena (mesmos loaders sob demanda do cockpit — nada reescrito) e **"fechar"** (ou Esc) recolhe. Comandos extras: `modo <ia>` (troca o cérebro), `conectar ws://…`/`desconectar`/`simular` (ponte Fase D).
- 🤖 **Corpo Total é a única exceção visual** — e **sem botão**: só aparece se pedido no chat ("corpo total", "ativar visão"); fechar também por comando.
- 💬 **Chat = a única porta**: intents locais primeiro; o resto vai pro cérebro configurado (local/agente/hermes-agente/webllm/claude/ollama/servidor/…, o mesmo pipeline do /jarvis). Tool-calls aparecem como linhas discretas; a cena **pulsa** a cada resposta e evento ao vivo.
- 🧯 Compat: deep-links `?tab=<id>` abrem a função direto (no painel); o cockpit de abas segue acessível via **`?ui=cockpit`** (escape hatch/dev); rotas individuais (/jarvis, /memoria, …) seguem registradas.
- ✅ Verificado (Playwright, produção, app simulado): tela limpa (0 abas), "mostrar memória"→painel MEMÓRIA, "fechar"→recolhe, "corpo total"→só por comando, conversa local responde, `?ui=cockpit` e `?tab=` funcionam; 0 erros de página. CSS da tela **fora do boot** (disciplina #323).

### ⚡ v0.4.0 (mobile + perf) — Fatia 8 (FINAL): alvos de toque ≥44px + handoff do Capacitor (#323)
- 👆 **Alvos de toque ≥44px em aparelho de toque** (`components.css`, `@media (pointer: coarse)`): botões de ícone do header (eram 28px), botões pequenos e itens da sidebar agora têm área mínima de 44px pro dedo — sem mudar nada no desktop/mouse. Verificado (Playwright mobile 390×844): toggle do menu 44×44, item da sidebar 44px de altura; sem overflow horizontal em `/`, `/militar`, `/ferramentas`; `is-lowfx` ativo no celular.
- 📦 **M4 (Capacitor → loja) vira tarefa local**: passo a passo completo em `docs/HANDOFF-LOCAL.md` (**M7**) — init/add android+ios, ícones/splash, permissão de câmera, build assinado. O site já está pronto pra envelopar (PWA + SW + manifest + toque).
- 🏁 **v0.4.0 (parte remota) COMPLETA** — balanço das fatias 1–8: entrada 1×/sessão (curta no mobile) · SW cache-first · low-fx em aparelho fraco · fontes 9→3 · PWA instalável (Android/iOS, maskable + atalhos) · **CSS do boot −46%** (30,7→16,6 KB gz) · boot total ~99,4→**87,8 KB gz** · toque ≥44px. Falta só o M4 (empacotar pra loja), que depende de máquina local.

### ⚡ v0.4.0 (mobile + perf) — Fatia 7: mais 9 folhas fora do boot — CSS do boot −46% no total (#323)
- ✂️ **9 folhas com dono claro saíram do boot** (~59 KB cru): `calc` (2 páginas), `cripto` (importada no `/cripto`, cobre os 9 painéis), `graficos` (2), `simbolos` (3), `biblioteca` (9), `logic-sim` (1), `morse` (1), `fase18` (perfil+shadow) e `editor` — esta importada **nos utils do componente** (`editor-engine`/`autocomplete`/`syntax-highlight`), então qualquer página que use o editor (editor, jarvis, gerar-código, ia-proprietária) ganha a folha automaticamente com o chunk.
- 🏛️ **Ficam no boot só as folhas genuinamente compartilhadas**: `arsenal`, `elites`, `fase17`, `fase19` (57–61 páginas cada — são componentes de fato) + a fundação (reset/variables/base/…).
- 📉 **CSS do boot: ~30,7 KB → ~16,6 KB gz (−46%)** somando as fatias 5+6+7.
- ✅ Verificado (Playwright, produção): 8 rotas afetadas (`/editor`, `/cripto`, `/biblioteca`, `/calc-cientifica`, `/morse`, `/logic-sim`, `/perfil`, `/simbolos`) renderizam estilizadas com CSS sob demanda, 0 erros de página; cada folha emitida 1x (sem duplicação).

### ⚡ v0.4.0 (mobile + perf) — Fatia 6: militar.css e mais 5 folhas fora do boot (~54 KB) (#323)
- ✂️ **`militar.css` (36,5 KB cru — a MAIOR folha do boot) saiu do boot**: só as **12 páginas militares** usam suas classes (`forcas-*`, `arsx-*`, `poder-*`, `hist-*`, `tat-*`, …) — cada uma agora importa a folha e o Vite emite **um único chunk compartilhado** (29,6 KB) que baixa quando qualquer página militar abre. O hub (`/militar`) usa `centro-militar.css` próprio e não foi afetado.
- ✂️ Mais 5 folhas com dono claro saíram do boot: `terminal.css` (→ terminal + terminal-ia), `portas.css`, `jarvis-vision.css`, `jarvis-dashboard.css`, `gerar-codigo.css` (dono único cada).
- 🔬 Auditoria com **regex de fronteira de palavra** sobre as classes de cada folha (os falsos positivos eram só classes de estado genéricas `is-active`/`is-on`, escopadas dentro das folhas).
- 📉 **CSS do boot: ~30,7 KB → ~22,9 KB gz** (−25%) somando as fatias 5+6. Quem nunca abre uma página militar não baixa mais nada disso.
- ✅ Verificado (Playwright, build de produção): `/forcas-armadas`, `/poder-militar`, `/portas` e `/terminal` renderizam **estilizadas** com o CSS chegando sob demanda; 0 erros de página; nenhuma das 6 folhas no `dist/index.html`.

### ⚡ v0.4.0 (mobile + perf) — Fatia 5: 9 folhas da seção IA fora do boot (#323)
- ✂️ **CSS app-only sai do boot** (`index.html`): as **9 folhas da seção IA** (`llm-lab`, `cerebro`, `ocr`, `memoria`, `terminal-ia`, `seguranca`, `conselho`, `apis`, `aprendizado`, ~24 KB cru) eram carregadas por **todo visitante da web** via `<link>` no boot — mas só servem às abas do cockpit, que é **app-only**. Removidas do boot.
- 🧩 **Cada página importa a sua** (`import '../styles/x.css'` no módulo): o Vite faz **code-split** e o CSS entra no chunk da própria aba — só baixa **no app, quando a aba abre**. Confirmado que cada folha tem um único dono (seletor-líder não aparece em nenhuma outra página).
- ✅ Verificado (Playwright, build de produção, app simulado): as 9 folhas **somem** do `dist/index.html`, viram 9 chunks CSS separados; abrir a aba "Conselho de IAs" no cockpit **baixa** `conselho-*.css` sob demanda e `.page-conselho` renderiza estilizada. Web boot fica mais leve.

### ⚡ v0.4.0 (mobile + perf) — Fatia 4: PWA instalável no celular (Android/iOS) (#323)
- 📲 **Manifesto modernizado** (`public/manifest.json`): cores alinhadas à estética Ouro (`#0e0c16` no lugar do neon `#0a0a0a`/`#00f0ff`), ícones **hexágono dourado** (`#d4a24e`→`#e8c07a`), um ícone **`maskable` dedicado** (hexágono na safe-zone, sem corte no Android adaptativo), `id`/`categories`/`display_override` e **4 atalhos** (Núcleo, Militar, Arsenal, Modelos 3D) que aparecem no long-press do ícone.
- 🍎 **Instalável no iOS** (`index.html`): metas `apple-mobile-web-app-*` (capable, título "Baluarte", status bar translúcida), `mobile-web-app-capable` e `apple-touch-icon` — "Adicionar à Tela de Início" no Safari abre em tela cheia, sem barra.
- 🖼️ Auditoria de imagens: o site **não usa `<img>` eager** (imagens são fundo CSS ou o iframe da cena 3D, que **já é `loading="lazy"`**) — nada a cortar aqui, o peso já estava enxuto.
- ✅ Verificado (Playwright, build de produção): manifesto parseia com 3 ícones (1 maskable) + 4 atalhos, boot limpo, `three` **fora** do preload do boot.

### ⚡ v0.4.0 (mobile + perf) — Fatia 3: fontes do boot 9 → 3 (resto sob demanda) (#323)
- ✂️ **Boot carrega só 3 fontes** (`index.html`): Cormorant Garamond, Spectral, IBM Plex Mono (o tema Ouro). As outras **6** (Cinzel, Inter, JetBrains Mono, Oswald, Rajdhani, Titillium) eram só pros **skins de universo** — saíram do boot.
- 🔤 **Fontes de universo sob demanda** (`universe-theme.js`): ao aplicar um skin que usa uma dessas, a família é injetada **na hora** (1x, cacheada). Quem nunca troca de universo (a maioria) não baixa nenhuma delas.
- 🧹 5 folhas que usavam `'Inter'`/`'JetBrains Mono'` **na mão** agora usam os **tokens** (`--font-sans`/`--font-mono`) — sem fallback pro sistema e alinhado à regra "fonte via token".
- ✅ Verificado (Playwright): boot só com as 3; aplicar "doom" injeta Oswald sob demanda; build limpo.

### ⚡ v0.4.0 (mobile + perf) — Fatia 2: fluidez em aparelho fraco/mobile (#323)
- 📉 **Detecção low-end no boot** (`main.js`): aparelho fraco (`deviceMemory ≤ 2` **ou** `hardwareConcurrency ≤ 2`), **celular** (toque + tela ≤ 820px) ou `prefers-reduced-motion` → classe `is-lowfx` no `<html>` + `window.__baluarteLowFx`. **PC forte fica com tudo** (verificado: 8c/8GB = efeitos completos; celular e 2c/2GB = aliviado).
- 🪶 **Alívio dos efeitos pesados**: o **grão** global cai de opacidade 0.6 → 0.22 no low-end (menos repaint/composição); o **herói WebGL** gera **metade das partículas** (galáxia 3600→1800, astrolábio 1400→700). Menos GPU/bateria, mais fluido.
- ✅ Verificado (Playwright, specs forçadas): branch certo em PC forte / celular / PC fraco; build limpo.

### ⚡ v0.4.0 (mobile + perf) — Fatia 1: entrada 1x/sessão, SW cache-first, theme mobile (#323)
- 🚪 **Entrada só na 1ª carga da sessão** (`main.js`): recarregar/voltar **não repete** mais a cascata (perf + não irrita) — marca em `sessionStorage`. No **celular** ela é mais curta (3,8s vs 6,5s no desktop; detecta `pointer:coarse`/tela pequena).
- 🗄️ **Service Worker mais rápido** (`public/sw.js`): assets com hash do Vite (`/assets/*`) agora são **cache-first puro** (imutáveis → 2ª carga nem toca a rede); o resto segue stale-while-revalidate. Versão do cache → `v0.4.0` (limpa os antigos).
- 📱 `theme-color` atualizado pro fundo atual (`#0e0c16`) — barra do navegador no mobile combina com a estética.
- ✅ Verificado (Playwright): entrada aparece na 1ª carga, **some no reload** da mesma sessão, e aparece no mobile; build limpo. Baseline medido: boot ~99 KB gz (JS 68,7 + CSS 30,7) — alvos das próximas fatias (M2: imagens/fontes/CSS crítico, low-end). Instalador **0.3.0 publicado** (release v0.3.0). Roadmap: #323.


### 📦 Instalador 0.3.0 — motor embutido pronto pra cortar (auto-download + dep opcional)
- ⬇️ **Modelo auto-baixa no 1º uso** (`desktop/src/hermes.js`): o `.gguf` NÃO vai embutido (instalador pequeno) — baixa pra `userData/models` na 1ª vez (env `BALUARTE_HERMES_MODEL_URL`, default Nous Hermes 2 Pro Q4_K_M), com progresso em `status()`. Um `.gguf` colocado à mão tem prioridade.
- 🧱 **`node-llama-cpp` como `optionalDependency`** (no `desktop/package-lock.json`) + `asarUnpack` do módulo nativo: o **build do instalador nunca quebra** (se um SO não compilar/carregar o nativo, o app cai no WebLLM, que funciona). `npm ci` do release fica em sync.
- 🚀 Pronto pra cortar via **Desktop Release** (tag `desktop-v0.3.0` / workflow_dispatch → runners Win/Mac/Linux). ⚠️ O motor nativo pode precisar de **validação on-device** (ABI do Electron) — o app funciona igual pelo WebLLM enquanto isso.

### ☕ Núcleo de IA 10x — Fase C: agente Hermes no backend + auth por token
- 🤝 **Agente Hermes no serviço** (`HermesClient` + `JarvisService`): um `POST /api/nucleo/command` agora dispara o Hermes (assíncrono, sem travar o request/WS) e o Núcleo **transmite a resposta** como `JarvisEvent` `type=response` — o front/app recebem a fala do Núcleo. Endpoint **configurável** (`NUCLEO_HERMES_URL`, ex.: o proxy `/api/hermes` do site ou um Ollama); vazio = só ecoa o comando.
- 🔐 **Auth por token** (opt-in): se `NUCLEO_TOKEN` estiver definido, REST exige `X-Nucleo-Token` (`TokenAuthFilter`, `/health` livre) e o WebSocket exige `?token=` no handshake; vazio = aberto (dev).
- 🧪 Teste do controller (`JarvisControllerTest`: health + comando → evento + validação). `application.yml`/README com as envs e passos de **deploy** (Railway/Render/Fly/VPS → `wss://…`).
- ⚠️ Buildável/rodável com `mvn` local/CI (sem Maven no remoto). Encanamento restante no #316: persistência (banco) e o deploy em si. Não toca no build do site.

### 🗿 Núcleo de IA 10x — Fase B: cena pronta pra moldura assada no Blender (GLB)
- 🧊 **Cena "GLTF-ready"** (`nucleo-scene.js`): carrega uma moldura `.glb` **opt-in** (`GLTFLoader` lazy, no chunk `three`) e esconde os anéis procedurais quando o asset existe; **sem asset → procedural** (comportamento atual, zero 404/regressão). A metade de código da Fase B — a **assadura no Blender** é tarefa **local** (não roda no remoto): passos em `docs/HANDOFF-LOCAL.md` (**M6**) — bake normais/AO → `public/models/nucleo/frame.glb` → `nucleo:glbUrl`.
- ✅ Build limpo; `GLTFLoader` confirmado fora do bundle de boot.

### 📡 Núcleo de IA 10x — Fase D: a cena REAGE a eventos ao vivo (#316)
- 🔌 **Ponte ao vivo** (`src/utils/nucleo-socket.js`): cliente WebSocket pro backend Java (`/ws/nucleo`) — cada `JarvisEvent` (telemetria/voz/biometria do app) chega e é publicado no event bus como `nucleo:event`. **Opt-in** (só conecta se houver URL salva em `nucleo:wsUrl`), com **reconexão por backoff** — sem URL, fica quieto (não fica batendo em servidor que não existe).
- ✨ **A cena reage de verdade**: o cockpit assina `nucleo:event` e faz o **`pulse()`** da cena do jarvis-nucleo disparar (glitch), com duração por tipo (comando > biometria > telemetria). Barra **"Núcleo ao vivo"** no topo: status da conexão (bolinha), **último evento**, campo da URL do backend + **conectar** + **⚡ testar** (simula um evento pra ver a cena reagir sem o serviço no ar).
- ✅ Verificado no navegador (modo nativo simulado): a barra aparece, "⚡ testar" atualiza o último evento (`⚡ biometric · demo`) e dispara o pulso da cena; build limpo. Quando o backend Java (Fase C) subir, é só apontar a URL e o Núcleo passa a pulsar com telemetria/voz/biometria reais.

### ✨ Núcleo de IA 10x — Fase A: cena do jarvis-nucleo como backdrop vivo do cockpit (#316)
- 🌌 **Portei o `jarvis-nucleo.html`** (do operador) pra um módulo do site (`src/utils/nucleo-scene.js`): **núcleo procedural** (Simplex noise) + **anéis de dados** + **constelação neural com sinapses vivas** + poeira, com **pós-processo** (UnrealBloom + Glitch). Vira o **backdrop 3D vivo** do cockpit do Núcleo de IA — por trás das 12 abas (JARVIS, grafo, memória, ML, APIs…), com véu de legibilidade.
- 🪶 **Pesado e app-only (#238)**: Three.js e os passes são **dynamic-imported** dentro do mount → chunk próprio `three` (isolado do `vendor` eager via `vite.config`), **fora do boot do site** (verificado: `index.html` não pré-carrega o three; o site leve nunca baixa). Só o app, ao abrir o cockpit.
- 🎨 Cores **100% por token** (segue Ouro/Rubi/Esmeralda, reage a `baluarte:theme`); **"pulso de dados"** (glitch) dispara na troca de aba (gancho pra eventos reais na Fase D/backend Java). Respeita `prefers-reduced-motion`; auto-limpa ao trocar de rota/aba.
- ✅ Verificado no navegador (Playwright/WebGL headless): cena montada (canvas no backdrop), 12 abas, painéis legíveis sobre a cena; build limpo. Fase B (Blender→GLTF) segue como tarefa local no #316.
- 🧩 **Tudo de IA num lugar só**: puxei pro cockpit as 2 funções de IA que ainda ficavam fora — **Corpo Total** (`jarvis-vision`, rastreamento multi-corporal) e **Gerar Código** (`gerar-codigo`, JARVIS gera código). São **14 abas** agora, do Grafo à IA Proprietária, todas verificadas renderizando/funcionando dentro do Núcleo (troca entre abas sem erro).
- 🧭 **Navegação unificada**: as entradas de IA soltas da sidebar (`/jarvis-vision`, `/gerar-codigo`) agora, **no app**, abrem **dentro do Núcleo** na aba certa (`lazyLeve` → cockpit `?tab=vision`/`?tab=gerar`); na web seguem como página standalone. Um clique, tudo no mesmo cockpit. Verificado: app abre o cockpit na aba certa, web fica standalone.

### 🧠 Núcleo de IA 10x — backend Java (ponte mobile) + roadmap #316
- 🎯 **Plano do "Núcleo de IA 10x"** (visual do `jarvis-nucleo.html` + cockpit unificado): decidido fazer **no stack atual** (Vanilla + Three.js no app, #238) — **sem** re-plataformar pra Next.js/React (quebraria "JS puro, sem framework"). Roadmap completo na **issue #316** (Milestones/Tech Stack/tarefas por fase).
- ☕ **Backend Java (Spring Boot 3.3, Java 21)** em `backend-java/` — serviço **aparte** (fora do Vercel, no `.vercelignore`): ponte do futuro **app de celular** com o Núcleo. REST (`/api/nucleo/command|telemetry|biometric|health`) + **WebSocket** (`/ws/nucleo`) que **transmite eventos ao vivo** (`JarvisEvent`) pro front reagir. Controllers/Service/DTOs/CORS prontos; encanamento (agente, auth, deploy) nas tarefas do #316.
- 📝 Scaffold correto pra `mvn spring-boot:run` (Java 21). Não afeta o build do site.

### 🖥️ Hermes agente — motor EMBUTIDO no app (Fatia 2, scaffold) + instalador 0.3.0 (#310/#231)
- 🔌 **Bridge nativo** (`jarvis-hermes-native.js`): no app, o agente Hermes prefere o **motor embutido** (llama.cpp/GGUF, sem navegador/WebGPU) via o funil seguro `window.baluarte.invoke('hermes:generate')`; fora do app (ou sem o motor), cai no WebLLM automaticamente. Mesmo núcleo de agente.
- 🧱 **Scaffold no Electron** (`desktop/src/hermes.js` + handlers `hermes:status`/`hermes:generate` na allowlist do `ipc.js`): **lazy e guardado** — sem a dep `node-llama-cpp` ou um `.gguf`, devolve `available:false` e **não quebra o build** do instalador atual. Acende quando uma sessão local adicionar dep + modelo.
- 📦 **Baluarte Launcher → 0.3.0**; `docs/HANDOFF-LOCAL.md` ganhou o **M5** (passos locais: `npm i node-llama-cpp`, fornecer o GGUF do Nous Hermes, testar, cortar o instalador via Desktop Release). ✅ Verificado: bridge nativo (mock) prefere o motor embutido; `hermes.js` degrada sem dep; build web limpo.

### 🧠 Hermes AGENTE LOCAL — sem API, sem chave (#310/#231)
- 🎯 **O operador quer o Hermes como agente de verdade, local, sem depender da API.** As três metades já existiam soltas no site — juntei: (1) o **Nous Hermes rodando local** (WebLLM/WebGPU, sem servidor/sem chave), (2) as **ferramentas do JARVIS** (navigate, arsenal, editor, memória, skills auto-criadas…), (3) o **loop ReAct** que antes só falava com a API do Claude.
- 🧩 **Núcleo de agente independente de modelo** (`jarvis-agent-core.js`): fala o protocolo de **function-calling nativo do Nous Hermes** (`<tools>` no sistema, `<tool_call>{…}</tool_call>` do modelo, `<tool_response>` de volta). Serve QUALQUER cérebro de chat — WebLLM agora, **motor embutido do app depois** — pela mesma interface `brain({system,messages})`.
- ⬢ **Novo modo no JARVIS: "Hermes (agente local)"** (`jarvis-hermes-agent.js`): default no **Nous Hermes 2 Pro (Mistral 7B)**, afinado pra tool-use (chave de modelo própria — não herda o Llama fraco do modo Navegador). Tool-calls aparecem no chat; 1º uso baixa o modelo, depois roda offline. Zero API, zero chave.
- 🖥️ **Site + app**: no app (Chromium do Electron) roda via WebLLM já; a **Fatia 2** troca o cérebro pelo **motor embutido (llama.cpp/GGUF)** sem browser — mesmo núcleo de agente.
- ✅ Verificado: teste unitário do núcleo (emite `<tool_call>` → executa ferramenta real → recebe `<tool_response>` → resposta final); UI do modo no navegador (modelo default = Hermes 2 Pro, seletor/baixador, tool-call visível); build limpo.

### 🌠 Entrada "cascata cybertroniana" + herói ASTROLÁBIO 3D + pill de tema (#246)
- 🚪 **Entrada nova do site e do app** (mockup Fable 5 V2, `Baluarte_Fable.html`): overlay de boot com **chuva de glifos procedurais** (canvas 2D), **sigilo astrolábio girando** (SVG, 3 camadas) e wordmark que **decodifica de glifos pra BALUARTE**. Duração **6,5s** (o operador pediu mais tempo que os 3,6s do mockup) — clique/Esc pula; `prefers-reduced-motion` = saída rápida sem chuva. Cores 100% via tokens (a entrada segue o tema ativo). O app herda (Launcher carrega o site).
- 🔭 **Herói do home = astrolábio 3D nativo**: variante nova `'astrolabe'` no harness WebGL **sem dependência** (`hero-webgl.js`) — icosaedro duplo (arestas + casca wireframe), **3 anéis inclinados + grande halo**, campo de partículas, **vagalumes dourados** e 14 estilhaços tetraédricos, com giro majestoso e parallax. Nada de Three.js (~600KB poupados — web leve, #238). A cena Spline do home só entra por `?spline=URL`.
- ✦ **Herói no layout do mockup**: cantos com **colchetes ✦**, divisor `— ✦ —`, MARK XIII **itálico serifado espaçado**, CTAs **pill** (primária gradiente com brilho, "Baixar o app" outline com blur, "Núcleo de IA" ghost), HUD `NÚCLEO 3D · WEBGL · NÍVEL ÔMEGA`.
- 🎨 **Pill de tema flutuante** (canto inferior direito, global): troca rápida **Ouro/Rubi/Esmeralda** sem sair da página, sincronizada com o picker do `/perfil` (evento `baluarte:theme`); a lista completa de temas segue no perfil.
- ✅ Verificado no navegador (Playwright): entrada visível decodificando → some sozinha aos 6,5s → **skip por clique ok**; astrolábio renderizando atrás do título; pill troca pro rubi (mundo inteiro muda); smoke test + build limpos. 🛡️ Backup: branch de trabalho.

### 💎 Temas de fábula: Esmeralda & Rubi + tokenização total das folhas (#246)
- 🎭 **Dois temas novos do mockup Fable 5 V2** (objeto `THEMES` do `Baluarte Fable.dc.html`): **Esmeralda** (`#2fbf8f`, fundo verde-abissal `#0a1210`) e **Rubi** (`#c8556d`, fundo vinho `#140a0f`) — no picker do `/perfil`, ao lado do **Ouro** (padrão). Diferente dos temas de acento, eles carregam um **kit completo** (`vars` em `theme.js`): fundo, painéis, texto pergaminho e bordas — trocam o mundo, não só a cor. O tema salvo sincroniza na nuvem como antes.
- 🧱 **Tokenização em massa das folhas por página**: as 277 ocorrências de ouro **hardcoded** que a varredura anterior deixou em 64 folhas viraram tokens (`#d4a24e`→`var(--color-cyan)`, `rgba(212,162,78,α)`→`color-mix(… α%)`). Agora **todas** as páginas (arsenal, editor, militar, jogos…) seguem qualquer tema **e qualquer universo** — os raios WebGL dos heróis, chips, abas e até o syntax highlighting do editor mudam junto. Tint do fundo do `body` também tokenizado.
- ✅ Verificado no navegador (Playwright): ciclo ouro→rubi→esmeralda→ouro limpa e aplica os kits certinho (tokens conferidos no `<html>`); screenshots do `/home`, `/arsenal`, `/editor` e `/militar` em rubi/esmeralda; build limpo. Site + app (herda online). 🛡️ Backup: branch de trabalho.

## 2026-07-02

### 👑 Ouro de Fábula em TODAS as páginas — varredura total do neon + vidro de fábula (#246)
- 🧹 **Varredura em massa**: as ~460 ocorrências de neon hardcoded que os tokens não alcançavam (`#00f0ff`/`#ff00aa` e rgba/0x equivalentes) foram convertidas pro dourado (`#d4a24e`/`#e8c07a`) em **105 arquivos** — todas as ~80 folhas por-página (arsenal, biblioteca, radio, editor, jogos, cripto…), os JS (canvas/gráficos/engines/highlight do editor) e o `cerebro.json` (cores dos nós do grafo). Zero neon remanescente (`grep` = 0).
- 🫙 **Vidro de fábula global**: o componente `.card` (usado no site inteiro) ganhou o **grão de ruído dourado** por cima do gradiente — os painéis de todas as páginas ficam com a textura do mockup. CTAs do herói (`hv2-btn`) agora **serifados** (Cormorant, como no mockup).
- ✅ Verificado no navegador (Playwright, 4 páginas de amostra: arsenal/biblioteca/editor/radio): tudo no ouro — até o syntax highlighting do editor; build limpo. Site + app (herda online). 🛡️ Backup: branch de trabalho.


### 👑 Reskin "Ouro de Fábula" — estética Fable 5 V2 no site inteiro (e no app) (#246)
- 🎨 **Nova estética oficial** (do mockup `Baluarte Fable.dc.html`, branch `Redesign-Baluarte-3D`, pasta **Fable 5 V2**): fundo **violeta-escuro** (#0e0c16) + acento **DOURADO** (#d4a24e/#e8c07a) + texto **pergaminho** (#f4ecdd) + serifas (**Cormorant Garamond** títulos, **Spectral** corpo, **IBM Plex Mono** HUD) + **grão de ruído** global (assinatura tátil, `body::after`).
- 🧱 **Reskin via tokens**: `variables.css` re-tokenizado (nomes `--color-cyan`/`--color-magenta` mantidos por compatibilidade → hoje ouro/ouro-claro); o site inteiro (~80 folhas), os **heróis WebGL** (`heroSkinColors()`), a **aurora/efeitos** e os gradientes seguem automático. Neons hardcoded remanescentes (títulos holográficos, raios, botões, métricas) convertidos pro dourado em `home-v2/components/immersive/effects/base`.
- 🖥️ **Site + app**: o app (Baluarte Launcher) carrega o site → **herda o visual online na hora**; o fallback offline embutido atualiza no próximo build de release (`extraResources ../dist`).
- ✅ Verificado no navegador (Playwright, screenshots `/home` e `/militar`): título BALUARTE serifado dourado com sheen, sidebar/HUD/CTAs/métricas no ouro, painéis violeta, grão sutil; build limpo. Próximas fatias do mockup: temas **rubi/esmeralda** (como skins), cursor customizado, núcleo 3D "astrolábio" (icosaedro+anéis+vagalumes) no harness WebGL próprio, transição "virar página". `docs/DESIGN-SYSTEM.md` atualizado. 🛡️ Backup: branch de trabalho.

## 2026-06-28

### 🗃️ Centro Militar — camada de curadoria no Supabase (dado nosso sobre a Wikipédia) (#246)
- 🎯 Nova tabela **`public.mil_curation`** (aplicada via MCP no banco oficial) que sobrepõe a Wikipédia com **dado nosso** por frente: **nota do operador**, **destaque** e **ordem**. O hub aplica isso (`.is-featured` + bloco `.mil-note`) por cima do extrato da Wikipédia.
- 🔐 **RLS**: **leitura pública** (anon/authenticated SELECT — o hub é público); **escrita só por `service_role`** (dashboard/MCP), sem policy de write pra anon. Verificado por `curl`: anon **GET → 200** (lê) · anon **POST → 401** (bloqueado).
- 🧱 Novo `src/utils/mil-curation.js` (`fetchMilCuration` via `dbSelect`, best-effort — sem Supabase/offline o hub funciona igual) + CSS de destaque/nota. Semeadas as 14 frentes (ordem + 2 notas + 1 destaque de exemplo). Edição via dashboard/MCP (`update mil_curation …`). Plano: `docs/CENTRO-MILITAR.md`.
- ✅ Verificado: build limpo; overlay (destaque + nota) aplica no DOM; leitura anônima confirmada. 🛡️ Backup: branch de trabalho.

### 🎖️ Centro Militar — 13 frentes militares + Arsenal num hub só (Wikipédia ao vivo) (#246)
- 🧭 **Consolidação**: as **13 páginas militares** da sidebar (+ Arsenal) viraram **uma página estilo Wikipédia** em **`/militar` ("Centro Militar")** — índice "Conteúdo" (sticky) + **14 seções**. A **sidebar enxugou de 13 itens → 1**; as páginas individuais **seguem registradas** e acessíveis pelo hub (botão "abrir página completa →") e por URL — **nada removido**.
- 🌐 **Conteúdo vivo da Wikipédia**: cada seção puxa um **extrato da Wikipédia** sob demanda (IntersectionObserver, web leve) via `src/utils/wikipedia.js` (`fetchWikiSummary`, REST API CORS + cache memória/localStorage TTL 7d). **Best-effort**: se a Wikipédia não responder, mostra link pro artigo (zero erro). Conteúdo **CC BY-SA 4.0**, sempre **creditado e linkado**.
- 🧱 Novos `src/pages/militar.js` + `src/styles/centro-militar.css`; rota em `main.js`, título no shell, ícone (`/militar`→shield), sidebar. **Sem dependência nova, sem Cloudflare** (a API da Wikipédia já é CORS-friendly); Supabase fica pra curadoria nossa numa fatia futura. Plano em **`docs/CENTRO-MILITAR.md`**.
- ✅ Verificado no navegador (Playwright): hub renderiza (hero + índice 14 + 14 seções), sidebar militar = 1 entrada, degradação graciosa quando o fetch falha; build limpo. 🛡️ Backup: branch de trabalho.

### ⬆️ Toolchain — site e app no Node 24
- 🟢 **Node 22 → 24** em todo o projeto: `engines.node` do **site** (`package.json`: `22.x → 24.x`) e do **app** (`desktop/package.json`: novo `engines.node: 24.x`). Vercel lê o `engines` → passa a buildar/rodar a web no Node 24.
- 🤖 **CI**: `desktop-release.yml` (build dos instaladores) `node 22 → 24` e `cambio.yml` (cron do câmbio) `node 20 → 24`.
- 📌 `.nvmrc` (raiz + `desktop/`) = `24` pra fixar a versão no dev local. Build de produção limpo; JSONs válidos. *Obs.: o Electron empacota o próprio Node (preso ao major do Electron) — isto sobe o Node do **toolchain/CI**, não troca o runtime interno do Electron.*

### 🎨 Iconografia — sidebar 100% no set de linha (Design System §4 · #246)
- 🧭 **Toda a navegação lateral agora usa o set único de ícones de linha** (`src/utils/icons.js`, traço + `currentColor`). Caíam no fallback de emoji só **2** rotas — `/git-nexus` ("Núcleo de IA", o flagship da IA) com 🔗 e `/baixar` ("Baixar o App") com ⬇. Mapeei as duas em `iconByPath` e desenhei os ícones `nexus` (grafo/hub) e `download` no mesmo grid 24×24 dos demais.
- 🔻 **Rodapé da sidebar coerente também**: os glifos soltos do botão **Instalar app** (⬇), do link do **YouTube** (▶) e do **LLBR Innovations** (⬡) viraram ícones de linha (`download`/`play`/`hex`), com regra de tamanho/alinhamento em `layout.css` (some o rótulo quando recolhida).
- ✅ Verificado no navegador (Playwright): **75/75** itens da sidebar com SVG de linha, **zero** fallback de emoji, 3 ícones no rodapé; build limpo. É o passo 2 ("trocar a sidebar") do plano incremental de adoção do coolicons do Design System (§4); cards/headers ficam pra próxima fatia. 🛡️ Backup: branch de trabalho.

### ✨ react-bits → efeitos vanilla · LightRays WebGL no herói (#246)
- 🌟 **Fundo WebGL de "god-rays" (porta do LightRays)** — novo `src/utils/hero-rays.js`: fragment shader de **quad de tela cheia**, WebGL 1.0 **sem dependência** (não usa OGL), feixes de luz descendo de uma fonte no topo modulados por ruído animado, na cor do universo ativo, blending aditivo. Roda **web+app** (é dependency-free como o `hero-webgl`, então não precisou gatear pro app).
- 🔌 Ligado no `buildImmersiveHero` via `variant: 'lightrays'` (mesma API/ciclo de vida do `createHeroWebGL`: fallback 2D, reduced-motion = 1 quadro, pausa com aba oculta, auto-resize/encerra). Aplicado na **`/tecnologia-militar`** como vitrine.
- ✅ Verificado no navegador (Playwright + screenshot): o shader compila e os raios renderizam atrás do título holográfico, texto legível; build limpo. 🛡️ Backup: branch de trabalho.

### ✨ react-bits → efeitos vanilla · SoftAurora nos heróis imersivos (#246)
- 🌌 **Camada de aurora (porta do SoftAurora)** ligada no `buildImmersiveHero` → **~20 páginas flagship** ganham, de uma vez, blobs de cor (ciano/magenta/violeta) respirando à deriva atrás do conteúdo do herói, com `mix-blend: screen` pra somar luz. Herda o acento do universo via `--bx-accent/2`. Novo `.fx-aurora` em `effects.css`.
- 🪶 CSS puro, `pointer-events:none`, **reduced-motion congela**; entra em z-index 1 (atrás do conteúdo, que é z-4) e **some quando o Spline carrega** (junto de canvas/rays/grid). Verificado no navegador (Playwright + screenshot `/arsenal`): aurora compõe atrás da galáxia WebGL sem prejudicar a leitura; build limpo. 🛡️ Backup: branch de trabalho.

### ✨ react-bits → efeitos vanilla · TiltedCard nos cards das prateleiras (#246)
- 🃏 **Inclinação 3D que segue o cursor (porta do TiltedCard)** nos cards das prateleiras do `/home` (Arsenal/Universos/Crônicas, 36 cards): o cartão gira em `rotateX/rotateY` conforme a posição do cursor (+ leve `scale`) e volta ao plano no leave — tátil, estilo "prateleira Steam" (Design System §7). Novo `attachTilt(el)` em `effects.js` + `.fx-tilt` (transição suave, `preserve-3d`).
- 🛡️ Robusto: rotação **clampada** a ±amplitude (sem flip se o evento vier fora dos limites); **reduced-motion** deixa o card estático; sem dep. Verificado no navegador (Playwright): 36/36 cards com tilt, `transform` setado dentro da faixa (±11°) e limpo no leave; build limpo. 🛡️ Backup: branch de trabalho.

### ✨ react-bits → efeitos vanilla · DecryptedText global nos títulos (#246)
- 🔓 **Revelação "decifrando" (porta do DecryptedText) ligada no site inteiro**: a cada navegação, os títulos de página (`.page-header__title`, **56 páginas**) embaralham os caracteres e revelam da esquerda pra direita — cara de HUD, combina com o Baluarte. Hook único em `shell.renderPage` (junto do scroll-reveal); `effects.js` ganhou `decryptText(el)` + `decryptTitles(root)`.
- 🪶 JS puro, sem dep; `setInterval` que se encerra sozinho (sem leak); **reduced-motion** deixa o texto intacto; **a11y**: o texto real fica em `aria-label` durante o efeito e o título assenta exato. Verificado no navegador (Playwright): efeito roda e o título volta ao original sem corrupção; build limpo. 🛡️ Backup: branch de trabalho.

### ✨ react-bits → efeitos vanilla (Fatia 0 · #246)
- 🧪 **Estudo + decisão**: o [react-bits](https://github.com/DavidHDev/react-bits) é **React 19** + stack WebGL/GSAP pesada e **licença MIT + Commons Clause** (proíbe redistribuir os componentes, mesmo portados). Em vez de adotar React (quebraria *sem-framework* + *web leve* #238), a direção é **estudar e reimplementar os efeitos em vanilla** com os tokens do Baluarte, creditando o autor. Plano e mapa de portabilidade em **`docs/REACT-BITS.md`**.
- 🧱 **Camada de efeitos**: novos `src/utils/effects.js` + `src/styles/effects.css` (registrada no boot), sem dependência, com `prefers-reduced-motion`. Primeiros 2 efeitos portados: **ShinyText** (`.fx-shiny`, varredura de brilho em texto, CSS puro) e **SpotlightCard** (`attachSpotlight()` + `.fx-spotlight`, brilho radial que segue o cursor em cartões).
- 🏠 **PoC no `/home`**: `fx-shiny` no kicker do herói + spotlight nas 7 células do bento. Verificado no navegador (Playwright): efeitos ligados, CSS vars atualizando no cursor, build limpo. Os ~53 efeitos WebGL (Aurora/Galaxy/Plasma…) ficam pra trilha app/lazy gated (#238). 🛡️ Backup: branch de trabalho.

### 🎨 Iconografia — flagship `/home`: cards/headers no set de linha (Design System §4 · #246)
- 🏠 **Passo 3 (cards/headers)** começando pelo flagship: os glifos/emojis dos **CTAs do herói** (⚙/⬇/🔗 → `gear`/`download`/`nexus`), dos **eyebrows das células do bento** (◈/🔗/⬇/⌖/📖/◆/⚡ → `chart`/`nexus`/`download`/`eye`/`book`/`diamond`/`grid`), dos **tiles de acesso rápido** (agora via `iconForPath(path)`, reusando o mapa por rota) e dos **títulos de prateleira** (🔫/🌌/📖 → `crosshair`/`star`/`book`) viraram ícones de linha do set único.
- 🎯 **Emoji preservado onde é semântico** (Design System §4): os selos de SO 🪟🍎🐧 do card "Baluarte Launcher" e o `⬡` decorativo do HUD do herói ficam.
- ✅ Verificado no navegador (Playwright): 8/8 tiles, 7 eyebrows, 3 títulos de prateleira e 3 CTAs com SVG de linha, **zero** emoji residual nessas áreas; build limpo. 🛡️ Backup: branch de trabalho.

## 2026-06-24

### 🧠 Omega Prism · Fatia 1 (banco) — Segundo Cérebro + Memória por usuário (#231)
- 🗄️ Migrations **`0006_knowledge`** (`knowledge_notes`: notas com `tags`/`links`) + **`0007_memories`** (`memories`: fatos "lembre que…", estilo supermemory) — **por usuário, RLS dono-só** (`auth.uid() = user_id`), igual `profiles`. Aplicadas no Supabase oficial.
- 🔐 Verificado (REST anon): **GET → 200 `[]`** (não vaza) · **POST → 401** (RLS bloqueia) nas duas; estrutura: RLS on + **4 policies (CRUD dono)** cada.
- 🧱 É a **espinha** do Omega Prism (L1 Conhecimento + L2 Memória, do `docs/OMEGA-PRISM.md`): a base pra `/cerebro` e `/memoria` saírem do localStorage e virarem **por-usuário, cross-device**. Próximo incremento: cliente (`jarvis-brain` ganha backend Supabase) + UI.

### 🧠 Omega Prism · Fatia 1 (cliente) — Memória do JARVIS por usuário, cross-device (#231)
- ☁️ A **Memória do JARVIS** (`/memoria`) agora **sincroniza com a sua conta**: logado, os fatos "lembre que…" salvam na tabela `memories` do Supabase e **voltam em qualquer dispositivo**. Deslogado segue **100% local** (localStorage) — **zero regressão**.
- 🧩 Novo `src/core/memory-cloud.js` (CRUD por usuário, sem SDK, igual ao padrão `user-prefs`) + `jarvis-brain` ganhou `syncUserMemories()` e espelha `addMemory`/`deleteMemory`/`clearMemories` na nuvem **best-effort** (a API síncrona não muda — UI nunca trava esperando rede).
- 🔀 **Mescla as 3 origens** sem duplicar (dedup por texto): local + **conta (sua, na nuvem)** + repo (`jarvis-memory`). Botão **☁️ Conta** no `/memoria` (logado: sincroniza; deslogado: leva ao `/perfil`); ao abrir logado, puxa a conta sozinho.
- 🪶 Web leve (#238): sem deps, best-effort, degrada em silêncio. Verificado: build limpo + smoke ok; a página renderiza com o botão **☁️ Conta**. O round-trip real depende de estar logado (testável no preview/produção). 🛡️ Backup: branch de trabalho.

### 🌐 Omega Prism · Fatia 1 na web — `/memoria` e `/cerebro` acessíveis no navegador (#231)
- 🔓 **`/memoria` (Memória) e `/cerebro` (Segundo Cérebro) agora abrem na WEB** — antes caíam no teaser "Núcleo de IA roda no app". O `docs/OMEGA-PRISM.md` põe L1 Conhecimento + L2 Memória na coluna **web (leve)**, e a Fatia 1 ("100% web, verificável") **só fecha** se dá pra logar → criar memória → ver em outro dispositivo. Isto destrava o cliente da nuvem do PR anterior pra valer no navegador.
- 🧱 **Sem regressão no app**: novo `lazyLeve(tab, …)` no `main.js` — na **web** renderiza a página real (leve); no **app** (`window.baluarte.native`) segue caindo no **cockpit unificado** do Núcleo na aba certa. O pesado (grafo 3D, JARVIS, ML, Mini-LLM, `codemap-symbols`) **continua app-only** via `lazyNexus`.
- 🪶 **Boot segue leve (#238)**: o `index` quase não mudou (193,4→193,7 KB) e os chunks pesados continuam **separados/lazy**; `/memoria` e `/cerebro` puxam o `jarvis-brain` (10 KB gz) só quando abertos. Verificado no navegador (Playwright): as duas rotas renderizam a página real (header + grafo/ferramentas), **sem teaser**; build limpo. 🛡️ Backup: `backup/2026-06-24-pre-omega-fatia1`.

### 🐛 Navegação robusta — falha de carregamento não vira "404 falso" (rumo ao JARVIS)
- 🧭 **Causa:** as páginas carregam sob demanda (`import()` lazy). Se o chunk falha (deploy novo trocou os hashes, cache velho do app/PWA, ou soluço de rede), o roteador caía no `route:error` e mostrava **"Rota não encontrada"** — enganoso (a rota existe; o que falhou foi *carregar*). Foi o que apareceu em `/musicas` no app.
- 🔁 **Auto-recuperação:** quando um chunk falha e há **internet**, o app recarrega **1× sozinho** (pega `index.html` + chunks frescos) com guarda anti-loop (zera ao carregar ok). Resolve deploy novo sem o usuário fazer nada.
- 🩹 **Mensagem certa:** se não der pra recuperar (offline), mostra **"Falha ao carregar"** + botão **Recarregar** — não mais "rota não existe".
- 🧰 **Service worker:** bump `baluarte-v2.0.0` → `v2.0.1` pra invalidar caches velhos.
- 🛡️ **Por que importa pro JARVIS:** ele vai navegar/usar as ferramentas; agora uma falha de carregamento é **recuperável e clara**, não um erro mudo/404 falso. Auditoria: os **75 itens do menu batem com rotas reais** (nenhum link quebrado). Verificado: smoke ok; `loadErrorPage` renderiza "Falha ao carregar"; build limpo.

## 2026-06-23

### 🔵 Login com Google no `/perfil` + estética sincronizada por usuário (#291)
- 🔵 Botão **"Entrar com Google"** na nova seção **Conta** do `/perfil`: a pessoa conecta/cria a conta Google e fica logada (deslogado → botão; logado → nome/e-mail/avatar + "Sair").
- ☁ **Estética por usuário na nuvem**: trocar **tema** ou **skin de universo** logado salva no perfil; abrir o `/perfil` logado **aplica a estética salva** (volta em qualquer dispositivo). Inicializa o perfil com a estética atual se estiver vazio.
- 🪶 Sem SDK/deps (usa `supabase-auth.js`/`user-prefs.js`). Verificado no navegador: seção Conta + botão com o "G" colorido renderizam; build limpo. O round-trip real do Google depende do **setup do provider no painel** (passos no `docs/SUPABASE.md`).
- 🛡️ Backup: branch de trabalho.

### 👤 Contas de usuário — fundação (login Google + preferências na nuvem) (#291)
- 🔐 **Tabela `profiles` + RLS dono-só** no Supabase (migration `0005`): cada usuário logado terá a **sua estética** (tema + skin de universo), **favoritos** e nome salvos na nuvem, restaurados em qualquer dispositivo. Cada um lê/escreve **só a própria linha** (`auth.uid() = id`); trigger `handle_new_user` cria o perfil no cadastro. Aplicada e verificada (policies/trigger/RLS on; anon GET → `[]`; anon insert → **401**).
- 🧩 **Cliente de auth sem SDK** (web leve #238): `src/core/supabase-auth.js` (login **Google** via `/auth/v1/authorize`, sessão em localStorage + refresh, captura do retorno OAuth no boot tratando o hash-routing) + `src/core/user-prefs.js` (`loadProfile`/`saveProfile`). Verificado offline: o parsing do retorno OAuth decodifica o JWT e guarda a sessão (`{id,email,meta}`), limpa o hash; smoke do boot ok.
- 🛡️ Higiene: revogado o `EXECUTE` da função de trigger `handle_new_user` (igual à `0003`), pra não expor como RPC. Advisors seguem só com os by-design (`bump_visits`/`bump_view`) + o toggle de Auth.
- 📄 `docs/SUPABASE.md`: schema `profiles` + **passos do Google no painel** (parte do operador) + fluxo de auth.
- ⏭️ Próxima fatia: botão "Entrar com Google" no `/perfil` + sincronizar tema/universo/favoritos por usuário (testável ao vivo após o setup do Google). 🛡️ Backup: branch de trabalho.

## 2026-06-22

### 🗄️ Página `/banco` — Painel do Banco (Baluarte ao vivo) (#291)
- 📊 Nova rota **`/banco`** (sidebar → Sistema): painel que lê **números reais do Supabase** por leitura pública (RLS) — **visitas**, **páginas vistas** (total + distintas), **top páginas** (com barras) e **posts no mural**. Faz toda a fundação do banco aparecer no próprio site, sem abrir o dashboard.
- 🪶 Read-only, sem dependências (chunk **3.2 kB / 1.4 kB gz**, lazy). Degrada em silêncio se o banco não responder (tiles viram "—" + aviso). Ícone de linha próprio na sidebar (`database`).
- ✅ Verificado no navegador: header/tiles/seções renderizam; estado de indisponível confirmado (o browser do sandbox de teste não alcança o banco — popula em produção, igual ao contador de acessos). Build limpo.

### 📊 Métricas reais — views por página no banco (#291)
- 👁 **Contagem de views por página** gravada no Supabase (reusa `site_stats`, chaves `view:/rota`), exibida no **Home** (linha "PÁGINAS · N páginas vistas · top /rota") e numa **tile do `/perfil`** ("Páginas vistas"). Número real, global e durável.
- 🔐 **Escrita anônima SEGURA + validada**: nova função `bump_view(rota)` (`SECURITY DEFINER`) incrementa a chave da rota e **valida a rota** (`^/[a-z0-9/_-]{0,63}$`) pra não criar chave-lixo. Verificado por REST: incrementa (1→2), rota inválida → **400 "rota invalida"**, escrita direta → **401** (RLS). Migration `0004_page_views`.
- 🪶 **web leve (#238)**: o cliente (`page-views.js`) conta **1×/rota/sessão** (guard em `sessionStorage`) no `route:change`; depois só lê. ~1 KB no boot.
- 🛟 **Zero regressão**: sem Supabase/aplicação/offline, as métricas somem sem ruído (linha oculta no Home, tile some no `/perfil`). Verificado: build limpo + degradação graciosa quando o banco não responde.
- 🛡️ Backup: branch de trabalho preservada.

### 🛡️ Banco — hardening: fecha a exposição do event-trigger `rls_auto_enable` (#291)
- 🔒 **Migration `0003_db_hardening` aplicada**: revoga o `EXECUTE` (anon/authenticated/public) da função `rls_auto_enable()`. Auditando o banco, descobri que ela é um **event trigger** (`ensure_rls`, em `ddl_command_end`) que **liga RLS automaticamente em toda tabela nova** do `public` — ótimo trilho de segurança, mas que **não precisava ficar exposta como RPC** (`/rest/v1/rpc/rls_auto_enable`). Revogar **não quebra** o gatilho (event trigger roda como dono).
- ✅ **Resultado:** os **2 avisos** do advisor de segurança pra essa função **sumiram** (5→3 lints). Os 2 restantes do `bump_visits` são **by-design** (escrita anônima segura do contador) e o de "leaked password" é toggle de Auth. Verificado: `has_function_privilege('anon',…)` → `false` depois; `bump_visits` mantém o anon.
- 📄 `docs/SUPABASE.md` atualizado (migration `0003` + SQL copy-paste + explicação do event trigger + status dos advisors). Auditoria completa do schema (tabelas/policies/funções/event triggers) feita via MCP.
- 🛡️ Backup: branch de trabalho preservada.

### 🎧 Música — "Meu Acervo" offline, toca em qualquer rede (#291 §3)
- 🎵 Nova seção **Meu Acervo** no topo da `/musicas`: você **adiciona seus próprios arquivos de áudio** (arrastar ou escolher) e eles tocam **offline, em qualquer rede** — inclusive nas que bloqueiam Spotify/YouTube. Cumpre o objetivo norteador do operador ("ouvir em qualquer lugar, **independente do WiFi**"), que embed de serviço externo nunca garante.
- 🗄️ Os arquivos ficam **só no aparelho** (IndexedDB) — nada sobe pra rede, nada pesa no bundle (#238 web leve). Player nativo `<audio>` com playlist, **próxima/anterior**, **repetir lista** e **remover**; a lista e a preferência de loop persistem.
- 🆕 `src/utils/offline-audio.js` (store IndexedDB: add/list/get/remove/clear, sem dependências) + seção em `src/pages/musicas.js` + estilos no padrão dos tokens (`musicas.css`).
- ✅ Verificado no navegador: a seção renderiza após o herói (badge "offline · qualquer rede", dropzone, player, lista) e o **round-trip no IndexedDB funciona** (adicionar → listar → ler blob 4096 B → remover). Build limpo (chunk `musicas` 19.6 kB / 7.3 kB gz).
- ⏭️ Próximo da §3 (separado): proxy serverless pro **Rádio** ao vivo e cache de áudio no service worker. 🛡️ Backup: branch de trabalho preservada.

### 🗄️ Migration do contador aplicada no banco + `docs/SUPABASE.md` (#291)
- ✅ **`0002_site_stats` aplicada no projeto Supabase oficial** (via MCP): a tabela `site_stats` e a função `bump_visits()` agora **existem de fato** — então a linha **"👁 N visitas ao Baluarte"** no Home passa a mostrar número real. Antes a migration estava só versionada no repo, **não aplicada** (era o bloqueio anotado em #290/#291).
- 🔐 **Verificado ponta-a-ponta como anônimo** (REST pública): leitura do contador → **200**; `rpc/bump_visits` → **200** (incrementa); **escrita direta na tabela → 401** (RLS bloqueia). Contador **zerado** ao final (as visitas reais começam limpas).
- 📄 **`docs/SUPABASE.md`** (novo) — fonte única do backend: projeto/credenciais (públicas por design), **postura RLS**, estado das migrations, **3 jeitos de aplicar** (dashboard · MCP · CLI), o **SQL copy-paste** de `0001`/`0002`, verificação por `curl` e o passo do login OTP (#288). Atende ao pedido da **#291 §2**.
- ⚠️ **Advisor (registrado pra revisar)**: existe uma função pré-existente `public.rls_auto_enable()` (SECURITY DEFINER, executável por anon) que **não vem das migrations do repo** — origem a checar. O aviso sobre `bump_visits()` ser executável por anon é **intencional** (escrita anônima segura).
- 🛡️ Sem mudança de código de runtime (doc + changelog); a aplicação da migration é no banco. Branch de trabalho preservada como backup.

### 🗄️ Contador de acessos no banco oficial (Supabase) — primeira escrita pública
- 👁 **Contador global de acessos** gravado no Supabase, exibido na célula "Vigilância · ao vivo" do Home (`N visitas ao Baluarte`). Número **real**, global, cross-device e durável — não o localStorage por-navegador.
- 🔐 **Escrita anônima SEGURA**: o visitante não escreve na tabela (RLS sem policy de escrita). Ele só chama a função `bump_visits()` (`SECURITY DEFINER`) via RPC; a leitura do total é pública. Migration versionada em `supabase/migrations/0002_site_stats.sql`.
- 🪶 **web = leve** (#238): um RPC minúsculo **1×/sessão** (guard em `sessionStorage`); depois só lê. Cliente ganhou `dbRpc()` em `src/core/supabase.js`.
- 🛟 **Zero regressão**: se o Supabase não estiver configurado, a tabela ainda não aplicada, ou der erro (offline), a linha some sem ruído. **Requer aplicar a migration** no banco (dashboard SQL Editor ou MCP local) pra o número aparecer.

### 📦 App desktop 0.2.0 — "novo visual + Núcleo de IA" (abertura do release · #259)
- ⬆️ **Bump do Baluarte Launcher `0.1.1` → `0.2.0`** (`desktop/package.json` + lock). Abre a release que leva ao usuário do app o **redesign cinematográfico** (#195) e o **Núcleo de IA** (#231).
- 🧭 **Sidebar enxuta** (#258): a seção "IA & Jarvis" (12 entradas) virou **uma só** — `🔗 Núcleo de IA → /git-nexus`. As ferramentas (JARVIS, Conselho, APIs, Dashboard, ML, Mini-LLM, Cérebro, Memória, Terminal-IA, Segurança, IA Proprietária) abrem como **abas** no cockpit; rotas legadas redirecionam com `?tab=` (#256/#257, já no `main`).
- 🌐 **Online o app já mostra o novo design** (carrega a produção). O **fallback offline** é o `../dist`, rebuildado pelo próprio workflow de release — então sai atualizado.
- 🚀 **Publicação**: `Desktop Release` (Actions) corta instaladores Win/Mac/Linux e a release `v0.2.0`; `electron-updater` atualiza os apps `0.1.1`. A página `/baixar` lê a release em runtime (passa a mostrar v0.2.0 sozinha).
- 🛡️ Branch do release preservada como ponto de retorno: `claude/release-app-v0.2.0`.

### Banco oficial (Supabase) — Mural sai do localStorage pro banco
- 🗄️ **Primeiro dado oficial no Supabase**: o `/mural` agora lê do banco (Postgres) em vez de só localStorage. Tabela `mural_posts` com **RLS**: leitura **pública**, escrita **só do operador** (travada pelo e-mail no JWT — mesmo que alguém se cadastre, não posta).
- 🪶 **web = leve (#238)**: sem SDK — cliente próprio (`src/core/supabase.js`) fala direto com a REST/Auth por `fetch` (peso ~zero). Config por env (`VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`) com fallback no projeto oficial; a *publishable key* é pública por design (o RLS protege).
- 🔁 **Zero regressão**: sem Supabase configurado, o mural cai no modo local (localStorage + commit no repo) de antes.
- ✅ Verificado contra o banco real: leitura anônima → 200; **escrita anônima → 401 (RLS bloqueia)**; a página lista o post semente e mostra o cadeado "publicação restrita ao operador". Migration versionada em `supabase/migrations/0001_mural_posts.sql`. Build limpo.
- ⏭️ **Próximo passo**: login do dono (magic-link/OTP) pra publicar pelo site — exige 1 ajuste no painel do Supabase (documentado no PR).
- 🛡️ Backup: `backup/2026-06-22-pre-merge-supabase-mural`.

### Fix — scroll volta ao topo ao trocar de página
- 🐛 Navegar entre páginas **mantinha o scroll onde estava** (você caía no meio da página nova). Causa: o reset usava `mainInner.scrollTop = 0`, mas o scroller real é a **janela** (o `<body>`), então era no-op.
- ✅ Agora um `scrollToTop()` zera window/`<html>`/`<body>`/`.main__inner` e **repete no próximo frame** (cobre o reflow quando o chunk lazy da página monta). Verificado: 4/4 navegações voltam ao topo; sem erros de console.
- 🛡️ Backup: `backup/2026-06-22-pre-merge-scroll-to-top`.

### Redesign #246 — barra de progresso de leitura
- 📊 Uma barra fina no topo **enche conforme a página rola**, tingida pelo **acento do universo ativo** (coesa com #281/#282/#284). Some (opacity 0) em páginas que não rolam.
- 🪶 Leve: **1** listener de `scroll` no window (rAF-throttled) + `MutationObserver(childList)` pra re-medir quando a página troca; o `scaleX(var(--sp))` acompanha o scroll 1:1 (sem transição no transform). Folha própria (`scroll-progress.css`) ligada no `index.html`; montada 1x pelo shell.
- ✅ Verificado: enche com o scroll (`--sp` acompanha `window.scrollY`), recolore no DOOM (vermelho/laranja), sem erros de console. Build limpo.
- 🛡️ Backup: `backup/2026-06-22-pre-merge-scroll-progress`.

## 2026-06-21

### Redesign #246 — spotlight nos cards (segue o cursor)
- ✨ Os cards compartilhados (`.card`) ganham um **brilho radial que segue o cursor** no hover, tingido pelo **acento do universo ativo** (coeso com #281/#282). Complementa o lift+glow do hover e o tilt 3D das ferramentas.
- 🪶 Leve por construção: **UM** listener delegado no root (não por card), throttled por `requestAnimationFrame`, que só escreve `--mx`/`--my` quando o cursor está sobre um card; o visual mora no CSS (`.card::after`, `mix-blend-mode: screen`). Variante `.card--magenta` usa o acento secundário. Respeita `prefers-reduced-motion` (nem monta).
- ✅ Verificado em `/portas` (20 cards): o glow segue o cursor, texto 100% legível, só o card sob o cursor acende, sem erros de console. Build limpo.
- 🛡️ Backup: `backup/2026-06-21-pre-merge-card-spotlight`.

### Redesign #246 — herói WebGL reativo ao universo
- 🎨 Os acentos do **herói 3D** (campo de partículas + core + anéis) agora **seguem a skin de universo** por padrão — novo `heroSkinColors()` lê `--color-cyan`/`--color-magenta`, igual à atmosfera global (#281). Trocar de universo recolore os heróis **junto** com o fundo → coesão total (DOOM = vermelho/laranja, etc.).
- Páginas que passam `accent`/`accent2` explícitos (biblioteca, jogos, git-nexus-gate) **mantêm** a cor própria. `home`/`perfil` deixaram de fixar cyan/magenta e agora seguem a skin (com fallback Baluarte).
- ✅ Verificado: default inalterado (cyan/magenta); DOOM recolore o herói (`--color-cyan` → `#e01510`); sem erros de console em home/perfil/universo. Build limpo.
- 🛡️ Backup: `backup/2026-06-21-pre-merge-hero-universe`.

### Redesign #246 — atmosfera global reativa ao universo
- 🎨 O fundo imersivo global (auroras + raios + grid HUD, em toda página) agora **segue a skin de universo ativa**: as cores saem de `--color-cyan`/`--color-magenta` (definidas pelo `universe-theme.js`) via `color-mix`, então **trocar de universo recolore a atmosfera inteira** — DOOM vira vermelho/laranja, Halo azul/verde, Cyberpunk magenta/ciano… Antes eram cores fixas (cyan/magenta).
- 🛡️ Fallbacks reproduzem o visual padrão (Baluarte `#00f0ff`/`#ff00aa`) onde a var não existir; `color-mix` já é usado no projeto (suporte ok). Verificado: default inalterado (`#00f0ff`), DOOM recolore (`#e01510`). `prefers-reduced-motion` já congela as animações da atmosfera.
- 🛡️ Backup: `backup/2026-06-21-pre-merge-atmosphere-universe`.

### Redesign #246 — transição de entrada de página (route transition)
- 🎞️ Toda navegação agora faz a tela nova **deslizar pro lugar** (leve subida + escala, 480ms) — polish global que dá continuidade entre rotas. Disparo automático (o router cria um elemento novo por rota) no ponto único `renderPage` (`src/layout/shell.js`).
- 🛡️ **Só `transform` (sem `opacity`)** de propósito: em páginas pesadas (carregar o chunk + montar o herói WebGL) a thread principal trava por um instante e atrasaria o início da animação; animando `opacity` a partir de 0, a tela ficaria **em branco** até liberar. Com só transform a página fica **sempre 100% visível** (no pior caso aparece 18px abaixo e desliza). Respeita `prefers-reduced-motion`.
- ✅ Verificado no navegador: `opacity` = 1 durante toda a navegação (home→universo/poder-militar/regex), `transform` assenta na identidade, conteúdo intacto, sem erros de console.
- 🛡️ Backup: `backup/2026-06-21-pre-merge-route-transition`.

### JARVIS ↔ Nexus #231 — skills de NÍVEL DE FUNÇÃO
- 🧠 **5 novas skills** do JARVIS sobre o **grafo de chamadas** (`codemap-symbols.json`: 1137 funções / 2457 chamadas), além das 5 por arquivo:
  - `nexus_fn_impact` — o que quebra se mudar a função X (chamadores diretos + transitivos) + nível de risco;
  - `nexus_fn_context` — quem chama X e o que X chama;
  - `nexus_fn_path` — cadeia de chamadas A → … → B;
  - `nexus_fn_deps` — o que X chama (transitivo);
  - `nexus_fn_hot` — funções mais chamadas (hotspots), no projeto ou por arquivo.
- ♻️ Reusa o **mesmo motor** (`buildGraph`/`nexusImpact`/`nexusContext`/`nexusPath`) — a forma de nó/aresta dos símbolos é igual à do codemap. Resolver de função aceita `nome`, `arquivo::nome` ou trecho; em nome ambíguo escolhe a mais chamada e avisa.
- 📦 **App-only**: o `codemap-symbols.json` (461 KB) fica em chunk dinâmico (cockpit/JARVIS), **fora do boot da web**. Build limpo; lógica validada (`h()` = 364 afetadas/CRÍTICO; `boot → … → h` em 2 saltos; hotspots batem com `topCalled`).
- 🛡️ Backup: `backup/2026-06-21-pre-merge-fn-skills`.

### Mega-plano #238 · Fase 2 — CSS split (boot mais leve) + verificação do gate
- ✂️ **CSS code-split por rota**: o boot carregava **TODAS** as ~83 folhas via `<link>` no `index.html` (1 bundle de **398 KB / 55 KB gz** em toda página). Agora o boot só traz a **fundação + shell + componentes + folhas realmente compartilhadas**; cada folha específica de página é importada pelo **próprio módulo da página** (`import '../styles/x.css'`) e o Vite faz o split — ela sai do caminho inicial e só baixa quando a rota abre.
  - **Boot CSS: 398 KB → 194 KB raw · 55 KB → 29.5 KB gz (−46%)**, em *toda* navegação. 42 folhas movidas pra 42 chunks por rota.
  - Folhas **multi-página** (militar, cripto, calc, fase17–19, arsenal, elites, biblioteca, logic-sim, portas, morse, editor, terminal, gráficos, símbolos…) ficaram **globais** de propósito (mover quebraria páginas que dependem delas).
  - 🗑️ Removida `home3d.css` (órfã — nenhum módulo referenciava `.page-home3d`/`.h3-*`).
  - ✅ Conferido no navegador sem regressão: home, ferramentas, regex, git-nexus (teaser), calculadoras, jogos e o controle poder-militar (militar.css global) — todos estilizados.
- 🔒 **Gate do Núcleo de IA verificado** (já estava no código): a rota `/git-nexus` passa pelo gate leve; o chunk pesado (`git-nexus` **438 KB / ~49 KB gz**) **não** é referenciado pelo entry do boot e só baixa no app. O `syncRepoMemories` do boot está gateado por `isNative()`. Fase 2 do #238 fechada.
- 🛡️ Backup: `backup/2026-06-21-pre-merge-css-split`.

## 2026-06-20

### Redesign #246 — onda de energia (pulso) no herói WebGL
- 💓 **Pulso de energia**: um anel de brilho sai do núcleo pra fora (~3.4s/pulso), realçando as partículas/anéis por onde passa — feito no vertex shader (uniform `uWave` + `smoothstep` no raio), com leve aumento de tamanho do ponto no anel. Dá um "batimento" vivo à cena.
- 🌐 Vale pra **todas** as 5 variantes (galaxy/planet/reactor/helix/scope) sem custo extra (1 uniform por frame). `prefers-reduced-motion` congela num quadro.
- ✅ Build limpo; conferido no navegador (universo, sem erros de console).
- 🛡️ Backup: `backup/2026-06-20-pre-merge-hero-pulse`.

### Redesign #246 — efeitos: "power-on" no herói + parallax mais vivo
- ⚡ **Animação de entrada ("power-on")**: todo herói WebGL agora **liga** ao montar — ~900ms de zoom-in (a câmera afasta e mergulha) + fade-in de brilho (novo uniform `uIntensity` no shader, ease cúbico). Dá um arranque cinematográfico em cada troca de página. `prefers-reduced-motion` entra direto no estado final.
- 🖱️ **Parallax do ponteiro mais forte** (faixa ampliada) + **deriva sutil** (sin/cos lento) pra cena respirar sozinha mesmo sem mouse.
- 🌐 Vale pra **todas** as cenas (galaxy/planet/reactor/helix/scope), em todos os flagships, de graça.
- ✅ Build limpo; estado final conferido no navegador (home Spline + universo planet em brilho cheio após o intro).
- 🛡️ Backup: `backup/2026-06-20-pre-merge-hero-fx`.

### Redesign #246 — novas variantes 3D (helix / scope) + espalhadas pelos flagships
- 🧬 **`hero-webgl.js` +2 variantes**: **`helix`** (dupla hélice/DNA com degraus, girando) e **`scope`** (anéis concêntricos + graduação + mira, varrendo no próprio plano via `rotZ`). Junto com galaxy/planet/reactor, são **5 tipos** de cena nativa.
- 🗂️ **Distribuídas pra dar variedade**: `/biblioteca` → **helix** (fios narrativos), `/arsenal` → **scope** (mira/alvo), `/ferramentas` → **reactor**. `/universo` planet e Núcleo de IA reactor seguem.
- 🪪 **`/perfil`**: ganhou fundo 3D **scope** (canvas WebGL atrás do dossiê, `pf-hero__canvas`, opacity 0.8) com fallback 2D e auto-limpeza — sem perder o card de identidade.
- ✅ Build limpo; helix/scope/reactor conferidos no navegador (biblioteca, arsenal, ferramentas, perfil).
- 🛡️ Backup: `backup/2026-06-20-pre-merge-variants-2`.

### Redesign #246 — variantes de herói WebGL nativas (planet / reactor)
- 🪐 **`hero-webgl.js` ganhou `variant`**: além do `galaxy` (padrão), agora tem **`planet`** (globo holográfico com meridianos/paralelos + anel orbital + campo de estrelas — ref. "Orbital View of Arrakis") e **`reactor`** (anéis concêntricos + cruzados + núcleo pulsante — ref. "circuit loop / Eternal ARC"). Mesmo renderer (point-sprites aditivos), geometria por `buildGeometry(variant)`.
- 🌍 **`/universo`** → herói `planet` (globo girando + anel orbital, eixo Y).
- 🔗 **Núcleo de IA** (`/git-nexus` gate) → herói `reactor` (reator de anéis), substituindo o header simples. Continua leve (só o herói WebGL, ~nada perto do grafo pesado app-only).
- 🔌 `buildImmersiveHero({ variant })` repassa pro engine; `galaxy` segue idêntico (home/perfil/arsenal/etc. inalterados).
- ✅ Build limpo; planet e reactor conferidos no navegador (headless ANGLE).
- 🛡️ Backup: `backup/2026-06-20-pre-merge-hero-variants`.

### Spline 3D #246 — cena REAL na home (embed público my.spline.design)
- 🌀 **Home com cena Spline de verdade**: "Retrofuturistic circuit loop" (#262) entra como fundo do herói — emblema/circuito neon atrás do wordmark holográfico BALUARTE. Escolha do operador (a única das 3 cenas free que serve de fundo; "Boxes Hover" e "Connecting Card" são designs fechados, descartadas).
- 🧩 **`spline-embed.js` agora aceita embed público** (`my.spline.design/<slug>/`) via `<iframe>` decorativo (`pointer-events:none`, lazy, revela no load ou em ≤3,5s), além do `<spline-viewer>` (`.splinecode`). Resolve o caso real: exportar `.splinecode` é pago; o **Share/Public** é free (com selo "Built with Spline"). `sceneFor` passou a aceitar `my.spline.design`.
- 🛟 Fallback intacto: sem cena / `prefers-reduced-motion` / falha → fica o herói WebGL (galáxia + raios). `#/home?spline=<url my.spline.design>` testa qualquer cena na hora.
- ⚖️ Exceção consciente ao "web leve" (#238): o operador quis a cena 3D na home web; é lazy + fallback. Verificado no navegador (headless ANGLE) — cena pinta, has-spline ativa.
- 🛡️ Backup: `backup/2026-06-20-pre-merge-home-spline-real`.

### Redesign #246 — heróis imersivos em 17 páginas de conteúdo (militar + mídia)
- 🪖 **11 páginas militares** trocaram o `.page-hero`/header simples pelo **herói imersivo** (`buildImmersiveHero`): forças armadas, forças especiais, poder militar, tecnologia militar, organização militar, orçamentos militares, história militar, guerras & conflitos, batalhas históricas, táticas & estratégias, armas por país. Tabelas/timelines/grids seguem **intactos** abaixo; contadores dinâmicos preservados.
- 🎬 **6 páginas de mídia** idem: cinema (filmes), central de música, TV, central de vídeos, rádio, media hub. Descrições com spans/contadores dinâmicos preservadas (desc como array de nós).
- 🎛️ Cada herói tem título holográfico + galáxia WebGL + raios + grid HUD + kicker/HUD textual; auto-limpa ao trocar de rota; respeita `prefers-reduced-motion`. Sem CTAs nas militares (páginas de dado) pra manter o import enxuto.
- ✅ Build limpo; conferido no navegador (forças armadas, tecnologia militar, cinema, rádio) — heróis + conteúdo OK, sem erros de console (só um cert externo).
- 🛡️ Backup: `backup/2026-06-20-pre-merge-content-heroes`.

### Redesign #246 — heróis imersivos em /arsenal e /ferramentas
- ⌖ **`/arsenal`** (flagship #246 nº3) e ⚙ **`/ferramentas`** (hub) ganharam o **herói imersivo** (`buildImmersiveHero`): galáxia WebGL + raios + grid HUD + título holográfico + CTAs cruzadas. Tabs/filtros/catálogo (251 itens) e o grid de ferramentas seguem **intactos** logo abaixo.
- ✅ Com isso, os **4 flagships do #246** (home, perfil, arsenal, biblioteca) + universo, elites, sobre, dossie estão no nível imersivo; toda página tem a atmosfera global.
- 🚫 `/git-nexus` (gate) mantido **leve** de propósito (#238: web leve) — já tem orbe próprio + atmosfera global; não puxa o herói WebGL.
- ✅ Build limpo; heróis conferidos no navegador (`/arsenal`, `/ferramentas`).
- 🛡️ Backup: `backup/2026-06-20-pre-merge-flagship-heroes-3`.

### Redesign #246 — heróis imersivos em /elites, /sobre e /dossie
- ◆ **`/elites`**, ◇ **`/sobre`** e ▣ **`/dossie`** trocaram o header padrão pelo **herói imersivo** (`buildImmersiveHero`): galáxia WebGL + raios + grid HUD + título holográfico + kicker + CTAs (cruzando pra Arsenal/Dossiê/Roadmap/Núcleo/Universos). Contadores dinâmicos (equipes operacionais) e todo o conteúdo seguem intactos abaixo.
- 🎛️ Slots Spline reaproveitados (`elites`, `sobre`) — testáveis via `?spline=`.
- 🚫 `/baixar` mantido com o herói próprio (anel/“core” + detecção de SO) — a atmosfera global já o cobre.
- ✅ Build limpo; heróis conferidos no navegador (`/elites`, `/sobre`, `/dossie`).
- 🛡️ Backup: `backup/2026-06-20-pre-merge-flagship-heroes-2`.

### Redesign #246 — kit de herói imersivo reusável + flagships /universo e /biblioteca
- 🦾 **`src/utils/immersive.js` + `immersive.css` (novos)**: `buildImmersiveHero({...})` generaliza o herói "Command Deck" da home pra qualquer flagship em **uma chamada** — herói WebGL (galáxia + arc-reactor, com fallback 2D) + raios + grid HUD + título holográfico + kicker + descrição + CTAs + **slot Spline** opcional. Parametrizável por `--bx-accent`. **Auto-limpa** ao sair do DOM (MutationObserver destrói WebGL/Spline) — a página não gerencia ciclo de vida. Respeita `prefers-reduced-motion`.
- 🌌 **`/universo`**: header antigo → **herói imersivo** (galáxia, "Hub de Universos / MULTIVERSO BALUARTE", HUD, CTAs p/ Crônicas e Elites). Cards de universo seguem abaixo, intactos.
- 📖 **`/biblioteca`**: header antigo → **herói imersivo** (acento violeta, "Crônicas da Baluarte / ONDE OS DEUSES SANGRAM", contador de capítulos dinâmico preservado, CTA p/ Universos).
- 🎛️ Slots Spline novos em `spline-scenes.js` (`biblioteca`, `elites`, `sobre`) — testáveis via `?spline=`.
- ✅ Build limpo; heróis conferidos no navegador (`/universo`, `/biblioteca`).
- 🛡️ Backup: `backup/2026-06-20-pre-merge-flagship-heroes`.

### Redesign #246 — camada imersiva GLOBAL (atmosfera + header HUD em todo o site)
- 🌌 **Atmosfera global** (`src/utils/atmosphere.js` + `src/styles/atmosphere.css`): uma única camada de fundo, montada 1x pelo shell, **atrás de todo o app** — auroras volumétricas que respiram + raios de luz (conic `@property`) + grid HUD à deriva + vinheta de foco. Leva o "nível Spline" (refs do #262) pra **todas as páginas de uma vez**. Decisão do operador: as 25 cenas Spline são **referência** (alvo visual), recriadas **nativamente** — sem peso (só CSS, `pointer-events:none`, `z-index:-1`, reduced-motion ok).
- 🎛️ **Header de página vira painel HUD** (`.page-header` em `components.css`): barra de acento luminosa à esquerda (`::before`) + linha de varredura animada embaixo (`::after`). Sem caixa de fundo (nunca briga com heróis próprios) → as **~68 páginas** com `.page-header` viram "painel de comando" **sem editar página**.
- 📐 **Design System atualizado** (`docs/DESIGN-SYSTEM.md`): documenta a atmosfera global, o header HUD e um **mapa "cena Spline (#262) → efeito nativo"** (raios, holográfico, herói WebGL, bento, moldura HUD…). Contrato do redesign profundo.
- ✅ Build limpo; verificado no navegador em `/home`, `/arsenal`, `/ferramentas`, `/regex`, `/biblioteca` (atmosfera + header consistentes, conteúdo legível).
- 🛡️ Backup: `backup/2026-06-20-pre-merge-global-immersive`.

### Redesign #246 — raios volumétricos no herói da home (nível Spline, nativo)
- 🌠 **Camada de raios volumétricos** no herói da `/home` (`.hv2-hero__rays`): leques de luz (ciano→violeta→magenta) varrendo do topo, animados com `@property --hv2-ray` (conic suave), mascarados pra somar com a galáxia WebGL sem competir com o título. Ref. "Futuristic Rays Background" (#262).
- ⚖️ **Só CSS + 1 nó no DOM** (sem peso de runtime, sem dep): aproxima o "nível Spline" pedido pelo operador mesmo **sem** cena `.splinecode`. Some junto com canvas/grid/scanline quando uma cena Spline carrega; respeita `prefers-reduced-motion` (raios estáticos).
- ✅ Build limpo; herói verificado no navegador.
- 🛡️ Backup: `backup/2026-06-20-pre-merge-hero-rays`.

### Spline 3D #246/#207 — integração pronta (cenas reais no nível pedido)
- 🌌 **`src/utils/spline-embed.js` (novo)**: embute cenas 3D do **Spline** via o web component `<spline-viewer>` (CDN), **lazy** (IntersectionObserver), com **fallback seguro** (sem URL / falha / `prefers-reduced-motion` → fica o herói WebGL atual) e **timeout** de 14s.
- 🎛️ **`src/data/spline-scenes.js` (novo)**: slot de cena por página (`home/perfil/gitNexus/universo/arsenal/baixar`) — basta colar a URL `.splinecode`. Também aceita teste na hora via `#/home?spline=<url do spline.design>` (restrito ao domínio do Spline).
- 🏠 **Home** ligada: se houver cena, ela entra **por cima** do herói (no load some o canvas/grid); sem cena, nada muda (fallback). Config vazia por padrão → produção intacta.
- ⚖️ Aceite consciente do peso (decisão do operador no #246): o runtime do Spline é pesado; por isso é lazy + fallback. As páginas das cenas escolhidas estão no estudo #262.
- 🛡️ Backup: `backup/2026-06-20-pre-merge-spline-embed`.

### Redesign #246 — /perfil no estilo "Command Deck" (rollout flagship 1)
- 🪪 **A `/perfil` (Dossiê do Operador) ganhou a linguagem da nova home**: hero com **HUD** (grid + scanline + colchetes luminosos nos cantos), **nome holográfico animado**, e os **stats em bento** (barra de acento no topo + glow/lift). Só visual — toda a função (config, temas, skins de universo) intacta.
- ✅ Build limpo; verificado no navegador (full-page). Primeiro flagship do rollout profundo do redesign.
- 🛡️ Backup: `backup/2026-06-20-pre-merge-perfil-hud`.

### Redesign #246 — título holográfico animado em todas as páginas
- ✨ **A assinatura da nova home se espalhou pro site**: o `.page-header__title` global (em `components.css`) virou um **degradê holográfico animado** (ciano→roxo→magenta, shimmer lento) — então **todas** as páginas com header padrão ganham o mesmo título da home. Respeita `prefers-reduced-motion` (anima só pra quem permite).
- 🧹 Removidos os overrides de título estático (biblioteca, universo, academia e o bloco das 12 páginas militares) → herdam o holográfico global, ficando uniforme.
- ✅ Build limpo; verificado no navegador.
- 🛡️ Backup: `backup/2026-06-20-pre-merge-holo-titles`.

### Home nova "Command Deck" #246/#195 — promovida a oficial
- 🚀 **A `/home` foi repaginada do zero** (aprovada pelo operador): hero com **título holográfico** animado sobre fundo **HUD** (grid em movimento + scanline + colchetes nos cantos) + **grid bento** (métricas count-up, Núcleo de IA com orbe, baixar app, vigilância ao vivo, crônica/equipe em destaque, acesso rápido) + **prateleiras** com scroll-snap.
- 🪶 Leve: CSS/canvas + herói WebGL reusado (cai no campo 2D sem WebGL), JS puro; respeita `prefers-reduced-motion`. `src/pages/home.js` reescrito + `src/styles/home-v2.css`.
- 🧹 Removido o scaffolding de preview (`home-v2.js`); `/home-3d` e `/home2` viram alias da home oficial. O `home3d.css` antigo fica órfão (limpeza futura).
- ✅ Verificado (Playwright + build): `/home` com título holográfico, 7 células bento e 3 prateleiras. É a 1ª página da nova linguagem que vai se espalhar pras demais.
- 🛡️ Backup: `backup/2026-06-20-pre-merge-home-command-deck`.

### Design System #246/#195 — contrato visual (diretrizes "design first")
- 📐 **`docs/DESIGN-SYSTEM.md` (novo)**: o contrato visual do Baluarte — tokens (de `variables.css`), componentes/padrões já firmados (título neon, cards glow/lift, moldura HUD, tabs, chips, timelines), e **diretrizes** pra iconografia (adotar **coolicons**, MIT), data-viz/charts, imagens (moodboard Pinterest) e o redesign profundo dos flagships (`/home`, `/perfil`, `/arsenal`, `/biblioteca`). Base pra "fechar o design antes de seguir com as funções".
- 🔗 `CLAUDE.md` aponta pro doc (continuidade — todo design novo sai dele).
- ℹ️ Os 3 Figma do #246 são *community files* e o Figma MCP exige acesso de edição; pra extrair direto, o operador precisa duplicar/compartilhar como editor. O doc define a direção a partir dos tokens reais + recursos open-source enquanto isso.
- 🛡️ Backup: `backup/2026-06-20-pre-merge-design-system`.

### Núcleo de IA #231 — Etapa 3: aba linkável + lembra a última aba
- 🔗 **Trocar de aba no cockpit sincroniza a URL** (`#/git-nexus?tab=<id>`) via `history.replaceState` — sem disparar navegação/re-render. A aba fica **linkável** e **sobrevive ao reload**.
- 💾 **Lembra a última aba**: reabrir o Núcleo de IA (pela sidebar, sem `?tab=`) restaura a última aba usada (`storage` em `nexus:lastTab`); prioridade = rota legada/deep-link > última aba > Grafo.
- ✅ Verificado (Playwright, app): trocar p/ "Segundo Cérebro" → URL `?tab=cerebro`; reabrir `/git-nexus` → volta na aba Cérebro. Build limpo.
- 🛡️ Backup: `backup/2026-06-20-pre-merge-nucleo-ia-e3`.

### Núcleo de IA #231/#238 — Etapa 2: navegação unificada (IA app-only)
- 🧭 **A seção IA & JARVIS foi unificada no Núcleo de IA.** A sidebar agora tem **uma entrada só** ("🔗 Núcleo de IA" → `/git-nexus`); as 11 ferramentas abrem como **abas** dentro do cockpit.
- 🔀 **Rotas legadas redirecionam pro cockpit na aba certa**: `/jarvis`, `/conselho`, `/apis`, `/jarvis-dashboard`, `/aprendizado`, `/llm-lab`, `/cerebro`, `/memoria`, `/terminal-ia`, `/seguranca`, `/ia-proprietaria` → caem no Núcleo de IA na aba correspondente (bookmarks antigos seguem funcionando). **Deep-link** também via `#/git-nexus?tab=<id>`.
- 📱 **IA é app-only** (alinhado ao #238): no app abre o cockpit; na **web** essas rotas mostram o teaser "baixe o app" (o teaser foi reescrito pra refletir o Núcleo de IA — grafo + JARVIS + memória + cérebro + ML + Mini-LLM).
- ✅ Verificado (Playwright): web `/memoria` → teaser "O Núcleo de IA roda no app", sidebar sem `/jarvis` e com "Núcleo de IA"; app `/jarvis` → cockpit na aba JARVIS, deep-link `?tab=memoria` → aba Memória. Build limpo.
- 🛡️ Backup: `backup/2026-06-20-pre-merge-nucleo-ia-nav`.

### Núcleo de IA #231/#238 — Etapa 1: cockpit com abas (fusão da seção IA)
- 🧩 **O Git Nexus virou o "Núcleo de IA"**: dentro do app, agora é um **cockpit com barra de abas** (`src/pages/git-nexus-cockpit.js`). Aba **Grafo de Código** = a experiência completa atual; + 11 abas das ferramentas IA (**J.A.R.V.I.S., Conselho de IAs, Central de APIs, Dashboard, ML da Memória, Mini-LLM, Segundo Cérebro, Memória, Terminal-IA, Segurança, IA Proprietária**), cada uma **carregada sob demanda** (dynamic import) e montada reusando o render que já existe — **sem reescrever nenhuma feature**.
- 🚪 O gate (`git-nexus-gate.js`) no app passou a carregar o cockpit (na web segue o teaser; cockpit é app-only, alinhado ao #238). Etapa **aditiva**: as rotas individuais (`/jarvis`, `/memoria`, …) seguem funcionando — a unificação de navegação/rotas vem nas próximas etapas (incremental, 1 PR por etapa).
- ✅ Verificado no app (Playwright + `window.baluarte.native`): 12 abas; Grafo carrega por padrão; abas Memória e JARVIS carregam sob demanda. Build de produção limpo (cockpit é chunk leve; cada ferramenta só baixa ao abrir a aba).
- 🛡️ Backup: `backup/2026-06-20-pre-merge-nucleo-ia-cockpit`.

### Redesign #195 — Onda Ferramentas (devtools) + título neon global
- 🎛️ **Fecha o redesign do site**: a regra base `.page-header__title` (em `components.css`) virou o **título neon ciano→magenta com glow** padrão — então **todas** as ~18 páginas de ferramentas (`/editor`, `/terminal`, `/calc-cientifica`, `/calc-numerica`, `/calculadoras`, `/tabela-verdade`, `/cripto`, `/esteganografia`, `/graficos`, `/simbolos`, `/color-studio`, `/regex`, `/json-studio`, `/qr-studio`, `/git-helper`, `/logic-sim`, `/portas`, `/morse`) e qualquer página sem regra própria ganharam o título do redesign de uma vez. Páginas com regra escopada (especificidade maior) seguem mandando na sua.
- ✨ **Glow/lift nos cards/painéis/tiles dos devtools** (escopado por classe única): `.calc-tile`, `.conv-cat`, `.symbol-tile`, `.cs-card`/`.cs-swatch`, `.cripto-tile`, `.porta-card`, `.regex-input-card`/`.regex-match-card`, `.qr-read__panel`, `.logic-card`/`.logic-input-card`, `.steg-panel`, `.morse-panel`, `.kmap__cell`. Título do `/regex` (que usa `.sec-title`) também em degradê. Só visual — nada de layout/estrutura/JS.
- ✅ Verificado no navegador (Playwright + Vite): `/calculadoras`, `/simbolos`, `/color-studio`, `/regex`, `/editor`. Build de produção limpo.
- 🛡️ Backup: `backup/2026-06-20-pre-merge-redesign-devtools`.

## 2026-06-19

### Redesign #195 — Onda Referência + Economia + Hubs (/tabela-periodica, /modpack, /guia-pc, /economia, /dolar, /ferramentas, /utilidades)
- 🧪 **7 páginas de referência/economia/hubs ganharam o polish cinematográfico** — só visual (glow/profundidade/degradê), nada de layout/estrutura/JS.
- ✨ títulos em degradê neon nas 7; **`/tabela-periodica`** com células brilhando no hover; **`/modpack`** com cards em lift+glow; **`/guia-pc`** com presets em glow e aba ativa; **`/economia`** com cards de cotação em lift+glow, valor com brilho e seções em degradê; **`/dolar`** com moedas em glow e valores brilhando; **`/ferramentas`** com título neon (`.fh-title`) e cards com glow ciano somado; **`/utilidades`** com cards em lift+glow e stats brilhando.
- ✅ Verificado no navegador (Playwright + Vite). Build de produção limpo.
- 🛡️ Backup: `backup/2026-06-19-pre-merge-redesign-ref-hubs`.

### Redesign #195 — Onda Catálogo & Lazer (/ciberseg, /robotica, /filmes, /memes, /jogos, /batalha-naval)
- 🗂️ **6 páginas de catálogo/lazer ganharam o polish cinematográfico** — só visual (glow/profundidade/degradê), nada de layout/estrutura/JS.
- ✨ títulos em degradê neon nas 6; **`/ciberseg`** com linhas (hover/ativa) em glow e títulos de seção/detalhe em degradê; **`/robotica`** com módulos em glow no hover, item do rail ativo brilhando e título do módulo em degradê; **`/filmes`** com cards em lift+glow e pôster com leve zoom; **`/memes`** com cards em lift+glow (mantendo a cor do tier) e filtro ativo brilhando; **`/jogos`** (escopado em `.page-arcade`) com cards em lift+glow e aba ativa; **`/batalha-naval`** com título do tabuleiro em degradê e grade com leve glow.
- ✅ Verificado no navegador (Playwright + Vite). Build de produção limpo.
- 🛡️ Backup: `backup/2026-06-19-pre-merge-redesign-catalogo`.

### Redesign #195 — Onda Mídia (/fft, /radio, /musicas, /media, /videos, /tv)
- 🎬 **As 6 páginas de mídia/áudio ganharam o polish cinematográfico** — só visual (glow/profundidade/degradê), nada de layout/estrutura/JS.
- ✨ títulos em degradê neon nas 6; **`/fft`** com moldura HUD (cantos luminosos) no canvas + modo ativo com glow; **`/radio`** com display de frequência brilhando + estações/resultados com glow no hover; **`/musicas`** com faixa ativa em acento magenta+glow; **`/media`** com linhas e dropzone neon; **`/videos`** com playlist/linha ativa em glow e títulos em degradê; **`/tv`** com tela em moldura luminosa, canal ativo com glow e slot "agora" com acento.
- ✅ Verificado no navegador (Playwright + Vite) nas 6 rotas. Build de produção limpo.
- 🛡️ Backup: `backup/2026-06-19-pre-merge-redesign-conteudo` (mesmo lote do PR #252).

### Redesign #195 — Onda Conteúdo (/biblioteca, /universo, /academia)
- 📚 **As 3 páginas de conteúdo/aprendizado ganharam o polish cinematográfico** (mesma linguagem do `militar.css` e das Ondas 2-3): só visual (glow/profundidade/degradê via `box-shadow`, pseudo-elementos e `background-clip`), **nada** de layout/estrutura/JS mudou.
- ✨ **`/biblioteca`**: título e títulos do leitor (arco/capítulo) em degradê neon; cards de arco com lift+glow e capa com leve zoom no hover; faixa de acento luminoso no "continuar lendo"; busca com foco neon. **`/universo`**: título/seções em degradê, cards com lift+glow e ícone brilhando na cor do mundo, detalhe com glow. **`/academia`**: título e nome da linguagem em degradê, cards (linguagens/módulos/recursos/carreiras) com glow+lift, títulos de seção em degradê.
- ✅ Verificado no navegador (Playwright + Vite): as 3 páginas com título neon e cards repaginados. Build de produção limpo.
- 🛡️ Backup: `backup/2026-06-19-pre-merge-redesign-conteudo`.

### Mega-plano #238 — Fase 2: gate do Git Nexus (web leve, app completo)
- 🚪 **Git Nexus agora é gated por `window.baluarte.native`**: a rota `/git-nexus` passa por um **gate leve** (`src/pages/git-nexus-gate.js`, só importa `helpers`+`router`). Na **web** mostra um **teaser** "abre no app" com CTA pro `/baixar` e atalho pro Raio-X do Código (`/codigo`); no **app desktop** faz `import()` da experiência completa sob demanda.
- 📦 **Bundle**: a rota `/git-nexus` na web caiu de **~438 KB → 3.15 KB** (gz 1.39). O chunk pesado `git-nexus` (438 KB / 48.8 KB gz — grafo 3D + `codemap` + `codemap-symbols` ~460 KB + `jarvis-brain`) **só baixa dentro do launcher**. O `codemap-symbols.json` (461 KB) sai inteiro do caminho web.
- 🪶 **Boot da web mais leve**: o pré-aquecimento `syncRepoMemories()` do boot (que arrastava `jarvis-brain`→`codemap`/`cerebro`) agora roda **só no app**; na web, `/memoria` e `/aprendizado` já sincronizam sob demanda ao abrir.
- 🧩 **`git-nexus.js` intocado** (a implementação completa segue idêntica ao main): o gate vive em arquivo separado de propósito — evita renomear o arquivo analisado, o que reabriria alertas pré-existentes do CodeQL por mudança de fingerprint de caminho.
- ✅ Verificado no navegador (Playwright): web → teaser sem o canvas pesado; com `window.baluarte.native` → grafo 3D + console carregam. Build limpo; CI verde (CodeQL js/python + Vercel).
- 🛡️ Backup: `backup/2026-06-19-pre-merge-gitnexus-gate`.

## 2026-06-16

### App desktop #222 — M3c: o launcher sobe o motor do GitNexus sozinho (código)
- 🧠 **`desktop/src/nexus.js` reescrito**: `maybeStart()` deixou de ser opt-in (`BALUARTE_NEXUS_CMD`) e agora **sobe `gitnexus serve --port 4747` por padrão**. Se já há um motor no ar, só conecta (não duplica). Senão, tenta uma **cadeia de estratégias** até uma ficar saudável (polling no `/api/health`): `BALUARTE_NEXUS_CMD` (override) → cópia vendorizada via Electron-as-Node → bin `gitnexus` global → `npx -y gitnexus@latest serve`.
- 🔌 Desligável com `BALUARTE_NEXUS_DISABLE=1`; `stderr` do motor encaminhado pro console (`[nexus]`) pra depurar o aceite local; `stop()` encerra o filho no quit.
- 📋 **Mapeada a superfície real do `gitnexus serve`** (lendo a cópia vendorizada): REST de leitura (`/api/graph`, `/api/search`, `/api/processes`, `/api/clusters`) + Cypher (`POST /api/query`) **e** ponte **MCP-over-HTTP** (`POST /api/mcp`) por onde saem as 16 tools — base do próximo marco (**M3d**, plugar tudo na ponte IPC).
- ⚠️ **Aceite é LOCAL** (sem Electron/máquina no remoto): instalar o motor + `gitnexus analyze` num repo → no launcher `/git-nexus` fica verde + grafo real. Passos em `desktop/README.md` e `docs/HANDOFF-LOCAL.md`. Sintaxe verificada (`node --check`); build web intacto.
- 🛡️ Backup: `backup/2026-06-16-pre-merge-nexus-m3c`.

### Redesign #195 — páginas leves (/projetos, /roadmap, /mural)
- 🪶 **As 3 páginas leves restantes ganharam o estilo cinematográfico** — `/projetos`, `/roadmap` e `/mural` — fechando o grosso da fila de redesign remota da #240.
- ✨ **O que ganhou glow/profundidade**: títulos (de página, hero e seção) em **degradê neon** ciano→magenta com brilho; **cards** com fundo em gradiente e glow no hover (projetos sobem, posts do mural deslizam com acento luminoso); cards de nível/site do Roadmap com *lift* + glow; foco neon na caixa de composição do Mural; tags com borda neon. **Só visual — nada de layout/estrutura/JS mudou.**
- ✅ Verificado no navegador (Playwright + Vite dev): `/projetos` (grid de cards + título neon), `/roadmap` (hero/seções neon, cards de nível) e `/mural` (título neon, composer). Build de produção limpo.
- 🛡️ Backup: `backup/2026-06-16-pre-merge-redesign-leves`.

### Redesign #195 — Onda 3: Campo & Tático (cards/leitor)
- 🎖 **As páginas de Campo & Tático ganharam o estilo cinematográfico** — `/elites`, `/dossie` e `/enciclopedia-militar` repaginadas na mesma linguagem que o `/arsenal` (que já havia recebido o polish do redesign), fechando a Onda 3.
- ✨ **O que ganhou glow/profundidade**: títulos de página e de seção em **degradê neon** ciano→magenta com brilho; **cards** com fundo em gradiente, *lift* e glow no hover (Elites deslizam, Enciclopédia sobe); **painéis de leitor/detalhe** com brilho radial e nome/título da seção em degradê; **sumário/navegação** com item ativo em acento esquerdo luminoso e hover deslizante; **timeline** da Enciclopédia com nós luminosos; barras de ranking brilhando; *stat tiles* e tags com brilho/borda neon. **Só visual — nada de layout/estrutura/JS mudou.**
- ✅ Verificado no navegador (Playwright + Vite dev): `/elites` (cards + detalhe "Vanguarda da Manhã" com brilho), `/enciclopedia-militar` (título neon, nav ativa, cards "Ramos das Forças"), `/dossie` (título/leitor repaginados) e `/arsenal` (já no estilo, conferido pra coesão). Build de produção limpo.
- 🛡️ Backup: `backup/2026-06-16-pre-merge-redesign-onda3`.

### Redesign #195 — Onda 2: Geo/Tático (6 páginas num PR)
- 🛰 **As 6 páginas Geo/Tático ganharam o estilo cinematográfico do redesign** — `/radar`, `/mapa`, `/geopulse`, `/triangulacao`, `/find` e `/visao` — cada uma na sua folha dedicada (`radar.css`, `mapa.css`, `geopulse.css`, `triangulacao.css`, `find.css`, `visao.css`), com uma linguagem visual **HUD** compartilhada.
- ✨ **O que ganhou glow/profundidade**: títulos em degradê neon ciano→magenta com brilho; **moldura HUD** (colchetes luminosos nos cantos) emoldurando os módulos de canvas/scope (Range-Doppler, Waterfall, Trajetória, Campo de rumos, viewport do Mapa e da Câmera); *stat tiles* com barra de acento no topo, valor brilhando e *lift* no hover; *scope heads* com **linha de varredura animada** ("sensor ao vivo"); botões/modos/estações ativos com glow; linhas de detecção/pontos/locais com acento luminoso; barras de confiança e resultado de localização com brilho neon. **Só visual — nada de layout/estrutura/JS mudou** (tudo via pseudo-elementos e box-shadow, no espírito "leve" do #238).
- ✅ Verificado no navegador (Playwright + Vite dev): `/radar` (scopes com moldura HUD + título neon), `/triangulacao` (stat tiles com acento, "4 estações" ativo com glow, campo com colchetes), `/find` (painéis emoldurados) e `/geopulse` (6 stats com barra de acento + scope "Trajetória" com cantos HUD ciano). Build de produção limpo.
- 🛡️ Backup: `backup/2026-06-16-pre-merge-redesign-onda2`.

### Scroll-reveal global — todas as páginas ganham movimento (leve)
- ✨ **Os blocos de cada página entram suavemente** conforme aparecem na viewport (fade + slide). Inspirado nas skills de animação (AOS / GSAP ScrollTrigger), mas em **~40 linhas e zero dependência** (IntersectionObserver) — alinhado ao "site leve" (#238).
- ⚙️ `src/utils/scroll-reveal.js` + `reveal.css`, plugado no `renderPage()` do shell → roda a cada navegação, em **todas as páginas**. Pula a `/home` (a cena WebGL já tem movimento), respeita `prefers-reduced-motion`, e revela tudo na hora se não houver suporte (conteúdo nunca fica preso invisível).
- ✅ Verificado (Playwright): /perfil revela os blocos (acima da dobra na hora, o resto ao rolar); /home pulada; /radar (canvas) intacto (512px).
- 🤝 **`docs/HANDOFF-LOCAL.md` (novo)**: playbook pra uma sessão **local** (com as skills do `claudedesignskills` + `gitnexus`) pegar e executar o que esta sessão remota não consegue — design 3D pesado, motor real do GitNexus (M3c), runtimes (M4). A divisão de trabalho que o operador propôs.
- 🛡️ Backup: `backup/2026-06-16-pre-merge-scroll-reveal`.

## 2026-06-15

### Redesign #195 — Onda 1: Seção Militar inteira (12 páginas num PR)
- ⚔️ **`militar.css` repaginada** com um *layer* de polish cinematográfico que eleva **as 12 páginas da Seção Militar de uma vez** (Forças Armadas, Orçamentos, Rankings de Poder, Arsenal Expandido, Forças Especiais, Organização, Tecnologia, Táticas, História, Armas por País, Guerras, Batalhas) — uma única folha compartilhada, máximo de alavancagem.
- ✨ **O que ganhou glow/profundidade**: títulos em degradê neon; *stat tiles* com barra de acento no topo, valor com brilho e *lift* no hover; todos os cards com glow ciano no hover; barras de progresso/orçamento brilhando; nós das timelines (História, Guerras) luminosos; linhas de tabela com tinta ciano; abas/filtros ativos com glow; inputs com foco neon. **Só visual — nada de layout/estrutura mudou.**
- ✅ Verificado no navegador (Playwright): Rankings de Poder, Forças Armadas (stats + tabela) e História Militar (timeline) renderizando no novo estilo.
- 🛡️ Backup: `backup/2026-06-15-pre-merge-militar-wave1`.

### Redesign #195 — /sobre repaginada (linha do tempo cinematográfica)
- 📖 **`/sobre` redesenhada** no estilo do redesign (a página também não tinha CSS dedicado). Destaque pra **linha do tempo** da jornada do projeto (Mark I → v1.0.0): virou uma **espinha vertical com brilho** ciano→magenta, nós luminosos e tags em pílula — o último marco em magenta.
- 🗺 **Mapa do site** com cards de glow/lift e ícones brilhantes; seção **educacional** repaginada; e o aviso **"em construção"** num painel com acento âmbar e listras diagonais.
- 🎨 Novo `src/styles/sobre.css` (CSS-only, sem mexer na lógica/conteúdo) usando os design tokens — consistente com home, Git Nexus e /perfil.
- ✅ Verificado no navegador (Playwright): hero, 6 marcos na timeline, 16 cards do mapa, 5 itens educacionais e o painel final.
- 🛡️ Backup: `backup/2026-06-15-pre-merge-sobre-redesign`.

### Redesign #195 — /perfil vira o "Dossiê do Operador"
- 🪪 **`/perfil` reconstruída** no estilo cinematográfico do redesign. A página estava praticamente sem estilo (classes `perfil-*` sem CSS); agora tem um **dossiê imersivo**: emblema **Ω** num anel ciano→magenta girando, nome em degradê, callsign com status "● ONLINE", badges de clearance (OMEGA/ALFA/TANGO) e bio, sobre um fundo com brilho radial + grid e **parallax sutil do brilho com o mouse**.
- 📊 **Cards de estatística** com número em degradê mono, glow e *lift* no hover; **acesso rápido** em cards com glow magenta; **configurações** (nome, callsign, 27 temas/universos em pílulas, toggles, zona de perigo) repaginadas e mantidas 100% funcionais.
- 🎨 Novo `src/styles/perfil.css` usando os design tokens (cores de marca, `--shadow-glow-*`, raios, espaçamentos) — consistente com a home e o Git Nexus.
- ✅ Verificado no navegador (Playwright): hero + emblema, 6 stats, 4 atalhos, 27 swatches de tema/universo, tudo renderizando.
- 🛡️ Backup: `backup/2026-06-15-pre-merge-perfil-redesign`.

### JARVIS ganha o Git Nexus como skills (#231, inspirado no OpenJarvis)
- 🧠 **O JARVIS agora entende o código.** Pergunte *"o que quebra se eu mexer no `helpers.js`?"* e ele chama a skill `nexus_impact` e responde **"risco CRÍTICO, 115 arquivos afetados"** — usando o grafo de conhecimento do Git Nexus, não um chute.
- 🧩 **5 skills novas** registradas no catálogo de ferramentas do agente (`src/utils/jarvis-nexus-tools.js`), no padrão de "skills" do OpenJarvis: `nexus_impact` (raio de explosão + risco), `nexus_context` (quem importa / o que importa), `nexus_path` (caminho entre dois arquivos), `nexus_deps` (dependências), `nexus_rename` (usos que um rename tocaria).
- ♻️ **Reusa o motor que já existe**: cada skill resolve o alvo em linguagem natural (`search`) e chama as funções do `git-nexus-engine` (`nexusImpact`/`nexusContext`/`nexusPath`/`nexusRename`) sobre o `codemap.json`. Grafo montado uma vez (lazy) e reusado. Tudo JS puro, na web.
- 🔌 Plugado via `import` no `jarvis-engine.js` — entram automaticamente no `getToolSchemas()` que vai pro modelo; o loop de tool-call do agente já sabe executá-las.
- ✅ Verificado no navegador (Playwright + Vite dev): as 5 skills no catálogo, `impact helpers` = CRÍTICO/115, `context router` = 26 importadores, `path home→helpers` = 1 salto, `rename helpers` = 112 usos, e alvo inexistente devolvendo erro gracioso.
- 🛡️ Backup: `backup/2026-06-15-pre-merge-jarvis-nexus-skills`.

### Launcher v0.1.1 — ícone do app vira o selo vermelho + bump de versão
- 🔴 **Ícone do launcher trocado pelo selo vermelho**: o `desktop/build/icon.png` ainda era o arc-reactor ciano que eu gerei no M0; agora é o selo (renderizado de `public/logo.svg` num quadrado escuro 1024², com brilho). É o ícone que aparece na barra de tarefas, no atalho e na janela. `build/make-icon.mjs` reescrito pra gerar o ícone a partir do logo do projeto.
- 🎬 **Telas do launcher no mesmo selo**: splash de abertura e tela offline agora mostram o selo vermelho (antes era o arc-reactor em CSS). `logo.svg` copiado pra `desktop/src/` pro app empacotado achar; CSP da splash liberou `img-src`.
- 🩹 **Bug do M0 corrigido**: o `offline.html` estava em `desktop/` (fora de `src/`), então o `main.js` (`__dirname/offline.html`) não o achava **e** ele nem entrava no pacote (`files: src/**/*`). Movido pra `desktop/src/offline.html` — o fallback offline agora funciona de verdade.
- 🔖 `desktop/package.json`: **0.1.0 → 0.1.1**. As releases do GitHub são chaveadas por versão; re-rodar o workflow com a **mesma** versão só atualiza a release existente (mantém a data original). Subir a versão = a próxima execução cria uma release **nova** (`v0.1.1`) com data atual, instaladores frescos **e o ícone novo**.
- ℹ️ A v0.1.0 já está publicada e funcional (`.exe`/`.dmg`/`.AppImage`); a página `/baixar` já serve ela. O ícone novo entra na v0.1.1.
- ✅ Verificado no navegador (Playwright): ícone 1024² renderizado; splash e offline carregando o selo (CSP ok).

### Novo logo — selo arcano vermelho (Baluarte Mark XIII)
- 🔴 **Logo trocado** pelo selo do operador (`19KMF01.svg` → `public/logo.svg`): movido pra `public/` (onde o Vite serve) e **recolorido pra vermelho** (`#ff1f3a`) — o arquivo veio traçado em preto (`fill="#000000"`) e sumiria no fundo escuro.
- 🧩 Fiado em **todos os pontos de marca**: favicon (aba do navegador), tela de boot, topo da sidebar ("Mark XIII") e o brand do header. Glifo `⬡` antigo aposentado nesses lugares; cada um ganhou um leve glow vermelho.
- ℹ️ O ícone do PWA (manifest) ficou como estava (hexágono com fundo escuro) — o selo é detalhado e transparente, não rende bem como ícone de instalação quadrado; dá pra fazer uma versão própria depois se quiser.
- ✅ Verificado no navegador (Playwright): `/logo.svg` servido, vermelho, e renderizando na sidebar.

### Release do app: workflow disparável + publicação direta (#222)
- 🚀 **`desktop-release.yml` agora dispara também por `workflow_dispatch`** (botão "Run workflow" na aba Actions, ou via API) — além da tag `desktop-v*`. Permite cortar a 1ª release sem depender de push de tag.
- 📦 **`releaseType: 'release'`** no electron-builder: a release sai **publicada** (não rascunho), então vira a "latest" e a página `/baixar` a enxerga automaticamente.

### Página de download do app (estilo Steam/Claude) (#222)
- ⬇ **Nova página `/baixar`**: a pessoa clica e baixa o **Baluarte Launcher** num clique, sem entender nada de programação. Detecta o **sistema operacional** (Windows/macOS/Linux) e oferece o instalador certo como CTA principal; as outras plataformas ficam como opções secundárias.
- 🔗 **Sempre a última versão**: busca a **release mais recente** do GitHub em runtime (API), casa o asset por extensão (`.exe`/`.dmg`/`.AppImage`) e aponta direto pro download — nada hardcoded. Some "v" duplicado e mostra **tamanho + versão**.
- 🌫️ **Degradação graciosa**: se ainda não houver instalador publicado (ou offline/rate-limit), mostra "build em breve" com link pro GitHub — nunca quebra.
- 🎨 Visual no estilo do projeto: núcleo arc-reactor animado, CTA em degradê ciano→magenta, cards de "por que o app" e notas de instalação por SO (SmartScreen/Gatekeeper/AppImage).
- 🧭 Entrou no menu lateral ("Baixar o App", logo abaixo da Ponte de Comando).
- ✅ Verificado no navegador (Playwright): com release simulada = baixa o `.exe` certo (v0.1.0 · 74.9 MB); sem release = estado "em breve".
- 🛡️ Backup: `backup/2026-06-15-pre-merge-pagina-download`.

## 2026-06-14

### App desktop (Baluarte Launcher) — M3b: orbe roda no grafo REAL do motor (#222)
- 🧠 **Grafo de verdade no orbe 3D**: no Baluarte Launcher, a `/git-nexus` busca o grafo real do motor (`nexus:graph` → `/api/repos` + `/api/graph` do 1º repo analisado) e o **mesmo pipeline** (comunidades, PageRank, impacto, centralidade) passa a rodar nele — via `fromEngineGraph()` que converte `{nodes, relationships}` do GitNexus pro formato do `analyze()`. **Sem fork**: na web (sem launcher) ou se não houver repo analisado, segue no `codemap.json`.
- 🔌 **Handler `nexus:graph`** na ponte IPC (M2) + `nexus.graph()` no desktop (pega o 1º repo de `/api/repos`, busca `/api/graph?repo=…`, timeout maior).
- 🏷️ A dica do grafo vira "grafo REAL do motor" quando o motor alimenta a cena.
- ✅ Verificado no navegador (Playwright): web = codemap (187 arquivos, badge oculto); launcher simulado com grafo do motor = orbe renderiza os 44 nós/78 arestas reais, comunidades e "mais central/importado" calculados sobre eles, badge verde, dica "grafo REAL".
- 🧱 Falta a **fatia nativa (M3c)**: empacotar o motor + nativos (`electron-rebuild`) e subir a 4747 por padrão — aí o aceite é ponta-a-ponta na máquina.
- 🛡️ Backup: `backup/2026-06-14-pre-merge-desktop-m3b`.

### App desktop (Baluarte Launcher) — M3a: detecção do motor real do GitNexus (#222)
- 🔌 **`desktop/src/nexus.js`**: detecta o **motor real** do GitNexus (servidor Express do pacote `gitnexus` na **4747**) via `GET /api/health` + `/api/info`. Spawn opt-in por enquanto (`BALUARTE_NEXUS_CMD`), sem shell e com args fixos; encerra junto com o app.
- 🧩 **Handler `nexus:status`** plugado na allowlist da ponte IPC (M2) — devolve `{ available, url, version?, nodeVersion?, spawned }`.
- 🟢 **Badge na página `/git-nexus`**: dentro do **Baluarte Launcher**, mostra **verde** "Motor real do GitNexus conectado · vX" ou **âmbar** "Motor local indisponível — usando o mapa de build". Na **web** (sem `window.baluarte`) o badge fica oculto e a página segue com o `codemap.json` — degradação graciosa, sem fork.
- ✅ Verificado no navegador (Playwright): web = badge oculto e página intacta; launcher simulado = badge âmbar (off) e verde (live, v1.6.7) renderizando sob o header.
- 🧱 Próxima fatia (**M3b**): empacotar o motor + nativos (`tree-sitter` ×11, `onnxruntime-node`, `@ladybugdb/core`) com `electron-rebuild` e consumir o **grafo real** (`/api/graph`).
- 🛡️ Backup: `backup/2026-06-14-pre-merge-desktop-m3a`.

### App desktop (Baluarte Launcher) — M2: ponte IPC allowlisted (#222)
- 🔐 **Fronteira de segurança renderer↔nativo** (`desktop/src/ipc.js`): toda chamada nativa passa por **um funil único** `window.baluarte.invoke(channel, payload)` → canal `baluarte:invoke` no main, validado por três camadas: **remetente** (só a janela principal), **allowlist** explícita de canais, e **payload** validado por cada handler. O renderer nunca recebe `ipcRenderer` cru, FS ou `require`.
- 🧩 **Canais do M2** (a UI da web pode usar em "modo nativo"): `ping`, `app:info` (nome/versão/plataforma/arch/online), `app:openExternal` (abre link http/https no navegador, validado contra `file:`/`javascript:`), `app:reload`.
- 🧱 É o encaixe pronto pro **M3**: os handlers `nexus.*` (motor real do GitNexus) plugam direto na allowlist, sem reabrir a fronteira.
- 🛡️ Backup: `backup/2026-06-14-pre-merge-desktop-m2`.

### App desktop (Baluarte Launcher) — M1: casca de launcher (#222)
- 🪟 **Splash de abertura** (`splash.html`): núcleo arc-reactor animado enquanto o hub carrega; some quando a página fica pronta (com trava de segurança de 12s pra nunca prender).
- 🔔 **System tray**: ícone na bandeja com menu (Mostrar / Recarregar / Sair). **Fechar a janela minimiza pra bandeja** (estilo Steam/launcher) — o app só encerra de fato no "Sair"; clicar no ícone alterna mostrar/esconder. `before-quit` garante que Cmd+Q / shutdown saem mesmo (não ficam presos na bandeja).
- 🔗 **Deep-link `baluarte://<rota>`**: instância única (`requestSingleInstanceLock`) + handlers de `open-url` (macOS) e `second-instance`/argv (Win/Linux). Ex.: `baluarte://git-nexus` foca a janela e navega pra `#/git-nexus`. A rota é **sanitizada** antes de entrar na URL (sem injeção).
- 🟢 **Indicador de conexão (online/offline)**: o preload relata `navigator.onLine`; o estado aparece na **bandeja** (tooltip + linha "Conectado ao hub" / "Offline (modo local)") e no **título** da janela. A UI da web pode ler `window.baluarte.isOnline()`.
- 🔒 Postura de segurança mantida (isolamento, sem nodeIntegration, sandbox, navegação presa às origens confiáveis).
- 🛡️ Backup: `backup/2026-06-14-pre-merge-desktop-m1`.

### App desktop (Baluarte Launcher) — M0: esqueleto Electron + auto-update (#222)
- 🚀 **Novo diretório `desktop/`**: o começo do **launcher nativo** em Electron, o caminho pra rodar as versões pesadas que o site estático não roda (o motor real do GitNexus em `GitNexus-1.6.7/` é Node nativo — tree-sitter, LadybugDB — e não cabe no Vercel). Plano completo no RFC da issue **#222**.
- 🌐 **Conexão com a web**: a janela carrega a **mesma UI Vite da produção** (`projeto-baluarte.vercel.app`) — o deploy web já é o canal de atualização instantâneo da interface. **Fallback offline** embutido (`../dist` → `resources/web`, e `offline.html` em último caso).
- 🔄 **Auto-update da casca**: `electron-updater` apontando pras **GitHub Releases**; workflow `desktop-release.yml` builda Win/Mac/Linux e publica os instaladores numa tag `desktop-v*`. Loop: `build → tag → instalador na Release → app se atualiza sozinho`.
- 🔒 **Segurança desde o M0**: `contextIsolation`, sem `nodeIntegration`, sandbox, navegação/links presos às origens confiáveis. `window.baluarte.native` deixa a UI detectar quando roda dentro do launcher (pro "modo nativo" futuro).
- 🎨 Ícone arc-reactor (ciano/magenta) gerado sem dependência (`build/make-icon.mjs`).
- 📦 `desktop/` excluído do deploy Vercel (`.vercelignore`); runtime dep (`electron-updater`) sem vulnerabilidades — os alertas do `npm audit` são todos do toolchain de build (electron-builder), que não vai pro app.
- 🛡️ Backup: `backup/2026-06-14-pre-merge-desktop-m0`.

### Home — herói 3D imersivo em WebGL (#195)
- 🌌 **Hero WebGL**: a home agora abre com uma cena 3D de verdade — **nebulosa volumétrica de 3.600 partículas** (disco galáctico + halo) renderizada em **WebGL 1.0 puro, sem dependência**, com *blending* aditivo (brilho real) nas cores do projeto (ciano/magenta/branco).
- 💠 **Núcleo arc-reactor estilo JARVIS**: 5 anéis 3D de orbes luminosos girando em eixos diferentes + ponto central pulsante no miolo da nebulosa. (Render como *point-sprites* porque `gl.LINES` com espessura é ignorado na maioria das GPUs — assim o núcleo lê nítido sobre a nebulosa.)
- 🎥 **Câmera que se move como o JARVIS**: orbita com o **parallax do mouse** e **mergulha com o scroll** (*fly-through*), além da auto-rotação contínua.
- ♿ **Degradação graciosa**: se o WebGL não compilar/existir, cai automaticamente no campo de partículas 2D antigo (`hero3d.js`); respeita `prefers-reduced-motion` (assenta a cena, não gira) e pausa com a aba oculta. *Frame loop* auto-dimensionável e auto-encerrável (robusto a remontagem do router).
- ✅ Verificado no navegador (Playwright/WebGL): `is-webgl` ativo, contexto `webgl`, nebulosa + anéis renderizando atrás do título.
- 🛡️ Backup: `backup/2026-06-14-pre-merge-hero-webgl`.

### Git Nexus — Console com as ferramentas do GitNexus (#204/#195)
- 🖥 **Console do Nexus**: terminal na página que traz as **4 ferramentas canônicas do GitNexus** sobre o grafo (arquivos ou funções), em JS puro:
  - **`context <X>`** — definição + quem chama/importa + o que chama/importa.
  - **`impact <X> [down]`** — raio de explosão com **nível de risco** (BAIXO→CRÍTICO, como o GitNexus exige antes de editar). Ex: `impact helpers` = risco CRÍTICO, 115 afetados.
  - **`path <A> <B>`** — menor caminho de chamadas/imports entre dois símbolos.
  - **`rename <X>`** — quantos usos um rename seguro tocaria (entende o grafo, não é find-and-replace). Ex: `rename toast` = 50 usos.
  - **`query <texto>`** (ou texto livre) — busca no grafo.
  Cada resultado vem com chips clicáveis que selecionam o nó no orbe 3D.
- ✅ Verificado no navegador (Playwright): as 5 ferramentas respondendo, badges de risco (BAIXO/CRÍTICO) aparecendo.
- 🛡️ Backup: `backup/2026-06-14-pre-merge-gitnexus-console`.

## 2026-06-13

### Git Nexus — drill-down por arquivo + herança + codemap atualizado (#204/#195)
- 🔎 **Drill-down**: no modo Arquivos, ao selecionar um arquivo aparece o botão "ƒ ver as N funções deste arquivo →" que abre um **grafo 3D focado** só nas funções daquele arquivo + suas conexões de 1 salto (quem elas chamam / quem as chama). Migalha "← arquivos" pra voltar. Navegação em dois níveis, como no GitNexus.
- 🧬 **Herança (EXTENDS)**: o extrator agora capta `class X extends Y` e emite arestas EXTENDS (além de CALLS) — ex: `ReplaySource → MockSource` no radar.
- 🔄 **`codemap.json` regenerado**: estava defasado (08/06, 158 arquivos); agora reflete o `src/` atual — **187 arquivos**, 438 imports, incluindo as páginas novas (aprendizado, git-nexus, apis…) e o `jarvis-brain.js`. O grafo de arquivos do Git Nexus e do Raio-X passam a mostrar o site de hoje.
- ✅ Verificado no navegador (Playwright): drill-down de `jarvis-brain.js` (20 funções, 78 chamadas), seleção de função no foco, e volta aos 187 arquivos.
- 🛡️ Backup: `backup/2026-06-13-pre-merge-gitnexus-drill`.

### Git Nexus — nível de FUNÇÕES (call graph 3D) (#204/#195)
- ƒ **Toggle "Arquivos / Funções"** no Git Nexus: além do grafo de arquivos+imports, agora tem o grafo das **principais funções/classes + as chamadas entre elas** — o nível profundo que faltava do GitNexus.
- 🧬 **`scripts/gen-symbols.mjs` novo** (build-time, sem dependências): parser leve que extrai de `src/` **1137 funções/classes** e **2456 chamadas** (call graph), gerando `src/data/codemap-symbols.json`. Rastreia parênteses para não se confundir com params desestruturados.
- 🌐 No modo Funções, o mesmo orbe 3D mostra as **240 funções mais conectadas**: comunidades = clusters de funções que se chamam, PageRank = funções mais centrais, e **impacto = cadeia de chamadas** (quem quebra se você mudar a função). Ex: `addMemory` é chamada por 7, chama 6, e afeta 8 funções na cadeia.
- 🔎 Busca, seleção e painel adaptados (mostra kind/arquivo/linha da função).
- ⚙️ `npm run gen-symbols` / `gen-codemap` adicionados aos scripts.
- ✅ Verificado no navegador (Playwright): troca de modo, orbe de funções girando, seleção mostrando call-chain e impacto.
- 🛡️ Backup: `backup/2026-06-13-pre-merge-gitnexus-funcoes`.

### Git Nexus em 3D — orbe que gira como o JARVIS (#195/#204)
- 🌐 **Grafo do Git Nexus agora é 3D** (pedido do operador no #195: "tem que ter isso em 3D o jeito que ele se organiza, e ele tem que se mover igual ao jarvis"). `git-nexus-graph3d.js` novo: orbe de nós que **se auto-organiza por forças em 3D**, projetado em perspectiva no canvas, **girando sozinho** (vivo, estilo núcleo do JARVIS) — referência das imagens que o operador anexou.
- ✨ Profundidade real: nós perto = maiores/brilhantes, longe = menores/apagados; glow por comunidade, tamanho por centralidade; pintura ordenada por profundidade.
- 🕹️ **Arraste para girar** (com inércia), hover realça a vizinhança, clique seleciona → painel de impacto. Tudo em Canvas 2D puro (sem WebGL/Three) — roda leve no navegador e na Vercel.
- ♿ Respeita `prefers-reduced-motion` (assenta o orbe e não gira sozinho).
- ✅ Verificado no navegador (Playwright): orbe girando (assinatura de pixels muda entre frames), seleção de `helpers.js` mostrando impacto de 92 arquivos em 3D.
- 🛡️ Backup: `backup/2026-06-13-pre-merge-gitnexus-3d`.

### Redesign — polish do Git Nexus + Arsenal (#195/#204)
- 🔗 **Git Nexus mais cinematográfico**: brilho (glow) nos nós do grafo, realce mais forte no hover, fundo do grafo com brilhos radiais + vinheta e título em degradê.
- 🔫 **Arsenal alinhado ao redesign** (só visual, lógica intocada): título em degradê, linhas com glow e acento cyan no hover/seleção, painel de detalhe com fundo cyan e nome em degradê, abas em pílula.
- 🖼️ Screenshots do Git Nexus enviados ao operador.
- ✅ Verificado no navegador (Playwright): grafo com glow, Arsenal com 251 linhas e seleção realçada.

### Redesign — Hub de Ferramentas (#195, página 1/N)
- ⚙ **`/ferramentas` redesenhada** no estilo do redesign: título em degradê, busca proeminente, chips de categoria com **cor própria por categoria** e contagem, e os 51 cards com **acento colorido**, badges NOVO/PRONTO/ROADMAP e **tilt 3D no hover**. Os dados/rotas/busca foram preservados — só a camada visual mudou.
- 🧭 **#195 segue aberto como guarda-chuva** do redesign (a pedido do operador): as páginas serão redesenhadas aos poucos, uma por PR. Esta é a primeira página de conteúdo depois da Home.
- 🐛 Estado da página (grid/busca/filtro) virou **local por invocação** (era global — a página é instanciada 2x e o filtro atualizava o grid errado).
- ✅ Verificado no navegador (Playwright): 51 cards, filtro cripto → 9, busca "morse" → 1, tilt no hover.
- 🛡️ Backup: `backup/2026-06-13-pre-merge-ferramentas`.

### Redesign — rodada 2: atmosfera + 3D manipulável + scrollytelling (#195)
- 🌆 **Grid de horizonte (synthwave / GTA-VI)** no herói: chão em perspectiva que recua até um horizonte com brilho, linhas "voando" em direção ao observador — fundo animado que dá profundidade cinematográfica (`hero3d.js`).
- 🕹️ **Emblema 3D manipulável**: agora dá pra **arrastar para girar** o emblema, com inércia — ideia literal do #195 ("objetos 3D manipuláveis").
- 📜 **Scrollytelling**: ao rolar, o herói recua e desbota suavemente (parallax de scroll).
- ⌨️ **Tipografia cyberpunk**: efeito glitch/scramble revelando o kicker "NÚCLEO INFINITY DREADNOUGHT" ao abrir.
- ♿ Tudo respeita `prefers-reduced-motion` (grid estático, sem glitch/inércia).
- ✅ Verificado no navegador (Playwright): grid desenhando (49k px no chão), arraste girando o emblema (102°), scroll desbotando as camadas, glitch assentando no texto.
- 🛡️ Backup: `backup/2026-06-13-pre-merge-redesign-r2`.

### Redesign 3D promovido a Home oficial (#195/#196)
- 🏠 **A `/home` agora é o visual 3D imersivo** (a pedido do operador — "promover pra Home oficial"). O herói cinematográfico (campo de partículas 3D + emblema giratório + título em degradê) substitui a home antiga, com saudação ao operador e CTAs para Ferramentas e J.A.R.V.I.S.
- 🔭 **Conteúdo da home antiga integrado ao novo visual**: os painéis de **Vigilância** (log de eventos ao vivo) e **Infraestrutura** (status do sistema) foram redesenhados no estilo do herói, em vez de descartados — agora citam Git Nexus e ML.
- 🗂️ Mantém as **prateleiras estilo Steam** (Arsenal/Equipes/Universos/Crônicas com tilt 3D), métricas reais com count-up e acesso rápido (agora com Git Nexus e ML no topo).
- ♻️ **Limpeza**: a rota de preview `/home-3d` foi aposentada (vira alias da home, pra não quebrar links antigos), o item "Ponte 3D · preview" saiu do menu e o `home3d.js` foi removido (o código vive na `home.js`).
- ✅ Verificado no navegador (Playwright): herói com partículas, sem badge de preview, métricas reais, Vigilância (5) + Infra (5) integradas, 4 prateleiras com 48 cards, alias `/home-3d` funcionando.
- 🛡️ Backup: `backup/2026-06-13-pre-merge-home-oficial`.

### Git Nexus — núcleo unificado de código (#204/#194)
- 🔗 **`/git-nexus` novo**: integração do GitNexus ao site, do jeito que **realmente roda na Vercel**. O GitNexus original é um servidor Node na porta 4747 (tree-sitter nativo, onnxruntime, LadybugDB) — não sobe num site estático, e a versão "WASM no navegador" que o README promete não existe no código. Então reimplementei os **conceitos** dele em **JS puro**: taxonomia de nós/arestas de código, **comunidades** (clusters não-supervisionados), **análise de impacto** (quem é afetado se um arquivo mudar) e **centralidade (PageRank)**.
- 🧩 **Funde as 4 ferramentas** que viviam separadas, agora conversando pelo grafo: 🔬 Raio-X do Código (o grafo), 🧠 Memória do JARVIS (memórias ligadas a cada arquivo), 🕸️ Segundo Cérebro (conceitos) e 📈 Mini-LLM/ML (as comunidades são "assuntos do código" descobertos sozinho — o mesmo princípio do `/aprendizado`).
- 🗺️ **Visualização interativa** (`git-nexus-graph.js`): grafo force-directed em canvas, nós coloridos por comunidade e dimensionados por centralidade; passar o mouse realça a vizinhança, clicar abre o painel de impacto/dependências/memória do arquivo. Busca por nome.
- 🧠 **Motor** (`git-nexus-engine.js`): puro e determinístico, sobre o `codemap.json` (158 arquivos, 350 imports). Detecta 5 comunidades (pages, utils, subsistemas terminal e radar…), aponta `helpers.js` como mais central, e calcula que mudá-lo afeta 92 arquivos.
- 🔄 **Não-destrutivo**: as 4 páginas originais seguem acessíveis; o Git Nexus é o novo hub que as une. Item "🔗 Git Nexus" no topo do menu IA & Jarvis.
- ✅ Verificado no navegador (Playwright) e no Node (motor determinístico).
- 🛡️ Backup: `backup/2026-06-13-pre-merge-git-nexus`.

### Deploy da Vercel consertado — bundle das funções + submódulos (#210)
- 🚑 **Deploy estava FALHANDO**: o build do front (Vite) passava, mas o bundle das funções Python (`api/`) estourava o limite de **245 MB** da Lambda (489,96 MB) — o builder empacotava o repositório inteiro, incluindo pastas enormes commitadas (`Humanity always first` 172 MB, `GitNexus-1.6.7` 139 MB, `.obsidian` 43 MB, `.smart-env` 19 MB) e os PDFs das Crônicas (~30 MB). Nada disso é usado pelo site (os dados de runtime ficam em `src/data/*`).
- 📦 **`.vercelignore` novo**: exclui esse peso morto do deploy (não-destrutivo — os arquivos continuam no repositório). O bundle cai de ~490 MB para ~60 MB.
- 🧹 **Submódulos-fantasma removidos**: `gemini-cli`, `hermes-agent` e `NawfalMotii79-PLFM_RADAR-…` eram gitlinks órfãos (sem `.gitmodules`) — causavam o aviso "Failed to fetch one or more git submodules". Eram pastas vazias e nada no código os importava (só havia menções de inspiração em comentários).
- ⬆️ **Node fixado em `22.x`** no `package.json` (era `>=18`) — remove o aviso da Vercel sobre upgrade automático de major e torna o build reproduzível.
- ✅ Verificado: `vite build` continua passando e as funções Python compilam; nenhum código de runtime busca os arquivos excluídos.
- 🛡️ Backup: `backup/2026-06-13-pre-merge-deploy-fix`.

### Página piloto do redesign 3D imersivo (#195/#196)
- 🧊 **`/home-3d` — Ponte de Comando 3D (preview)** nova: página **piloto** do redesign, **não-disruptiva** (não toca na `/home` atual; tem badge "PREVIEW" e link "↩ ver a Home atual"). Junta o que os dois issues pedem — 3D imersivo e interativo (#195) com fidelidade cinematográfica + organização de conteúdo estilo Steam (#196) — em **JS/CSS puro, zero dependência** (consistência técnica).
- ✨ **Herói cinematográfico**: campo de partículas 3D em canvas (`hero3d.js`, perspectiva + parallax de mouse + constelação), emblema giratório em CSS 3D (anéis cyan/magenta), título em degradê com glow, HUD ao vivo (relógio + status) e CTAs.
- 🎚️ **Faixa de métricas reais** com contagem animada (Arsenal 251 · Equipes 26 · Arcos 24 · Capítulos 33 · Universos 21).
- 🗂️ **Prateleiras estilo Steam** (scroll horizontal, cards com **tilt 3D no hover**) alimentadas por **dados reais**: Arsenal, Equipes de Elite (cor por equipe), Universos (ícone/cor) e Crônicas. Mais grade de **acesso rápido**.
- ♿ **Leve e acessível**: respeita `prefers-reduced-motion`, pausa o canvas com a aba oculta, scroll-reveal das seções e limpeza de rAF/observers ao sair da página. O loop do herói se auto-dimensiona e se auto-encerra (imune a remontagem da página).
- ✅ Verificado no navegador (Playwright): partículas desenhando, métricas reais, 4 prateleiras com 12 cards cada (M9 Beretta, ALFA "Vanguarda da Manhã", universo Baluarte…), parallax e reveal funcionando. Screenshots do herói e das prateleiras.
- 🛡️ Backup: `backup/2026-06-13-pre-merge-home3d`.

### Painel de Machine Learning da Memória (#193/#194)
- 📈 **`/aprendizado` — Machine Learning da Memória** nova (menu IA & Jarvis): painel onde dá pra **ver o aprendizado de máquina do site acontecer** sobre o banco de memórias (conversas + respostas + deliberações do conselho). Tudo roda no navegador e é **🔒 somente leitura** sobre a memória (como o #193 pede — ninguém altera o banco por aqui).
- 🧩 **Assuntos descobertos sozinho** (`memory-ml.js` novo): **k-means não-supervisionado** sobre vetores TF-IDF (cosseno, init k-means++ determinístico) — o site lê as memórias e descobre os temas sem ninguém rotular. Controle deslizante de 2 a 8 assuntos.
- 📊 **Curva de aprendizado** (vocabulário acumulado, lei de Heaps), **ranking TF-IDF** dos termos aprendidos e **donut por origem** dos dados — todos no motor de gráficos em canvas do site.
- ⚙️ **Treinar modelo ao vivo**: a rede neural bigrama (`llm-mini.js`, gradiente de verdade) aprende a "falar" a partir das próprias memórias e mostra a **loss caindo** em tempo real (curva animada) + geração no estilo do Baluarte.
- 🔗 **Conexões** com o **Segundo Cérebro** (`/cerebro`) e o **Git Nexus / Raio-X** (`/codigo`) — fecha o ciclo que o #194 pede (ML junto do knowledge graph e do código).
- ◐ Sem memórias suficientes no navegador, o painel aprende sobre um corpus de demonstração (rotulado) e oferece sincronizar o banco versionado do repositório.
- ✅ Verificado no navegador (Playwright): k-means rende 4→6 assuntos coerentes ao mover o controle, os 3 gráficos desenham, o treino derruba a loss (3.40 → 2.27, −33%) e a geração responde. Motor `memory-ml.js` testado direto (k-means determinístico).
- 🛡️ Backup: `backup/2026-06-13-pre-merge-ml-memoria`.

## 2026-06-11

### Claude (servidor) vira modo do JARVIS e membro do Conselho (#200, parte 2)
- 🛰 **Modo novo no `/jarvis`**: "Claude (servidor)" — conversa com o Claude pelo `/api/claude`, com a chave na Vercel (nunca no navegador). É só escolher o modo no ⚙ e conversar.
- ⚖️ **Conselho de IAs com mais um membro**: o Claude (servidor) agora delibera junto com JARVIS Local, Gemini e Hermes, recebendo o mesmo contexto compartilhado (dossiê + memória durável + estado do site). Sem chave no servidor, ele degrada para "⚠ Indisponível." sem quebrar o conselho.
- 🧑‍⚖️ **Moderador-reserva do consenso**: se o Hermes (moderador titular) falhar na síntese, o Claude assume; o Gemini segue como última reserva.
- ✅ Verificado no navegador (Playwright + mock do `/api` no contrato real): resposta do Claude no chat do JARVIS, card "Claude (servidor)" no Conselho e consenso fechado "por Claude (reserva)" com Gemini/Hermes fora do ar.
- 🛡️ Backup: `backup/2026-06-11-pre-merge-claude-conselho`.

### Central de APIs + Claude no servidor (#200)
- 🔑 **`/apis` — Central de APIs** nova (menu IA & Jarvis): detecta, testa e gerencia as IAs do site num painel só. **Detecção no servidor**: o `/api/health` agora informa quais chaves existem na Vercel (só existe/não-existe — o valor nunca sai do servidor) e **qual env** a chave Claude usa. **Testes por provedor**: JARVIS Local, Claude (navegador, 1 token), Claude (servidor), Gemini, Hermes e Ollama, com latência e erro legível. **Cofre local**: chaves nomeadas mascaradas no localStorage (👁/copiar/excluir) e botão "Usar no JARVIS" que vira a apiKey do modo Claude.
- 🤖 **`/api/claude` novo**: Claude pelo servidor do site — a chave fica nas Environment Variables da Vercel, nunca no navegador. A detecção aceita **nome personalizado** (ex: `Claude_Fable`): qualquer env com valor `sk-ant-…` ou nome contendo claude/anthropic. Antes, essas chaves na Vercel eram invisíveis pro site (o código só lia GEMINI_API_KEY/OPENROUTER_API_KEY).
- ✅ Verificado no navegador (Playwright) rodando os handlers serverless reais com chaves falsas: detecção achou `Claude_Fable`, teste do `/claude` chegou na Anthropic (401 esperado), cofre mascara o valor e configura o JARVIS.
- 🎲 **Aleatoriedade forte em todos os ids persistidos** (achado real do CodeQL neste PR): `uid()` e os geradores de id do jarvis-brain/tools/skills/memory, mural, academia e gerar-código trocaram `Math.random` por `crypto.getRandomValues` (novo `randHex()` em helpers). Restou só o alerta antigo do `h(html:)` (padrão deliberado do site, documentado no código) — dá pra dispensar em Security → Code scanning.
- 🛡️ Backup: `backup/2026-06-11-pre-merge-apis`.

### Agente do Google removido de vez
- 🗑️ A pedido do operador (não vai mais mexer no portfólio, não precisa de agente puxando do Google): **removido o workflow `sync-cronicas.yml`** (que rodava sob demanda) **e os 4 scripts** que liam do Google Docs (`sync-cronicas.mjs`, `gen-fanfic-from-docs.mjs`, `gen-dossie-from-doc.mjs`, `gen-elites-rosters.mjs`). O cron de 12h já tinha sido desligado em 10/06; agora não sobra **nenhuma** automação de coleta do Google.
- ✅ Os dados já sincronizados continuam no repo (`cronicas.js`, `dossie.json`, `fanfic.json`, `elites*`), então as páginas seguem funcionando — só não se atualizam mais sozinhas. `gen-fanfic-from-md.mjs` (lê markdown local, não Google) foi mantido. Restam só os workflows `cambio.yml` (cotações) e `codeql.yml` (segurança).
- 🛡️ Backup: `backup/2026-06-11-remove-google-agent`.

### Arsenal: 2813 armas + correção de nomenclatura
- 🔫 **+184 famílias/variantes reais** adicionadas (todas dados públicos, sem inventar): infantaria 1003, blindados 361, artilharia 155, aéreo 524, naval 231, mísseis 366, drones 173 → **2813** no total (era 2629). Inclui NGSW (SIG MCX-Spear/XM7), HK433, Gepárd/NTW-20, MAC-10/11, caças da WWII (P-38, P-40, F6F Hellcat, Ki-84, Macchi C.205), Kfir/Nesher/Cheetah, fragatas Constellation/F125/F126, "3 T" navais (Talos/Terrier/Tartar), SAMs britânicos (Sea Dart/Sea Wolf/Bloodhound), MQ-28 Ghost Bat, Eurodrone, etc.
- 🔤 **Nomes corrigidos** no gerador (`joinName`): marcas/palavras agora recebem espaço — **Glock 17**, **SIG Sauer P226**, **MRAP MaxxPro**, **CheyTac M200 Intervention**, **MRAP RG-33/M-ATV/JLTV** — enquanto designadores reais seguem colados (**AKM**, **M16A1**, **MP5SD**, **CZ 75**). Regra nova: sufixo que é Palavra (Maiúscula+minúsculas) ou base com sigla de 4+ letras → separa.
- 🧹 Variante redundante do **DShK** removida (gerava "DShKDShKM"); suporte a **nome absoluto** com prefixo `*` no gerador (variante que não concatena com a base).

### Skill de execução pra agentes + CodeQL manual
- 🤖 **`.claude/skills/run-projeto-baluarte/`** novo: ensina o Claude Code (e qualquer agente futuro) a rodar e dirigir o site sozinho. O `driver.mjs` sobe o vite e controla um navegador de verdade: `smoke` (boot + regressões do editor #197), `shot` (screenshot de qualquer rota) e `eval` (roda JS dentro da página). Verificado de ponta a ponta neste container.
- 🛡️ **`codeql.yml` + `workflow_dispatch`**: os commits automáticos do câmbio não disparam CodeQL (push de bot), então a main fica sem análise e o check dos PRs seguintes marca alerta **antigo** como "novo" (foi o que aconteceu no PR #199). Agora dá pra re-analisar a main manualmente na aba Actions.

### Editor de Código consertado + autocomplete estilo VS Code (#197)
- 🐛 **Highlight quebrado corrigido**: o realce de sintaxe estourava em qualquer código Java/JS com números — o regex de keywords casava com o `class=` do HTML que o próprio highlighter gerava (por isso o código aparecia todo de uma cor só no print do issue). `syntax-highlight.js` foi reescrito como **tokenizador de passada única**: nunca re-escaneia HTML gerado, então números, strings, comentários e keywords saem sempre certos.
- ⌨️ **Autocomplete IntelliSense** (`editor-autocomplete.js` novo): dropdown perto do cursor enquanto digita, com **snippets** (gatilhos rápidos tipo VS Code/IntelliJ: `psvm`, `sout`, `fori` no Java; `log`, `func`, `fetch` no JS; `ifmain` no Python; `html5`, `flexcenter`…), **keywords** da linguagem e **palavras do próprio arquivo**. `↑↓` navega · `Tab`/`Enter` aceita · `Esc` fecha · `Ctrl+Espaço` abre manual. Snippets multi-linha respeitam a indentação e deixam o cursor no `$0`. Novos gatilhos: é só editar `src/data/editor-snippets.js`.
- 🎨 Chamadas de função ganharam cor própria (`tk--func`, verde), como no VS Code.
- ✅ Testado de ponta a ponta no navegador (Playwright): highlight íntegro, `psvm`/`sout` expandindo e cursor caindo dentro dos parênteses.
- 🛡️ Backup: `backup/2026-06-11-pre-merge-editor`.

## 2026-06-10

### #186 (fase 4): documentação do bootstrap + contagem dinâmica de rotas
- 💬 `main.js`: cabeçalho reescrito como guia (fluxo do boot + como adicionar uma rota com `lazy()`); `icons.js`: instruções de como adicionar um ícone. Comentários defasados ("31/46 rotas") removidos.
- 🔢 `router.count()` novo: o console do boot agora mostra o número **real** de rotas (dinâmico — nunca mais desatualiza).

### Coleta bruta (#190/#191) + sem agente do Google + CodeQL (#192)
- 🥩 **Coleta de dados BRUTA** (pedido do operador no #190): a captura automática agora guarda **tudo, integral e sem filtros** — sem filtro de saudação/tamanho, sem remover blocos de código, preservando quebras de linha; pergunta, resposta e deliberações do Conselho inteiras (teto de segurança de 4000 chars/memória e 2000 memórias locais — o histórico completo segue no repositório).
- 🛑 **Agente do Google Docs desligado**: o cron de 12h do `sync-cronicas.yml` foi removido a pedido — a sincronização das Crônicas agora é **só manual** (botão "Run workflow" na aba Actions).
- 🛡️ **CodeQL** (`.github/workflows/codeql.yml`, issue #192): análise de segurança do GitHub para o JS do site e o Python do `api/`, em todo push/PR no main (único template aplicável da lista — os de deploy não servem, o site deploya na Vercel).
- 🛡️ Backup: `backup/2026-06-10-pre-merge-bruto`.

## 2026-06-08

### Banco de Dados visível na Memória (#190)
- 🗄️ `/memoria` ganhou a visão **Banco de Dados (repo)**: detalhamento das memórias **por origem** (conversa/resposta/conselho/…) + links direto pro **`banco.json`** e pros **commits** da branch `jarvis-memory` no GitHub — pra ver o **"1 commit por pergunta"** acontecendo. O núcleo do #190 (salvar pergunta+resposta no repo, compartilhado/retroalimentado, lido por todas as IAs/Cérebro/Raio-X) já existia.

### #186 (fase 3): documentação do layout + storage
- 💬 Comentei a camada de **layout**: `shell.renderPage` (o ponto único de troca de tela — pipeline mount → nav → título → estado), `sidebar.NAV_GROUPS` (passo a passo de como adicionar um item ao menu) e `navItem`; + nota no `storage.js` sobre o fallback em memória (modo privado). Núcleo + roteador + layout agora documentados; #186 segue aberto (páginas/utils nas próximas fases).

### #186 (fase 2): documentação do núcleo
- 💬 Comentei a fundo os módulos-núcleo que todo contribuidor usa primeiro: `h()` em `helpers.js` (chaves especiais `className`/`style`/`dataset`/`on*`/`html` + cada ramo do corpo), o event bus (`events.js`: retorno de cancelamento + isolamento de erros no `emit`) e o store (`state.js`: corrigido o cabeçalho — é merge raso + listeners, não Proxy). Issue #186 segue aberto (próximas fases: páginas/utils).

### Mural — rede social leve (#187) + docs do roteador (#186)
- 📣 **Mural** (`/mural`, issue #187): rede social leve — recados salvos no localStorage **e** commitados no repositório (`mural/posts.json` via `api/social.py`, branch `jarvis-memory`), então ficam **compartilhados e versionados**, sem backend/login. Sem `GITHUB_TOKEN`, fica só local (single-device).
- 💬 **#186 (fase):** comentários explicativos no `router.js` (compile/match). O core já tinha cabeçalhos JSDoc; o guia para contribuidores está em `CONTRIBUTING.md`.
- 🛡️ Backup: `backup/2026-06-08-pre-merge-mural`.

### Git Nexus ao vivo (#189) + Guia de contribuição (#186)
- 🗺️ **Raio-X — Git Nexus ao vivo** (`/codigo`, issue #189): botão que lê o repositório **inteiro agora** pela API do GitHub (não o `codemap` pré-gerado) — métricas ao vivo + todos os arquivos por pasta, marcando os novos (🆕). Sem token (API pública).
- 💬 **`CONTRIBUTING.md`** (issue #186, fase 1): guia de arquitetura e convenções para futuros contribuidores (pastas, helpers, como adicionar página, sistema de IA, envs, fluxo de git). O código já tem cabeçalhos JSDoc; comentários por módulo seguem em fases.
- 🛡️ Backup: `backup/2026-06-08-pre-merge-nexus`.

### Álbuns Musicais (#185)
- 💿 **Álbuns** na Música (`/musicas`, issue #185): seção data-driven (`src/data/albuns.js`) com cartões de álbum (capa + artista + ano + faixas); clicar numa faixa toca o player embutido (Spotify/SoundCloud). Exemplo incluso ("Hinos do Imperador" W40K, com a capa que o operador enviou).
- 🛡️ Backup: `backup/2026-06-08-pre-merge-albuns`.

### Conselho: Hermes sintetiza + Fontes de Detecção no radar (#183)
- ⚖️ **Conselho de IAs:** o **Hermes** vira o **moderador** que dá a resposta final (navegador → servidor); o **Gemini** passa a ser só reserva (ele estourava o limite de tokens). Membro que cai por limite mostra "⚠ Limite de tokens atingido" (não o 429 cru) e o moderador avisa isso no consenso. A página mostra por quem o consenso foi sintetizado.
- 📡 **Radar — Fontes de Detecção** (`/radar`, issue #183): painel de fusão multi-sensor ligando as fontes reais que o site já tem (`/visao`, `/geo`, `/ciberseg`, `/triangulacao`, satélites) — o radar não depende de antena dedicada.
- 🛡️ Backup: `backup/2026-06-08-pre-merge-conselho-hermes`.

### Música: "Suas Faixas" por URL (#184) + #182 já estava feito
- ➕ **Suas Faixas** (`/musicas`, issue #184): adicione faixas do **Spotify ou SoundCloud** colando o link — salvas localmente (neste navegador), com player embutido e botão de remover. (Tocar Spotify completo só com Premium logado — limite do Spotify, não do site.)
- ✅ **#182** ("guardar memórias num repo, commit por dado, acessível por todas as IAs") já estava implementado: é a Memória versionada no repositório (`api/memory.py` + branch `jarvis-memory`). Fechado como concluído.
- 🛡️ Backup: `backup/2026-06-08-pre-merge-184`.

### Batalha Naval (#181) + Sobrepor em segundo plano
- 🚢 **Batalha Naval** (`/batalha-naval`): jogo clássico vs. computador — frota posicionada automaticamente, IA de "caça" (ao acertar mira nas células vizinhas), tabuleiros 10×10, afunde a frota inimiga antes que ela afunde a sua. Resolve o issue #181.
- 📌 **Sobrepor em segundo plano:** janelas sobrepostas com áudio/vídeo nativo agora usam a **Media Session API** → controles na tela de bloqueio e reprodução em segundo plano no celular (melhor ainda como PWA instalado). Players em iframe (SoundCloud) seguem a própria media session.
- 🛡️ Backup: `backup/2026-06-08-pre-merge-batalha`.

### Sobrepor — janelas flutuantes que mantêm a página viva
- 📌 Botão **Sobrepor** no header: fixa a página atual numa **janela flutuante** (arrastável por mouse/toque, minimizável) que **sobrevive à navegação**. Assim o rádio/música continua tocando enquanto você lê a Biblioteca — tudo numa guia só. A página é movida para fora do `main` (mas dentro do `<body>`), então o roteador não a destrói. `src/layout/overlay.js` + `pinCurrentPage()` no shell.
- 🛡️ Backup: `backup/2026-06-08-pre-merge-sobrepor`.

### OpenClaw conectado ao JARVIS e ao Conselho
- 🐾 Conector **OpenClaw** (assistente self-hosted, igual ao modo Ollama): modo "OpenClaw" no JARVIS + **membro automático no Conselho** quando a URL é configurada. `processOpenClaw` com URL/endpoint configuráveis e parsing tolerante a vários formatos.
- 🔎 Honestidade: o gateway nativo do OpenClaw é **RPC** (não um chat-completions OpenAI); o conector espera um endpoint compatível — nativo ou via **bridge**. Setup e o caminho do bridge em `docs/OPENCLAW.md`.
- 🛡️ Backup: `backup/2026-06-08-pre-merge-openclaw`.

### Memória versionada no repositório (commit por pergunta)
- 🗄️ A memória do JARVIS pode ser guardada **dentro do repo**, na branch **`jarvis-memory`** (`memoria/banco.json`): toda memória nova vira um **commit**, e a IA **busca** nela antes de responder. `api/memory.py` (stdlib) commita/lê via API do GitHub; `jarvis-repo-memory.js` faz saves **serializados** e **gateados**; `jarvis-brain` mescla repo+local em recall, `/cerebro` e `/codigo`.
- Branch dedicada de propósito: **1 commit por pergunta NÃO redeploya** o site (que vive no `main`). Botão **☁️ Repo** em `/memoria`. Requer `GITHUB_TOKEN` (fine-grained PAT, Contents: write) — ver `docs/MEMORIA-REPO.md`.
- 🛡️ Backup: `backup/2026-06-08-pre-merge-memoria-repo`.

### Conselho de IAs grava tudo na memória
- ⚖️🧠 O **Conselho** (`/conselho`) agora grava na memória **a pergunta E as respostas geradas** — cada membro usável + o consenso (source `conselho`), ligados ao Segundo Cérebro e ao Raio-X. Antes só a pergunta e um resumo do tópico entravam.

### Hermes no servidor (Vercel → OpenRouter)
- 🧠 **`api/hermes.py`** (Vercel, só stdlib): proxy para o Nous Hermes via OpenRouter. Os pesos rodam no provedor (GPU); a Vercel intermedia e guarda a chave — igual ao `api/chat.py` com o Gemini. Funciona em **qualquer device, sem WebGPU**; até 70B/405B. (Rodar os pesos na própria Vercel não dá: serverless é CPU-only.)
- 🤖 Novo modo **"Hermes (servidor)"** no JARVIS + membro **automático** no Conselho de IAs (quando `OPENROUTER_API_KEY` estiver definida).
- 📄 `docs/HERMES-VERCEL.md` com o passo a passo (chave grátis em openrouter.ai/keys).
- 🛡️ Backup: `backup/2026-06-08-pre-merge-hermes-vercel`.

### Conselho de IAs + Hermes no navegador
- ⚖️ **Conselho de IAs** (`/conselho`): várias IAs respondem **juntas** (JARVIS Local + Gemini + modelo do Navegador/Hermes se carregado), todas com o **mesmo contexto compartilhado** (dossiê + memória durável + estado vivo do site); um moderador sintetiza o **consenso**, que volta para a memória — realiza "IAs trabalhando juntas" e "páginas conversando via memória".
- 🧠 **Nous Hermes no navegador:** Hermes 3 (3B/8B) e Hermes 2 Pro (Mistral 7B) no modo Navegador (WebLLM/WebGPU) — a IA da Hermes rodando 100% no site, offline após baixar. O agente hermes (skills auto-criadas) já rodava.
- 🛡️ Backup: `backup/2026-06-08-pre-merge-conselho`.

### Arsenal 2631 — infantaria moderna + classes navais
- ⚔️ **Arsenal 2468 → 2631 armas:** fabricantes de pistolas/fuzis modernos, fuzis de serviço da OTAN/regionais, snipers/SMG/MG modernos; classes navais (destróieres/fragatas/submarinos/anfíbios por nação); treinadores e helicópteros modernos; hipersônicos e drones de IA. Rumo a 3560.
- 🛡️ Backup: `backup/2026-06-08-pre-merge-arsenal2631`.

### Arsenal 2468 — leva histórica/regional
- ⚔️ **Arsenal 2189 → 2468 armas:** famílias da 1ª/2ª Guerra e Guerra Fria (fuzis de ferrolho/semiauto, SMG/MG históricas, AT clássicos; tanques pioneiros; artilharia histórica; caças a pistão/jato e plataformas derivadas de comerciais; couraçados/porta-aviões e combatentes modernos; bombas/mísseis guiados; UCAV/FPV). Rumo a 3560.
- 🛡️ Backup: `backup/2026-06-08-pre-merge-arsenal2468`.

### Arsenal 2189 + Gerador de Código conectado à memória
- ⚔️ **Arsenal 1393 → 2189 armas:** +2 levas de famílias reais no gerador (Infantaria 746 · Blindados 314 · Artilharia 118 · Aéreo 422 · Naval 155 · Mísseis 305 · Drones 129). Rumo a 3560 = continuar adicionando famílias.
- 🧬 **Gerador de Código × Memória:** ao gerar, o pedido vira memória durável (ligada ao Segundo Cérebro e ao Raio-X) — mesmo sistema do Terminal-IA (que já captura input + resposta da IA).
- 🛡️ Backup: `backup/2026-06-08-pre-merge-arsenal2189`.

### Lote de 5 frentes — memória da IA, PWA, Arsenal 1393, Sponsio, Gerador de Código
- 🧠 **Memória da resposta da IA:** o JARVIS memoriza também as próprias respostas (não só o que o operador escreve) — `captureReply` nos modos de IA e no Terminal-IA.
- 📱 **PWA mobile:** botão "Instalar app" (`src/utils/pwa.js`) — instala na tela inicial do celular; o service worker já faz cache offline real (o "sistema móvel").
- ⚔️ **Arsenal 671 → 1393:** +~140 famílias reais no gerador (`scripts/gen-arsenal.mjs`). Rumo a 3560 = continuar adicionando famílias.
- 🛡️ **Segurança do Agente (Sponsio):** `src/utils/jarvis-guard.js` vETA cada chamada de ferramenta do agente (safe/caution/block) antes de executar, bloqueia o perigoso e registra; página `/seguranca`.
- 🧬 **Gerador de Código** (`/gerar-codigo`): o site + a IA (Gemini) criam código a partir de um pedido, com realce e abrir no Editor.
- 🛡️ Backup: `backup/2026-06-08-pre-merge-lote5`.

### Auto-captura de conversas → memória viva (PR #179)
- 🧠 **`jarvis-brain.captureConversation()`**: toda mensagem do chat e do Terminal-IA vira memória durável (`source: conversa`/`terminal`), com filtro leve de ruído.
- 🔗 **`linkCode()`**: memórias se ligam também a arquivos do `codemap` → no **Raio-X** (`/codigo`) os arquivos comentados ganham halo roxo + contagem no tooltip.
- 🕸️ **Segundo Cérebro**: memórias entram como nós (cap nas 50 mais recentes para legibilidade).
- 📓 **`/memoria`**: badge de origem (manual / conversa / terminal) por memória.
- 🛡️ Backup: `backup/2026-06-08-pre-merge-autocaptura`.

### Terminal-IA — o "terminal do Claude Code" (PR #178)
- 💻 **`/terminal-ia`**: REPL com comandos `:go` (navega p/ qualquer página), `:mem` (memória durável), `:code` (codemap/Raio-X), `:chart` (gráficos), `:brain` (Segundo Cérebro), `:help`, `:clear` + histórico (↑↓).
- 🤖 Texto livre → JARVIS (Gemini) com briefing + memória no contexto; fallback determinístico no modo local. Reaproveita `jarvis-engine`, `jarvis-brain`, `site-capabilities` e `chart-engine` (zero duplicação).
- 🛡️ Backup: `backup/2026-06-08-pre-merge-terminal`.

### Memória durável do JARVIS (supermemory) — PR #177
- 🧠 **`src/utils/jarvis-brain.js`**: memória durável (localStorage) de fatos curados ("lembre que ..."), ligados automaticamente aos conceitos do Segundo Cérebro; `searchMemories`/`memoryContext`/`memoryStats` + `codeContext()` (resumo do `codemap` → JARVIS raciocina mais rápido sobre o próprio código).
- 📓 **`/memoria`**: ver/buscar/adicionar/apagar memórias, com chips dos conceitos ligados (clicáveis).
- 🤖 **JARVIS**: modo local grava/recupera por voz ("lembre que ...", "o que você sabe sobre ..."); modos de IA recebem memória + estrutura do código no contexto.
- 🕸️ **Segundo Cérebro**: memórias entram como **nós** (`tipo: memoria`) ligados aos seus conceitos — o cérebro cresce com a memória.
- 💻 `projetos/terminal-ia/`: base e plano prontos para o próximo front.
- 🛡️ Backup: `backup/2026-06-08-pre-merge-memoria`.

### Leitor OCR + Raio-X 3D + JARVIS consciente (issue #175) — PR #176
- 👁️ **Leitor OCR** (`/ocr`): extrai texto de imagens 100% no navegador (Tesseract.js via CDN) — upload, arrastar, colar (Ctrl+V) e câmera. Substitui o PaddleOCR.
- 🧊 **Raio-X do Código em 3D**: grafo force-directed agora em 3D (esfera de Fibonacci), projeção em perspectiva com auto-rotação + arraste para girar e profundidade real.
- 🤖 **JARVIS (issue #175):** passa a conhecer **cada página/ferramenta** do site via `src/data/site-capabilities.js` (derivado do menu — auto-atualizado), então a navegação local alcança qualquer rota; e agora **desenha gráficos** — modo local ("gráfico de barras: jan 10, fev 20") e modos de IA via bloco `chart` renderizado como imagem (motor de `/graficos`).
- 🛡️ Backup: `backup/2026-06-08-pre-merge-pr176`.

### Auto-análise + Segundo Cérebro + Arsenal 671
- ⚔ **Arsenal Expandido:** migrado para gerador de famílias-semente (`scripts/gen-arsenal.mjs` → `src/data/arsenal-expandido.json`), expandido de 140 para **671 armas** reais (Infantaria 273 · Blindados 105 · Artilharia 30 · Aéreo 125 · Naval 37 · Mísseis 68 · Drones 33).
- 🩻 **Raio-X do Código** (`/codigo`): auto-análise do próprio site — grafo força-dirigida de **158 arquivos, 39.121 linhas, 350 imports** (`scripts/gen-codemap.mjs` → `src/data/codemap.json`).
- 📁 **Aba Projetos** (`/projetos`): índice de tudo feito com o Claude Code (`src/data/projetos.json`) + convenção de pasta única `projetos/<nome>/`.
- 🧠 **Segundo Cérebro** (`/cerebro`): knowledge graph (29 nós, 41 conexões) ligando domínios ↔ projetos ↔ conceitos ↔ fontes; canvas interativo com clique-para-navegar (espírito GitNexus, 100% no navegador).
- 🛡️ Backup: `backup/2026-06-08-pre-merge-cerebro`.

## 2026-06-07

### PR #174 — Arsenal Expandido vira banco de dados (44 → 140 armas)
- ⚔ **Arsenal Expandido:** dados movidos para `src/data/arsenal-expandido-db.js` (banco extensível), expandidos de ~44 para **140 armas** reais.
- 🛩 Nova categoria **Drones**. Total: Infantaria 35 · Blindados 19 · Artilharia 13 · Aéreo 23 · Naval 16 · Mísseis 23 · Drones 11.
- 🛡️ Backup: `backup/2026-06-07-pre-merge-pr174`.

### PR #173 — +5 universos (21 skins) + Banco de dados e Enciclopédia Militar
- 🌌 **Universos:** +Monsterverse, Titanfall, God of War, Devil May Cry, Fate (16 → 21 skins).
- 🎖️ **Seção Militar:** novo banco de dados `src/data/militar-db.js` (13 categorias) + página `/enciclopedia-militar` navegável.
- 🛡️ Backup: `backup/2026-06-07-pre-merge-pr173`.

### PR #172 — JARVIS com IA real (Gemini) + Repaginação por Universos
- 🤖 **JARVIS** modo Servidor com **Gemini 2.5 Flash + busca no Google** (key server-side); dossiê do Baluarte injetado no contexto.
- 🌌 **Motor de Universos:** 16 skins completos (cor/tipografia/formas/atmosfera) com identidades autênticas das franquias.
- 🎯 Menu com **~65 ícones de linha** que herdam a cor do universo.
- 🛡️ Backups: `backup/2026-06-07-jarvis-universos-1/2/3`.

### PR #166 — JARVIS Skills + Dossiê + Radar do Câmbio + Música + fix cap 21
- 🧬 **JARVIS Skills auto-criadas** (sandbox de 3 camadas, persistência, UI).
- ▣ **Dossiê das Forças** (`/dossie`) gerado dos Google Docs.
- 💹 **Radar do Câmbio** (`/dolar`): Dólar/Euro/BTC, banco + relatórios a cada 12h.
- 🎵 **Música:** 30 faixas do SoundCloud com loop ao clicar.
- 🔧 **Crônicas:** Capítulo 21 de "A Névoa e o Aço".

### PRs #163 / #165 — Crônicas vivas + integrações
- 📖 Sincronização automática das **Crônicas** com os Google Docs (a cada 12h).
- 🔌 Doc de **integrações futuras** (hermes-agent, gemini-cli, radar).
