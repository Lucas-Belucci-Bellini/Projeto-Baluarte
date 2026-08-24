"""Contrato combinado read-only para evidência de health e claims.

A projeção não autentica, não autoriza e não executa fallback. Ela apenas
combina os envelopes server-health/v1 e server-claims/v1 já existentes.
"""

from __future__ import annotations

from typing import Literal, TypedDict

from claims_adapter import ServerClaimsSnapshot
from health_contract import ServerHealthSnapshot


CONTRACT_VERSION = "server-observation/v1"
Severity = Literal["none", "warning"]
Fallback = Literal["available", "degraded", "blocked"]
ReasonCode = Literal[
    "health-degraded",
    "claims-absent",
    "claims-stale",
    "rate-limited",
    "observation-ready",
]


class ObservationEvidence(TypedDict):
    healthObserved: bool
    claimsObserved: bool
    claimsFresh: bool
    severity: Severity
    fallback: Fallback
    reasonCodes: list[ReasonCode]


class ObservationTransport(TypedDict):
    originAllowed: bool
    rateLimited: bool


class ServerObservationSnapshot(TypedDict):
    contractVersion: Literal["server-observation/v1"]
    source: Literal["server-observed"]
    health: ServerHealthSnapshot
    claims: ServerClaimsSnapshot
    evidence: ObservationEvidence
    transport: ObservationTransport
    authority: Literal["not-authorized"]


def project_server_observation(
    health: ServerHealthSnapshot,
    claims: ServerClaimsSnapshot,
    *,
    origin_allowed: bool = False,
    rate_limited: bool = False,
) -> ServerObservationSnapshot:
    """Combina apenas sinais observados e mantém a autoridade negada."""

    health_observed = health["ok"] is True and health["connection"] == "connected"
    claims_observed = claims["identity"]["authenticated"] is True
    claims_fresh = claims["validity"]["fresh"] is True
    healthy = health["health"] == "healthy"
    ready = health_observed and healthy and claims_fresh and not rate_limited

    reasons: list[ReasonCode] = []
    if not healthy:
        reasons.append("health-degraded")
    if not claims_observed:
        reasons.append("claims-absent")
    elif not claims_fresh:
        reasons.append("claims-stale")
    if rate_limited:
        reasons.append("rate-limited")
    if not reasons:
        reasons.append("observation-ready")

    severity: Severity = "none" if ready else "warning"
    fallback: Fallback = "available" if ready else "degraded"
    if not health_observed:
        fallback = "blocked"

    return {
        "contractVersion": CONTRACT_VERSION,
        "source": "server-observed",
        "health": health,
        "claims": claims,
        "evidence": {
            "healthObserved": health_observed,
            "claimsObserved": claims_observed,
            "claimsFresh": claims_fresh,
            "severity": severity,
            "fallback": fallback,
            "reasonCodes": reasons,
        },
        "transport": {
            "originAllowed": origin_allowed,
            "rateLimited": rate_limited,
        },
        "authority": "not-authorized",
    }
