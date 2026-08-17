# Supabase — Current State

> Snapshot of the currently connected Supabase project before ecosystem migrations. This is an engineering inventory, not the final schema.

## Project

- Supabase project ref: `hcwzsxdcvmswebunznak`
- Inventory date: 2026-08-16
- Scope inspected: `public` tables, columns, primary keys and foreign-key relationships.
- No destructive schema changes were made during this inventory.

## Executive finding

The project is **not an empty foundation**. It already contains multiple domains in one `public` schema. Therefore the next step is controlled separation/normalization, not blindly adding another set of tables.

## Domain groups observed

### Platform / identity / tenant

- `profiles`
- `tenants`
- `tenant_members`
- `site_stats`
- `billing_plans`
- `billing_prices`
- `plan_entitlements`
- `subscriptions`
- `subscription_events`
- `user_entitlements`

The existing tenant model is already referenced by TaxForge and several other tables. It should be evaluated as the candidate foundation for the future shared identity/organization contract, but it is **not yet declared the final ecosystem contract**.

### Knowledge / memory / AI learning

- `memories`
- `knowledge_notes`
- `ai_skills`
- `memory_skill_links`
- `ai_skill_evidence`
- `ai_skill_versions`
- `ai_skill_audit`
- `ai_skill_quality_flags`
- `knowledge_items`
- `knowledge_sources`
- `knowledge_versions`
- `knowledge_quality_events`
- `knowledge_quality_flags`
- `knowledge_merge_proposals`
- `learning_audit_events`
- `skill_knowledge_links`

These form a substantial knowledge/learning subsystem and should not automatically become the shared data store for every project.

### Existing application/content/runtime tables

- `mural_posts`
- `mil_curation`
- `media_bookmarks`
- `global_comms`
- `nucleo_events`

These appear to belong to existing application/runtime features and need ownership mapping before any consolidation.

### Legal / document domain

- `partes`
- `processos`
- `processo_partes`
- `prazos_eventos`
- `juris_doutrina`
- `pecas`
- `pecas_versoes`

These are a separate domain and must not be assumed to belong to TaxForge merely because tax/legal data can overlap conceptually.

### Veritas

- `veritas_circuit_context`
- `veritas_circuit_projects`
- `veritas_circuit_versions`
- `veritas_circuit_collaborators`
- `veritas_ai_metrics`
- `veritas_circuit_rooms`

The current database already contains a dedicated Veritas domain. The existing user-level isolation and collaboration model must be reconciled with the future shared identity contract rather than replaced blindly.

### TaxForge

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

All inspected TaxForge tables currently have RLS enabled and use `tenant_id` consistently where applicable. The foreign-key graph shows a coherent first version of the intended domain, but it still needs reconciliation with the current TaxForge repository before being declared canonical.

## Important observations

1. The current database uses a single `public` schema for several domains.
2. RLS is enabled on all tables returned by this inventory, but **RLS enabled does not by itself prove that policies are correct**.
3. The existing `tenants` + `tenant_members` model is already the central relationship for many TaxForge tables.
4. Veritas currently uses `user_id`-based ownership in its dedicated tables rather than the TaxForge tenant model.
5. There are existing knowledge/memory systems that may eventually provide shared capabilities, but their data must remain protected by domain and authorization boundaries.
6. The TaxForge domain already has more tables than the initial repository schema inventory. This confirms that the Supabase design has progressed beyond the old MySQL/Drizzle schema and must be compared against the repository before migration decisions.
7. No ARK, DailyPlanner or AEGIS domain tables were identified by the `public` table inventory. Their domains should be designed only after inspecting their repositories.

## Current domain ownership hypothesis

| Domain | Current tables | Status |
|---|---|---|
| Platform / tenant | 10 | candidate shared foundation |
| Knowledge / AI | 16 | existing subsystem; ownership review required |
| Application/content/runtime | 5 | legacy/existing application ownership review |
| Legal | 7 | separate domain |
| Veritas | 6 | existing domain |
| TaxForge | 23 | existing domain; repository reconciliation required |
| ARK | 0 identified | not designed yet |
| DailyPlanner | 0 identified | not designed yet |
| AEGIS | 0 identified | not designed yet |

## Security follow-up

A separate security/policy inventory is required before exposing new application paths. In particular, function execution privileges, `SECURITY DEFINER` functions, and actual RLS policies must be audited. This document intentionally does not treat `rls_enabled=true` as proof of safe authorization.

## Do not do yet

- Do not drop existing tables.
- Do not rename the existing tenant model globally.
- Do not merge Veritas tables into generic project tables.
- Do not create ARK/AEGIS/DailyPlanner tables in this project until their repositories are mapped.
- Do not expose cross-project raw rows simply because they share a database.
- Do not put secrets or credentials in this repository.

## Next engineering step

1. Reconcile the 23 TaxForge tables against the current TaxForge repository.
2. Inspect actual RLS policies and function privileges.
3. Define the shared identity/organization contract around evidence, not assumptions.
4. Define cross-project references/events without granting direct raw-table access.
5. Only then finalize migrations and indexes.
