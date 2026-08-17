# Ecosystem Mesh Contracts v1

Status: Draft / architecture contract

## Purpose

Define the minimum interoperable contracts for a future ecosystem of many independent projects coordinated through Baluarte.

The mesh is capability-oriented, not database-oriented. A requester asks for a capability; Baluarte discovers an authorized provider; the provider returns a contract-compliant result with provenance.

## 1. Capability Contract

A capability describes something a project can provide without exposing its internal implementation.

Required fields:

- `capability_id` — stable namespaced identifier, e.g. `veritas.logic.evaluate`.
- `version` — semantic contract version.
- `provider_project_id` — project that owns the capability.
- `input_schema` — versioned schema identifier.
- `output_schema` — versioned schema identifier.
- `data_classification` — public, internal, confidential, restricted.
- `required_permissions` — authorization requirements.
- `status` — active, deprecated, suspended.
- `provenance_policy` — minimum evidence/provenance expected.

A capability contract must not expose private table names, credentials, internal service addresses, or implementation details.

## 2. Knowledge Request

Minimum request envelope:

```json
{
  "request_id": "uuid",
  "requester_project_id": "project-id",
  "tenant_id": "tenant-id",
  "capability_id": "veritas.logic.evaluate",
  "capability_version": "1.0.0",
  "input": {},
  "purpose": "business-purpose",
  "required_confidence": 0.8,
  "authorization_context": {}
}
```

Rules:

1. The requester must be authenticated.
2. The requester must be authorized for the requested capability.
3. The tenant boundary must be evaluated before provider execution.
4. Only the minimum required input crosses the boundary.
5. A request must be auditable.

## 3. Knowledge Result

Minimum result envelope:

```json
{
  "request_id": "uuid",
  "provider_project_id": "project-id",
  "capability_id": "veritas.logic.evaluate",
  "capability_version": "1.0.0",
  "status": "fulfilled",
  "output": {},
  "confidence": 0.91,
  "provenance": [],
  "evidence": [],
  "expires_at": null
}
```

A result must identify its provider and contract version. Results that cannot meet the requested confidence should explicitly report that fact rather than silently presenting an uncertain answer as authoritative.

## 4. Provider Discovery

The requester must not enumerate or directly query every project.

Flow:

```text
requester
  -> Baluarte capability registry
  -> authorized provider candidates
  -> provider selection
  -> provider execution
  -> result + provenance
```

Provider selection may consider capability version, permissions, tenant scope, health, confidence, freshness, and policy.

If a provider cannot fulfill a request, the mesh may try another authorized provider. A failed provider must not cause uncontrolled fan-out.

## 5. Authorization Boundary

Authorization is evaluated across four dimensions:

- requester project;
- tenant/organization;
- capability;
- data classification.

A project having a capability does not automatically grant it access to another project's internal data.

No project may receive unrestricted SQL access to another project's schema as a mesh integration mechanism.

## 6. External References

Cross-project references use opaque identifiers:

```text
source_project_id
source_entity_type
source_entity_id
relationship
created_at
```

Consumers must not infer the provider's internal schema from an external reference.

## 7. Provenance

Every knowledge result that influences a consequential decision should carry:

- provider;
- capability/version;
- source or evidence reference;
- observation/effective time when applicable;
- confidence;
- validation status;
- request identifier.

## 8. Events

Events are notifications of facts, not remote database writes.

Initial envelope:

```json
{
  "event_id": "uuid",
  "event_type": "project.capability.updated",
  "event_version": "1.0.0",
  "producer_project_id": "project-id",
  "tenant_id": "tenant-id-or-null",
  "occurred_at": "timestamp",
  "payload": {}
}
```

Consumers must tolerate duplicate delivery and unknown future event types.

## 9. Failure and fallback

The mesh must distinguish:

- `NOT_FOUND` — no authorized provider is known;
- `NOT_AUTHORIZED` — a provider exists but policy denies the request;
- `UNAVAILABLE` — provider is temporarily unavailable;
- `UNSUPPORTED_VERSION` — contract mismatch;
- `LOW_CONFIDENCE` — provider answered below the requested confidence;
- `INVALID_RESULT` — provider violated the contract.

Fallback to another provider is permitted only after policy checks. It must not become uncontrolled recursive delegation.

## 10. First proof

The first proof should be deliberately small:

`TaxForge -> Baluarte -> Veritas`

The test should demonstrate:

1. capability discovery;
2. tenant-aware authorization;
3. minimal request payload;
4. provider response;
5. provenance;
6. audit event;
7. rejection when authorization is absent.

The proof must not require either project to expose its internal database schema.

## 11. Explicit non-goals

Version 1 does not define:

- a universal router implementation;
- direct cross-project SQL;
- automatic trust between projects;
- unrestricted AI-to-AI delegation;
- a single shared domain schema for all projects;
- mandatory Plan functionality in every project.

## 12. Evolution rule

Contracts are versioned independently from implementations. A provider may evolve its internal database, language, framework, or service architecture without breaking consumers as long as the published capability contract remains compatible.

This document is an architecture baseline. Implementation-specific details belong in project-specific integration documents.
