# MASTER EXECUTION MATRIX

**Status:** `CURRENT — V2 ALPHA.21 TECHNICAL SLICE INTEGRATED / RELEASE DOCUMENTATION PENDING / TAG AND RELEASE PENDING / V1 FALLBACK`
**Data da observação:** 2026-08-27
**Repositório:** `Lucas-Belucci-Bellini/Projeto-Baluarte`
**Branch oficial:** `main`
**SHA observado na medição corrente:** `25cbc9f374e5ac658403f1e83a1b540d8d2f4798` (`fix(v2): serialize concurrent runtime restarts`)
**SHA funcional anterior:** `9ca947816378180b41d2fe2939e9e5b96ff796bd` (`feat(v2): preserve event metadata through module context`)
**Reconciliação documental-base anterior:** `f0a11e33` (`docs(v2): close alpha.20 release traceability`)
**Tag de release base:** `v2.0.0-alpha.20` — publicada como prerelease
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
| 03 | Event Bus and Task Manager | `IN PROGRESS` — correlação, causação e **health** entregues; cancelamento já existia no escalonador | Core, lifecycle, observability | Eventos órfãos e retry inconsistente | Catálogo versionado; integração verde; `bus-correlacao` 13/13; `bus-saude` 17/17 e `trabalho-saude` 11/11, com o veredito conservador cobrado por teste | Payloads, correlation e causation no envelope; cadeia no log de erro; falha de handler contada por evento; recusa da fila acumulada; saúde é observação e nunca autoridade | Latency budget não fechado | Event/runtime docs, [`EVENT_BUS_CORRELACAO_2026-08-24.md`](./EVENT_BUS_CORRELACAO_2026-08-24.md), [`EVENT_BUS_HEALTH_2026-08-24.md`](./EVENT_BUS_HEALTH_2026-08-24.md) | `7e3e4e51` | Retry contract — política de repetição por classe de evento ainda não decidida, e inventá-la seria criar requisito (#423 §3) |
| 04 | Module Registry / Dependencies / Isolation / Health | `IN PROGRESS` | Manifest, registry, permissions | Falha de módulo virar falha global | Pilotos e 21/21 integração | Quarantine e RBAC server-side incompletos | Startup/isolation sem benchmark completo | Module docs | `32b59ad5` | Piloto operacional autorizado |
| 05 | Data Layer | `IN PROGRESS` | Storage, schema, migrations | Acesso direto e classificação incompleta | Local storage/offline e generators verdes | Backup, retention e RLS pendentes | Latency/size budgets pendentes | Data docs | `32b59ad5` | Auditar GEN-TS-002 e persistence |
| 06 | Evidence / Wiki contracts | `IN PROGRESS` — auditoria estrutural publicada | Data, provenance, schemas | Dado externo tratado como fato | Catálogo Zomboid com 159 entradas, Evidence por Registry, summary por status, `reviewQueue` bounded, `retentionPreview` determinístico, `auditPreview` estrutural e integração 51/51 | Source/license/revision required; retenção operacional, ownership e revisão humana server-side ausentes | Search/index budgets pendentes | Wiki/Evidence docs e release 1.3.2 | `5d2142d7` | Retenção operacional, ownership e revisão humana |
| 07 | Real Persistence / Supabase / RLS | `BLOCKED` para produção; contrato local publicado | Staging, migrations, RPC, RLS, rollback | Ambiente errado ou write sem atomicidade | Auditoria RLS/staging, matriz local 7/7; sem write remoto autorizado | Security review obrigatória | Sem benchmark remoto | [`RLS_STAGING_AUDIT_2026-08-21.md`](./RLS_STAGING_AUDIT_2026-08-21.md), [`RLS_STAGING_AUTHORIZATION_CONTRACT_2026-08-21.md`](./RLS_STAGING_AUTHORIZATION_CONTRACT_2026-08-21.md) | `f3973ecc` | Aprovar custo/staging e executar RLS formal |
| 08 | Auth / Authorization / Tenancy | `IN PROGRESS` — formulário, adapter e cliente de observação read-only tipados; release de identidade continua bloqueado | Login-cadastro, `auth-session.ts`, Supabase Auth, claims, RLS | Cliente HTTP integrado ao modo Servidor/JARVIS; tipos TS, suíte geral, build, V2, smoke, caminho crítico e CI remoto aplicáveis verdes | Server-side authority faltante; UI/adapter não decidem roles | Refresh/redirect real, auditoria server-side e RLS remoto pendentes | [`SERVER_OBSERVATION_HTTP_AUDIT_2026-08-22.md`](./SERVER_OBSERVATION_HTTP_AUDIT_2026-08-22.md), [`SERVER_OBSERVATION_HTTP_CONTRACT_2026-08-22.md`](./SERVER_OBSERVATION_HTTP_CONTRACT_2026-08-22.md), [`SERVER_OBSERVATION_UI_CONTRACT_2026-08-25.md`](./SERVER_OBSERVATION_UI_CONTRACT_2026-08-25.md), [`SERVER_VALIDATED_SESSION_CONTRACT_2026-08-22.md`](./SERVER_VALIDATED_SESSION_CONTRACT_2026-08-22.md) | `v2/server-observation-ui` | Integrar refresh/redirect real em contrato separado; nenhuma autorização client-side |
| 09 | Permissions / Module RBAC | `IN PROGRESS` | Auth, tenancy, registry | Admin/dev/owner falsificáveis no cliente | Concessão/revogação local e V2 gates | RLS/claims não comprovados | Sem RLS cost benchmark | Permission docs | `32b59ad5` | Contrato server-side |
| 10 | Billing Foundation / Entitlements / Usage | `IN PROGRESS` local; `BLOCKED` remoto | Data, tenancy, RLS, observability | Cobrança sem transação/reconciliação | `UsageLedger` append-only, idempotência, preflight local, `billing-mutation/v1`, 67/67 Billing tests, 1215/1215 total | Provider/write desligados; entitlement não concede autoridade | Sem provider cost benchmark | [`BILLING_FOUNDATION_AUDIT_2026-08-21.md`](./BILLING_FOUNDATION_AUDIT_2026-08-21.md), [`BILLING_FOUNDATION_CONTRACT_2026-08-21.md`](./BILLING_FOUNDATION_CONTRACT_2026-08-21.md) | `93e21960` | RLS/provider/staging aprovados separadamente |
| 11 | JARVIS Core / Tools / Memory / Knowledge | `IN PROGRESS` com visual lightweight, consumidor server-health read-only, transporte PlatformDiagnostic redigido, severidade/fallback, adaptador V2, política operacional por módulo read-only e budget de contexto | Core, evidence, permissions, rota `/jarvis`, Event Bus V1, PlatformDiagnostic read-only | Agente ganhar autoridade excessiva ou visual afirmar saúde sem evidência | Contexto, Spotify PKCE, presence, fakes, console Mark XIII, benchmark `jarvis:performance`, orçamento 72/40 partículas e stride adaptativo, projeção `nucleo:status`, health manual, `server-health/v1` em FastAPI/Vercel, envelope `platform-observation/v1` com TTL/redaction, `projectPlatformDiagnostic()`, `claims-observation/v1`, adaptador `server-claims/v1` FastAPI/Vercel com roles fechadas, TTL formal, least privilege, CORS por allowlist, rate limit process-local, auditoria redigida, envelope `server-observation/v1`, budget 12k/24 e 18k/32 para agentes, observação bounded, cache/seleção lazy de schemas | Opt-in, least privilege, roles/expiração server-side, claims formais, rate limit distribuído, RLS e auditoria operacional de produção pendentes | Hardware real lado a lado com OpenClaw, ponte autenticada para PlatformDiagnostic, prompt/tool/memory benchmark e latência real pendentes | JARVIS docs, [`JARVIS_MARK_XIII_INTEGRATED_VISUAL_2026-08-20.md`](./JARVIS_MARK_XIII_INTEGRATED_VISUAL_2026-08-20.md), [`JARVIS_MARK_XIII_PERFORMANCE_MATRIX_2026-08-20.md`](./JARVIS_MARK_XIII_PERFORMANCE_MATRIX_2026-08-20.md), [`JARVIS_MARK_XIII_RUNTIME_OBSERVATION_2026-08-20.md`](./JARVIS_MARK_XIII_RUNTIME_OBSERVATION_2026-08-20.md), [`JARVIS_SERVER_HEALTH_CONTRACT_2026-08-20.md`](./JARVIS_SERVER_HEALTH_CONTRACT_2026-08-20.md) e [`JARVIS_MARK_XIII_LIGHTWEIGHT_OPTIMIZATION_2026-08-20.md`](./JARVIS_MARK_XIII_LIGHTWEIGHT_OPTIMIZATION_2026-08-20.md) e [`JARVIS_LOCAL_OPTIMIZATION_AUDIT_2026-08-21.md`](./JARVIS_LOCAL_OPTIMIZATION_AUDIT_2026-08-21.md) e [`JARVIS_LOCAL_OPTIMIZATION_CONTRACT_2026-08-21.md`](./JARVIS_LOCAL_OPTIMIZATION_CONTRACT_2026-08-21.md) | `bcb246df` publicado; otimização local read-only, seleção lazy conservadora e Spotify PKCE read-only com presença Mark XIII | Tool registry, claims/RLS, assinatura/origem server-side, rate limit distribuído, auditoria operacional de produção, rollout controlado e benchmark em hardware real |
| 12 | Git Nexus / external integrations | `IN PROGRESS` arquitetural | Contracts, adapters, registry | Copiar internals e duplicar graph/memory | Nexus e adapters atuais | Permission/health/license registry pendente | Impact/search benchmark pendente | Nexus docs | `32b59ad5` | Project Registry |
| 13 | Arma 3 / Zomboid / content platform | `IN PROGRESS` — auditoria Zomboid/Evidence publicada | Wiki schema, evidence, assets | Conteúdo sem fonte/licença | Wiki Arma 3 e inventário; schema Zomboid local, proveniência, Evidence, fila read-only, preview de retenção e auditoria estrutural | License, provenance, controlled export; retenção operacional, ownership e revisão humana server-side ausentes | Index/search budgets pendentes | Wiki roadmap e release 1.3.2 | `5d2142d7` | Retenção operacional, ownership e busca |
| 14 | Desktop / filesystem / private runtimes | `VALIDATING` parcialmente; escrita `DEFERRED` | Launcher, sandbox, IPC, runtimes | Acesso local indevido | Web build; sem aceite físico completo | Read-only primeiro, sandbox e allowlist | App-heavy budgets pendentes | Desktop docs | `32b59ad5` | Desktop acceptance |
| 15 | Mobile / PWA / app prototype | `VALIDATING` parcialmente | Capacitor, Android/iOS, permissions | Inferir aceite físico do smoke web | PWA/SW e web gates; hardware não validado | Device permission review pendente | Low-end/battery tests pendentes | Mobile roadmap | `32b59ad5` | Aceite Android/iOS aplicável |
| 16 | AEGIS Ocean governance | `COMPLETE` como restrição documental; produto `PLANNED` | Data classification, provenance, RLS | Dual-use e export indevido | Regra registrada em #454 | Sem targeting/interception/covert surveillance | Scientific workloads ainda não medidos | AEGIS governance docs | `32b59ad5` | Project/data registry |
| 17 | Observability / incidents / recovery | `IN PROGRESS` | Logs, metrics, health, backup | Falha sem dono ou sem retorno | Health diagnostics e daily reports | Audit/retention incompletos | RPO/RTO e drill ausentes | Ops docs | `32b59ad5` | Backup/restore drill |
| 18 | Security supply chain / CI specialists | `IN PROGRESS` | JS, Rust, Python, SQL, YAML specialists | Verde por omissão ou ambiente | CI 8/8, types, CodeQL; runtime local known-blocked | SBOM/license/dependency matrix incompleta | CI/build budgets pendentes | CI audit docs | `32b59ad5` | GEN-TS-002 and verify:v2 |
| 19 | Analytics / privacy / export / deletion | `NOT STARTED` ou parcial | Auth, data classification, consent | Coleta excessiva/admin client-side | Sem matriz completa de dados | LGPD mechanisms incomplete | Telemetry budget absent | Privacy docs | — | Data inventory first |
| 20 | Marketplace / plugins / third-party registry | `DEFERRED` | Module system, sandbox, licenses, billing | Supply-chain and permission risk | No production marketplace evidence | Manifest, sandbox, audit required | Scale/cost unknown | Future roadmap | — | Only after Module System |
| 21 | Performance / accessibility / UX audit | `IN PROGRESS` parcial | All surfaces | Claiming light/fast without measurement | Harness UI keyboard/focus/reduced-motion matrix; JARVIS benchmark; adaptive particles/FPS; smoke/path critical | Reduced motion and adaptive visual budget implemented locally; server-side accessibility evidence absent | Hardware matrix, boot, route, DB, JARVIS and mobile budgets incomplete | Design docs, [`COMMAND_CENTER_A11Y_MATRIX_2026-08-20.md`](./COMMAND_CENTER_A11Y_MATRIX_2026-08-20.md) e [`JARVIS_MARK_XIII_PERFORMANCE_MATRIX_2026-08-20.md`](./JARVIS_MARK_XIII_PERFORMANCE_MATRIX_2026-08-20.md) | `50891ae2` publicado | Observability and measured matrix |
| 22 | Release / environments / rollback | `COMPLETE` for 1.3.2 scope | CI, changelog, SW, tags, desktop artifacts | Release without recovery evidence | v1.3.2 and desktop-v1.3.2 tags, 8/8 assets HTTP 200, Desktop Release 32595313050; Rust local remains blocked-known | No secrets; rollback to v1.3.1 documented | Artifact/bundle warnings known | Changelog, release plan and v1.3.2 note | `5d2142d7` | Asset checksums and rollback evidence |
| 23 | Full doctor / verify:v2 / setup:v2 | `IN PROGRESS — local catalog published` | All real gates and environment contracts | One command hides unknown states | 23-record catalog; 15 green, 2 blocked-known, 1 unknown, 5 not-run, 0 failed | Must preserve unknown/blocked | Runtime/remote distinctions required | [`V2_DOCTOR_CONTRACT_2026-08-21.md`](./V2_DOCTOR_CONTRACT_2026-08-21.md) | `0f9922bf` | Reconcile remote evidence and setup contracts |
| UI | Baluarte Design System & Information Architecture | `IN PROGRESS — COMMAND CENTER A11Y + JARVIS MARK XIII / MODULE REGISTRY POLICY / V1 FALLBACK` | Module Manifest, Registry, layout, router, permissions, health, deep links, fallback, rollback, claims, command descriptors | Public promotion without server-side authority, a second shell/sidebar or a visual claim without health evidence | UI-01/UI-02/UI-03/UI-04 docs; `MODULE_ALIGNMENT_PILOT_2026-08-20.md`; `SINGLE_SURFACE_EDITOR_PILOT_2026-08-20.md`; `PROMOTION_GATE_EDITOR_2026-08-20.md`; `COMMAND_CENTER_NAVIGATION_CONTRACT_2026-08-20.md`; `COMMAND_CENTER_VISUAL_HARNESS_PILOT_2026-08-20.md`; `COMMAND_CENTER_A11Y_MATRIX_2026-08-20.md`; `MODULE_OBSERVATION_VISUAL_CONTRACT_2026-08-21.md`; `CONTROLLED_ROLLOUT_EVIDENCE_CONTRACT_2026-08-21.md`; `MODULE_REGISTRY_PILOT_CONTRACT_2026-08-21.md`; `RLS_STAGING_AUTHORIZATION_CONTRACT_2026-08-21.md`; 16/16 UI tests; 45/45 V2 integration; 7/7 RLS local | Server-side claims and audit required; stability is not health; no client-only roles; visual pilot, module observation and keyboard matrix are harness-only | Keyboard, focus and reduced motion covered in harness; responsive, bundle, boot, DB and route budgets pending | PHASE UI and Command Center docs | `f3973ecc` publicado | Next: explicit staging approval; no remote DDL by inference |
| 24 | V2 RC / freeze / stable / observation | `DEFERRED` | Core, modules, data, auth, billing, security, recovery | Declaring complete too early | Criteria not satisfied | Sign-offs absent | Scalability not measured | Master Prompt | — | Only after blockers close |
| TS Pages | Page implementation stability | `COMPLETE — 0 canonical JS pages` | `src/pages`, wrappers, TypeScript strict, router and tests | Counting compatibility wrappers as unfinished pages or removing them too early | 123 TS implementations, 115 JS wrappers, 0 canonical JS, 1256/1256 tests | Integrations and full V2 maturity still have separate gates | Performance/accessibility budgets remain independent | [`PAGES_TS_STABILITY_AUDIT_2026-08-20.md`](./PAGES_TS_STABILITY_AUDIT_2026-08-20.md) | `8ad3fdf2` | Maintain wrappers until consumer audit; add new pages in TS |

## 3. Medição corrente — 5d2142d7

O relatório [`V2_PROGRESS_REPORT_2026-08-22.md`](./V2_PROGRESS_REPORT_2026-08-22.md) mantém **57,3% de prontidão ponderada das 28 fases** — o percentual não foi recomputado neste slice — e registra a migração de páginas canônicas em 100%, 1258/1258 testes, 51/51 de integração V2, 99/99 de smoke, 15/15 de caminho crítico e 20 gates locais executáveis verdes. O CI remoto aplicável do SHA de versionamento ficou verde; a release `v1.3.2` tem oito assets e manifests verificados. Supabase Preview permanece `unknown/external` por dependência externa e o Rust local permanece `blocked-known` por toolchain.

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

## Checkpoint anterior — Briefing → Evidence local — 9c4a2bae

O primeiro vertical slice local foi ampliado com a ligação opcional do módulo Briefing à Evidence Layer compartilhada. A ingestão normaliza e deduplica candidatos, anexa evidência com fonte/URL/captura/confiança explícitas quando a capacidade está disponível, emite eventos bounded e preserva o funcionamento read-only quando Evidence não está configurado. O cleanup do `v2:integracao` agora aguarda o Vite terminar e aplica encerramento bounded, evitando que um processo stale contamine a execução seguinte.

Evidência observada no SHA anterior: `npm test` 1250/1250; `tipos:ts` e `tipos:v2` aprovados; `v2:integracao` 45/45; smoke 99/99; caminho crítico 15/15; runner local com 21 gates verdes, Rust 101 `blocked-known` e 0 falhas novas. Supabase Preview permaneceu `unknown/external` por divergência de versões de migrations, sem DDL, staging ou alteração remota. O marco foi local/read-only e não mudou `runtimeAuthority`, `publicPromotionAllowed`, Auth, RLS, Billing ou a V1.

## Checkpoint mais recente — Briefing → Evidence pelo Registry — 978e13e3

O manifesto do Briefing declara `references.modules: ['evidence']` e o lifecycle resolve `ctx.talvez('evidence', { versao: 1 })`, usando o resolvedor governado do Core. O harness registra seis módulos ativos; Evidence não possui rota, por isso a navegação continua com cinco entradas e as 19 rotas V1 permanecem intactas. A view do Briefing mostra o estado `Evidence local conectada` quando o vínculo está disponível. O teste focal passou 10/10, o runner oficial passou 21 gates e manteve apenas Rust local como `blocked-known` código 101. Os workflows remotos deste SHA terminaram verdes: CI, Core CI, V2 Core, V2 Validation, V2 Runtime, CodeQL, Arma 3 Data CI e Vigia das rotas. Nenhuma alteração Supabase, DDL, migration, RLS, Auth de produção, OpenClaw, WhatsApp ou ação externa de alto impacto foi executada.


## Checkpoint publicado — Wiki Zomboid schema pilot / Release 1.2.8 — 77dbfff1

O módulo `wiki-zomboid` foi adicionado ao Registry V2 como piloto local de schema e catálogo. A implementação canônica está em TypeScript (`v2/data/wiki-zomboid.ts`), com wrapper JavaScript preservado. O módulo usa o dataset curado local do Project Zomboid, valida Workshop ID e proveniência, não inventa `modId`/`spawnId` ausentes e resolve a Evidence Layer somente por `ctx.talvez('evidence', { versao: 1 })`.

O harness real passou a sete módulos, 20 rotas internas e seis itens de navegação. A V1 permanece intacta, com rotas públicas e wrappers preservados. O piloto é read-only, local e bounded; não ativa scraping, rede automática, persistência, Supabase, Auth, RLS, OpenClaw ou WhatsApp.

| Evidência | Resultado |
|---|---:|
| Teste focal Wiki Zomboid | 4/4 |
| `npm test` | 1254/1254 |
| `npm run tipos:ts` / `npm run tipos:v2` | Passaram |
| `npm run build` | Passou; warnings conhecidos de chunks grandes |
| `npm run v2:integracao` | 48/48 |
| `npm run smoke` / `npm run caminho-critico` | 99/99 / 15/15 |
| Runner oficial | 21 gates verdes; Rust local 101 `blocked-known` |
| CI remoto do commit | 8/8 workflows verdes |
| Release do app | `v1.2.8` publicada com assets Windows, Linux e macOS verificados |

O próximo passo continua condicionado a um segundo vertical slice que acrescente evidência de integração Data/Evidence sem inventar persistência remota. O drift de migrations do Supabase Preview, a autoridade server-side de produção, o aceite físico do app, a estabilização e os testes mensais continuam bloqueios documentados; nenhum foi mascarado por esta release.


## Checkpoint publicado — Evidence status observability / Release 1.2.9 — 55690622

O módulo `wiki-zomboid` passou a expor no resumo apenas contagens bounded por status da Evidence: `pending`, `verified`, `rejected` e `superseded`. A view informa quantidade de registros vinculados e pendentes, sem permitir alteração de status, sem expor conteúdo de claims e sem derivar autoridade client-side. O Registry, o Event Bus, o Storage local e a fronteira `ctx.talvez` existentes foram reutilizados; nenhum segundo barramento ou armazenamento foi criado.

| Evidência | Resultado |
|---|---:|
| Teste focal Wiki Zomboid | 4/4 |
| `npm test` | 1254/1254 |
| `npm run v2:integracao` | 48/48 |
| `npm run smoke` / `npm run caminho-critico` | 99/99 / 15/15 |
| Runner oficial | 21 gates verdes; Rust local 101 `blocked-known` |
| CI remoto do commit funcional | 8/8 workflows verdes |
| CI remoto do commit de versão | 8/8 workflows verdes |
| Desktop Release | Workflow `32586471279` verde em Windows, macOS ARM64 e Ubuntu |
| Release | `v1.2.9` e `desktop-v1.2.9` publicadas; instaladores HTTP 200 |

O marco não implementa revisão humana, roles administrativas no cliente, persistência remota ou RLS. O próximo passo permanece a política de retenção e revisão Data/Evidence local, seguida apenas de uma decisão separada sobre staging Supabase com aprovação explícita de custo e rollback.


## Checkpoint publicado — Evidence retention preview / Release 1.3.1 — 2026-08-22

O commit funcional `752206fb` adicionou `projectEvidenceRetention` ao contrato TypeScript e `retentionPreview(options)` ao módulo Evidence. O preview recebe `now` obrigatório, `maxAgeDays` padrão 30 com teto 3650 e `limit` padrão 25 com teto 100. Classifica itens como `within-window`, `past-window` ou `future-observed`, preserva a ordem append-only, congela a saída e retorna somente `id`, `moduleId`, `status`, `observedAt`, `ageDays` e `retention`, além de resumo bounded. Nenhum registro é apagado ou alterado.

A validação final passou teste focal Evidence `9/9`, suíte `1256/1256`, `tipos:ts`, `tipos:v2`, build com warning conhecido, integração V2 `50/50`, smoke `99/99` e caminho crítico `15/15`. A primeira execução do runner teve falso vermelho em `v2_integracao` porque foi chamada com `PORTA_V2=4195`, enquanto o runner limpa apenas 4193/4194 e acabou encontrando um servidor Vite stale. Após encerrar somente os processos Vite do harness e rerodar em 4193, o runner passou 20 gates com código 0; Rust permaneceu `blocked-known` código 101 pela incompatibilidade do Cargo local com `edition2024`.

O commit funcional `752206fb` e o commit de versionamento `9b734394` tiveram os oito workflows remotos aplicáveis verdes. As tags `v1.3.1` e `desktop-v1.3.1` apontam para `9b734394`. O Desktop Release `32592402608` passou em Windows, macOS ARM64 e Ubuntu. A release pública `v1.3.1` não é draft nem prerelease, possui oito assets, os manifests declaram `version: 1.3.1` e todos os downloads responderam HTTP 200. O Service Worker usa `baluarte-v1.3.1`.

O próximo passo continua sendo política de retenção operacional e auditoria de consumidor, sem descarte client-side, seguida somente de uma decisão separada sobre persistência Supabase/RLS com staging, custo, tenancy e rollback aprovados.


## Checkpoint publicado — Evidence audit preview / Release 1.3.2 — 2026-08-22

O commit funcional `dbd09f52` adicionou `projectEvidenceAudit` ao contrato TypeScript e `auditPreview(options?)` ao módulo Evidence. O retrato aceita chamada sem opções, filtra opcionalmente por `moduleId`, aplica limite padrão 25 e máximo 100, preserva a ordem append-only, congela a saída e retorna apenas estado estrutural. Cada registro contém `id`, `moduleId`, `status` e `observedAt`; o resumo contém `returned`, contagens de `pending`, `verified`, `rejected` e `superseded`, além de `truncated`. Nenhum conteúdo de claim, fonte, token, role, claim ou permissão é projetado.

A validação passou teste focal Evidence `11/11`, suíte `1258/1258`, `tipos:ts`, `tipos:v2`, build com warning conhecido, integração V2 `51/51`, smoke `99/99`, caminho crítico `15/15` e runner oficial com 20 gates código 0. Rust local permaneceu `blocked-known` código 101 pela incompatibilidade do Cargo com `edition2024`. Oito workflows remotos aplicáveis do commit funcional e do commit de versionamento terminaram verdes.

As tags `v1.3.2` e `desktop-v1.3.2` apontam para `5d2142d7`. O Desktop Release `32595313050` passou em Windows, macOS ARM64 e Ubuntu. A release pública `v1.3.2` não é draft nem prerelease, possui oito assets, os manifests declaram `version: 1.3.2` e todos os downloads responderam HTTP 200. O Service Worker usa `baluarte-v1.3.2`.

O próximo passo continua sendo definir retenção operacional e auditoria server-side com identidade, tenancy, ownership, concorrência, exportação e rollback. Este checkpoint não cria persistência remota, autorização client-side, auditoria operacional de produção ou UI de revisão.

## Checkpoint de medição — Event Bus latency budget — 2026-08-25

O script `scripts/event-bus-latency-benchmark.mjs`, disponível como `npm run bench:event-bus`, mede o caminho real de `criarBus().emit()` em três cargas de ouvintes, com aquecimento do JIT, validação de entrega e conferência de `bus.saude().latencia`. A execução registrada em [`EVENT_BUS_LATENCY_BENCHMARK_2026-08-25.md`](./EVENT_BUS_LATENCY_BENCHMARK_2026-08-25.md) observou 9,460–10,103 µs por despacho externo em 20.000 operações por cenário no sandbox Linux/Node 22.

A medição fecha uma evidência local de custo, mas não fecha threshold de produção, percentil, alerta, retry, backpressure, hardware de usuário ou disponibilidade operacional. O Event Bus permanece observação local, e a política de retry por classe de evento continua bloqueada até ADR explícito.


## Checkpoint operacional — local backup/restore drill — 2026-08-26

O gap `RECOVERY-001` ganhou um ensaio local reproduzível no comando `npm run drill:v2:backup`. O drill exercita a ponte de backup já existente em processo Node com fallback in-memory: prepara o storage, exporta dados com Unicode, valida o envelope, simula perda com `clearAll()`, restaura as chaves esperadas, confirma exclusão de `auth:session`, rejeita uma chave desconhecida e limpa o estado no bloco `finally`.

A execução passou com `backupValidado: true`, três chaves estruturais restauradas (`editor:state`, `permissoes`, `ui:theme`), sessão excluída e chave desconhecida ignorada. A suíte canônica de backup passou `14/14`. O resultado demonstra o caminho local da ponte V1→V2, mas não aprova RPO/RTO, durabilidade, criptografia, retenção, ownership, tenancy, auditoria, recuperação remota ou restauração entre máquinas; o gap operacional permanece parcial e bloqueado para produção.

O contrato detalhado está em [`V2_BACKUP_RESTORE_DRILL_2026-08-26.md`](./V2_BACKUP_RESTORE_DRILL_2026-08-26.md). Nenhuma rede, storage remoto, Supabase, migration, RLS, Auth real, credencial ou escrita de produção foi utilizada.


## Checkpoint de performance — Evidence local bounded search — 2026-08-26

A busca local da Evidence foi medida sobre o dataset `PZ_IDS` curado: `159` mods, `640` registros derivados somente de campos declarados e `250` repetições por cenário. As médias observadas ficaram entre `119,301 µs` e `223,172 µs`, com limites `25`/`100`, `returned` nunca acima do limite e `available` contado antes do corte.

O benchmark é reprodutível pelo comando `npm run bench:evidence-search` e está detalhado em [`EVIDENCE_SEARCH_BENCHMARK_2026-08-26.md`](./EVIDENCE_SEARCH_BENCHMARK_2026-08-26.md). Ele mede uma busca linear em memória e não fecha budget de produção, full-text, ranking, pgvector, índice persistente, consulta remota ou relevância operacional.

A lacuna de search/index fica parcialmente atendida no escopo local bounded. Volume real de produção, requisitos de relevância, tenancy, retenção, RLS, custos e staging continuam necessários antes de qualquer persistência ou decisão de plataforma.


## Checkpoint de performance — renderização das rotas reais — 2026-08-26

O comando `npm run bench:routes` mede o preview local de produção nas `99` rotas descobertas diretamente de `src/main.js`, em `3` repetições, com settle de `900 ms` e timeout de navegação de `15 s`. Todas as rotas permaneceram verdes nas três rodadas. A navegação teve p50 `163,186 ms`, p95 `190,465 ms`, média `166,612 ms` e máximo `404,826 ms`; a observação após settle teve p50 `1104,435 ms`, p95 `1236,586 ms`, média `1122,866 ms` e máximo `1457,885 ms`.

A medição está detalhada em [`ROUTE_RENDER_BENCHMARK_2026-08-26.md`](./ROUTE_RENDER_BENCHMARK_2026-08-26.md). Ela é diagnóstico local do Chromium/preview e não estabelece SLA, threshold, budget de produção, comparação entre hardware, política de regressão ou critério de promoção. O smoke permanece o gate funcional de rotas; nenhuma regra da V1, do router ou do smoke foi alterada.


## Checkpoint de performance — boot real da Plataforma V2 — 2026-08-26

O comando `npm run bench:v2:boot` mede o caminho real do harness `v2/harness/index.html#/cripto`, sem recriar o Core e sem alterar o router V1. Cada repetição abre um contexto Chromium novo e observa `window.__v2.partida`, produzido por `criarPlataforma(...).iniciar()` no harness. O cenário real contém sete módulos V2 e vinte rotas V1.

Duas execuções de cinco repetições passaram com `ready`, exatamente sete módulos vivos, zero falhas de boot e vinte rotas V1 em todas as amostras. O boot interno teve p50/p95/média/máximo de `14/14/14/14 ms` na primeira execução e `14/15/14,2/15 ms` na segunda. O tempo observado no browser até `window.__v2.partida` teve `225,801/783,116/329,453/783,116 ms` e `214,871/855,046/342,108/855,046 ms`, respectivamente.

A metodologia e a ocorrência de preview stale estão em [`V2_BOOT_BENCHMARK_2026-08-26.md`](./V2_BOOT_BENCHMARK_2026-08-26.md). A espera do preview exige os marcadores do HTML do harness, impedindo que um `200` do site V1 seja aceito como alvo V2.

Este checkpoint atende parcialmente a medição de startup da Phase 02/21. Os tempos continuam diagnóstico local: não estabelecem SLA, threshold, budget, Web Vital, comparação de hardware, estabilidade longitudinal ou política automática de regressão. Não foram alterados boot, Plataforma, router, V1, Auth, Evidence, Supabase, RLS, tenancy, ownership, permissões ou autoridade.

## Checkpoint de integração — Project Registry local read-only — 2026-08-26

O slice `project-registry-local` adiciona um contrato TypeScript e wrapper JavaScript para um inventário local bounded de projetos externos citados no Master Plan. O catálogo inicial possui quatro entradas (`Veritas`, `DailyPlanner`, `Stock Analyzer Bot` e `Project Vanguard`), todas provenientes somente da referência de roadmap, com `auditState: not-audited` e `decision: defer`.

A API `projectRegistrySnapshot()` valida entradas, rejeita IDs duplicados, filtra por texto/estado/decisão, limita o resultado ao padrão 25 e teto 100 e congela a saída. O comando `npm run check:project-registry` é read-only e imprime apenas resumo local; o teste focal cobre catálogo, filtro, limite, imutabilidade e rejeição de promoção de entrada não auditada.

O contrato está em [`PROJECT_REGISTRY_LOCAL_CONTRACT_2026-08-26.md`](./PROJECT_REGISTRY_LOCAL_CONTRACT_2026-08-26.md). Este checkpoint não consulta, baixa, instala, importa, executa ou autoriza repositórios externos; não inventa URL, licença, manutenção, arquitetura, capability, risco ou custo. Não cria marketplace, plugin loader, adapter, bridge, Auth, RLS, Supabase, ownership, tenancy, persistência ou autoridade. A Phase 14 — Project Integration continua parcial e a auditoria externa de qualquer projeto permanece uma decisão futura, passiva e separada.


## Checkpoint de segurança local — Module Mode Policy fake server-side — 2026-08-26

O slice `module-registry-mode-policy/v1` adiciona uma fixture determinística e in-memory para a fronteira de autorização dos modos `active`, `maintenance` e `disabled` do Module Registry. A fixture expõe exatamente quatro identidades sintéticas (`fixture-user`, `fixture-admin`, `fixture-dev` e `fixture-owner`) nos papéis fechados `user`, `admin`, `dev` e `owner`. Ela produz decisões `allow`/`deny` para o callback auditado de `criarModuleRegistryHealth()`, mas não altera o Registry, não inicia módulo e não concede autoridade ao frontend.

| Evidência local | Resultado |
|---|---:|
| Verificador | `npm run check:module-mode-policy` |
| Identidades | 4 |
| Casos da matriz | 6 |
| Decisões | 3 allow / 3 deny |
| Spoof de `actorRole` client-side | deny |
| Teste focal | `8/8` |
| `npm run tipos:ts` | passou |
| `npm run tipos:v2` | passou |
| `git diff --check` | passou |

A matriz da fixture é deliberadamente local: `user` não altera modo; `dev` pode solicitar `active`/`maintenance`, mas não `disabled`; `admin` e `owner` cobrem os três modos. Decisões allow carregam `requestId`, `actorId`, `actorRole` e `approvedBy` sintéticos para satisfazer o contrato `requireAudit`; decisões deny usam somente razões bounded. O campo `actorRole` do request é ignorado.

O checkpoint não implementa login, Auth, JWT, claims, service role, Supabase, SQL, migration, RLS, tenancy, ownership, rede, persistência, retry, restart, fila ou mutação remota. A fixture não é política de produção, não prova staging e não autoriza qualquer operação no browser. A integração real depende de staging separado, identidades de teste, RLS verificável, cleanup idempotente, revisão de segurança, auditoria persistente e rollback aprovado. O contrato está em [`MODULE_MODE_POLICY_LOCAL_CONTRACT_2026-08-26.md`](./MODULE_MODE_POLICY_LOCAL_CONTRACT_2026-08-26.md).


## Checkpoint de observabilidade — Doctor registra Module Mode Policy — 2026-08-26

O Doctor passa a incluir `module_mode_policy` como check `safe`/read-only, executando `node scripts/module-mode-policy-check.mjs`. O comando reutiliza a fixture canônica `module-registry-mode-policy/v1`, que expõe quatro identidades sintéticas e rejeita spoof de `actorRole`; o Doctor não cria uma segunda política nem aplica qualquer modo de módulo.

| Evidência local | Resultado |
|---|---:|
| Testes focais do Doctor | `10/10` |
| `module_mode_policy` | `green` |
| Verificador da fixture | 4 identidades, 6 casos, 3 allow / 3 deny, spoof deny |
| Doctor total | 24 registros: 16 green, 2 blocked-known, 1 unknown, 5 not-run |
| Falhas reais | 0 |
| Exit code do Doctor | `2`, preservando o `unknown` ambiental do Cargo |

O check somente chama um comando local sem rede, storage, token, claims, Supabase, SQL, migration, RLS, tenancy, ownership, persistência, retry, fila, restart ou promoção pública. Os estados `blocked-known`, `unknown` e `not-run` continuam honestos; nenhum foi mascarado para fazer o Doctor parecer verde. O contrato está em [`V2_DOCTOR_MODULE_MODE_CHECK_2026-08-26.md`](./V2_DOCTOR_MODULE_MODE_CHECK_2026-08-26.md).


## Checkpoint de integração — Runtime desktop empacotado / alpha.18 — 2026-08-26

A PR #510 integrou o gate `v2:desktop-packaged` no SHA `ca325d03fbddf77b43b64519ba2f69cdf4f07f4f`. O comando constrói o bundle web, compila o Runtime Rust em release, empacota o Electron com `desktop/package.json` e executa um artefato `linux-unpacked` temporário sob Xvfb. O entrypoint de smoke exige `app.isPackaged`, recusa `BALUARTE_RUNTIME_BIN`, confirma binário e transporte em `process.resourcesPath`, autoriza o módulo sintético, lê arquivo confinado e verifica a recusa de `../`.

| Evidência | Resultado |
|---|---:|
| PR técnica | `#510`, squash-merged |
| SHA integrado | `ca325d03` |
| Backup pré-merge | `backup/2026-08-26-before-v2-packaged-runtime` |
| Workflow PR | `33021833916`, sucesso |
| Workflow pós-merge | `33022206259`, sucesso |
| Workflows pós-merge totais | `9/9` sucesso |
| `npm test` anterior ao merge | `1385` aprovados, `6` ignorados, `0` falhas |
| Integração / smoke / caminho crítico | passou / `99/99` / `15/15` |
| Offline / memória / Security Contracts | `9/9` / passou / `73/73` |
| Smoke empacotado local | bloqueado por `cargo` ausente no sandbox |

A prova fecha a lacuna de localização e comunicação do Runtime no pacote Linux. Não é aceite físico de Windows/macOS, não publica instaladores, não prova assinatura, auto-update, OAuth, câmera, microfone, persistência, Auth/RLS ou Runtime como autoridade de produção. V1, router, sidebar, Service Worker e launcher normal permanecem preservados. O contrato está em [`V2_PACKAGED_RUNTIME_CONTRACT_2026-08-26.md`](./V2_PACKAGED_RUNTIME_CONTRACT_2026-08-26.md) e a auditoria em [`V2_PACKAGED_RUNTIME_AUDIT_2026-08-26.md`](./V2_PACKAGED_RUNTIME_AUDIT_2026-08-26.md).

A alpha.18 aguarda a finalização documental e a verificação do SHA documental antes de tag/release. A PR #501 continua OPEN/DRAFT e isolada; a PR #471 continua OPEN/DRAFT e intocada.


## Checkpoint alpha.19 — Module Registry Health local/read-only

| Campo | Estado verificado |
|---|---|
| Slice | `module_registry_health` como observabilidade operacional bounded |
| Implementação | `scripts/module-registry-health-check.mjs` reutiliza `criarModuleRegistryHealth` e `criarRuntimeHealth` |
| Doctor | Check `safe` em `scripts/v2-doctor.mjs` |
| Cobertura | 6 casos, 3 allow, 3 deny; desconhecido, saudável, degraded, quarantined, maintenance auditada, negação server-side e cópia defensiva |
| Rede/Storage | Não usados; nenhuma escrita remota ou autoridade de produção |
| Gates | Focal `32/32`; suíte `1386` pass, `6` skipped, `0` fail; integração `58/58`; smoke `99/99`; caminho `15/15`; offline `9/9`; Security Contracts `73/73`; Doctor `17 green`, `2 blocked-known`, `1 unknown`, `5 not-run`, `0 failed`, exit `2` honesto |
| Project Registry | Busca read-only sem fonte oficial inequívoca; quatro candidatos continuam `not-audited/defer` |
| Status | Implementação técnica integrada pela PR #514 no SHA `17d1acc`; documentação final e release ainda condicionadas à PR documental |
| Fora do escopo | Health remoto, restart real, Auth, RLS, tenancy, ownership, retenção operacional, billing, integração de fonte externa, assinatura e auto-update |


## Checkpoint de medição — 2026-08-27 — PR #519 / SHA `0365f7f`

A fachada `criarPlataforma()` passou a projetar opcionalmente `PlatformDiagnostic.trabalho`, delegando a leitura a `Escalonador.saude()`. O contrato valida a dependência, preserva `null` quando ausente e não altera fila, lifecycle, retry, readiness ou autorização. A implementação técnica foi integrada pela PR [#519](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/519), com commit técnico `dbfe5156b7c797390956aaf365e87010b25529af` e squash merge em `0365f7fa451de20784c9eb745df853b363c7aeab`.

A PR teve `11` checks de sucesso, `1` skipped por política e `0` pending/cancelados, incluindo Vercel Preview liberado após o rate limit. Os oito workflows pós-merge do SHA terminaram com sucesso. O backup `backup/2026-08-27-before-v2-platform-task-diagnostic` preserva o commit técnico.

O marco melhora a observabilidade local agregada, mas não altera a classificação das fases: persistência, RLS, Auth/RBAC server-side, ownership, retenção operacional, retry por classe de evento, Knowledge Mesh formal, Risk Engine, OpenClaw, Hermes, observabilidade operacional persistente, aceite físico, estabilização, RC e V2 estável continuam pendentes, bloqueados ou deferidos conforme a matriz. V1, router, shell, sidebar, wrappers, Service Worker e branches de Claude Code permanecem preservados.


## Checkpoint documental final pós-#521 — alpha.20

A nota de release e as matrizes foram integradas na `main` pela PR [#520](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/520), no SHA `fc90959a4186060a296d6632efb45ef9d20d1609`. A finalização de rastreabilidade foi integrada pela PR [#521](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/521), no SHA `1b7ce92fc5a0dff0e11bf362a470c14b6663f108`; os sete workflows pós-merge desse SHA terminaram com sucesso. A correção documental final foi integrada pela PR [#522](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/522), no SHA `f0a11e33a7163746c5d2087762c68a654e1a6dcb`; a tag anotada `v2.0.0-alpha.20` e a release prerelease foram verificadas e publicadas nesse SHA.

As branches `backup/2026-08-27-before-v2-platform-task-diagnostic`, `backup/2026-08-27-before-v2-alpha20-docs` e `backup/2026-08-27-before-v2-alpha20-finalize` apontam para os heads das PRs (`dbfe515`, `a05bbe7`, `2064396`), não para uma `main` pré-merge. A backup `backup/2026-08-27-before-v2-alpha20-release-final` aponta para o baseline real `1b7ce92` anterior à #522. O rollback correto é reverter normalmente os squash merges `0365f7f`, `fc90959`, `1b7ce92` e `f0a11e33`, conforme necessário, usando seus pais históricos/baselines (`43bc15e`, `0365f7f`, `fc90959` e `1b7ce92`); nenhuma das três branches antigas deve ser apresentada como rollback pré-merge.

O marco técnico continua limitado à projeção read-only de `Escalonador.saude()` dentro de `PlatformDiagnostic`. O restante da execução da V2 — persistência/retenção, Auth/RBAC/RLS server-side, tenancy/ownership, retry distribuído, Knowledge Mesh, Risk Engine, OpenClaw, Hermes, observabilidade operacional persistente, aceite físico, assinatura, auto-update, beta, RC e stable — permanece pendente, bloqueado ou deferido. Nenhuma conclusão de domínio amplo é inferida deste checkpoint.


## Checkpoint pós-alpha.20 — PRs #517, #518 e #523 / alpha.21 candidata

A sequência pós-alpha.20 avançou o Core/Module System em três slices isoladas. A PR [#517](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/517) foi sincronizada contra a `main`, validada com 11 checks e Vercel success e integrada no SHA `f62ece73eae089f0a42478f7ee2ef36b5cd2fcd3`, corrigindo `stop → Runtime.close → dispose`. A PR [#518](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/518) foi sincronizada, validada com 11 checks e Vercel success e integrada no SHA `9ca947816378180b41d2fe2939e9e5b96ff796bd`, preservando metadados autorizados de envelope em `ctx.bus.emit`.

A PR [#523](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/523) adicionou single-flight por módulo a `criarRuntimeRestart()`. Chamadas concorrentes do mesmo módulo compartilham a mesma `Promise`, evitando duas sequências simultâneas de `stop → sleep → start`; módulos diferentes permanecem independentes. O contrato está em [`RUNTIME_RESTART_SINGLE_FLIGHT_CONTRACT_2026-08-27.md`](./RUNTIME_RESTART_SINGLE_FLIGHT_CONTRACT_2026-08-27.md). A slice não altera o contrato de injeção do `RuntimeManager`, não cria retry automático, persistência, lock distribuído ou autoridade operacional.

| Item | Evidência |
|---|---|
| Commit técnico da branch #523 | `e216f3f7c9e9058d3c1301ee154e8710399946b9` |
| SHA integrado na `main` | `25cbc9f374e5ac658403f1e83a1b540d8d2f4798` |
| Gates locais | Focal `3/3`; suíte `1397` com `1391` pass, `6` skipped, `0` fail; `tipos:ts`; `tipos:v2`; build; integração `58/58`; smoke; caminho crítico; offline; memória; Security Contracts `73/73` |
| Doctor | Exit `2` honesto por Cargo ausente, sem falhas mascaradas |
| Checks da PR #523 | `11` sucessos, `1` skipped por política, Vercel success |
| Pós-merge #523 | `8/8` workflows verdes; V2 Validation verde na tentativa 2 após timeout externo no Checkout do job Rust |
| Backup pré-merge | `backup/2026-08-27-before-v2-runtime-restart-single-flight` → baseline real `9ca94781` |

A alpha.20 continua sendo a última prerelease publicada e está registrada em [v2.0.0-alpha.20](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/releases/tag/v2.0.0-alpha.20). A alpha.21 é somente candidata documental neste checkpoint: sua nota, tag e release ainda não existem. O marco não fecha as fases de persistência, Auth/RBAC/RLS server-side, tenancy, ownership, retenção operacional, retry distribuído, Knowledge Mesh, Risk Engine, OpenClaw, Hermes, observabilidade persistente, aceite físico, assinatura, auto-update, beta, RC ou stable. V1, router, shell, sidebar, wrappers, Service Worker, #501 e #471 permanecem preservados e separados.
