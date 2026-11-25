import re
import unicodedata
from typing import Any
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import WorkspaceAccess, get_current_claims, get_workspace_access, require_workspace_role
from app.db.session import get_db
from app.models.profile import Profile
from app.models.workspace import Workspace, WorkspaceMember
from app.schemas.workspace import WorkspaceResponse, WorkspaceUpdateRequest

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
