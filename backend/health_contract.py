"""Contrato read-only para o health do backend opcional do JARVIS.

Este módulo não decide autorização, não executa fallback e não acessa segredos.
Ele apenas transforma a disponibilidade observável do processo e a presença
booleana da configuração Gemini em um envelope estável para consumidores.
"""

from __future__ import annotations

from typing import Literal, TypedDict

Health = Literal["healthy", "degraded"]
Severity = Literal["none", "warning"]
Fallback = Literal["available", "degraded"]


class ServerHealthSnapshot(TypedDict):
    contractVersion: Literal["server-health/v1"]
    source: Literal["runtime-observed"]
    connection: Literal["connected"]
    health: Health
    severity: Severity
    fallback: Fallback
    authority: Literal["not-authorized"]
    ok: Literal[True]
    service: Literal["jarvis-backend"]
    model: str
    hasKey: bool
    detail: str


def project_server_health(*, model: str, has_key: bool) -> ServerHealthSnapshot:
    """Projeta o estado mínimo observável sem expor a chave nem claims.

    ``ok`` representa liveness do endpoint: se a resposta existe, o processo
    está respondendo. ``health`` representa a prontidão do serviço Gemini e
    pode estar degradado mesmo quando ``ok`` permanece verdadeiro.
    """

    if has_key:
        health: Health = "healthy"
        severity: Severity = "none"
        fallback: Fallback = "available"
        detail = "health endpoint + Gemini key observados"
    else:
        health = "degraded"
        severity = "warning"
        fallback = "degraded"
        detail = "health endpoint observado; chave Gemini ausente"

    return {
        "contractVersion": "server-health/v1",
        "source": "runtime-observed",
        "connection": "connected",
        "health": health,
        "severity": severity,
        "fallback": fallback,
        "authority": "not-authorized",
        "ok": True,
        "service": "jarvis-backend",
        "model": model,
        "hasKey": has_key,
        "detail": detail,
    }
