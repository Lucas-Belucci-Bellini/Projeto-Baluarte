# Ecosystem Mesh — Schema Next Step

This checkpoint follows the Supabase identity/tenant audit.

## Confirmed

The existing Supabase project already provides the identity foundation:

- `auth.users` = canonical principal
- `tenants` = organization/tenant boundary
- `tenant_members` = user-to-tenant membership and role
- TaxForge records already use `tenant_id`
- Veritas and platform records already use `auth.users` ownership in their current domains

## Do not create

- `mesh_users`
- `mesh_tenants`
- a second authentication system
- direct cross-project table permissions

## Next entities to design

### 1. ecosystem_projects

Represents a project participating in the mesh.

Minimum conceptual fields:

```text
id
slug
name
status
owner/maintainer reference
created_at
metadata
```

### 2. ecosystem_project_tenants

Maps a project to the tenants it is allowed to operate for. This is intentionally separate from `tenant_members` because a human's membership does not automatically mean their project may invoke every other project.

### 3. ecosystem_capabilities

Describes a capability without exposing its internal implementation.

```text
id
slug
version
status
classification
input_contract
output_contract
provider_project_id
confidence_policy
created_at
```

### 4. ecosystem_capability_grants

Explicit authorization between requester project, provider project/capability and applicable tenant scope.

### 5. ecosystem_external_references

Stable references between project-owned objects without creating cross-domain foreign keys.

### 6. ecosystem_requests / ecosystem_results

Only after the contracts are reviewed. These should carry request identity, tenant scope, capability version, provider, authorization decision, provenance and result status.

## First real integration

The first executable path should be intentionally small:

```text
TaxForge
  -> Baluarte gateway
  -> capability discovery
  -> Veritas provider
  -> contract result
  -> provenance
  -> TaxForge
```

The first integration must prove isolation as well as successful communication.

## Required tests before production use

- valid authenticated principal can resolve an allowed tenant;
- requester project can invoke an explicitly granted capability;
- requester cannot invoke an ungranted capability;
- provider cannot read unrelated tenant data;
- result contains provenance;
- low-confidence result is distinguishable from failure;
- direct table access between project domains is not required.

## Continuation rule

After this document, inspect existing RLS/policies for `tenants`, `tenant_members`, TaxForge tables and Veritas tables before writing migrations. The first mesh migration must be additive and reversible.
