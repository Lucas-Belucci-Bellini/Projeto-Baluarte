# Distributed Rate Limit and Audit Contract — 2026-08-21

**Status:** CONTRACT FIRST — local simulator only; no provider configured  
**Repository:** `Lucas-Belucci-Bellini/Projeto-Baluarte`  
**Base SHA:** `b60ce5205628d6ee5595e175596c32c1a7dcd402`  
**Scope:** contract, failure semantics and bounded audit only

## 1. Purpose

O transporte atual usa `FixedWindowRateLimiter`, seguro para concorrência dentro de um processo, mas incapaz de impor uma quota global entre instâncias FastAPI, funções serverless ou regiões. Este contrato define a fronteira para uma implementação futura baseada em armazenamento compartilhado sem fingir que o simulador local é distribuído.

> **Uma quota distribuída exige uma operação atômica em armazenamento compartilhado. Um mapa em memória é apenas um fixture de contrato.**

## 2. Shared-store contract

| Operation | Required behavior |
|---|---|
| `increment(windowKey, windowStart, limit)` | Atomic increment and bounded response containing count, limit and reset timestamp; the raw key never enters an audit event. |
| `availability()` | Reports `available` or `unavailable` without exposing provider credentials or topology. |
| `expire(windowKey, resetAt)` | Lets the provider release stale windows; expiration failure is observable and bounded. |
| `failureMode` | Protected endpoints fail closed when the store is unavailable; the response remains redacted and must not claim a global quota. |
| `route separation` | The route and policy namespace are part of the non-reversible bucket material so claims and observability do not share a quota accidentally. |

The production adapter must use a provider-side atomic primitive. A process-local fallback may be used only as an explicitly labeled degraded development mode; it cannot be advertised as distributed protection.

## 3. Decision states

| Store | Quota | Decision | Audit |
|---|---|---|---|
| Available | Under limit | `allowed` | `storage: shared`, no key/identity |
| Available | At or over limit | `blocked` | `rateLimited: true`, reset timestamp only |
| Unavailable | Unknown | `blocked` for protected routes | `storage: unavailable`, `failureMode: closed` |
| Local simulator | Any | `simulated` | `storage: local-simulator`, never production evidence |

## 4. Bounded audit contract

Audit events may contain only contract version, route class, HTTP status class, origin-allowed boolean, rate-limited boolean, storage state, failure mode, decision and request-id presence. They must not contain bearer tokens, authorization headers, raw bucket keys, IP addresses, subjects, emails, user metadata, provider URLs, stack traces or query strings.

Every event must be safe to emit at `INFO` or higher without turning the log into a credential or identity store. Retention, access control, correlation and review ownership remain production-operations work and are not solved by the local simulator.

## 5. Compatibility and rollback

The future adapter must preserve `server-claims/v1`, `server-observation/v1`, the V1 sidebar, `publicPromotionAllowed: false`, deny-by-default claims and the current process-local helper until a provider-backed contract is explicitly accepted. No SQL, RLS, Supabase branch, external cache, payment, message or JARVIS tool operation belongs in this slice.

Rollback removes the pure contract, simulator, tests and document. No persisted data, migration or public route is changed.

— **Manus AI**
