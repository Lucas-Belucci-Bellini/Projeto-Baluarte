# Ecosystem Mesh — ARK Capability Contract v1

Status: Draft / architecture contract
Date: 2026-08-16
Provider: `Ark-Initiative`

## Purpose

Define the first candidate capabilities that the ARK project may expose through the Baluarte ecosystem mesh without exposing ARK's private database, conversations, credentials, internal service addresses, or implementation details.

This document is a contract proposal, not a claim that these capabilities are already registered in a production mesh.

## Boundary

ARK currently has a clear distinction between reusable public/curated intelligence and private assistant data.

### Candidate for mesh exposure

- public hazard observations;
- source/provenance metadata attached to public observations;
- curated public evidence when its publication policy permits it;
- derived public risk descriptions where the caller is authorized to consume them.

### Not exposed by this contract

- private ARCA conversations;
- private messages;
- safety signals;
- private user/profile information;
- private audit records;
- unrestricted database access;
- provider credentials or internal endpoints.

## Capability A — `ark.hazards.public_snapshot`

### Status

`candidate`

### Purpose

Return a bounded snapshot of public hazard intelligence already available through ARK's public hazard service.

### Input contract

```json
{
  "region": "optional-region-reference",
  "hazard_types": ["optional-hazard-type"],
  "observed_after": "optional-ISO-8601",
  "observed_before": "optional-ISO-8601",
  "limit": 50
}
```

The provider must apply server-side bounds and authorization before executing the request.

### Output contract

```json
{
  "events": [
    {
      "external_reference": "opaque-provider-reference",
      "hazard_type": "...",
      "title": "...",
      "location": {
        "latitude": 0.0,
        "longitude": 0.0
      },
      "observed_at": "ISO-8601",
      "magnitude": null,
      "source": {
        "provider": "...",
        "external_id": "...",
        "source_url": "..."
      }
    }
  ],
  "generated_at": "ISO-8601",
  "provenance": []
}
```

### Provenance requirements

Every returned event must retain enough source information for the consumer to understand where the observation originated and when it was observed.

The mesh result must additionally identify:

- `provider_project_id`;
- `capability_id`;
- `capability_version`;
- `request_id`;
- retrieval/generated timestamp;
- confidence/validation state when applicable.

## Capability B — `ark.hazards.assess`

### Status

`candidate / restricted`

### Purpose

Return an informational severity assessment derived from public hazard observations.

### Important limitation

This capability must remain informational. It must not be represented as an evacuation order, emergency command, medical instruction, or other authoritative operational command merely because a numerical or categorical assessment was produced.

### Candidate output

```json
{
  "severity": "monitor|attention|elevated|critical",
  "basis": [],
  "confidence": 0.0,
  "assessed_at": "ISO-8601",
  "provenance": []
}
```

A consumer must be able to distinguish the provider's assessment from the underlying observed facts.

## Capability C — `ark.evidence.search`

### Status

`candidate / policy-gated`

### Purpose

Search ARK's curated public evidence collection for material relevant to a bounded query.

### Candidate input

```json
{
  "query": "...",
  "region": "optional",
  "topic": "optional",
  "limit": 20
}
```

### Candidate output

```json
{
  "results": [
    {
      "reference": "opaque-provider-reference",
      "title": "...",
      "summary": "...",
      "source": "...",
      "source_url": "...",
      "evidence_level": "...",
      "publication_status": "..."
    }
  ],
  "provenance": []
}
```

Only evidence whose publication and access policy permits external consumption may be returned.

## Authorization

Baluarte must evaluate, at minimum:

1. requester project identity;
2. tenant/organization boundary where applicable;
3. requested capability;
4. ARK data classification;
5. publication/access policy;
6. rate and resource limits.

A successful authorization must not grant SQL access to ARK tables.

## External references

Consumers receive opaque references rather than ARK internal primary keys or schema relationships. A future contract may define a resolver capability if a legitimate use case requires additional metadata.

## Failure states

The provider must use the mesh failure vocabulary where applicable:

- `NOT_FOUND`;
- `NOT_AUTHORIZED`;
- `UNAVAILABLE`;
- `UNSUPPORTED_VERSION`;
- `LOW_CONFIDENCE`;
- `INVALID_RESULT`.

## Security boundary

The following ARK data remains outside this contract unless a future, separately approved contract explicitly changes the boundary:

```text
private conversations
private messages
safety signals
private profiles
private audit records
credentials
internal database schema
internal service addresses
```

## First validation required

Before registering any ARK capability in the shared registry, validate the contract against:

1. the current ARK runtime/API implementation;
2. the current ARK database schema and publication states;
3. the Baluarte capability contract v1;
4. the Baluarte identity/tenant contract;
5. authorization tests;
6. provenance requirements;
7. rate/resource controls.

## Explicit non-goals

This document does not:

- migrate ARK from MySQL to Supabase;
- create the shared capability registry;
- expose ARK private data;
- create direct ARK-to-project SQL access;
- establish automatic trust between projects;
- make `ark.hazards.assess` an emergency command system;
- claim that a production cross-project call already exists.

## Next step

Validate `ark.hazards.public_snapshot` against a real consumer need, preferably by inspecting TaxForge for a concrete use case. If a real consumer is confirmed, create the first ARK requester/provider test contract before implementing registry tables.
