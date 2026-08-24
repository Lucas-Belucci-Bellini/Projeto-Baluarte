from fastapi.testclient import TestClient

import server
from transport_security import FixedWindowRateLimiter


def test_fastapi_claims_cors_and_rate_limit() -> None:
    original_limiter = server._CLAIMS_RATE_LIMITER
    server._CLAIMS_RATE_LIMITER = FixedWindowRateLimiter(limit=1, window_seconds=60)
    try:
        client = TestClient(server.app)
        allowed_origin = "http://localhost:5173"
        preflight = client.options(
            "/claims/observe",
            headers={
                "Origin": allowed_origin,
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Authorization, X-Request-ID",
            },
        )
        assert preflight.status_code in (200, 204)
        assert preflight.headers["access-control-allow-origin"] == allowed_origin
        assert "*" not in preflight.headers.get("access-control-allow-methods", "")

        first = client.get(
            "/claims/observe",
            headers={"Origin": allowed_origin, "X-Request-ID": "safe-id"},
        )
        assert first.status_code == 200
        assert first.json()["decision"] == "not-authorized"
        assert first.headers["access-control-allow-origin"] == allowed_origin

        limited = client.get(
            "/claims/observe",
            headers={
                "Origin": allowed_origin,
                "Authorization": "Bearer secret-token-that-must-not-leak",
            },
        )
        assert limited.status_code == 429
        assert limited.json()["decision"] == "not-authorized"
        assert "secret-token-that-must-not-leak" not in limited.text
        assert limited.headers["retry-after"]

        rejected = client.get(
            "/claims/observe",
            headers={"Origin": "https://evil.example"},
        )
        assert rejected.status_code == 200
        assert rejected.json()["decision"] == "not-authorized"
        assert "access-control-allow-origin" not in rejected.headers
    finally:
        server._CLAIMS_RATE_LIMITER = original_limiter


if __name__ == "__main__":
    test_fastapi_claims_cors_and_rate_limit()
    print("claims transport integration: 1/1")
