# Baluarte — V2 Branch Evidence Map

> Evidence-first inventory for mapping V2 branches to real subsystems. Branch names are discovery signals only; commit/file/test evidence is required before treating a mapping as authoritative.

## Purpose

Turn the V2 branch family into a verifiable map:

`branch → commits → files → subsystem → capability → tests → documentation`

## Evidence matrix

| Area | Evidence signal | Architectural interpretation | Confidence |
|---|---|---|---|
| Runtime / Platform | `1f7d0ec` and related V2 runtime work | Platform orchestration, supervisor/lifecycle and runtime entrypoint integration | high |
| Core contracts | `9c3375d` | Manifest → Registry → Permission → Runtime contract boundary | high |
| CI / Type safety | `31e6512` | V2 type-checking and CI hardening without weakening compiler rules | high |
| Data / contract tooling | `5a19299` | TypeScript-aware contract/catalog generation and CI verification | high |
| Module context / storage boundary | `44b81ed` | Module capabilities delivered through constrained context instead of unrestricted global storage access | high |
| Scheduler / module runtime | `75091f` | Scheduler connected through module context/runtime boundary | high |

## Interpretation rules

1. A branch name never establishes subsystem ownership by itself.
2. A commit is architectural evidence only when its changed files and behavior support the interpretation.
3. Tests increase confidence but do not by themselves establish canonical ownership.
4. `main` remains the baseline unless the continuation state explicitly names another canonical branch.
5. Historical or agent-generated branches must not be merged into the architecture model merely because they contain useful code.

## V2 subsystem candidates

### Runtime

Current evidence supports a V2 runtime/platform layer responsible for orchestration, lifecycle and controlled module execution.

### Core contracts

Current evidence supports explicit boundaries around manifest registration, permissions and runtime execution.

### Module context

Current evidence supports capability-scoped module context, including storage access, rather than arbitrary global access.

### Data / contract tooling

Current evidence supports generated catalogs/contracts and CI validation around them. This is tooling infrastructure, not yet a final Supabase schema.

### CI / verification

Current evidence supports dedicated V2 type-checking and integration verification as part of the architecture's quality boundary.

## Not yet proven

The following must not be inferred until inspected:

- exact ownership of every `v2/*` branch;
- canonical status of individual V2 branches;
- final directory-to-subsystem mapping for every branch;
- final Supabase ownership of V2 data;
- whether any branch contains code that supersedes `main`.

## Next evidence pass

1. Enumerate every `v2/*` branch.
2. For each branch, inspect recent commits and changed paths.
3. Group branches by concrete directory/module rather than branch name.
4. Attach tests and documentation to each group.
5. Mark canonical/current/historical status only with evidence.
6. Repeat the process for `claude/*`.
7. Only after that connect Baluarte subsystems to the ecosystem data-domain map.
