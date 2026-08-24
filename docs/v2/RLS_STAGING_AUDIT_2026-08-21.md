# RLS / Staging / Distributed Security Audit — 2026-08-21

**Status:** AUDIT ONLY — NO REMOTE DDL, NO SUPABASE WRITE

**Audited commit:** `f3973ecc37fbf6044e930f385c93de18280c6c2a`
**Repository:** `Lucas-Belucci-Bellini/Projeto-Baluarte`  
**Branch:** `main`  
**Author:** Manus AI  
**Audit scope:** local repository contracts, backend adapters, documentation and declared gates

## 1. Executive summary

A auditoria confirma que a `main` possui uma fronteira server-side read-only para health, claims e observabilidade, mas ainda **não possui evidência suficiente para declarar RLS, tenancy, auditoria operacional de produção ou rate limit distribuído como concluídos**. O código local não contém migrations SQL confirmadas neste checkout; portanto, não é possível inferir políticas, tabelas, ownership ou isolamento de tenant a partir do repositório auditado.

Nenhum DDL remoto foi aplicado, nenhuma policy foi criada, nenhum branch de staging foi provisionado e nenhuma escrita foi executada no Supabase durante esta auditoria. A ausência de evidência foi mantida como bloqueio, não convertida em aprovação implícita.

## 2. Evidence matrix

| Boundary | Evidence found | Current state | Safe conclusion |
|---|---|---|---|
| Server claims | `backend/claims_adapter.py`, `api/claims.py`, FastAPI `/claims/observe` | Read-only, deny-by-default, roles bounded, TTL and redaction tested | Observação server-side existe; não substitui RLS |
| Server observation | `backend/observation_contract.py`, `api/observability.py`, TypeScript consumers | Health + claims composed as bounded evidence; `authority: not-authorized` | Evidência existe; não autoriza operação |
| Transport security | `backend/transport_security.py` and focused tests | Explicit CORS, process-local window limiter and redacted audit events | Limiter is not distributed and audit is not a production retention system |
| Supabase Auth | Adapter calls Auth `/user` only when server configuration exists | Read-only identity observation | Auth acceptance is not proof of database RLS |
| SQL migrations | No `*.sql` migration files were found in the checked-out repository path | Unknown / absent local evidence | Do not invent schema or policies |
| Tenant isolation | No validated local policy test or schema contract was found in this audit | Blocked | Requires schema, ownership model and isolation tests |
| Production audit | Categorical redacted logs exist locally | Incomplete | Requires retention, correlation, access control and review policy |
| Distributed rate limit | Only process-local limiter is implemented | Incomplete | Requires shared store or provider contract and failure semantics |
| Staging | No staging branch or remote database was created | Intentionally not started | Requires explicit cost and environment confirmation |

## 3. Root causes of the current blockers

The principal blocker is not a failing unit test. It is **missing authoritative evidence** for the data boundary. The repository at `f3973ecc37fbf6044e930f385c93de18280c6c2a` now proves local RLS decision cases, but it does not provide a versioned SQL source of truth that defines entities, tenant ownership, indexes, constraints, audit records, policy predicates or rollback migrations.

The second blocker is governance. A Supabase staging environment has an operational cost and must not be created implicitly. The current project instructions explicitly prohibit applying remote DDL without staging validation and explicit confirmation. Consequently, the correct state is `BLOCKED / NOT STARTED`, not `GREEN` and not `FAILED`.

The third blocker is distribution. The transport limiter is intentionally process-local. It protects a single process but cannot enforce a global quota across multiple FastAPI workers, serverless instances or regions. Treating it as a distributed security control would be an architectural false positive.

## 4. Required evidence before any remote DDL

Before a future RLS slice may touch Supabase, it must provide a versioned migration set and a local validation harness covering the following items:

1. Entity and tenant model, including ownership columns, nullability, foreign keys and deletion semantics.
2. Policy matrix for anonymous, authenticated user, admin, developer and owner roles, with roles sourced from protected server-side metadata rather than client-editable fields.
3. Read/write policy tests for allowed, denied, cross-tenant and missing-identity cases.
4. Service-role boundary showing that privileged server operations are never exposed to browser code.
5. Audit schema and retention policy that does not store bearer tokens, raw claims or unnecessary personal data.
6. Idempotency, concurrency and rollback behavior for each write path.
7. Staging deployment, smoke tests, rollback proof and cost confirmation before production application.

## 5. Explicit non-actions in this audit

No `CREATE TABLE`, `ALTER TABLE`, `CREATE POLICY`, `DROP POLICY`, `GRANT`, `REVOKE`, migration application, Supabase branch creation, data write, service-role operation or remote configuration change was performed. No credentials were exposed or copied into project files.

## 6. Recommended order

The safest next step is a **contract-only local SQL/RLS design** that does not connect to Supabase. After local review, the operator must explicitly confirm whether a staging environment and its hourly cost may be created. Only then should a separate staging validation phase run migrations, policy tests and rollback drills. Production RLS must remain blocked until staging evidence is complete.

The distributed rate limiter and production audit trail should be designed as independent contracts. They must not be silently bundled into an RLS migration because their failure modes, retention requirements and operational owners differ.

## 7. Rollback

This audit made no runtime or database changes. Rollback is therefore limited to removing this document. The published application remains at `1e3ffd0a` and all previous code contracts remain unchanged.

— **Manus AI**
