# Ecosystem Identity & Tenant Contract v1

Status: Draft / architecture contract

## Purpose

Define the minimum identity and tenant boundary required for the Baluarte capability mesh. This contract separates platform identity from project-local data ownership.

## Identity model

An authenticated principal is represented by an opaque `principal_id`. The mesh must not require providers to understand another project's internal user schema.

Core concepts:

- `principal_id` — stable identity reference;
- `organization_id` — tenant/organization boundary;
- `project_id` — ecosystem project requesting or providing a capability;
- `membership_id` — relationship between principal and organization;
- `role` — authorization role within an organization/project scope;
- `session_id` — auditable authentication/session reference.

## Request context

Every authenticated mesh request carries a normalized context:

```json
{
  "request_id": "uuid",
  "principal_id": "opaque-id",
  "organization_id": "opaque-id",
  "requester_project_id": "taxforge",
  "session_id": "opaque-id",
  "requested_capability": "veritas.logic.evaluate"
}
```

The context is metadata for authorization, not permission to access provider tables.

## Tenant boundary

The effective authorization decision is:

`principal + organization + requester project + capability + data classification + provider policy`

A valid login is insufficient by itself.

A principal belonging to organization A must not obtain organization B data merely because the same capability exists for both organizations.

## Project isolation

Projects remain owners of their internal schemas and domain records. The mesh exposes capabilities and contract-defined results, not unrestricted SQL access.

## Cross-project requests

A provider must receive only the minimum context and input necessary to execute the published capability. If the provider needs tenant-scoped records, it resolves them through its own authorized data boundary.

## Service identities

Machine-to-machine calls use a service identity representing the requesting project/capability path. Service identity does not bypass tenant policy.

Service credentials must never be exposed to browser clients.

## External references

Cross-project entity references remain opaque:

```text
source_project_id
source_entity_type
source_entity_id
relationship
```

Consumers must not use external references to infer table names, primary-key conventions, storage paths, or private endpoints.

## Audit requirements

Authorization decisions for consequential mesh requests should record:

- request id;
- principal or service identity;
- organization/tenant;
- requester project;
- provider project;
- capability/version;
- decision;
- reason code;
- timestamp.

Sensitive input and output must not be copied into audit logs unless explicitly required by policy.

## Initial decision codes

- `ALLOW`
- `DENY_NO_IDENTITY`
- `DENY_NO_MEMBERSHIP`
- `DENY_PROJECT_SCOPE`
- `DENY_CAPABILITY`
- `DENY_DATA_CLASSIFICATION`
- `DENY_PROVIDER_POLICY`

## Non-goals

This contract does not prescribe a specific frontend authentication library, database schema, JWT layout, or service-mesh product. Those are implementation details and must preserve these boundaries.

## First proof

The first implementation proof remains:

`TaxForge -> Baluarte -> Veritas`

The proof must include one allowed tenant-scoped request and one rejected request using the wrong organization context.
