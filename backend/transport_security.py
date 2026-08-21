"""Controles pequenos e determinísticos para transporte server-side.

Este módulo não autentica, não autoriza e não decodifica tokens. Ele apenas
centraliza configuração de CORS, rate limiting process-local e auditoria
redigida para que FastAPI e handlers serverless mantenham a mesma semântica.
"""

from __future__ import annotations

import hashlib
import logging
import os
import threading
import time
from collections.abc import Callable
from dataclasses import dataclass
from urllib.parse import urlsplit


DEFAULT_ALLOWED_ORIGINS = (
    "http://localhost:5173",
    "http://127.0.0.1:5173",
)
DEFAULT_CLAIMS_RATE_LIMIT = 30
DEFAULT_CLAIMS_RATE_WINDOW_SECONDS = 60
MAX_CLAIMS_RATE_LIMIT = 1_000
MAX_CLAIMS_RATE_WINDOW_SECONDS = 3_600
CORS_METHODS = ("GET", "POST", "OPTIONS")
CORS_HEADERS = ("Authorization", "Content-Type", "X-Request-ID")
CORS_EXPOSE_HEADERS = (
    "Retry-After",
    "X-RateLimit-Limit",
    "X-RateLimit-Remaining",
    "X-RateLimit-Reset",
)


@dataclass(frozen=True)
class RateLimitDecision:
    allowed: bool
    limit: int
    remaining: int
    reset_at: int
    retry_after: int


class FixedWindowRateLimiter:
    """Rate limiter bounded in memory and safe for concurrent requests."""

    def __init__(
        self,
        *,
        limit: int = DEFAULT_CLAIMS_RATE_LIMIT,
        window_seconds: int = DEFAULT_CLAIMS_RATE_WINDOW_SECONDS,
        max_keys: int = 2_048,
        clock: Callable[[], float] = time.time,
    ) -> None:
        self.limit = _bounded_positive_int(limit, DEFAULT_CLAIMS_RATE_LIMIT, MAX_CLAIMS_RATE_LIMIT)
        self.window_seconds = _bounded_positive_int(
            window_seconds,
            DEFAULT_CLAIMS_RATE_WINDOW_SECONDS,
            MAX_CLAIMS_RATE_WINDOW_SECONDS,
        )
        self.max_keys = _bounded_positive_int(max_keys, 2_048, 10_000)
        self._clock = clock
        self._windows: dict[str, tuple[int, int]] = {}
        self._lock = threading.Lock()

    def check(self, key: str | None) -> RateLimitDecision:
        """Consume one slot for a bounded anonymous/transport key."""

        safe_key = key or "anonymous"
        now = int(self._clock())
        window_start = now - (now % self.window_seconds)
        reset_at = window_start + self.window_seconds
        with self._lock:
            previous = self._windows.get(safe_key)
            count = previous[1] + 1 if previous and previous[0] == window_start else 1
            if len(self._windows) >= self.max_keys and safe_key not in self._windows:
                self._prune(window_start)
                if len(self._windows) >= self.max_keys:
                    oldest_key = min(self._windows, key=lambda item: self._windows[item][0])
                    self._windows.pop(oldest_key, None)
            self._windows[safe_key] = (window_start, count)
        allowed = count <= self.limit
        remaining = max(0, self.limit - count)
        retry_after = max(1, reset_at - now)
        return RateLimitDecision(allowed, self.limit, remaining, reset_at, retry_after)

    def _prune(self, current_window: int) -> None:
        stale = [
            key
            for key, (window_start, _count) in self._windows.items()
            if window_start != current_window
        ]
        for key in stale:
            self._windows.pop(key, None)


def _bounded_positive_int(value: object, default: int, maximum: int) -> int:
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return default
    return max(1, min(parsed, maximum))


def _valid_origin(origin: str) -> bool:
    parsed = urlsplit(origin)
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc) and not parsed.path and not parsed.query and not parsed.fragment


def parse_allowed_origins(raw: str | None) -> tuple[str, ...]:
    """Parse exact origins; wildcard and malformed entries fail closed."""

    if raw is None or not raw.strip():
        return DEFAULT_ALLOWED_ORIGINS
    result: list[str] = []
    for candidate in raw.split(","):
        origin = candidate.strip().rstrip("/")
        if origin == "*" or not _valid_origin(origin):
            continue
        if origin not in result:
            result.append(origin)
    return tuple(result)


def configured_allowed_origins() -> tuple[str, ...]:
    return parse_allowed_origins(os.environ.get("BALUARTE_ALLOWED_ORIGINS"))


def configured_claims_rate_limiter() -> FixedWindowRateLimiter:
    return FixedWindowRateLimiter(
        limit=_bounded_positive_int(
            os.environ.get("BALUARTE_CLAIMS_RATE_LIMIT"),
            DEFAULT_CLAIMS_RATE_LIMIT,
            MAX_CLAIMS_RATE_LIMIT,
        ),
        window_seconds=_bounded_positive_int(
            os.environ.get("BALUARTE_CLAIMS_RATE_WINDOW_SECONDS"),
            DEFAULT_CLAIMS_RATE_WINDOW_SECONDS,
            MAX_CLAIMS_RATE_WINDOW_SECONDS,
        ),
    )


def origin_allowed(origin: str | None, allowed_origins: tuple[str, ...]) -> bool:
    return bool(origin and origin in allowed_origins)


def cors_headers(origin: str | None, allowed_origins: tuple[str, ...]) -> dict[str, str]:
    """Return explicit CORS metadata; never return wildcard authorization."""

    headers = {
        "Vary": "Origin",
        "Access-Control-Allow-Methods": ", ".join(CORS_METHODS),
        "Access-Control-Allow-Headers": ", ".join(CORS_HEADERS),
        "Access-Control-Max-Age": "600",
        "Access-Control-Expose-Headers": ", ".join(CORS_EXPOSE_HEADERS),
    }
    if origin_allowed(origin, allowed_origins):
        headers["Access-Control-Allow-Origin"] = origin or ""
    return headers


def rate_limit_headers(decision: RateLimitDecision) -> dict[str, str]:
    headers = {
        "X-RateLimit-Limit": str(decision.limit),
        "X-RateLimit-Remaining": str(decision.remaining),
        "X-RateLimit-Reset": str(decision.reset_at),
    }
    if not decision.allowed:
        headers["Retry-After"] = str(decision.retry_after)
    return headers


def transport_key(remote_host: str | None, origin: str | None) -> str:
    """Create a non-reversible in-memory bucket key; never log the inputs."""

    material = f"{remote_host or 'anonymous'}\x00{origin or ''}".encode("utf-8")
    return hashlib.sha256(material).hexdigest()


def build_claims_audit_event(
    *,
    status_code: int,
    origin_is_allowed: bool,
    rate_limited: bool,
    decision: str,
    request_id_present: bool,
    method: str = "GET",
    route: str = "/claims/observe",
) -> dict[str, object]:
    """Build only categorical/boolean audit data; no token or identity fields."""

    return {
        "event": "server_claims_request",
        "method": method,
        "route": route,
        "statusClass": f"{status_code // 100}xx",
        "originAllowed": origin_is_allowed,
        "rateLimited": rate_limited,
        "decision": decision,
        "requestIdPresent": request_id_present,
    }


def emit_claims_audit(
    logger: logging.Logger,
    *,
    status_code: int,
    origin_is_allowed: bool,
    rate_limited: bool,
    decision: str,
    request_id_present: bool,
    method: str = "GET",
    route: str = "/claims/observe",
) -> None:
    event = build_claims_audit_event(
        status_code=status_code,
        origin_is_allowed=origin_is_allowed,
        rate_limited=rate_limited,
        decision=decision,
        request_id_present=request_id_present,
        method=method,
        route=route,
    )
    logger.info("server_claims_request", extra={"claims_audit": event})
