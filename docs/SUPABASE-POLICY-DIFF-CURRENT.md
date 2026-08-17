# Supabase Policy Diff — Current Checkpoint

Status: AUDIT / NO DATABASE CHANGES

## Current security findings

The Supabase security advisor currently reports:

- `public.subscription_events`: RLS enabled with no policy.
- `public.bump_view(text)`: SECURITY DEFINER executable by `anon` and `authenticated`.
- `public.bump_visits()`: SECURITY DEFINER executable by `anon` and `authenticated`.
- `public.buscar_juris(...)`: SECURITY DEFINER executable by `authenticated`.
- `public.current_tenant_role(uuid)`: SECURITY DEFINER executable by `authenticated`.
- `public.veritas_add_circuit_collaborator(...)`: SECURITY DEFINER executable by `authenticated`.
- `public.veritas_can_collaborate(uuid)`: SECURITY DEFINER executable by `authenticated`.
- `public.veritas_can_edit_project(uuid)`: SECURITY DEFINER executable by `authenticated`.
- `public.veritas_is_project_owner(uuid)`: SECURITY DEFINER executable by `authenticated`.
- `public.veritas_remove_circuit_collaborator(...)`: SECURITY DEFINER executable by `authenticated`.
- Supabase Auth leaked-password protection is disabled.

These are audit findings, not automatic evidence that every function is unsafe. Before changing privileges, inspect each function body and its consumers.

## Required next step

Build a policy-by-policy diff using the actual SQL definition of:

1. `tenant_members` authorization helpers;
2. `current_tenant_role(uuid)`;
3. TaxForge `tenant_id` policies;
4. Veritas project/collaborator policies;
5. `subscription_events` intended access model;
6. SECURITY DEFINER function ownership/search_path/authorization checks.

For every item classify:

- KEEP — intentional and correctly constrained;
- HARDEN — intended but privilege/search_path/authorization needs tightening;
- REPLACE — policy/function conflicts with the canonical identity contract;
- REMOVE — obsolete and unused;
- INVESTIGATE — consumer or intent is not yet established.

## Safety rule

Do not change RLS policies, GRANTs, function security mode, or Auth settings until the consumer map and rollback path are documented.

## Ecosystem rule

The database remains internally private to each project domain. Cross-project integration must use explicit contracts, events, or references; it must not be implemented by granting one project broad table access to another project's domain.

## Continuation pointer

Next conversation/task: inspect actual policy/function SQL and produce the first `KEEP/HARDEN/REPLACE/REMOVE/INVESTIGATE` matrix. Then design cross-tenant denial tests before any production migration.
