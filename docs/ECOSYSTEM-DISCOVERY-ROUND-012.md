# Ecosystem Discovery — Round 012

Date: 2026-08-17

## Purpose

Validate the Baluarte V2 primitives against the implementation on `main`, rather than treating the V2 plan as proof that a primitive exists.

## Findings

### 1. Event Bus — IMPLEMENTED

`src/core/events.ts` contains the canonical implementation and `src/core/events.js` is a compatibility wrapper.

The bus implements:

- exact subscriptions;
- prefix wildcard subscriptions such as `arsenal:*`;
- global subscriptions with `*`;
- `on`, `once`, `off`, `emit`, `clear`;
- listener counting;
- event metadata;
- handler isolation so one failing handler does not abort the remaining handlers.

The repository also has `scripts/gen-catalogo-eventos.mjs`, which derives an event catalogue from source code and can be enforced in CI. This means the event bus is a real internal primitive, not merely a planned architecture item.

**Mesh decision:** reuse the existing bus internally where appropriate. Do not create a second Baluarte event bus.

### 2. Storage/Data Layer — IMPLEMENTED, but local-first

`src/core/storage.js` is governed by `src/core/politica.js`. `scripts/gen-catalogo-storage.mjs` verifies that keys touched by `src/` are declared, versioned, and migratable.

This is a browser/local storage contract. It is not the cross-project Mesh database.

**Mesh decision:** do not reinterpret local storage as the inter-project data layer. Cross-project requests/results need a separate authenticated boundary.

### 3. Page lifecycle — IMPLEMENTED

`src/core/ciclo-vida.js` provides `aoSair`, `encerrar`, and `pendentes` so pages can register cleanup without inventing independent lifecycle mechanisms.

This is an internal runtime primitive and is unrelated to cross-project capability routing.

### 4. Nexus — IMPLEMENTED as internal module composition

The repository contains the Nexus implementation and contract documentation. Nexus is responsible for composing Baluarte modules and validating module contracts/dependencies. It is not the Knowledge Mesh.

**Mesh decision:** keep Nexus and Mesh contracts separate.

### 5. Global Comms / Supabase Realtime — EXISTING REMOTE INFRASTRUCTURE

`src/core/comms.js` already uses the Baluarte Supabase helpers and Realtime subscription machinery for `global_comms`. It supports authenticated writes, public reads, and rate limiting through the existing database contract.

This proves that Baluarte already has a remote Supabase communication path, but `global_comms` is a user communication feature, not a capability registry/request/result protocol.

**Mesh decision:** do not overload `global_comms` into the Knowledge Mesh transport.

## What remains unproven

Still need concrete implementation audits for:

- Mesh-specific permission enforcement;
- Evidence/Provenance runtime primitives;
- external API/MCP boundary suitable for capability calls;
- a real consumer/provider pair among TaxForge, ARK, AEGIS, Veritas and DailyPlanner.

## Critical distinction

The following are now proven to exist in Baluarte:

```text
Event Bus
Local Storage/Data policy
Page lifecycle
Nexus module composition
Supabase-backed remote communication
```

But this does **not** mean that the Knowledge Mesh exists as an implementation yet.

The target remains:

```text
consumer
  -> authenticated capability request
  -> provider selection
  -> provider execution
  -> result + provenance
  -> consumer
```

## Next exact step — Round 013

1. Audit the existing permission/auth/RLS enforcement used by the Baluarte remote path.
2. Audit the existing external API/MCP boundary.
3. Map concrete TaxForge needs against the verified capabilities of Veritas, ARK and AEGIS.
4. Only if a real consumer/provider pair appears, define the smallest cross-project contract.
5. Keep Supabase changes non-destructive and domain-scoped.

## Permanent rule

Do not create a duplicate primitive when Baluarte already has an adequate implementation. Do not create Mesh infrastructure without a concrete cross-project use case.
