# HA-Matter Cog Packaging

Build / sign / upload pipeline for `cog-ha-matter`, mirroring the
[`cog-pose-estimation`](../../cog-pose-estimation/cog/) precedent so the
Seed runtime treats both cogs identically.

See [ADR-100 — Cog Packaging Specification](../../../../docs/adr/ADR-100-cog-packaging-specification.md)
and [ADR-116 — HA-Matter Seed Cog](../../../../docs/adr/ADR-116-cog-ha-matter-seed.md).

## What this cog does

Wraps the ADR-115 HA-DISCO + HA-MIND MQTT publisher as a Seed-installable
artifact with:

- mDNS auto-discovery (`_ruview-ha._tcp`)
- Ed25519-signed witness chain for tamper-evident audit logs
- Privacy-mode flag (only semantic primitives, no biometrics)
- One-flag deferral to v0.7 for the embedded broker / v0.8 for the Matter Bridge

## Layout

| File | Purpose |
|---|---|
| `manifest.template.json` | Build-time manifest with `{{VERSION}}` / `{{ARCH}}` slots; `make manifest` substitutes them |
| `Makefile` | `build` / `sign` / `upload` / `release` / `verify` / `clean` targets |
| `dist/` | Created by `make build`; gitignored, holds release binaries + sha256 + sig |

## Local build (dry-run)

```sh
cd v2/crates/cog-ha-matter/cog
make build          # builds aarch64 + x86_64 release binaries
make sign           # writes .sha256 + (TODO) .sig sidecars
make manifest       # prints the manifest the Seed would record
```

`make sign` is currently a no-op for the signature itself — the
`COGNITUM_OWNER_SIGNING_KEY` provisioning is the same TODO that
blocks [`cog-pose-estimation`](../../cog-pose-estimation/cog/Makefile).
Until then, dev cogs ship unsigned and `app-registry.json` lists
them with `"binary_signature": ""`.

## Upload (requires `gcloud auth`)

```sh
gcloud auth login
make upload         # gsutil cp dist/* gs://cognitum-apps/cogs/{arch}/
```

The GCS bucket is shared with `cog-pose-estimation` and is part of
the `cognitum-apps` project. Write access requires membership in the
`cog-publishers` IAM group.

## app-registry.json

Lives in the [`cognitum-one`](https://github.com/ruvnet/cognitum-one)
repo, **not here**. After `make upload` succeeds, file a PR there
that appends:

```json
{
  "id": "ha-matter",
  "version": "<the version make manifest printed>",
  "binary_url": "https://storage.googleapis.com/cognitum-apps/cogs/{arch}/cog-ha-matter-{arch}",
  "binary_sha256": "<from dist/cog-ha-matter-{arch}.sha256>",
  "binary_signature": "<from dist/cog-ha-matter-{arch}.sig — empty until signing is wired>",
  "description": "Home Assistant + Matter Cognitum Seed cog (mDNS + witness chain)",
  "min_seed_version": "0.6.0",
  "installable_on": ["arm", "x86_64"]
}
```
