# Supabase RLS Policy Classification

Status: AUDIT / NO DATABASE CHANGES

Based on the current `pg_policies` state of the TaxForge tables in Supabase.

## Classification

### KEEP — membership-based policies

The following pattern is aligned with the ecosystem Identity/Tenant Contract:

- `nexus.is_member(tenant_id)` for SELECT
- `current_tenant_role(tenant_id)` restricted to `owner/admin/editor` for writes

Observed on:

- taxforge_analyses
- taxforge_audit_events
- taxforge_companies
- taxforge_contracts
- taxforge_decisions
- taxforge_evidence
- taxforge_premises
- taxforge_products
- taxforge_reviews
- taxforge_scenario_versions
- taxforge_scenarios
- taxforge_suppliers

These remain KEEP pending inspection of the actual function bodies and their security properties.

## REPLACE / HARDEN — direct auth.uid() tenant checks

The following policies use `tenant_id = auth.uid()` rather than tenant membership:

- taxforge_costs
- taxforge_data_sources
- taxforge_decision_actions
- taxforge_import_batches
- taxforge_purchases
- taxforge_review_items (through parent review)
- taxforge_scenario_runs
- taxforge_tax_rules
- taxforge_tax_rule_versions (through parent tax rule)

This conflicts with the Identity/Tenant Contract unless `tenant_id` is proven to be a user ID for those specific resources. Current architecture treats tenant_id as an organization boundary, so these policies are candidates for replacement with membership-based authorization.

## SPECIAL CASE — nullable/global resources

Two patterns allow `tenant_id IS NULL` on SELECT:

- `taxforge_data_sources`
- `taxforge_tax_rules` / `taxforge_tax_rule_versions`

These need explicit classification as either:

1. global/public-to-authenticated reference data;
2. tenant-owned data where NULL is legacy/invalid; or
3. intentionally shared data with a separate authorization rule.

Do not remove NULL semantics until the application behavior is mapped.

## IMPORTANT RLS DETAIL

For UPDATE operations, the final policies must retain both:

- `USING` — which existing rows may be targeted;
- `WITH CHECK` — what tenant/ownership state the resulting row may have.

The final design must prevent a member from moving a resource into another tenant by changing `tenant_id`.

## Current inconsistency

The database currently mixes two authorization models:

```text
Model A
resource.tenant_id
    ↓
nexus.is_member / current_tenant_role

Model B
resource.tenant_id = auth.uid()
```

Model A matches the ecosystem contract. Model B must be investigated and migrated deliberately.

## No migration authorized yet

This document is classification only. No policies, functions, grants, or tables were modified.

## Next continuation point

1. Inspect SQL bodies of `nexus.is_member` and `current_tenant_role`.
2. Inspect the callers in TaxForge and Veritas.
3. Determine whether NULL/global tax rules and data sources are intentional.
4. Produce cross-tenant test cases.
5. Only then draft the first RLS migration.
