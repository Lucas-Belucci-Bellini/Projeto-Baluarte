# Supabase Identity and Tenant Audit

**Date:** 2026-08-16  
**Purpose:** verify the existing Supabase model before introducing the ecosystem mesh registry.

## Current identity model

The database already uses `auth.users` as the canonical user identity.

Observed relationships include:

- `profiles.id -> auth.users.id`
- `tenant_members.user_id -> auth.users.id`
- TaxForge `created_by` / reviewer / owner fields -> `auth.users.id`
- Veritas project and context ownership -> `auth.users.id`
- knowledge/skill lifecycle actors -> `auth.users.id`

This means the mesh should **not** introduce a second user identity system.

## Current tenant model

The database already contains:

- `tenants`
- `tenant_members`
- tenant roles: `viewer`, `operator`, `admin`, `owner`
- tenant foreign keys across TaxForge and several platform tables

The existing `tenants` table is therefore the natural tenant boundary for the first mesh version.

## TaxForge alignment

The TaxForge domain is already tenant-scoped:

- `taxforge_companies`
- `taxforge_products`
- `taxforge_suppliers`
- `taxforge_contracts`
- `taxforge_scenarios`
- `taxforge_premises`
- `taxforge_evidence`
- `taxforge_analyses`
- `taxforge_reviews`
- `taxforge_decisions`
- `taxforge_audit_events`
- related scenario, purchase, cost, source and version tables

Most domain records carry `tenant_id`, with foreign keys back to `tenants`.

## Important architectural finding

The existing database already has enough identity and tenant primitives to begin the mesh design. **Do not create parallel `mesh_users` or `mesh_tenants` tables.**

The mesh identity context should resolve to existing primitives:

```text
principal_id      -> auth.users.id
organization_id   -> tenants.id
membership        -> tenant_members
project_id        -> ecosystem project identity (to be defined)
capability        -> mesh capability contract (not yet persisted)
```

## What is still missing

The existing schema does not yet establish a canonical ecosystem `project` registry or a capability registry. Those should be designed separately from user/tenant identity.

The next schema work should therefore be additive:

1. define ecosystem project identity;
2. define capability ownership/provider records;
3. define authorization between requester project and provider capability;
4. define external references;
5. only then create the first executable TaxForge -> Baluarte -> Veritas request path.

## Security boundary

The mesh must never grant a project blanket access to another project's tables. Tenant membership is necessary but not sufficient for cross-project access. A mesh request requires explicit project/capability authorization and must return only the minimum data allowed by the provider contract.

## Evidence from current schema

The existing database also contains reusable knowledge structures such as `knowledge_items`, `knowledge_sources`, `knowledge_versions`, `knowledge_quality_events`, `ai_skills`, and `skill_knowledge_links`. These are useful building blocks for provenance and reusable knowledge, but they are **not automatically the ecosystem capability registry**. Their semantics should be preserved unless a later migration explicitly establishes a mapping.

## Decision

**Identity and tenant foundation: REUSE EXISTING SUPABASE MODEL.**

**Mesh registry: ADD SEPARATE DOMAIN MODEL.**

**Cross-project data access: CONTRACT + AUTHORIZATION, never direct table trust.**
