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
from app.models.workspace import Workspace, WorkspaceInvitation, WorkspaceMember
from app.schemas.workspace import (
    InvitationDecisionRequest,
    InvitationDecisionResponse,
    InvitationPreviewResponse,
)

router = APIRouter(prefix="/invitations", tags=["invitations"])


def _find_invitation(db: Session, token: str, *, lock: bool = False) -> WorkspaceInvitation:
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    statement = select(WorkspaceInvitation).where(WorkspaceInvitation.token_hash == token_hash)
    row = db.execute(statement.with_for_update() if lock else statement).first()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")
    return row[0]


def _require_pending(invitation: WorkspaceInvitation) -> None:
    """Explain why an invitation that is no longer pending cannot be used."""
    if invitation.status == "EXPIRED":
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Invitation has expired")
    if invitation.status == "REVOKED":
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Invitation has been revoked")
    if invitation.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Invitation has already been used",
        )


def _load_invitation(
    payload: InvitationDecisionRequest,
    claims: dict[str, Any],
    db: Session,
) -> tuple[WorkspaceInvitation, UUID]:
    invitation = _find_invitation(db, payload.invitation_token, lock=True)
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
    _require_pending(invitation)

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


@router.post(
    "/preview",
    response_model=InvitationPreviewResponse,
    summary="Show a pending invitation to whoever holds its link",
)
def preview_invitation(
    payload: InvitationDecisionRequest,
    db: Session = Depends(get_db),
) -> InvitationPreviewResponse:
    """No sign-in is required, so that an invited person can see what they were invited to.

    The secret token is the only credential. It is sent in the body to keep it out of
    access logs, and this endpoint never changes anything.
    """
    invitation = _find_invitation(db, payload.invitation_token)
    if invitation.status == "PENDING" and invitation.expires_at <= datetime.now(UTC):
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Invitation has expired")
    _require_pending(invitation)

    workspace = db.get(Workspace, invitation.workspace_id)
    if workspace is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")
    return InvitationPreviewResponse(
        workspace_name=workspace.name,
        email=invitation.email,
        role=invitation.role,
        expires_at=invitation.expires_at,
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
