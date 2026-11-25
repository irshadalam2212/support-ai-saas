from dataclasses import dataclass
from typing import Any
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import verify_supabase_access_token
from app.db.session import get_db
from app.models.workspace import Workspace, WorkspaceMember

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_claims(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict[str, Any]:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bearer access token required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return verify_supabase_access_token(credentials.credentials)


@dataclass(frozen=True)
class WorkspaceAccess:
    workspace: Workspace
    membership: WorkspaceMember


def get_workspace_access(
    workspace_id: UUID,
    claims: dict[str, Any] = Depends(get_current_claims),
    db: Session = Depends(get_db),
) -> WorkspaceAccess:
    """Resolve the requested tenant only when the verified user is a member."""
    user_id = UUID(claims["sub"])
    row = db.execute(
        select(Workspace, WorkspaceMember)
        .join(WorkspaceMember, WorkspaceMember.workspace_id == Workspace.id)
        .where(Workspace.id == workspace_id, WorkspaceMember.user_id == user_id)
    ).first()
    if row is None:
        # Do not disclose whether a workspace exists to a non-member.
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")
    return WorkspaceAccess(workspace=row[0], membership=row[1])


def require_workspace_role(*allowed_roles: str):
    if not allowed_roles:
        raise ValueError("At least one workspace role must be allowed")

    def dependency(access: WorkspaceAccess = Depends(get_workspace_access)) -> WorkspaceAccess:
        if access.membership.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your workspace role cannot perform this action",
            )
        return access

    return dependency
