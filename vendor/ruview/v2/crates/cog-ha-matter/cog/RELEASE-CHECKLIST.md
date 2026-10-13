# cog-ha-matter Release Checklist

Mechanical steps to publish a new version. **Everything local-side is
automated; the four "🔑 USER ACTION" blocks below are the only manual
gates.** Each one is a credential-bearing step the cog/ pipeline cannot
do on its own.

## 1. Pre-release (local)

```sh
# Bump version in v2/crates/cog-ha-matter/Cargo.toml then:
cargo test -p cog-ha-matter --no-default-features --lib   # 64+ tests must pass
cargo check -p cog-ha-matter --no-default-features        # green
```

## 2. Tag the release

```sh
git tag cog-ha-matter-v$(cargo pkgid -p cog-ha-matter | sed -E 's/.*#//')
git push origin --tags
```

The push fires `.github/workflows/cog-ha-matter-release.yml` which:

  * builds `cog-ha-matter-x86_64` + `cog-ha-matter-arm` (cross-compiled
    via apt-installed `gcc-aarch64-linux-gnu`)
  * computes SHA-256 sidecars
  * runs the Ed25519 sign step **if** `COGNITUM_OWNER_SIGNING_KEY` is set
  * uploads workflow artifacts (always — these are downloadable from
    the run page)
  * uploads to `gs://cognitum-apps/cogs/{arch}/` **if** the org var
    `HAS_GCP_CREDENTIALS == 'true'` and the `GCP_CREDENTIALS` secret is set

## 3. Update app-registry.json

Take `cog/app-registry-entry.json` from this directory, fill in the
post-build values, and PR it into the [`cognitum-one`](https://github.com/ruvnet/cognitum-one)
repo at `app-registry.json`.

Values to fill in:

  * `version` — bump to match the new tag
  * `sha256` — paste from the workflow artifact's `.sha256` sidecar
  * `binary_size` — bytes of the binary (`wc -c < cog-ha-matter-x86_64`)

## 🔑 USER ACTION items (cannot be automated)

| # | What | Why this can't be automated |
|---|---|---|
| 1 | Set the `HAS_GCP_CREDENTIALS` org variable to `true` and provision the `GCP_CREDENTIALS` GitHub Actions secret with a service-account JSON that has `storage.objectAdmin` on `gs://cognitum-apps/cogs/` | Requires org-admin access + a GCP project owner's signoff |
| 2 | Provision `COGNITUM_OWNER_SIGNING_KEY` GitHub secret with the Ed25519 private key in PEM form | Long-lived secret material; humans must rotate it; same blocker for cog-pose-estimation |
| 3 | `gcloud auth login` (only if running `make upload` locally instead of via CI) | Browser OAuth flow |
| 4 | File a PR in `cognitum-one` against `app-registry.json` adding the entry from `cog/app-registry-entry.json` | Cross-repo write requires the user's GitHub auth + reviewer signoff |

## Post-release verification

Once the cognitum-one PR merges and the cache rolls over (~hourly):

```sh
curl -sS https://storage.googleapis.com/cognitum-apps/app-registry.json \
  | jq '.[] | select(.id == "ha-matter")'
```

Should print the new entry. On the Seed UI, the cog appears under
**Settings → Cogs → building → Home Assistant + Matter Bridge**.

## Reverting a bad release

Cogs ship via GCS object versioning (per ADR-100). To roll back:

```sh
gsutil ls -a gs://cognitum-apps/cogs/x86_64/cog-ha-matter-x86_64
# Pick the previous generation, then:
gsutil cp gs://cognitum-apps/cogs/x86_64/cog-ha-matter-x86_64#<generation> \
          gs://cognitum-apps/cogs/x86_64/cog-ha-matter-x86_64
```

Then PR a `version` bump in `cognitum-one`'s `app-registry.json` so
Seeds know to refetch.
