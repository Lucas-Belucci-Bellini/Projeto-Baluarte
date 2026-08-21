"""GET /api/observability — envelope server-observation/v1 read-only."""

from __future__ import annotations

import json
import logging
import os
from http.server import BaseHTTPRequestHandler

from backend.claims_adapter import observe_bearer_claims
from backend.health_contract import project_server_health
from backend.observation_contract import project_server_observation
from backend.transport_security import (
    configured_allowed_origins,
    configured_claims_rate_limiter,
    cors_headers,
    emit_claims_audit,
    origin_allowed,
    rate_limit_headers,
    transport_key,
)


_ALLOWED_ORIGINS = configured_allowed_origins()
_OBSERVATION_RATE_LIMITER = configured_claims_rate_limiter()
_OBSERVATION_AUDIT_LOGGER = logging.getLogger("baluarte.vercel.observability")
MODEL = os.environ.get("BALUARTE_MODEL", "gemini-2.5-flash")


class handler(BaseHTTPRequestHandler):
    """Vercel adapter for the combined observation envelope."""

    def _origin(self) -> str | None:
        return self.headers.get("Origin")

    def _send_json(
        self,
        status_code: int,
        payload: dict[str, object],
        extra_headers: dict[str, str] | None = None,
    ) -> None:
        headers = cors_headers(self._origin(), _ALLOWED_ORIGINS)
        if extra_headers:
            headers.update(extra_headers)
        body = b"" if status_code == 204 else json.dumps(payload).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        for name, value in headers.items():
            self.send_header(name, value)
        self.end_headers()
        if body:
            self.wfile.write(body)

    def do_OPTIONS(self):
        self._send_json(204, {})

    def do_GET(self):
        route = "/api/observability"
        origin = self._origin()
        origin_is_allowed = origin_allowed(origin, _ALLOWED_ORIGINS)
        remote_host = self.client_address[0] if self.client_address else None
        rate = _OBSERVATION_RATE_LIMITER.check(transport_key(remote_host, origin, route))
        request_id_present = bool(self.headers.get("X-Request-ID", "").strip())
        health_snapshot = project_server_health(
            model=MODEL,
            has_key=bool(os.environ.get("GEMINI_API_KEY")),
        )
        claims_snapshot = observe_bearer_claims(
            self.headers.get("Authorization") if rate.allowed else None,
            base_url=os.environ.get("SUPABASE_URL") if rate.allowed else None,
            anon_key=os.environ.get("SUPABASE_ANON_KEY") if rate.allowed else None,
        )
        observation = project_server_observation(
            health_snapshot,
            claims_snapshot,
            origin_allowed=origin_is_allowed,
            rate_limited=not rate.allowed,
        )
        emit_claims_audit(
            _OBSERVATION_AUDIT_LOGGER,
            status_code=200 if rate.allowed else 429,
            origin_is_allowed=origin_is_allowed,
            rate_limited=not rate.allowed,
            decision=observation["authority"],
            request_id_present=request_id_present,
            route=route,
        )
        self._send_json(
            200 if rate.allowed else 429,
            observation,
            rate_limit_headers(rate),
        )
