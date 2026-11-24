# Baluarte Architecture Index

> Operational map for navigating a repository with a large branch and subsystem history. This is an engineering index, not a replacement for Git history.

## Why this exists

The Baluarte repository has **293 branches currently indexed by GitHub**. A human should not be expected to understand the entire project by manually opening branches one by one.

This index establishes the rule that the Baluarte itself must maintain a machine-readable navigation layer for its own complexity.

## Current branch inventory

- Total branches observed: **293**
- Main branch: `main`
- V2-related branches include `v2-integration`, `v2-sync-current`, `v2-sync-runtime-fix`, `v2/ci-specialists`, `v2/ci-specialists-implementation`, `v2/ci-specialists-languages`, `v2/ci-specialists-runtime-data`, `v2/ci-specialists-type-hardening`, `v2/js-specialist-contract-hardening`, and `v2/runtime-observability-integration`.
- Ecosystem documentation branches include `docs/ecosystem-knowledge-mesh-masterplan` and `docs/taxforge-domain-spec`.
- The repository also contains many historical `backup/*`, `claude/*`, `vendor/*`, `feature/*`, `fix/*`, and `fase-*` branches.

## Branch classification

Branches must be interpreted by role, not merely by name:

1. **main** — current integration reference.
2. **V2** — active architecture/runtime rebuild work.
3. **docs** — architecture and planning artifacts.
4. **feature/fix/chore** — focused development work.
5. **claude/** — agent-generated or agent-assisted work; inspect before treating as authoritative.
6. **backup/** — historical recovery points; never treat as current architecture without verification.
7. **vendor/** — imported/experimental external material; not automatically part of the product architecture.
8. **fase-*** — historical phase branches; require verification against main before reuse.

## Source-of-truth hierarchy

When branch contents disagree, use this order:

1. Current `main` implementation and tests.
2. Explicit architecture documents under `docs/`.
3. Active V2 contracts and integration specifications.
4. Current feature/fix branches when their PR is still active.
5. Historical/backup branches only as recovery or evidence.

A branch is **not** authoritative merely because it contains more code.

## V2 target architecture

The current V2 architectural reference is
[`docs/architecture/v2/arquitetura-alvo.md`](architecture/v2/arquitetura-alvo.md),
derived from issues #540 and #539 and from ADRs 001–009. It separates confirmed
decisions (✅), proposals (🟣), pending items (🟡) and open conflicts (⛔). Do not
treat proposals in that document — including the recommended stack in #540 §15 —
as approved architecture.

D5, D6 and D7 were approved explicitly by the owner on 2026-11-24 and are now
closed as [ADR-007](architecture/decisions/ADR-007-dois-nucleos-core-orquestracao-host-runtime.md)
(two nuclei), [ADR-008](architecture/decisions/ADR-008-execucao-hibrida-por-fronteiras-de-processo.md)
(hybrid execution) and [ADR-009](architecture/decisions/ADR-009-comunicacao-por-fronteira.md)
(communication per boundary). D8 (persistence) and D13 (shell) remain open.

The V1 freeze point is the release `v1.3.8`, identified by commit
`7cce9d42bf756afcb1feffb7e05a4e87f0020616`, formalized on 2026-11-24 in
[ADR-010](architecture/decisions/ADR-010-ponto-de-congelamento-efetivo-da-v1.md).
The historic `1.0.0` was never published and no retroactive tag is created. The
release's eight assets are tied to that commit by a workflow run whose
`head_sha` matches it — strongly indicated, not cryptographically proven; the
release object itself predates the run and its authorship is unidentified.

Four supporting documents record how that decision was reached. None of them is
a decision, and none overrides the ADRs:

- [`analise-decisoes-d5-d6-d7.md`](architecture/v2/analise-decisoes-d5-d6-d7.md) —
  long-form technical study: alternatives, four complete architectures, estimated
  versus measured costs, falsification criteria, and what still needs measuring.
- [`auditoria-evidencias-d5-d6-d7.md`](architecture/v2/auditoria-evidencias-d5-d6-d7.md) —
  independent audit of that evidence: benchmarks re-run and classified, prototype
  status (implemented / tested / integrated) verified, ARQ-1 checked axis by axis.
- [`plano-prontidao-arq1.md`](architecture/v2/plano-prontidao-arq1.md) — readiness
  plan: the seven audit adjustments mapped to verifiable criteria, architectural
  approval separated from operational readiness, and gates P0–P5 per stage.
- [`proposta-core-e-fronteiras.md`](architecture/v2/proposta-core-e-fronteiras.md) —
  decision dossier with options, recommendation and the draft that preceded the
  ADRs.

Read the study for *why*, the audit for *how far the evidence actually goes*, the
readiness plan for *what must be true before each stage*, and the dossier for
*which alternatives were weighed*. Approval of ADR-007/008/009 did not complete
any operational requirement: Windows coverage, process supervision, cross-platform
shutdown, the Python worker distribution and packaging remain to be built, under
gates P1–P5.

## Ecosystem navigation

The Baluarte coordinates these repositories:

- `Lucas-Belucci-Bellini/taxforge`
- `Lucas-Belucci-Bellini/Ark-Initiative`
- `Lucas-Belucci-Bellini/DailyPlanner`
- `Lucas-Belucci-Bellini/AEGIS`
- `Lucas-Belucci-Bellini/Projeto-Baluarte`
- `Lucas-Belucci-Bellini/Veritas`

The ecosystem masterplan is the architectural starting point:

`docs/ECOSYSTEM-KNOWLEDGE-MESH-MASTERPLAN.md`

The continuation state is the operational starting point:

`docs/ECOSYSTEM-CONTINUATION-STATE.md`

## Required future map

The next iteration of this index should become generated/verified automatically and should include:

- branch -> purpose;
- branch -> base commit;
- branch -> latest commit;
- branch -> PR;
- branch -> status (active/historical/merged/stale);
- subsystem -> source paths;
- subsystem -> tests;
- subsystem -> owning project;
- subsystem -> Supabase domain;
- subsystem -> external integrations;
- architecture document -> implementation paths.

## Rule for future agents

An agent working on Baluarte must not infer architecture from a random branch. It must first read:

1. this file;
2. `docs/ECOSYSTEM-CONTINUATION-STATE.md`;
3. `docs/architecture/v2/arquitetura-alvo.md` (V2 target architecture; check the decided/proposed/pending marks);
4. `docs/ECOSYSTEM-KNOWLEDGE-MESH-MASTERPLAN.md`;
5. the relevant domain specification;
6. the current `main` implementation.

Then it may inspect historical or feature branches when needed.

## Next action

Build the **branch-to-subsystem inventory** and connect it to the ecosystem continuation state. The objective is to make the repository navigable by an AI or developer without manually understanding hundreds of branches.

Last verified: 2026-11-24.
