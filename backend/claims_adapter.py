"""Adaptador server-side mínimo para observar claims sem conceder autoridade.

A validação real é injetável para testes e, em produção, deve consultar uma
fonte de identidade server-side. Este módulo nunca devolve o token, claims
brutas, metadata de usuário ou uma decisão de permissão operacional.
"""

from __future__ import annotations

import json
import re
import time
import urllib.request
from collections.abc import Callable, Mapping, Sequence
from typing import Literal, TypedDict


CONTRACT_VERSION = "server-claims/v1"
SERVER_VALIDATED_SOURCE = "server-validated"
MAX_CLAIMS_TTL_MS = 60_000
DEFAULT_ALLOWED_SCOPES = ("platform:observe", "registry:read", "module:read")


class ServerClaimsSnapshot(TypedDict):
    contractVersion: Literal["server-claims/v1"]
    source: Literal["server-authority"]
    identity: dict[str, bool]
    scopes: dict[str, list[str]]
    validity: dict[str, int | bool | None]
    requestIdPresent: bool
    redaction: dict[str, object]
    decision: Literal["not-authorized"]
    authority: Literal["not-authorized"]


Claims = Mapping[str, object]
HttpGet = Callable[[str, Mapping[str, str], float], tuple[int, bytes]]


def _text(value: object) -> str | None:
    return value.strip() if isinstance(value, str) and value.strip() else None


def _timestamp(value: object) -> int | None:
    return value if isinstance(value, int) and not isinstance(value, bool) and value >= 0 else None


def _string_list(value: object) -> list[str]:
    if not isinstance(value, Sequence) or isinstance(value, (str, bytes, bytearray)):
        return []
    result: list[str] = []
    for item in value:
        text = _text(item)
        if text and text not in result:
            result.append(text)
    return result


def project_server_claims(
    claims: Claims | None,
    *,
    now_ms: int | None = None,
    expected_issuer: str | None = "supabase-auth",
    expected_audience: str | None = "authenticated",
    allowed_scopes: Sequence[str] = DEFAULT_ALLOWED_SCOPES,
) -> ServerClaimsSnapshot:
    """Projeta uma identidade server-side sem transformar observação em allow."""

    candidate = claims or {}
    issuer = _text(candidate.get("issuer"))
    subject = _text(candidate.get("subject"))
    audience = _text(candidate.get("audience"))
    source = _text(candidate.get("source"))
    requested = _string_list(candidate.get("scopes"))
    issued_at = _timestamp(candidate.get("issuedAt"))
    expires_at = _timestamp(candidate.get("expiresAt"))
    current = int(time.time() * 1000) if now_ms is None else now_ms
    ttl_ms = expires_at - issued_at if issued_at is not None and expires_at is not None else None

    issuer_matches = issuer is not None and (expected_issuer is None or issuer == expected_issuer)
    audience_matches = audience is not None and (expected_audience is None or audience == expected_audience)
    trusted_source = source == SERVER_VALIDATED_SOURCE
    authenticated = candidate.get("authenticated") is True
    fresh = (
        isinstance(current, int)
        and not isinstance(current, bool)
        and current >= 0
        and issued_at is not None
        and expires_at is not None
        and expires_at > issued_at
        and ttl_ms is not None
        and ttl_ms <= MAX_CLAIMS_TTL_MS
        and current >= issued_at
        and current < expires_at
    )
    identity_ready = (
        issuer_matches
        and audience_matches
        and trusted_source
        and authenticated
        and subject is not None
        and fresh
    )
    allowed = set(allowed_scopes)
    accepted = [scope for scope in requested if identity_ready and scope in allowed]
    accepted_set = set(accepted)

    return {
        "contractVersion": CONTRACT_VERSION,
        "source": "server-authority",
        "identity": {
            "issuerPresent": issuer is not None,
            "subjectPresent": subject is not None,
            "audienceMatched": audience_matches,
            "authenticated": authenticated,
            "trustedSource": trusted_source,
        },
        "scopes": {
            "requested": requested,
            "accepted": accepted,
            "rejected": [scope for scope in requested if scope not in accepted_set],
        },
        "validity": {
            "issuedAt": issued_at,
            "expiresAt": expires_at,
            "ttlMs": ttl_ms,
            "fresh": fresh,
        },
        "requestIdPresent": _text(candidate.get("requestId")) is not None,
        "redaction": {
            "applied": True,
            "fields": ["token", "subject", "rawClaims", "user_metadata", "app_metadata"],
        },
        "decision": "not-authorized",
        "authority": "not-authorized",
    }


def extract_bearer_token(authorization: str | None) -> str | None:
    """Extrai Bearer somente em memória; o token nunca é retornado no envelope."""

    if not isinstance(authorization, str):
        return None
    parts = authorization.strip().split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    token = parts[1]
    if len(token) > 8192 or not re.fullmatch(r"[A-Za-z0-9._~+/-]+=*", token):
        return None
    return token


def _default_http_get(url: str, headers: Mapping[str, str], timeout: float) -> tuple[int, bytes]:
    request = urllib.request.Request(url, headers=dict(headers), method="GET")
    with urllib.request.urlopen(request, timeout=timeout) as response:  # noqa: S310 — URL é configuração server-side
        return int(response.status), response.read(1_000_000)


def verify_supabase_access_token(
    token: str | None,
    *,
    base_url: str | None,
    anon_key: str | None,
    http_get: HttpGet | None = None,
) -> Claims | None:
    """Consulta Supabase Auth `/user` sem expor o token ou metadata ao consumidor.

    A resposta de `/user` prova apenas que o token atual foi aceito pela fonte de
    identidade. Como ela não fornece expiração/escopos server-side neste adapter,
    o envelope resultante continua sem escopos aceitos até uma autoridade formal
    fornecer esses campos.
    """

    if not token or not _text(base_url) or not _text(anon_key):
        return None
    getter = http_get or _default_http_get
    url = f"{base_url.rstrip('/')}/auth/v1/user"
    try:
        status, body = getter(
            url,
            {"apikey": str(anon_key), "Authorization": f"Bearer {token}"},
            4.0,
        )
        if status != 200:
            return None
        payload = json.loads(body.decode("utf-8"))
    except (OSError, TimeoutError, ValueError, UnicodeError, json.JSONDecodeError):
        return None
    if not isinstance(payload, Mapping):
        return None
    subject = _text(payload.get("id"))
    if subject is None:
        return None
    return {
        "issuer": "supabase-auth",
        "subject": subject,
        "audience": "authenticated",
        "scopes": [],
        "source": SERVER_VALIDATED_SOURCE,
        "authenticated": True,
    }


def observe_bearer_claims(
    authorization: str | None,
    *,
    base_url: str | None,
    anon_key: str | None,
    now_ms: int | None = None,
    http_get: HttpGet | None = None,
) -> ServerClaimsSnapshot:
    """Produz envelope seguro para um header Bearer, negando em qualquer dúvida."""

    token = extract_bearer_token(authorization)
    claims = verify_supabase_access_token(
        token,
        base_url=base_url,
        anon_key=anon_key,
        http_get=http_get,
    ) if token else None
    return project_server_claims(claims, now_ms=now_ms)
