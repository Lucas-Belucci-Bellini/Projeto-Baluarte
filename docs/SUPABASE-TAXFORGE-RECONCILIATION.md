# Supabase ↔ TaxForge Reconciliation

## Purpose

Record the verified relationship between the current Supabase database and the current TaxForge repository before any new production schema is designed.

## Verified state

Supabase project: `hcwzsxdcvmswebunznak`

The database currently contains 23 `public.taxforge_*` tables. The TaxForge repository documentation currently describes the application as using Drizzle + MySQL/TiDB and explicitly says there was no evidence of a Supabase integration in the code analyzed.

Therefore the current state is a **schema/application divergence**:

```text
TaxForge repository
  └── Drizzle / MySQL-TiDB

Supabase project
  └── existing taxforge_* PostgreSQL domain
```

This must not be treated as proof that the Supabase schema is unused, abandoned, or production-authoritative. It must be reconciled with migrations, application code, deployment configuration, and ownership before changes are made.

## Existing TaxForge database domain

The current Supabase inventory contains:

- companies
- products
- suppliers
- contracts
- purchases
- costs
- scenarios
- scenario versions
- scenario runs
- premises
- analyses
- analysis versions
- evidence
- evidence sources
- data sources
- reviews
- review items
- decisions
- decision actions
- audit events
- import batches
- tax rules
- tax rule versions

The foreign-key graph is already centered on `tenants` and the TaxForge domain. Examples:

```text
tenants
  ↓
taxforge_companies
  ├── taxforge_products
  ├── taxforge_suppliers
  ├── taxforge_contracts
  ├── taxforge_purchases
  └── taxforge_scenarios
        ├── taxforge_premises
        ├── taxforge_scenario_versions
        ├── taxforge_scenario_runs
        ├── taxforge_analyses
        ├── taxforge_reviews
        └── taxforge_decisions

TaxForge evidence
  ├── taxforge_evidence
  ├── taxforge_evidence_sources
  └── taxforge_data_sources

Tax rules
  ├── taxforge_tax_rules
  └── taxforge_tax_rule_versions
```

## Important findings

1. The existing schema is already multi-tenant at the domain level: most principal tables contain `tenant_id` and reference `tenants(id)`.
2. The domain is substantially aligned with the product roadmap: company data, suppliers, contracts, scenarios, evidence, human review, decisions, audit events and versioned tax rules are all represented.
3. Some tables use `jsonb` snapshots for scenario/analysis execution. These should remain bounded snapshots, not a replacement for relational source-of-truth entities.
4. `taxforge_analyses.evidence_ids` is an array rather than a foreign-key join table. This is a candidate for review because the evidence model already has explicit relational links elsewhere.
5. `taxforge_tax_rules` and `taxforge_tax_rule_versions` already provide rule versioning and provenance fields, which should be preserved when reconciling the application layer.
6. The repository and database currently describe different persistence stacks. No migration should assume one is authoritative until this divergence is resolved.

## Security gate before production changes

Before adding cross-project interoperability, verify:

- RLS is enabled on every tenant-owned table.
- Each tenant-owned table has appropriate SELECT/INSERT/UPDATE/DELETE policies.
- Policies cannot be bypassed through exposed `SECURITY DEFINER` functions.
- Function `EXECUTE` privileges are intentionally scoped.
- Cross-project integrations use explicit contracts and service boundaries rather than unrestricted table access.
- Audit events cannot be modified by ordinary tenant users.

## Decision for the ecosystem

The Supabase database is **not yet declared the canonical TaxForge persistence layer**.

The current status is:

```text
DISCOVERED → RECONCILIATION REQUIRED → SECURITY REVIEW → CANONICAL DECISION
```

Only after that decision should we introduce new migrations or ecosystem tables.

## Next action

Perform a repository-to-database contract comparison:

```text
TaxForge domain types / Drizzle schema / queries
                ↕
existing Supabase taxforge_* schema
                ↓
missing / duplicate / incompatible fields
                ↓
canonical schema proposal
                ↓
RLS + policy design
                ↓
migration plan
```

Do not delete or rename existing tables as part of this reconciliation.
