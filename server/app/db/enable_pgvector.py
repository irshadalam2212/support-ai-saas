from pathlib import Path

from sqlalchemy import text

from app.db.check_connection import safe_error_summary
from app.db.session import engine

EXTENSION_SQL = Path(__file__).resolve().parents[2] / "supabase" / "0001_enable_pgvector.sql"


def main() -> None:
    if engine is None:
        raise SystemExit("DATABASE_URL is not configured; set it in server/.env first.")

    try:
        with engine.begin() as connection:
            connection.execute(text(EXTENSION_SQL.read_text(encoding="utf-8")))
            extension = connection.execute(
                text(
                    """
                    SELECT ext.extversion, namespace.nspname
                    FROM pg_extension AS ext
                    JOIN pg_namespace AS namespace ON namespace.oid = ext.extnamespace
                    WHERE ext.extname = :name
                    """
                ),
                {"name": "vector"},
            ).one_or_none()
    except Exception as error:
        raise SystemExit(
            f"Could not enable pgvector ({type(error).__name__}): "
            f"{safe_error_summary(error)}"
        ) from None

    if extension is None:
        raise SystemExit("The extension command completed, but pgvector was not found afterward.")

    version, schema = extension
    print(f"pgvector enabled: version {version}, schema {schema}.")


if __name__ == "__main__":
    main()
