import hashlib
from datetime import UTC, datetime
from typing import Any, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_claims
from app.db.session import get_db
from app.models.profile import Profile
from app.models.workspace import WorkspaceInvitation, WorkspaceMember
from app.schemas.workspace import InvitationDecisionRequest, InvitationDecisionResponse

router = APIRouter(prefix="/invitations", tags=["invitations"])


def _load_invitation(
    payload: InvitationDecisionRequest,
    claims: dict[str, Any],
    db: Session,
) -> tuple[WorkspaceInvitation, UUID]:
    token_hash = hashlib.sha256(payload.invitation_token.encode("utf-8")).hexdigest()
    row = db.execute(
        select(WorkspaceInvitation)
        .where(WorkspaceInvitation.token_hash == token_hash)
        .with_for_update()
    ).first()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")

    invitation = row[0]
    account_email = claims.get("email")
    if not isinstance(account_email, str) or account_email.strip().lower() != invitation.email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This invitation belongs to a different email address",
        )

    now = datetime.now(UTC)
    if invitation.status == "PENDING" and invitation.expires_at <= now:
        invitation.status = "EXPIRED"
        db.commit()
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Invitation has expired")
    if invitation.status == "EXPIRED":
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Invitation has expired")
    if invitation.status == "REVOKED":
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Invitation has been revoked")
    if invitation.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Invitation has already been used",
        )

    user_id = UUID(claims["sub"])
    if db.get(Profile, user_id) is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Synchronize the authenticated profile before accepting an invitation",
        )
    return invitation, user_id


def _decide_invitation(
    payload: InvitationDecisionRequest,
    claims: dict[str, Any],
    db: Session,
    decision: Literal["ACCEPTED", "DECLINED"],
) -> InvitationDecisionResponse:
    invitation, user_id = _load_invitation(payload, claims, db)
    if decision == "ACCEPTED":
        existing_member = db.execute(
            select(WorkspaceMember).where(
                WorkspaceMember.workspace_id == invitation.workspace_id,
                WorkspaceMember.user_id == user_id,
            )
        ).first()
        if existing_member is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You are already a member of this workspace",
            )
        db.add(
            WorkspaceMember(
                workspace_id=invitation.workspace_id,
                user_id=user_id,
                role=invitation.role,
            )
        )

    invitation.status = decision
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Invitation could not be accepted because workspace membership changed",
        ) from error
    return InvitationDecisionResponse(
        invitation_id=invitation.id,
        workspace_id=invitation.workspace_id,
        role=invitation.role,
        status=decision,
    )


@router.post("/accept", response_model=InvitationDecisionResponse, summary="Accept a workspace invitation")
def accept_invitation(
    payload: InvitationDecisionRequest,
    claims: dict[str, Any] = Depends(get_current_claims),
    db: Session = Depends(get_db),
) -> InvitationDecisionResponse:
    return _decide_invitation(payload, claims, db, "ACCEPTED")


@router.post("/decline", response_model=InvitationDecisionResponse, summary="Decline a workspace invitation")
def decline_invitation(
    payload: InvitationDecisionRequest,
    claims: dict[str, Any] = Depends(get_current_claims),
    db: Session = Depends(get_db),
) -> InvitationDecisionResponse:
    return _decide_invitation(payload, claims, db, "DECLINED")
