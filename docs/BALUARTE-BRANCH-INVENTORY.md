# Baluarte — Branch Inventory

## Purpose

The Baluarte repository has a very large branch history. This document is the first classification layer so humans and agents can navigate it without treating every branch as an active architectural component.

## Current observed structure

The repository currently contains hundreds of branches. A large visible family is `backup/*`, with branches named after dates, PR snapshots, feature experiments, redesigns, integrations, and migration points.

Representative families observed:

- `backup/*` — historical snapshots and pre-merge checkpoints
- `antigravity/*` — specialized experimental work
- `arma3-*` — Arma 3 data/content work
- `Redesign-*` — visual/product redesign work
- feature-specific branches — isolated implementation work

## Classification rules

### 1. Canonical

Branches that define the current product baseline, normally `main` and explicitly designated release branches.

### 2. Active development

Branches containing current implementation work that is intended to become part of the product.

### 3. Experimental

Branches used to test an architectural, UI, data, AI, or integration idea. They must not be treated as authoritative without comparison against the canonical baseline.

### 4. Historical / backup

Branches under `backup/*` or equivalent historical naming. These are evidence of previous states, not automatically active code.

### 5. Content / domain

Branches focused on a specific content domain such as Arma 3 data, fan-fiction, catalogs, or other product datasets.

### 6. Infrastructure / integration

Branches involving GitNexus, AI systems, APIs, Supabase, Vercel, desktop/runtime infrastructure, or other platform capabilities.

## Agent navigation policy

An agent entering the repository must NOT infer architecture from branch count alone and must NOT merge or copy a random branch into `main`.

Required order:

1. Read `docs/ECOSYSTEM-CONTINUATION-STATE.md`.
2. Read `docs/ECOSYSTEM-KNOWLEDGE-MESH-MASTERPLAN.md`.
3. Read this inventory.
4. Inspect `main` as the canonical baseline.
5. Classify relevant branches by prefix, purpose, and relationship to the baseline.
6. Compare code before treating an old branch as an architectural source.
7. Record important discoveries in the Baluarte documentation.

## Future inventory format

The inventory should progressively evolve toward a machine-readable registry with:

- branch name
- category
- subsystem
- status
- base lineage
- last relevant commit
- owner/agent
- related PR
- related documentation
- related tests
- related Supabase domain
- whether it is safe to use as an architectural reference

## Important distinction

The branch inventory is a navigation system, not a replacement for Git history. It exists to reduce cognitive load and prevent agents from treating historical experiments as current architecture.

## Next step

Build the machine-readable branch registry and classify the major branch families before attempting broad cleanup or deletion. Do not delete historical branches merely to reduce the count.
