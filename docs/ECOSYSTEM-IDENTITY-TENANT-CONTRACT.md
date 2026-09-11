# Ecosystem Identity & Tenant Contract

Status: DESIGN / NOT YET MIGRATED

This document defines the identity boundary that must be settled before the ecosystem database is made canonical.

## 1. Core distinction

- **User identity** is represented by `auth.users.id` / authenticated subject.
- **Tenant** represents an organization or isolated ownership boundary.
- **Membership** connects a user to a tenant.
- **Role** describes what the member may do inside that tenant.
- A `tenant_id` MUST NOT be assumed to equal `auth.uid()`.

Conceptual model:

```text
Auth User
   |
   +----< Tenant Membership >---- Tenant
                                      |
                                      +---- domain resources
```

## 2. Authorization rule

A request may access a tenant-owned resource only when the authenticated subject has an appropriate membership in that tenant and the operation is permitted by its role.

Policies must derive authorization from the membership/authorization contract rather than from `tenant_id = auth.uid()`.

## 3. Domain ownership

Each project remains the owner of its internal domain data:

- `taxforge_*` -> TaxForge
- `ark_*` -> ARK Initiative
- `aegis_*` -> AEGIS
- `veritas_*` -> Veritas
- `dailyplanner_*` -> DailyPlanner
- platform/ecosystem tables -> Baluarte

Cross-project access must use explicit contracts, references, or events. Direct unrestricted table access between projects is prohibited by architecture.

## 4. Migration requirements

Before changing existing RLS policies:

1. inventory every tenant foreign key;
2. identify the authoritative membership table/function;
3. map each existing policy to the intended operation;
4. add cross-tenant denial tests;
5. verify service-role/server-only paths separately;
6. migrate policies in a reversible migration;
7. only then remove obsolete authorization paths.

## 5. Open decisions

- Canonical membership table/function still needs to be selected from the existing Supabase implementation.
- Existing TaxForge MySQL workspace membership must be mapped into the canonical tenant model.
- Existing Veritas authorization functions must be checked against the same identity contract.
- No destructive migration is authorized by this document.

## 6. Continuation point

Next: inspect the existing `nexus` membership/authorization implementation and all TaxForge `tenant_id` foreign keys, then produce `SUPABASE-RLS-MATRIX.md` with one row per policy/resource/operation.
