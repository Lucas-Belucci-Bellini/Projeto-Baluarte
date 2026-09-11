# Ecosystem — TaxForge Provider Discovery v1

## Finding

The current TaxForge main branch already contains an MCP server and a documented tool/communication surface. This makes TaxForge a **potential provider** in the future mesh, rather than a confirmed consumer of another project's capability.

The repository's current product domain includes scenario simulation, evidence, suppliers, contracts, decision support, and human review. Its current database configuration is Drizzle + MySQL/TiDB; the inspected project state does not establish an existing Supabase integration.

## Consequence for the mesh

Do not add a Supabase mesh dependency to TaxForge merely because the ecosystem uses Supabase elsewhere.

Do not assume that another project should consume TaxForge yet.

The next useful discovery is to inventory the existing MCP tools and determine whether any of them represent a stable, narrowly scoped capability that another project could legitimately consume.

## Candidate provider categories

Potential categories to inspect:

- scenario calculation
- evidence lookup / explanation
- supplier-risk analysis
- contract-risk analysis
- report generation
- data-health checks

These are **candidate categories only**. They must not become published mesh capabilities until a real consumer and stable interface are identified.

## Boundary

A future mesh adapter must expose a contract independent of TaxForge's internal database schema. Consumers must not receive arbitrary SQL access or raw internal records.

Expected direction:

```text
consumer
  -> Baluarte capability request
  -> TaxForge adapter
  -> existing TaxForge/MCP operation
  -> minimum result + provenance
```

## Current decision

`TaxForge = potential provider; consumer not yet established.`

This is a deliberate discovery result, not a failure.

## Next step

Inspect the actual MCP tool inventory and implementation, then compare each tool against the other five repositories for a concrete consumer/provider relationship. If none exists, keep discovery open and do not create mesh tables.
