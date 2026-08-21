# Module Observation Visual Contract — 2026-08-21

**Status:** CONTRACT FIRST — implementation pending in this slice  
**Repository:** `Lucas-Belucci-Bellini/Projeto-Baluarte`  
**Base SHA:** `38ae7efc1de24f0361bfab70d7f9ec0e56b83c55`  
**Input:** `server-observation/v1`  
**Surface:** harness/controlled rollout only

## 1. Purpose

Este contrato transforma a evidência server-side já redigida em um estado visual por módulo, sem conectar o resultado à sidebar V1, ao router público, ao Permission Manager ou à promoção do editor. Ele permite que o Command Center e o piloto de alinhamento **observem** a saúde de uma superfície e mostrem um fallback neutro sem decidir quem pode acessar a rota.

> **Disponibilidade visual é uma projeção. Não é autorização, não é health operacional completo e não é uma ordem para desabilitar ou promover um módulo.**

## 2. Input and output

A entrada é um `ServerObservationEnvelope` por `moduleId`. A saída é `ModuleObservationVisualDecision`:

| Field | Rule |
|---|---|
| `moduleId` | Preserved from the caller; no role or identity is inferred. |
| `availability` | `enabled` only when health is healthy, claims evidence is fresh and the server envelope is not rate-limited; otherwise `degraded`. The projection never emits `disabled`, `maintenance` or `quarantined` from this evidence alone. |
| `fallback` | Always `v1-preserved` in this slice. No module is removed from the public catalog and no deep link is rewritten. |
| `outcome` | Always `observe-only` when an envelope exists; `preserve-v1` when it is absent or invalid. |
| `reasons` | Bounded categories from health, claims freshness, rate limiting and absent observation. No stack trace or identity. |
| `authority` | Literal `not-authorized`. |
| `publicPromotionAllowed` | Literal `false`; the existing promotion gate remains the only controlled-rollout boundary. |

## 3. Mapping

| Evidence | Visual availability | User-facing behavior in this slice |
|---|---|---|
| Healthy health + fresh claims + no rate limit | `enabled` | Show the observed module state in the controlled surface; preserve V1 as the actual public surface. |
| Degraded health | `degraded` | Show a neutral degraded indicator; preserve V1 and do not expose internals. |
| Missing or stale claims | `degraded` | Show “observação incompleta” semantics; do not treat absence as permission or failure of the user. |
| Rate-limited transport | `degraded` | Show temporary observation unavailable; do not retry in a loop or execute fallback. |
| Missing envelope | `degraded` | Preserve V1 and record an observation gap in the controlled surface. |

## 4. Relationship with existing contracts

The adapter consumes `server-observation/v1` and feeds `NavigationProjection` only through an explicit `availabilityForModule` callback in a harness or controlled pilot. It does not replace `projectLegacyNavigation()`, `projectRegistryNavigation()`, `observeRegistryNavigation()`, `decideModuleAlignment()` or `evaluatePromotionGate()`.

A `promotion-candidate` from module alignment is not enough to promote publicly. The existing promotion gate still requires server claims, permitted role, request/audit identifiers and reversible rollback, and it keeps `publicPromotionAllowed: false`. This visual contract cannot satisfy those requirements because its own authority is permanently `not-authorized`.

## 5. Security and fallback

The implementation must not read `localStorage`, query strings, client metadata or editable roles. It must not call `definirModo()`, change Registry status, mutate the DOM shell, hide routes globally, call Supabase, write SQL or execute fallback. The only fallback action is a read-only label/state indicating that the V1 surface remains the public path.

## 6. Tests and rollback

Focused tests must prove the mapping for healthy/fresh, degraded, stale, absent, rate-limited and malformed evidence. A projection test must also show that a Registry navigation callback can receive the availability state without altering route count or sidebar ownership. Rollback removes the pure visual adapter, tests and this contract; no data migration or public route change is required.

## 7. Definition of done

The slice is complete when the adapter, tests and documentation are published on `main`, the Command Center/harness can consume it through an explicit callback, no public shell/router changes occur, the existing promotion gate remains authoritative, and all applicable local and remote gates pass except the documented Rust toolchain blocker.

— **Manus AI**
