# Ecosystem Discovery — Round 005

Date: 2026-08-17

## Finding

The Baluarte Nexus contract v1.1.0 is a strong internal module contract, not yet the external Knowledge Mesh contract.

Evidence:
- `src/nexus/orquestrador.js` composes manifests, validates contract major, dependencies, cycles and route ownership, then initializes modules.
- `docs/NEXUS-CONTRATO.md` defines `baluarte.module.js`, declared events, dependencies, lifecycle, and a strict rule that one domain must not directly know/import another domain.
- The current event declarations are part of the internal domain contract.

## Architectural decision

Do NOT repurpose Nexus directly as the cross-project Mesh.

Nexus remains the Baluarte internal composition layer. The future Mesh should sit above/alongside it and use stable contracts to discover and authorize capabilities exposed by independent projects.

Conceptual boundary:

Baluarte internal:
- module manifest
- routes
- internal events
- lifecycle
- internal dependencies

Knowledge Mesh:
- capability identity
- provider project
- consumer project
- request/response contract
- authorization scope
- provenance/evidence
- external reference

## Next investigation

Find a real consumer/provider pair among TaxForge, ARK, AEGIS, Veritas and DailyPlanner. Do not create a capability only because the architecture permits it.

Preferred first candidate: a concrete TaxForge need whose provider already has an executable interface.

## Continuation rule

A future session should read this file and `docs/ECOSYSTEM-CONTINUATION-STATE.md` before changing schemas or creating Mesh tables.
