# Ecosystem Capability Candidate 001

## Candidate

`tax.jurisprudence.search`

## Why this is the first candidate

The current Supabase already contains `juris_doutrina` with tenant isolation and a bounded `buscar_juris(...)` RPC. This gives us a real capability candidate without inventing a cross-project data model.

## Important boundary

This is only a capability specification. It does **not** grant TaxForge access to Veritas or any other project's tables, and it does not create mesh tables yet.

The capability contract should return the minimum useful result rather than the provider's internal row shape.

### Request

```json
{
  "query": "string",
  "tenant_context": "authorized tenant",
  "limit": 1
}
```

### Result concept

```json
{
  "items": [
    {
      "reference": "opaque provider reference",
      "title": "string",
      "type": "string",
      "court": "string|null",
      "summary": "string",
      "relevance": 0.0
    }
  ],
  "provider": "veritas",
  "capability": "tax.jurisprudence.search",
  "provenance": []
}
```

The exact result fields remain subject to provider review.

## Authorization contract

Before a future request is accepted:

1. caller is authenticated;
2. caller has membership in the requested tenant;
3. caller is authorized to use the capability;
4. provider verifies its own domain authorization;
5. result is filtered to the authorized tenant;
6. provider returns only the contract fields;
7. provenance identifies the provider and source without exposing private implementation details.

## Why not direct RPC exposure

`buscar_juris(...)` is an internal provider implementation. The mesh should call a provider adapter/contract rather than expose the RPC name and database schema as a public ecosystem API.

## Next implementation blocker

Before creating `ecosystem_capabilities`, inspect the actual TaxForge and Veritas repository code paths that would consume/provide this capability. Confirm that jurisprudence is genuinely useful to TaxForge and that the provider ownership is correct. If not, discard this candidate and choose another real capability.

## Continuation

After provider validation:

`candidate -> provider contract -> capability registry -> grant -> request -> result -> provenance`
