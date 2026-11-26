# Supabase RLS / Mesh Security Audit

## Purpose

Audit the current Supabase security boundary before introducing ecosystem mesh tables or cross-project capability routing.

## Current findings

The current security advisor reports:

- `public.subscription_events`: RLS enabled with no policies. This may be intentional for a service-only table, but must be explicitly classified before mesh integration.
- `public.bump_view(p_route text)`: `SECURITY DEFINER`, executable by `anon` and `authenticated`.
- `public.bump_visits()`: `SECURITY DEFINER`, executable by `anon` and `authenticated`.
- `public.buscar_juris(...)`: `SECURITY DEFINER`, executable by `authenticated`.
- `public.current_tenant_role(p_tenant_id uuid)`: `SECURITY DEFINER`, executable by `authenticated`.
- Veritas collaboration/ownership RPCs are `SECURITY DEFINER` and executable by `authenticated`.
- Leaked-password protection is currently disabled in Supabase Auth.

These findings are not automatically vulnerabilities: some functions may intentionally form an authenticated API boundary. They must be reviewed against their callers and authorization logic before changing permissions.

## Mesh rule

No ecosystem capability request may bypass the existing tenant and project authorization boundary.

The intended flow is:

`principal -> tenant membership -> project permission -> capability grant -> provider policy -> minimum necessary result`

The mesh must not grant a project direct read access to another project's private tables merely because that project provides a capability.

## Classification to apply

Each exposed RPC should eventually receive one of:

- `PUBLIC_INTENTIONAL`
- `AUTHENTICATED_INTENTIONAL`
- `SERVICE_ONLY`
- `REWRITE_REQUIRED`
- `DEPRECATE`

## Immediate decisions

1. Do not create mesh tables yet.
2. Do not revoke existing RPC permissions blindly.
3. Map each RPC to its callers and tenant checks.
4. Verify RLS policies on `tenants`, `tenant_members`, TaxForge tables, and Veritas tables.
5. Record the final classification in Baluarte before implementing the capability registry.
6. Re-run Supabase security advisors after any DDL or policy changes.

## Next checkpoint

After the RPC/RLS review, define the minimal schema for:

- `ecosystem_projects`
- `ecosystem_capabilities`
- `ecosystem_capability_grants`
- `ecosystem_requests`
- `ecosystem_results`
- provenance / evidence references

Those tables should reference the existing identity/tenant model rather than introduce a second identity system.
