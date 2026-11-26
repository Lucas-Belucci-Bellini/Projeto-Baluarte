# Baluarte — Explicit Continuation Checkpoint

> Read this file first when resuming the ecosystem work.

## Current phase

Capability discovery. **Do not create mesh tables or Supabase migrations yet.**

## Latest verified finding

TaxForge has an existing MCP surface and a strong domain around scenarios, evidence, suppliers, contracts, decision support, and human review. Its current database configuration is Drizzle + MySQL/TiDB, not an established Supabase integration.

Therefore:

- TaxForge is a potential provider.
- No concrete consumer of a TaxForge capability has been proven yet.
- No external capability should be forced into TaxForge.
- No Supabase dependency should be added to TaxForge just for the ecosystem.

## Immediate next action

1. Inspect the actual TaxForge MCP tool inventory and implementations.
2. Classify each tool as internal-only, candidate-provider, or not relevant to the mesh.
3. Compare candidate tools against ARK, DailyPlanner, AEGIS, Baluarte, and Veritas for a real consumer.
4. Prefer an existing interface over creating a new API.
5. Require consumer + provider + stable interface + authorization + minimum payload before publishing a capability.
6. If no pair is proven, continue discovery rather than creating infrastructure for demonstration.

## After the first real pair

`consumer need -> capability contract -> provider adapter -> authorization -> minimum result -> provenance -> registry -> request/result storage -> non-destructive migration`

## Permanent architecture rule

Baluarte is the control plane/gateway and architectural source of truth. Project databases remain domain-owned. Cross-project communication happens through explicit contracts/capabilities, never arbitrary SQL access.

## Relevant files

- `docs/ECOSYSTEM-CONTINUATION-STATE.md`
- `docs/ECOSYSTEM-INTELLIGENCE-MESH.md`
- `docs/ECOSYSTEM-MESH-SCHEMA-NEXT.md`
- `docs/ECOSYSTEM-MESH-CONTRACTS-V1.md`
- `docs/ECOSYSTEM-VERITAS-PROVIDER-CONTRACT-V1.md`
- `docs/ECOSYSTEM-TAXFORGE-PROVIDER-DISCOVERY-V1.md`
- `docs/SUPABASE-IDENTITY-TENANT-AUDIT.md`
- `docs/SUPABASE-RPC-BODY-AUDIT-V1.md`
- `docs/SUPABASE-RLS-GRANTS-AUDIT-V1.md`
