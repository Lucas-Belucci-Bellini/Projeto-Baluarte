# Baluarte — AEGIS ↔ Veritas Discovery v1

## Status

Discovery only. No production Mesh registration and no cross-project execution is authorized by this document.

## Evidence

AEGIS is specified as an autonomous engineering investigation agent. Its workflow is:

`Observe → Understand → Investigate → Prove → Correct → Test → Verify → Document`.

Veritas already exposes deterministic MCP capabilities including `debug_algorithm`, `evaluate_expression`, `truth_table`, `simplify_expression`, `normal_forms`, `karnaugh_map`, and `simulate_circuit`.

## Candidate relationship

The strongest candidate is:

`AEGIS → Veritas.debug_algorithm`

Reason: AEGIS explicitly investigates program behavior and needs evidence before concluding root cause; Veritas has a deterministic algorithm-debugging tool that can return serializable state/trace information.

## Why this is NOT yet a confirmed consumer

The current AEGIS repository is a specification/prompt rather than a concrete integration implementation. It does not currently expose a verified request path that constructs a Veritas `AlgorithmDocument`, invokes the MCP tool, validates the result, and incorporates it into an investigation report.

Therefore:

- do not register AEGIS as a production consumer yet;
- do not create a shared Supabase request/result table specifically for this pair;
- do not add credentials or remote endpoints merely to prove the concept;
- keep the relationship as a candidate capability mapping.

## Security boundary

If this relationship becomes real later, AEGIS should send only the minimum algorithm representation required for the deterministic analysis. Veritas must not receive repository secrets, credentials, unrelated source files, or unrestricted database access.

The result should carry provenance identifying the Veritas capability/version and the input fingerprint, without copying unrelated project data into the other domain.

## Promotion criteria

Promote this candidate to a real Mesh contract only when AEGIS has:

1. a concrete caller/adapter;
2. a defined `AlgorithmDocument` input mapping;
3. deterministic result validation;
4. explicit authorization for the provider;
5. timeout/error handling;
6. provenance/evidence handling;
7. tests covering the cross-project boundary.

## Current decision

`AEGIS → Veritas` is the best candidate found so far, but remains **UNCONFIRMED**.

The Mesh should continue discovery rather than manufacture an integration.

## Next step

Inspect the remaining concrete implementations (especially Baluarte's own runtime/integration surfaces and any existing Supabase/MCP adapters) for a real consumer/provider pair. Only after a concrete pair exists should the first Mesh registry migration be designed.
