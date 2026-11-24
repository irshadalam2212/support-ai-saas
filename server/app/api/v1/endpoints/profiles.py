from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_claims
from app.db.session import get_db
from app.models.profile import Profile
from app.schemas.profile import ProfileResponse

router = APIRouter(prefix="/profiles", tags=["profiles"])


def _profile_values(claims: dict[str, Any]) -> tuple[UUID, str | None, str | None]:
    user_metadata = claims.get("user_metadata")
    full_name = user_metadata.get("full_name") if isinstance(user_metadata, dict) else None
    if not isinstance(full_name, str) or not full_name.strip():
        full_name = None
    else:
        full_name = full_name.strip()[:120]

    email = claims.get("email")
    if not isinstance(email, str) or not email.strip():
        email = None
    else:
        email = email.strip().lower()
        if len(email) > 320:
            email = None

    return UUID(claims["sub"]), email, full_name


def _upsert_profile(db: Session, claims: dict[str, Any]) -> Profile:
    profile_id, email, full_name = _profile_values(claims)
    profile = db.get(Profile, profile_id)
    if profile is None:
        profile = Profile(id=profile_id, email=email, full_name=full_name)
        db.add(profile)
    else:
        if email is not None:
            profile.email = email
        if full_name is not None:
            profile.full_name = full_name

    try:
        db.commit()
    except IntegrityError:
        # Another request may have created the profile between get() and insert.
        db.rollback()
        profile = db.get(Profile, profile_id)
        if profile is None:
            raise
        if email is not None:
            profile.email = email
        if full_name is not None:
            profile.full_name = full_name
        db.commit()

    db.refresh(profile)
    return profile


@router.post("/me", response_model=ProfileResponse, summary="Synchronize the authenticated user's profile")
def sync_my_profile(
    claims: dict[str, Any] = Depends(get_current_claims),
    db: Session = Depends(get_db),
) -> ProfileResponse:
    profile = _upsert_profile(db, claims)
    return ProfileResponse.model_validate(profile)


@router.get("/me", response_model=ProfileResponse, summary="Get the authenticated user's profile")
def get_my_profile(
    claims: dict[str, Any] = Depends(get_current_claims),
    db: Session = Depends(get_db),
) -> ProfileResponse:
    profile = db.get(Profile, UUID(claims["sub"]))
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile has not been synchronized")
    return ProfileResponse.model_validate(profile)
