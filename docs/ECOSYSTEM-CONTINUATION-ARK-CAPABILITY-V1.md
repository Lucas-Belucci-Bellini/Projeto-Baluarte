# Ecosystem Continuation — ARK Capability Contract v1

Date: 2026-08-16

## Current branch

`docs/ark-capability-contract-v1`

## Current commit

`769e977c2ead539739c8db7ca1d867266e44a744`

## What was completed

- inspected the ARK runtime/API boundary;
- confirmed a public hazard service boundary;
- separated public/curated intelligence from private ARCA data;
- drafted `ark.hazards.public_snapshot`;
- drafted restricted `ark.hazards.assess`;
- drafted policy-gated `ark.evidence.search`;
- defined provenance and authorization requirements;
- explicitly avoided direct cross-project SQL and automatic exposure of private ARK data.

## Current decision

These are **candidate capabilities**, not production registry entries. No shared Supabase registry or cross-project runtime call should be implemented until a real consumer need is confirmed.

## Exact next work

1. Inspect TaxForge for a concrete use case that genuinely needs ARK public hazard intelligence.
2. If a real use case exists, define the minimum TaxForge → Baluarte → ARK request payload.
3. Validate tenant and authorization behavior for that request.
4. Define the provenance/result payload for the first ARK proof.
5. Only then decide whether `ark.hazards.public_snapshot` becomes a registered capability.
6. After the first proof, inspect DailyPlanner directly and map its persistence/synchronization boundary.

## Important rule

Do not interpret the absence of an immediate consumer as a reason to invent one. Capabilities are added to the mesh because another project has a real need, not because the provider happens to have reusable data.

## Resume order

Open this file first, then:

- `docs/ECOSYSTEM-MESH-CONTRACTS-NEXT.md`
- `docs/ECOSYSTEM-MESH-CONTRACTS-V1.md` on `docs/ecosystem-mesh-contracts-v1`
- `docs/ECOSYSTEM-INTELLIGENCE-MESH.md`
- `docs/ECOSYSTEM-ARK-CAPABILITY-CONTRACT-V1.md` on this branch
- `docs/ECOSYSTEM-CONTINUATION-STATE.md`

Then continue from **Exact next work #1**.
