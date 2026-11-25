"""Tests against a real PostgreSQL server. Skipped unless TEST_DATABASE_URL is set.

The database must be disposable and must not contain the application tables.
The real migrations are applied, then reverted. On plain PostgreSQL the parts
that Supabase normally provides (the auth schema and browser roles) are created
first and removed afterwards; on an empty Supabase test project they already exist.
"""

import json
import os
from contextlib import contextmanager
from pathlib import Path
from uuid import UUID, uuid4

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, event, text
from sqlalchemy.engine import make_url
from sqlalchemy.pool import NullPool

from app.core.config import Settings, get_settings
from app.db.session import build_sqlalchemy_url

SERVER_DIR = Path(__file__).resolve().parents[2]
BROWSER_ROLES = ("anon", "authenticated", "service_role")


def _refuse_application_database(test_url: str) -> None:
    """Never run against the server and login the application itself uses."""
    settings = Settings(_env_file=SERVER_DIR / ".env")
    target = build_sqlalchemy_url(test_url)
    for configured in (settings.database_url, settings.migration_database_url):
        if not configured:
            continue
        app_url = make_url(configured)
        if (app_url.host, app_url.port, app_url.username) == (target.host, target.port, target.username):
            pytest.exit("TEST_DATABASE_URL points at the application database. Use a separate one.", returncode=2)


def _exists(connection, expression: str) -> bool:
    return connection.scalar(text(f"SELECT {expression} IS NOT NULL"))


def _create_supabase_stand_in(connection) -> dict:
    """Create whatever is missing of what Supabase provides, and report what was created."""
    created = {"schema": False, "roles": []}
    for role in BROWSER_ROLES:
        if not connection.scalar(text("SELECT 1 FROM pg_roles WHERE rolname = :name"), {"name": role}):
            connection.execute(text(f"CREATE ROLE {role} NOLOGIN"))
            created["roles"].append(role)
    if not _exists(connection, "to_regclass('auth.users')"):
        created["schema"] = True
        connection.execute(text("CREATE SCHEMA auth"))
        connection.execute(text("CREATE TABLE auth.users (id uuid PRIMARY KEY)"))
        connection.execute(text(
            """CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
              SELECT (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid
            $$"""
        ))
        connection.execute(text("GRANT USAGE ON SCHEMA auth, public TO anon, authenticated, service_role"))
        # Supabase gives browser roles every privilege on new public tables by default.
        connection.execute(text(
            "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role"
        ))
    return created


def _remove_supabase_stand_in(connection, created: dict) -> None:
    if created["schema"]:
        connection.execute(text(
            "ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated, service_role"
        ))
        connection.execute(text("DROP SCHEMA auth CASCADE"))
    for role in created["roles"]:
        connection.execute(text(f"DROP OWNED BY {role}"))
        connection.execute(text(f"DROP ROLE {role}"))


def _migrate(test_url: str, action, revision: str) -> None:
    """Run Alembic against the test database only, whatever .env says."""
    previous = {key: os.environ.get(key) for key in ("DATABASE_URL", "MIGRATION_DATABASE_URL")}
    os.environ.update(DATABASE_URL=test_url, MIGRATION_DATABASE_URL=test_url)
    get_settings.cache_clear()
    try:
        config = Config(str(SERVER_DIR / "alembic.ini"))
        config.set_main_option("script_location", str(SERVER_DIR / "alembic"))
        action(config, revision)
    finally:
        for key, value in previous.items():
            if value is None:
                os.environ.pop(key, None)
            else:
                os.environ[key] = value
        get_settings.cache_clear()


class Database:
    def __init__(self, url: str):
        self.url = build_sqlalchemy_url(url)
        self.owner = create_engine(self.url, poolclass=NullPool)
        self.users: list[UUID] = []

    def new_user(self) -> UUID:
        user_id = uuid4()
        with self.owner.begin() as connection:
            connection.execute(text("INSERT INTO auth.users (id) VALUES (:id)"), {"id": user_id})
        self.users.append(user_id)
        return user_id

    @contextmanager
    def as_role(self, role: str, user_id: UUID | None = None):
        """A transaction as a given role, with that user's JWT claims. Always rolled back."""
        with self.owner.connect() as connection:
            transaction = connection.begin()
            try:
                connection.execute(text(f"SET LOCAL ROLE {role}"))
                if user_id is not None:
                    connection.execute(
                        text("SELECT set_config('request.jwt.claims', :claims, true)"),
                        {"claims": json.dumps({"sub": str(user_id), "role": role})},
                    )
                yield connection
            finally:
                transaction.rollback()

    def api_engine(self):
        """An engine whose connections have only the API's privileges."""
        engine = create_engine(self.url, pool_size=10, max_overflow=10)

        @event.listens_for(engine, "connect")
        def restrict(dbapi_connection, _record):
            with dbapi_connection.cursor() as cursor:
                cursor.execute("SET ROLE supportai_app")
            dbapi_connection.commit()

        return engine


@pytest.fixture(scope="session")
def database():
    test_url = os.environ.get("TEST_DATABASE_URL")
    if not test_url:
        pytest.skip("Set TEST_DATABASE_URL to a disposable PostgreSQL database to run these tests")
    _refuse_application_database(test_url)

    db = Database(test_url)
    with db.owner.begin() as connection:
        if _exists(connection, "to_regclass('public.profiles')"):
            pytest.exit("The test database already has application tables. Use an empty one.", returncode=2)
        had_version_table = _exists(connection, "to_regclass('public.alembic_version')")
        created = _create_supabase_stand_in(connection)

    try:
        _migrate(test_url, command.upgrade, "head")
        with db.owner.begin() as connection:
            # Lets the test connection switch into the API role.
            connection.execute(text("GRANT supportai_app TO CURRENT_USER"))
        yield db
    finally:
        with db.owner.begin() as connection:
            if _exists(connection, "to_regclass('public.workspaces')"):
                for table in ("workspace_invitations", "workspace_members", "workspaces", "profiles"):
                    connection.execute(text(f"DELETE FROM public.{table}"))
            for user_id in db.users:
                connection.execute(text("DELETE FROM auth.users WHERE id = :id"), {"id": user_id})
        _migrate(test_url, command.downgrade, "base")
        with db.owner.begin() as connection:
            if not had_version_table:
                connection.execute(text("DROP TABLE IF EXISTS public.alembic_version"))
            _remove_supabase_stand_in(connection, created)
        db.owner.dispose()
