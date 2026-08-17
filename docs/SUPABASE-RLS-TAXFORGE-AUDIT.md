# Supabase RLS — TaxForge Audit

Date: 2026-08-16

## Scope

Read-only audit of the current Supabase project `hcwzsxdcvmswebunznak` for `public.taxforge_*`, `public.tenants`, and `public.tenant_members`.

## Current state

All 23 `taxforge_*` tables inspected have PostgreSQL RLS enabled. `tenants` and `tenant_members` also have RLS enabled. None of these tables is currently forced-RLS.

## Critical reconciliation finding

The policy model is not yet internally consistent with the ecosystem tenant model.

Two policy families are present:

1. Tenant-membership based access, e.g. `nexus.is_member(tenant_id)` and `current_tenant_role(tenant_id)`.
2. Direct identity equality, e.g. `tenant_id = auth.uid()`.

The second family appears on several TaxForge tables and should be treated as a migration/review candidate, because `tenant_id` semantically represents a tenant while `auth.uid()` represents a user identity. These predicates may be intentional only if the column is actually storing a user id, which must be verified against foreign keys and application code before any change.

Affected policy families include:

- `taxforge_costs_*`
- `taxforge_data_sources_*`
- `taxforge_decision_actions_*`
- `taxforge_import_batches_*`
- `taxforge_purchases_*`
- `taxforge_scenario_runs_*`
- `taxforge_tax_rules_*`
- child policies for `taxforge_analysis_versions`, `taxforge_evidence_sources`, `taxforge_review_items`, and `taxforge_tax_rule_versions`

## Important existing model

The stronger/more coherent pattern already exists on several core tables:

```text
authenticated user
      ↓
nexus.is_member(tenant_id)
      ↓
current_tenant_role(tenant_id)
      ↓
owner / admin / editor
```

This is the preferred candidate pattern for the future ecosystem model, but it is NOT declared canonical yet.

## No destructive changes made

No RLS policy, table, function, or data was modified during this audit.

## Next action

Before changing policies:

1. Inspect foreign keys and column semantics for every affected `tenant_id`.
2. Trace the corresponding TaxForge application queries.
3. Verify the implementation of `nexus.is_member` and `current_tenant_role`.
4. Build a policy matrix for SELECT/INSERT/UPDATE/DELETE by role.
5. Add tests for cross-tenant isolation.
6. Only then prepare a migration.

## Ecosystem implication

This audit blocks the first canonical Supabase migration for TaxForge until tenant identity and RLS semantics are reconciled. The result must be recorded in the ecosystem continuation state before implementation begins.
