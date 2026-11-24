from sqlalchemy.engine import make_url

from app.db.session import build_sqlalchemy_url


def test_supabase_style_url_uses_psycopg_and_tls() -> None:
    url = build_sqlalchemy_url(
        "postgresql://postgres:example-password@db.example.supabase.co:5432/postgres"
    )

    assert url.drivername == "postgresql+psycopg"
    assert url.host == "db.example.supabase.co"
    assert url.query["sslmode"] == "require"


def test_existing_ssl_mode_is_preserved() -> None:
    url = build_sqlalchemy_url(
        "postgresql://postgres:example-password@db.example.supabase.co/postgres?sslmode=verify-full"
    )

    assert url.query["sslmode"] == "verify-full"


def test_url_for_alembic_keeps_encoded_password_intact() -> None:
    url = build_sqlalchemy_url(
        "postgresql://postgres:p%40ss%3Aword%25@db.example.supabase.co/postgres"
    )

    alembic_url = url.render_as_string(hide_password=False)
    parsed_url = make_url(alembic_url)

    assert parsed_url.password == "p@ss:word%"
