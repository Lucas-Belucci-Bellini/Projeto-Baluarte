# MASTER EXECUTION MATRIX

**Status:** `CURRENT — RELEASE 1.2.5 / MODULE ALIGNMENT PILOT IMPLEMENTED / SINGLE SURFACE NEXT`
**Data da observação:** 2026-08-20
**Repositório:** `Lucas-Belucci-Bellini/Projeto-Baluarte`
**Branch oficial:** `main`
**SHA observado:** `5e9dfddf85a926acf28e403b5782dbce8cc61295`
**Tag de release base:** `v1.2.0`
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
| 07 | Real Persistence / Supabase / RLS | `BLOCKED` para produção | Staging, migrations, RPC, RLS, rollback | Ambiente errado ou write sem atomicidade | Harness local; sem write remoto autorizado | Security review obrigatória | Sem benchmark remoto | Supabase audits | `32b59ad5` | Aprovar staging e executar RLS formal |
| 08 | Auth / Authorization / Tenancy | `BLOCKED` para release de identidade | Login-cadastro, Supabase Auth, claims, RLS | Confiar em estado do cliente | Fluxos completos ainda não aceitos na main corrente | Server-side authority faltante | Refresh/redirect real pendente | Release and auth docs | `32b59ad5` | Reavaliar feature/login-cadastro |
| 09 | Permissions / Module RBAC | `IN PROGRESS` | Auth, tenancy, registry | Admin/dev/owner falsificáveis no cliente | Concessão/revogação local e V2 gates | RLS/claims não comprovados | Sem RLS cost benchmark | Permission docs | `32b59ad5` | Contrato server-side |
| 10 | Billing Foundation / Entitlements / Usage | `IN PROGRESS` local; `BLOCKED` remoto | Data, tenancy, RLS, observability | Cobrança sem transação/reconciliação | Local ledger, idempotency, preflight | Provider/write desligados | Sem provider cost benchmark | Billing docs | `32b59ad5` | RPC e staging aprovado |
| 11 | JARVIS Core / Tools / Memory / Knowledge | `IN PROGRESS` | Core, evidence, permissions | Agente ganhar autoridade excessiva | Contexto, Spotify PKCE, presence e fakes | Opt-in, least privilege, audit pendentes | Prompt/tool/memory benchmark pendente | JARVIS docs | `32b59ad5` | Tool registry e baseline de custo |
| 12 | Git Nexus / external integrations | `IN PROGRESS` arquitetural | Contracts, adapters, registry | Copiar internals e duplicar graph/memory | Nexus e adapters atuais | Permission/health/license registry pendente | Impact/search benchmark pendente | Nexus docs | `32b59ad5` | Project Registry |
| 13 | Arma 3 / Zomboid / content platform | `IN PROGRESS` | Wiki schema, evidence, assets | Conteúdo sem fonte/licença | Páginas, fixtures e data gates parciais | License, provenance, controlled export | Index/search budgets pendentes | Wiki roadmap | `32b59ad5` | Um piloto modular |
| 14 | Desktop / filesystem / private runtimes | `VALIDATING` parcialmente; escrita `DEFERRED` | Launcher, sandbox, IPC, runtimes | Acesso local indevido | Web build; sem aceite físico completo | Read-only primeiro, sandbox e allowlist | App-heavy budgets pendentes | Desktop docs | `32b59ad5` | Desktop acceptance |
| 15 | Mobile / PWA / app prototype | `VALIDATING` parcialmente | Capacitor, Android/iOS, permissions | Inferir aceite físico do smoke web | PWA/SW e web gates; hardware não validado | Device permission review pendente | Low-end/battery tests pendentes | Mobile roadmap | `32b59ad5` | Aceite Android/iOS aplicável |
| 16 | AEGIS Ocean governance | `COMPLETE` como restrição documental; produto `PLANNED` | Data classification, provenance, RLS | Dual-use e export indevido | Regra registrada em #454 | Sem targeting/interception/covert surveillance | Scientific workloads ainda não medidos | AEGIS governance docs | `32b59ad5` | Project/data registry |
| 17 | Observability / incidents / recovery | `IN PROGRESS` | Logs, metrics, health, backup | Falha sem dono ou sem retorno | Health diagnostics e daily reports | Audit/retention incompletos | RPO/RTO e drill ausentes | Ops docs | `32b59ad5` | Backup/restore drill |
| 18 | Security supply chain / CI specialists | `IN PROGRESS` | JS, Rust, Python, SQL, YAML specialists | Verde por omissão ou ambiente | CI 8/8, types, CodeQL; runtime local known-blocked | SBOM/license/dependency matrix incompleta | CI/build budgets pendentes | CI audit docs | `32b59ad5` | GEN-TS-002 and verify:v2 |
| 19 | Analytics / privacy / export / deletion | `NOT STARTED` ou parcial | Auth, data classification, consent | Coleta excessiva/admin client-side | Sem matriz completa de dados | LGPD mechanisms incomplete | Telemetry budget absent | Privacy docs | — | Data inventory first |
| 20 | Marketplace / plugins / third-party registry | `DEFERRED` | Module system, sandbox, licenses, billing | Supply-chain and permission risk | No production marketplace evidence | Manifest, sandbox, audit required | Scale/cost unknown | Future roadmap | — | Only after Module System |
| 21 | Performance / accessibility / UX audit | `IN PROGRESS` parcial | All surfaces | Claiming light/fast without measurement | Smoke/path critical; no full audit | Reduced motion partial | Boot, route, DB, JARVIS, mobile budgets missing | Design docs | `1032437c` | UI-00 inventory and measured matrix |
| 22 | Release / environments / rollback | `COMPLETE` for 1.2.0 scope; recovery `IN PROGRESS` | CI, changelog, SW, tag | Release without recovery evidence | v1.2.0 tag, notes, 8/8 CI | No secrets; rollback documented | Artifact/bundle warnings known | Changelog and release plan | `32b59ad5` | Release artifact checksums |
| 23 | Full doctor / verify:v2 / setup:v2 | `NOT STARTED` | All real gates and environment contracts | One command hides unknown states | Individual gates exist | Must preserve unknown/blocked | Runtime/remote distinctions required | Roadmap only | — | Design after gate inventory |
| UI | Baluarte Design System & Information Architecture | `IN PROGRESS — MODULE ALIGNMENT PILOT IMPLEMENTED` | Module Manifest, Registry, layout, router, permissions, health, deep links, fallback | Creating a second shell/sidebar, inferring health from stability or exposing protected actions | `UI_00_INVENTORY_2026-08-20.md`; UI-01/UI-02/UI-03/UI-04 docs; `MODULE_ALIGNMENT_PILOT_2026-08-20.md`; 12/12 UI tests; 23/23 V2 integration | Server-side authority; stability is not health; no client-only roles | Breakpoint, bundle, boot, DB and route budgets pending | PHASE UI and pilot docs | `48f28baf` base / pending pilot commit | Single-surface alignment pilot |
| 24 | V2 RC / freeze / stable / observation | `DEFERRED` | Core, modules, data, auth, billing, security, recovery | Declaring complete too early | Criteria not satisfied | Sign-offs absent | Scalability not measured | Master Prompt | — | Only after blockers close |

## 3. Próxima fase válida

A auditoria **PHASE UI / UI-00** foi concluída em modo somente leitura. `UI-01` a `UI-04` e o piloto por módulo adicionaram projeções, observação read-only, matriz de reconciliação e decisão auditável por health/deep link/fallback, com 12/12 testes UI e 23/23 no harness V2, sem substituir shell, router ou sidebar. O próximo marco é alinhar uma única superfície com rollback documentado.

O alinhamento de uma única superfície deve reutilizar o Module Manifest, manter `ShellRefs` e o fallback V1, não ativar Auth/RLS ou Billing remoto por inferência e não ocultar rotas até que health, claims, deep link, fallback, observabilidade e rollback estejam validados em conjunto.

## 4. Definition of Done aplicada

Uma fase só pode ser marcada `COMPLETE` quando houver contrato, implementação no escopo, testes, security review, consideração de performance, documentação, ausência de hacks, commit no `main`, CI aplicável, verificação pós-publicação e SHA registrado. Um PR não é obrigatório neste projeto porque a regra operacional do proprietário é publicação direta no `main`; a verificação do `main` é obrigatória.

## Referências

[1]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/420 "Issue #420 — Fundação e transição"
[2]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/422 "Issue #422 — Wiki Project Zomboid"
[3]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/423 "Issue #423 — Plano Mestre V2"
[4]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/430 "Issue #430 — Especialistas e integrador"
[5]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/454 "Issue #454 — AEGIS Ocean"
[6]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/releases/tag/v1.2.0 "Release v1.2.0"
