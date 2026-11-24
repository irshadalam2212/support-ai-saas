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


def main() -> None:
    if engine is None:
        raise SystemExit("DATABASE_URL is not configured; set it in server/.env first.")

    try:
        with engine.connect() as connection:
            result = connection.scalar(text("SELECT 1"))
    except Exception as error:
        # Redact URL credentials and host before reporting the driver's diagnostic.
        raise SystemExit(
            "Database connection failed "
            f"({type(error).__name__}): {safe_error_summary(error)}"
        ) from None

    if result != 1:
        raise SystemExit("Database responded, but SELECT 1 returned an unexpected result.")

    print("PostgreSQL connection successful (SELECT 1 returned 1).")


if __name__ == "__main__":
    main()
