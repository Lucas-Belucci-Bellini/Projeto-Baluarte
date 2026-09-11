# Supabase RLS Matrix — Initial Contract

Status: DESIGN / AUDIT — no policy changes authorized by this document.

Project: ecosystem Supabase `hcwzsxdcvmswebunznak`

## 1. Canonical identity boundary

```text
auth.users.id
    ↓
public.tenant_members(user_id, tenant_id, papel)
    ↓
public.tenants.id
    ↓
tenant-owned resource
```

The canonical authorization question is: **does the authenticated user have an appropriate membership in the resource tenant?**

`tenant_id = auth.uid()` is not a valid generic authorization rule.

## 2. Initial policy matrix

The following is the design target. Existing policies must be compared against it before migration.

| Domain | Resource | Ownership boundary | Read | Write | Notes |
|---|---|---|---|---|---|
| Platform | `tenants` | tenant | members | owner/admin | Tenant administration |
| Platform | `tenant_members` | tenant + member | members/admin | owner/admin | Membership is the authorization source |
| Platform | `profiles` | user | self | self | User-owned, not tenant-owned |
| TaxForge | `taxforge_companies` | tenant | tenant members | operator/admin/owner | Company is root TaxForge resource |
| TaxForge | `taxforge_products` | tenant | tenant members | operator/admin/owner | Child of company |
| TaxForge | `taxforge_suppliers` | tenant | tenant members | operator/admin/owner | Child of company |
| TaxForge | `taxforge_contracts` | tenant | tenant members | operator/admin/owner | Sensitive business data |
| TaxForge | `taxforge_scenarios` | tenant | tenant members | operator/admin/owner | Scenario lifecycle |
| TaxForge | `taxforge_scenario_versions` | tenant | tenant members | operator/admin/owner | Versioned scenario inputs/outputs |
| TaxForge | `taxforge_premises` | tenant | tenant members | operator/admin/owner | Scenario premises |
| TaxForge | `taxforge_evidence` | tenant | tenant members | operator/admin/owner | Evidence requires provenance |
| TaxForge | `taxforge_analyses` | tenant | tenant members | operator/admin/owner | AI/domain analysis |
| TaxForge | `taxforge_analysis_versions` | inherited from analysis | tenant members | operator/admin/owner | Must not bypass parent tenant |
| TaxForge | `taxforge_reviews` | tenant | tenant members | operator/admin/owner | Reviewer authorization must be explicit |
| TaxForge | `taxforge_review_items` | inherited from review | tenant members | operator/admin/owner | Parent review controls access |
| TaxForge | `taxforge_decisions` | tenant | tenant members | operator/admin/owner | Decision records |
| TaxForge | `taxforge_decision_actions` | tenant | tenant members | operator/admin/owner | Optional action/planning capability |
| TaxForge | `taxforge_audit_events` | tenant | restricted | service/backend or authorized admin | Append-only target |
| TaxForge | `taxforge_purchases` | tenant | tenant members | operator/admin/owner | Company-scoped financial data |
| TaxForge | `taxforge_costs` | tenant | tenant members | operator/admin/owner | Company-scoped financial data |
| TaxForge | `taxforge_tax_rules` | tenant | tenant members | admin/owner | Rule governance |
| TaxForge | `taxforge_tax_rule_versions` | inherited from rule | tenant members | admin/owner | Parent rule controls access |
| TaxForge | `taxforge_scenario_runs` | tenant | tenant members | operator/admin/owner | Execution snapshots |
| TaxForge | `taxforge_import_batches` | tenant | tenant members | operator/admin/owner | Import metadata |
| TaxForge | `taxforge_data_sources` | tenant | tenant members | operator/admin/owner | Provenance catalog |
| TaxForge | `taxforge_evidence_sources` | inherited from evidence/source | tenant members | operator/admin/owner | Join table |
| Veritas | `veritas_circuit_projects` | user/project | owner/collaborator | owner/editor | Existing user-centric model must be mapped deliberately |
| Veritas | `veritas_circuit_versions` | project | authorized collaborators | owner/editor | Parent project controls access |
| Veritas | `veritas_circuit_collaborators` | project | owner/collaborator | owner | Collaboration membership |
| Veritas | `veritas_circuit_rooms` | project | authorized collaborators | owner/editor | Private collaboration rooms |
| Veritas | `veritas_circuit_context` | user | self | self | Context data is user-owned unless future tenantization is explicit |
| Veritas | `veritas_ai_metrics` | user | self | self/backend | Telemetry; no cross-user exposure |

## 3. Cross-tenant invariants

These must become automated tests before production migration:

1. User A cannot `SELECT` tenant B's TaxForge records.
2. User A cannot `INSERT` a TaxForge record using tenant B's `tenant_id`.
3. User A cannot `UPDATE` a tenant B record.
4. User A cannot `DELETE` a tenant B record.
5. A child row cannot be used to bypass its parent's tenant boundary.
6. A user removed from a tenant immediately loses access.
7. Viewer cannot perform operator/admin/owner writes.
8. Operator cannot perform owner-only tenant administration.
9. Service/backend paths are tested separately from end-user RLS.
10. Cross-project references never grant direct access to the target project's internal rows.

## 4. Important existing schema observations

- `public.tenants` is referenced by TaxForge tenant foreign keys.
- `public.tenant_members` has composite primary key `(tenant_id, user_id)` and roles `viewer`, `operator`, `admin`, `owner`.
- Most TaxForge root and child tables carry a `tenant_id` foreign key to `public.tenants`.
- Several child tables intentionally inherit access through a parent rather than owning an independent tenant key.
- Veritas currently has a user-centric ownership model rather than the TaxForge tenant model. This is not to be silently converted.

## 5. Migration gate

Do not change existing RLS policies until:

- the actual policy definitions are inventoried;
- the `nexus` authorization implementation is mapped to `tenant_members`;
- every TaxForge tenant-bearing table is covered;
- parent/child authorization paths are tested;
- Veritas' user-centric model is explicitly accepted or separately tenantized;
- a reversible migration is prepared;
- the continuation checkpoint is updated.

## 6. Next continuation point

Inspect the actual policy SQL and `nexus` membership/authorization functions. Produce a policy-by-policy diff against this matrix. Only after that should the first RLS migration be written.
