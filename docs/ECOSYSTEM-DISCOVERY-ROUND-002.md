# Ecosystem Discovery Round 002

Date: 2026-08-17

## Result

No new cross-project capability is promoted to the production registry in this round.

The repository/code search performed across TaxForge, ARK, DailyPlanner, AEGIS, Baluarte and Veritas did not produce enough evidence to establish a concrete consumer + provider + stable interface pair.

This is an intentional negative result, not a blocker caused by missing mesh tables.

## Decisions

- Do not create generic mesh tables merely to demonstrate interoperability.
- Do not expose internal RPCs, MCP operations, SQL tables, or implementation details as cross-project capabilities.
- Keep DailyPlanner client-side until synchronization/multi-user requirements actually appear.
- Keep Veritas capabilities domain-owned until a real consumer is identified.
- Keep AEGIS as a promising investigation capability, but do not publish it until a stable provider interface exists.
- Preserve ARK's public/private data boundary before considering any capability.
- Treat Baluarte as the architectural control plane, not as the owner of every project's domain data.

## Discovery priority for the next round

1. Inspect TaxForge's actual application/service boundaries for external knowledge or computation requests.
2. Inspect ARK's concrete public data/analysis interfaces for reusable capabilities.
3. Inspect AEGIS implementation beyond prompt/specification material for a callable interface.
4. Inspect Baluarte's existing event/task/data contracts for reusable platform primitives.
5. Re-check Veritas only against a concrete consumer need.

## Promotion gate

A capability may move toward implementation only when all are documented:

- consumer project;
- provider project;
- concrete use case;
- provider interface already present or implementation plan approved;
- authorization boundary;
- minimum request/response contract;
- provenance requirements;
- failure/fallback behavior;
- no unnecessary exposure of provider internals.

## Exact continuation

Next conversation: open `docs/ECOSYSTEM-CONTINUATION-STATE.md`, then this document, then begin with **TaxForge service-boundary discovery**. Do not create Supabase mesh migrations until the promotion gate is satisfied.
