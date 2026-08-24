"""Testes do contrato read-only de health do backend JARVIS."""

from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

from health_contract import project_server_health


VERCEL_HEALTH_PATH = Path(__file__).parents[1] / "api" / "health.py"
VERCEL_HEALTH_SPEC = spec_from_file_location("vercel_health_contract", VERCEL_HEALTH_PATH)
if VERCEL_HEALTH_SPEC is None or VERCEL_HEALTH_SPEC.loader is None:
    raise RuntimeError("não foi possível carregar o contrato Vercel")
VERCEL_HEALTH = module_from_spec(VERCEL_HEALTH_SPEC)
VERCEL_HEALTH_SPEC.loader.exec_module(VERCEL_HEALTH)


def test_healthy_backend_projection() -> None:
    snapshot = project_server_health(model="gemini-test", has_key=True)

    assert snapshot["ok"] is True
    assert snapshot["health"] == "healthy"
    assert snapshot["severity"] == "none"
    assert snapshot["fallback"] == "available"
    assert snapshot["authority"] == "not-authorized"
    assert snapshot["hasKey"] is True
    assert snapshot["model"] == "gemini-test"


def test_missing_key_is_degraded_not_disconnected() -> None:
    snapshot = project_server_health(model="gemini-test", has_key=False)

    assert snapshot["ok"] is True
    assert snapshot["connection"] == "connected"
    assert snapshot["health"] == "degraded"
    assert snapshot["severity"] == "warning"
    assert snapshot["fallback"] == "degraded"
    assert snapshot["authority"] == "not-authorized"
    assert snapshot["hasKey"] is False
    assert "GEMINI_API_KEY" not in snapshot["detail"]


def test_vercel_projection_matches_fastapi_projection() -> None:
    expected = project_server_health(model="gemini-test", has_key=False)
    actual = VERCEL_HEALTH.project_health("gemini-test", False)

    assert actual == expected


def test_projection_does_not_contain_secret_value() -> None:
    snapshot = project_server_health(model="gemini-test", has_key=True)

    assert set(snapshot) == {
        "contractVersion",
        "source",
        "connection",
        "health",
        "severity",
        "fallback",
        "authority",
        "ok",
        "service",
        "model",
        "hasKey",
        "detail",
    }


if __name__ == "__main__":
    test_healthy_backend_projection()
    test_missing_key_is_degraded_not_disconnected()
    test_vercel_projection_matches_fastapi_projection()
    test_projection_does_not_contain_secret_value()
    print("backend health contract: 4/4")
