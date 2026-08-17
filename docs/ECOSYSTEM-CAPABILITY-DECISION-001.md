# Ecosystem Capability Decision 001

## Decision

Reject `tax.jurisprudence.search` as the first cross-project capability for now.

## Reason

Repository validation did not establish that TaxForge currently consumes jurisprudence as a domain capability, nor that Veritas is the owner of jurisprudence. The Veritas repository is primarily a logic/circuit engine with Supabase cloud synchronization, while the TaxForge README centers on Brazilian tax-reform simulation, margins, costs, prices, contracts, suppliers, evidence, scenarios, and human review.

The existing `juris_doutrina` / `buscar_juris` objects in the inspected Supabase project therefore cannot, by themselves, prove that a TaxForge <-> Veritas capability exists.

## Architectural consequence

Do not build a mesh capability around an accidental database table. A capability must originate from a real domain responsibility of a project and a real consumer need in another project.

## New selection rule

For every candidate:

1. Identify the consumer project and its concrete code/use case.
2. Identify the provider project and its concrete domain responsibility.
3. Confirm both repositories contain evidence for the relationship.
4. Define the smallest useful contract.
5. Only then create a registry entry or database object.

## Next search

Find a capability that is clearly shared between the current repositories. Prioritize:

- Baluarte platform services used by another project;
- AEGIS engineering/investigation evidence consumed by Baluarte;
- DailyPlanner task/reminder capabilities consumed by another project;
- Veritas logic/verification capabilities consumed by AEGIS or Baluarte;
- TaxForge evidence/scenario outputs consumed by another project.

The first capability does not have to be TaxForge <-> Veritas. The correct first link is more important than the first link being ambitious.
