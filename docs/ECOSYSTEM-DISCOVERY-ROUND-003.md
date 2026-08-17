# Ecosystem Discovery — Round 003

Date: 2026-08-17

## Scope

Continue discovery across TaxForge, ARK, DailyPlanner, AEGIS, Baluarte and Veritas before creating physical Mesh tables or cross-project database dependencies.

## Findings

### TaxForge

The current project document confirms a real domain around economic/tax-reform simulation, scenarios, evidence, suppliers, contracts, decisions and an existing MCP server. Its current database is Drizzle + MySQL/TiDB; Supabase is not currently integrated in the analyzed code. Therefore Supabase must not be introduced into TaxForge merely to make the ecosystem uniform.

The MCP operations observed so far are primarily TaxForge operational capabilities (repository audit, roadmap/status, quality gates, E2E, Vercel diagnosis and checkpoint reporting). They are not automatically ecosystem capabilities.

### ARK

ARK remains a promising provider candidate because it has a distinct hazards/evidence/public-data domain and a private ARCA boundary. The public/private boundary must remain intact. No capability is promoted until a concrete external consumer and a stable provider interface are identified.

### AEGIS

AEGIS has a strong investigation lifecycle, but the current repository evidence does not yet establish a stable provider API/MCP that other projects can consume. Treat it as a capability design candidate, not a production provider.

### Veritas

Veritas has verified logic/circuit MCP capabilities. No concrete consumer among the current projects has yet been established, so they remain domain-local capabilities.

### DailyPlanner

DailyPlanner remains intentionally client-side. Do not create Supabase persistence for the Mesh until there is a real synchronization/multi-user requirement.

### Baluarte

Baluarte remains the control-plane and architectural coordination point. It should own contracts, capability metadata, authorization boundaries, requests/results and provenance for the Mesh, but not the private domain data of every project.

## Decision

No Mesh database migration is justified yet. Continue discovery by looking for existing interfaces and real flows rather than inventing integrations.

## Exact next investigation

1. Inspect ARK application services/routes/data access and identify externally useful, non-private outputs.
2. Inspect AEGIS implementation beyond its specification and identify any callable interface.
3. Inspect Baluarte existing event/task/data-layer primitives for reusable platform capabilities.
4. Compare those findings against concrete needs already present in TaxForge and Veritas.
5. If a real consumer/provider pair is found, document the minimum contract, authorization and provenance before implementing it.
6. If no pair is found, record the negative result and continue discovery without adding tables.

## Continuation rule

Future conversations must start from `docs/ECOSYSTEM-CONTINUATION-STATE.md` and this round. Do not assume that a candidate capability is valid merely because a project contains a related table, RPC, MCP tool or concept.
