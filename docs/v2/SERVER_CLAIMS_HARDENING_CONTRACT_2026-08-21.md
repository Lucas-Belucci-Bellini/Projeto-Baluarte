# Server Claims Hardening Contract — 2026-08-21

**Status:** IMPLEMENTED AND PUBLISHED
**Repository:** `Lucas-Belucci-Bellini/Projeto-Baluarte`  
**Base SHA:** `341abbc942c7e43fba7c967a1b98ed1ab26431c1`  
**Published SHA:** `3553deb0870aee5ba5ba14d4eca4c9599b194e59`
**Scope:** transport hardening for `GET /claims/observe` and `/api/claims`  
**Authority:** always `not-authorized`

## 1. Purpose

Este marco reduz três riscos já registrados no contrato `server-claims/v1`: CORS aberto, ausência de limite explícito por processo e ausência de auditoria operacional redigida. A mudança não cria autorização, não ativa RLS, não interpreta `user_metadata`, não decodifica JWT localmente e não transforma claims observadas em permissão operacional.

> **Regra central:** CORS, rate limiting e auditoria são controles de transporte e observabilidade. Nenhum deles concede `decision: authorized` ou `authority: authorized`.

## 2. Contract surface

| Concern | Contract | Failure behavior |
|---|---|---|
| CORS | Origins are read from `BALUARTE_ALLOWED_ORIGINS`, as a comma-separated exact-origin allowlist. The default is local development only: `http://localhost:5173` and `http://127.0.0.1:5173`. | A missing or unlisted `Origin` receives no `Access-Control-Allow-Origin`; preflight is not granted. Same-origin requests remain usable because CORS headers are browser transport metadata. |
| Allowed methods and headers | `GET, OPTIONS`; request headers `Authorization, Content-Type, X-Request-ID`; no wildcard methods or headers. | Unsupported preflight is not authorized by the CORS layer. |
| Rate limiting | In-memory fixed window per route and client key, configured by `BALUARTE_CLAIMS_RATE_LIMIT` and `BALUARTE_CLAIMS_RATE_WINDOW_SECONDS`. Defaults: 30 requests per 60 seconds. | On exhaustion, return HTTP `429`, `Retry-After`, and rate-limit response headers. The body is a non-sensitive error envelope; no token or subject is included. |
| Audit logging | Structured logger event for claims requests with method, route, status class, origin-allowed boolean, rate-limited boolean, decision and request-id-presence boolean. | Tokens, Authorization values, subjects, emails, raw claims, metadata and client IP are never emitted. Logging failure must not grant authority. |
| Parity | FastAPI and Vercel handlers use the same pure allowlist/rate-limit/audit helper semantics where the runtime permits. | A runtime-specific adapter may differ in response plumbing, but the envelope remains `server-claims/v1`. |
| Authority | `decision` and `authority` remain `not-authorized`. | No operational fallback, module promotion, Permission Manager call or RLS write is allowed. |

## 3. Configuration

The backend accepts the following server-only environment variables:

```text
BALUARTE_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
BALUARTE_CLAIMS_RATE_LIMIT=30
BALUARTE_CLAIMS_RATE_WINDOW_SECONDS=60
```

For production, the deployment owner must replace the local defaults with the exact HTTPS origins used by the published site. Wildcards are not accepted by the helper. The frontend never receives these values as secrets; the allowlist is transport configuration, not credential material.

## 4. Rate-limit semantics

The default limiter is intentionally process-local and bounded. It protects a single FastAPI worker or serverless instance from accidental bursts, but it is **not** a distributed quota. Multi-instance production protection remains a separate milestone requiring a reviewed shared store or provider-native edge limit. No Supabase table, Redis instance or remote mutation is introduced by this slice.

The key is derived from the request transport identity available to the runtime. The key is used only for counting and is never written to the audit event. A missing key is placed in a bounded anonymous bucket rather than trusted as an authenticated identity.

## 5. Audit redaction

The audit event is an operational signal, not an identity record. It may contain booleans and bounded categorical values only. The following values are prohibited in the event and in error responses:

- `Authorization` headers and Bearer tokens;
- `subject`, e-mail, raw JWT claims, `user_metadata` and `app_metadata`;
- Supabase response bodies;
- client IP addresses and forwarded-IP headers;
- upstream exception text or stack traces.

## 6. Tests and gates

The focused tests must cover exact-origin allowlisting, wildcard rejection, preflight headers, limiter window reset, exhaustion and redacted audit fields. Existing Python claims, health, TypeScript, V2 integration, smoke, critical-path, build and remote CI gates remain mandatory.

The existing `project_verified_supabase_payload()` path remains the only path that may project TTL and roles from a payload already verified by a trusted JWT/JWKS library. This slice does not add JWT decoding or formal RLS integration.

## 7. Risks

The principal operational risk is configuration drift: a deployed HTTPS origin not present in `BALUARTE_ALLOWED_ORIGINS` will lose browser CORS access while direct same-origin or server-to-server calls can remain available. The process-local limiter can under-count across instances and is therefore documented as a first containment layer, not as an abuse-prevention guarantee.

## 8. Rollback

Rollback is limited to the files in this vertical slice: remove the shared transport-security helper, restore the previous permissive CORS adapter only if an explicitly approved emergency is recorded, remove the focused tests and revert this document. Do not rollback by reintroducing client-side authorization or by enabling wildcard credentials. The previous published baseline is `341abbc942c7e43fba7c967a1b98ed1ab26431c1`.

## 9. Non-goals

This milestone does not apply Supabase DDL, create a staging project, change RLS, add billing, enable external messaging, send WhatsApp content, publish news, authorize module promotion or replace the V1 shell/router.

## 10. Definition of done

The FastAPI and Vercel claim handlers no longer emit wildcard CORS, the focused tests and mandatory local gates pass except for the documented Cargo 1.75.0/edition2024 external blocker, the environment contract is documented in the backend README, no secret-bearing logs are possible in the covered path, rollback is recorded, and commit `3553deb0870aee5ba5ba14d4eca4c9599b194e59` is published directly to `main` with the seven applicable remote workflows green.

— **Manus AI**
