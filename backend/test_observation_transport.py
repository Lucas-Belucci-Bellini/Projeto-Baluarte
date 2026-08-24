from fastapi.testclient import TestClient

import server
from transport_security import FixedWindowRateLimiter


def test_fastapi_observation_endpoint_is_read_only_and_rate_limited() -> None:
    original_limiter = server._OBSERVATION_RATE_LIMITER
    server._OBSERVATION_RATE_LIMITER = FixedWindowRateLimiter(limit=1, window_seconds=60)
    try:
        client = TestClient(server.app)
        origin = "http://localhost:5173"
        first = client.get(
            "/observability/observe",
            headers={"Origin": origin, "X-Request-ID": "observation-test"},
        )
        assert first.status_code == 200
        body = first.json()
        assert body["contractVersion"] == "server-observation/v1"
        assert body["source"] == "server-observed"
        assert body["authority"] == "not-authorized"
        assert body["claims"]["authority"] == "not-authorized"
        assert body["claims"]["decision"] == "not-authorized"
        assert body["transport"]["originAllowed"] is True
        assert body["transport"]["rateLimited"] is False
        assert first.headers["access-control-allow-origin"] == origin

        limited = client.get(
            "/observability/observe",
            headers={
                "Origin": origin,
                "Authorization": "Bearer observation-token-that-must-not-leak",
            },
        )
        assert limited.status_code == 429
        limited_body = limited.json()
        assert limited_body["contractVersion"] == "server-observation/v1"
        assert limited_body["transport"]["rateLimited"] is True
        assert limited_body["authority"] == "not-authorized"
        assert "observation-token-that-must-not-leak" not in limited.text
        assert limited.headers["retry-after"]
    finally:
        server._OBSERVATION_RATE_LIMITER = original_limiter


if __name__ == "__main__":
    test_fastapi_observation_endpoint_is_read_only_and_rate_limited()
    print("observation transport integration: 1/1")
