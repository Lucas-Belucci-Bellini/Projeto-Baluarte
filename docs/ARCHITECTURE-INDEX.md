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
3. `docs/ECOSYSTEM-KNOWLEDGE-MESH-MASTERPLAN.md`;
4. the relevant domain specification;
5. the current `main` implementation.

Then it may inspect historical or feature branches when needed.

## Next action

Build the **branch-to-subsystem inventory** and connect it to the ecosystem continuation state. The objective is to make the repository navigable by an AI or developer without manually understanding hundreds of branches.

Last verified: 2026-08-16.
