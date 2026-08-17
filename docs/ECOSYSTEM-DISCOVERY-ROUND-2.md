# Ecosystem Capability Discovery — Round 2

Date: 2026-08-17

## Purpose

Continue capability discovery across TaxForge, ARK Initiative, DailyPlanner, AEGIS, Baluarte and Veritas without manufacturing dependencies.

## Findings

### DailyPlanner

Current `main` is deliberately client-side. It stores appointments in browser `localStorage`, supports JSON import/export, and has no authentication, backend or cross-device synchronization. The README explicitly says a database is a future option for multi-device, multi-user or reliable reminders.

**Mesh status:** no production consumer/provider integration identified in this round. Do not add Supabase solely for the Mesh.

### AEGIS

Current `main` contains only `README.md`. AEGIS is a detailed specification/prompt for an autonomous engineering investigator. It defines investigation, evidence, root-cause analysis, repair, testing and audit behavior, but there is no executable provider/consumer adapter in this repository yet.

**Mesh status:** future capability provider/consumer candidate, not an executable integration target yet.

### Veritas

Current `main` contains a real MCP implementation under `mcp/`, with deterministic logic/circuit tools. Its capabilities remain valid providers, but no confirmed consumer has been found yet.

**Mesh status:** provider available; no production registry entry until a real consumer is proven.

### ARK Initiative

Current `main` contains the ARCA resilience application and a substantial client/server-oriented project structure, including Drizzle configuration and resilience domain material. Its public hazard/evidence capability remains a potential provider, while private ARCA data must remain isolated.

**Mesh status:** provider candidate; consumer relationships still require concrete workflow evidence.

### TaxForge

Previously inspected domain logic shows real supplier-risk and business-analysis workflows, but the current supplier model did not provide enough geographic context to justify a direct ARK hazard lookup. The previous TaxForge→ARK hypothesis therefore remains blocked rather than being implemented artificially.

**Mesh status:** potential consumer; no cross-project contract approved yet.

### Baluarte

Baluarte remains the control-plane/gateway architecture and the source of truth for ecosystem continuation. Its role is to define contracts, authorization boundaries, capability discovery and provenance without owning every project's internal domain data.

## Decision

No first cross-project production consumer is proven yet.

Do not create Mesh registry/request/result tables in Supabase yet.

## Next discovery targets

1. Inspect Baluarte's existing runtime/MCP/task capabilities for concrete provider/consumer seams.
2. Inspect ARK's actual server/API/data capabilities for externally consumable public outputs.
3. Compare those capabilities against concrete workflows in TaxForge and Baluarte.
4. Inspect Veritas consumers outside TaxForge.
5. Only approve a first cross-project contract when both need and implementation evidence exist.

## Acceptance rule

A cross-project integration is **PROVEN** only when all are true:

- consumer workflow exists in code;
- provider capability exists in code;
- input/output boundary can be stated without exposing domain internals;
- authorization boundary is identifiable;
- minimum payload is definable;
- provenance can be preserved;
- failure behavior can be specified.

Otherwise classify it as `CANDIDATE` or `REJECTED`, not `PROVEN`.
