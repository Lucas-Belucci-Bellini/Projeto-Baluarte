# Baluarte — Ecosystem Intelligence Mesh

## Purpose

Define the long-term architecture for a network in which many independent projects can discover and request capabilities from one another without duplicating every capability in every project.

The target is not a single monolithic application. Each project remains the authoritative owner of its own domain and exposes only explicitly authorized capabilities.

## Core idea

If Project A needs knowledge or a capability that it does not own:

```text
Project A
  ↓
Capability / Knowledge Request
  ↓
Mesh Router
  ↓
Capability Discovery
  ↓
Candidate projects
  ↓
Authorized request
  ↓
Best available provider
  ↓
Evidence / result / reference
  ↓
Project A
```

If the first provider cannot satisfy the request, the mesh may continue discovery among other authorized providers. The requester does not need to know which project internally owns every capability.

## Example: Veritas → TaxForge

Suppose TaxForge needs a logic/circuit analysis capability that Veritas already provides.

TaxForge should not automatically implement a second equivalent module.

```text
TaxForge
   ↓
request: logic_analysis
   ↓
Mesh capability registry
   ↓
Veritas advertises capability
   ↓
authorization + policy check
   ↓
Veritas executes / returns result
   ↓
TaxForge consumes result
```

If Veritas cannot satisfy the request, discovery can continue to another authorized project.

## 100-project target

The architecture must scale from the current six repositories toward approximately 100 projects without creating 100 × 99 direct integrations.

Avoid:

```text
A ↔ B
A ↔ C
A ↔ D
...
```

Prefer:

```text
              Ecosystem Mesh
             /      |       \
            /       |        \
        TaxForge   Veritas   ARK
           |          |        |
        AEGIS    DailyPlanner Baluarte
```

Projects communicate through stable contracts and capability discovery rather than hard-coded knowledge of every other project's internals.

## Capability registry

The future shared layer should be able to describe capabilities without copying the provider's private implementation.

Conceptual record:

- `capability_id`
- `provider_project_id`
- `name`
- `version`
- `description`
- `input_contract`
- `output_contract`
- `domains`
- `required_scopes`
- `data_classification`
- `availability`
- `evidence_requirements`
- `status`

The registry describes **what can be requested**, not how the provider implements it.

## Knowledge request

A request should contain only the minimum necessary information.

Conceptual fields:

- requester project
- requesting tenant/organization when applicable
- capability
- request contract/version
- purpose
- input/reference
- required confidence
- data classification
- deadline/priority when relevant
- authorization context

A provider should receive only the information it is authorized to receive.

## Result model

A result should be more than an opaque answer when the domain requires verification.

Conceptual result:

```text
result
├── provider
├── capability
├── contract_version
├── output
├── confidence
├── evidence_refs
├── created_at
├── expires_at
└── provenance
```

This allows downstream projects to distinguish a computed answer, a sourced fact, an inference, and an uncertain result.

## No direct database sharing by default

The mesh does **not** mean that every project receives SQL access to every other project's tables.

Default rule:

```text
project database
     ↓
owned domain
     ↓
service/API/event boundary
     ↓
authorization
     ↓
mesh
```

Direct cross-project database access is an explicit exception requiring an architectural decision.

## Security boundaries

The mesh must enforce:

1. project identity;
2. tenant/organization isolation where applicable;
3. capability-level authorization;
4. minimum necessary data disclosure;
5. input/output contract validation;
6. provenance and auditability;
7. revocation;
8. rate and resource controls;
9. data classification rules;
10. explicit handling of confidential information.

A capability being discoverable does not imply that it is callable by every project.

## Private architecture

The complete topology, internal contracts, provider relationships and implementation details are engineering documentation for the project team. Public product documentation should expose only the integrations and capabilities that are intentionally part of the product experience.

No passwords, tokens, API keys or other secrets belong in this repository.

## Relationship with Baluarte

Baluarte is the architectural coordination layer and source of continuity for this design. It should eventually contain:

- capability registry contracts;
- identity/tenant contracts;
- external-reference contracts;
- event contracts;
- permission model;
- provenance model;
- project metadata;
- continuation state.

Baluarte should not become the owner of every project's domain data merely because it coordinates the mesh.

## Relationship with Supabase

Supabase/PostgreSQL can provide shared platform primitives where appropriate, but the final topology must preserve domain ownership.

Possible shared primitives:

- identities;
- organizations/tenants;
- project registry;
- capability registry;
- external references;
- event metadata;
- audit records.

Domain tables remain owned by their respective project schemas/boundaries.

## Future evolution

Phase 1 — six-project foundation:

- TaxForge
- ARK
- DailyPlanner
- AEGIS
- Baluarte
- Veritas

Phase 2 — establish capability discovery and contracts.

Phase 3 — enable selected project-to-project requests.

Phase 4 — add routing, provenance and fallback discovery.

Phase 5 — scale toward dozens of projects.

Phase 6 — evaluate approximately 100 projects and verify that discovery and authorization remain manageable.

## Current status

This document is an architectural target, not an implementation claim. No universal mesh router or 100-project network should be considered implemented until the contracts, authorization model, and operational controls are built and tested.

## Next implementation dependencies

Before implementation:

1. shared identity contract;
2. organization/tenant contract;
3. capability contract;
4. external-reference contract;
5. event contract;
6. permission matrix;
7. provenance/evidence contract;
8. Supabase topology decision;
9. first provider/requester pair (recommended: TaxForge ↔ Veritas);
10. end-to-end authorization tests.
