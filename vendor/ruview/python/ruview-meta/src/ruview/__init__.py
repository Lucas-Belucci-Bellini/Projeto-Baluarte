"""RuView — ambient intelligence from WiFi CSI.

This package is a thin alias around `wifi-densepose`. Both PyPI names
ship the same code and the same compiled Rust core; `ruview` is the
brand-facing name and `wifi-densepose` is the technical name. Pick
whichever you prefer:

    pip install ruview
    pip install wifi-densepose

Both make this work:

    from ruview import BreathingExtractor, hello
    # or equivalently:
    from wifi_densepose import BreathingExtractor, hello

The actual compiled DSP, the Python facade, and every public class
live in `wifi_densepose` — `ruview` just re-exports the surface so the
two names are interchangeable in application code.
"""

from __future__ import annotations

import wifi_densepose as _wdp

# Re-export everything `wifi_densepose.__all__` declares.
for _name in _wdp.__all__:
    globals()[_name] = getattr(_wdp, _name)

# Version + diagnostic fields — surface them under the ruview name
# too so users can `print(ruview.__rust_version__)` without reaching
# into the wifi_densepose module.
__version__: str = _wdp.__version__
__rust_version__: str = _wdp.__rust_version__
__rust_build_tag__: str = _wdp.__rust_build_tag__
__build_features__ = list(_wdp.__build_features__)

# The client sub-package is also aliased for symmetry.
try:
    from wifi_densepose import client  # type: ignore[import-not-found]  # noqa: F401
except ImportError:
    # client extras not installed — that's fine for the core import.
    pass

__all__ = list(_wdp.__all__) + [
    "__version__",
    "__rust_version__",
    "__rust_build_tag__",
    "__build_features__",
]
