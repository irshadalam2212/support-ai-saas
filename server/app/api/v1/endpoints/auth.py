from typing import Any

from fastapi import APIRouter, Depends

from app.api.deps import get_current_claims
from app.schemas.auth import CurrentUserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me", response_model=CurrentUserResponse, summary="Get authenticated user")
def get_authenticated_user(claims: dict[str, Any] = Depends(get_current_claims)) -> CurrentUserResponse:
    return CurrentUserResponse(id=claims["sub"], email=claims.get("email"))
