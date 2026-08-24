# Ecosystem Mesh — Continuation Checkpoint

Date: 2026-08-16

## Current work

The first draft of the mesh contracts is being developed on:

`docs/ecosystem-mesh-contracts-v1`

Document:

`docs/ECOSYSTEM-MESH-CONTRACTS-V1.md`

## What is defined in the draft

- capability contract;
- knowledge request;
- knowledge result;
- provider discovery;
- authorization boundary;
- opaque external references;
- provenance/evidence requirements;
- event envelope;
- failure/fallback states;
- first TaxForge → Baluarte → Veritas proof;
- explicit non-goals and contract evolution rules.

## Exact next work

1. Review the draft against the existing Baluarte event/storage contracts.
2. Define the shared identity contract.
3. Define tenant/organization boundaries.
4. Define the capability registry data model without deploying it yet.
5. Define the external-reference contract.
6. Map the minimum TaxForge → Veritas proof payload.
7. Validate the 23 TaxForge Supabase tables and their RLS policies.
8. Only after those reviews, prepare a non-destructive migration proposal.

## Important architectural rule

The mesh is a capability network, not a shared SQL database. Projects request capabilities through Baluarte; providers expose versioned contracts; cross-project results carry provenance; internal schemas remain private.

## Resume instruction

A future conversation should open this file first, then:

- `docs/ECOSYSTEM-CONTINUATION-STATE.md`
- `docs/ECOSYSTEM-INTELLIGENCE-MESH.md`
- `docs/ECOSYSTEM-MESH-CONTRACTS-V1.md` on branch `docs/ecosystem-mesh-contracts-v1`
- `docs/SUPABASE-SECURITY-FUNCTION-CONSUMER-MAP.md`
- `docs/TAXFORGE-SUPABASE-SCHEMA-RECONCILIATION.md`

Then continue from **Exact next work #1**.
