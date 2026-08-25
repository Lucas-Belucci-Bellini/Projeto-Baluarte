# V2 Master Prompt — Matriz de fases e estado atual

**SHA observado para a medição corrente:** `5d2142d7fa553260d03ffe85f2f0ef90775e2542` (`chore(release): prepare 1.3.2`)
**SHA funcional anterior:** `dbd09f52b055f72679f633e3d45a181b13f1b0f9` (`feat(v2): add bounded evidence audit preview`)
**Última reconciliação documental anterior:** `a3a88c04` (`docs(v2): reconcile spotify milestone matrices`)
**Último marco publicado:** `evidence-audit-preview` — auditoria estrutural local bounded da Evidence, sem mutação
**Base anterior:** `2093059410bf2aa6c8a0f90795e91625d0be1d53`
**Data:** 2026-08-22
**Critério:** uma fase só é `concluída` quando existe implementação, teste, documentação, validação e publicação na `main`. Uma documentação de intenção não é evidência de implementação.

## Resumo

O Projeto-Baluarte já possui uma fundação significativa: governança e documentação V2, Core inicial, Event Bus, Storage, permissões básicas, Runtime/Session/Bridge, integração V2, migração das páginas canônicas para TypeScript, fronteira Node/TypeScript dos geradores e automação diária. A baseline corrente passa `tipos:ts`, `tipos:v2`, testes 1258/1258, build, integração 51/51, smoke 99/99 e caminho crítico 15/15. A suíte focal Spotify/Soloist + Mark XIII passa em 19/19. O `verify:v2` publicado no SHA anterior mantém um catálogo de 21 registros, com 15 checks locais verdes, um bloqueio conhecido de Rust e cinco gates explicitamente não executados por política. O marco de Billing permanece em 67/67, o piloto operacional do Registry foi validado no browser real e o JARVIS possui benchmarks locais de contexto/tool schemas e recall cross-session.

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
