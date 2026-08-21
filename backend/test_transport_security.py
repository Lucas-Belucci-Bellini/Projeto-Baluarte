from transport_security import (
    CORS_HEADERS,
    FixedWindowRateLimiter,
    build_claims_audit_event,
    cors_headers,
    parse_allowed_origins,
    rate_limit_headers,
    transport_key,
)


def test_allowed_origins_are_exact_and_wildcards_fail_closed() -> None:
    origins = parse_allowed_origins(
        "https://baluarte.example/, *,https://admin.example/path,https://baluarte.example"
    )
    assert origins == ("https://baluarte.example",)
    assert cors_headers("https://baluarte.example", origins)["Access-Control-Allow-Origin"] == "https://baluarte.example"
    assert "Access-Control-Allow-Origin" not in cors_headers("https://evil.example", origins)


def test_cors_headers_are_explicit_and_never_wildcard() -> None:
    headers = cors_headers("http://localhost:5173", ("http://localhost:5173",))
    assert headers["Access-Control-Allow-Methods"] == "GET, POST, OPTIONS"
    assert headers["Access-Control-Allow-Headers"] == ", ".join(CORS_HEADERS)
    assert headers["Access-Control-Max-Age"] == "600"
    assert "*" not in " ".join(headers.values())


def test_fixed_window_limiter_exhausts_and_resets() -> None:
    now = [100.0]
    limiter = FixedWindowRateLimiter(limit=2, window_seconds=10, clock=lambda: now[0])

    first = limiter.check("key")
    second = limiter.check("key")
    third = limiter.check("key")
    assert first.allowed is True
    assert first.remaining == 1
    assert second.allowed is True
    assert second.remaining == 0
    assert third.allowed is False
    assert third.retry_after == 10
    assert rate_limit_headers(third)["Retry-After"] == "10"

    now[0] = 110.0
    reset = limiter.check("key")
    assert reset.allowed is True
    assert reset.remaining == 1


def test_transport_key_is_not_reversible_input() -> None:
    key = transport_key("192.0.2.10", "https://baluarte.example")
    assert len(key) == 64
    assert "192.0.2.10" not in key
    assert "baluarte.example" not in key


def test_audit_event_is_categorical_and_redacted() -> None:
    event = build_claims_audit_event(
        status_code=429,
        origin_is_allowed=False,
        rate_limited=True,
        decision="not-authorized",
        request_id_present=True,
    )
    assert event == {
        "event": "server_claims_request",
        "method": "GET",
        "route": "/claims/observe",
        "statusClass": "4xx",
        "originAllowed": False,
        "rateLimited": True,
        "decision": "not-authorized",
        "requestIdPresent": True,
    }
    assert "Authorization" not in str(event)
    assert "subject" not in str(event)
    assert "token" not in str(event)
    assert "rawClaims" not in str(event)


if __name__ == "__main__":
    test_allowed_origins_are_exact_and_wildcards_fail_closed()
    test_cors_headers_are_explicit_and_never_wildcard()
    test_fixed_window_limiter_exhausts_and_resets()
    test_transport_key_is_not_reversible_input()
    test_audit_event_is_categorical_and_redacted()
    print("transport security: 5/5")
