# Ecosystem — Veritas Provider Contract v1

Status: VERIFIED PROVIDER / CONSUMER NOT YET CONFIRMED
Date: 2026-08-16

## Purpose

Record the capabilities that the Veritas repository demonstrably exposes through its MCP server. This document is a provider inventory only; it does not authorize cross-project access and does not create Mesh tables.

## Verified interface

The Veritas MCP server (`mcp/src/server.ts`) registers these tools:

- `truth_table`
- `evaluate_expression`
- `simplify_expression`
- `normal_forms`
- `logic_case`
- `propositional_truth_table`
- `debug_algorithm`
- `karnaugh_map`
- `simulate_circuit`
- `list_chips`
- `get_chip`

The underlying implementation is in `mcp/src/tools.ts` and imports the Veritas logic, algorithm, chip and simulation engines.

## Strongest capability candidates

### `veritas.logic.evaluate`

Provider operation: `evaluate_expression`.

Minimum conceptual input:

```json
{
  "expression": "string",
  "values": {"A": true, "B": false}
}
```

The current provider returns a textual result including the evaluated expression and intermediate subexpressions. A Mesh adapter should normalize this into a stable structured contract instead of exposing the internal `ToolResult` shape.

### `veritas.logic.truth_table`

Provider operation: `truth_table`.

Conceptual input includes an expression, notation, whether intermediate steps are requested, and a row ceiling. The provider itself caps the requested rows.

### `veritas.logic.simplify`

Provider operation: `simplify_expression`.

Conceptual input is an expression plus notation. The provider returns the original/minimized forms and operator counts.

### `veritas.logic.karnaugh`

Provider operation: `karnaugh_map`.

Conceptual input is an expression plus notation. The provider is limited to 1–4 variables.

### `veritas.circuit.simulate`

Provider operation: `simulate_circuit`.

This is a richer stateful capability involving components and simulation steps. It should not be the first Mesh capability until its result contract and resource limits are explicitly defined.

## Security / boundary

- The MCP server uses stdio transport in `server.ts`.
- The Mesh must not expose the provider's internal file paths, database schema, or implementation details.
- A future Baluarte adapter must validate identity, tenant/context and capability grant before invoking the provider.
- Provider-domain authorization remains owned by Veritas.
- Results crossing the Mesh must carry provenance and a bounded result shape.

## Consumer status

No repository has yet been proven to be a real consumer of these Veritas capabilities. Repository search did not establish that TaxForge currently needs Boolean evaluation or truth-table computation.

Therefore:

`veritas.logic.evaluate` = VERIFIED PROVIDER / VALIDATION_REQUIRED CONSUMER

It is not yet eligible for a production Capability Registry entry.

## Next exact action

Inspect AEGIS, TaxForge, ARK, DailyPlanner and Baluarte for a concrete workflow that would consume one of these verified operations. If no real consumer exists, continue capability discovery instead of manufacturing a dependency.
