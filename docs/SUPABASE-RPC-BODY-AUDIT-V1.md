# Supabase RPC Body Audit v1

## Scope

This document records the body-level review of the RPCs selected during the ecosystem mesh security audit. No database permissions were changed by this review.

## Findings

### `current_tenant_role(uuid)`

- `SECURITY DEFINER`
- Restricts the lookup to `tenant_members.tenant_id = p_tenant_id` and `tenant_members.user_id = auth.uid()`.
- Returns only the caller's role for the requested tenant.
- Classification: `AUTHENTICATED_INTENTIONAL`, subject to verifying `EXECUTE` grants and caller expectations.
- Mesh use: suitable as an authorization primitive, not as a data-provider capability.

### `buscar_juris(uuid, vector, integer)`

- `STABLE SECURITY DEFINER`.
- Explicitly filters `juris_doutrina.tenant_id = p_tenant` and requires `nexus.is_member(p_tenant)`.
- Caps the result count to 50.
- Classification: `AUTHENTICATED_INTENTIONAL` if its execution grant is limited to authenticated callers and `nexus.is_member` is verified.
- Mesh use: potentially expose as a narrowly scoped capability such as `tax.jurisprudence.search`, but only after provider-level contract and provenance are defined.

### `bump_view(text)`

- `SECURITY DEFINER`.
- Validates the route format before updating `site_stats`.
- Writes only a derived counter.
- Classification: `AUTHENTICATED_INTENTIONAL` or `PUBLIC_INTENTIONAL` depending on the product's telemetry requirement; it is not a candidate for the knowledge mesh.

### `bump_visits()`

- `SECURITY DEFINER`.
- Updates only the `visits` counter in `site_stats`.
- Classification: `PUBLIC_INTENTIONAL` only if anonymous telemetry is explicitly desired; otherwise restrict it to authenticated/service callers.
- Mesh use: none.

### Veritas collaboration functions

`veritas_is_project_owner`, `veritas_can_collaborate`, `veritas_can_edit_project`, `veritas_add_circuit_collaborator`, and `veritas_remove_circuit_collaborator` all derive authorization from `auth.uid()` and the Veritas project/collaborator records.

- Ownership checks are caller-bound.
- Mutation functions reject invalid collaborator roles and self-collaboration.
- Classification: `AUTHENTICATED_INTENTIONAL`.
- Mesh use: keep these as Veritas-domain authorization primitives. Do not expose them as generic cross-project capabilities.

## Mesh conclusion

The first provider capability should not call arbitrary Veritas RPCs. A future mesh adapter should expose an explicit capability contract and invoke only the provider operation required for that capability.

The first realistic candidate remains a narrowly scoped TaxForge/Veritas exchange, but the capability should be defined independently of Veritas' internal table layout and authorization RPC names.

## Remaining blocker

Before implementing mesh tables:

1. verify exact `EXECUTE` grants for each RPC;
2. inspect RLS policies on the underlying tables;
3. verify `nexus.is_member` behavior;
4. classify anonymous telemetry deliberately;
5. record the final security decision in the Baluarte continuation state.
