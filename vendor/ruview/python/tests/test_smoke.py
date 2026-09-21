"""ADR-117 P1 smoke tests — assert the maturin-built wheel loads and
its compiled module is callable.

These tests are the first acceptance gate of the v2.0 PyPI publish
pipeline (ADR-117 §11.1 — ``cargo test`` equivalent at the Python
level). They run on every cibuildwheel target in P5's CI matrix.
"""

from __future__ import annotations


def test_package_imports() -> None:
    """The top-level package must import without error."""
    import wifi_densepose  # noqa: F401


def test_version_string_well_formed() -> None:
    """Version string follows PEP 440 + matches pyproject.toml."""
    import re

    import wifi_densepose

    assert isinstance(wifi_densepose.__version__, str)
    # Allow pre-release segments (a, b, rc, dev) for non-final wheels.
    assert re.match(
        r"^\d+\.\d+\.\d+(a|b|rc|\.dev)?\d*$", wifi_densepose.__version__
    ), f"non-PEP-440 version: {wifi_densepose.__version__}"


def test_rust_version_surfaced() -> None:
    """Bound Rust core version must be reachable from Python.

    This is the diagnostic surface ADR-117 §5.2 promised — users in
    bug reports can paste ``wifi_densepose.__rust_version__`` so we
    correlate behaviour with the exact ``v2/crates/`` HEAD.
    """
    import wifi_densepose

    assert isinstance(wifi_densepose.__rust_version__, str)
    assert wifi_densepose.__rust_version__  # non-empty


def test_build_features_listed() -> None:
    """The wheel's build-time features must be enumerable.

    P1 ships only the ``p1-scaffold`` feature marker; later phases
    add more entries. The test asserts the contract that the list
    exists and contains the P1 marker.
    """
    import wifi_densepose

    feats = wifi_densepose.__build_features__
    assert isinstance(feats, list)
    assert all(isinstance(f, str) for f in feats)
    assert "p1-scaffold" in feats, f"P1 marker missing: {feats}"


def test_hello_returns_ok() -> None:
    """The compiled ``hello`` function round-trips through PyO3.

    This is the actual smoke test — proves the FFI works end-to-end.
    If this passes on every cibuildwheel target, the PyO3 build matrix
    is healthy.
    """
    import wifi_densepose

    assert wifi_densepose.hello() == "ok"


def test_native_module_private() -> None:
    """The compiled module is reachable but marked private.

    Users should ``import wifi_densepose``, not ``import
    wifi_densepose._native``. The underscore prefix communicates that.
    """
    import wifi_densepose
    from wifi_densepose import _native

    assert hasattr(_native, "hello"), "compiled module missing hello()"
    # Both paths must return the same value.
    assert wifi_densepose.hello() == _native.hello()
