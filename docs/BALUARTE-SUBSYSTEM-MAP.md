# Baluarte — Subsystem Map

> Working map for navigating the repository without requiring a human or AI to understand hundreds of branches manually.

## Purpose

This map connects branch families to architectural areas. It is an engineering index, not a replacement for Git history.

## Current branch families observed

| Family | Examples | Initial interpretation | Confidence |
|---|---|---|---|
| `v2/*` | `v2/ci-specialists`, `v2/ci-specialists-runtime-data`, `v2/js-specialist-contract-hardening`, `v2/runtime-observability-integration` | V2 architecture, CI, contracts and runtime work | high |
| `claude/*` | `claude/git-nexus-m3c-engine`, `claude/gitnexus-fase2-lazy-symbols`, `claude/omega-prism`, `claude/vanguard-sync-motor` | Agent-generated or agent-assisted work across multiple subsystems | medium |
| `feature/*` | `feature/login-cadastro`, `feature/login-cadastro-v2` | Feature work | high |
| `fix/*` | `fix/terminal-cd`, `fix/tipos-v2` | Corrections | high |
| `backup/*` | backup branches | Historical/recovery points | medium; inspect before archival |

## Known subsystem signals

### V2 core / contracts / runtime

Signals include:

- `v2/ci-specialists*`
- `v2/js-specialist-contract-hardening`
- `v2/runtime-observability-integration`
- `fix/tipos-v2`
- `claude/baluarte-v2-fachada-pr-*`
- `claude/baluarte-pre-1-0-0-*`

These should be correlated with the V2 documentation and current `main` before implementation decisions.

### GitNexus / repository intelligence

Signals include:

- `claude/git-nexus-m3c-engine`
- `claude/git-nexus-m3d-tools`
- `claude/gitnexus-fase2-lazy-symbols`
- `claude/nexus-config-refactor-*`

These are candidates for the repository-understanding/indexing subsystem.

### ARMA 3 / domain data

Signals include:

- `claude/arma3-*`
- `claude/wiki-arma3`
- `claude/wiki-icones`

These should remain separate from core V2 architecture unless documentation proves a dependency.

### Integrations / external systems

Signals include:

- `claude/projeto-baluarte-integrations-*`
- `claude/vanguard-sync-motor`
- `claude/obsidian-vault-database-*`

These require explicit contract review before being considered part of the canonical architecture.

### UI / presentation

Signals include:

- `claude/baluarte-briefing-v2-render-*`
- `claude/redesign-*`
- `feature/login-cadastro*`

Do not infer runtime/data ownership from UI branch names alone.

## Navigation rule

When an agent needs to modify the Baluarte:

1. Read `docs/ECOSYSTEM-CONTINUATION-STATE.md`.
2. Read `docs/ARCHITECTURE-INDEX.md`.
3. Read this subsystem map.
4. Treat `main` as the baseline unless the continuation state explicitly identifies another canonical branch.
5. Identify the subsystem before selecting a feature/Claude/backup branch.
6. Inspect the branch's commits and files before relying on its contents.
7. Record important discoveries back into this map or the continuation state.

## Important distinction

A branch family is **not** automatically an architectural subsystem. Names are evidence, not truth. A branch becomes part of a subsystem map only after its contents, lineage, documentation and tests are inspected.

## Next inventory work

- [ ] enumerate all branch families with pagination
- [ ] inspect branch lineage and recent commits
- [ ] map V2 branches to concrete directories/modules
- [ ] map GitNexus branches to concrete implementation
- [ ] identify canonical branches and obsolete branches
- [ ] connect subsystems to existing tests
- [ ] connect subsystems to data domains
- [ ] connect data domains to future Supabase schemas

## Ecosystem connection

The eventual data map will connect:

`Baluarte subsystem → domain → Supabase schema → tables → RLS → events → external references`

No direct cross-project database access should be inferred from this map.
