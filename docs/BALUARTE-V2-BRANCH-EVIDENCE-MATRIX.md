# Baluarte V2 — Branch Evidence Matrix

> Working inventory. A branch name is never architectural authority by itself.

## Purpose

Correlate V2 branches with verifiable evidence from repository contents, commits, tests and documentation so humans and agents can navigate the V2 without manually understanding every branch.

## V2 branch families currently identified

| Branch | Initial role hypothesis | Evidence status | Next verification |
|---|---|---|---|
| `v2/ci-specialists` | CI / specialist orchestration | candidate | inspect head commit, changed paths and tests |
| `v2/ci-specialists-implementation` | CI implementation | candidate | inspect commits and workflows |
| `v2/ci-specialists-languages` | language/type CI | candidate | inspect changed paths and checks |
| `v2/ci-specialists-runtime-data` | runtime/data CI | candidate | inspect changed paths and checks |
| `v2/ci-specialists-type-hardening` | type safety / contracts | candidate | inspect commits and typecheck evidence |
| `v2/js-specialist-contract-hardening` | JS contract hardening | candidate | inspect contracts, tests and lineage |
| `v2/runtime-observability-integration` | runtime observability | candidate | inspect runtime/observability paths and tests |

## Evidence already established elsewhere

The first V2 evidence map established verified architectural evidence for:

- Runtime / Platform orchestration;
- Core Manifest → Registry → Permission → Runtime boundaries;
- CI / TypeScript type hardening;
- data/contract tooling;
- module context and storage boundaries;
- scheduler integration with module context.

These findings must be linked to individual branches only after branch-specific commit/path evidence is inspected.

## Verification protocol

For every branch:

1. resolve its current head;
2. compare against the relevant parent/baseline;
3. collect changed paths;
4. inspect relevant commits;
5. identify tests and CI checks;
6. identify documentation/ADRs;
7. assign subsystem(s);
8. assign confidence: high, medium or low;
9. record lineage/related PR when available.

## Confidence rules

**High** — implementation + tests/documentation directly support the mapping.

**Medium** — implementation strongly suggests the mapping but verification is incomplete.

**Low** — mapping is inferred primarily from names or limited metadata.

## Current conclusion

The V2 branch family is small enough to enumerate explicitly, but broad enough that branch names alone are insufficient. The next work item is branch-by-branch evidence collection, followed by the same method for `claude/*`.

## Continuation

After this matrix is populated:

1. update `docs/BALUARTE-SUBSYSTEM-MAP.md` with verified mappings;
2. update `docs/BALUARTE-BRANCH-INVENTORY.md`;
3. update `docs/ECOSYSTEM-CONTINUATION-STATE.md`;
4. only then resume TaxForge consumer/tenant analysis.
