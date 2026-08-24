# Supabase — Security Function Audit

> Read-only audit checkpoint for the shared Supabase project. No function permissions or database definitions were changed by this audit.

## Project

`hcwzsxdcvmswebunznak`

## Scope

Audited `SECURITY DEFINER` functions in `public` and compared their effective `EXECUTE` privileges for `anon` and `authenticated`.

## Findings

### Publicly executable SECURITY DEFINER functions

- `public.bump_view(p_route text)` — `anon` + `authenticated`
- `public.bump_visits()` — `anon` + `authenticated`

These are the highest-priority externally callable functions to review because SECURITY DEFINER executes with the function owner's privileges.

### Authenticated-executable SECURITY DEFINER functions

- `public.buscar_juris(p_tenant uuid, p_query_embedding vector, p_limite integer)`
- `public.current_tenant_role(p_tenant_id uuid)`
- `public.veritas_add_circuit_collaborator(p_project_id uuid, p_user_id uuid, p_role text)`
- `public.veritas_can_collaborate(p_project_id uuid)`
- `public.veritas_can_edit_project(p_project_id uuid)`
- `public.veritas_is_project_owner(p_project_id uuid)`
- `public.veritas_remove_circuit_collaborator(p_project_id uuid, p_user_id uuid)`

These may be intentional RPC boundaries, but each must be reviewed for authorization, `search_path`, and whether the exposed EXECUTE grant is required.

### Non-executable by anon/authenticated

The following SECURITY DEFINER functions were not executable by either role in the audit:

- `comms_rate_limit()`
- `handle_new_user()`
- `ingest_event(...)`
- `ingest_memory(...)`
- `ingest_stat(...)`
- `rls_auto_enable()`

## Supabase advisor findings

The security advisor also reports:

- `public.subscription_events` has RLS enabled but no policies;
- leaked-password protection is disabled;
- the externally callable SECURITY DEFINER functions listed above are flagged for review.

## Required remediation order

1. Review `bump_view` and `bump_visits`; revoke public EXECUTE or replace the privilege model if anonymous RPC access is not intentionally required.
2. Review authenticated Veritas and tenant authorization functions before the ecosystem identity contract is finalized.
3. Verify every SECURITY DEFINER function uses a safe, explicit `search_path` and does not trust caller-controlled identifiers without authorization.
4. Add an explicit policy or intentionally document the access model for `subscription_events`.
5. Enable leaked-password protection when the Auth configuration is ready.
6. Re-run the Supabase security advisor after remediation.

## Important constraint

Do **not** blindly revoke or rewrite these functions yet. Some may be required by existing applications. First map each function to its consumers in TaxForge, Veritas, and the platform before changing privileges.

## Next exact step

Map each flagged function to its repository consumer and SQL body, then classify it as:

`KEEP_PUBLIC_RPC` / `AUTHENTICATED_RPC` / `INTERNAL_ONLY` / `REPLACE`

Only after that should permission migrations be authored.
