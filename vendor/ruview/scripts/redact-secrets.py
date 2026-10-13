#!/usr/bin/env python3
"""Pipe stdin through a secret-redaction filter to stdout.

Used by generate-witness-bundle.sh to strip credentials from log files
before they enter the witness bundle. Pure stdlib so it runs anywhere.

Usage:
    some-command 2>&1 | python3 scripts/redact-secrets.py > clean.log
"""
import re
import sys


# Token prefix patterns — common SaaS / VCS API token shapes.
PREFIX_PATTERNS = [
    (re.compile(r'(dckr_pat_|tok_|sk-|ghp_|gho_|github_pat_|AKIA|hf_|xoxb-|xoxp-|Bearer\s+)[A-Za-z0-9_\-\.]+',
                re.IGNORECASE), r'\1[REDACTED]'),
]

# Long opaque strings (40+ alphanumeric / underscore / dash chars).
LONG_OPAQUE = re.compile(r'[A-Za-z0-9_\-]{40,}')

# Long hex runs (20+ hex chars — covers token suffixes after `...`).
LONG_HEX = re.compile(r'[a-fA-F0-9]{20,}')

# `field=VALUE` style assignment where field name suggests a secret.
SECRET_ASSIGNMENT = re.compile(
    r'(token|password|secret|api_key|access_key|private_key|psk|bearer)'
    r'(["\'\s:=]+)["\']?([A-Za-z0-9._\-/+]{12,})["\']?',
    re.IGNORECASE
)


def redact_line(line: str) -> str:
    for pat, repl in PREFIX_PATTERNS:
        line = pat.sub(repl, line)
    line = SECRET_ASSIGNMENT.sub(lambda m: f'{m.group(1)}={"[REDACTED]"}', line)
    line = LONG_OPAQUE.sub('[REDACTED-OPAQUE]', line)
    line = LONG_HEX.sub('[REDACTED-HEX]', line)
    return line


def main() -> int:
    for raw in sys.stdin.buffer:
        try:
            text = raw.decode('utf-8', errors='replace')
        except Exception:
            sys.stdout.buffer.write(b'[REDACTED-UNDECODABLE]\n')
            continue
        sys.stdout.write(redact_line(text))
        sys.stdout.flush()
    return 0


if __name__ == '__main__':
    sys.exit(main())
