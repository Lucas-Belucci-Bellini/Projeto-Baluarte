# Ecosystem TaxForge MCP Discovery v1

## Verified provider surface

TaxForge currently exposes an MCP server named `taxforge-ops`.

The verified tools are:

- `repository_audit` — read-only repository inspection.
- `roadmap_status` — reads product roadmap and dependencies.
- `coverage_report` — reads latest coverage summary.
- `run_quality_gate` — guarded execution; requires `execute=true` and can write build/coverage artifacts.
- `run_e2e` — guarded browser execution; requires `execute=true` and can write diagnostics.
- `vercel_diagnose` — reads deployment diagnosis.
- `checkpoint_summary` — reads the final validation report.

The server also exposes roadmap, coverage, and Vercel audit resources and a `checkpoint_review` prompt.

## Security characteristics relevant to the ecosystem

- Repository paths are constrained to a configured allowlist.
- Mutating/executing operations are disabled by default and require explicit `execute=true`.
- The MCP surface is currently an operations/checkpoint interface, not a general domain-data API.
- No evidence was found in this discovery that the current MCP server is designed to serve TaxForge domain knowledge to other projects.

## Ecosystem decision

Do **not** register the current MCP tools as cross-project capabilities yet.

They are primarily TaxForge operational capabilities. Publishing them to the ecosystem would create unnecessary coupling and could expose execution-oriented functionality where read-only domain knowledge is required.

## Candidate direction

If TaxForge later exposes a deliberately designed read-only domain capability, it can become a provider. The capability must:

1. have a concrete consumer in another project;
2. return a minimal contract rather than internal database rows;
3. enforce tenant/authorization boundaries;
4. include provenance;
5. avoid exposing command execution or repository mutation;
6. be independently testable from the TaxForge MCP implementation.

## Next investigation

Compare the verified TaxForge MCP surface with ARK, AEGIS, Baluarte and Veritas capabilities. Look for a real consumer/provider pair before creating `ecosystem_capabilities` tables.
