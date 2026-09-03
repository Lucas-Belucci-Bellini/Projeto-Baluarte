# Baluarte — Provider/Consumer Discovery Matrix v1

> Working discovery artifact for the six-project Ecosystem Intelligence Mesh. This file records evidence-backed candidates and explicitly rejects artificial integrations.

## Status

**Phase:** capability discovery

**Rule:** a provider/consumer pair is not approved merely because two projects are technically capable of communicating. There must be a concrete product need, an implemented provider capability, an authorization boundary, and a minimal request/response contract.

## Current matrix

| Project | Current provider candidates | Current consumer candidates | Decision |
|---|---|---|---|
| TaxForge | Tax/analysis MCP capabilities | External intelligence for supplier/contract investigation | Consumer candidate; no production cross-project pair yet |
| ARK | `ark.hazards.public_snapshot`, `ark.hazards.assess`, `ark.evidence.search` | Future external intelligence consumers | Provider candidate; public/private boundary required |
| DailyPlanner | None requiring Mesh today | None requiring Mesh today | Keep client-side; do not add Supabase only for Mesh |
| AEGIS | Future investigation/validation capabilities | Future engineering-system consumers | Specification-stage; no executable provider yet |
| Baluarte | Future registry/router/control-plane capabilities | Future ecosystem consumers | Control plane, not owner of project-domain data |
| Veritas | `veritas.logic.evaluate`, `veritas.logic.truth_table`, `veritas.logic.simplify`, `veritas.logic.karnaugh`, `veritas.circuit.simulate` | No concrete consumer confirmed | Provider candidate; do not invent TaxForge dependency |

## Candidate pair evaluation

### TaxForge → ARK

**Status:** plausible, not approved.

Potential need: TaxForge may eventually need public hazard intelligence while investigating operational/supplier continuity.

Minimum request concept:

```json
{
  "region": "...",
  "hazard_types": ["flood", "earthquake"],
  "time_window": "..."
}
```

Do not send supplier names, contracts, revenue, customer data, or other TaxForge-private business data to ARK unless a separately approved use case requires it.

Approval requires:

- concrete TaxForge feature consuming the result;
- ARK provider implementation and public-data boundary verified;
- authorization policy;
- provenance/evidence contract;
- failure/uncertainty semantics;
- end-to-end test.

### TaxForge → Veritas

**Status:** rejected for now.

Veritas has useful logic/circuit capabilities, but the current TaxForge inspection does not demonstrate a real need for those capabilities. Do not create a dependency solely to prove the Mesh.

### DailyPlanner → any project

**Status:** deferred.

DailyPlanner is currently local/client-side. A Mesh integration should wait until there is a real synchronization or multi-project workflow that requires it.

### AEGIS → any project

**Status:** deferred.

AEGIS is currently primarily a specification/prompt project. Do not advertise an executable capability until implementation exists and its authorization/data boundaries can be tested.

## Discovery principle

The first real cross-project integration should be selected by this equation:

```text
implemented capability
        +
real consumer need
        +
clear ownership
        +
minimal data disclosure
        +
authorization
        +
provenance
        =
approved Mesh contract
```

If any term is missing, remain in discovery.

## What this matrix does NOT implement

- No shared-domain SQL access.
- No universal Mesh router.
- No Supabase schema migration.
- No automatic project-to-project calls.
- No publication of private project data.

## Next exact action

Inspect the concrete TaxForge MCP/tools and ARK public-hazard implementation side by side and determine whether a real feature can consume the ARK capability without adding speculative product behavior. If not, continue discovery against the other projects.

## Continuation checkpoint

After this matrix, the next checkpoint remains:

**concrete consumer need → provider implementation → contract → authorization → provenance → registry → Supabase**.
