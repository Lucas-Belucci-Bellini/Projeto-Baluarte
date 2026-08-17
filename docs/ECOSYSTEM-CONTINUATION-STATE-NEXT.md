# Ecosystem Continuation — RPC/RLS Classification

## Completed immediately before this checkpoint

The live Supabase function inventory was queried. The public schema contains service-only SECURITY DEFINER functions, authenticated SECURITY DEFINER authorization functions, and authenticated non-definer domain functions.

Key finding: `current_tenant_role(uuid)` and the Veritas `veritas_*` authorization RPCs are existing authorization primitives. They must be analyzed before the mesh capability registry is built.

## Current branch

`docs/rpc-rls-classification-v1`

## Current document

`docs/SUPABASE-RPC-CLASSIFICATION-V1.md`

## Exact next task

Inspect function definitions and RLS policies for:

1. `current_tenant_role`
2. `buscar_juris`
3. `bump_view`
4. `bump_visits`
5. `veritas_add_circuit_collaborator`
6. `veritas_can_collaborate`
7. `veritas_can_edit_project`
8. `veritas_is_project_owner`
9. `veritas_remove_circuit_collaborator`
10. `tenants`
11. `tenant_members`
12. Veritas project/collaborator tables

For each capture: caller, tenant check, project check, tables touched, data returned, intended exposure, final classification.

## Do not do yet

- Do not create the production capability registry.
- Do not grant cross-project table access.
- Do not weaken RLS.
- Do not revoke existing RPC access without caller evidence.

## After this task

Create the minimal mesh schema:

`ecosystem_projects -> ecosystem_capabilities -> capability_grants -> requests -> results -> provenance`

Then implement a controlled TaxForge -> Baluarte -> Veritas capability exchange.
