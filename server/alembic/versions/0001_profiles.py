"""Create user profiles linked to Supabase Auth identities.

Revision ID: 0001_profiles
Revises:
Create Date: 2026-11-24
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0001_profiles"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=True),
        sa.Column("full_name", sa.String(length=120), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["id"], ["auth.users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        schema="public",
    )
    op.execute("GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated")
    op.execute("ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY")
    op.execute(
        """CREATE POLICY profiles_select_own ON public.profiles
        FOR SELECT TO authenticated USING (id = (select auth.uid()))"""
    )
    op.execute(
        """CREATE POLICY profiles_insert_own ON public.profiles
        FOR INSERT TO authenticated WITH CHECK (id = (select auth.uid()))"""
    )
    op.execute(
        """CREATE POLICY profiles_update_own ON public.profiles
        FOR UPDATE TO authenticated
        USING (id = (select auth.uid()))
        WITH CHECK (id = (select auth.uid()))"""
    )
    op.execute(
        """CREATE POLICY profiles_delete_own ON public.profiles
        FOR DELETE TO authenticated USING (id = (select auth.uid()))"""
    )


def downgrade() -> None:
    op.drop_table("profiles", schema="public")
