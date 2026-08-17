# Supabase RLS + EXECUTE Grants Audit v1

## Result

The selected RPCs were checked against `information_schema.routine_privileges` and relevant `pg_policies` entries.

### EXECUTE grants

- `current_tenant_role`: authenticated, postgres, service_role. No anon grant.
- `buscar_juris`: authenticated, postgres, service_role. No anon grant.
- Veritas authorization/collaboration RPCs: authenticated, postgres, service_role. No anon grant.
- `bump_view`: anon, authenticated, postgres, service_role.
- `bump_visits`: anon, authenticated, postgres, service_role.

### Relevant RLS policies

`tenants`:
- authenticated SELECT is gated by `nexus.is_member(id)`.

`tenant_members`:
- authenticated SELECT allows the member to see their own membership or an admin/owner to see memberships in the tenant.
- authenticated ALL is limited to tenant admin/owner through `current_tenant_role(tenant_id)`.

`juris_doutrina`:
- SELECT requires viewer/operator/admin/owner role for the row's tenant.
- INSERT requires operator/admin/owner.
- UPDATE requires operator/admin/owner.
- DELETE requires admin/owner.

`veritas_circuit_collaborators`:
- authenticated SELECT is gated by `veritas_can_collaborate(project_id)`.

## Security interpretation

The current tenant boundary is materially stronger than a simple application-only convention: several important reads/writes are enforced through RLS and caller-bound authorization functions.

However, the audit is not yet sufficient to declare the entire Veritas domain or all TaxForge tables safe for mesh exposure. The mesh must continue to use explicit capability adapters rather than direct table access.

## Decisions

1. Keep `current_tenant_role` as an internal authorization primitive.
2. Keep Veritas collaboration functions as Veritas-domain primitives.
3. Treat `bump_view` and `bump_visits` as telemetry endpoints, not mesh capabilities; anonymous execution remains a separate product/security decision.
4. Do not modify grants in this audit.
5. Proceed to design the mesh registry only as a separate, explicitly authorized layer.

## Remaining audit scope

Before production cross-project exchange, enumerate all policies and ownership checks for the complete provider tables used by the first capability. The first capability should use the narrowest possible result and carry provenance.
