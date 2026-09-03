# Ecosystem Mesh — TaxForge ↔ ARK Consumer Gate v1

**Status:** discovery / not approved
**Date:** 2026-08-17

## Current finding

TaxForge has a real Supplier Risk domain. Its `SupplierRisk.tsx` models suppliers, annual value, risk, reason, potential credit, products, contracts and contract exposure. The current enterprise workspace is local/browser storage and explicitly states that imported business data does not enter remote synchronization.

The current supplier model does **not** contain a supplier location/region field. Therefore a TaxForge → ARK hazard query cannot yet be considered a real implemented consumer contract without adding a legitimate geographic input or deriving one from an existing, user-authorized source.

## Decision

Do **not** implement the ARK request yet.

Do **not** add fake supplier geography merely to exercise the Mesh.

Do **not** send supplier names, contracts, revenue, customer data, or private workspace records to ARK.

## Candidate future request

If TaxForge later has an authorized geographic context, a minimized request could look conceptually like:

```json
{
  "region": {"country": "BR", "state": "PR", "municipality": "..."},
  "hazard_types": ["flood", "extreme_heat"],
  "time_window": {"from": "...", "to": "..."}
}
```

The ARK response must be public/curated intelligence only, with source, observed/published time, provider, confidence/status and provenance.

## Current graph

```text
TaxForge Supplier Risk
        │
        │ candidate consumer
        ▼
Baluarte Mesh Gateway
        │
        ▼
ARK public hazard capabilities
        │
        └── candidate provider
```

## Gate to approval

The integration can move from **candidate** to **approved** only when all are true:

1. TaxForge has a real user-authorized geographic context.
2. A TaxForge workflow demonstrably benefits from external hazard intelligence.
3. The request contains the minimum necessary data.
4. ARK exposes a stable, versioned capability contract.
5. Provenance and freshness are returned.
6. Baluarte authorization permits the consumer/provider relationship.
7. No cross-project direct database access is required.

## Next step

Inspect the other project domains for a stronger first consumer/provider pair. In parallel, design the Mesh registry abstractly in Baluarte; do not deploy Supabase tables until at least one real contract passes this gate.

## Continuation anchor

**Next conversation:** open this file and `docs/ECOSYSTEM-CONTINUATION-STATE.md`, then continue with **consumer/provider discovery**, not database implementation.
