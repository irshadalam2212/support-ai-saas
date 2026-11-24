import asyncio
from datetime import UTC, datetime, timedelta
from types import SimpleNamespace
from uuid import uuid4

import httpx
import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi import HTTPException
from httpx import ASGITransport, AsyncClient

from app.core import security
from app.main import app

SUPABASE_URL = "https://project.example"
ISSUER = f"{SUPABASE_URL}/auth/v1"
USER_ID = str(uuid4())


@pytest.fixture
def signing_key():
    return rsa.generate_private_key(public_exponent=65537, key_size=2048)


def make_claims(**overrides):
    claims = {
        "sub": USER_ID,
        "aud": "authenticated",
        "iss": ISSUER,
        "exp": datetime.now(UTC) + timedelta(minutes=2),
        "iat": datetime.now(UTC),
        "role": "authenticated",
        "email": "agent@example.com",
    }
    claims.update(overrides)
    return claims


def configure_jwks(monkeypatch, signing_key):
    monkeypatch.setattr(
        security,
        "get_settings",
        lambda: SimpleNamespace(supabase_url=SUPABASE_URL, supabase_publishable_key="publishable"),
    )
    client = SimpleNamespace(
        get_signing_key_from_jwt=lambda _token: SimpleNamespace(key=signing_key.public_key())
    )
    monkeypatch.setattr(security, "_get_jwks_client", lambda _url: client)


def make_asymmetric_token(signing_key, **claim_overrides):
    return jwt.encode(
        make_claims(**claim_overrides),
        signing_key,
        algorithm="RS256",
        headers={"kid": "test-key"},
    )


def test_valid_asymmetric_supabase_token_is_verified(monkeypatch, signing_key):
    configure_jwks(monkeypatch, signing_key)
    token = make_asymmetric_token(signing_key)

    claims = security.verify_supabase_access_token(token)

    assert claims["sub"] == USER_ID
    assert claims["email"] == "agent@example.com"


@pytest.mark.parametrize(
    "claim_overrides",
    [
        {"iss": "https://attacker.example/auth/v1"},
        {"aud": "anon"},
        {"exp": datetime.now(UTC) - timedelta(minutes=1)},
        {"role": "service_role"},
        {"sub": "not-a-uuid"},
    ],
)
def test_invalid_claims_are_rejected(monkeypatch, signing_key, claim_overrides):
    configure_jwks(monkeypatch, signing_key)
    token = make_asymmetric_token(signing_key, **claim_overrides)

    with pytest.raises(HTTPException) as error:
        security.verify_supabase_access_token(token)

    assert error.value.status_code == 401


def test_invalid_signature_is_rejected(monkeypatch, signing_key):
    configure_jwks(monkeypatch, signing_key)
    other_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    token = make_asymmetric_token(other_key)

    with pytest.raises(HTTPException) as error:
        security.verify_supabase_access_token(token)

    assert error.value.status_code == 401


def test_hs256_token_is_validated_by_supabase_auth(monkeypatch):
    secret = "test-only-shared-secret-with-32-bytes-minimum"
    monkeypatch.setattr(
        security,
        "get_settings",
        lambda: SimpleNamespace(supabase_url=SUPABASE_URL, supabase_publishable_key="publishable"),
    )
    token = jwt.encode(make_claims(), secret, algorithm="HS256")
    monkeypatch.setattr(
        security.httpx,
        "get",
        lambda url, headers, timeout: httpx.Response(
            200,
            json={"id": USER_ID},
            request=httpx.Request("GET", url),
        ),
    )

    claims = security.verify_supabase_access_token(token)

    assert claims["sub"] == USER_ID


def test_auth_endpoint_requires_a_bearer_token(monkeypatch, signing_key):
    configure_jwks(monkeypatch, signing_key)
    token = make_asymmetric_token(signing_key)

    async def request_endpoints():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            missing = await client.get("/api/v1/auth/me")
            valid = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
            return missing, valid

    missing, valid = asyncio.run(request_endpoints())

    assert missing.status_code == 401
    assert valid.status_code == 200
    assert valid.json() == {"id": USER_ID, "email": "agent@example.com"}
