"""A real SQLAlchemy database in memory, for tests whose queries matter.

It covers query logic, not PostgreSQL behaviour such as Row Level Security,
which is tested in tests/postgres.
"""

from contextlib import contextmanager

from sqlalchemy import CheckConstraint, create_engine, event, text
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.models import support, workspace  # noqa: F401  (register every table)
from app.models.profile import _auth_metadata


@contextmanager
def _sqlite_compatible_tables():
    """Temporarily remove the PostgreSQL-only parts of the table definitions."""
    saved_constraints = {}
    saved_actions = []
    for table in Base.metadata.tables.values():
        saved_constraints[table] = set(table.constraints)
        table.constraints = {
            item for item in table.constraints
            if not (isinstance(item, CheckConstraint) and ("btrim" in str(item.sqltext) or "~" in str(item.sqltext)))
        }
        for key in table.foreign_key_constraints:
            if key.ondelete and "(" in key.ondelete:
                saved_actions.append((key, key.ondelete))
                key.ondelete = "SET NULL"
    index = next(
        item for item in workspace.WorkspaceInvitation.__table__.indexes
        if item.name == "uq_workspace_invitations_pending_email"
    )
    index.dialect_options["sqlite"]["where"] = text("status = 'PENDING'")
    try:
        yield
    finally:
        for table, constraints in saved_constraints.items():
            table.constraints = constraints
        for key, action in saved_actions:
            key.ondelete = action


def create_sqlite_engine():
    engine = create_engine("sqlite://", poolclass=StaticPool, connect_args={"check_same_thread": False})

    @event.listens_for(engine, "connect")
    def prepare(connection, _record):
        for schema in ("public", "auth"):
            connection.execute(f"ATTACH DATABASE ':memory:' AS {schema}")
        # Stands in for PostgreSQL's function used to scope a transaction to a workspace.
        connection.create_function("set_config", 3, lambda _name, value, _local: value)

    with _sqlite_compatible_tables():
        _auth_metadata.create_all(engine)
        Base.metadata.create_all(engine)
    return engine
