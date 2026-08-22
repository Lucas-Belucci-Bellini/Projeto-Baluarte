# MASTER EXECUTION MATRIX

**Status:** `CURRENT — RELEASE 1.2.6 PUBLISHED / LOGIN + AUTH ADAPTER TYPESCRIPT / SERVER-OBSERVATION HTTP READ-ONLY / JARVIS SPOTIFY PKCE + MARK XIII PLAYBACK PRESENCE / JARVIS LOCAL CONTEXT OPTIMIZATION / MODULE REGISTRY OPERATIONAL POLICY PILOT / BILLING FOUNDATION LOCAL / V2 DOCTOR EXPANDED / V1 FALLBACK`
**Data da observação:** 2026-08-22
**Repositório:** `Lucas-Belucci-Bellini/Projeto-Baluarte`
**Branch oficial:** `main`
**SHA observado na medição corrente:** `8ad3fdf220d101384ac41d561951979fe2fa6d46` (`feat(jarvis): guide spotify setup for users`)
**SHA funcional anterior:** `bcb246df` (`feat(jarvis): harden spotify pkce presence`)
**Reconciliação documental-base anterior:** `a3a88c04` (`docs(v2): reconcile spotify milestone matrices`)
**Tag de release base:** `v1.2.6`
**Autor:** Manus AI

> Esta matriz reconcilia o Master Super-Prompt Ω com #420, #422, #423, #430, #454 e o código observado. `COMPLETE` significa concluído dentro do escopo declarado; nunca significa que o domínio inteiro da V2 está pronto para produção.

## 1. Estados usados

| Estado | Significado |
|---|---|
| `COMPLETE` | Contrato, implementação, testes, documentação e verificação concluídos no escopo indicado. |
| `IN PROGRESS` | Há implementação ativa, mas dependências ou cobertura ainda faltam. |
| `VALIDATING` | A implementação existe e aguarda validação remota, staging, hardware ou evidência adicional. |
| `BLOCKED` | Uma dependência externa ou de segurança impede conclusão honesta. |
| `DEFERRED` | Existe no roadmap, mas não deve ser construído nesta fase. |
| `NOT STARTED` | Não há implementação relevante confirmada. |

## 2. Matriz corrente

| Phase | Title | Status | Dependencies | Risk | Tests / evidence | Security | Performance | Docs | Main SHA | Next |
|---|---|---|---|---|---|---|---|---|---|---|
| 00 | Audit, baseline and prompt reconciliation | `COMPLETE` no escopo documental | Código, issues, gates, release | Confundir histórico com estado atual | Release `v1.2.0`, 1085/1085 testes, 99/99 smoke, 21/21 integração, 15/15 caminho crítico, CI 8/8 | Bloqueios separados de cascatas | Warnings e ausência de budgets registrados | Gap, matrix e relatório Phase 00 refresh | `32b59ad5` | GEN-TS-002 audit |
| 01 | Governance and contracts | `IN PROGRESS` | V2 Rules, decision log, release plan | Documentação divergente | Gates e docs existentes | No secrets, deny-by-default | Medições exigidas antes de claims | README, rules, release plan | `32b59ad5` | Definition of Done / Contract Policy |
| 02 | Core / Boot / Runtime / Context | `IN PROGRESS` | Runtime, lifecycle, compatibility | Core crescer com lógica de produto | V2 integration 21/21; Runtime remoto verde | Runtime/session boundaries | Boot/runtime budgets pendentes | Core and phase docs | `32b59ad5` | Consolidar diagnósticos sem duplicação |
| 03 | Event Bus and Task Manager | `IN PROGRESS` | Core, lifecycle, observability | Eventos órfãos e retry inconsistente | Catálogo versionado; integração verde | Payloads e correlation | Latency budget não fechado | Event/runtime docs | `32b59ad5` | Health, correlation, retry and cancel contract |
| 04 | Module Registry / Dependencies / Isolation / Health | `IN PROGRESS` | Manifest, registry, permissions | Falha de módulo virar falha global | Pilotos e 21/21 integração | Quarantine e RBAC server-side incompletos | Startup/isolation sem benchmark completo | Module docs | `32b59ad5` | Piloto operacional autorizado |
| 05 | Data Layer | `IN PROGRESS` | Storage, schema, migrations | Acesso direto e classificação incompleta | Local storage/offline e generators verdes | Backup, retention e RLS pendentes | Latency/size budgets pendentes | Data docs | `32b59ad5` | Auditar GEN-TS-002 e persistence |
| 06 | Evidence / Wiki contracts | `IN PROGRESS` | Data, provenance, schemas | Dado externo tratado como fato | Fixtures, Arma 3 e contratos parciais | Source/license/revision required | Search/index budgets pendentes | Wiki and evidence docs | `32b59ad5` | Zomboid schema pilot |
| 07 | Real Persistence / Supabase / RLS | `BLOCKED` para produção; contrato local publicado | Staging, migrations, RPC, RLS, rollback | Ambiente errado ou write sem atomicidade | Auditoria RLS/staging, matriz local 7/7; sem write remoto autorizado | Security review obrigatória | Sem benchmark remoto | [`RLS_STAGING_AUDIT_2026-08-21.md`](./RLS_STAGING_AUDIT_2026-08-21.md), [`RLS_STAGING_AUTHORIZATION_CONTRACT_2026-08-21.md`](./RLS_STAGING_AUTHORIZATION_CONTRACT_2026-08-21.md) | `f3973ecc` | Aprovar custo/staging e executar RLS formal |
| 08 | Auth / Authorization / Tenancy | `IN PROGRESS` — formulário e fronteira do adapter tipados; release de identidade continua bloqueado | Login-cadastro, `auth-session.ts`, Supabase Auth, claims, RLS | 25 focais HTTP/server-validated/claims/Auth; 1235/1235 total; build, V2, Nexus e CI aplicáveis verdes | Server-side authority faltante; UI/adapter não decidem roles | Cliente HTTP read-only, refresh/redirect real, auditoria server-side e RLS remoto pendentes | [`SERVER_OBSERVATION_HTTP_AUDIT_2026-08-22.md`](./SERVER_OBSERVATION_HTTP_AUDIT_2026-08-22.md), [`SERVER_OBSERVATION_HTTP_CONTRACT_2026-08-22.md`](./SERVER_OBSERVATION_HTTP_CONTRACT_2026-08-22.md), [`SERVER_VALIDATED_SESSION_CONTRACT_2026-08-22.md`](./SERVER_VALIDATED_SESSION_CONTRACT_2026-08-22.md) | `9e2caca3` | Integrar o cliente read-only na UI com endpoint de ambiente controlado; nenhuma autorização client-side |
| 09 | Permissions / Module RBAC | `IN PROGRESS` | Auth, tenancy, registry | Admin/dev/owner falsificáveis no cliente | Concessão/revogação local e V2 gates | RLS/claims não comprovados | Sem RLS cost benchmark | Permission docs | `32b59ad5` | Contrato server-side |
| 10 | Billing Foundation / Entitlements / Usage | `IN PROGRESS` local; `BLOCKED` remoto | Data, tenancy, RLS, observability | Cobrança sem transação/reconciliação | `UsageLedger` append-only, idempotência, preflight local, `billing-mutation/v1`, 67/67 Billing tests, 1215/1215 total | Provider/write desligados; entitlement não concede autoridade | Sem provider cost benchmark | [`BILLING_FOUNDATION_AUDIT_2026-08-21.md`](./BILLING_FOUNDATION_AUDIT_2026-08-21.md), [`BILLING_FOUNDATION_CONTRACT_2026-08-21.md`](./BILLING_FOUNDATION_CONTRACT_2026-08-21.md) | `93e21960` | RLS/provider/staging aprovados separadamente |
| 11 | JARVIS Core / Tools / Memory / Knowledge | `IN PROGRESS` com visual lightweight, consumidor server-health read-only, transporte PlatformDiagnostic redigido, severidade/fallback, adaptador V2, política operacional por módulo read-only e budget de contexto | Core, evidence, permissions, rota `/jarvis`, Event Bus V1, PlatformDiagnostic read-only | Agente ganhar autoridade excessiva ou visual afirmar saúde sem evidência | Contexto, Spotify PKCE, presence, fakes, console Mark XIII, benchmark `jarvis:performance`, orçamento 72/40 partículas e stride adaptativo, projeção `nucleo:status`, health manual, `server-health/v1` em FastAPI/Vercel, envelope `platform-observation/v1` com TTL/redaction, `projectPlatformDiagnostic()`, `claims-observation/v1`, adaptador `server-claims/v1` FastAPI/Vercel com roles fechadas, TTL formal, least privilege, CORS por allowlist, rate limit process-local, auditoria redigida, envelope `server-observation/v1`, budget 12k/24 e 18k/32 para agentes, observação bounded, cache/seleção lazy de schemas | Opt-in, least privilege, roles/expiração server-side, claims formais, rate limit distribuído, RLS e auditoria operacional de produção pendentes | Hardware real lado a lado com OpenClaw, ponte autenticada para PlatformDiagnostic, prompt/tool/memory benchmark e latência real pendentes | JARVIS docs, [`JARVIS_MARK_XIII_INTEGRATED_VISUAL_2026-08-20.md`](./JARVIS_MARK_XIII_INTEGRATED_VISUAL_2026-08-20.md), [`JARVIS_MARK_XIII_PERFORMANCE_MATRIX_2026-08-20.md`](./JARVIS_MARK_XIII_PERFORMANCE_MATRIX_2026-08-20.md), [`JARVIS_MARK_XIII_RUNTIME_OBSERVATION_2026-08-20.md`](./JARVIS_MARK_XIII_RUNTIME_OBSERVATION_2026-08-20.md), [`JARVIS_SERVER_HEALTH_CONTRACT_2026-08-20.md`](./JARVIS_SERVER_HEALTH_CONTRACT_2026-08-20.md) e [`JARVIS_MARK_XIII_LIGHTWEIGHT_OPTIMIZATION_2026-08-20.md`](./JARVIS_MARK_XIII_LIGHTWEIGHT_OPTIMIZATION_2026-08-20.md) e [`JARVIS_LOCAL_OPTIMIZATION_AUDIT_2026-08-21.md`](./JARVIS_LOCAL_OPTIMIZATION_AUDIT_2026-08-21.md) e [`JARVIS_LOCAL_OPTIMIZATION_CONTRACT_2026-08-21.md`](./JARVIS_LOCAL_OPTIMIZATION_CONTRACT_2026-08-21.md) | `bcb246df` publicado; otimização local read-only, seleção lazy conservadora e Spotify PKCE read-only com presença Mark XIII | Tool registry, claims/RLS, assinatura/origem server-side, rate limit distribuído, auditoria operacional de produção, rollout controlado e benchmark em hardware real |
| 12 | Git Nexus / external integrations | `IN PROGRESS` arquitetural | Contracts, adapters, registry | Copiar internals e duplicar graph/memory | Nexus e adapters atuais | Permission/health/license registry pendente | Impact/search benchmark pendente | Nexus docs | `32b59ad5` | Project Registry |
| 13 | Arma 3 / Zomboid / content platform | `IN PROGRESS` | Wiki schema, evidence, assets | Conteúdo sem fonte/licença | Páginas, fixtures e data gates parciais | License, provenance, controlled export | Index/search budgets pendentes | Wiki roadmap | `32b59ad5` | Um piloto modular |
| 14 | Desktop / filesystem / private runtimes | `VALIDATING` parcialmente; escrita `DEFERRED` | Launcher, sandbox, IPC, runtimes | Acesso local indevido | Web build; sem aceite físico completo | Read-only primeiro, sandbox e allowlist | App-heavy budgets pendentes | Desktop docs | `32b59ad5` | Desktop acceptance |
| 15 | Mobile / PWA / app prototype | `VALIDATING` parcialmente | Capacitor, Android/iOS, permissions | Inferir aceite físico do smoke web | PWA/SW e web gates; hardware não validado | Device permission review pendente | Low-end/battery tests pendentes | Mobile roadmap | `32b59ad5` | Aceite Android/iOS aplicável |
| 16 | AEGIS Ocean governance | `COMPLETE` como restrição documental; produto `PLANNED` | Data classification, provenance, RLS | Dual-use e export indevido | Regra registrada em #454 | Sem targeting/interception/covert surveillance | Scientific workloads ainda não medidos | AEGIS governance docs | `32b59ad5` | Project/data registry |
| 17 | Observability / incidents / recovery | `IN PROGRESS` | Logs, metrics, health, backup | Falha sem dono ou sem retorno | Health diagnostics e daily reports | Audit/retention incompletos | RPO/RTO e drill ausentes | Ops docs | `32b59ad5` | Backup/restore drill |
| 18 | Security supply chain / CI specialists | `IN PROGRESS` | JS, Rust, Python, SQL, YAML specialists | Verde por omissão ou ambiente | CI 8/8, types, CodeQL; runtime local known-blocked | SBOM/license/dependency matrix incompleta | CI/build budgets pendentes | CI audit docs | `32b59ad5` | GEN-TS-002 and verify:v2 |
| 19 | Analytics / privacy / export / deletion | `NOT STARTED` ou parcial | Auth, data classification, consent | Coleta excessiva/admin client-side | Sem matriz completa de dados | LGPD mechanisms incomplete | Telemetry budget absent | Privacy docs | — | Data inventory first |
| 20 | Marketplace / plugins / third-party registry | `DEFERRED` | Module system, sandbox, licenses, billing | Supply-chain and permission risk | No production marketplace evidence | Manifest, sandbox, audit required | Scale/cost unknown | Future roadmap | — | Only after Module System |
| 21 | Performance / accessibility / UX audit | `IN PROGRESS` parcial | All surfaces | Claiming light/fast without measurement | Harness UI keyboard/focus/reduced-motion matrix; JARVIS benchmark; adaptive particles/FPS; smoke/path critical | Reduced motion and adaptive visual budget implemented locally; server-side accessibility evidence absent | Hardware matrix, boot, route, DB, JARVIS and mobile budgets incomplete | Design docs, [`COMMAND_CENTER_A11Y_MATRIX_2026-08-20.md`](./COMMAND_CENTER_A11Y_MATRIX_2026-08-20.md) e [`JARVIS_MARK_XIII_PERFORMANCE_MATRIX_2026-08-20.md`](./JARVIS_MARK_XIII_PERFORMANCE_MATRIX_2026-08-20.md) | `50891ae2` publicado | Observability and measured matrix |
| 22 | Release / environments / rollback | `COMPLETE` for 1.2.6 scope | CI, changelog, SW, tags, desktop artifacts | Release without recovery evidence | v1.2.6 tag, notes, 8/8 assets HTTP 200, workflow 32405066321 | No secrets; rollback to v1.2.5 documented | Artifact/bundle warnings known | Changelog and release plan | `e3dcf5b8` | Asset checksums in v1.2.6 report |
| 23 | Full doctor / verify:v2 / setup:v2 | `IN PROGRESS — local catalog published` | All real gates and environment contracts | One command hides unknown states | 21-record catalog; 15 green, 1 blocked-known, 5 not-run, 0 failed/unknown | Must preserve unknown/blocked | Runtime/remote distinctions required | [`V2_DOCTOR_CONTRACT_2026-08-21.md`](./V2_DOCTOR_CONTRACT_2026-08-21.md) | `0f9922bf` | Reconcile remote evidence and setup contracts |
| UI | Baluarte Design System & Information Architecture | `IN PROGRESS — COMMAND CENTER A11Y + JARVIS MARK XIII / MODULE REGISTRY POLICY / V1 FALLBACK` | Module Manifest, Registry, layout, router, permissions, health, deep links, fallback, rollback, claims, command descriptors | Public promotion without server-side authority, a second shell/sidebar or a visual claim without health evidence | UI-01/UI-02/UI-03/UI-04 docs; `MODULE_ALIGNMENT_PILOT_2026-08-20.md`; `SINGLE_SURFACE_EDITOR_PILOT_2026-08-20.md`; `PROMOTION_GATE_EDITOR_2026-08-20.md`; `COMMAND_CENTER_NAVIGATION_CONTRACT_2026-08-20.md`; `COMMAND_CENTER_VISUAL_HARNESS_PILOT_2026-08-20.md`; `COMMAND_CENTER_A11Y_MATRIX_2026-08-20.md`; `MODULE_OBSERVATION_VISUAL_CONTRACT_2026-08-21.md`; `CONTROLLED_ROLLOUT_EVIDENCE_CONTRACT_2026-08-21.md`; `MODULE_REGISTRY_PILOT_CONTRACT_2026-08-21.md`; `RLS_STAGING_AUTHORIZATION_CONTRACT_2026-08-21.md`; 16/16 UI tests; 45/45 V2 integration; 7/7 RLS local | Server-side claims and audit required; stability is not health; no client-only roles; visual pilot, module observation and keyboard matrix are harness-only | Keyboard, focus and reduced motion covered in harness; responsive, bundle, boot, DB and route budgets pending | PHASE UI and Command Center docs | `f3973ecc` publicado | Next: explicit staging approval; no remote DDL by inference |
| 24 | V2 RC / freeze / stable / observation | `DEFERRED` | Core, modules, data, auth, billing, security, recovery | Declaring complete too early | Criteria not satisfied | Sign-offs absent | Scalability not measured | Master Prompt | — | Only after blockers close |
| TS Pages | Page implementation stability | `COMPLETE — 0 canonical JS pages` | `src/pages`, wrappers, TypeScript strict, router and tests | Counting compatibility wrappers as unfinished pages or removing them too early | 123 TS implementations, 115 JS wrappers, 0 canonical JS, 1247/1247 tests | Integrations and full V2 maturity still have separate gates | Performance/accessibility budgets remain independent | [`PAGES_TS_STABILITY_AUDIT_2026-08-20.md`](./PAGES_TS_STABILITY_AUDIT_2026-08-20.md) | `8ad3fdf2` | Maintain wrappers until consumer audit; add new pages in TS |

## 3. Medição corrente — 8ad3fdf2

O relatório [`V2_PROGRESS_REPORT_2026-08-22.md`](./V2_PROGRESS_REPORT_2026-08-22.md) registra **57,3% de prontidão ponderada das 28 fases**, com a migração de páginas canônicas em 100%, 1247/1247 testes, 45/45 de integração V2, 99/99 de smoke, 15/15 de caminho crítico e 21 gates locais executáveis verdes. O CI remoto aplicável do SHA observado ficou verde; Supabase Preview permanece `unknown/external` por dependência externa e o Rust local permanece `blocked-known` por toolchain.

A leitura correta é: fundação avançada, Alpha de frontend tecnicamente próxima, Beta ainda dependente de Data/Evidence e autoridade server-side, RC ainda não iniciado e V2 estável ainda não declarada. Os 115 arquivos `.js` de `src/pages/` são wrappers de compatibilidade, não páginas canônicas pendentes.

## 4. Próxima fase válida

O marco `JARVIS Mark XIII Integrated Visual` passou a montar um console funcional na rota real `/jarvis`, com canvas reativo, telemetria, temas, presença Spotify e limpeza do loop, preservando o chat, a memória, os modos e o MPA V7 standalone. O marco `JARVIS Mark XIII Performance Matrix` adicionou benchmark oficial, medição de FPS, detecção de baixa memória, degradação de partículas/conexões e respeito a `prefers-reduced-motion`, sem converter sinais visuais em autoridade de health. A matriz `JARVIS Mark XIII Runtime Observation` adiciona a projeção do evento V1 `nucleo:status` e do health check manual, mantendo `runtimeAuthority=not-authorized` e o fallback visual pendente quando não existe evidência. O adaptador `src/layout/runtime-observation.ts` projeta o `PlatformDiagnostic` da V2 com a mesma semântica, severidade e fallback read-only, e o harness valida a integração em `33/33`, sem alterar autorização. O contrato não executa fallback operacional e aguarda claims server-side para qualquer decisão de disponibilidade. O contrato `server-health/v1` em `backend/health_contract.py` e `api/health.py` adiciona liveness/prontidão do backend com paridade testada, mas permanece separado do `PlatformDiagnostic` até existir uma ponte autenticada. O console Mark XIII foi reduzido para 72/40 partículas e stride adaptativo; o benchmark do sandbox passou de 18,96 para 20,18 FPS, sem redução de DOM, canvas ou heap medida. O envelope `platform-observation/v1` adiciona TTL máximo de 60 segundos, redaction explícita, resumo mínimo, origem fixa, nonce, digest SHA-256 e verificação anti-replay ao harness V2; a integração passou de 33/33 para 36/36 sem alterar autorização. O contrato `claims-observation/v1` observa issuer, subject, audience, origem, escopos e frescor, mas sempre retorna `decision: not-authorized`; a integração passou a 39/39 sem alterar Auth, RLS ou Permission Manager. O adaptador `server-claims/v1` consulta Supabase Auth `/user` somente com configuração server-side, redige token/metadata, nega sem Bearer/configuração e mantém escopos vazios nesse caminho até existir expiração verificável. O caminho separado `project_verified_supabase_payload()` aceita somente payload previamente verificado por biblioteca/JWKS confiável, aplica TTL e catálogo fechado de roles sem conceder autoridade; a implementação está documentada em [`SERVER_CLAIMS_ADAPTER_CONTRACT_2026-08-21.md`](./SERVER_CLAIMS_ADAPTER_CONTRACT_2026-08-21.md). A auditoria **PHASE UI / UI-00** foi concluída em modo somente leitura. `UI-01` a `UI-04`, o piloto por módulo, o piloto individual do editor, o gate de promoção, o contrato Command Center, o protótipo visual isolado e a matriz de teclado/foco/reduced motion adicionaram projeções, observação read-only, busca derivada, categorias, recolhimento acessível e decisão auditável por health/deep link/fallback/claims/rollback, com 16/16 testes UI e 32/32 no harness V2, sem substituir shell, router ou sidebar. O slice de hardening de transporte adiciona allowlist CORS sem wildcard, rate limit process-local com 429 redigido e auditoria categórica sem token, subject, IP ou metadata; RLS e limitação distribuída permanecem fora deste escopo. O envelope `server-observation/v1` compõe health e claims redigidos, reason codes bounded e fallback projetado sem executar fallback, com consumidor TypeScript read-only; foi publicado no SHA `86e865243719704a186f39d96e395a7f493fc2f6` com oito workflows remotos verdes. O piloto `module-observation-visual` transforma a evidência em disponibilidade visual conservadora (`enabled`/`degraded`), preserva `v1-preserved`, expõe a superfície somente no harness e mantém `publicPromotionAllowed: false`; a integração passou a `41/41` no merge `b8e5e767`. O adaptador `controlled-rollout-evidence` exige observação pronta, autoridade `server-claims` válida e rollback reversível para classificar uma futura operação como elegível, mas mantém `normalUserAction: preserve-current-surface` e `publicPromotionAllowed: false`; a integração passou a `43/43` no SHA `ceac89fa` e os oito workflows remotos ficaram verdes. O marco `rls-local-contract` adicionou uma política local deny-by-default, testes 7/7 para identidade, tenancy, expiração, roles e service-role, a auditoria [`RLS_STAGING_AUDIT_2026-08-21.md`](./RLS_STAGING_AUDIT_2026-08-21.md) e o contrato [`RLS_STAGING_AUTHORIZATION_CONTRACT_2026-08-21.md`](./RLS_STAGING_AUTHORIZATION_CONTRACT_2026-08-21.md), sem migrations SQL, branch de staging, DDL ou escrita remota. O marco `v2-doctor-expanded`, publicado no SHA `0f9922bf`, expandiu o `verify:v2` para 21 registros bounded: 15 checks locais executados com sucesso, Rust como `blocked-known` pela limitação Cargo 1.75.0/`edition2024` e cinco gates classificados `not-run` por política de segurança, sem executar build/harness/smoke/caminho crítico/Python compile novamente dentro do doctor. O catálogo, o contrato e os quatro testes do doctor estão publicados; o runner oficial continua sendo a autoridade para gates completos, e nenhum estado não verde foi mascarado. O marco `billing-foundation-local`, publicado no SHA `93e21960`, formalizou o preflight local de entitlement/limite, adicionou `appendUsageWithPreflight()` sob o mutex existente e expôs a observabilidade `billing-mutation/v1` sem identificadores. O método legado permaneceu compatível; a suíte Billing passou em 67/67 e a regressão geral em 1166/1166. Nenhum provider, webhook, staging, Supabase ou DDL foi tocado. O marco `module-registry-operational-policy`, publicado no SHA `e8da0473`, adicionou um adapter TypeScript read-only para projetar botão `enabled/disabled`, quarentena, maintenance, disabled, fallback V1 e revisão elevada somente observável via scope `module:read` fresco e server-validated. O harness e o gate passaram a 45/45, a suíte geral a 1172/1172 e nenhum shell/router/Auth/RLS foi alterado. O marco `jarvis-local-context-optimization`, publicado no SHA `1f47f0c4`, conectou o budget real ao envio da página, limitou contexto a 12k/24 ou 18k/32 para agentes, registrou observação local bounded e adicionou cache/seleção lazy de schemas sem alterar `runTool()`. O benchmark lógico determinístico apontou reduções de 83,62% no contexto padrão, 75,44% no budget de agente e 61,54% nos schemas focados de Arsenal; a regressão passou em 1179/1179 e o runner oficial deixou Rust isolado como bloqueio conhecido.

A release `1.2.6` foi publicada com o visual JARVIS Núcleo V7 e oito assets desktop verificados. A auditoria [`PAGES_TS_STABILITY_AUDIT_2026-08-20.md`](./PAGES_TS_STABILITY_AUDIT_2026-08-20.md) confirmou zero páginas JavaScript canônicas: os 115 arquivos `.js` restantes são wrappers de compatibilidade para 123 implementações TypeScript. O Command Center continua read-only e deve reutilizar o Module Manifest, o router e o Event Bus existentes, manter `ShellRefs` e o fallback V1, não ativar Auth/RLS ou Billing remoto por inferência e não criar um catálogo paralelo de comandos. O editor permanece bloqueado até que health, claims, deep link, observabilidade, auditoria e rollback estejam validados em conjunto.

## 4. Checkpoint de Auth/Login TypeScript — b48c94e3

O marco `login-typescript-contract` foi publicado diretamente na `main` no SHA `b48c94e3887887e4ed1b328fbd2d297364bef336`. A implementação canônica `src/pages/login.ts` agora usa o contrato puro `src/security/auth-form-contract.ts` para validação local de e-mail, senha e confirmação, e normaliza erros do adapter sem expor provider, token, prompt ou segredo. O adapter remoto `src/core/supabase-auth.js`, Supabase, RLS, claims e DDL não foram alterados.

| Evidência | Resultado |
|---|---:|
| `npm run tipos:ts` | Passou |
| `npm run tipos:v2` | Passou |
| `npm test` | 1208/1208 |
| `npm run v2:integracao` | 45/45 |
| `npm run smoke` | 99/99 |
| `npm run caminho-critico` | 15/15 |
| Runner local hardening | Todos os gates aplicáveis passaram; Rust `blocked-known`, código 101 |
| Workflows remotos no SHA | 8/8 verdes: V2 Core, V2 Runtime, V2 Validation, CI, Core CI, Arma 3 Data CI, Vigia das rotas e CodeQL |

O próximo marco é tipar o adapter Auth e projetar a sessão com fonte server-validated. Até lá, login/cadastro real continua dependente da configuração atual do provider, roles continuam em `app_metadata` server-side, `runtimeAuthority` permanece `not-authorized` e `publicPromotionAllowed` permanece `false`.

## 5. Checkpoint de Auth Adapter TypeScript — 843c3d86

O marco `auth-adapter-typescript/v1` foi publicado diretamente na `main` no SHA `843c3d866aff60c692c28d5296861f272188212a`. `src/core/auth-session.ts` projeta respostas completas, storage e refresh com tokens obrigatórios, TTL bounded e preservação do refresh token anterior. `src/core/supabase-auth.js` mantém a API V1, endpoints Supabase, chave `baluarte:auth:session`, OAuth, logout best-effort e import `.js`; o `.d.ts` agora expõe tipos reais para sessão, listener e usuário.

| Evidência | Resultado |
|---|---:|
| `npm run tipos:ts` | Passou |
| `npm run tipos:v2` | Passou |
| Testes focais Auth/session/login | 32/32 |
| `npm test` | 1215/1215 |
| `npm run build` | Passou; warnings conhecidos de chunks grandes |
| `npm run v2:integracao` | Passou |
| `npm run smoke` / `npm run caminho-critico` | 99/99 / 15/15 |
| Runner local hardening | Gates aplicáveis verdes; Rust `blocked-known`, código 101 |
| Workflows remotos no SHA | 9/9 verdes, incluindo Security Contracts |

Nenhum provider remoto, RLS, migration, DDL, JWT verification local, role client-side, OpenClaw ou secret foi alterado. O próximo passo é uma sessão server-validated separada; `runtimeAuthority` permanece `not-authorized` e `publicPromotionAllowed` permanece `false`.

## Checkpoint de sessão server-validated — 9bb3d440

O marco `server-validated-session/v1` publicou uma projeção TypeScript pura sobre o envelope existente `server-observation/v1`. A saída é bounded e read-only: distingue `authenticated`, `anonymous`, `stale`, `degraded` e `unavailable`, filtra escopos ao catálogo conhecido e mantém `authority: not-authorized` e `publicPromotionAllowed: false`. Os wrappers `src/layout/server-claims-observation.js` e `src/layout/server-observation.js` preservam a única implementação canônica TypeScript e resolvem o carregamento ESM do workflow Security Contracts.

| Evidência | Resultado |
|---|---:|
| `npm run tipos:ts` / `tipos:v2` | Passou |
| Testes focais server session + claims + observation + identity | 23/23 |
| `npm test` | 1228/1228 |
| Runner oficial | Gates aplicáveis verdes; Rust código 101 `blocked-known` |
| CI remoto do marco | 8/8 workflows verdes após correção de resolução Node |

A primeira execução do Security Contracts no SHA anterior falhou por `ERR_MODULE_NOT_FOUND` causado por import TypeScript sem extensão no Node nativo. A correção adicionou apenas wrappers `.js` explícitos, sem `allowJs`, sem relaxar strict e sem duplicar contratos. O marco não faz rede, não valida JWT no browser, não deriva role, não toca provider, não cria staging, não aplica DDL e não libera módulos. O próximo marco é um cliente HTTP read-only separado, com timeout, redaction, fake e teste de ausência de credencial; RLS remoto permanece bloqueado até aprovação explícita de staging/custo.

## Checkpoint de cliente HTTP server-observation — 9e2caca3

O marco `server-observation-http/v1` adicionou `src/security/server-observation-http.ts` para GET read-only aos endpoints existentes de observabilidade. A URL é explícita e validada; o timeout é bounded entre 100 ms e 10000 ms; token, request ID e origin são somente headers opcionais; respostas, mensagens de exceção e payloads externos não atravessam a fronteira. O cliente retorna somente resultado de transporte e a projeção `server-validated-session/v1`, mantendo `authority: not-authorized` e `publicPromotionAllowed: false`.

| Evidência | Resultado |
|---|---:|
| `npm run tipos:ts` / `tipos:v2` | Passou |
| Testes focais HTTP + server session + claims + observation + identity | 25/25 |
| `npm test` | 1235/1235 |
| Runner oficial | 21 gates aplicáveis verdes; Rust código 101 `blocked-known` |
| CI remoto do marco | 9/9 workflows verdes |

O cliente não faz retry, cache, storage, refresh, logout, DDL, RLS, chamada direta ao provider ou autorização de módulo. A primeira falha de resolução ESM da slice anterior foi coberta pelos wrappers `.js`; Security Contracts voltou a passar neste marco. O próximo passo é integrar a observação em uma superfície read-only com URL de ambiente controlado, sem transformar a observação em permissão.

## Checkpoint publicado — JARVIS Spotify PKCE + Mark XIII playback presence — bcb246df

O marco `jarvis-spotify-pkce-presence` foi publicado diretamente na `main` no SHA `bcb246df`. A reconciliação documental da matriz principal foi publicada no commit `a3a88c04`. O fluxo usa Authorization Code with PKCE/S256 para uma SPA, aceita apenas Client ID público validado, rejeita `localhost` em HTTP e mantém tokens exclusivamente em memória. O pending PKCE vive em `sessionStorage`, o Client ID público pode ser lembrado em `localStorage`, o callback rejeita `state` divergente e o retorno interno é sanitizado. O wrapper `.js` foi atualizado para preservar os exports públicos da implementação TypeScript e corrigir o bundle de produção.

O monitor consulta somente `GET /v1/me/player`, publica título/artista/posição/duração no registro único de presença musical e trata `204` como `unknown`. O Mark XIII reage com amplitude baixa a `playing`, indicação discreta a `paused` e estado neutro a `unknown`, sem capturar áudio, controlar playback ou alterar `runtimeAuthority`, que permanece `not-authorized`. A página mostra a Redirect URI exata calculada no navegador e explica que nenhum Client Secret é necessário no frontend.

| Evidência | Resultado |
|---|---:|
| `npm run tipos:ts` / `npm run tipos:v2` | Passou |
| Suíte focal Spotify + Mark XIII | 11/11 |
| `npm test` | Passou |
| `npm run build` | Passou; warnings conhecidos de chunks grandes |
| `npm run v2:integracao` / `npm run smoke` / `npm run caminho-critico` | Passou |
| Runner oficial local | Gates aplicáveis verdes; Rust código 101 `blocked-known` |
| CI remoto do SHA bcb246df | 10 checks concluídos com sucesso; rotas, build, JS/TS, Python, core, runtime, Arma 3 e Rust verdes |
| CI remoto do SHA a3a88c04 | 9/10 checks com sucesso; 1 falha no Supabase Preview, sem falha em código Spotify/JARVIS |
| Supabase Preview | Falhou externamente: `Remote migration versions not found in local migrations directory.`; sem DDL/migration remoto executado |

A conexão com a conta Spotify ainda é `VALIDATING`: o dashboard do provedor retornou erro externo em duas tentativas e não permitiu verificar o aplicativo, Client ID ou Redirect URI. Os documentos [`JARVIS_SPOTIFY_INTEGRATION_CONTRACT_2026-08-22.md`](./JARVIS_SPOTIFY_INTEGRATION_CONTRACT_2026-08-22.md), [`JARVIS_SPOTIFY_AUDIT_2026-08-22.md`](./JARVIS_SPOTIFY_AUDIT_2026-08-22.md) e [`SPOTIFY_DASHBOARD_UNAVAILABLE_2026-08-22.md`](./SPOTIFY_DASHBOARD_UNAVAILABLE_2026-08-22.md) registram os controles, o rollback e o próximo passo manual. O diagnóstico Supabase não pertence ao slice Spotify e exige auditoria/staging explícitos antes de qualquer mudança.

## 6. Definition of Done aplicada

Uma fase só pode ser marcada `COMPLETE` quando houver contrato, implementação no escopo, testes, security review, consideração de performance, documentação, ausência de hacks, commit no `main`, CI aplicável, verificação pós-publicação e SHA registrado. Um PR não é obrigatório neste projeto porque a regra operacional do proprietário é publicação direta no `main`; a verificação do `main` é obrigatória.

## Referências

[1]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/420 "Issue #420 — Fundação e transição"
[2]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/422 "Issue #422 — Wiki Project Zomboid"
[3]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/423 "Issue #423 — Plano Mestre V2"
[4]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/430 "Issue #430 — Especialistas e integrador"
[5]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/454 "Issue #454 — AEGIS Ocean"
[6]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/releases/tag/v1.2.0 "Release v1.2.0"
