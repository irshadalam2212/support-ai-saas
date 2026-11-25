"""Change a member's role, remove a member, or transfer workspace ownership."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import WorkspaceAccess, require_workspace_role
from app.db.session import get_db
from app.models.profile import Profile
from app.models.workspace import WorkspaceInvitation, WorkspaceMember
from app.schemas.workspace import (
    WorkspaceMemberResponse,
    WorkspaceMemberRoleUpdateRequest,
    WorkspaceResponse,
)

router = APIRouter(prefix="/workspaces/{workspace_id}/members", tags=["members"])

# The member roles each actor may change or remove. OWNER never appears as a
# target, so ownership only ever moves through the transfer endpoint, which
# always leaves exactly one owner.
MANAGEABLE_ROLES: dict[str, frozenset[str]] = {
    "OWNER": frozenset({"ADMIN", "AGENT", "CUSTOMER"}),
    "ADMIN": frozenset({"AGENT", "CUSTOMER"}),
}


def _lock_member(db: Session, workspace_id: UUID, user_id: UUID) -> WorkspaceMember:
    """Lock a membership row and return its current values, or raise 404."""
    row = db.execute(
        select(WorkspaceMember)
        .where(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.user_id == user_id,
        )
        .with_for_update()
        # Replace any copy loaded before the lock was held.
        .execution_options(populate_existing=True)
    ).first()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    return row[0]


def _load_manageable_member(db: Session, access: WorkspaceAccess, user_id: UUID) -> WorkspaceMember:
    """Lock and return a member of this workspace that the caller may manage."""
    member = _lock_member(db, access.workspace.id, user_id)
    if member.role == "OWNER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The workspace owner cannot be changed or removed",
        )
    if member.role not in MANAGEABLE_ROLES[access.membership.role]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the workspace owner can change or remove an admin",
        )
    return member


def _revoke_pending_invitations(
    db: Session,
    workspace_id: UUID,
    *,
    invited_by: UUID,
    email: str | None = None,
) -> None:
    """Revoke pending invitations sent by a member and, optionally, sent to their email."""
    rows = db.execute(
        select(WorkspaceInvitation)
        .where(
            WorkspaceInvitation.workspace_id == workspace_id,
            WorkspaceInvitation.status == "PENDING",
        )
        .with_for_update()
    ).all()
    for row in rows:
        invitation = row[0]
        if invitation.invited_by == invited_by or (email is not None and invitation.email == email):
            invitation.status = "REVOKED"


@router.patch(
    "/{user_id}",
    response_model=WorkspaceMemberResponse,
    summary="Change a member's role (owner or admin)",
)
def update_member_role(
    user_id: UUID,
    payload: WorkspaceMemberRoleUpdateRequest,
    access: WorkspaceAccess = Depends(require_workspace_role("OWNER", "ADMIN")),
    db: Session = Depends(get_db),
) -> WorkspaceMemberResponse:
    member = _load_manageable_member(db, access, user_id)
    previous_role = member.role
    member.role = payload.role

    # Someone who stops being an admin may no longer invite people.
    if previous_role == "ADMIN" and payload.role != "ADMIN":
        _revoke_pending_invitations(db, access.workspace.id, invited_by=user_id)

    db.commit()
    db.refresh(member)
    profile = db.get(Profile, user_id)
    return WorkspaceMemberResponse(
        user_id=member.user_id,
        email=profile.email if profile else None,
        full_name=profile.full_name if profile else None,
        role=member.role,
        joined_at=member.created_at,
    )


@router.post(
    "/{user_id}/transfer-ownership",
    response_model=WorkspaceResponse,
    summary="Transfer workspace ownership to an admin (owner)",
)
def transfer_ownership(
    user_id: UUID,
    access: WorkspaceAccess = Depends(require_workspace_role("OWNER")),
    db: Session = Depends(get_db),
) -> WorkspaceResponse:
    """Make an admin the owner. The caller becomes an admin."""
    workspace = access.workspace
    # Lock the caller first and check again: a concurrent transfer may have finished.
    owner = _lock_member(db, workspace.id, access.membership.user_id)
    if owner.role != "OWNER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your workspace role cannot perform this action",
        )

    new_owner = _lock_member(db, workspace.id, user_id)
    if new_owner.user_id == owner.user_id:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You already own this workspace")
    if new_owner.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ownership can only be transferred to an admin",
        )

    owner.role = "ADMIN"
    new_owner.role = "OWNER"
    db.commit()
    db.refresh(workspace)
    return WorkspaceResponse(
        id=workspace.id,
        name=workspace.name,
        slug=workspace.slug,
        description=workspace.description,
        role="ADMIN",
        created_at=workspace.created_at,
    )


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove a member from a workspace (owner or admin)",
)
def remove_member(
    user_id: UUID,
    access: WorkspaceAccess = Depends(require_workspace_role("OWNER", "ADMIN")),
    db: Session = Depends(get_db),
) -> None:
    member = _load_manageable_member(db, access, user_id)
    profile = db.get(Profile, user_id)

    # Otherwise a pending invitation could be used to get straight back in.
    _revoke_pending_invitations(
        db,
        access.workspace.id,
        invited_by=user_id,
        email=profile.email if profile else None,
    )
    db.delete(member)
    db.commit()
