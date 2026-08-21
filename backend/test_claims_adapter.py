from claims_adapter import (
    SERVER_VALIDATED_SOURCE,
    extract_bearer_token,
    observe_bearer_claims,
    project_server_claims,
    project_verified_supabase_payload,
    verify_supabase_access_token,
)


VALID_CLAIMS = {
    "issuer": "supabase-auth",
    "subject": "user-1",
    "audience": "authenticated",
    "scopes": ["platform:observe", "module:read", "module:execute"],
    "issuedAt": 10_000,
    "expiresAt": 20_000,
    "requestId": "claims-python-0001",
    "source": SERVER_VALIDATED_SOURCE,
    "authenticated": True,
}


def test_missing_server_configuration_denies_without_token() -> None:
    snapshot = observe_bearer_claims(
        "Bearer token-that-must-not-appear",
        base_url=None,
        anon_key=None,
        now_ms=12_000,
    )

    assert snapshot["identity"]["authenticated"] is False
    assert snapshot["scopes"]["accepted"] == []
    assert snapshot["decision"] == "not-authorized"
    assert "token-that-must-not-appear" not in str(snapshot)


def test_bearer_parser_rejects_malformed_headers() -> None:
    assert extract_bearer_token("Bearer abc.def-123") == "abc.def-123"
    assert extract_bearer_token("Basic abc.def-123") is None
    assert extract_bearer_token("Bearer") is None
    assert extract_bearer_token("Bearer espaço inválido") is None
    assert extract_bearer_token(None) is None


def test_validated_claims_accept_only_read_scopes() -> None:
    snapshot = project_server_claims(VALID_CLAIMS, now_ms=12_000)

    assert snapshot["identity"]["trustedSource"] is True
    assert snapshot["validity"]["fresh"] is True
    assert snapshot["scopes"]["accepted"] == ["platform:observe", "module:read"]
    assert snapshot["scopes"]["rejected"] == ["module:execute"]
    assert snapshot["authority"] == "not-authorized"
    assert snapshot["decision"] == "not-authorized"


def test_supabase_user_response_is_redacted_and_has_no_implicit_scopes() -> None:
    seen = {}

    def fake_http_get(url, headers, timeout):
        seen.update({"url": url, "headers": dict(headers), "timeout": timeout})
        return 200, b'{"id":"user-1","email":"private@example.com","app_metadata":{"role":"admin"}}'

    claims = verify_supabase_access_token(
        "token-value-that-stays-server-side",
        base_url="https://example.supabase.co/",
        anon_key="public-anon-key",
        http_get=fake_http_get,
    )
    assert claims == {
        "issuer": "supabase-auth",
        "subject": "user-1",
        "audience": "authenticated",
        "role": "admin",
        "scopes": ["platform:observe", "registry:read", "module:read"],
        "source": "server-validated",
        "authenticated": True,
    }
    assert seen["url"] == "https://example.supabase.co/auth/v1/user"
    assert seen["headers"]["Authorization"] == "Bearer token-value-that-stays-server-side"
    assert seen["timeout"] == 4.0

    snapshot = observe_bearer_claims(
        "Bearer token-value-that-stays-server-side",
        base_url="https://example.supabase.co",
        anon_key="public-anon-key",
        now_ms=12_000,
        http_get=fake_http_get,
    )
    assert snapshot["identity"]["authenticated"] is True
    assert snapshot["scopes"]["accepted"] == []
    assert "private@example.com" not in str(snapshot)
    assert "admin" not in str(snapshot)


def test_verified_jwt_payload_provides_ttl_and_role_scopes_without_decoding_locally() -> None:
    claims = project_verified_supabase_payload({
        "sub": "user-1",
        "iss": "supabase-auth",
        "aud": "authenticated",
        "role": "admin",
        "iat": 10,
        "exp": 20,
    })
    assert claims is not None
    snapshot = project_server_claims(claims, now_ms=12_000)
    assert snapshot["identity"]["roleRecognized"] is True
    assert snapshot["validity"]["fresh"] is True
    assert snapshot["scopes"]["accepted"] == ["platform:observe", "registry:read", "module:read"]
    assert snapshot["decision"] == "not-authorized"

    assert project_verified_supabase_payload({"sub": "user-1", "iss": "supabase-auth"}) is None


def test_unknown_role_never_receives_implicit_scopes() -> None:
    claims = project_verified_supabase_payload({
        "sub": "user-1",
        "iss": "supabase-auth",
        "aud": "authenticated",
        "role": "billing-admin",
        "iat": 10,
        "exp": 20,
    })
    assert claims is not None
    snapshot = project_server_claims(claims, now_ms=12_000)
    assert snapshot["identity"]["roleRecognized"] is False
    assert snapshot["scopes"]["accepted"] == []


def test_failed_identity_lookup_denies_without_error_details() -> None:
    def failing_http_get(url, headers, timeout):
        return 401, b'{"msg":"invalid token with private details"}'

    snapshot = observe_bearer_claims(
        "Bearer invalid-token-value",
        base_url="https://example.supabase.co",
        anon_key="public-anon-key",
        now_ms=12_000,
        http_get=failing_http_get,
    )
    assert snapshot["identity"]["authenticated"] is False
    assert snapshot["scopes"]["accepted"] == []
    assert "invalid token with private details" not in str(snapshot)
    assert snapshot["authority"] == "not-authorized"


if __name__ == "__main__":
    test_missing_server_configuration_denies_without_token()
    test_bearer_parser_rejects_malformed_headers()
    test_validated_claims_accept_only_read_scopes()
    test_supabase_user_response_is_redacted_and_has_no_implicit_scopes()
    test_verified_jwt_payload_provides_ttl_and_role_scopes_without_decoding_locally()
    test_unknown_role_never_receives_implicit_scopes()
    test_failed_identity_lookup_denies_without_error_details()
    print("backend claims adapter: 7/7")
