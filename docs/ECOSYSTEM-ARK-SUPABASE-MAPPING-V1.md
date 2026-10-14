# ARK → Supabase / Knowledge Mesh Mapping V1

**Status:** discovery complete; implementation pending

## Purpose

This document records what was actually found in `Ark-Initiative` before any Supabase migration or cross-project integration is implemented.

## Current ARK persistence model

The ARK resilience application currently has a Drizzle schema using `mysql-core` and generated SQL migrations. The schema contains a shared `users` table plus ARK-prefixed domain tables. This means the current database model is not yet a PostgreSQL/Supabase schema and must not be copied blindly into the ecosystem database.

## Confirmed domain tables

### Identity / profile

- `users`
- `arca_profiles`
- `arca_consent_records`

### Private application data

- `arca_conversations`
- `arca_messages`
- `arca_safety_signals`
- `arca_audit_events`

### Curated/public knowledge

- `arca_evidence_cases`
- `arca_public_hazard_events`
- `arca_rescue_incident_aggregates`

The schema explicitly separates private conversations from curated evidence and public hazard data. Private conversations are not supposed to become evidence automatically.

## Supabase migration classification

| ARK data | Supabase decision | Mesh visibility |
|---|---|---|
| `users` | Do not duplicate blindly; map to ecosystem identity/auth | Internal platform contract |
| `arca_profiles` | ARK-owned table | Private to ARK unless explicitly exposed |
| `arca_consent_records` | ARK-owned table | Never a generic capability payload |
| `arca_conversations` | ARK-owned table | Private |
| `arca_messages` | ARK-owned table | Private |
| `arca_safety_signals` | ARK-owned table | Private/restricted |
| `arca_audit_events` | ARK-owned audit stream | Restricted; provenance only when authorized |
| `arca_evidence_cases` | ARK-owned evidence domain | Candidate provider capability |
| `arca_public_hazard_events` | ARK-owned public hazard cache | Strong candidate provider capability |
| `arca_rescue_incident_aggregates` | ARK-owned aggregate knowledge | Candidate provider capability |

## Important architecture decision

ARK should **not** expose its private conversation database as a general ecosystem knowledge source.

The Knowledge Mesh should consume explicit capabilities such as:

- public hazard lookup;
- curated evidence lookup;
- published rescue-history aggregate lookup;
- future ARK risk-analysis capabilities once implemented and contract-tested.

A consumer should receive a capability result, not direct database access.

## Migration concerns

The current schema uses MySQL-specific Drizzle primitives (`mysqlTable`, `mysqlEnum`, `mysql-core`) and generated MySQL SQL. The target ecosystem standard is PostgreSQL/Supabase.

Therefore migration requires an explicit PostgreSQL design pass for:

1. enum representation;
2. identity/auth mapping;
3. foreign-key relationships;
4. RLS policies;
5. JSON/geometry representation;
6. geospatial indexing;
7. audit/provenance boundaries;
8. retention/expiry behavior;
9. public-versus-private data exposure.

Do **not** simply rename MySQL tables or run the existing migrations against Supabase.

## First Mesh candidates

### `ark.hazards.list_public`

Provider: ARK

Input: bounded geographic/time/filter query.

Output: public hazard records plus source, observed time, source URL, and ingestion/provenance metadata.

Privacy: no user positions, conversations, or private operational data.

### `ark.evidence.search`

Provider: ARK

Input: topic/environment/query filters.

Output: published evidence cases and provenance.

Privacy: only curated published evidence.

### `ark.rescue_history.aggregate`

Provider: ARK

Input: category/scope/time window.

Output: aggregate counts and coverage metadata.

Privacy: aggregate data only.

These are **candidate capabilities**, not yet registered capabilities. They require implementation and contract tests before entering the Baluarte Capability Registry.

## What remains to inspect

- ARK application code consuming these tables;
- current database connection/runtime configuration;
- authentication flow;
- API/server procedures exposing the data;
- existing RLS-equivalent authorization boundaries;
- DailyPlanner direct repository inspection;
- AEGIS implementation maturity;
- TaxForge ↔ Veritas consumer/provider matching.

## Continuation checkpoint

**Next:** inspect ARK runtime/API consumers → design PostgreSQL/Supabase schema mapping → identify the first ARK capability contract → compare it against TaxForge/Veritas consumers.

Do not create Supabase production tables until this mapping is reviewed and the ownership/visibility boundaries are explicit.
