# Ecosystem Discovery — Round 014

Date: 2026-08-17

## Objective

Find the first real cross-project capability contract without inventing a dependency merely to demonstrate the Knowledge Mesh.

## Findings

### Veritas

The current repository exposes a mature MCP boundary around a concrete logic-engine domain. The README documents capabilities for truth-table generation/evaluation, simplification, Karnaugh maps, sequential circuit simulation, AlgorithmDocument debugging, and chip-library queries. The MCP currently uses stdio; authenticated Streamable HTTP is described as a future remote layer.

This is a genuine provider candidate, but it is not automatically a provider for every project.

### TaxForge

TaxForge has an operational MCP surface, but its currently documented MCP work is primarily tooling/integration-oriented (audit, quality, E2E, diagnostics/checkpoints). We must not classify that surface as a domain capability for other projects without a concrete consumer requirement.

The previously completed discovery found no concrete TaxForge requirement for Veritas boolean evaluation, truth tables, simplification, Karnaugh maps, or circuit simulation.

### ARK / AEGIS / DailyPlanner

No new evidence in this round establishes a stable cross-project provider interface that should be registered in production. Continue preserving each project's domain boundary.

## Decision

**No first production Consumer -> Provider pair is selected in Round 014.**

This is an intentional negative result. The Knowledge Mesh must not manufacture a use case.

## Architecture consequence

Do not add yet:

- a production capability registry populated with speculative providers;
- generic cross-project SQL access;
- a Mesh transport hidden inside `global_comms`;
- new Supabase tables solely to prove that the Mesh works;
- adapters that expose Veritas capabilities to projects that do not need them.

The Baluarte platform primitives remain useful as infrastructure, but the Mesh remains a separate contract layer.

## Next step — Round 015

Perform a capability inventory from the actual public boundaries of all six repositories, with emphasis on:

1. existing MCP/API endpoints;
2. explicit exported functions/services;
3. persisted domain objects that can be referenced safely;
4. authentication and authorization requirements;
5. whether each candidate can produce provenance/evidence;
6. concrete consumers already implied by product behavior.

The goal is to identify a **real** pair, or formally close the search for the current six projects and leave the Mesh ready for the seventh project to supply a better first use case.

## Continuation rule

After this round, update `docs/ECOSYSTEM-CONTINUATION-STATE.md` with the exact next round. Future conversations must read that file first.
