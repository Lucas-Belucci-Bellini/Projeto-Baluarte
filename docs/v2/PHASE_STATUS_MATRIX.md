# V2 Master Prompt — Matriz de fases e estado atual

**SHA observado para a medição corrente:** `25cbc9f374e5ac658403f1e83a1b540d8d2f4798` (`fix(v2): serialize concurrent runtime restarts`)
**SHA funcional anterior:** `9ca947816378180b41d2fe2939e9e5b96ff796bd` (`feat(v2): preserve event metadata through module context`)
**Última reconciliação documental anterior:** `f0a11e33` (`docs(v2): close alpha.20 release traceability`)
**Último marco publicado:** `v2.0.0-alpha.20` — diagnóstico da saúde do Task Manager, publicada como prerelease
**Próximo marco técnico integrado:** `v2.0.0-alpha.21` candidata — Runtime Restart Single-Flight; tag/release pendentes
**Data:** 2026-08-27
**Critério:** uma fase só é `concluída` quando existe implementação, teste, documentação, validação e publicação na `main`. Uma documentação de intenção não é evidência de implementação.

## Resumo

O Projeto-Baluarte já possui uma fundação significativa: governança e documentação V2, Core inicial, Event Bus, Storage, permissões básicas, Runtime/Session/Bridge, integração V2, migração das páginas canônicas para TypeScript, fronteira Node/TypeScript dos geradores e automação diária. A medição local mais recente da slice de restart passou `tipos:ts`, `tipos:v2`, teste focal `3/3`, suíte `1391` pass com `6` skipped e `0` fail, build, integração `58/58`, smoke, caminho crítico, offline, memória e Security Contracts `73/73`. O `verify:v2` mantém estados honestos, incluindo Cargo como `unknown`; a publicação alpha.20 está verificada e a alpha.21 permanece apenas candidata até sua documentação e tag próprias.

Isso ainda não equivale à V2 completa do prompt mestre. Permanecem pendentes o vertical slice completo com Data/Evidence e observabilidade de produto, Module Registry operacional uniforme, sessão/login-cadastro server-validated projetada localmente; integração HTTP e RLS, validação Runtime em toolchain compatível, hardening de segurança, layout Command Shell Modular, app preview, JARVIS medido/otimizado, bridge OpenClaw/MCP protegido, notícias com proveniência, testes mensais e critérios de RC/COMPLETE.

## Matriz de fases 0–27

| Fase do prompt | Estado | Evidência atual | Lacuna para conclusão |
|---|---|---|---|
| PHASE 0 — Audit and Baseline | **Concluída neste marco** | `PHASE_00_AUDIT.md` e `BASELINE.md` publicados na main | Manter baseline atualizada após mudanças relevantes |
| PHASE 1 — Core Foundation | **Parcial avançada** | `v2/core`, boot, ciclo, plataforma, contratos e testes V2 | Consolidar contratos restantes, diagnóstico e limites de Core |
| PHASE 2 — Module System | **Parcial** | Registry, manifests e integração de módulos existentes | Cobertura operacional uniforme, estados, quarentena e fallback por módulo |
| PHASE 3 — Event Bus | **Parcial avançada** | Event Bus testado; catálogo automático com 19 eventos/8 namespaces | Versionamento, descoberta de dependências e cobertura de módulos externos |
| PHASE 4 — Data Layer | **Parcial avançada localmente** | Storage, política de esquemas, catálogos, persistência local e contrato RLS/staging local-only | Camada de dados comum, migrations SQL, backup/restore e policies remotas |
| PHASE 5 — Permission System | **Parcial avançada** | Deny-by-default, permissões e concessão/revogação testadas | RBAC server-side, roles protegidos e RLS para operações administrativas |
| PHASE 6 — Configuration | **Parcial** | Configuração e flags existentes no Core | Fonte única, versionamento, diagnóstico e configuração de módulos |
| PHASE 7 — Observability | **Avançada parcialmente** | Health, métricas, snapshots, server-observation/v1, retrato visual por módulo, política operacional read-only, observação bounded do contexto e do recall JARVIS, evidência de rollout, projeção server-validated-session/v1, cliente HTTP read-only e presença Spotify read-only | Telemetria consistente por módulo, incidentes, retenção e dashboards operacionais |
| PHASE 8 — Testing Infrastructure | **Avançada** | 1258/1258, Spotify/Soloist + Mark XIII 19/19, smoke 99/99, integração 51/51, caminho 15/15, offline 9/9, Billing 67/67, Module Registry pilot, JARVIS context/memory optimization, Wiki Zomboid review queue, Evidence retention preview, Evidence audit preview, login + Auth Adapter + server-validated-session + HTTP client TypeScript, doctor 21 registros | Contratos Data/Evidence, auth/RLS, Runtime remoto e testes mensais |
| PHASE 9 — API Contracts | **Parcial avançada** | `.d.ts`, JSDoc V2, Runtime envelopes, contratos de módulos, `server-validated-session/v1` e `server-observation-http/v1` | Fechar integração de UI, Evidence, auth/RLS, Module Registry e integrações |
| PHASE 10 — TypeScript Migration | **Concluída para páginas canônicas; Auth boundary avançada** | Inventário com zero páginas canônicas JS; 115 wrappers preservados; consumers TypeScript de páginas promovidos nas Waves 39–43; `src/pages/login.ts`, `supabase-auth.d.ts`, `server-validated-session.ts` e `server-observation-http.ts` usam contratos TypeScript | Integrar observação em superfície read-only de ambiente controlado; avaliar utilitários sensíveis, scripts externos ao Vite e remover wrappers somente quando o grafo legado permitir |
| PHASE 11 — Vertical Integration | **Parcial — slices locais Data/Evidence publicados** | V2 browser integration 51/51 conecta Core, módulos, Runtime Session, Registry, Evidence e router; Wiki Zomboid expõe review queue; Evidence expõe retention preview e audit preview bounded | Persistência, permissão operacional, revisão humana e autoridade server-side |
| PHASE 12 — JARVIS Foundation | **Parcial avançada — visual lightweight, contexto bounded, recall cacheado, schemas lazy, server-health read-only, transporte redigido, integridade, claims read-only, adaptador server-side, severidade/fallback, adaptador V2 Mark XIII, hardening de transporte e Spotify PKCE read-only publicados** | JARVIS, WebLLM, Hermes, voz, memória, Spotify, contratos, console integrado da rota `/jarvis`, benchmark antes/depois, 72/40 partículas, stride de conexões adaptativo, projeção `nucleo:status`/health manual, budget 12k/24 e 18k/32 para agentes, cache/seleção lazy de tools, revisão monotônica do corpus, cache máximo de 256 documentos, observação bounded de hit/miss, contrato `server-health/v1` em FastAPI/Vercel, envelope `platform-observation/v1` com TTL/redaction/SHA-256/anti-replay, `claims-observation/v1` com identidade e escopo limitado, adaptador `server-claims/v1` no FastAPI e Vercel com roles fechadas, TTL formal e least privilege, CORS por allowlist, rate limit process-local, auditoria redigida, envelope `server-observation/v1`, consumidor TypeScript read-only e adaptador `projectPlatformDiagnostic()`; V7 standalone preservado | Auth/RLS real, assinatura/origem server-side, auditoria de consumidor em produção, rate limit distribuído, integração real do payload verificado, medição em hardware real e em paralelo com OpenClaw, Tool Registry/bridge externo, permission boundaries e fallback operacional autorizado |
| PHASE 13 — Wiki Infrastructure | **Parcial — auditoria Zomboid/Evidence publicada** | Wiki Arma 3 e inventário; schema Zomboid local, proveniência, Evidence, fila read-only, preview de retenção e auditoria estrutural | Ingestão remota, retenção operacional, proveniência, ownership, revisão humana e busca |
| PHASE 14 — Project Integration | **Parcial planejada** | Projetos conectados e roadmap Nexus | Contratos externos estáveis, adapters e integração verificável |
| PHASE 15 — IDE Foundation | **Parcial avançada** | Editor, terminal virtual, Git helper e testes V1 | Isolamento formal de execução, extensões, projetos e integração V2 |
| PHASE 16 — 3D Foundation | **Parcial avançada** | Three.js, visor 3D, cena, modelos e integração 19/19 | Registry independente, health/quarentena e limites de recursos |
| PHASE 17 — Social Foundation | **Não iniciada como slice V2** | Mural/comms existem como superfícies V1 | Contrato de identidade, canais, moderação, storage e RLS |
| PHASE 18 — Sensors Foundation | **Experimental/parcial** | Radar, visão e GeoPulse existem como páginas | Sensor API, simulador, eventos e fusion desacoplados de páginas |
| PHASE 19 — App/Desktop Foundation | **Parcial de infraestrutura** | Capacitor/Android e desktop scaffoldados; release operacional 1.3.2 com instaladores verificáveis | App Preview testado, fallback, auth, offline, câmera/OCR e distribuição interna |
| PHASE 20 — Hardening | **Parcial avançada** | Auditorias, flags, permissões, CORS por allowlist, rate limit process-local, auditoria redigida, contrato RLS local-only e gates existentes | XSS/DOM/URL/upload/iframe/worker, secrets, dependências dev, rate limit distribuído, RLS remoto e Runtime CI |
| PHASE 21 — Performance | **Parcial avançada localmente** | Sonda de memória sem acúmulo; warning de chunks conhecido; benchmark lógico de contexto/tool schemas e recall cache, budgets aplicados no envio | Benchmarks de JARVIS em hardware, carregamento, módulos pesados, CPU/memória, latência e comparação real |
| PHASE 22 — Security | **Parcial inicial** | Produção sem vulnerabilidades no audit; CodeQL verde; 7/7 casos locais de RLS/staging | RLS/RBAC remoto, threat model, dependências dev, integração externa e revisão de sinks |
| PHASE 23 — UX / UI Integration | **Command Center + observação visual + rollout controlado isolados; editor bloqueado** | Shell/layout atual, contratos UI-01/UI-02/UI-03/UI-04, pilotos, gate de promoção, contrato read-only, [`COMMAND_CENTER_VISUAL_HARNESS_PILOT_2026-08-20.md`](./COMMAND_CENTER_VISUAL_HARNESS_PILOT_2026-08-20.md), [`COMMAND_CENTER_A11Y_MATRIX_2026-08-20.md`](./COMMAND_CENTER_A11Y_MATRIX_2026-08-20.md), [`MODULE_OBSERVATION_VISUAL_CONTRACT_2026-08-21.md`](./MODULE_OBSERVATION_VISUAL_CONTRACT_2026-08-21.md), [`CONTROLLED_ROLLOUT_EVIDENCE_CONTRACT_2026-08-21.md`](./CONTROLLED_ROLLOUT_EVIDENCE_CONTRACT_2026-08-21.md), integração 43/43, doctor 21 registros | Observabilidade autorizada do consumidor, claims, anúncio dedicado de resultados, foco entre categorias, rollback e promoção controlada, sem trocar a sidebar global |
| PHASE 24 — Documentation | **Parcial avançada** | README, roadmaps, onboarding, audits, releases 1.2.7–1.3.2, migration, inventários, PHASE UI, daily report e contratos Evidence/Spotify | ADRs dos próximos slices, contratos Data/Evidence, runbooks e changelog |
| PHASE 25 — V2 Stabilization | **Não iniciada** | Gates locais principais verdes | Incidentes, quarentena, rollback, módulos críticos e testes periódicos |
| PHASE 26 — V2 Release Candidate | **Não iniciada** | Release plan define critérios | Beta, app preview, auth, Data/Evidence, Runtime e checks externos verdes |
| PHASE 27 — V2 COMPLETE | **Não iniciada** | Nenhuma declaração válida ainda | Todos os critérios de `2.0.0`, documentação completa e testes mensais ativados |

## Próximo marco executável

O marco `GEN-TS-001` está resolvido e publicado. A auditoria `GEN-TS-002` confirmou que os geradores Node-safe passam diretamente e que não há outra importação direta de `.ts` em scripts executáveis que justifique uma correção imediata.

O marco `JARVIS Mark XIII Integrated Visual` adicionou o console funcional à rota real `/jarvis`, reutilizando chat, sessões, modos, Spotify, memória e fallback existentes, enquanto preserva o MPA V7. O marco seguinte adicionou medição reproduzível e orçamento adaptativo de partículas/FPS, documentado em [`JARVIS_MARK_XIII_PERFORMANCE_MATRIX_2026-08-20.md`](./JARVIS_MARK_XIII_PERFORMANCE_MATRIX_2026-08-20.md). A ponte seguinte projeta observação do Event Bus V1 e do health check manual sem transformar sinal local em claim, documentada em [`JARVIS_MARK_XIII_RUNTIME_OBSERVATION_2026-08-20.md`](./JARVIS_MARK_XIII_RUNTIME_OBSERVATION_2026-08-20.md). O adaptador compartilhado da V2 agora projeta `PlatformDiagnostic` no mesmo contrato read-only, com severidade/fallback explícitos, e o harness confirma essa integração em `33/33`; a suíte do adaptador cobre dez cenários. O primeiro health server-side read-only foi documentado em [`JARVIS_SERVER_HEALTH_CONTRACT_2026-08-20.md`](./JARVIS_SERVER_HEALTH_CONTRACT_2026-08-20.md), com paridade FastAPI/Vercel e sem autoridade operacional. A otimização lightweight reduziu o orçamento do console para 72/40 partículas e foi medida no benchmark em [`JARVIS_MARK_XIII_LIGHTWEIGHT_OPTIMIZATION_2026-08-20.md`](./JARVIS_MARK_XIII_LIGHTWEIGHT_OPTIMIZATION_2026-08-20.md). O envelope `platform-observation/v1` foi implementado no harness com TTL, redaction, resumo mínimo, origem fixa, nonce, digest SHA-256 e verificação anti-replay, documentado em [`PLATFORM_OBSERVATION_TRANSPORT_CONTRACT_2026-08-20.md`](./PLATFORM_OBSERVATION_TRANSPORT_CONTRACT_2026-08-20.md); o gate passou a `36/36`. O contrato `claims-observation/v1` adiciona projeção read-only de issuer, subject, audience, origem, escopos e frescor, sempre com decisão `not-authorized`, documentado em [`SERVER_CLAIMS_OBSERVATION_CONTRACT_2026-08-20.md`](./SERVER_CLAIMS_OBSERVATION_CONTRACT_2026-08-20.md); o gate passou a `39/39`. O adaptador `server-claims/v1` consulta Supabase Auth `/user` somente no backend configurado, redige tokens/metadata, nega sem configuração e mantém escopos vazios até existir uma política formal; ele está documentado em [`SERVER_CLAIMS_ADAPTER_CONTRACT_2026-08-21.md`](./SERVER_CLAIMS_ADAPTER_CONTRACT_2026-08-21.md). O slice `server-observation/v1` foi implementado e publicado no SHA `86e865243719704a186f39d96e395a7f493fc2f6`: envelope combinado de health e claims redigidos, reason codes bounded, fallback projetado sem execução e consumidor TypeScript read-only, conforme [`SERVER_OBSERVATION_EVIDENCE_CONTRACT_2026-08-21.md`](./SERVER_OBSERVATION_EVIDENCE_CONTRACT_2026-08-21.md). O piloto `module-observation-visual` foi implementado e publicado no merge `b8e5e767`: converte evidência saudável em `enabled`, ausência/degradação em `degraded`, mantém `v1-preserved`, fica restrito ao harness e nunca permite promoção pública, conforme [`MODULE_OBSERVATION_VISUAL_CONTRACT_2026-08-21.md`](./MODULE_OBSERVATION_VISUAL_CONTRACT_2026-08-21.md). A integração passou a `41/41`; o Rust local continua bloqueado pelo Cargo 1.75.0/`edition2024`. O contrato `controlled-rollout-evidence` foi implementado e publicado no SHA `ceac89fa`: observação pronta sem autoridade permanece bloqueada; observação, autoridade server-claims e rollback válidos produzem apenas elegibilidade controlada, com `publicPromotionAllowed: false` e `normalUserAction: preserve-current-surface`; a integração passou a `43/43` e os oito workflows remotos ficaram verdes. Os oito workflows remotos aplicáveis concluíram com sucesso; o gate Rust local permanece conhecido como bloqueado pelo Cargo 1.75.0/`edition2024`. O marco não aplica RLS, não cria staging e não promete quota distribuída. O marco `PHASE UI / UI-00` foi concluído como auditoria somente leitura; `UI-01` a `UI-04`, o piloto por módulo, o piloto individual do editor, o gate de promoção, o contrato Command Center, o protótipo visual isolado e a matriz de acessibilidade do harness foram implementados em [`UI_01_NAVIGATION_CONTRACT_2026-08-20.md`](./UI_01_NAVIGATION_CONTRACT_2026-08-20.md), [`UI_02_AVAILABILITY_PILOT_2026-08-20.md`](./UI_02_AVAILABILITY_PILOT_2026-08-20.md), [`UI_03_REGISTRY_OBSERVATION_2026-08-20.md`](./UI_03_REGISTRY_OBSERVATION_2026-08-20.md), [`UI_04_CATALOG_RECONCILIATION_2026-08-20.md`](./UI_04_CATALOG_RECONCILIATION_2026-08-20.md), [`MODULE_ALIGNMENT_PILOT_2026-08-20.md`](./MODULE_ALIGNMENT_PILOT_2026-08-20.md), [`SINGLE_SURFACE_EDITOR_PILOT_2026-08-20.md`](./SINGLE_SURFACE_EDITOR_PILOT_2026-08-20.md), [`PROMOTION_GATE_EDITOR_2026-08-20.md`](./PROMOTION_GATE_EDITOR_2026-08-20.md), [`COMMAND_CENTER_NAVIGATION_CONTRACT_2026-08-20.md`](./COMMAND_CENTER_NAVIGATION_CONTRACT_2026-08-20.md) e [`COMMAND_CENTER_VISUAL_HARNESS_PILOT_2026-08-20.md`](./COMMAND_CENTER_VISUAL_HARNESS_PILOT_2026-08-20.md) e [`COMMAND_CENTER_A11Y_MATRIX_2026-08-20.md`](./COMMAND_CENTER_A11Y_MATRIX_2026-08-20.md). O próximo marco não executa efeitos colaterais: mantém a classificação read-only, fecha RLS/auditoria de produção somente quando houver staging aprovado e preserva a sidebar global no fallback V1. O slice `rls-local-contract` adicionou [`RLS_STAGING_AUDIT_2026-08-21.md`](./RLS_STAGING_AUDIT_2026-08-21.md), [`RLS_STAGING_AUTHORIZATION_CONTRACT_2026-08-21.md`](./RLS_STAGING_AUTHORIZATION_CONTRACT_2026-08-21.md), uma política local deny-by-default e 7/7 testes de identidade, tenant, expiração, roles e service-role. O SHA `f3973ecc` foi publicado com oito workflows remotos verdes; nenhum staging, migration ou DDL remoto foi executado. Em seguida, o marco `v2-doctor-expanded` publicou [`V2_DOCTOR_CONTRACT_2026-08-21.md`](./V2_DOCTOR_CONTRACT_2026-08-21.md), expandiu o doctor para 21 registros e atualizou seus quatro testes: 15 checks locais verdes, Rust como `blocked-known`, cinco gates `not-run`, zero `failed` e zero `unknown`. O runner oficial do projeto continua separado e passou nos gates aplicáveis; os oito workflows remotos do SHA `0f9922bf` concluíram com sucesso. O marco `billing-foundation-local` publicou [`BILLING_FOUNDATION_AUDIT_2026-08-21.md`](./BILLING_FOUNDATION_AUDIT_2026-08-21.md) e [`BILLING_FOUNDATION_CONTRACT_2026-08-21.md`](./BILLING_FOUNDATION_CONTRACT_2026-08-21.md), adicionou `v2/data/billing-foundation.ts`, `appendUsageWithPreflight()` e `billing-mutation/v1`, preservando o método legado. Os testes focais passaram em 9/9, Billing em 67/67, `npm test` em 1166/1166 e os oito workflows remotos do SHA `93e21960` concluíram com sucesso. Nenhum provider, webhook, staging, Supabase ou DDL remoto foi executado. O marco `module-registry-operational-policy` publicou [`MODULE_REGISTRY_PILOT_AUDIT_2026-08-21.md`](./MODULE_REGISTRY_PILOT_AUDIT_2026-08-21.md) e [`MODULE_REGISTRY_PILOT_CONTRACT_2026-08-21.md`](./MODULE_REGISTRY_PILOT_CONTRACT_2026-08-21.md), adicionou a projeção TypeScript de botão/fallback/review-only e duas asserções no harness. O piloto passou em 22/22 testes focais, `npm test` em 1172/1172, integração V2 em 45/45 e os oito workflows remotos do SHA `e8da0473` concluíram com sucesso. O Rust permanece como bloqueio conhecido; nenhum shell/router/Auth/RLS foi alterado. O marco `jarvis-memory-cache`, publicado no SHA `fa5eefd0`, adicionou [`JARVIS_MEMORY_CACHE_AUDIT_2026-08-21.md`](./JARVIS_MEMORY_CACHE_AUDIT_2026-08-21.md), [`JARVIS_MEMORY_CACHE_CONTRACT_2026-08-21.md`](./JARVIS_MEMORY_CACHE_CONTRACT_2026-08-21.md) e `scripts/jarvis-memory-cache-benchmark.mjs`. A revisão monotônica invalida o corpus em mutações locais, o cache guarda no máximo 256 resumos e a observabilidade não inclui conteúdo ou identificadores. A suíte focal passou em 34/34, a regressão em 1183/1183, a integração em 45/45, smoke em 99/99 e caminho crítico em 15/15. O benchmark determinístico evitou 1280 reconstruções de resumo em cinco rodadas; o tempo observado no sandbox foi 19,554 ms versus 0,001 ms, usado somente como diagnóstico local, não como promessa de hardware. Nenhum schema IndexedDB, provider, Nexus, Auth, RLS, DDL ou bridge externo foi alterado. O marco `jarvis-local-context-optimization` publicou [`JARVIS_LOCAL_OPTIMIZATION_AUDIT_2026-08-21.md`](./JARVIS_LOCAL_OPTIMIZATION_AUDIT_2026-08-21.md), [`JARVIS_LOCAL_OPTIMIZATION_CONTRACT_2026-08-21.md`](./JARVIS_LOCAL_OPTIMIZATION_CONTRACT_2026-08-21.md) e `scripts/jarvis-context-benchmark.mjs`. O budget real foi conectado ao envio da página, a observação bounded não carrega conteúdo sensível e a seleção lazy mantém ferramentas essenciais, retornando o catálogo completo sob foco desconhecido. Os testes focais passaram em 30/30, a regressão geral em 1179/1179 e o runner oficial passou em todos os gates executáveis; Rust permaneceu em código 101 conhecido. O benchmark determinístico apontou reduções lógicas de 83,62% no contexto padrão, 75,44% no budget de agente e 61,54% nos schemas focados de Arsenal. Não houve bridge OpenClaw, WhatsApp, notícias automáticas, provider novo, Auth, RLS ou DDL remoto.

A escolha de integrar primeiro o visual ao caminho real `/jarvis`, antes de alterar Auth/RLS, OpenClaw ou PokeDesk, é deliberada: a proposta visual precisa ser reconciliada com o Module Manifest, o Registry, as permissões e os estados de health antes de qualquer refactor amplo. A UI será auditada primeiro, mas a implementação do App Shell, do app preview, do JARVIS pesado, do OpenClaw, das notícias e do PokeDesk continua posterior ao primeiro vertical slice completo e às autoridades server-side.

## Checkpoint publicado — login-typescript-contract

O SHA `b48c94e3887887e4ed1b328fbd2d297364bef336` publicou a primeira vertical slice TypeScript de login/cadastro diretamente na `main`. `src/pages/login.ts` agora usa `validateAuthForm()`, `authValidationMessage()` e `normalizeAuthError()` de `src/security/auth-form-contract.ts`. A validação é pura, bounded e sem rede; a saída não contém senha bruta; erros arbitrários do provider são redigidos para mensagens de UI locais. O adapter `src/core/supabase-auth.js` permanece compatível e não foi alterado.

| Evidência | Resultado |
|---|---:|
| Strict TypeScript (`tipos:ts` e `tipos:v2`) | Passou |
| Teste focal da slice e contratos adjacentes | 39/39 |
| Suíte completa | 1208/1208 |
| Integração V2 | 45/45 |
| Smoke / caminho crítico | 99/99 / 15/15 |
| Runner oficial | Gates aplicáveis verdes; Rust código 101 classificado `blocked-known` |
| CI remoto no novo SHA | 8/8 workflows verdes |

Este marco não cria contas, não faz DDL, não acessa Supabase remoto adicional, não decodifica JWT e não concede roles. A próxima etapa é tipar o adapter e projetar sessão server-validated. Roles continuam exclusivamente em `app_metadata`; `runtimeAuthority` continua `not-authorized`; `publicPromotionAllowed` continua `false`. Os detalhes estão em [`LOGIN_TYPESCRIPT_AUDIT_2026-08-21.md`](./LOGIN_TYPESCRIPT_AUDIT_2026-08-21.md) e [`LOGIN_TYPESCRIPT_CONTRACT_2026-08-21.md`](./LOGIN_TYPESCRIPT_CONTRACT_2026-08-21.md).

## Checkpoint publicado — auth-adapter-typescript/v1

O SHA `843c3d866aff60c692c28d5296861f272188212a` publicou `src/core/auth-session.ts`, atualizou `src/core/supabase-auth.d.ts` e conectou o adapter JavaScript aos projetores TypeScript sem mudar endpoints, storage key, API V1, OAuth, refresh ou logout. A suíte focal Auth/session/login passou em 32/32 e a regressão geral em 1215/1215. Build, `tipos:v2`, Nexus e o runner local aplicável passaram; os workflows remotos do SHA ficaram verdes, incluindo Security Contracts.

O contrato é local e bounded. Ele não verifica JWT, não deriva roles, não libera módulos, não cria contas, não faz DDL e não acessa provider real nesta slice. A sessão do browser continua sendo sensível, mas necessária; `currentUser()` segue apenas como projeção de UI. A próxima etapa é a sessão server-validated, mantendo roles em `app_metadata`, `runtimeAuthority: not-authorized` e `publicPromotionAllowed: false`. Documentos: [`AUTH_ADAPTER_TYPESCRIPT_AUDIT_2026-08-21.md`](./AUTH_ADAPTER_TYPESCRIPT_AUDIT_2026-08-21.md) e [`AUTH_ADAPTER_TYPESCRIPT_CONTRACT_2026-08-21.md`](./AUTH_ADAPTER_TYPESCRIPT_CONTRACT_2026-08-21.md).

## Checkpoint publicado — server-validated-session/v1 — 9bb3d440

O marco adicionou `src/security/server-validated-session.ts`, uma projeção pura sobre `server-observation/v1`. A saída distingue `authenticated`, `anonymous`, `stale`, `degraded` e `unavailable`, filtra escopos ao catálogo conhecido e mantém `authority: not-authorized` e `publicPromotionAllowed: false`. Os wrappers `.js` de `server-claims-observation` e `server-observation` corrigem a resolução ESM do workflow Security Contracts sem duplicar a implementação TypeScript.

Os testes focais passaram em 23/23 e a suíte completa em 1228/1228. A primeira execução remota falhou somente pela extensão ausente nos imports internos; o commit corretivo foi publicado e os oito workflows remotos ficaram verdes. O Node 22 do sandbox ainda exige `tsx` para carregar `.ts` diretamente, enquanto o workflow remoto usa Node 24; isso é uma limitação de execução local documentada, não um relaxamento de strict. Não houve rede, DDL, RLS remoto, provider, JWT decode local ou concessão client-side. O próximo marco é um transporte HTTP read-only separado, com timeout, redaction, fake e ausência de credencial.

## Checkpoint publicado — server-observation-http/v1 — 9e2caca3

O marco adicionou `src/security/server-observation-http.ts`, cliente GET read-only para os endpoints existentes de observabilidade. A URL é absoluta e validada; o timeout é bounded entre 100 ms e 10000 ms; token, request ID e origin são somente headers opcionais; resposta, mensagem de exceção e payload externo não atravessam a fronteira. O resultado retorna apenas status, motivo bounded e a projeção `server-validated-session/v1`, mantendo `authority: not-authorized` e `publicPromotionAllowed: false`.

Os testes focais passaram em 25/25 e a suíte completa em 1235/1235. O runner oficial passou em todos os gates aplicáveis; Rust código 101 permanece `blocked-known`. O CI remoto do marco concluiu 9/9 workflows verdes, incluindo Security Contracts. Não houve retry, cache, storage, refresh, logout, DDL, RLS, chamada direta ao provider ou autorização de módulo. Os documentos do marco são [`SERVER_OBSERVATION_HTTP_AUDIT_2026-08-22.md`](./SERVER_OBSERVATION_HTTP_AUDIT_2026-08-22.md) e [`SERVER_OBSERVATION_HTTP_CONTRACT_2026-08-22.md`](./SERVER_OBSERVATION_HTTP_CONTRACT_2026-08-22.md).

## Checkpoint publicado — JARVIS Spotify PKCE + Mark XIII playback presence — bcb246df

O slice `jarvis-spotify-pkce-presence` foi implementado e publicado diretamente na `main`. O browser usa PKCE/S256 com Client ID público; nenhum Client Secret é aceito, armazenado ou enviado. O pending state fica em `sessionStorage`, somente o Client ID válido pode ser lembrado em `localStorage`, tokens ficam em memória e o callback rejeita state divergente. `returnTo` é limitado a rota relativa interna e a URL OAuth é limpa antes da navegação. O wrapper JavaScript mantém os exports da implementação TypeScript.

O monitor lê somente metadados de `GET /v1/me/player`, trata `204` como `unknown`, atualiza a presença musical existente e produz eventos locais bounded. O Mark XIII mostra `TOCANDO`/`PAUSADA`/`ONLINE` e aplica pulsação baixa somente no canvas visual, sem áudio, controle de reprodução, sincronização ou mudança de autoridade. `runtimeAuthority` continua `not-authorized`.

| Evidência | Estado |
|---|---:|
| `npm run tipos:ts` / `npm run tipos:v2` | PASS |
| `npm test` | PASS — 1239/1239 |
| `npm run build` / integração / smoke / caminho crítico | PASS |
| Runner local | Gates aplicáveis PASS; Rust 101 `blocked-known` |
| CI remoto no SHA | 10/11 checks com sucesso; 1 falha externa no Supabase Preview |
| Supabase Preview | `failure`: `Remote migration versions not found in local migrations directory.`; nenhuma migration, DDL ou branch foi alterada |
| Spotify dashboard | `unknown/external`; duas tentativas read-only indisponíveis |

A integração de conta Spotify permanece `VALIDATING`, pois o cadastro da Redirect URI e o Client ID real não puderam ser verificados no dashboard externo. O próximo passo operacional é manual e depende da disponibilidade do provedor: cadastrar exatamente `https://projeto-baluarte.vercel.app/`, usar o Client ID público no JARVIS e concluir o consentimento. O problema Supabase é separado e requer aprovação explícita de staging/custo antes de qualquer investigação mutável.

Documentos: [`JARVIS_SPOTIFY_INTEGRATION_CONTRACT_2026-08-22.md`](./JARVIS_SPOTIFY_INTEGRATION_CONTRACT_2026-08-22.md), [`JARVIS_SPOTIFY_AUDIT_2026-08-22.md`](./JARVIS_SPOTIFY_AUDIT_2026-08-22.md), [`SPOTIFY_DASHBOARD_UNAVAILABLE_2026-08-22.md`](./SPOTIFY_DASHBOARD_UNAVAILABLE_2026-08-22.md) e [`JARVIS_CHROME_OBSERVATION_2026-08-22.md`](./JARVIS_CHROME_OBSERVATION_2026-08-22.md).

## Medição corrente — 5d2142d7

A medição publicada em [`V2_PROGRESS_REPORT_2026-08-22.md`](./V2_PROGRESS_REPORT_2026-08-22.md) mantém **57,3% de prontidão ponderada das 28 fases** — não recomputada neste slice —, 100% da migração de páginas canônicas, 1258/1258 testes, 20 gates locais executáveis com código 0, 51/51 de integração V2, 99/99 de smoke e 15/15 do caminho crítico. O CI remoto aplicável ficou verde no SHA observado; a release `v1.3.2` possui oito assets e manifests verificados; o Supabase Preview permaneceu `unknown/external` e o Rust local continua `blocked-known` por incompatibilidade de toolchain.

A medição não altera a classificação das fases 25–27: estabilização, release candidate e V2 completa continuam não iniciadas. A existência de 115 wrappers `.js` não é dívida de páginas; são fronteiras de compatibilidade mantidas enquanto o grafo legado não for encerrado.

## Regras de transição

Cada próximo marco deverá trabalhar sobre o checkout sincronizado com `main`, alterar poucos arquivos, adicionar teste quando houver mudança funcional, rodar gates, atualizar documentação, gerar relatório, integrar na `main`, verificar novamente o SHA publicado e registrar rollback. Falhas externas de Rust, Supabase, Vercel ou GitHub deverão aparecer como `unknown/external` quando não houver evidência suficiente.

Nenhum módulo externo poderá enviar WhatsApp, publicar conteúdo, executar venda, alterar anúncio ou modificar dados externos sem confirmação explícita do operador. Nenhum papel elevado poderá ser decidido por `localStorage`, query string ou metadata editável pelo cliente.

## Referências

[1]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/420 "Plano 01 — Fundação, Hardening e Transição V1 → V2"

[2]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/422 "Plano 02 — Wiki Project Zomboid na V2"

[3]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/423 "Plano Mestre V2 — Construção, Integração e Evolução Contínua"

## Checkpoint publicado — Briefing → Evidence local — 9c4a2bae

O vertical slice `briefing-evidence-local/v1` foi publicado diretamente na `main` no SHA `9c4a2bae189107aee3a6eafc596b87021b1e745e`. Candidatos de notícias normalizados pelo Briefing agora podem ser projetados na `EvidenceStore` compartilhada através de uma capacidade opcional de contexto. A integração é deduplicada por item, mantém a evidência em `pending`, emite somente eventos categóricos bounded e continua funcionando com fallback `not-configured` quando Evidence não está ativo.

O módulo Evidence passou a emitir `evidence:appended` e `evidence:status-changed` sem incluir statement, fonte completa, URI, token, subject ou metadata externa. O gate `v2:integracao` também recebeu cleanup bounded do servidor Vite para não deixar um processo órfão contaminar a medição seguinte. A primeira falha observada no gate foi classificada como efeito de um preview Vite stale na porta de teste; após limpar o processo externo, a integração passou em `45/45`.

| Evidência | Resultado |
|---|---:|
| `npm run tipos:ts` / `npm run tipos:v2` | Passou |
| Testes focais Briefing + Evidence | 10/10 |
| `npm test` | 1250/1250 |
| `npm run build` | Passou; warnings conhecidos de chunks grandes |
| `npm run v2:integracao` | 45/45 |
| `npm run smoke` / `npm run caminho-critico` | 99/99 / 15/15 |
| Runner local | 21 gates verdes; Rust `blocked-known`, código 101 |
| CI remoto do SHA | 10 checks de workflow verdes |
| Supabase Preview | `unknown/external`: falha de versões de migrations remotas; nenhum DDL ou staging alterado |

O marco aumenta a completude do primeiro vertical slice local, mas não libera Beta: persistência Supabase/RLS, autoridade server-side, health operacional uniforme, aceite físico do app e estabilização mensal continuam pendentes. Rollback: retornar ao commit imediatamente anterior, removendo somente a ligação Briefing→Evidence e o cleanup adicional do harness.

## Checkpoint posterior — Briefing → Evidence pelo Registry — 978e13e3

O Briefing passou a declarar `references.modules: ['evidence']` e resolve `ctx.talvez('evidence', { versao: 1 })` no lifecycle. O harness registra seis módulos ativos, enquanto Evidence permanece sem rota e a navegação mantém cinco entradas. A superfície do Briefing observa a conexão local sem expor conteúdo de Evidence. Focal 10/10; `npm test` 1250/1250; `v2:integracao` 46/46; smoke 99/99; caminho crítico 15/15; runner com 21 gates verdes e Rust local `blocked-known` código 101. Os oito workflows remotos aplicáveis terminaram verdes. Nenhum Supabase, DDL, migration, RLS, Auth de produção ou canal externo foi alterado.


## Checkpoint final — Wiki Zomboid schema pilot / Release 1.2.8 — 77dbfff1

A Phase 06 avançou com o módulo V2 `wiki-zomboid`, o contrato TypeScript `v2/data/wiki-zomboid.ts`, o wrapper JavaScript preservado e a integração opcional com Evidence por `ctx.talvez('evidence', { versao: 1 })`. O piloto usa o catálogo local curado de Project Zomboid, valida Workshop ID e proveniência, mantém campos ausentes vazios e não faz scraping, fetch automático ou persistência remota.

O harness V2 registra sete módulos, 20 rotas internas e seis itens de navegação. As superfícies V1 `/zomboid` e `/zomboid-admin`, o router V1, os 115 wrappers e as 99 rotas do smoke permanecem preservados. A view `/wiki-zomboid` é local/read-only e expõe somente resumo bounded e estado de conexão da Evidence.

**Validação:** teste focal 4/4; `npm test` 1254/1254; `tipos:ts` e `tipos:v2` verdes; build verde; `v2:integracao` 48/48; smoke 99/99; caminho crítico 15/15; runner oficial com 21 gates verdes e Rust local código 101 `blocked-known`; oito workflows remotos verdes; release `v1.2.8` e `desktop-v1.2.8` publicadas após assets Windows, Linux e macOS responderem HTTP 200.

Este checkpoint melhora a Phase 13 — Wiki Infrastructure e a Phase 11 — Vertical Integration, mas não altera os critérios de Alpha/Beta/RC. Persistência Supabase/RLS, autoridade server-side de produção, aceite físico do app, estabilização e testes mensais continuam pendentes e não foram simulados.


## Checkpoint 2026-08-22 — Evidence status observability / Release 1.2.9

O piloto Wiki Zomboid recebeu observabilidade bounded por status da Evidence (`pending`, `verified`, `rejected`, `superseded`). A API continua resolvida pelo Registry e a view V2 mostra somente quantidade vinculada e pendente; não há aprovação, alteração de status ou autoridade client-side. O módulo permanece local/read-only e a V1 segue preservada.

**Evidência:** teste focal 4/4; suíte 1254/1254; `v2:integracao` 48/48; smoke 99/99; caminho crítico 15/15; runner oficial 21 gates verdes com Rust local 101 `blocked-known`; oito workflows remotos verdes no commit funcional e oito no commit de versionamento; Desktop Release verde em Windows, macOS ARM64 e Ubuntu; `v1.2.9` e `desktop-v1.2.9` publicadas com instaladores HTTP 200.

O checkpoint melhora as Phases 06, 11 e 13, mas não fecha Data/Evidence persistente, Auth/RBAC server-side, RLS, aceite físico do app, estabilização, RC ou testes mensais.


## Checkpoint publicado — Wiki Zomboid Evidence review queue / Release 1.3.0 — 2026-08-22

O módulo `wiki-zomboid` agora oferece `reviewQueue(limit)` como read-model local, bounded e read-only. Ela filtra somente registros `pending`, aplica limite padrão 25 e máximo 100, congela a fila e seus itens e retorna exclusivamente `id`, `claimKey`, `status`, `confidence`, `observedAt` e `sourceRevision`. O contrato omite statement, source, URI, publisher, collector, `moduleId`, token, claims e permissões. O fallback sem Evidence retorna uma fila vazia; o teste focal comprova que um registro `verified` não permanece na fila. Nenhuma API de alteração de status foi adicionada ao Wiki.

A integração browser passou 49/49, a suíte completa passou 1254/1254, smoke e caminho crítico passaram 99/99 e 15/15. O runner oficial registrou 20 gates com código 0 e Rust local como `blocked-known` código 101 pela incompatibilidade do Cargo local com `edition2024`. Os oito workflows remotos aplicáveis do commit de versionamento `9ae47cea` terminaram verdes. A release `v1.3.0` e a tag `desktop-v1.3.0` foram publicadas; o Desktop Release `32588898329` passou em Windows, macOS ARM64 e Ubuntu, com oito assets e manifests `latest*.yml` verificados e HTTP 200.

Este checkpoint não fecha a V2 estável. Persistência remota, RLS, Auth/RBAC server-side, revisão humana operacional, retenção, busca e testes mensais permanecem pendentes. O rollback documentado retorna à `v1.2.9` sem apagar tags corretas; o Service Worker usa `baluarte-v1.3.0`.

**Commits do marco:** funcional `3f05e240`, hardening `0ab6f428`, versionamento `9ae47cea`.

**Documentos:** [`WIKI_ZOMBOID_SCHEMA_PILOT_2026-08-22.md`](./WIKI_ZOMBOID_SCHEMA_PILOT_2026-08-22.md), [`PHASE_02_EVIDENCE_SLICE.md`](./PHASE_02_EVIDENCE_SLICE.md) e [`../releases/v1.3.0.md`](../releases/v1.3.0.md).

Cada próximo marco deverá trabalhar sobre o checkout sincronizado com `main`, alterar poucos arquivos, adicionar teste quando houver mudança funcional, rodar gates, atualizar documentação, gerar relatório, integrar na `main`, verificar novamente o SHA publicado e registrar rollback. Falhas externas de Rust, Supabase, Vercel ou GitHub deverão aparecer como `unknown/external` quando não houver evidência suficiente.


## Checkpoint publicado — Evidence retention preview / Release 1.3.1 — 2026-08-22

O commit funcional `752206fb` adicionou `projectEvidenceRetention` ao contrato TypeScript e `retentionPreview(options)` ao módulo Evidence. O preview recebe `now` obrigatório, `maxAgeDays` padrão 30 com teto 3650 e `limit` padrão 25 com teto 100. Classifica itens como `within-window`, `past-window` ou `future-observed`, preserva a ordem append-only, congela a saída e retorna somente `id`, `moduleId`, `status`, `observedAt`, `ageDays` e `retention`, além de resumo bounded. Nenhum registro é apagado ou alterado.

A validação final passou teste focal Evidence `9/9`, suíte `1256/1256`, `tipos:ts`, `tipos:v2`, build com warning conhecido, integração V2 `50/50`, smoke `99/99` e caminho crítico `15/15`. A primeira execução do runner teve falso vermelho em `v2_integracao` porque foi chamada com `PORTA_V2=4195`, enquanto o runner limpa apenas 4193/4194 e encontrou um Vite stale. Após encerrar somente os processos Vite do harness e rerodar em 4193, o runner passou 20 gates com código 0; Rust permaneceu `blocked-known` código 101 pela incompatibilidade do Cargo local com `edition2024`.

O commit funcional `752206fb` e o commit de versionamento `9b734394` tiveram os oito workflows remotos aplicáveis verdes. As tags `v1.3.1` e `desktop-v1.3.1` apontam para `9b734394`. O Desktop Release `32592402608` passou em Windows, macOS ARM64 e Ubuntu. A release pública `v1.3.1` não é draft nem prerelease, possui oito assets, os manifests declaram `version: 1.3.1` e todos os downloads responderam HTTP 200. O Service Worker usa `baluarte-v1.3.1`.

O próximo marco recomendado continua sendo retenção operacional e auditoria de consumidor, sem descarte client-side, seguido somente de decisão separada sobre persistência Supabase/RLS com staging, custo, tenancy e rollback aprovados.


## Checkpoint publicado — Evidence audit preview / Release 1.3.2 — 2026-08-22

O último marco publicou `projectEvidenceAudit` no contrato TypeScript e `auditPreview(options?)` no módulo Evidence. O contrato aceita chamada sem opções, filtro opcional por `moduleId`, limite padrão 25 e máximo 100, preserva a ordem append-only, congela a saída e projeta somente `id`, `moduleId`, `status` e `observedAt`. O resumo informa somente registros devolvidos, contagens por status e `truncated`; conteúdo de claim, fonte, tokens, claims e permissões continuam excluídos.

| Evidência | Resultado |
|---|---:|
| Commit funcional | `dbd09f52` |
| Commit de versionamento | `5d2142d7` |
| Teste focal Evidence | `11/11` |
| Suíte completa | `1258/1258` |
| Integração V2 | `51/51` |
| Smoke / caminho crítico | `99/99` / `15/15` |
| Runner oficial | 20 gates de código 0; Rust 101 `blocked-known` |
| CI remota funcional/versionamento | 8/8 workflows verdes em cada SHA |
| Desktop Release | `32595313050`, Windows/macOS ARM64/Ubuntu verdes |
| Release operacional | `v1.3.2` e `desktop-v1.3.2` públicas; oito assets e manifests verificados |

A release `1.3.2` é incremental e não declara a V2 estável. A V1, o router e os wrappers foram preservados. O próximo passo é uma política operacional de retenção e auditoria server-side com identidade, tenancy, ownership, concorrência e rollback; persistência Supabase/RLS continua bloqueada sem aprovação explícita. As fases 25–27 permanecem não iniciadas.


## Checkpoint publicado — V2 `v2.0.0-alpha.1` / Runtime Group Observability — 2026-08-25

A primeira pré-release acompanhável da V2 publica a composição `RuntimeManagerGroup → RuntimeGroupLifecycle → RuntimeStateEvents → RuntimeSupervisor`. O `RuntimeGroupStatus` ganhou `status()` compatível com o supervisor e preservou `snapshot()`. Os hooks de grupo foram alinhados para arrays somente leitura, e a ponte de observabilidade redige erros antes de gravá-los no histórico.

| Evidência | Resultado |
|---|---:|
| PR | [#472](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/472), mesclada sem conflito |
| SHA publicado na `main` | `efdeaf8e` |
| Teste focal da observabilidade | `8/8` |
| Suíte completa | `1351` aprovados, `6` ignorados |
| `tipos:v2` / build | passaram |
| Integração V2 | `58/58` |
| Smoke / caminho crítico | `99/99` / `15/15` |
| CI remoto aplicável | `11` sucesso, `1` skipped |
| Release | [`v2.0.0-alpha.1`](../releases/v2.0.0-alpha.1.md), pré-release |

Este marco não declara a V2 estável. Retry por classe de evento, persistência remota, Supabase/RLS, claims de autoridade, promoção operacional e uso do Runtime como autoridade de produção permanecem fora do escopo ou bloqueados por decisão/staging. A V1, o router, o shell e os módulos de produto foram preservados. A próxima frente deve ser outro slice local previsto na matriz, com política explícita e gates completos antes de uma nova alpha.


## Checkpoint de código — Server Observation UI / Auth read-only slice — 2026-08-25

O cliente `server-observation-http/v1` passou a ter uma integração read-only na UI do JARVIS. O modo Servidor resolve apenas endpoints controlados (`/api/observability` same-origin em HTTPS ou `/observability/observe` no FastAPI local/explicitamente configurado), faz GET sem body e projeta o resultado para `RuntimeObservation`. Endpoint inválido não tenta rede; timeout, HTTP, rate limit e rede viram estados bounded; tokens, corpos e mensagens externas não chegam à UI.

| Evidência | Resultado |
|---|---:|
| Teste focal server-observation UI | `5/5` |
| Regressão JARVIS + observação HTTP | `9/9` |
| `npm run tipos:ts` / `npm run tipos:v2` | passaram |
| `npm test` | `1355` aprovados, `6` ignorados |
| `npm run build` | passou; warning conhecido de chunks grandes |
| `npm run v2:integracao` | `58/58` |
| `npm run smoke` | `99/99` |
| `npm run caminho-critico` | `15/15` |
| `npm run prova-offline` | `9/9` |
| `npm run sonda-memoria` | passou; nenhuma rota acumulou timer, loop ou áudio |
| Security Contracts Node 24 | `72/72` no dispatch manual do workflow |

O slice não altera Auth, RLS, roles, `runtimeAuthority`, `publicPromotionAllowed`, refresh, logout, cache, retry ou promoção operacional. O próximo passo de Auth continua sendo um contrato separado para refresh/redirect real; o cliente server-observation permanece observação manual e não autorizada.


## Release publicada — V2 `v2.0.0-alpha.2` / Auth server-observation UI — 2026-08-25

A `v2.0.0-alpha.2` marca a integração do cliente `server-observation-http/v1` à UI do modo Servidor do JARVIS. O marco foi mesclado pela PR #474 no SHA `42c8741d` e publicado como pré-release acompanhável.

| Evidência | Resultado |
|---|---:|
| Release | [`v2.0.0-alpha.2`](../releases/v2.0.0-alpha.2.md), pré-release |
| PR | [#474](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/474), mesclada |
| CI remoto | `12` sucessos, `1` skipped |
| Security Contracts Node 24 | `72/72` |
| Suíte / integração V2 | `1355` aprovados, `6` ignorados / `58/58` |
| Smoke / caminho crítico | `99/99` / `15/15` |
| Offline / memória | `9/9` / sem acúmulo de timer, loop ou áudio |

A release não declara a V2 estável. Login, refresh/redirect, logout, Supabase Auth, RLS, tenancy, claims de autoridade, roles, retry, cache, persistência e promoção operacional permanecem fora do escopo. O `Supabase Preview` permaneceu skipped por política e nenhuma escrita remota foi executada.


## Release em preparação — V2 `v2.0.0-alpha.3` / Evidence review queue — 2026-08-25

A alpha.3 acompanha a centralização da fila local de revisão Evidence no commit `9784e161`. `projectEvidenceReviewQueue()` e `EvidenceStore.reviewQueue()` selecionam somente registros `pending`, com escopo opcional por módulo, limite padrão 25/teto 100, ordem append-only, resumo de truncamento e projeção congelada. O Wiki Zomboid delega a política sem quebrar sua API legada.

| Evidência | Resultado |
|---|---:|
| PR | [#476](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/476), mesclada |
| Teste focal Evidence + Wiki Zomboid | `11/11` |
| Suíte / integração V2 | `1357` aprovados, `6` ignorados / `58/58` |
| Tipos TS/V2 e build | passaram; warning conhecido de chunks grandes |
| Smoke / caminho crítico | `99/99` / `15/15` |
| Offline / memória | `9/9` / sem acúmulo de timer, loop ou áudio |
| Security Contracts Node 24 | `73/73` |
| CI remoto da PR | `10` sucessos, `1` skipped |
| Release | [`v2.0.0-alpha.3`](../releases/v2.0.0-alpha.3.md), pré-release em preparação |

A fila não altera status, cria tarefas, envia rede, grava banco, remove evidência, concede autoridade ou implementa revisão humana server-side. Persistência Postgres/Supabase, RLS, tenancy, ownership, concorrência remota, retenção operacional e exportação continuam fora do escopo ou dependentes de decisão/staging separados.


## Release em preparação — V2 `v2.0.0-alpha.4` / Event Bus latency health — 2026-08-25

A alpha.4 acompanha o resumo local e bounded de latência do Event Bus, mesclado no SHA `3efab862`. `bus.saude().latencia` expõe `n`, média, mínimo e máximo, sem array de amostras, sem threshold e sem mudar readiness, correlação, isolamento ou autoridade.

| Evidência | Resultado |
|---|---:|
| PR | [#478](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/478), mesclada |
| Testes focais Event Bus | `51/51` |
| Suíte / integração V2 | passou / `58/58` |
| Tipos TS/V2 e build | passaram; warning conhecido de chunks grandes |
| Smoke / caminho crítico | `99/99` / `15/15` |
| Offline / memória | `9/9` / sem acúmulo detectado |
| Security Contracts Node 24 | `73/73` |
| CI remoto da PR | `11` sucessos, `1` skipped |
| Release | [`v2.0.0-alpha.4`](../releases/v2.0.0-alpha.4.md), pré-release em preparação |

A latência permanece observação local e read-only. Retry, thresholds, percentis, alertas, persistência, rede, Supabase/RLS, tenancy, ownership, revisão humana server-side e promoção operacional continuam fora do escopo ou bloqueados por contrato/staging.


## Release em preparação — V2 `v2.0.0-alpha.5` / Event Bus latency budget — 2026-08-25

A alpha.5 acompanha o benchmark offline do Event Bus no commit funcional `6d0d168`. O comando `npm run bench:event-bus` mede três cargas de ouvintes, valida entrega completa e confere o contador interno de latência. A execução observada ficou entre `9,460` e `10,103 µs` por despacho externo no sandbox Linux/Node 22, sem transformar o número em threshold.

| Evidência | Resultado |
|---|---:|
| PR | [#481](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/481), mesclada |
| Benchmark | passou em 20.000 operações por cenário |
| Suíte / integração V2 | passou / `58/58` |
| Tipos TS/V2 e build | passaram; warning conhecido de chunks grandes |
| Smoke / caminho crítico | `99/99` / `15/15` |
| Offline / memória | `9/9` / sem acúmulo detectado |
| Security Contracts Node 24 | `73/73` |
| CI remoto da PR | `11` sucessos, `1` skipped |
| Release | [`v2.0.0-alpha.5`](../releases/v2.0.0-alpha.5.md), pré-release em preparação |

O benchmark fecha apenas uma evidência local de custo. Retry, threshold operacional, percentis, alertas, backpressure, hardware de usuário, persistência, RLS, ownership e autoridade continuam fora do escopo.


## Release em preparação — V2 `v2.0.0-alpha.10` / Evidence local bounded search — 2026-08-26

A alpha.10 acompanha a busca local bounded da Evidence, mesclada no commit funcional `dcdb7ff`. A API consulta somente metadados estruturais em memória, preserva a ordem append-only e não concede autoridade.

| Evidência | Resultado |
|---|---:|
| PR | [#491](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/491), mesclada |
| Testes Evidence + module | `14/14` |
| Limite | padrão `25`, teto `100` |
| Redaction | sem statement, URI, publisher ou collector |
| Suíte / integração V2 | passou / `58/58` |
| Tipos TS/V2 e build | passaram; warning conhecido de chunks grandes |
| Smoke / caminho crítico | `99/99` / `15/15` |
| Offline / memória | `9/9` / sem acúmulo detectado |
| Security Contracts Node 24 | `73/73` |
| CI remoto da PR | `11` sucessos, `1` skipped |
| Release | [`v2.0.0-alpha.10`](../releases/v2.0.0-alpha.10.md), pré-release em preparação |

A busca não é full-text, ranking, pgvector ou índice persistente. Não usa rede, banco, Supabase, RLS, ownership, tenancy, revisão humana ou autoridade.


## Release em preparação — V2 `v2.0.0-alpha.9` / Local backup-restore drill — 2026-08-26

A alpha.9 acompanha o ensaio local reproduzível de backup/restore do `RECOVERY-001`, mesclado no commit funcional `69fbd92`. O comando `npm run drill:v2:backup` exercita a ponte existente em fallback in-memory, com limpeza garantida no final.

| Evidência | Resultado |
|---|---:|
| PR | [#489](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/489), mesclada |
| Drill local | passou; backup validado, três chaves restauradas |
| Proteções | sessão excluída; chave desconhecida ignorada |
| Suíte canônica backup | `14/14` |
| Suíte / integração V2 | passou / `58/58` |
| Tipos TS/V2 e build | passaram; warning conhecido de chunks grandes |
| Smoke / caminho crítico | `99/99` / `15/15` |
| Offline / memória | `9/9` / sem acúmulo detectado |
| Security Contracts Node 24 | `73/73` |
| CI remoto da PR | `11` sucessos, `1` skipped |
| Release | [`v2.0.0-alpha.9`](../releases/v2.0.0-alpha.9.md), pré-release em preparação |

O drill não aprova RPO/RTO, durabilidade, criptografia, retenção, ownership, tenancy, auditoria ou recuperação remota. Nenhuma escrita de produção foi executada.


## Release em preparação — V2 `v2.0.0-alpha.8` / Task Manager duration health — 2026-08-25

A alpha.8 acompanha o resumo local e bounded de duração das tarefas no `escalonador.saude()`, mesclado no commit funcional `e82c62b`. O campo expõe `n`, `mediaMs`, `minMs` e `maxMs` para tarefas que iniciaram, incluindo sucesso e falha, sem contar cancelamento pré-início.

| Evidência | Resultado |
|---|---:|
| PR | [#487](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/487), mesclada |
| Testes focais Task Manager | `35/35` |
| Suíte / integração V2 | passou / `58/58` |
| Tipos TS/V2 e build | passaram; warning conhecido de chunks grandes |
| Smoke / caminho crítico | `99/99` / `15/15` |
| Offline / memória | `9/9` / sem acúmulo detectado |
| Security Contracts Node 24 | `73/73` |
| CI remoto da PR | `11` sucessos, `1` skipped |
| Release | [`v2.0.0-alpha.8`](../releases/v2.0.0-alpha.8.md), pré-release em preparação |

A duração é observação acumulada e independente de métricas opcionais. Não escolhe threshold, degrada readiness, inicia retry, concede autoridade ou altera a V1.


## Release em preparação — V2 `v2.0.0-alpha.7` / Doctor bounded evidence replay — 2026-08-25

A alpha.7 acompanha os limites de replay do `verify:v2 --evidence` no commit funcional `a1af93c`. O Doctor rejeita arquivos acima de `256 KiB` ou listas acima de `100` registros antes de normalizar a evidência; não há truncamento silencioso.

| Evidência | Resultado |
|---|---:|
| PR | [#485](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/485), mesclada |
| Teste focal Doctor | `8/8` |
| Limites | `256 KiB` / `100` registros |
| Suíte / integração V2 | passou / `58/58` |
| Tipos TS/V2 e build | passaram; warning conhecido de chunks grandes |
| Smoke / caminho crítico | `99/99` / `15/15` |
| Offline / memória | `9/9` / sem acúmulo detectado |
| Security Contracts Node 24 | `73/73` |
| CI remoto da PR | `10` sucessos, `1` skipped |
| Release | [`v2.0.0-alpha.7`](../releases/v2.0.0-alpha.7.md), pré-release em preparação |

O replay limitado protege a entrada do Doctor e mantém estados não-verdes honestos. Nenhuma persistência, rede, RLS, Auth, ownership, revisão humana ou autoridade foi adicionada.


## Release em preparação — V2 `v2.0.0-alpha.6` / Doctor environment classification — 2026-08-25

A alpha.6 acompanha o hardening do `verify:v2` no commit funcional `8bf27ac`. A ausência exata do SDK opcional `google-genai` nos dois transportes Python declarados passa a ser `blocked-known`, enquanto falhas não reconhecidas continuam `failed` e Cargo ausente continua `unknown`.

| Evidência | Resultado |
|---|---:|
| PR | [#483](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/483), mesclada |
| Teste focal Doctor | `7/7` |
| Catálogo | `22` registros bounded; benchmark Event Bus incluído |
| Suíte / integração V2 | passou / `58/58` |
| Tipos TS/V2 e build | passaram; warning conhecido de chunks grandes |
| Smoke / caminho crítico | `99/99` / `15/15` |
| Offline / memória | `9/9` / sem acúmulo detectado |
| Security Contracts Node 24 | `73/73` |
| CI remoto da PR | `10` sucessos, `1` skipped |
| Doctor local | Python transport `blocked-known`; Rust `unknown` por Cargo indisponível |
| Release | [`v2.0.0-alpha.6`](../releases/v2.0.0-alpha.6.md), pré-release em preparação |

A alpha.6 não instala dependências nem mascara `unknown`: o Doctor mantém saída não-verde quando não consegue classificar o runtime Rust. Não foram adicionados retry, persistência, RLS, tenancy, ownership, revisão humana ou autoridade.


## Gate de decisão — Evidence ownership e retenção operacional — 2026-08-25

A auditoria publicada em [`EVIDENCE_OWNERSHIP_RETENTION_GATE_2026-08-25.md`](./EVIDENCE_OWNERSHIP_RETENTION_GATE_2026-08-25.md) concluiu que não existe um slice local seguro para adicionar `ownerId`, `tenantId`, `eligibleForDeletion` ou aprovação humana. `moduleId` identifica o namespace produtor, não propriedade operacional. A camada local mantém `retentionPreview`, `auditPreview` e `reviewQueue` como projeções bounded e read-only.

O próximo avanço de ownership/retenção fica bloqueado até contrato server-side com identidade, tenancy, RLS/membership, concorrência, auditoria, política de retenção, rollback, custo e staging aprovados. Nenhum código, migration, rota, storage, permissão ou escrita remota foi criado neste gate.


## Checkpoint documental — V2 `v2.0.0-alpha.11` / Evidence search benchmark — 2026-08-26

O slice técnico da alpha.11 foi integrado na `main` no SHA `3b7950f9fe5f70056159044263cdf90ccd458a6c` pela PR [#493](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/493). O comando `npm run bench:evidence-search` mede a busca Evidence local bounded sobre o catálogo real curado `PZ_IDS`, com `159` entradas, `640` registros derivados, quatro cenários e `250` repetições por cenário. As médias das duas execuções estão registradas em [`EVIDENCE_SEARCH_BENCHMARK_2026-08-26.md`](./EVIDENCE_SEARCH_BENCHMARK_2026-08-26.md), incluindo a variação do sandbox.

| Evidência | Resultado |
|---|---:|
| Commit funcional na `main` | `3b7950f9` |
| PR técnica | `#493`, mesclada com squash |
| Benchmark | duas execuções; 4 cenários × 250 repetições |
| Dataset | `159` mods curados / `640` registros Evidence |
| Testes focais Evidence + module | `14/14` |
| Suíte completa | `1370` aprovados, `6` ignorados, zero falhas |
| Integração V2 | `58/58` |
| Smoke / caminho crítico | `99/99` / `15/15` |
| Offline / memória | `9/9` / sem acúmulo detectado |
| Security Contracts Node 24 | `73/73` |
| CI remoto da PR técnica | `11` sucessos, `1` skipped, nenhum pendente |

Este checkpoint atende parcialmente a lacuna de medição da busca local, mas não fecha a decisão de search/index da V2. A busca continua linear em memória, sem full-text, ranking, pgvector, índice persistente, consulta remota ou threshold/SLA de produção. Persistência Evidence server-side, ownership, tenancy, RLS, revisão humana, Auth real, retenção operacional e autoridade continuam bloqueados por contrato, staging, custo e rollback próprios. A V1, o router e os módulos existentes permanecem preservados.

A pré-release `v2.0.0-alpha.11` será criada somente após esta documentação passar pelos checks remotos e ser mesclada na `main`; nenhum tag ou release é implícito por este checkpoint documental.


## Checkpoint documental — V2 `v2.0.0-alpha.12` / Route render benchmark — 2026-08-26

O benchmark de renderização das rotas reais foi integrado na `main` no SHA `fef61db938913fcdbdecd537b016d0dd5001289b` pela PR [#495](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/495). O comando `npm run bench:routes` descobre `99` rotas de `src/main.js`, abre cada rota em Chromium contra preview de produção, mede navegação e settle bounded e fecha cada página imediatamente.

| Evidência | Resultado |
|---|---:|
| Commit funcional na `main` | `fef61db9` |
| PR técnica | `#495`, mesclada com squash |
| Benchmark | `99/99` rotas × `3` repetições |
| Navegação | p50 `163,186 ms`; p95 `190,465 ms`; média `166,612 ms`; máximo `404,826 ms` |
| Observação após settle | p50 `1104,435 ms`; p95 `1236,586 ms`; média `1122,866 ms`; máximo `1457,885 ms` |
| Suíte completa | `1370` aprovados, `6` ignorados, zero falhas |
| Integração V2 | `58/58` |
| Smoke / caminho crítico | `99/99` / `15/15` |
| Offline / memória | `9/9` / sem acúmulo detectado |
| Security Contracts Node 24 | `73/73` |
| CI remoto da PR técnica | `11` sucessos, `1` skipped, nenhum pendente |

Este checkpoint atende parcialmente a medição da Phase 21 — Performance e preserva o smoke como gate funcional. Os tempos dependem do ambiente local, incluem settle deliberado para lazy routes e não estabelecem SLA, threshold, budget, Web Vitals, comparação de hardware ou política de regressão. Não foram adicionadas persistência, rede, Auth, RLS, tenancy, ownership, permissão ou autoridade.

A pré-release `v2.0.0-alpha.12` será criada somente após esta documentação passar pelos checks remotos e ser mesclada na `main`; nenhum tag ou release é implícito por este checkpoint documental.


## Checkpoint documental — V2 `v2.0.0-alpha.13` / Boot real da Plataforma — 2026-08-26

O benchmark do boot real da Plataforma V2 foi integrado na `main` no SHA `ac89b65a6aec3cc67db9eea9e780e2723c2164ad` pela PR [#497](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/497). O comando `npm run bench:v2:boot` observa o harness existente `v2/harness/index.html#/cripto`, produzido por `criarPlataforma(...).iniciar()`, sem recriar o Core ou alterar o router V1.

| Evidência | Resultado |
|---|---:|
| Commit funcional na `main` | `ac89b65a` |
| PR técnica | `#497`, mesclada com squash |
| Repetições | duas execuções de `5` amostras |
| Invariantes | `ready`, 7 módulos vivos, 0 falhas de boot, 20 rotas V1 em todas as 10 amostras |
| Boot interno — execução 1 | p50/p95/média/máximo `14/14/14/14 ms` |
| Boot interno — execução 2 | p50/p95/média/máximo `14/15/14,2/15 ms` |
| Browser até `window.__v2.partida` — execução 1 | `225,801/783,116/329,453/783,116 ms` |
| Browser até `window.__v2.partida` — execução 2 | `214,871/855,046/342,108/855,046 ms` |
| Suíte completa | `1370` aprovados, `6` ignorados, zero falhas |
| Integração V2 | `58/58` |
| Smoke / caminho crítico | `99/99` / `15/15` |
| Offline / memória | `9/9` / sem acúmulo detectado |
| Security Contracts Node 24 | `73/73` |
| CI remoto da PR técnica | `11` sucessos, `1` skipped, nenhum pendente |

Este checkpoint atende parcialmente a medição de startup das Phases 02/21. Os relógios são diferentes: `bootInterno` vem do Supervisor e `browserReady` inclui navegação, serving, execução e observação do harness. Ambos permanecem diagnóstico local e não estabelecem SLA, threshold, budget de produção, Web Vital, hardware matrix ou política de regressão. O preview é aceito somente com marcadores do HTML do harness, evitando que um `200` do site V1 stale seja confundido com sucesso V2.

A pré-release `v2.0.0-alpha.13` será criada somente após esta documentação passar pelos checks remotos e ser mesclada na `main`; nenhum tag ou release é implícito por este checkpoint documental.


## Checkpoint documental — V2 `v2.0.0-alpha.14` / Doctor storage catalog — 2026-08-26

O Doctor passou a verificar o catálogo canônico de storage local por meio do registro seguro `storage_catalog`. O marco foi integrado na `main` no SHA `52810d0b7d867ca72552f3a14e3bdf87a21fdb3b` pela PR [#499](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/499).

| Evidência | Resultado |
|---|---:|
| Commit funcional na `main` | `52810d0b` |
| PR técnica | `#499`, mesclada com squash |
| Novo check | `storage_catalog` / `data-contracts` / `safe` |
| Comando verificado | `node scripts/gen-catalogo-storage.mjs --verificar` |
| Catálogo | `72` chaves declaradas com migração; estado `green` |
| Doctor | `23` registros: `15` green, `2` blocked-known, `1` unknown, `5` not-run, `0` failed |
| Teste focal | `9/9` |
| Integração V2 | `58/58` |
| Smoke / caminho crítico | `99/99` / `15/15` |
| Offline / memória | `9/9` / sem acúmulo detectado |
| Security Contracts Node 24 | `73/73` |
| CI remoto da PR técnica | `10` sucessos, `1` skipped, nenhum pendente |

O check é somente leitura: não escreve catálogo, não corrige divergências, não instala SDK, não inicia harness, não mata processos, não executa migrations e não consulta Supabase. O Cargo ausente permaneceu `unknown` e produziu `exit 2` no Doctor; os transportes Python opcionais sem SDK permaneceram `blocked-known`. Nenhum estado não verde foi convertido em sucesso.

Este checkpoint atende parcialmente a governança local da Phase 05/23. Persistência remota, ownership, tenancy, RLS, revisão humana, Auth real, retenção operacional e autoridade continuam bloqueados por seus contratos e dependências próprios. A pré-release `v2.0.0-alpha.14` somente será criada após a PR documental passar pelos checks remotos e ser mesclada; nenhum tag ou release é implícito por este checkpoint.

## Checkpoint publicado — V2 `v2.0.0-alpha.15` / Project Registry local read-only — 2026-08-26

A `v2.0.0-alpha.15` publicou o slice `project-registry-local` no SHA `82d2c05cdd9fc3b7a68170b808795f2a218d3af1`, integrado pela PR [#502](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/502). O catálogo local contém quatro candidatos citados no Master Plan: `Veritas`, `DailyPlanner`, `Stock Analyzer Bot` e `Project Vanguard`. Todos permanecem `auditState: not-audited` e `decision: defer`, pois nenhuma auditoria externa foi realizada.

| Evidência | Resultado |
|---|---:|
| Commit funcional na `main` | `82d2c05` |
| PR técnica | `#502`, mesclada com squash |
| Catálogo | 4 entradas conservadoras |
| Comando | `npm run check:project-registry` |
| Teste focal | `5/5` |
| Suíte completa | `1376` aprovados, `6` ignorados, zero falhas |
| Integração V2 | `58/58` |
| Smoke / caminho crítico | `99/99` / `15/15` |
| Offline / memória | `9/9` / sem acúmulo detectado |
| Security Contracts Node 24 | `73/73` |
| CI remoto da PR técnica | `11` sucessos, `1` skipped, nenhum pendente |
| Vercel Preview | concluído verde |

O marco avança apenas a governança local da Phase 14. O Project Registry é read-only e bounded, não consulta, baixa, instala, importa, executa ou autoriza repositórios externos. Não inventa URL, licença, manutenção, arquitetura, capability, risco ou custo; não cria marketplace, plugin loader, adapter, bridge, Auth, RLS, Supabase, ownership, tenancy, persistência ou autoridade. A Phase 14 permanece parcial e a integração externa continua dependente de auditoria passiva, licença, segurança, contrato, isolamento e decisão explícita.


## Checkpoint publicado — V2 `v2.0.0-alpha.16` / Module Mode Policy fake server-side local — 2026-08-26

A `v2.0.0-alpha.16` publicou o slice `module-registry-mode-policy/v1` no SHA integrado `5820b6aa61c9b32607ca6a19580dc1f315021a51`, pela PR [#504](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/504). A implementação local é uma fixture determinística e in-memory que expõe exatamente quatro identidades sintéticas (`fixture-user`, `fixture-admin`, `fixture-dev` e `fixture-owner`) nos papéis fechados `user`, `admin`, `dev` e `owner`.

| Evidência | Resultado |
|---|---:|
| Commit funcional da slice | `3ec2eb1` |
| SHA integrado na `main` | `5820b6a` |
| PR técnica | `#504`, mesclada com squash |
| Verificador | `npm run check:module-mode-policy` |
| Matriz da fixture | 4 identidades, 6 casos, 3 allow / 3 deny |
| Spoof de `actorRole` client-side | deny |
| Teste focal | `8/8` |
| Suíte completa | `1384` aprovados, `6` ignorados, zero falhas |
| Integração V2 | `58/58` |
| Smoke / caminho crítico | `99/99` / `15/15` |
| Offline / memória | `9/9` / sem acúmulo detectado |
| Security Contracts selecionados | `76/76` |
| Doctor com dependências | `15` green, `2` blocked-known, `1` unknown, `5` not-run, `0` failed |
| CI remoto da PR técnica | `11` sucessos, `1` skipped, nenhum pendente |
| Vercel Preview | concluído verde |

O checkpoint avança a fronteira local de `MODULE-RBAC-001`, mas não implementa Auth, JWT, claims, service role, Supabase, SQL, migration, RLS, tenancy, ownership, rede, persistência, retry, restart, fila, mutação remota ou promoção pública. O campo `actorRole` do request é ignorado; a origem das identidades é fixa em `server-test-fixture`. A fixture fornece apenas decisões sintéticas ao callback auditado do Module Registry Health e não é autoridade de produção.

A documentação do contrato está em [`MODULE_MODE_POLICY_LOCAL_CONTRACT_2026-08-26.md`](./MODULE_MODE_POLICY_LOCAL_CONTRACT_2026-08-26.md). A auditoria real em staging permanece dependente de quatro identidades isoladas, políticas RLS verificáveis, cleanup idempotente, auditoria persistente, revisão de segurança, custo e rollback aprovados. A Phase 5/14/22 continua parcial nas fronteiras remotas; o `unknown`, `blocked-known` e `not-run` do Doctor permanecem estados honestos.


## Checkpoint técnico integrado — V2 `v2.0.0-alpha.17` / Doctor observa Module Mode Policy — 2026-08-26

O slice de observabilidade do Doctor foi integrado pela PR [#506](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/506) no SHA `8917525eb0f7dfdbe6b4092560de4e27ead1921f`, sobre a alpha.16 em `635fbc0bee694a13e97c307f906be864c9237a91`. A documentação foi finalizada pelas PRs [#507](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/507), [#508](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/508) e [#509](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/509), e a tag `v2.0.0-alpha.17` foi publicada no SHA final `0c85f35a5266945ed347ab87ed607b669363271a`.

| Evidência | Resultado |
|---|---:|
| Commit funcional da slice | `8f894e4` |
| SHA integrado na `main` | `8917525` |
| PR técnica | `#506`, mesclada com squash |
| Backup pré-merge | `backup/2026-08-26-before-v2-doctor-mode-check` |
| Check novo | `module_mode_policy`, `green` |
| Verificador da fixture | 4 identidades, 6 casos, 3 allow / 3 deny, spoof deny |
| Teste focal do Doctor | `10/10` |
| Suíte completa | `1385` aprovados, `6` ignorados, zero falhas |
| Integração / smoke / caminho crítico | `58/58` / `99/99` / `15/15` |
| Offline / Security Contracts | `9/9` / `76/76` |
| Doctor com dependências | 16 green, 2 blocked-known, 1 unknown, 5 not-run, 0 failed |
| CI remoto da PR técnica | 10 sucessos, 1 skipped, nenhum pendente |
| Workflows pós-merge do SHA | todos verdes |

A alpha.17 somente melhora a observabilidade local do contrato já existente. Não implementa Auth, JWT, claims, service role, Supabase, SQL, migration, RLS, tenancy, ownership, persistência, auditoria remota, retenção operacional, rede, retry, fila, restart ou autoridade de produção. V1, router, sidebar, boot, Storage, Evidence, Event Bus e Service Worker permanecem preservados.

O Doctor mantém estados honestos: o novo check pode estar `green`, mas o relatório global retorna exit `2` quando Cargo permanece `unknown`; `blocked-known` e `not-run` não são convertidos. A documentação contratual está em [`V2_DOCTOR_MODULE_MODE_CHECK_2026-08-26.md`](./V2_DOCTOR_MODULE_MODE_CHECK_2026-08-26.md), e a nota de release está em [`v2.0.0-alpha.17.md`](../releases/v2.0.0-alpha.17.md).


## Fechamento documental — V2 `v2.0.0-alpha.17` — 2026-08-26

A documentação da alpha.17 foi iniciada pela PR [#507](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/507) no SHA `379f6670ce5e8544a898d92a37869beb80b93545`, finalizada pela PR [#508](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/508) no SHA `f06bbb90252ebc798ea3d94d85ffc60a9b4608e2` e alinhada ao SHA final pela PR [#509](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/509), após os checks aplicáveis terminarem verdes. A tag `v2.0.0-alpha.17` foi então publicada no SHA final `0c85f35a5266945ed347ab87ed607b669363271a`.

| Evidência | Resultado |
|---|---:|
| PR documental inicial | `#507`, squash-merged |
| PR de finalização | `#508`, squash-merged |
| SHA documental intermediário | `f06bbb9` |
| PR de alinhamento final | `#509`, squash-merged |
| SHA final da main e da release | `0c85f35a` |
| CI pós-merge final | workflows aplicáveis verdes |
| Tag alpha.17 | publicada como pré-release |

A correção não alterou código, contratos, V1, router, boot, Storage, Evidence, Auth, RLS, Supabase, workflows ou autoridade operacional. A release publicada aponta para o SHA final `0c85f35a5266945ed347ab87ed607b669363271a`; a próxima documentação de alpha é a alpha.18, referente ao Runtime desktop empacotado integrado no SHA `ca325d03`.


## Checkpoint técnico integrado — V2 `v2.0.0-alpha.18` / Runtime desktop empacotado — 2026-08-26

O slice da PR [#510](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/510) foi squash-merged no SHA `ca325d03fbddf77b43b64519ba2f69cdf4f07f4f`. O gate `V2 Desktop Packaged Runtime` constrói o bundle web, compila o binário Rust em release, empacota o Electron usando a configuração real de `desktop/package.json` e executa o artefato `linux-unpacked` sob Xvfb. O smoke prova `process.resourcesPath`, autorização, leitura confinada e rejeição de `../`.

| Evidência | Resultado |
|---|---:|
| PR técnica | `#510`, mesclada com squash |
| SHA integrado na `main` | `ca325d03` |
| Backup pré-merge | `backup/2026-08-26-before-v2-packaged-runtime` |
| Workflow PR | `33021833916`, sucesso |
| Workflow pós-merge específico | `33022206259`, sucesso |
| Workflows pós-merge do SHA | `9/9` sucesso |
| Teste focal desktop | `7` aprovados, `1` ignorado honesto, zero falhas |
| Suíte / integração / smoke / caminho crítico | `1385/6/0` / passou / `99/99` / `15/15` |
| Offline / memória / Security Contracts | `9/9` / passou / `73/73` |
| Doctor | `16` green, `2` blocked-known, `1` unknown, `5` not-run, `0` failed; exit `2` |

Este checkpoint fecha a lacuna de localização e comunicação do Runtime no pacote Linux dentro do escopo `linux-unpacked`. O sandbox local não possui `cargo`, portanto o smoke empacotado local permanece bloqueado ambientalmente; a prova final veio do workflow remoto com toolchain Rust. Windows/macOS físicos, assinatura, NSIS/DMG/AppImage instalado, auto-update, OAuth, câmera, microfone, persistência, Auth/RLS e autoridade de produção continuam pendentes. V1, router, sidebar, wrappers, Service Worker e launcher normal permanecem preservados.

A nota está em [`../releases/v2.0.0-alpha.18.md`](../releases/v2.0.0-alpha.18.md), o contrato em [`V2_PACKAGED_RUNTIME_CONTRACT_2026-08-26.md`](./V2_PACKAGED_RUNTIME_CONTRACT_2026-08-26.md) e a auditoria em [`V2_PACKAGED_RUNTIME_AUDIT_2026-08-26.md`](./V2_PACKAGED_RUNTIME_AUDIT_2026-08-26.md). A tag/release alpha.18 somente será criada após a documentação final, os gates do SHA documental e a verificação do SHA publicado.


## Checkpoint alpha.19 — Module Registry Health observável

| Marco | Estado | Evidência | Limites |
|---|---|---|---|
| Verificador local/read-only de Health | `IMPLEMENTED / VALIDATING` | `npm run check:module-registry-health`; 6 casos, 3 allow, 3 deny; desconhecido, saudável, degraded, quarantined, maintenance auditada, negação server-side e cópia defensiva | Não executa módulo real, não acessa rede/storage e não substitui RLS ou autorização de produção |
| Doctor `module_registry_health` | `IMPLEMENTED / VALIDATING` | Check `safe` integrado em `scripts/v2-doctor.mjs`; Doctor `17 green`, `2 blocked-known`, `1 unknown`, `5 not-run`, `0 failed`, exit `2` honesto | Cargo permanece `unknown` no sandbox; checks mutantes/remotos continuam separados |
| Reconciliação de Project Registry | `DEFERRED` | Busca GitHub read-only não produziu fonte oficial inequívoca com licença/identidade suficientes; quatro entradas continuam `not-audited/defer` | Não promover, adaptar, importar ou executar projeto externo sem fonte oficial, licença, evidência, revisão e rollback |
| Gates locais | `GREEN` | Focal `32/32`; suíte `1386` pass, `6` skipped, `0` fail; integração `58/58`; smoke `99/99`; caminho `15/15`; offline `9/9`; Security Contracts `73/73` | Build e harness geram artefatos que devem ser limpos antes do commit |
| Release | `PENDING DOCUMENTATION/REMOTE` | PR técnica #514 merged no SHA `17d1acc`; contrato, auditoria e nota alpha.19 presentes; PR documental final ainda pendente | Não criar tag/release antes de PR documental, backup, checks completos e workflows pós-merge |


## Checkpoint 2026-08-27 — Platform Diagnostic / Task Manager Health

A PR #519 integrou no SHA `0365f7fa451de20784c9eb745df853b363c7aeab` a projeção opcional `PlatformDiagnostic.trabalho`, derivada de `Escalonador.saude()`. O campo retorna `null` quando a opção não é fornecida e uma dependência sem `saude()` é recusada explicitamente. A slice é read-only e não cria retry, threshold, alerta, persistência, fila remota ou autoridade.

A evidência local foi: teste focal da Plataforma `7/7`; `tipos:ts`; `tipos:v2`; suíte `1388` aprovados, `6` skipped e `0` falhas; build; integração V2 `58/58`; smoke; caminho crítico `15/15`; offline `9/9`; memória; Security Contracts `73/73`; Doctor `17` green, `2` blocked-known, `1` unknown, `5` not-run e `0` failed, com exit `2` honesto pelo Cargo ausente. Os oito workflows pós-merge do SHA terminaram verdes.

A Phase 07/17 de observabilidade melhora somente o diagnóstico local agregado. Continuam pendentes observabilidade persistente, incidentes com retenção, dashboards, retry por classe de evento, persistência/RLS, Auth/RBAC server-side, Knowledge Mesh formal, Risk Engine, OpenClaw, Hermes, aceitação física, estabilização e RC. A V1 e suas superfícies de compatibilidade permanecem preservadas.


## Checkpoint documental final 2026-08-27 — alpha.20 após PR #521

A documentação da alpha.20 foi integrada pela PR [#520](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/520) no SHA `fc90959a4186060a296d6632efb45ef9d20d1609`, depois de sete workflows pós-merge verdes. A finalização de rastreabilidade foi integrada pela PR [#521](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/521) no SHA `1b7ce92fc5a0dff0e11bf362a470c14b6663f108`, e os sete workflows pós-merge desse SHA terminaram verdes. A correção documental final foi integrada pela PR [#522](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/522) no SHA `f0a11e33a7163746c5d2087762c68a654e1a6dcb`; a tag anotada e a release `v2.0.0-alpha.20` foram verificadas e publicadas nesse SHA.

As branches remotas `backup/2026-08-27-before-v2-platform-task-diagnostic`, `backup/2026-08-27-before-v2-alpha20-docs` e `backup/2026-08-27-before-v2-alpha20-finalize` apontam, respectivamente, para os heads `dbfe515`, `a05bbe7` e `2064396` das PRs; não são backups do estado pré-merge da `main` e não devem ser tratados como rollback para a baseline. A backup `backup/2026-08-27-before-v2-alpha20-release-final` aponta para o baseline real `1b7ce92` anterior à #522. O rollback correto é um `git revert` normal dos squash merges `0365f7f`, `fc90959`, `1b7ce92` e `f0a11e33`, conforme o escopo a desfazer, preservando os pais históricos/baselines (`43bc15e`, `0365f7f`, `fc90959` e `1b7ce92`).

Enquanto isso, o status das fases não é promovido por narrativa: a observabilidade agregada local recebeu a projeção do Task Manager, mas persistência operacional, Auth/RBAC/RLS server-side, ownership/tenancy, retry distribuído, Knowledge Mesh formal, Evidence remoto, Risk Engine, OpenClaw, Hermes, aceite físico multiplataforma, assinatura/auto-update, beta, RC e V2 estável continuam pendentes, bloqueados ou deferidos conforme os contratos canônicos.


## Checkpoint pós-alpha.20 — Core lifecycle, Event Context e Runtime Restart / alpha.21 candidata

Após a publicação da `v2.0.0-alpha.20`, a PR [#517](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/517) foi sincronizada à `main`, passou 11 checks remotos e Vercel e foi squash-merged no SHA `f62ece73eae089f0a42478f7ee2ef36b5cd2fcd3`. Ela corrige a ordem de shutdown do módulo para `stop → Runtime.close → dispose`. A PR [#518](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/518) foi igualmente sincronizada, passou 11 checks e Vercel e foi squash-merged no SHA `9ca947816378180b41d2fe2939e9e5b96ff796bd`; ela preserva metadados autorizados do envelope através de `ctx.bus.emit`.

A PR [#523](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/523) adicionou single-flight bounded a `criarRuntimeRestart()`. Chamadas concorrentes do mesmo módulo compartilham a mesma promessa e não sobrepõem `stop → sleep → start`; chamadas para módulos diferentes continuam independentes. O contrato está em [`RUNTIME_RESTART_SINGLE_FLIGHT_CONTRACT_2026-08-27.md`](./RUNTIME_RESTART_SINGLE_FLIGHT_CONTRACT_2026-08-27.md). O marco é uma melhoria local de lifecycle e não configura restart automático, lock distribuído, persistência, retry remoto ou autoridade operacional.

| Evidência do marco | Resultado |
|---|---:|
| Teste focal do restart | `3/3` |
| Suíte completa local | `1397` testes: `1391` pass, `6` skipped, `0` fail |
| TypeScript | `tipos:ts` e `tipos:v2` passaram |
| Build e integração | Build passou; integração V2 `58/58` |
| Jornadas locais | Smoke, caminho crítico, offline e memória passaram |
| Security Contracts | `73/73` |
| Doctor | Exit `2` honesto por Cargo ausente; sem falhas mascaradas |
| PR #523 | `11` checks verdes, `1` skipped por política, Vercel success |
| Pós-merge do SHA `25cbc9f3` | `8/8` workflows verdes; V2 Validation verde na tentativa 2 após timeout externo de Checkout |

Este checkpoint melhora as Phases 1, 2, 3, 7 e 25 apenas no escopo declarado; não as transforma em concluídas. Persistência, Auth/RBAC/RLS server-side, tenancy, ownership, retenção operacional, retry distribuído, Knowledge Mesh, Risk Engine, OpenClaw, Hermes, observabilidade persistente, aceite físico desktop/mobile, assinatura, auto-update, beta, RC e stable permanecem pendentes, bloqueados ou deferidos conforme a matriz. A `v2.0.0-alpha.21` ainda não foi criada: a publicação exigirá nota final própria, tag anotada e gates pós-merge correspondentes. Rollback: `git revert` normal do squash merge da #523; a backup `backup/2026-08-27-before-v2-runtime-restart-single-flight` aponta para o baseline real `9ca94781` anterior à PR.


## 2026-08-27 — Auth Identity Claims Boundary integrado

A PR [#528](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/528) foi squash-merged na `main` no SHA `09fff078fdf0912aee9f289919aaddd2127280de`, após backup real de `main` em `backup/2026-08-27-before-v2-auth-identity-claims-boundary` apontando para `006aa4c9f7f4d0bb550d1961c98d2841fdba205c`. A projeção local de identidade agora exige issuer e audience compatíveis, além de fonte confiável, autenticação, sujeito presente e frescor; regressões cobrem divergências de issuer/audience e o observador expõe `issuerMatched`.

| Área | Estado | Evidência | Limite |
|---|---|---|---|
| Claims/identity projection local | `IMPLEMENTED / VERIFIED` | focal Auth + Server Claims `13/13`; types; Security Contracts; 9 workflows pós-merge verdes | não é Auth de produção |
| Auth/login real | `BLOCKED / NOT ACCEPTED` | sessão, recuperação, OAuth, assinatura e ambiente real não foram aceitos | não ativar Supabase/RLS por inferência |
| Module Registry health local | `IMPLEMENTED / VERIFIED` | PRs #526/#527 permanecem independentes e não foram misturadas | autoridade server-side ainda não comprovada |
| V2 geral | `IN PROGRESS` | persistem gaps de Auth/RLS, Data/Evidence, backup/restore, RBAC server-side e aceite físico | não declarar alpha/RC/final por este checkpoint |

A matriz mantém a ordem Core → Module System → contratos → Data/Evidence → Auth/RBAC server-side quando ambiente e aprovação existirem. Nenhuma migration, write remoto, billing, OpenClaw, Hermes, schedule, webhook ou integração externa foi ativada nesta unidade.
