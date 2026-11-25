import re
import hashlib
import secrets
import unicodedata
from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import WorkspaceAccess, get_current_claims, get_workspace_access, require_workspace_role
from app.db.session import get_db
from app.models.profile import Profile
from app.models.workspace import Workspace, WorkspaceInvitation, WorkspaceMember
from app.schemas.workspace import (
    WorkspaceCreateRequest,
    WorkspaceInvitationCreateRequest,
    WorkspaceInvitationResponse,
    WorkspaceMemberResponse,
    WorkspaceResponse,
    WorkspaceUpdateRequest,
)

router = APIRouter(prefix="/workspaces", tags=["workspaces"])


def _workspace_name(claims: dict[str, Any]) -> str:
    metadata = claims.get("user_metadata")
    if isinstance(metadata, dict):
        company_name = metadata.get("company_name")
        if isinstance(company_name, str) and company_name.strip():
            return company_name.strip()[:120]
        full_name = metadata.get("full_name")
        if isinstance(full_name, str) and full_name.strip():
            return f"{full_name.strip()[:100]}'s workspace"
    return "My workspace"


def _slug_base(name: str) -> str:
    ascii_name = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_name.lower()).strip("-")
    return slug[:70].rstrip("-") or "workspace"


def _first_membership(db: Session, user_id: UUID):
    return db.execute(
        select(Workspace, WorkspaceMember.role)
        .join(WorkspaceMember, WorkspaceMember.workspace_id == Workspace.id)
        .where(WorkspaceMember.user_id == user_id)
        .order_by(Workspace.created_at, Workspace.id)
        .limit(1)
    ).first()


def _to_response(workspace: Workspace, role: str) -> WorkspaceResponse:
    return WorkspaceResponse(
        id=workspace.id,
        name=workspace.name,
        slug=workspace.slug,
        description=workspace.description,
        role=role,
        created_at=workspace.created_at,
    )


@router.get("", response_model=list[WorkspaceResponse], summary="List the current user's workspaces")
def list_workspaces(
    claims: dict[str, Any] = Depends(get_current_claims),
    db: Session = Depends(get_db),
) -> list[WorkspaceResponse]:
    user_id = UUID(claims["sub"])
    rows = db.execute(
        select(Workspace, WorkspaceMember.role)
        .join(WorkspaceMember, WorkspaceMember.workspace_id == Workspace.id)
        .where(WorkspaceMember.user_id == user_id)
        .order_by(Workspace.created_at, Workspace.id)
    ).all()
    return [_to_response(workspace, role) for workspace, role in rows]


@router.post(
    "/onboarding",
    response_model=WorkspaceResponse,
    summary="Create or return the current user's initial workspace",
)
def ensure_initial_workspace(
    claims: dict[str, Any] = Depends(get_current_claims),
    db: Session = Depends(get_db),
) -> WorkspaceResponse:
    user_id = UUID(claims["sub"])
    existing = _first_membership(db, user_id)
    if existing:
        return _to_response(existing[0], existing[1])

    if db.get(Profile, user_id) is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Synchronize the authenticated profile before workspace onboarding",
        )

    name = _workspace_name(claims)
    base = _slug_base(name)
    for suffix in range(1, 11):
        candidate = base if suffix == 1 else f"{base[:70 - len(str(suffix)) - 1]}-{suffix}"
        collision = db.scalar(select(Workspace.id).where(Workspace.slug == candidate))
        if collision:
            continue

        workspace = Workspace(
            id=uuid4(),
            name=name,
            slug=candidate,
            created_by=user_id,
        )
        db.add(workspace)
        db.add(WorkspaceMember(workspace_id=workspace.id, user_id=user_id, role="OWNER"))
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            # A concurrent retry for the same account may have completed first.
            existing = _first_membership(db, user_id)
            if existing:
                return _to_response(existing[0], existing[1])
            continue

        db.refresh(workspace)
        return _to_response(workspace, "OWNER")

    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="Could not allocate a unique workspace slug; please retry",
    )


@router.post(
    "",
    response_model=WorkspaceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a workspace owned by the current user",
)
def create_workspace(
    payload: WorkspaceCreateRequest,
    claims: dict[str, Any] = Depends(get_current_claims),
    db: Session = Depends(get_db),
) -> WorkspaceResponse:
    user_id = UUID(claims["sub"])
    if db.get(Profile, user_id) is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Synchronize the authenticated profile before creating a workspace",
        )

    base = _slug_base(payload.name)
    for suffix in range(1, 11):
        candidate = base if suffix == 1 else f"{base[:70 - len(str(suffix)) - 1]}-{suffix}"
        if db.scalar(select(Workspace.id).where(Workspace.slug == candidate)):
            continue

        workspace = Workspace(
            id=uuid4(),
            name=payload.name,
            slug=candidate,
            description=payload.description,
            created_by=user_id,
        )
        db.add(workspace)
        db.add(WorkspaceMember(workspace_id=workspace.id, user_id=user_id, role="OWNER"))
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            continue

        db.refresh(workspace)
        return _to_response(workspace, "OWNER")

    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="Could not allocate a unique workspace slug; please retry",
    )


@router.get(
    "/{workspace_id}",
    response_model=WorkspaceResponse,
    summary="Get a workspace the current user belongs to",
)
def get_workspace(access: WorkspaceAccess = Depends(get_workspace_access)) -> WorkspaceResponse:
    return _to_response(access.workspace, access.membership.role)


@router.patch(
    "/{workspace_id}",
    response_model=WorkspaceResponse,
    summary="Update workspace details (owner or admin)",
)
def update_workspace(
    payload: WorkspaceUpdateRequest,
    access: WorkspaceAccess = Depends(require_workspace_role("OWNER", "ADMIN")),
    db: Session = Depends(get_db),
) -> WorkspaceResponse:
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(access.workspace, field, value)
    db.commit()
    db.refresh(access.workspace)
    return _to_response(access.workspace, access.membership.role)


@router.get(
    "/{workspace_id}/members",
    response_model=list[WorkspaceMemberResponse],
    summary="List workspace members (owner or admin)",
)
def list_workspace_members(
    access: WorkspaceAccess = Depends(require_workspace_role("OWNER", "ADMIN")),
    db: Session = Depends(get_db),
) -> list[WorkspaceMemberResponse]:
    rows = db.execute(
        select(WorkspaceMember, Profile)
        .join(Profile, Profile.id == WorkspaceMember.user_id)
        .where(WorkspaceMember.workspace_id == access.workspace.id)
        .order_by(WorkspaceMember.created_at, WorkspaceMember.user_id)
    ).all()
    return [
        WorkspaceMemberResponse(
            user_id=member.user_id,
            email=profile.email,
            full_name=profile.full_name,
            role=member.role,
            joined_at=member.created_at,
        )
        for member, profile in rows
    ]


@router.post(
    "/{workspace_id}/members/invitations",
    response_model=WorkspaceInvitationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Invite a member to a workspace (owner or admin)",
)
def create_workspace_invitation(
    payload: WorkspaceInvitationCreateRequest,
    access: WorkspaceAccess = Depends(require_workspace_role("OWNER", "ADMIN")),
    db: Session = Depends(get_db),
) -> WorkspaceInvitationResponse:
    now = datetime.now(UTC)
    existing_row = db.execute(
        select(WorkspaceInvitation).where(
            WorkspaceInvitation.workspace_id == access.workspace.id,
            WorkspaceInvitation.email == payload.email,
            WorkspaceInvitation.status == "PENDING",
        )
    ).first()
    if existing_row is not None:
        existing = existing_row[0]
        if existing.expires_at > now:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A pending invitation already exists for this email",
            )
        existing.status = "EXPIRED"

    raw_token = secrets.token_urlsafe(32)
    invitation = WorkspaceInvitation(
        id=uuid4(),
        workspace_id=access.workspace.id,
        email=payload.email,
        role=payload.role,
        token_hash=hashlib.sha256(raw_token.encode("utf-8")).hexdigest(),
        status="PENDING",
        invited_by=access.membership.user_id,
        expires_at=now + timedelta(days=7),
    )
    db.add(invitation)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A pending invitation already exists for this email",
        ) from error
    db.refresh(invitation)

    return WorkspaceInvitationResponse(
        id=invitation.id,
        workspace_id=invitation.workspace_id,
        email=invitation.email,
        role=invitation.role,
        status=invitation.status,
        expires_at=invitation.expires_at,
        created_at=invitation.created_at,
        invitation_token=raw_token,
    )
