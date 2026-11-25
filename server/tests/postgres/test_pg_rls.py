"""Row Level Security and table privileges on a real PostgreSQL server."""

from uuid import uuid4

import pytest
from sqlalchemy import text
from sqlalchemy.exc import ProgrammingError

APP_TABLES = ("profiles", "workspaces", "workspace_members", "workspace_invitations")


@pytest.fixture(scope="module")
def tenants(database):
    """Two separate workspaces. A has an owner and an agent; B has an owner."""
    people = {name: database.new_user() for name in ("owner_a", "agent_a", "owner_b")}
    workspaces = {"a": uuid4(), "b": uuid4()}
    with database.owner.begin() as connection:
        for name, user_id in people.items():
            connection.execute(
                text("INSERT INTO public.profiles (id, email) VALUES (:id, :email)"),
                {"id": user_id, "email": f"{name}@rls.test"},
            )
        for key, owner in (("a", "owner_a"), ("b", "owner_b")):
            connection.execute(
                text("INSERT INTO public.workspaces (id, name, slug, created_by) VALUES (:id, :name, :slug, :owner)"),
                {"id": workspaces[key], "name": key.upper(), "slug": f"rls-{key}", "owner": people[owner]},
            )
        for key, name, role in (("a", "owner_a", "OWNER"), ("a", "agent_a", "AGENT"), ("b", "owner_b", "OWNER")):
            connection.execute(
                text("INSERT INTO public.workspace_members (workspace_id, user_id, role) VALUES (:w, :u, :r)"),
                {"w": workspaces[key], "u": people[name], "r": role},
            )
            connection.execute(
                text(
                    """INSERT INTO public.workspace_invitations
                    (id, workspace_id, email, role, token_hash, invited_by, expires_at)
                    VALUES (:id, :w, :email, 'AGENT', :hash, :by, now() + interval '1 day')"""
                ),
                {"id": uuid4(), "w": workspaces[key], "email": f"invite-{name}@rls.test", "hash": uuid4().hex * 2, "by": people[name]},
            )
    return people, workspaces


def _ids(connection, query: str) -> set:
    return {row[0] for row in connection.execute(text(query))}


def _denied(database, role: str, statement: str, user_id=None) -> None:
    with database.as_role(role, user_id) as connection:
        with pytest.raises(ProgrammingError, match="permission denied|must be owner"):
            connection.execute(text(statement))


@pytest.mark.parametrize("table", APP_TABLES)
def test_every_application_table_has_row_level_security(database, table):
    with database.owner.connect() as connection:
        enabled = connection.scalar(
            text("SELECT relrowsecurity FROM pg_class WHERE oid = to_regclass(:name)"), {"name": f"public.{table}"}
        )
    assert enabled is True


@pytest.mark.parametrize(
    ("member", "workspace", "visible_members"),
    [
        ("owner_a", "a", {"owner_a", "agent_a"}),
        ("agent_a", "a", {"agent_a"}),
        ("owner_b", "b", {"owner_b"}),
    ],
)
def test_a_user_reads_only_their_own_tenant(database, tenants, member, workspace, visible_members):
    people, workspaces = tenants

    with database.as_role("authenticated", people[member]) as connection:
        assert _ids(connection, "SELECT id FROM public.workspaces") == {workspaces[workspace]}
        assert _ids(connection, "SELECT user_id FROM public.workspace_members") == {people[n] for n in visible_members}
        assert _ids(connection, "SELECT id FROM public.profiles") == {people[member]}


def test_a_signed_in_user_with_no_workspace_reads_nothing(database, tenants):
    with database.as_role("authenticated", database.new_user()) as connection:
        for table in ("profiles", "workspaces", "workspace_members"):
            assert connection.scalar(text(f"SELECT count(*) FROM public.{table}")) == 0


@pytest.mark.parametrize("table", (*APP_TABLES, "alembic_version"))
def test_signed_out_visitors_have_no_access(database, tenants, table):
    _denied(database, "anon", f"SELECT * FROM public.{table}")


@pytest.mark.parametrize("table", ("workspace_invitations", "alembic_version"))
def test_signed_in_users_cannot_read_internal_tables(database, tenants, table):
    people, _ = tenants
    _denied(database, "authenticated", f"SELECT * FROM public.{table}", people["owner_a"])


@pytest.mark.parametrize(
    "statement",
    [
        "DELETE FROM public.profiles",
        "UPDATE public.profiles SET email = 'changed@rls.test'",
        "INSERT INTO public.profiles (id) VALUES (gen_random_uuid())",
        "UPDATE public.workspaces SET name = 'Changed'",
        "DELETE FROM public.workspaces",
        "UPDATE public.workspace_members SET role = 'OWNER'",
        "DELETE FROM public.workspace_members",
        "INSERT INTO public.workspace_members (workspace_id, user_id, role) "
        "VALUES (gen_random_uuid(), gen_random_uuid(), 'OWNER')",
        "TRUNCATE public.workspace_members",
        "DELETE FROM public.workspace_invitations",
        "UPDATE public.alembic_version SET version_num = 'x'",
    ],
)
def test_the_browser_cannot_write_directly(database, tenants, statement):
    people, _ = tenants
    _denied(database, "authenticated", statement, people["owner_a"])


def test_the_api_role_is_not_privileged(database):
    with database.owner.connect() as connection:
        row = connection.execute(
            text(
                """SELECT rolsuper, rolbypassrls, rolcreaterole, rolcreatedb, rolcanlogin
                FROM pg_roles WHERE rolname = 'supportai_app'"""
            )
        ).one()
        owned = connection.scalar(text("SELECT count(*) FROM pg_tables WHERE tableowner = 'supportai_app'"))
    assert tuple(row) == (False, False, False, False, False)
    assert owned == 0


@pytest.mark.parametrize(
    "statement",
    [
        "CREATE TABLE public.not_allowed (id int)",
        "DROP TABLE public.workspace_members",
        "ALTER TABLE public.workspaces DISABLE ROW LEVEL SECURITY",
        "DELETE FROM public.profiles",
        "DELETE FROM public.workspaces",
        "DELETE FROM public.workspace_invitations",
        "TRUNCATE public.workspace_members",
        "SELECT * FROM auth.users",
        "SELECT * FROM public.alembic_version",
    ],
)
def test_the_api_role_is_limited_to_what_it_needs(database, tenants, statement):
    _denied(database, "supportai_app", statement)
