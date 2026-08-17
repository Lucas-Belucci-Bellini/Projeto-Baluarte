# TaxForge ↔ Supabase Schema Reconciliation

Status: `IN_PROGRESS`

Last verified: 2026-08-16

## Purpose

This document is the canonical checkpoint for reconciling the TaxForge repository schema with the existing Supabase PostgreSQL schema before any new production migrations are created.

## Current repository evidence

The current TaxForge `drizzle/schema.ts` imports `drizzle-orm/mysql-core` and defines a MySQL schema. `drizzle.config.ts` also explicitly sets `dialect: "mysql"` and reads `DATABASE_URL`. The live server database layer imports `drizzle-orm/mysql2` and calls `drizzle(process.env.DATABASE_URL)`. Therefore the current application database path is MySQL-oriented, not Supabase/PostgreSQL.

The current Drizzle schema contains two visibly distinct domains:

### Tax workspace / governance slice

- `users`
- `tax_scenario_workspaces`
- `tax_workspace_events`
- `tax_workspace_members`

The server database layer actively imports and uses these four tax-workspace tables for workspace persistence, membership, access checks and governance events.

### Legacy / parallel stock-analysis slice

- `stocks`
- `watchlist`
- `stock_analysis`
- `price_history`
- `alerts`
- `notifications`
- `chat_history`
- `analysis_history`

These remain in the same Drizzle schema file but are a separate domain from the tax-reform workspace model. They must not be automatically mapped onto the TaxForge tax-domain tables.

## Existing Supabase evidence

The existing Supabase project already contains 23 PostgreSQL tables prefixed `taxforge_`:

- `taxforge_analyses`
- `taxforge_analysis_versions`
- `taxforge_audit_events`
- `taxforge_companies`
- `taxforge_contracts`
- `taxforge_costs`
- `taxforge_data_sources`
- `taxforge_decision_actions`
- `taxforge_decisions`
- `taxforge_evidence`
- `taxforge_evidence_sources`
- `taxforge_import_batches`
- `taxforge_premises`
- `taxforge_products`
- `taxforge_purchases`
- `taxforge_review_items`
- `taxforge_reviews`
- `taxforge_scenario_runs`
- `taxforge_scenario_versions`
- `taxforge_scenarios`
- `taxforge_suppliers`
- `taxforge_tax_rule_versions`
- `taxforge_tax_rules`

The current inventory shows every one of these tables has RLS enabled, but RLS correctness still requires policy-level review.

## Current reconciliation result

The two models are **not yet equivalent**.

| Domain | Current TaxForge application | Existing Supabase | Current conclusion |
|---|---|---|---|
| Users / identity | MySQL `users` | Supabase tenant/auth infrastructure | Must align with ecosystem identity; do not duplicate blindly |
| Company | `companyKey` + `companyName` in workspace table | `taxforge_companies` | Different granularity; compare before mapping |
| Product | Not represented in current Drizzle tax workspace schema | `taxforge_products` | Supabase-only candidate until live application usage is proven |
| Supplier | Not represented in current Drizzle tax workspace schema | `taxforge_suppliers` | Supabase-only candidate until live application usage is proven |
| Contract | Not represented in current Drizzle tax workspace schema | `taxforge_contracts` | Supabase-only candidate until live application usage is proven |
| Scenario | `scenarioIds` JSON array inside workspace | scenarios + versions + runs | Supabase is a richer model, but not yet proven to be application-canonical |
| Evidence | Not represented in current Drizzle tax workspace schema | evidence + sources | Candidate domain; integration must be verified |
| Analysis | Stock `stock_analysis` exists | tax analyses + versions | Different domains; do not merge |
| Review | Not represented in current Drizzle tax workspace schema | reviews + review items | Candidate domain; integration must be verified |
| Decision | Not represented in current Drizzle tax workspace schema | decisions + actions | Candidate domain; integration must be verified |
| Audit | `tax_workspace_events` | `taxforge_audit_events` | Similar purpose but different semantics; reconcile explicitly |
| Tax rules | Not represented in current Drizzle tax workspace schema | tax rules + versions | Candidate domain; integration must be verified |
| Imports | Not represented in current Drizzle tax workspace schema | import batches | Candidate domain; integration must be verified |

## Key architectural finding

The existing Supabase model appears to represent a more complete TaxForge domain than the currently checked-in MySQL/Drizzle application model. That does **not** prove the Supabase model is unused, canonical, or safe to adopt directly.

The current code path proves that the application still has active MySQL persistence for tax workspaces and memberships. Therefore the next architectural decision is a **database convergence decision**, not a table-creation task.

## Rules before migration

1. Do not drop or rename existing tables.
2. Do not declare the Supabase model canonical solely because it exists.
3. Do not declare MySQL canonical solely because the current application imports it.
4. Do not duplicate TaxForge entities merely to make names match.
5. Separate the stock-analysis domain from the tax-reform domain unless code proves they are intentionally coupled.
6. Identity, tenant, organization and membership must eventually align with the Baluarte ecosystem contracts.
7. RLS policies and exposed functions must be reviewed before production expansion.
8. No production migration should happen until the database convergence decision is recorded here and in the ecosystem continuation state.

## Next exact action

Inspect all TaxForge database consumers (`server/db.ts`, `server/routers.ts`, `server/storage.ts`, workspace permission code and any migrations) and classify each active query as:

- `LIVE_MYSQL_WORKSPACE`
- `LEGACY_MYSQL_STOCK`
- `SUPABASE_CANDIDATE`
- `UNRESOLVED`

Then inspect the Supabase policies, foreign keys and functions for the corresponding `taxforge_*` domain.

After that:

`live application usage → schema mapping → RLS/policy review → canonical database decision → migration plan`
