# TaxForge ↔ Supabase Schema Reconciliation

Status: `IN_PROGRESS`

Last verified: 2026-08-16

## Purpose

This document is the canonical checkpoint for reconciling the TaxForge repository schema with the existing Supabase PostgreSQL schema before any new production migrations are created.

## Current repository evidence

The TaxForge repository currently contains `drizzle/schema.ts` using `drizzle-orm/mysql-core` and defines a MySQL-oriented schema. The current file includes:

- `users`
- `tax_scenario_workspaces`
- `tax_workspace_events`
- `tax_workspace_members`
- `stocks`
- `watchlist`
- `stock_analysis`
- `price_history`
- `alerts`
- `notifications`
- `chat_history`
- `analysis_history`

The TaxForge repository therefore contains both tax-workspace structures and an older/parallel stock-analysis domain in the same Drizzle schema file.

## Existing Supabase evidence

The existing Supabase project already contains a PostgreSQL TaxForge domain with tables including:

- `taxforge_companies`
- `taxforge_products`
- `taxforge_suppliers`
- `taxforge_contracts`
- `taxforge_scenarios`
- `taxforge_scenario_versions`
- `taxforge_premises`
- `taxforge_evidence`
- `taxforge_analyses`
- `taxforge_analysis_versions`
- `taxforge_reviews`
- `taxforge_review_items`
- `taxforge_decisions`
- `taxforge_decision_actions`
- `taxforge_audit_events`
- `taxforge_purchases`
- `taxforge_costs`
- `taxforge_tax_rules`
- `taxforge_tax_rule_versions`
- `taxforge_scenario_runs`
- `taxforge_import_batches`
- `taxforge_data_sources`
- `taxforge_evidence_sources`

The Supabase database also has tenant/identity infrastructure and RLS-enabled tables.

## Important conclusion

The Supabase `taxforge_*` model cannot yet be declared the canonical application schema solely because it exists. The repository currently points at a MySQL/Drizzle schema, so we must reconcile the two models before changing either one.

## Reconciliation matrix

| Domain | Repository evidence | Supabase evidence | Decision |
|---|---|---|---|
| Users / identity | `users` in Drizzle | tenant/auth infrastructure exists | reconcile with platform identity |
| Company | workspace `companyKey/companyName` | `taxforge_companies` | compare semantics |
| Product | no matching tax domain table in current Drizzle file | `taxforge_products` | Supabase candidate; verify code usage |
| Supplier | no matching tax domain table in current Drizzle file | `taxforge_suppliers` | Supabase candidate; verify code usage |
| Contract | no matching tax domain table in current Drizzle file | `taxforge_contracts` | Supabase candidate; verify code usage |
| Scenario | `tax_scenario_workspaces.scenarioIds` only | scenarios + versions + runs | likely richer Supabase domain; verify intended source |
| Evidence | no equivalent domain table in current Drizzle file | evidence + sources | Supabase candidate; verify application integration |
| Analysis | stock `stock_analysis` exists; tax analysis differs | tax analyses + versions | keep domains separate |
| Review | no equivalent in current Drizzle file | reviews + review items | Supabase candidate |
| Decision | no equivalent in current Drizzle file | decisions + actions | Supabase candidate |
| Audit | `tax_workspace_events` | `taxforge_audit_events` | reconcile event/audit semantics |
| Tax rules | no equivalent in current Drizzle file | tax rules + versions | Supabase candidate |
| Imports | no equivalent in current Drizzle file | import batches | Supabase candidate |

## Rules before migration

1. Do not drop or rename existing tables.
2. Do not declare the Supabase model canonical until repository usage is verified.
3. Do not duplicate TaxForge entities merely to make names match.
4. Separate the stock-analysis domain from the tax-reform domain unless code proves they are intentionally coupled.
5. Identity, tenant, organization and membership must eventually align with the Baluarte ecosystem contracts.
6. RLS policies and exposed functions must be reviewed before production expansion.
7. Every schema decision must be recorded in Baluarte.

## Next exact action

Inspect TaxForge `server/db.ts`, `server/routers.ts`, migrations and application queries to determine which Drizzle tables are actually live and which are legacy/parallel. Then compare those live entities against the existing `taxforge_*` PostgreSQL tables.

After that:

`repository usage → schema mapping → RLS/policy review → canonical model decision → migration plan`
