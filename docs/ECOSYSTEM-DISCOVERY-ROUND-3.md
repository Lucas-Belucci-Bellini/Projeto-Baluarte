# Baluarte — Ecosystem Discovery Round 3

## Date

2026-08-17

## Purpose

Record the next verified state of the six-project Knowledge Mesh discovery so a future session can resume without relying on conversation history.

## Verified state

The permanent continuation document on `main` still lists `TaxForge -> Baluarte -> Veritas` as the recommended first proof-of-concept. Current discovery evidence does **not** prove that TaxForge is a real consumer of the verified Veritas capabilities. Therefore that recommendation is stale and must not be treated as an implementation requirement.

### Veritas

Verified provider capabilities remain:

- `veritas.logic.evaluate`
- `veritas.logic.truth_table`
- `veritas.logic.simplify`
- `veritas.logic.karnaugh`
- `veritas.circuit.simulate`

No production Mesh registration should be created until a real consumer is found.

### TaxForge

TaxForge has real decision-support domains including supplier risk, contracts, scenarios, evidence and MCP tooling. Current discovery did not prove a concrete workflow that requires Veritas logic/circuit capabilities.

The previous TaxForge → ARK hypothesis also remains unapproved because the current supplier model lacks the geographic context needed to make a defensible hazard query.

### ARK

ARK has a concrete public hazard/evidence domain and a private ARCA boundary. Candidate public capabilities can be documented, but they are not production Mesh providers until a consumer and authorization boundary are proven.

### AEGIS

AEGIS describes an engineering investigation workflow and is a strong conceptual consumer of deterministic verification capabilities, but the current repository state does not prove an executable caller/adapter into Veritas. Treat `AEGIS -> Veritas.debug_algorithm` as a candidate only.

### DailyPlanner

DailyPlanner remains client-side. Do not introduce Supabase or Mesh integration merely to make it participate. A future task/reminder bridge can be considered only when a real producer/consumer workflow exists.

### Baluarte

Baluarte remains the control-plane and continuity repository. Its runtime/event/task infrastructure should be inspected for already-implemented integration points before inventing a new Mesh router.

## Decision

Do **not** build the Supabase capability registry yet.

Do **not** create direct SQL access between project databases.

Do **not** create speculative cross-project adapters.

The next discovery target is the Baluarte runtime itself: identify existing Event Bus, Task Manager, runtime, adapter, or integration boundaries that can host a future Mesh request without creating a parallel routing system.

## Exact continuation order

1. Inspect Baluarte runtime/event/task/adapter implementations and their importers.
2. Identify one existing execution boundary suitable for a Mesh request.
3. Match that boundary against concrete capabilities in TaxForge, ARK, Veritas, AEGIS, or DailyPlanner.
4. Require evidence on both sides: a real requester workflow and a real provider implementation.
5. Define the smallest request/result contract.
6. Audit identity, tenant, RLS, authorization, data classification and provenance.
7. Only then design the first Supabase registry/request/result migration.

## Permanent rule

A capability is not considered integrated because documentation exists. It is integrated only when the requester, router/boundary, provider, authorization path and result path are all executable and tested.
