"""GET /api/claims — observação server-side read-only de claims.

A função usa o adaptador compartilhado de backend. Sem Supabase configurado ou
Bearer validado, responde deny-by-default. Token, subject e metadata não saem.
"""

from __future__ import annotations

import json
import logging
import os
from http.server import BaseHTTPRequestHandler

from backend.claims_adapter import observe_bearer_claims
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
_CLAIMS_RATE_LIMITER = configured_claims_rate_limiter()
_CLAIMS_AUDIT_LOGGER = logging.getLogger("baluarte.vercel.server_claims")


class handler(BaseHTTPRequestHandler):
    """Vercel adapter with explicit CORS and deny-by-default transport controls."""

    def _origin(self) -> str | None:
        return self.headers.get("Origin")

    def _send_json(self, status_code: int, payload: dict[str, object], extra_headers: dict[str, str] | None = None) -> None:
        origin = self._origin()
        headers = cors_headers(origin, _ALLOWED_ORIGINS)
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
        """Answer preflight without authorizing the requesting origin."""
        self._send_json(204, {})

    def do_GET(self):
        origin = self._origin()
        origin_is_allowed = origin_allowed(origin, _ALLOWED_ORIGINS)
        remote_host = self.client_address[0] if self.client_address else None
        rate = _CLAIMS_RATE_LIMITER.check(transport_key(remote_host, origin))
        request_id_present = bool(self.headers.get("X-Request-ID", "").strip())
        if not rate.allowed:
            emit_claims_audit(
                _CLAIMS_AUDIT_LOGGER,
                status_code=429,
                origin_is_allowed=origin_is_allowed,
                rate_limited=True,
                decision="not-authorized",
                request_id_present=request_id_present,
            )
            self._send_json(
                429,
                {
                    "contractVersion": "server-claims/v1",
                    "decision": "not-authorized",
                    "authority": "not-authorized",
                    "error": "rate_limited",
                },
                rate_limit_headers(rate),
            )
            return

        snapshot = observe_bearer_claims(
            self.headers.get("Authorization"),
            base_url=os.environ.get("SUPABASE_URL"),
            anon_key=os.environ.get("SUPABASE_ANON_KEY"),
        )
        emit_claims_audit(
            _CLAIMS_AUDIT_LOGGER,
            status_code=200,
            origin_is_allowed=origin_is_allowed,
            rate_limited=False,
            decision=snapshot["decision"],
            request_id_present=request_id_present,
        )
        self._send_json(200, snapshot, rate_limit_headers(rate))
