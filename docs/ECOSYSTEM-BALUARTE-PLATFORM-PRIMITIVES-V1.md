# Ecosystem — Baluarte Platform Primitives V1

> Discovery record. This document identifies Baluarte V2 capabilities that are architectural primitives, without publishing them as external mesh capabilities yet.

## Evidence

`docs/v2/V2_MASTER_PLAN.md` defines the V2 architecture as modular and prepared for external projects. It explicitly plans Core, Module System, Module Registry/Lifecycle, Event Bus, internal/external APIs, Storage Layer, Permission System, Configuration, Logging, Diagnostics, Feature Flags, Testing, Error Handling, Versioning and Compatibility.

The same plan states that external projects must interact through contracts/APIs rather than knowing Baluarte internals, and that permissions are separate from functionality.

## Candidate platform primitives

### P0 — Module contract / registry

The V2 module contract already models:

- id
- name
- version
- dependencies
- permissions
- events
- API
- configuration
- capabilities
- lifecycle

This is the strongest foundation for a future ecosystem capability registry, but the ecosystem registry must not be created as a duplicate of the internal module registry until the external contract boundary is proven.

### P0 — Event Bus

The V2 plan defines versioned event envelopes with name, origin, timestamp, payload and optional context. It also requires discovering emitters, listeners, orphan events and dependencies.

Potential future role: transport for asynchronous cross-project notifications.

Not yet exposed externally: no provider/consumer pair has been proven in this discovery round.

### P0 — Permission System

The Core owns permissions such as `READ_FILES`, `WRITE_FILES`, `NETWORK`, `DATABASE`, `SYSTEM_INFO`, `USER_DATA` and `EXECUTION`.

Potential future role: base authorization layer for capability invocation.

Important: domain authorization and mesh capability authorization remain separate concerns.

### P0 — Storage / Data Layer

The V2 plan requires an abstract storage layer with schemas, validation, migrations, versioning, classification, backup and recovery.

Potential future role: persistence for platform metadata and provenance, not ownership of every project's domain data.

### P0 — External API boundary

The V2 plan explicitly requires external APIs and says external projects must not know Baluarte internals.

Potential future role: synchronous capability invocation and contract negotiation.

### P1 — Audit / diagnostics / observability

The V2 architecture requires logging, diagnostics and observability. These are strong candidates for cross-project operational infrastructure, but only after their concrete implementations and contracts are verified.

## Architectural conclusion

Baluarte already has the architectural *shape* required by the future mesh. We should reuse these primitives rather than inventing a second Event Bus, Permission Manager, Storage Layer or Module Registry.

However, this is still an architecture discovery result, not a claim that all listed primitives are currently production-ready external services.

## Next verification

Inspect the concrete V2 implementations and their tests for:

1. Event Bus implementation and contract tests;
2. module registry implementation;
3. permission enforcement implementation;
4. storage/data-layer implementation;
5. external API/MCP boundary;
6. audit/diagnostic implementation.

Then cross-reference TaxForge's real external needs. Only a verified implementation plus a real consumer/provider pair should produce the first physical mesh integration.
