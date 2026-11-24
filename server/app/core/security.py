from functools import lru_cache
from typing import Any
from uuid import UUID

import httpx
import jwt
from fastapi import HTTPException, status
from jwt import PyJWKClient
from jwt.exceptions import PyJWKClientConnectionError, PyJWKClientError, PyJWTError

from app.core.config import get_settings

ASYMMETRIC_ALGORITHMS = ("ES256", "RS256")
SYMMETRIC_ALGORITHMS = ("HS256",)


@lru_cache(maxsize=4)
def _get_jwks_client(jwks_url: str) -> PyJWKClient:
    # Supabase's JWKS edge cache is ten minutes; keep our cache at that limit.
    return PyJWKClient(jwks_url, cache_jwk_set=True, lifespan=600, timeout=5)


def _unauthorized() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired access token",
        headers={"WWW-Authenticate": "Bearer"},
    )


def _claims_from_remote_auth(token: str, issuer: str, publishable_key: str) -> dict[str, Any]:
    """Validate legacy HS256 tokens through Supabase Auth, which holds the secret."""
    try:
        response = httpx.get(
            f"{issuer}/user",
            headers={"apikey": publishable_key, "Authorization": f"Bearer {token}"},
            timeout=5,
        )
    except httpx.RequestError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase Auth is temporarily unavailable",
        ) from error

    if response.status_code in (401, 403):
        raise _unauthorized()
    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase Auth is temporarily unavailable",
        )

    try:
        remote_user = response.json()
        claims = jwt.decode(
            token,
            key="",
            algorithms=list(SYMMETRIC_ALGORITHMS),
            issuer=issuer,
            audience="authenticated",
            options={
                "verify_signature": False,
                "verify_exp": True,
                "verify_iss": True,
                "verify_aud": True,
                "require": ["exp", "iss", "aud", "sub", "role"],
            },
        )
    except (ValueError, PyJWTError):
        raise _unauthorized() from None

    if not isinstance(remote_user, dict) or remote_user.get("id") != claims.get("sub"):
        raise _unauthorized()
    return claims


def verify_supabase_access_token(token: str) -> dict[str, Any]:
    settings = get_settings()
    if not settings.supabase_url:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase Auth is not configured",
        )

    issuer = f"{settings.supabase_url.rstrip('/')}/auth/v1"
    jwks_url = f"{issuer}/.well-known/jwks.json"

    try:
        header = jwt.get_unverified_header(token)
        algorithm = header.get("alg")
        if algorithm in ASYMMETRIC_ALGORITHMS:
            signing_key = _get_jwks_client(jwks_url).get_signing_key_from_jwt(token).key
            claims = jwt.decode(
                token,
                signing_key,
                algorithms=[algorithm],
                issuer=issuer,
                audience="authenticated",
                options={"require": ["exp", "iss", "aud", "sub", "role"]},
            )
        elif algorithm in SYMMETRIC_ALGORITHMS:
            if not settings.supabase_publishable_key:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Supabase publishable key is required to validate this token",
                )
            claims = _claims_from_remote_auth(token, issuer, settings.supabase_publishable_key)
        else:
            raise _unauthorized()
    except PyJWKClientConnectionError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase signing keys are temporarily unavailable",
        ) from error
    except PyJWKClientError:
        raise _unauthorized() from None
    except PyJWTError:
        raise _unauthorized() from None

    subject = claims.get("sub")
    if claims.get("role") != "authenticated" or not isinstance(subject, str):
        raise _unauthorized()
    try:
        UUID(subject)
    except ValueError:
        raise _unauthorized() from None
    return claims
