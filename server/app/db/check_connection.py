import re
from urllib.parse import quote, quote_plus

from sqlalchemy import text

from app.db.session import engine


def safe_error_summary(error: Exception) -> str:
    message = str(getattr(error, "orig", error))
    if engine is not None:
        url = engine.url
        if url.password:
            for secret in {url.password, quote(url.password, safe=""), quote_plus(url.password)}:
                message = message.replace(secret, "<redacted>")
        if url.host:
            message = message.replace(url.host, "<database-host>")

    return re.sub(
        r"(?i)(postgres(?:ql)?(?:\+psycopg)?://)[^@\s]+@",
        r"\1<credentials-redacted>@",
        message,
    )


ROLE_QUERY = """
SELECT current_user,
       r.rolsuper,
       r.rolbypassrls,
       EXISTS (
         SELECT 1 FROM pg_tables AS t
         WHERE t.schemaname = 'public' AND pg_has_role(current_user, t.tableowner, 'USAGE')
       ) AS owns_tables
FROM pg_roles AS r
WHERE r.rolname = current_user
"""


def describe_role(user: str, superuser: bool, bypasses_rls: bool, owns_tables: bool) -> str:
    """Say whether the connected role is limited enough to run the API."""
    reasons = [
        reason
        for applies, reason in (
            (superuser, "is a superuser"),
            (bypasses_rls, "bypasses Row Level Security"),
            (owns_tables, "owns tables in the public schema"),
        )
        if applies
    ]
    if not reasons:
        return f"Role '{user}' is restricted."
    return f"Role '{user}' is NOT restricted: it {', '.join(reasons)}. See 'Restricted database role' in README.md."


def main() -> None:
    if engine is None:
        raise SystemExit("DATABASE_URL is not configured; set it in server/.env first.")

    try:
        with engine.connect() as connection:
            result = connection.scalar(text("SELECT 1"))
            role = connection.execute(text(ROLE_QUERY)).one()
    except Exception as error:
        # Redact URL credentials and host before reporting the driver's diagnostic.
        raise SystemExit(
            "Database connection failed "
            f"({type(error).__name__}): {safe_error_summary(error)}"
        ) from None

    if result != 1:
        raise SystemExit("Database responded, but SELECT 1 returned an unexpected result.")

    print("PostgreSQL connection successful (SELECT 1 returned 1).")
    print(describe_role(*role))


if __name__ == "__main__":
    main()
