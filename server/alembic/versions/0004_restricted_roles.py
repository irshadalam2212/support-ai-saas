"""Restrict browser access and add a least-privilege role for the API.

Revision ID: 0004_restricted_roles
Revises: 0003_workspace_invitations
Create Date: 2026-11-25
"""

from typing import Sequence, Union

from alembic import op

revision: str = "0004_restricted_roles"
down_revision: Union[str, None] = "0003_workspace_invitations"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# What FastAPI needs, and nothing more. It never deletes profiles, workspaces,
# or invitations. SELECT ... FOR UPDATE requires the UPDATE privilege.
API_PRIVILEGES = {
    "profiles": "SELECT, INSERT, UPDATE",
    "workspaces": "SELECT, INSERT, UPDATE",
    "workspace_members": "SELECT, INSERT, UPDATE, DELETE",
    "workspace_invitations": "SELECT, INSERT, UPDATE",
}
# Tables the signed-in browser may read, limited by the existing RLS policies.
BROWSER_READABLE = ("profiles", "workspaces", "workspace_members")


def upgrade() -> None:
    # All writes go through FastAPI. Direct browser writes allowed, for example,
    # deleting one's own profile, which cascades to memberships and could leave
    # a workspace without an owner.
    for table in API_PRIVILEGES:
        op.execute(f"REVOKE ALL ON public.{table} FROM anon, authenticated")
    for table in BROWSER_READABLE:
        op.execute(f"GRANT SELECT ON public.{table} TO authenticated")
    for command in ("insert", "update", "delete"):
        op.execute(f"DROP POLICY profiles_{command}_own ON public.profiles")

    # Alembic's own table must not be reachable through Supabase's REST API.
    op.execute("ALTER TABLE public.alembic_version ENABLE ROW LEVEL SECURITY")
    op.execute("REVOKE ALL ON public.alembic_version FROM anon, authenticated")

    # A group role without a password. The login that joins it is created
    # separately, so that no credential is ever stored in version control.
    op.execute(
        """DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supportai_app') THEN
            CREATE ROLE supportai_app NOLOGIN;
          END IF;
        END $$"""
    )
    op.execute("GRANT USAGE ON SCHEMA public TO supportai_app")
    for table, privileges in API_PRIVILEGES.items():
        op.execute(f"GRANT {privileges} ON public.{table} TO supportai_app")
        # Membership and role checks are enforced by FastAPI for this role.
        op.execute(
            f"""CREATE POLICY {table}_api ON public.{table}
            FOR ALL TO supportai_app USING (true) WITH CHECK (true)"""
        )


def downgrade() -> None:
    for table in API_PRIVILEGES:
        op.execute(f"DROP POLICY {table}_api ON public.{table}")
        op.execute(f"REVOKE ALL ON public.{table} FROM supportai_app")
    op.execute("REVOKE USAGE ON SCHEMA public FROM supportai_app")
    op.execute("DROP ROLE IF EXISTS supportai_app")

    op.execute("ALTER TABLE public.alembic_version DISABLE ROW LEVEL SECURITY")

    op.execute("GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated")
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
