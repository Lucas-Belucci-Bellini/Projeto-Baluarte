# Baluarte — AEGIS Provider Discovery v1

## Date
2026-08-17

## Finding

The current AEGIS repository is a detailed specification/prompt for an autonomous software-engineering agent. It defines an investigation lifecycle and safety rules, but the inspected `README.md` does not establish a stable external API, MCP server, capability endpoint, or persistent provider implementation.

## Verified capability model

AEGIS defines this conceptual workflow:

`Observe → Understand → Investigate → Prove → Repair → Test → Verify → Document`

Potential future capabilities include:

- `aegis.repository.investigate`
- `aegis.repository.audit`
- `aegis.issue.diagnose`
- `aegis.fix.validate`

These are **provider candidates only**. They must not be registered as production mesh capabilities until an executable implementation and stable interface are verified.

## Mesh decision

Status: `PROVIDER-CANDIDATE / NO-STABLE-INTERFACE`

Do not create a Supabase capability record for AEGIS yet.

Do not give other projects direct database access to AEGIS.

Do not invent an API contract from the prompt alone.

## Why this matters

The ecosystem must distinguish between:

1. a project describing a capability;
2. a project implementing a capability;
3. a project exposing that capability through a stable interface;
4. a capability that has an authorized consumer.

Only #2 + #3, followed by a real consumer/use case, justify a mesh integration.

## Next verification

When AEGIS gains or already contains executable runtime code, inspect it for:

- invocation boundary;
- input/output schema;
- authentication/authorization;
- repository scope;
- evidence/provenance output;
- side-effect controls;
- test/validation boundary;
- MCP/API/HTTP interface;
- rate/resource limits.

Then compare those capabilities against actual needs in TaxForge, ARK, Veritas, DailyPlanner and Baluarte.

## Continuation rule

If a future conversation starts with the ecosystem repositories, read this file and `docs/ECOSYSTEM-CONTINUATION-STATE.md` before proposing the next integration.
