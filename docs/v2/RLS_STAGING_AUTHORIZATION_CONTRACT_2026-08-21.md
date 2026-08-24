# RLS Staging Authorization Contract — 2026-08-21

**Status:** LOCAL-ONLY CONTRACT PUBLISHED — no staging provisioned and no remote DDL applied
**Repository:** `Lucas-Belucci-Bellini/Projeto-Baluarte`  
**Base SHA:** `1e3ffd0a9b5bccbc5b04ca7df24246f88c259a9e`  
**Published SHA:** `f3973ecc37fbf6044e930f385c93de18280c6c2a`
**Scope:** local design and authorization gates only

## 1. Purpose

Este contrato define quando a preparação de RLS poderá sair do modo documental e entrar em um ambiente de staging. Ele não cria branch, não aplica migration, não executa SQL remoto e não altera o projeto Supabase. O objetivo é impedir que uma intenção de segurança seja confundida com uma policy validada.

> **Nenhum DDL remoto é permitido por inferência. Staging, custo, schema, policies, testes e rollback precisam ser aprovados como uma sequência rastreável.**

## 2. Authorization gates

| Gate | Required evidence | Blocking rule |
|---|---|---|
| Cost | Explicit operator confirmation of the staging hourly cost and lifetime budget | Without confirmation, do not provision a staging branch |
| Schema | Versioned SQL migrations, entity map, ownership and tenant keys | No SQL application with an unknown schema |
| Identity | Auth subject, protected role source and service-role boundary | Never use localStorage, query string or user_metadata as authority |
| Policies | Matrix for anonymous, user, admin, dev and owner read/write cases | Missing deny cases block staging |
| Tests | Local policy tests for allowed, denied, cross-tenant and expired identity cases | No remote run before local tests pass |
| Audit | Redacted audit event schema, retention, access control and review owner | No production audit claim from process-local logs |
| Rollback | Down migration, backup/restore proof and failure procedure | No irreversible DDL |
| Observability | Health, migration result, policy result and rollback evidence | Unknown state must remain `unknown`, not green |

## 3. Staging sequence

The permitted sequence is intentionally linear:

1. Review and approve the local schema and policy contract.
2. Confirm the staging cost and authorize provisioning.
3. Provision only the named staging environment.
4. Apply versioned migrations through the approved channel.
5. Run policy, tenancy, concurrency and redaction tests.
6. Execute the rollback drill and verify the backup/restore result.
7. Record the exact project, migration hashes, test results, cost and rollback evidence.
8. Decide separately whether production review is allowed.

Any failure stops the sequence. There is no automatic promotion from staging to production.

## 4. Required local fixtures before staging

The local-only implementation published at `f3973ecc37fbf6044e930f385c93de18280c6c2a` models an anonymous request, an authenticated user, a cross-tenant user, admin/developer/owner roles, an expired identity, missing tenant ownership and a service-role operation. The seven local tests assert positive and deny paths. Fixtures contain no real bearer tokens, personal data or production secrets.

The first RLS migration should be intentionally narrow. It must not combine billing writes, marketplace state, social content, WhatsApp operations, news ingestion, JARVIS tool execution or app-device permissions. Each domain requires its own transaction, audit and rollback contract.

## 5. Explicit non-authority

The following are observations or local test inputs only: `server-observation/v1`, `module-observation-visual`, `controlled-rollout-evidence`, harness fixtures, local claims, browser state and process-local rate limiting. None of them authorizes DDL, grants access, changes a Registry mode or writes to Supabase.

## 6. Rollback and stop conditions

The work must stop before staging if cost approval, schema ownership, local policy coverage, migration rollback or service-role isolation is missing. If a staging migration fails, the operator must restore from the approved backup or run the verified down migration before any retry. A remote failure is recorded as `unknown/external` until logs and state are inspected.

— **Manus AI**
