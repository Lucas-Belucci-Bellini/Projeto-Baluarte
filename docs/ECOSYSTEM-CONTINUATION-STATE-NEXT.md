# Ecosystem Continuation — Next Checkpoint

## Current stage

Supabase identity/tenant structures have been inventoried. The next blocker before creating the ecosystem capability registry is the security boundary review.

## Latest security evidence

The Supabase security advisor currently reports:

- `subscription_events` has RLS enabled without policies.
- `bump_view` and `bump_visits` are SECURITY DEFINER and executable by anonymous and authenticated roles.
- `buscar_juris`, `current_tenant_role`, and Veritas collaboration/ownership RPCs are SECURITY DEFINER and executable by authenticated users.
- Leaked-password protection is disabled.

## Next exact task

Map each exposed RPC and relevant RLS policy to:

1. caller(s)
2. tenant check
3. project check
4. data accessed
5. intended exposure
6. final classification

Then review the RLS boundary for `tenants`, `tenant_members`, TaxForge tables, and Veritas tables.

## Do not do yet

- Do not create `ecosystem_capabilities` in production.
- Do not grant cross-project table access.
- Do not revoke RPC permissions without caller evidence.

## After the security review

Design the minimum mesh schema using the existing `auth.users` / tenant model:

`ecosystem_projects -> ecosystem_capabilities -> capability_grants -> requests -> results -> provenance`

Then implement the first controlled capability exchange: TaxForge -> Baluarte -> Veritas.
