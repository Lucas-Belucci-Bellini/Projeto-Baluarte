# Supabase RPC Classification V1

## Scope

Inventory of public-schema functions relevant to the ecosystem mesh. This is a classification checkpoint, not a permission change.

## Current inventory

### Service-only / already restricted by grants
- `comms_rate_limit()` — SECURITY DEFINER; postgres/service_role only.
- `handle_new_user()` — SECURITY DEFINER; postgres/service_role only.
- `ingest_event(...)` — SECURITY DEFINER; postgres/service_role only.
- `ingest_memory(...)` — SECURITY DEFINER; postgres/service_role only.
- `ingest_stat(...)` — SECURITY DEFINER; postgres/service_role only.
- `rls_auto_enable()` — SECURITY DEFINER; postgres/service_role only.
- `touch_updated_at()` — postgres/service_role only.
- `enforce_subscription_status_transition()` — postgres/service_role only.

### Authenticated functions requiring caller/tenant review
- `current_tenant_role(uuid)` — SECURITY DEFINER.
- `buscar_juris(uuid, vector, integer)` — SECURITY DEFINER.
- `bump_view(text)` — SECURITY DEFINER; currently anon + authenticated.
- `bump_visits()` — SECURITY DEFINER; currently anon + authenticated.
- `veritas_add_circuit_collaborator(...)` — SECURITY DEFINER.
- `veritas_can_collaborate(uuid)` — SECURITY DEFINER.
- `veritas_can_edit_project(uuid)` — SECURITY DEFINER.
- `veritas_is_project_owner(uuid)` — SECURITY DEFINER.
- `veritas_remove_circuit_collaborator(...)` — SECURITY DEFINER.

These must not be reclassified or revoked without tracing their callers and authorization logic.

### Authenticated, non-SECURITY DEFINER domain functions
The knowledge/skill functions and Veritas synchronization functions are currently callable by authenticated users and should be reviewed for tenant/project enforcement through their SQL bodies and RLS.

## Preliminary decisions

1. Service-only functions are not candidate public mesh endpoints.
2. `current_tenant_role` is a likely authorization primitive, not a mesh capability provider.
3. Veritas authorization RPCs should remain project-scoped and must not become cross-project data APIs.
4. `bump_view` / `bump_visits` need separate product-level review because anonymous execution is materially different from the ecosystem mesh authorization path.
5. No direct cross-project table grants should be introduced for the mesh.

## Next exact investigation

Inspect the SQL body and RLS policies for:

- `current_tenant_role`
- `buscar_juris`
- all `veritas_*` SECURITY DEFINER functions
- `bump_view`
- `bump_visits`
- `tenants`
- `tenant_members`
- Veritas project/collaborator tables

For each, record:

`caller -> tenant check -> project check -> tables touched -> data returned -> intended exposure -> final classification`

## Mesh boundary

The future flow remains:

`requester identity -> tenant membership -> requester project -> capability grant -> provider authorization -> minimum result -> provenance`

The capability registry must sit above these existing boundaries, not replace them.
