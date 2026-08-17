# Ecosystem Capability Inventory v1

Status: working inventory — evidence-first

## Rule

Only capabilities confirmed in repository code/docs are marked `CONFIRMED`. Ideas are `PLANNED` and are not eligible for the first Capability Registry.

## Confirmed

### TaxForge
- Autonomous/MCP integration layer: `CONFIRMED`
- Evidence/context/decision-oriented tax analysis: `CONFIRMED`
- Candidate role: provider and consumer
- Evidence: repository MCP server/documentation and product architecture

### AEGIS
- Autonomous repository investigation and software problem solving: `CONFIRMED`
- Investigation workflow: observe → understand → investigate → prove → repair → test → verify → document: `CONFIRMED`
- Candidate role: provider of engineering investigation/diagnostic capabilities
- Evidence: README specification

### Veritas
- Boolean logic / truth-table / circuit analysis domain: `CONFIRMED`
- Supabase-backed synchronization and collaboration: `CONFIRMED`
- MCP interface: previously confirmed in repository review; exact currently exposed tool contract still requires source-level inventory
- Candidate role: provider of deterministic logic capabilities

### ARK Initiative
- Domain: resilience/environmental project: `CONFIRMED` from repository context
- Mesh capability status: `UNCONFIRMED`
- Candidate role: future provider/consumer
- Do not register a capability until an actual exposed interface is identified.

### DailyPlanner
- Planner/task domain: `CONFIRMED` from repository context
- Mesh capability status: `UNCONFIRMED`
- Candidate role: future consumer/provider
- Current local-first behavior must not be replaced by a shared database merely to enable the Mesh.

### Projeto-Baluarte
- Platform/orchestration/data-layer role: `CONFIRMED`
- Ecosystem documentation/continuation state: `CONFIRMED`
- Candidate role: registry, authorization, routing, provenance and coordination layer
- Baluarte should not become owner of every project's private domain data.

## First real cross-project candidate

`veritas.logic.evaluate` remains the strongest candidate because Veritas has a deterministic logic domain and other projects can consume computation without importing or reimplementing the internal engine.

However, it is **not yet registered**. The exact Veritas input/output contract and a real consumer must be identified first.

## Consumer/provider matching status

| Capability | Provider | Consumer | Status |
|---|---|---|---|
| veritas.logic.evaluate | Veritas | TBD | VALIDATION_REQUIRED |
| veritas.logic.truth_table | Veritas | TBD | VALIDATION_REQUIRED |
| aegis.repository.investigate | AEGIS | TBD | VALIDATION_REQUIRED |
| tax.mcp.* | TaxForge | TBD | VALIDATION_REQUIRED |
| ark.* | ARK | TBD | NOT_EXPOSED |
| planner.* | DailyPlanner | TBD | NOT_EXPOSED |

## Do not build yet

Do not create `ecosystem_capabilities`, grants, requests or results until at least one row has:

1. confirmed provider;
2. confirmed consumer;
3. concrete interface;
4. stable minimum input/output contract;
5. authorization boundary;
6. provenance requirements.

## Next action

Inspect Veritas source-level MCP/tool definitions and identify one concrete consumer in TaxForge, AEGIS, ARK, DailyPlanner or Baluarte. If no real consumer exists, keep the candidate unregistered and continue the inventory.
