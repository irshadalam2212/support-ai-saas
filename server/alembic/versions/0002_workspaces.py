"""Add workspace roots, memberships, and tenant read policies.

Revision ID: 0002_workspaces
Revises: 0001_profiles
Create Date: 2026-11-24
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0002_workspaces"
down_revision: Union[str, None] = "0001_profiles"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "workspaces",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("slug", sa.String(length=80), nullable=False),
        sa.Column("description", sa.String(length=500), nullable=True),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint("length(btrim(name)) > 0", name="ck_workspaces_name_nonempty"),
        sa.CheckConstraint(
            "slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'", name="ck_workspaces_slug_format"
        ),
        sa.ForeignKeyConstraint(["created_by"], ["public.profiles.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug", name="uq_workspaces_slug"),
        schema="public",
    )
    op.create_table(
        "workspace_members",
        sa.Column("workspace_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint(
            "role IN ('OWNER', 'ADMIN', 'AGENT', 'CUSTOMER')",
            name="ck_workspace_members_role",
        ),
        sa.ForeignKeyConstraint(["user_id"], ["public.profiles.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["workspace_id"], ["public.workspaces.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("workspace_id", "user_id"),
        schema="public",
    )
    op.create_index(
        "ix_workspace_members_user_id",
        "workspace_members",
        ["user_id"],
        schema="public",
    )

    op.execute(
        """CREATE FUNCTION public.is_workspace_member(target_workspace_id uuid)
        RETURNS boolean
        LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
        AS $$
          SELECT EXISTS (
            SELECT 1 FROM public.workspace_members AS wm
            WHERE wm.workspace_id = target_workspace_id AND wm.user_id = auth.uid()
          )
        $$"""
    )
    op.execute(
        """CREATE FUNCTION public.has_workspace_role(target_workspace_id uuid, allowed_roles text[])
        RETURNS boolean
        LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
        AS $$
          SELECT EXISTS (
            SELECT 1 FROM public.workspace_members AS wm
            WHERE wm.workspace_id = target_workspace_id
              AND wm.user_id = auth.uid()
              AND wm.role = ANY(allowed_roles)
          )
        $$"""
    )
    op.execute("REVOKE EXECUTE ON FUNCTION public.is_workspace_member(uuid) FROM PUBLIC, anon")
    op.execute("REVOKE EXECUTE ON FUNCTION public.has_workspace_role(uuid, text[]) FROM PUBLIC, anon")
    op.execute("GRANT EXECUTE ON FUNCTION public.is_workspace_member(uuid) TO authenticated")
    op.execute("GRANT EXECUTE ON FUNCTION public.has_workspace_role(uuid, text[]) TO authenticated")

    op.execute("ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY")
    op.execute("GRANT SELECT ON public.workspaces, public.workspace_members TO authenticated")
    op.execute(
        """CREATE POLICY workspaces_select_member ON public.workspaces
        FOR SELECT TO authenticated USING (public.is_workspace_member(id))"""
    )
    op.execute(
        """CREATE POLICY workspace_members_select_allowed ON public.workspace_members
        FOR SELECT TO authenticated
        USING (
          user_id = (select auth.uid())
          OR public.has_workspace_role(workspace_id, ARRAY['OWNER', 'ADMIN']::text[])
        )"""
    )


def downgrade() -> None:
    op.drop_table("workspace_members", schema="public")
    op.drop_table("workspaces", schema="public")
    op.execute("DROP FUNCTION public.has_workspace_role(uuid, text[])")
    op.execute("DROP FUNCTION public.is_workspace_member(uuid)")
