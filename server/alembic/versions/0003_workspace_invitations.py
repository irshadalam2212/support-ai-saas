"""Create secure workspace invitations.

Revision ID: 0003_workspace_invitations
Revises: 0002_workspaces
Create Date: 2026-11-25
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0003_workspace_invitations"
down_revision: Union[str, None] = "0002_workspaces"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "workspace_invitations",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("workspace_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=False),
        sa.Column("token_hash", sa.String(length=64), nullable=False),
        sa.Column("status", sa.String(length=20), server_default="PENDING", nullable=False),
        sa.Column("invited_by", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint(
            "role IN ('ADMIN', 'AGENT', 'CUSTOMER')",
            name="ck_workspace_invitations_role",
        ),
        sa.CheckConstraint(
            "status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'REVOKED', 'EXPIRED')",
            name="ck_workspace_invitations_status",
        ),
        sa.CheckConstraint("email = lower(email)", name="ck_workspace_invitations_email_lowercase"),
        sa.ForeignKeyConstraint(
            ["workspace_id"], ["public.workspaces.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["invited_by"], ["public.profiles.id"], ondelete="RESTRICT"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("token_hash", name="uq_workspace_invitations_token_hash"),
        schema="public",
    )
    op.create_index(
        "ix_workspace_invitations_workspace_id",
        "workspace_invitations",
        ["workspace_id"],
        schema="public",
    )
    op.create_index(
        "ix_workspace_invitations_email",
        "workspace_invitations",
        ["email"],
        schema="public",
    )
    op.create_index(
        "uq_workspace_invitations_pending_email",
        "workspace_invitations",
        ["workspace_id", "email"],
        unique=True,
        postgresql_where=sa.text("status = 'PENDING'"),
        schema="public",
    )

    # Invitations are managed only through FastAPI, which performs explicit
    # workspace and role checks. Browser roles receive no table privileges.
    op.execute("ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY")
    op.execute("REVOKE ALL ON public.workspace_invitations FROM anon, authenticated")


def downgrade() -> None:
    op.drop_table("workspace_invitations", schema="public")
