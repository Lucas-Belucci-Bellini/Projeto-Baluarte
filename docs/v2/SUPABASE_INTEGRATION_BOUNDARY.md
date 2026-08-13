# Supabase Integration Boundary

## Purpose

This document records what the V2 Runtime may assume about the currently connected Supabase project without coupling the Runtime to a database implementation that has not yet been approved.

## Observed project surface

The connected project is healthy and already contains RLS-enabled tables for profiles, memories, tenants, tenant_members, events, communications, knowledge, and domain data.

Relevant runtime-facing concepts include:

- `auth.users` as the identity authority.
- `profiles` as user-owned profile state.
- `tenants` and `tenant_members` as the multi-tenant boundary.
- `nucleo_events` as an event-oriented persistence surface.
- `memories` as persisted memory state.

## Boundary rules

1. Runtime lifecycle state remains local to the Runtime until a persistence contract is explicitly defined.
2. Supabase is an integration dependency, not the source of truth for in-process lifecycle transitions.
3. A database outage must not make the Runtime state machine itself undefined.
4. Persistence of lifecycle events may be asynchronous and must not block a critical state transition unless a future contract explicitly says otherwise.
5. Tenant identity and authorization belong at the integration boundary; Runtime modules must not infer authorization from arbitrary database rows.
6. Existing `SECURITY DEFINER` functions must not be changed solely to satisfy V2 without first tracing their callers and intended trust boundary.

## Current dependency candidates

These are candidates, not implementation commitments:

```text
Runtime Core
  ├── Auth adapter       -> auth.users / session
  ├── Tenant adapter     -> tenants / tenant_members
  ├── Event sink         -> nucleo_events
  └── Memory adapter     -> memories
```

The adapters should expose narrow interfaces so that the Runtime can be tested without a live Supabase connection.

## Deferred until integration review

- exact Auth/session contract;
- tenant membership authorization policy;
- Realtime delivery semantics;
- retry/idempotency rules for event persistence;
- treatment of database outages;
- review and hardening of existing `SECURITY DEFINER` functions;
- migration ownership between V1 and V2.

## Why this exists

The Runtime work can continue independently while preserving a clean seam for the Supabase integration. This prevents database details from leaking into the state machine, dependency graph, and lifecycle supervisor.
