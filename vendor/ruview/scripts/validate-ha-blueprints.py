#!/usr/bin/env python3
"""Validate every YAML file under examples/ha-blueprints/.

HA Blueprints use the `!input` YAML tag, which stock PyYAML doesn't
know how to construct. We register a no-op constructor for it so we
can still safe_load the files and assert on their structure.

Exits 0 if all blueprints are well-formed, non-zero otherwise. Intended
to run in CI on every PR that touches examples/ha-blueprints/.

Usage:
    python scripts/validate-ha-blueprints.py
"""

from __future__ import annotations

import glob
import sys
from pathlib import Path

import yaml


class InputTag(str):
    """No-op holder for HA `!input` markers — we don't expand them, just
    verify the file parses."""


def _input_constructor(loader, node):
    return InputTag(loader.construct_scalar(node))


def _secret_constructor(loader, node):
    return f"<!secret {loader.construct_scalar(node)}>"


yaml.SafeLoader.add_constructor("!input", _input_constructor)
yaml.SafeLoader.add_constructor("!secret", _secret_constructor)


REQUIRED_BLUEPRINT_KEYS = {"name", "description", "domain"}
ALLOWED_DOMAINS = {"automation", "script"}


def validate(path: Path) -> list[str]:
    """Return a list of issues; empty list means the blueprint is valid."""
    issues: list[str] = []
    try:
        with path.open(encoding="utf-8") as fh:
            doc = yaml.safe_load(fh)
    except yaml.YAMLError as e:
        return [f"YAML parse error: {e}"]
    except OSError as e:
        return [f"could not open: {e}"]

    if not isinstance(doc, dict):
        return ["top-level must be a mapping"]

    bp = doc.get("blueprint")
    if not isinstance(bp, dict):
        issues.append("missing `blueprint` mapping at top level")
        return issues

    missing = REQUIRED_BLUEPRINT_KEYS - bp.keys()
    if missing:
        issues.append(f"missing blueprint keys: {', '.join(sorted(missing))}")

    domain = bp.get("domain")
    if domain not in ALLOWED_DOMAINS:
        issues.append(
            f"unsupported blueprint.domain={domain!r}; allowed: {ALLOWED_DOMAINS}"
        )

    if not isinstance(bp.get("input"), dict) or not bp["input"]:
        issues.append("blueprint.input must declare at least one input")

    # The automation body must contain at least one of: trigger,
    # action, sequence (script body).
    if "trigger" not in doc and "action" not in doc and "sequence" not in doc:
        issues.append(
            "no `trigger`/`action`/`sequence` block — blueprint can't fire"
        )

    return issues


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    files = sorted(glob.glob(str(root / "examples" / "ha-blueprints" / "*.yaml")))
    if not files:
        print("ERROR: no blueprint YAML files found", file=sys.stderr)
        return 2

    fails = 0
    for f in files:
        issues = validate(Path(f))
        rel = Path(f).relative_to(root)
        if issues:
            fails += 1
            print(f"FAIL  {rel}")
            for i in issues:
                print(f"      {i}")
        else:
            print(f"ok    {rel}")

    if fails:
        print(f"\n{fails} blueprint(s) failed validation", file=sys.stderr)
        return 1
    print(f"\nAll {len(files)} HA Blueprints validate OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
