from claims_adapter import project_server_claims
from health_contract import project_server_health
from observation_contract import project_server_observation


VALID_CLAIMS = {
    "issuer": "supabase-auth",
    "subject": "user-1",
    "audience": "authenticated",
    "role": "admin",
    "scopes": ["platform:observe", "registry:read", "module:read"],
    "issuedAt": 10_000,
    "expiresAt": 20_000,
    "source": "server-validated",
    "authenticated": True,
}


def test_healthy_and_fresh_evidence_is_available_without_authority() -> None:
    observation = project_server_observation(
        project_server_health(model="gemini-test", has_key=True),
        project_server_claims(VALID_CLAIMS, now_ms=12_000),
        origin_allowed=True,
    )
    assert observation["contractVersion"] == "server-observation/v1"
    assert observation["evidence"]["healthObserved"] is True
    assert observation["evidence"]["claimsObserved"] is True
    assert observation["evidence"]["claimsFresh"] is True
    assert observation["evidence"]["severity"] == "none"
    assert observation["evidence"]["fallback"] == "available"
    assert observation["evidence"]["reasonCodes"] == ["observation-ready"]
    assert observation["transport"]["originAllowed"] is True
    assert observation["authority"] == "not-authorized"


def test_degraded_health_and_absent_claims_are_not_ready() -> None:
    observation = project_server_observation(
        project_server_health(model="gemini-test", has_key=False),
        project_server_claims(None, now_ms=12_000),
    )
    assert observation["evidence"]["severity"] == "warning"
    assert observation["evidence"]["fallback"] == "degraded"
    assert observation["evidence"]["reasonCodes"] == ["health-degraded", "claims-absent"]
    assert observation["authority"] == "not-authorized"


def test_stale_claims_are_observed_without_freshness_or_permission() -> None:
    observation = project_server_observation(
        project_server_health(model="gemini-test", has_key=True),
        project_server_claims({**VALID_CLAIMS, "issuedAt": 1_000, "expiresAt": 2_000}, now_ms=12_000),
    )
    assert observation["evidence"]["claimsObserved"] is True
    assert observation["evidence"]["claimsFresh"] is False
    assert observation["evidence"]["reasonCodes"] == ["claims-stale"]
    assert observation["evidence"]["fallback"] == "degraded"
    assert observation["authority"] == "not-authorized"


def test_rate_limited_evidence_is_warning_and_contains_no_identity() -> None:
    observation = project_server_observation(
        project_server_health(model="gemini-test", has_key=True),
        project_server_claims(None),
        origin_allowed=False,
        rate_limited=True,
    )
    assert observation["evidence"]["reasonCodes"] == ["claims-absent", "rate-limited"]
    assert observation["transport"]["rateLimited"] is True
    assert observation["evidence"]["severity"] == "warning"
    assert observation["authority"] == "not-authorized"
    assert "user-1" not in str(observation)
    assert "Authorization" not in str(observation)
    assert "raw-claims-value" not in str(observation)


if __name__ == "__main__":
    test_healthy_and_fresh_evidence_is_available_without_authority()
    test_degraded_health_and_absent_claims_are_not_ready()
    test_stale_claims_are_observed_without_freshness_or_permission()
    test_rate_limited_evidence_is_warning_and_contains_no_identity()
    print("observation contract: 4/4")
