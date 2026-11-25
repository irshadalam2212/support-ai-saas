"""Tell PostgreSQL which workspace a database session is working in.

Row Level Security on the support tables only shows the restricted API role the
rows of this workspace. The setting is local to one transaction, so it cannot
leak to another request through the connection pool, and it is applied again
automatically after each commit.

Call use_workspace only after the caller's membership has been verified.
"""

from uuid import UUID

from sqlalchemy import event, text
from sqlalchemy.orm import Session

_SESSION_KEY = "workspace_id"
_SET_WORKSPACE = text("SELECT set_config('app.workspace_id', :workspace_id, true)")


def use_workspace(db: Session, workspace_id: UUID) -> None:
    """Scope this session's current and future transactions to one workspace."""
    db.info[_SESSION_KEY] = str(workspace_id)
    if db.in_transaction():
        db.connection().execute(_SET_WORKSPACE, {"workspace_id": str(workspace_id)})


@event.listens_for(Session, "after_begin")
def _apply_workspace(session: Session, _transaction, connection) -> None:
    workspace_id = session.info.get(_SESSION_KEY)
    if workspace_id is not None:
        connection.execute(_SET_WORKSPACE, {"workspace_id": workspace_id})
