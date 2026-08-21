# Controlled Rollout Evidence Contract — 2026-08-21

**Status:** IMPLEMENTED AND PUBLISHED
**Repository:** `Lucas-Belucci-Bellini/Projeto-Baluarte`  
**Base SHA:** `f50205b4ac5d5db77b81618f73642afe68dcc53c`  
**Published SHA:** `ceac89fab95486b084ca413a25eee1411216641c`
**Surface:** controlled rollout eligibility only; no public promotion

## 1. Purpose

Este contrato fecha a fronteira entre o envelope `server-observation/v1`, que descreve health/claims redigidos, e o `promotion-gate.ts`, que exige autoridade server-side e rollback. A nova função pode classificar uma superfície como **elegível para uma operação controlada futura**, mas não executa essa operação e nunca permite promoção pública.

> **Observação server-side informa o estado. Autoridade server-claims autoriza a operação futura. Rollback torna a operação reversível. Nenhuma dessas evidências altera o shell por conta própria.**

## 2. Required evidence

| Evidence | Required rule |
|---|---|
| `serverObservation` | Must be present, `authority: not-authorized`, health observed, claims observed and fresh, severity `none`, fallback `available`, and transport not rate-limited. |
| `alignment` | Must already be an aligned module candidate with verified deep link and `v1-preserved` fallback. The adapter does not manufacture alignment. |
| `authority` | Must pass the existing `promotion-gate.ts`: source `server-claims`, permitted `true`, role `admin`, `developer` or `owner`, non-empty `requestId` and `auditId`. The visual observation cannot satisfy this field. |
| `rollback` | Must be reversible, carry a non-empty fallback path and a rollback reference. |

The combined decision exposes `observationReady`, `eligibleForControlledRollout`, `status`, bounded reasons, `normalUserAction: preserve-current-surface` and literal `publicPromotionAllowed: false`.

## 3. State matrix

| Observation | Authority / rollback | Result | Public surface |
|---|---|---|---|
| Missing, stale, degraded or rate-limited | Any | `blocked` | V1 preserved |
| Ready | Missing or invalid | `blocked` | V1 preserved |
| Ready | Valid authority, invalid rollback | `blocked` | V1 preserved |
| Ready | Valid authority and rollback | `eligible` for controlled rollout only | V1 still remains the public surface |

## 4. Security boundary

The adapter must not read `localStorage`, query strings, client roles, `user_metadata`, DOM state or tokens. It must not call Supabase, change Registry mode, modify the router, hide a route, write SQL, execute fallback or start a sale/message/external integration. It only composes already-projected evidence and delegates authority/rollback checks to the existing promotion gate.

A successful result is not permission for the browser to mutate the site. An operator workflow must separately decide whether and how to execute a reversible controlled rollout. This slice deliberately stops before that side effect.

## 5. Compatibility and rollback

The adapter is a pure TypeScript contract used by tests and the V2 harness. It does not replace `evaluatePromotionGate()`, `decideModuleAlignment()`, `server-observation/v1`, the Command Center projection or the V1 sidebar. Rollback removes the adapter, tests, harness exposure and this document; no public route, manifest, Supabase schema or persisted data changes.

## 6. Definition of done

The slice is complete: the adapter proves all four matrix rows, preserves `publicPromotionAllowed: false`, rejects observation-as-authority confusion, is exposed only as a read-only harness proof, and is published on `main` at `ceac89fab95486b084ca413a25eee1411216641c`. The eight applicable remote workflows are green; the documented local Rust toolchain blocker remains external to this slice.

— **Manus AI**
