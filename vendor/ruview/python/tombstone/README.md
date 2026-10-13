# wifi-densepose 1.99.0 — tombstone release

This sub-directory builds the **tombstone wheel** described in
[ADR-117 §7.2](../../docs/adr/ADR-117-pip-wifi-densepose-modernization.md).

`wifi-densepose==1.1.0` was published on 2025-06-07 as a pure-Python
FastAPI + PyTorch server. v2.0+ is a hard rewrite around the Rust
crates in [`v2/crates/`](../../v2/crates/) exposed via PyO3.

`wifi-densepose==1.99.0` ships **no real code** — its `__init__.py`
raises `ImportError` with a migration URL. The point is that any
project pinned to `wifi-densepose>=1,<2` that runs `pip install -U
wifi-densepose` gets a clear, actionable error instead of a silent
import of a broken legacy server.

## Build locally

```bash
cd python/tombstone
python -m build
```

Result: `dist/wifi_densepose-1.99.0-py3-none-any.whl` and the matching sdist.

## Smoke-test

```bash
pip install dist/wifi_densepose-1.99.0-py3-none-any.whl
python -c "import wifi_densepose"
# Expected: ImportError with the migration URL.
```

## Publish

Publishing is done by the `pip-release.yml` GH Actions workflow, gated
on a `v1.99.0-pip` tag OR an explicit `workflow_dispatch` with
`target: v1-99-tombstone`. Per ADR-117 §7.3 this should publish
*before* `v2.0.0` to claim the "current" slot in pip's resolver.
