# Baluarte V2 — Master Execution Matrix

**Status:** `IN PROGRESS`
**Data da observação:** 2026-08-19
**Repositório:** `Lucas-Belucci-Bellini/Projeto-Baluarte`
**Branch oficial:** `main`
**SHA observado:** `2f660dc6fe0b9676cab2b0fa4dfe8bf5400b181f`
**Working tree:** limpo
**Autor do documento:** Manus AI

> Esta matriz é um mapa de execução verificável. Ela não transforma todo o roadmap futuro em trabalho atual. `COMPLETE` significa concluído dentro do escopo observado e documentado; não significa que o domínio inteiro da V2 esteja pronto para produção.

## 1. Regra de reconciliação

A matriz foi construída a partir do código e dos gates observados no `main`, das decisões atuais em `V2_MASTER_PLAN.md`, `V2_RULES.md` e `V2_DECISION_LOG.md`, da auditoria histórica `PHASE_00_AUDIT.md` e do Master Super-Prompt anexado. Quando uma documentação histórica diverge do código atual, o SHA e o comportamento observado prevalecem. Fases futuras permanecem `NOT STARTED`, `DEFERRED` ou `BLOCKED`; não são declaradas concluídas por existirem no roadmap.

## 2. Estados usados

| Estado | Significado |
|---|---|
| `COMPLETE` | Implementado, testado, documentado e verificado no escopo declarado. |
| `IN PROGRESS` | Há implementação ativa, mas ainda existem dependências ou cobertura faltante. |
| `VALIDATING` | A fatia está implementada e aguarda validação adicional, geralmente remota ou de staging. |
| `BLOCKED` | Existe uma dependência externa ou arquitetural que impede conclusão honesta. |
| `DEFERRED` | Pertence ao roadmap, mas não deve ser implementado nesta etapa. |
| `NOT STARTED` | Ainda não existe implementação relevante confirmada. |

## 3. Matriz de execução — fundação e fases imediatamente relacionadas

| Phase | Title | Status | Dependencies | Owner | Risk | Tests / evidence | Security | Performance | Main SHA | Documentation | Next |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 00 | Audit and baseline | `COMPLETE` no escopo histórico; `REFRESH REQUIRED` para o SHA atual | Repositório, código, gates e docs | Manus AI | Métricas históricas podem ser confundidas com atuais | Auditoria antiga em `f6402276`; gates atuais no `2f660dc6` | Riscos e causas raiz registrados | Warnings de chunks e limites locais registrados | `2f660dc6` | `PHASE_00_AUDIT.md`, `BASELINE.md` | Atualizar baseline corrente e manter histórico explícito |
| 01 | Governance and contracts | `IN PROGRESS` | Regras, versionamento, definição de pronto | Manus AI / Lucas | Inconsistência entre docs antigas e estado 1.1.0 | Gates atuais; faltam artefatos formais completos | Sem segredos; revisão obrigatória | Medições devem ser evidenciadas | `2f660dc6` | `V2_RULES.md`, `V2_DECISION_LOG.md` | Criar/atualizar `DEFINITION_OF_DONE`, `CONTRACT_POLICY`, `RELEASE_GATES` |
| 02 | Core | `IN PROGRESS` | Boot, Context, Config, Runtime e compatibilidade | Manus AI | Core crescer com lógica de produto | `v2:integracao 19/19`, testes V2 e caminho crítico | Deny-by-default e isolamento | Boot e runtime ainda precisam de metas | `2f660dc6` | `V2_MASTER_PLAN.md`, docs de Core | Consolidar contratos sem duplicar sistemas |
| 03 | Module System | `IN PROGRESS` | Registry, manifest, lifecycle, health, permissions | Manus AI | Cobertura desigual entre rotas e módulos | Módulos piloto cobertos pela integração V2 | Quarentena e autorização server-side ainda incompletas | Medir custo de inicialização e isolamento | `2f660dc6` | Docs de módulos e integração V2 | Piloto operacional com estado público e diagnóstico protegido |
| 04 | Event Bus | `IN PROGRESS` | Core e catálogo gerado | Manus AI | Eventos órfãos ou catálogos divergentes | Catálogo atual: 19 eventos / 8 namespaces; testes verdes | Payloads e contexto precisam continuar versionados | Latência de evento ainda sem orçamento formal | `2f660dc6` | `docs/architecture/events.md` | Fechar health, correlação e detecção de eventos órfãos |
| 05 | Task Manager | `IN PROGRESS` | Runtime, lifecycle e observabilidade | Manus AI | Retry/cancelamento sem contrato uniforme | Cobertura parcial do runtime | Ownership e limites ainda precisam de auditoria | Timeout e filas sem benchmark completo | `2f660dc6` | Docs de runtime | Formalizar queue, retry, timeout, progress e ownership |
| 06 | Data Layer | `IN PROGRESS` | Storage, schema, migration, validation | Manus AI | Acesso direto e fronteiras Node/TS residuais | Storage, offline, persistência local e GEN-TS-001 verdes localmente | Classificação, backup e recuperação incompletos | Latência e tamanho de dados sem orçamento geral | `e18efef3` | `docs/v2/GEN_TS_001_FIX.md` | Publicar fix, observar CI e auditar demais scripts Node/TS como GEN-TS-002 |
| 07 | Evidence Layer | `IN PROGRESS` | Data Layer, provenance e versionamento | Manus AI | Evidência pode ser tratada como fato sem fonte | Contratos e integração V2 existentes | Proveniência e revisão devem permanecer obrigatórias | Indexação e grafo ainda não medidos | `2f660dc6` | `v2/data/evidence.ts` e docs V2 | Expandir deduplicação, supersession e lineage |
| 08 | Wiki Data Integration | `IN PROGRESS` | Fixtures, schema, Evidence e módulos Wiki | Manus AI | Ingestão automatizada prematura | Fixtures e Arma 3 têm gates próprios | Fonte/licença/revisão obrigatórias | Pipeline e índices ainda sem benchmark | `2f660dc6` | Roadmap Wiki / Arma 3 docs | Fechar um piloto modular antes de ingestão ampla |
| 09 | Real Persistence | `BLOCKED` para produção; `IN PROGRESS` local | Supabase staging, RLS, migrations, rollback | Manus AI / Lucas | Conectar ambiente errado ou sem revisão RLS | Harness local e contratos Billing verdes | Driver remoto desligado por padrão; writes não ativados | Sem benchmark remoto autorizado | `2f660dc6` | Phases 13–16 de Billing | Confirmar staging e executar RLS formal |
| 10 | Tenancy | `IN PROGRESS` | Account, workspace, membership, RLS | Manus AI | Isolamento client-side não é autoridade | Testes locais de workspace/account/membership | RLS server-side ainda precisa de evidência remota | Consultas multi-tenant sem carga medida | `2f660dc6` | Billing contracts / SQL migration | Validar isolamento em staging |
| 11 | Permissions | `IN PROGRESS` | Core, Auth, Tenancy, Module Registry | Manus AI | Role confiada ao cliente | Concessão/revogação local e gates V2 | RBAC/RLS server-side ainda é dependência | Sem medição de custo RLS | `2f660dc6` | `V2_RULES.md`, permission docs | Conectar autorização de produção sem localStorage como autoridade |
| 12 | Auth | `BLOCKED` para release de identidade | Supabase/Auth, login-cadastro, RLS, redirects | Manus AI / Lucas | Login fora da main ou sem testes completos | Superfície Spotify usa PKCE; login-cadastro precisa validação própria | Tokens e papéis não podem entrar no bundle | Refresh e redirects reais ainda não validados | `2f660dc6` | `RELEASE_PLAN.md`, feature/login-cadastro docs | Auditar/converter login e validar Auth/RLS |
| 13 | Account / Workspace | `IN PROGRESS` | Auth, Tenancy, Membership | Manus AI | Modelo pode duplicar identidades | Billing local cobre membership e workspace | Ownership e exportação ainda incompletos | Sem carga real | `2f660dc6` | Billing docs | Consolidar contrato de account/workspace |
| 14 | Billing Foundation | `IN PROGRESS` / read-only staging | Data, Tenancy, RLS, observability | Manus AI | Escrita remota sem atomicidade ou provider acoplado | `1042/1042`, transação local, drivers HTTP e preflight | HTTPS, principal fixo, RLS gate, writes desativados | Retry/timeout local; sem benchmark remoto | `2f660dc6` | Phases 13–18 de Billing | RPC/transação server-side após staging aprovado |
| 15–18 | Plans, Entitlements, Limits, Usage Ledger | `IN PROGRESS` local | Billing, Account, Data | Manus AI | Regras comerciais prematuras | Idempotência, assignment+usage e ledger locais | Sem cobrança/provider real | Custo por usage ainda não medido | `2f660dc6` | Billing persistence docs | Validar constraints e RLS em staging |
| 31–35 | JARVIS Foundation, Tools, Agent Security, Memory, Knowledge Graph | `IN PROGRESS` | Core, Permissions, Evidence, observability | Manus AI | Agente ganhar autoridade excessiva | Presença musical, Spotify PKCE e contexto testados | Opt-in, menor privilégio, tokens em memória | Otimização ainda precisa de benchmark | `2f660dc6` | JARVIS phase docs | Medir baseline e fechar tool registry seguro |
| 56–60 | CI Specialists, CI Hardening, Test Matrix, Invariants, Failure Injection | `IN PROGRESS` | CI, scripts e contratos | Manus AI | Gate verde por omissão ou ambiente | 8 workflows remotos verdes no SHA atual; gates locais verdes | CodeQL e checks existentes | Falta matriz completa de performance | `2f660dc6` | CI audit / workflows | Resolver limitações ambientais e ampliar matriz |
| 61–65 | Performance, Accessibility, Responsive, PWA | `IN PROGRESS` parcial | Frontend, mobile, desktop | Manus AI | Declarar leveza sem medição | Smoke e caminho crítico verdes; memória/offline históricos | Reduced motion presente em parte da UI | Chunks grandes e métricas incompletas | `2f660dc6` | Performance/accessibility docs | Medir budgets e cobertura de superfícies |
| 66–73 | Desktop, Mobile, 3D e governança de assets | `IN PROGRESS` parcial | Build, Capacitor, Electron, assets | Manus AI | Runtime local e licença de assets | Build e 3D integration verdes; Rust local bloqueado | IPC/licença/metadata precisam revisão | Bundle/3D budgets incompletos | `2f660dc6` | Desktop/3D docs | Completar governança e validação por superfície |
| 74–80 | Wikis, projetos externos, registry e plugins | `IN PROGRESS` arquitetural | Module System, APIs, permissions | Manus AI | Copiar internals ou abrir plugins cedo | Arma 3 e contratos externos parciais | Plugins e integrações não têm autoridade universal | Carga de busca/indexação não medida | `2f660dc6` | Roadmap and onboarding docs | Manter adapters e adiar marketplace real |
| 81–95 | Analytics, privacy, data export/deletion, settings, admin, support | `NOT STARTED` ou parcial | Auth, Data, Permissions, observability | Manus AI / Lucas | Coleta excessiva e admin client-side | Automação diária e diagnósticos parciais | LGPD, retenção, exportação e exclusão incompletos | Sem orçamento de telemetria | `2f660dc6` | Docs scattered | Definir inventário de dados antes de instrumentar |
| 96–105 | Release, environments, migrations, integrity, incidents, docs | `IN PROGRESS` parcial | CI, release plan, backup, recovery | Manus AI | Release declarada sem recuperação testada | `1.1.0`, CI remoto verde, docs de fases | Rollback e restore reais ainda faltam | Performance/custo não fechados | `2f660dc6` | `RELEASE_PLAN.md`, phase docs | Atualizar baseline e definição de pronto |
| 106–121 | Generated docs, full test, audits, onboarding, DX | `IN PROGRESS` parcial | Todas as camadas | Manus AI | Matriz virar promessa sem evidência | Relatórios e scripts existentes | Auditorias de segurança ainda parciais | Um comando de verificação ainda não consolidado | `2f660dc6` | Docs V2 | Criar `verify:v2` somente após mapear gates reais |
| 122–145 | Bootstrap, diagnostics, offline, scheduler, health, incidents, Git Nexus, integrations | `IN PROGRESS` arquitetural | Core, automation, integrations | Manus AI | Automação externa sem kill switch/approval | Relatório diário e monitor de issues existentes | Ações externas exigem confirmação | Scheduler e health integrado ainda parciais | `2f660dc6` | Automation docs | Isolar integrações e registrar estados `unknown` |
| 146–153 | Scalability, load, cost e economics | `NOT STARTED` | Billing, telemetry, production-like fixtures | Manus AI / Lucas | Números inventados ou decisões financeiras sem dados | Nenhum benchmark completo observado | Sem produção real | Custo/latência ainda não medidos | `2f660dc6` | Roadmap | Criar simulações reprodutíveis antes de conclusões |
| 154–188 | Audits finais, RC, V2 stable, observation e V2.1 | `DEFERRED` | Todas as fases anteriores | Manus AI / Lucas | Declarar V2 completa cedo | Critérios ainda não satisfeitos | Security/recovery/docs não fechados | Baseline final inexistente | — | Master prompt | Só iniciar quando os blockers forem fechados |

## 4. Próximas fases válidas

1. **Atualizar a baseline e este mapa no SHA corrente**, mantendo `PHASE_00_AUDIT.md` histórico e registrando a diferença.
2. **Publicar e observar a correção GEN-TS-001**; depois auditar as demais fronteiras Node/TypeScript como `GEN-TS-002`, sem editar artefatos para satisfazer o gate.
3. **Reavaliar `feature/login-cadastro`** contra o `main` atual; conversão e integração só depois de testes Auth/RLS/redirect.
4. **Executar o piloto operacional de Module Registry** com estado, health, fallback, quarentena e autorização server-side.
5. **Validar Billing em Supabase staging** apenas após RLS, observabilidade, rollback e aprovação formal.

## 5. Definição de pronto aplicada nesta matriz

Uma fase só pode mudar para `COMPLETE` quando houver contrato, implementação, testes, revisão de segurança, consideração de performance, documentação, ausência de segredos/hacks temporários, publicação no `main`, verificação pós-publicação e SHA registrado.

## Referências

[1]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte "Repositório oficial"
[2]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/423 "Issue #423 — Plano Mestre V2"
[3]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/420 "Issue #420 — Fundação e transição V1 → V2"
[4]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/422 "Issue #422 — Wiki Project Zomboid"
