# Server Observation Evidence Contract — 2026-08-21

**Status:** CONTRACT FIRST — implementation pending in this slice  
**Repository:** `Lucas-Belucci-Bellini/Projeto-Baluarte`  
**Base SHA:** `d2d4443c786294ac3cad438a22c307d424990894`  
**Contract:** `server-observation/v1`  
**Authority:** always `not-authorized`

## 1. Purpose

Este marco cria uma fronteira única e read-only para observar, no servidor, o health do backend e a projeção redigida de claims. O objetivo é fornecer evidência suficiente para consumidores V2 decidirem como **exibir** estado, sem transformar a resposta em autorização, fallback operacional, promoção de módulo, alteração de Registry ou execução de ferramenta.

> **Health observado não é autorização. Claims observadas não são autorização. Fallback projetado não executa fallback.**

## 2. Envelope

O endpoint `GET /observability/observe` e o handler Vercel `/api/observability` retornam:

| Field | Contract | Meaning |
|---|---|---|
| `contractVersion` | `server-observation/v1` | Version of the combined envelope. |
| `source` | `server-observed` | The server produced the observation. |
| `health` | `server-health/v1` | Existing liveness/readiness projection; it never includes the secret itself. |
| `claims` | `server-claims/v1` | Existing redacted, deny-by-default identity projection. |
| `evidence` | bounded booleans and categories | Explains what was observed and which visual fallback state may be shown. |
| `transport` | booleans only | Reports `originAllowed` and `rateLimited`; it never reports a token, subject, IP or bucket key. |
| `authority` | `not-authorized` | Immutable boundary marker. |

The `evidence` object contains `healthObserved`, `claimsObserved`, `claimsFresh`, `severity`, `fallback` and a bounded list of reason codes. Reason codes are limited to `health-degraded`, `claims-absent`, `claims-stale`, `rate-limited` and `observation-ready`.

## 3. Projection rules

1. The health projection is always observed when the endpoint responds. If the Gemini key is absent, health remains `degraded`, severity is `warning` and fallback is `degraded`.
2. Claims are observed only when the existing server-side adapter can produce them. A missing Bearer, missing Supabase configuration, invalid identity or stale payload yields `claimsObserved: false` or `claimsFresh: false`; it never grants scopes.
3. `observation-ready` is evidence that the envelope itself is structurally complete, not permission to promote a module or execute a fallback.
4. The combined fallback is `available` only when health is healthy and claims are fresh. It is `degraded` when health or claims evidence is incomplete. It is `blocked` only when the health projection itself is unavailable or a future consumer explicitly maps a failed server observation to a blocked visual state. This endpoint does not execute that block.
5. The combined severity is `none` only when health is healthy and claims are fresh; otherwise it is `warning`. A transport `429` remains `warning` and reports `rate-limited`.
6. `authority` remains `not-authorized` for successful and rate-limited responses.

## 4. Redaction and privacy

The combined envelope must not contain Authorization headers, Bearer tokens, JWT bodies, subjects, emails, raw Supabase responses, `user_metadata`, `app_metadata`, client IPs or upstream exception text. The claims adapter may expose only its existing booleans, bounded role-derived scopes and validity timestamps; the combined evidence layer does not add identity data.

## 5. Transport

The endpoint reuses the server-claims transport controls: exact-origin CORS allowlist, no wildcard headers or methods, process-local fixed-window rate limiting, `Retry-After` on exhaustion and categorical audit events. A rate-limited response is an observation envelope with `transport.rateLimited: true` and a non-sensitive error indicator; it is not a permission denial from the Permission Manager.

## 6. TypeScript consumer

The frontend contract in `src/layout/server-observation.ts` must parse unknown input defensively, retain only the bounded categories, preserve `authority: 'not-authorized'`, and map the envelope to the existing `RuntimeObservation` read-only semantics. It must not call an operational fallback, change the Module Registry or infer admin/dev/owner from client state.

## 7. Tests

Focused tests must cover healthy/fresh evidence, degraded health, absent claims, stale claims, rate-limited transport, bounded reason codes, redaction and FastAPI/Vercel structural parity. Existing claims, health, transport, TypeScript, V2 integration, smoke, critical-path, build and remote CI gates remain mandatory.

## 8. Risks and non-goals

This endpoint is not a distributed health authority, an RLS proof, a session refresh service, a module-promotion gate or an operational fallback executor. It does not apply DDL, create a Supabase staging project, add billing, send messages, publish content or integrate OpenClaw. The main risk is consumers treating a well-formed observation as authorization; the immutable field and tests exist to prevent that semantic drift.

## 9. Rollback

Rollback removes the combined contract, its FastAPI/Vercel adapters, the TypeScript consumer and focused tests, returning consumers to the existing separate `server-health/v1` and `server-claims/v1` endpoints. The previous published baseline is `d2d4443c786294ac3cad438a22c307d424990894`. No rollback may reintroduce wildcard credentials, client-side roles or executable fallback.

## 10. Definition of done

The slice is complete only when the pure projection, FastAPI endpoint, Vercel endpoint and TypeScript consumer agree on the bounded envelope; focused tests and mandatory gates pass except for any already documented external blocker; redaction and `not-authorized` are proven; the contract, README, rollback and SHA are recorded; and the implementation is published directly to `main` with applicable remote workflows green.

— **Manus AI**
