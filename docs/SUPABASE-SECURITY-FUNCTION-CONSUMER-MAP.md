# Supabase — Security Function Consumer Map

## Scope

Initial evidence map for `SECURITY DEFINER` functions in Supabase project `hcwzsxdcvmswebunznak`.

This document is an engineering inventory, not permission to expose or weaken database security.

## Classification

### KEEP / INTERNAL SECURITY PRIMITIVES

- `nexus.is_member(uuid)` — membership predicate used by protected database operations.
- `nexus.resolve_tenant(text,text)` — resolves an active tenant from an ingest key; must remain server-side and must not be granted directly to anonymous/authenticated clients.
- `current_tenant_role(uuid)` — authenticated tenant-role helper; keep only if all callers require it and its RLS interaction is tested.
- `handle_new_user()` — trigger function for profile creation; service/trigger execution only.
- `comms_rate_limit()` — trigger function; service/trigger execution only.
- `rls_auto_enable()` — event trigger; internal only.

### AUTHENTICATED RPC CANDIDATES

- `buscar_juris(uuid, vector, integer)` — currently executable by authenticated users and service role. It checks tenant membership through `nexus.is_member`. Keep only after confirming callers and adding bounded/appropriate RLS and query-cost tests.
- `veritas_add_circuit_collaborator(uuid,uuid,text)` — authenticated RPC; owner check is enforced in the function.
- `veritas_can_collaborate(uuid)` — authenticated RPC; collaboration predicate.
- `veritas_can_edit_project(uuid)` — authenticated RPC; edit predicate.
- `veritas_is_project_owner(uuid)` — authenticated RPC; ownership predicate.
- `veritas_remove_circuit_collaborator(uuid,uuid)` — authenticated RPC; owner check is enforced.

### PUBLIC / ANON RPC CANDIDATES

- `bump_view(text)` — anonymous/authenticated/service execution. Input is route-validated and only updates `site_stats`. Requires abuse/rate-limit consideration before treating public execution as final.
- `bump_visits()` — anonymous/authenticated/service execution. Updates global visit counter. Requires abuse/rate-limit consideration before treating public execution as final.

### SERVICE-ONLY INGESTION

- `ingest_event(text,text,text,jsonb,text)` — service-role execution only. Resolves tenant using an ingest key and writes to `nucleo_events`.
- `ingest_memory(text,text,text,text[],text)` — service-role execution only. Resolves tenant using an ingest key and writes to `memories`.
- `ingest_stat(text,text,text,numeric,jsonb,date)` — service-role execution only. Resolves tenant and writes/upserts statistics.

These functions are important candidates for future Project Knowledge Mesh ingestion, but they must remain behind a controlled server/agent boundary. The ingest key must never be placed in client-side code or public documentation.

## Special / platform functions

- `pgbouncer.get_auth(text)` — internal PgBouncer authentication function. Do not expose to application roles.
- `vault.create_secret(...)` / `vault.update_secret(...)` — Supabase Vault internals. Do not modify or expose as application RPCs.

## Immediate findings

1. `bump_view` and `bump_visits` are the only application functions found with anonymous execution.
2. Tenant ingest functions are service-only, which is the correct direction for cross-project ingestion.
3. Veritas collaboration RPCs are authenticated and enforce ownership inside the function; callers and policy interactions still need verification.
4. `buscar_juris` depends on `nexus.is_member`, creating an explicit dependency between tenant identity and legal/knowledge retrieval.
5. `nexus.resolve_tenant` uses an ingest key hash and must be treated as a credential-verification boundary.
6. No privilege change is made by this document.

## Next verification

For each function, trace:

`function → caller in repositories/Edge Functions → expected role → input validation → tables touched → RLS/policies → abuse boundary → classification`

The next repository-side target is TaxForge's `server/db.ts`, `server/routers.ts`, `server/storage.ts`, and workspace-permission code, followed by the Supabase `taxforge_*` policies and foreign keys.
