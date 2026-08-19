# BALUARTE V2 — MASTER SUPER PROMPT DE EVOLUÇÃO TOTAL POR FASES

## MISSÃO

Você está trabalhando no repositório `Lucas-Belucci-Bellini/Projeto-Baluarte`.

Sua missão é transformar o Projeto Baluarte em uma plataforma modular, robusta, verificável, segura, observável, extensível e preparada para continuar crescendo sem destruir a estabilidade já conquistada.

A V1 continua sendo referência histórica e funcional. A V2 é uma reconstrução arquitetural real — não uma simples V1.5.

NÃO tente migrar tudo de uma vez.
NÃO reescreva partes que já funcionam apenas por preferência estética.
NÃO declare uma fase concluída porque o código compila.
NÃO confunda documentação com implementação.
NÃO confunda testes locais com segurança de produção.

Regra central:

> IMPLEMENTAR → TESTAR → AUDITAR → DOCUMENTAR → VALIDAR → INTEGRAR → OBSERVAR → SÓ ENTÃO AVANÇAR.

---

# 0. AUDITORIA OBRIGATÓRIA DO ESTADO REAL

Antes de modificar qualquer coisa, audite o estado ATUAL do repositório e registre o SHA de `main`.

Inventarie:
- branches, estrutura, scripts, dependências e workflows;
- testes, build, Vite, TypeScript, JavaScript, Python, Rust e SQL;
- V1, V2, Core, Module System, Event Bus, Task Manager, Data Layer e Evidence Layer;
- JARVIS, autenticação, persistência, Supabase, desktop, mobile, PWA e 3D;
- Git Nexus, integrações externas, observabilidade, segurança, performance e acessibilidade;
- Vercel e CI/CD.

Procure TODO, FIXME, HACK, código morto, duplicação, wrappers obsoletos, APIs duplicadas, contratos divergentes, funções sem testes, módulos/rotas órfãos, imports circulares, dependências inúteis, testes flaky, asserts fracos, `any` desnecessário, casts inseguros, acesso direto ao banco/storage pela UI, segredos, URLs hardcoded, autorização confiada ao client, erros inconsistentes, race conditions, listeners sem cleanup, memory leaks, retries sem limite, ausência de idempotência e observabilidade insuficiente.

Crie `docs/v2/CURRENT_STATE_AUDIT.md` com:
1. estado observado;
2. SHA;
3. arquitetura real;
4. componentes reais;
5. parcialmente implementados;
6. somente documentados;
7. quebrados;
8. blockers;
9. riscos;
10. dívida técnica;
11. inconsistências;
12. métricas atuais;
13. próximos passos.

NÃO invente métricas. Se não puder medir, escreva `UNKNOWN — requires measurement`.

---

# 1. NÃO DESTRUIR COMPORTAMENTO EXISTENTE

Antes de alterar um componente:
1. descubra o comportamento atual;
2. consumidores;
3. contratos;
4. testes;
5. rotas/imports;
6. efeitos colaterais;
7. dados utilizados;
8. falhas possíveis.

Se houver quebra de contrato, documente, crie migração, testes e compatibilidade transitória quando possível.

---

# 2. GOVERNANÇA GIT

Mudanças grandes devem ocorrer em branches de fase:
`v2/phase-XX-nome-da-fase`

Commits pequenos e focados. Não misture refactor, feature, dependência, UI e segurança sem necessidade.

---

# 3. GATES

Estados permitidos:
`NOT STARTED`, `IN PROGRESS`, `BLOCKED`, `VALIDATING`, `COMPLETE`, `DEFERRED`.

Para `COMPLETE` exigir contrato, implementação, testes, integração, segurança, performance considerada, acessibilidade quando aplicável, documentação, revisão de impacto, CI, build, smoke, evidência e publicação/verificação quando aplicável.

---

# FASE 00 — BASELINE

Criar `docs/v2/BASELINE_CURRENT.md` e `docs/v2/BASELINE_METRICS.json`.

Medir build, bundles, testes, cobertura disponível, rotas, módulos, warnings, boot, smoke, console e problemas de segurança/acessibilidade/performance.

Gate: saber exatamente o que existe hoje.

---

# FASE 01 — GOVERNANÇA V2

Consolidar:
- `DEFINITION_OF_DONE.md`
- `CONTRACT_POLICY.md`
- `RELEASE_GATES.md`
- `ARCHITECTURE_GOVERNANCE.md`
- `DEPENDENCY_POLICY.md`
- `SECURITY_POLICY.md`
- `DATA_CLASSIFICATION.md`
- `ERROR_POLICY.md`
- `OBSERVABILITY_POLICY.md`
- `PERFORMANCE_BUDGETS.md`
- `DEPRECATION_POLICY.md`

Definir como módulos, APIs, eventos, schemas, migrations, rollback, incidentes e dados evoluem.

---

# FASE 02 — CORE

Manter Core pequeno e separar Boot, Runtime, Context, Config, Event Bus, Task Manager, Module Registry, Health e Diagnostics.

Boot deve carregar config, contexto, serviços fundamentais, módulos, ambiente, observabilidade e health. Módulos opcionais não podem derrubar o boot inteiro.

Runtime deve definir lifecycle, cancellation, timeout, retries, ownership, cleanup, failure e degraded states.

Context deve separar identidade, sessão, configuração, capabilities, request context, correlation ID, trace ID, locale e feature flags.

Core não deve conter lógica específica de produto.

---

# FASE 03 — MODULE SYSTEM

Criar Module Registry real. Cada módulo declara id, nome, versão, estado, capabilities, dependências, permissions, health, lifecycle, entrypoint, metadata, flags e compatibility.

Estados: `registered`, `starting`, `ready`, `degraded`, `disabled`, `maintenance`, `quarantined`, `failed`.

Criar diagnóstico de módulo e isolamento de falhas.

---

# FASE 04 — EVENT BUS

Formalizar eventos com nome, namespace, versão, payload, producer, consumers, correlation ID, timestamp e metadata.

Definir invalid event/listener, duplicidade, replay, ordering, cancellation, observability e error handling. Detectar eventos sem consumidores e consumidores sem eventos. Criar testes de contrato.

---

# FASE 05 — TASK MANAGER

Tasks devem possuir id, type, status, owner, priority, timestamps, timeout, retries, progress, cancellation, dependencies, result, error e correlationId.

Estados: pending, queued, running, paused, succeeded, failed, cancelled, timed_out, blocked.

Implementar retry controlado, backoff, timeout, cancellation, progress, deduplicação, idempotência, ownership e observabilidade.

---

# FASE 06 — DATA LAYER

Criar Data Layer oficial. Separar domain data, application state, cache, local persistence, remote persistence, event data, evidence e configuration.

Definir interfaces Repository, Storage, Cache, Serializer, Validator e Migration. Evitar acesso direto da UI ao banco quando violar a arquitetura.

---

# FASE 07 — EVIDENCE LAYER

Informação externa importante deve possuir source, sourceType, discoveredAt, publishedAt, subject, region, sector, confidence, evidence, originalReference, agent, validation, status, supersedes e supersededBy.

Definir evidência válida, incompleta, conflitante, obsoleta, superseded e não verificada. Nunca transformar informação encontrada em verdade absoluta.

---

# FASE 08 — WIKI / KNOWLEDGE SYSTEM

Separar source, article, revision, category, namespace, tags, references, evidence, author e license.

Implementar histórico, revisão, comparação, atualização, rollback, provenance, busca e indexação. Ingestão grande somente depois de contratos estáveis.

---

# FASE 09 — PERSISTÊNCIA REAL

Depois de schemas, migrations, RLS, contracts, tests, environments e rollback, conectar persistência remota real.

Separar local, test, staging e production. Nunca usar produção para testes. Nunca colocar segredo no frontend.

---

# FASE 10 — TENANCY

Modelar User, Account, Workspace, Membership, Role e Permission. Garantir isolamento entre tenants no servidor/banco, não apenas na UI.

Testar leitura, escrita, atualização, exclusão, compartilhamento, troca de workspace, membership removido, role alterada e usuário suspenso.

---

# FASE 11 — PERMISSIONS

Separar authentication, authorization, capability, role e policy. Client-side não é autoridade. Backend/banco é autoridade final para operações sensíveis.

---

# FASE 12 — AUTH

Validar signup, login, logout, session, refresh, password reset, email verification quando aplicável, redirects, route guards, workspace access, token handling, expiration e revoke.

Testar sessão expirada/inválida, usuário inexistente, sem membership, suspenso e alteração de permissões. Nunca logar tokens.

---

# FASE 13 — ACCOUNT / WORKSPACE

Criar criação de workspace, entrada, saída, membership, convite, roles, ownership e settings. Preparar para múltiplas organizações.

---

# FASE 14 — BILLING FOUNDATION

Modelar plan, entitlement, quota, usage, ledger, subscription e billing event. Não integrar pagamento real antes de RLS, atomicidade, idempotência, observabilidade e rollback.

---

# FASE 15 — PLANS

Planos orientados a dados. Exemplo: FREE, PRO, TEAM, ENTERPRISE. Não espalhar regras de plano por componentes.

---

# FASE 16 — ENTITLEMENTS

Derivar acesso a recursos de contratos: module.access, storage.limit, ai.requests, exports, workspace.members etc.

---

# FASE 17 — LIMITS

Implementar limites de requests, storage, tasks, AI usage, ingestion, integrations e exports, com enforcement, usage tracking, warnings e hard/soft limits.

---

# FASE 18 — USAGE LEDGER

Cada evento de uso deve ter id, tenant, user, workspace, resource, quantity, timestamp, source e idempotency key.

---

# FASE 19 — TYPESCRIPT MIGRATION

Migrar por domínio, não apenas extensões. Para cada onda: dependências, consumidores, tipos, implementação, testes, runtime, remoção de duplicidade e documentação. Validar typecheck, build, testes e smoke.

---

# FASE 20 — JAVASCRIPT LEGACY

Classificar JS como canônico, compatibilidade, legado, experimental ou candidato à remoção. Priorizar arquivos com alto acoplamento, bugs, contratos fracos, Core e segurança.

---

# FASE 21 — RUST RUNTIME

Usar Rust apenas onde houver benefício mensurável: processamento intensivo, parsers, operações pesadas, runtime local, desktop ou binários. Toda migração exige benchmark contra alternativas existentes.

---

# FASE 22 — PYTHON

Usar Python para IA, automação, parsing, pipelines, análise e integrações quando fizer sentido. Criar contratos claros entre Python e plataforma.

---

# FASE 23 — JARVIS FOUNDATION

Separar identity, conversation, context, memory, tools, orchestration, knowledge, evidence, safety e permissions. JARVIS não possui autoridade maior que políticas e permissões.

---

# FASE 24 — JARVIS TOOL REGISTRY

Cada ferramenta declara id, version, description, inputs, outputs, permissions, risks, timeout, cost e side effects. Ferramentas destrutivas exigem confirmação apropriada. Operações sensíveis possuem audit e kill switch.

---

# FASE 25 — JARVIS MEMORY

Separar short-term, session, user preferences, project memory, persistent memory e evidence. Definir retention, deletion, export, provenance e access control.

---

# FASE 26 — KNOWLEDGE GRAPH

Quando os dados tiverem qualidade suficiente, estruturar user, project, module, document, source, evidence, concept, task, event e integration com relações contextualizadas e com origem.

---

# FASE 27 — OBSERVABILITY

Criar logs, metrics, traces, health, errors, tasks, events e integration observability. Erros críticos devem possuir correlationId, module, operation, timestamp e severity. Evitar dados sensíveis.

---

# FASE 28 — DIAGNOSTICS

Criar mecanismo de diagnóstico para boot, modules, database, auth, event bus, task manager, external integrations, storage, version, commit e environment. Separar diagnóstico público e administrativo.

---

# FASE 29 — ERROR MANAGEMENT

Taxonomia: validation_error, auth_error, permission_error, network_error, timeout, dependency_error, storage_error, module_error, system_error e configuration_error. Nunca usar console.log como política de erro.

---

# FASE 30 — RESILIENCE

Implementar retry, timeout, fallback, circuit breaker quando aplicável, degraded mode, quarantine e recovery. Falha externa não deve derrubar todo o Baluarte sem necessidade.

---

# FASE 31 — SECURITY HARDENING

Auditar XSS, CSRF, SSRF, injection, path traversal, prototype pollution, unsafe deserialization, secrets, tokens, permissions, CORS, CSP, headers, dependências e supply chain. Usar CodeQL e scanners adequados. Não esconder warnings.

---

# FASE 32 — DATA SECURITY

Classificar dados public/internal/confidential/restricted. Definir encryption, access, retention e deletion. Preparar princípios compatíveis com LGPD.

---

# FASE 33 — PRIVACY

Criar data inventory, retention policy, deletion/export flows e audit trails. Telemetria deve ser mínima e justificável.

---

# FASE 34 — PERFORMANCE

Criar budgets e medir bundle size, initial load, route transition, memory, CPU, network, module startup, event latency e task latency. Otimizações devem mostrar antes/depois.

---

# FASE 35 — FRONTEND ARCHITECTURE

Separar pages, features, components, domain, application e infrastructure. UI não deve conter lógica de domínio arbitrária.

---

# FASE 36 — DESIGN SYSTEM

Consolidar typography, spacing, colors, surfaces, buttons, forms, cards, dialogs, tables, navigation, alerts e status indicators sem destruir identidade visual existente.

---

# FASE 37 — ACCESSIBILITY

Validar keyboard, focus, semantic HTML, labels, ARIA, contrast, reduced motion, screen readers e forms. Criar smoke de acessibilidade.

---

# FASE 38 — RESPONSIVE

Validar desktop, notebook, tablet, mobile, landscape e diferentes densidades. Não depender somente de breakpoints artificiais.

---

# FASE 39 — PWA

Validar manifest, icons, caching, offline, update strategy, cache invalidation e recovery. Service Worker não pode servir assets inválidos após deployment.

---

# FASE 40 — DESKTOP

Separar frontend, local runtime, filesystem, IPC, permissions, updater e logging. Não confiar cegamente no renderer.

---

# FASE 41 — MOBILE

Validar navigation, touch, offline, storage, performance, permissions e notification boundaries.

---

# FASE 42 — 3D / JARVIS VISUAL

Preservar o núcleo visual funcional e separar scene, render, interaction, audio, assets, UI e state. Criar budgets de draw calls, textures, geometry, memory e loading.

---

# FASE 43 — ASSET GOVERNANCE

Assets devem possuir source, license, author, format, version, dimensions e usage quando aplicável. Não colocar assets sem procedência clara em produção.

---

# FASE 44 — GIT NEXUS / CODE INTELLIGENCE

Usar ferramentas de análise para dependency graph, impact analysis, refactoring, exploration e debugging. São auxiliares, não autoridade absoluta.

---

# FASE 45 — EXTERNAL INTEGRATIONS

Toda integração externa deve ter adapter, contract, timeout, retry, rate limit, error handling, secrets, observability e disable flag. SDK de terceiros não deve se espalhar pela aplicação.

---

# FASE 46 — PLUGIN ARCHITECTURE

Quando contratos estiverem estáveis, preparar plugins com manifest, version, permissions, capabilities, lifecycle, health, sandbox boundary, owner e metadata. Não dar acesso universal a plugins.

---

# FASE 47 — TEST ARCHITECTURE

Criar matriz de Unit, Integration, Contract, E2E, Smoke, Regression, Security e Performance tests.

---

# FASE 48 — TEST QUALITY

Auditar testes redundantes, frágeis, mocks excessivos, assertions insuficientes e branches não cobertas. Usar mutation testing quando apropriado.

---

# FASE 49 — FAILURE INJECTION

Simular database down, network down, timeout, module crash, invalid data, corrupted state, expired auth, external API failure e permission denied. Verificar degradação correta.

---

# FASE 50 — RECOVERY

Definir e testar rollback, restore, migration rollback, cache invalidation, session recovery, task recovery e module recovery.

---

# FASE 51 — BACKUP

Definir o que fazer backup, frequência, retenção, encryption e restore test. Backup nunca restaurado não é comprovadamente confiável.

---

# FASE 52 — MIGRATIONS

Toda mudança de banco possui migration, forward path, rollback strategy, validation e compatibility plan. Evitar breaking migrations sem planejamento.

---

# FASE 53 — CI

Organizar gates de formatting, lint, types, unit, integration, build, security, smoke, performance e deployment validation.

---

# FASE 54 — CI SPECIALISTS

Criar validações específicas para TypeScript, JavaScript, Rust, Python, SQL, workflows, assets, documentation e security.

---

# FASE 55 — GENERATED INVENTORIES

Gerar automaticamente inventories de routes, modules, events, tools, permissions, features, dependencies e schemas sempre que possível.

---

# FASE 56 — DOCUMENTATION SYSTEM

Documentar arquitetura, onboarding, Core, modules, events, tasks, data, evidence, auth, permissions, billing, JARVIS, integrations, security, deployment, recovery e troubleshooting. Não manter docs contraditórias ao código.

---

# FASE 57 — DEVELOPER EXPERIENCE

Criar comandos reais como:
```bash
npm run verify
npm run test:all
npm run audit
npm run smoke
npm run build
npm run typecheck
npm run verify:v2
```
O comando de verificação deve executar gates reais, não imprimir sucesso falso.

---

# FASE 58 — LOCAL ENVIRONMENT

Documentar Node, npm, env, Supabase, Python, Rust e tooling. Criar `.env.example` sem segredos.

---

# FASE 59 — ENVIRONMENT VALIDATION

Validar required env, invalid env, missing env, environment type e compatible versions. Não iniciar silenciosamente em configuração perigosa.

---

# FASE 60 — RELEASE ENGINEERING

Definir versioning, changelog, release branch, release candidate, tag, rollback, deployment, smoke e post-deploy verification.

---

# FASE 61 — RELEASE CANDIDATE

Congelar mudanças, executar todos os gates, comparar métricas, verificar regressões, security, accessibility, performance, deploy e recovery.

---

# FASE 62 — VERCEL

Validar build command, output, routing, headers, cache, environment, server functions, deploy, preview e production. Não declarar deploy saudável enquanto checks relevantes estiverem pendentes/falhando.

---

# FASE 63 — OBSERVAÇÃO PÓS-DEPLOY

Monitorar errors, routes, API, auth, performance, availability, logs e regressions após marcos importantes.

---

# FASE 64 — ANALYTICS

Somente depois da política de privacidade. Separar product analytics, technical telemetry e security events. Medir apenas o necessário.

---

# FASE 65 — ADMIN / OPERATIONS

Criar superfície administrativa segura para health, modules, incidents, tasks, jobs, integrations e feature flags. Não proteger admin apenas pelo frontend.

---

# FASE 66 — INCIDENT SYSTEM

Registrar incident ID, severity, detection, timeline, impact, mitigation, root cause e follow-up.

---

# FASE 67 — FEATURE FLAGS

Criar flags para recursos arriscados: disabled, internal, beta e public. Flags não substituem arquitetura.

---

# FASE 68 — EXPERIMENTAL SYSTEM

Marcar explicitamente experimental/preview/beta e isolar recursos experimentais.

---

# FASE 69 — MODULE QUARANTINE

Módulo defeituoso deve poder entrar em quarantine sem derrubar Core, Home ou módulos independentes. Registrar diagnóstico e estado claro.

---

# FASE 70 — OFFLINE

Validar armazenamento, sincronização, conflitos, recovery, stale data e cache. Nunca sobrescrever silenciosamente dados conflitantes.

---

# FASE 71 — SYNCHRONIZATION

Criar estratégia para local, remote, conflict resolution, timestamps, version, revision e merge.

---

# FASE 72 — SEARCH

Criar busca modular separando indexing, querying, ranking, permissions e filters. Busca jamais pode revelar dados não autorizados.

---

# FASE 73 — IMPORT / EXPORT

Criar exportação real e import seguro, validando formatos e conteúdo malformado.

---

# FASE 74 — DATA VALIDATION

Validar toda entrada externa: forms, APIs, files, imports, database, integrations, AI e user-generated content.

---

# FASE 75 — AI SAFETY

JARVIS e outras IAs devem possuir permission boundaries, tool permissions, confirmation, logging, rate limits, context isolation e source attribution quando relevante. IA não ganha autorização só por conseguir executar algo.

---

# FASE 76 — AI KNOWLEDGE QUALITY

Separar fact, inference, suggestion, uncertain e source-backed. JARVIS deve comunicar incerteza.

---

# FASE 77 — AUTOMATION

Automação deve ter trigger, owner, scope, permissions, timeout, retry, kill switch e audit. Não criar automação autônoma com autoridade ilimitada.

---

# FASE 78 — SCHEDULER

Formalizar scheduler para recurring jobs, one-time jobs, retry, pause, resume, cancellation, timezone e concurrency limits.

---

# FASE 79 — JOB OBSERVABILITY

Todo job deve permitir saber quando iniciou/terminou, por que falhou, quantas tentativas fez, o que executou e o resultado.

---

# FASE 80 — EXTERNAL PROJECT REGISTRY

Para projetos externos conectados ao Baluarte, registrar project, repository, version, capabilities, integration, status e ownership.

---

# FASE 81 — PROJECT ADAPTERS

Usar `adapter → contract → module`, nunca imports aleatórios de internals de projetos externos.

---

# FASE 82 — SCALABILITY

Simular crescimento quando tecnicamente relevante: 10, 100, 1.000 e 10.000 unidades de carga. Não prometer escalabilidade sem benchmark.

---

# FASE 83 — LOAD TEST

Criar cargas reprodutíveis e medir throughput, latency, memory, CPU e error rate.

---

# FASE 84 — COST MODEL

Após observabilidade suficiente, medir custos potenciais de storage, compute, database, AI, bandwidth, external APIs e logs.

---

# FASE 85 — ECONOMICS

Criar modelo orientado a dados para entender consumo, margem, quotas e sustentabilidade dos planos. Não inventar números comerciais.

---

# FASE 86 — FULL SYSTEM AUDIT

Auditoria horizontal: cada domínio deve possuir contracts, tests, security, metrics, docs, ownership e rollback.

---

# FASE 87 — ARCHITECTURE CONSISTENCY

Encontrar e consolidar duplicação arquitetural, services duplicados, abstrações paralelas, adapters inúteis, wrappers obsoletos e lógica duplicada somente quando seguro.

---

# FASE 88 — DEPENDENCY AUDIT

Classificar dependências production/development/optional/obsolete. Remover inutilizadas. Atualizar com razão e validar breaking changes.

---

# FASE 89 — SUPPLY CHAIN

Validar lockfiles, integrity, package sources, dependências suspeitas, postinstall e scripts.

---

# FASE 90 — API GOVERNANCE

APIs importantes devem possuir version, contract, schema, error model, auth model, rate limit e observability.

---

# FASE 91 — DATABASE GOVERNANCE

Cada tabela deve ter propósito, owner, primary key, indexes, foreign keys, constraints, RLS e retention.

---

# FASE 92 — INDEX AUDIT

Encontrar missing indexes, useless/duplicate indexes, scans relevantes e consultas perigosas.

---

# FASE 93 — RLS AUDIT

Provar isolamento por tenant com testes positivos e negativos de leitura, escrita, atualização, exclusão e roles.

---

# FASE 94 — DATA INTEGRITY

Adicionar constraints, unique, foreign keys, checks, not null e transactions. Não depender apenas da aplicação.

---

# FASE 95 — MIGRATION SAFETY

Antes de migrations sensíveis: backup, test, staging, validation e rollback strategy.

---

# FASE 96 — DOCUMENTATION RECONCILIATION

Comparar README, docs, CLAUDE.md, V2 rules, roadmap, issues e código. Corrigir divergências. Código é fonte de verdade sobre comportamento atual.

---

# FASE 97 — ISSUE RECONCILIATION

Auditar issues, PRs, branches e planos; classificar completed, active, obsolete, blocked e duplicate.

---

# FASE 98 — PR HYGIENE

PRs devem conter objetivo, escopo, mudanças, testes, riscos, rollback e screenshots quando UI.

---

# FASE 99 — FINAL V2 INTEGRATION

Integrar somente depois das fundações: Core + Module System + Event Bus + Task Manager + Data Layer + Evidence Layer + Auth + Tenancy + Permissions + JARVIS + Observability + Security + CI + Deployment.

---

# FASE 100 — V2 STABILITY

Release candidate exige full build, typecheck, unit, integration, contract, E2E, smoke, security, accessibility, performance, failure injection, recovery, deployment e pós-deploy.

---

# FASE 101 — V2.0.0

Liberar `2.0.0` somente quando blockers críticos estiverem fechados, Auth e persistência forem válidos, RLS comprovado, Core/module system estáveis, JARVIS tiver boundaries, CI estiver verde, deploy validado, recovery testado e documentação coerente.

---

# FASE 102 — OBSERVATION PERIOD

Após release, observar bugs, performance, UX, custos, estabilidade, integrações e segurança antes de iniciar dezenas de features.

---

# FASE 103 — V2.1

Após observação real, priorizar bugs, gargalos, UX, performance e qualidade.

---

# DOCUMENTAÇÃO OBRIGATÓRIA POR FASE

Cada fase deve gerar `docs/v2/phases/PHASE_XX_REPORT.md` com:

```md
# Phase XX

## Objective
## Scope
## Changes
## Tests
## Security
## Performance
## Documentation
## Risks
## Known Limitations
## Evidence
## Result
## Commit
## PR
## Next Phase
```

Status deve ser um dos estados oficiais. Não marcar `COMPLETE` sem evidência.

---

# REGRA DE BLOCKER

Quando encontrar blocker, NÃO falsifique sucesso, NÃO desabilite teste para passar, NÃO remova verificação e NÃO transforme workaround temporário em solução permanente.

Registrar causa, impacto, ação necessária, owner, evidência, workaround e por que o workaround é temporário/inseguro.

---

# REGRA DE NÃO-REGRESSÃO

Antes de refactor: descobrir quem usa, contratos, testes e comportamento. Depois: repetir a análise e executar testes antes/depois.

---

# REGRA DE PERFORMANCE

Toda otimização importante apresenta ANTES, DEPOIS, MÉTODO, AMBIENTE, MÉTRICA e RESULTADO.

---

# REGRA DE SEGURANÇA

Nunca tratar localStorage, frontend, hidden fields ou client-side flags como autoridade para operações privilegiadas.

---

# REGRA DE IA

IA é componente, não autoridade. IA opera sob contracts, permissions, policies, audit e tool registry.

---

# REGRA DE MODULARIDADE

Toda feature nova deve responder: em qual módulo vive? qual contrato? dependências? como falha? como desliga? como testa? como observa? como remove?

---

# REGRA DE EXTENSIBILIDADE

A arquitetura deve permitir novos módulos sem modificar excessivamente o Core. Preferir:

```text
Core
  ↓
Module Registry
  ↓
Modules
  ↓
Contracts
  ↓
Services
  ↓
Data
```

Evitar ciclos entre módulos e Core.

---

# REGRA DE ESCOPO

Não transformar uma fase em várias fases escondidas. Se um domínio independente crescer, criar fase própria.

---

# REGRA DE COMPATIBILIDADE

Ao migrar JS→TS, V1→V2 ou local→remote, preservar compatibilidade quando possível. Quando não for possível, criar migração explícita.

---

# REGRA DE DEPRECATION

Marcar APIs antigas como deprecated, documentar substituta, prazo, impacto e migração. Só remover após gate.

---

# REGRA DE CLEANUP

Após migrações, procurar dead code, unused files/exports/imports, wrappers antigos, docs antigas, scripts abandonados e branches antigas.

---

# REGRA DE OPERAÇÃO

Integrações externas precisam de scopes, tokens mínimos, timeout, kill switch, logs e audit.

---

# REGRA DE PRODUTO

Antes de feature: qual problema? quem usa? qual módulo? qual risco? qual custo? como medir sucesso?

---

# REGRA DE UX

Toda tela importante considera loading, success, empty, error, degraded, unauthorized e unavailable.

---

# REGRA DE DEPENDÊNCIA

Antes de adicionar biblioteca, verificar solução existente, manutenção, licença, segurança, valor real e complexidade.

---

# REGRA DE SOURCE OF TRUTH

Definir fonte canônica para modules, routes, permissions, events, data, evidence e versions. Evitar listas manuais duplicadas.

---

# REGRA DE AUDITORIA CONTÍNUA

A cada bloco de fases, atualizar `docs/v2/MASTER_EXECUTION_MATRIX.md` e responder:
- O que melhorou?
- O que piorou?
- O que ainda está quebrado?
- O que ficou obsoleto?
- Que novos riscos surgiram?

---

# REGRA DE FINALIZAÇÃO

Ao terminar uma fase:
1. testes;
2. build;
3. smoke;
4. verificações específicas;
5. revisão do diff;
6. security;
7. performance;
8. docs;
9. relatório;
10. commit;
11. push/PR conforme autorização;
12. CI;
13. revisão;
14. merge apenas quando aprovado.

Não iniciar a próxima fase se a atual estiver BLOCKED.

---

# REGRA DE MERGE

Nunca fazer merge porque “parece funcionar”. Exigir CI verde, testes verdes, revisão concluída, blockers conhecidos documentados, rollback conhecido e diff entendido.

---

# AUTOCRÍTICA

Após cada fase, tente provar que a implementação está errada: edge cases, concorrência, rede, estado vazio, autorização inválida, dados corrompidos, reload, logout, refresh, mobile, offline e carga.

---

# ORDEM OBRIGATÓRIA DOS BLOCOS

## A — VERDADE
1. Baseline
2. Audit
3. Reconciliation
4. Governance

## B — FUNDAÇÃO
5. Core
6. Module System
7. Event Bus
8. Task Manager

## C — DADOS
9. Data Layer
10. Evidence Layer
11. Schema
12. Migration
13. Storage

## D — SEGURANÇA
14. Auth
15. Tenancy
16. Permissions
17. RLS

## E — PRODUTO
18. Account
19. Workspace
20. Billing
21. Usage
22. Entitlements

## F — INTELIGÊNCIA
23. JARVIS
24. Tools
25. Memory
26. Knowledge Graph
27. Evidence-backed AI

## G — PLATAFORMA
28. Observability
29. Diagnostics
30. Automation
31. Scheduler
32. Integrations

## H — EXPERIÊNCIA
33. Frontend architecture
34. Design system
35. Accessibility
36. Responsive
37. PWA

## I — RUNTIME
38. Rust
39. Python
40. Desktop
41. Mobile
42. 3D

## J — QUALIDADE
43. Test Matrix
44. Failure Injection
45. Performance
46. Security
47. Recovery

## K — ESCALA
48. Load
49. Cost
50. Economics
51. External integrations

## L — RELEASE
52. RC
53. V2.0.0
54. Observation
55. V2.1

---

# MODO UNKNOWN

Quando não souber algo, não invente. Use `UNKNOWN` e crie task para descobrir.

# DOCUMENTAÇÃO DIVERGENTE

Quando código e documentação discordarem: registrar, analisar histórico, determinar comportamento atual, decidir source of truth, corrigir e criar ADR se necessário.

# LEGADO

Classificar como keep, migrate, wrap, deprecate ou remove. Não reescrever automaticamente.

# BREAKING CHANGE

Toda breaking change exige reason, impact, migration, tests, communication e rollback.

# PRODUÇÃO

Não habilitar billing real, automação destrutiva, operações privilegiadas ou integrações críticas sem os gates necessários.

# V2

V1 é referência funcional/histórica. A arquitetura V2 deve ser escolhida por modularidade, segurança, manutenção, desempenho, evolução, observabilidade e contratos.

---

# RESULTADO ESPERADO

A arquitetura final deve ser aproximadamente:

```text
                         BALUARTE V2
                              │
             ┌────────────────┼────────────────┐
             │                │                │
          WEB/UI           DESKTOP          MOBILE
             │                │                │
             └────────────────┼────────────────┘
                              │
                           CORE
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
      RUNTIME             MODULE REGISTRY       CONTEXT
        │                     │                     │
        ├───────────────┬─────┴──────┬─────────────┤
        │               │            │             │
    EVENT BUS       TASK MANAGER   HEALTH      DIAGNOSTICS
        │               │
        └───────────────┼───────────────────────────
                        │
                     MODULES
                        │
      ┌─────────────────┼────────────────────────┐
      │                 │                        │
    JARVIS            WIKI                    TOOLS
      │                 │                        │
      └─────────────────┼────────────────────────┘
                        │
                  CONTRACT LAYER
                        │
          ┌─────────────┼─────────────┐
          │             │             │
      DATA LAYER   EVIDENCE LAYER   CACHE
          │             │
          └─────────────┼─────────────┘
                        │
                    DATABASE
                        │
                       RLS
                        │
             AUTH / TENANCY / RBAC
                        │
                 OBSERVABILITY
                        │
                  CI / SECURITY
                        │
                    VERCEL
```

---

# PRINCÍPIO FINAL

Não tente simplesmente “terminar o Baluarte”. Construa o Baluarte de forma que ele possa continuar evoluindo.

Uma arquitetura excelente é aquela em que novos módulos podem entrar, módulos antigos podem sair, falhas podem ser isoladas, dados podem ser recuperados, permissões podem ser auditadas, contratos podem evoluir, serviços podem ser substituídos, linguagens podem coexistir com responsabilidade, infraestrutura pode crescer e o produto pode mudar sem exigir reescritas destrutivas.

---

# PRIMEIRA AÇÃO OBRIGATÓRIA

NÃO comece pela Fase 01.

Comece executando:

`FASE 00 — AUDIT DO SHA REAL ATUAL`

Depois:

`FASE 00 REPORT → RECONCILIATION → BLOCKER LIST → PHASE PRIORITY`

Somente então avance.

Antes de editar código, responda:

```text
QUAL É O ESTADO REAL DO REPOSITÓRIO?
QUAL É O SHA?
O QUE JÁ ESTÁ PRONTO?
O QUE ESTÁ PARCIAL?
O QUE ESTÁ DOCUMENTADO MAS NÃO IMPLEMENTADO?
O QUE ESTÁ IMPLEMENTADO MAS NÃO DOCUMENTADO?
O QUE ESTÁ QUEBRADO?
O QUE ESTÁ BLOQUEADO?
QUAL É A MENOR MUDANÇA SEGURA QUE MELHORA O SISTEMA?
```

Somente depois: EDITAR.

---

# NÃO NEGOCIÁVEIS

Nunca:
- inventar métricas;
- inventar testes;
- esconder erro;
- desabilitar segurança para passar CI;
- excluir testes para reduzir falhas;
- publicar segredo;
- confiar em client-side authorization;
- fazer deploy de código conhecido como quebrado;
- transformar workaround em arquitetura permanente;
- marcar fase como completa sem evidência;
- misturar fases sem motivo;
- reescrever código funcional apenas por estética;
- destruir compatibilidade sem plano;
- adicionar dependência sem justificativa;
- criar abstração sem consumidor;
- criar microserviço sem necessidade;
- criar IA com autoridade ilimitada.

---

# FRASE DE EXECUÇÃO

> Não estou aqui para produzir o máximo de código possível. Estou aqui para produzir a maior evolução verificável possível sem degradar o sistema.

---

# ENCERRAMENTO DE CADA CICLO

Ao terminar qualquer fase, produzir obrigatoriamente:

```text
PHASE STATUS
FILES CHANGED
TESTS
SECURITY
PERFORMANCE
KNOWN RISKS
KNOWN LIMITATIONS
DOCUMENTATION
COMMIT
PR
CI STATUS
NEXT PHASE
```

E então parar. Não iniciar a próxima fase automaticamente se a fase atual estiver `BLOCKED`.

---

# META FINAL

O Projeto Baluarte deve possuir uma plataforma V2 modular, verificável, segura, observável, resiliente, extensível e preparada para incorporar novos sistemas, projetos, agentes, módulos, linguagens e fontes de dados sem depender de reescritas destrutivas.

Comece pela auditoria do SHA real atual.

Não presuma.
Descubra.
Meça.
Registre.
Implemente.
Valide.
Evolua.
