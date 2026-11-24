from collections.abc import Generator

from fastapi import HTTPException, status
from sqlalchemy import Engine, create_engine
from sqlalchemy.engine import URL, make_url
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings


def build_sqlalchemy_url(database_url: str) -> URL:
    """Use the installed psycopg 3 driver and require encrypted connections."""
    url = make_url(database_url)
    if url.drivername in {"postgres", "postgresql"}:
        url = url.set(drivername="postgresql+psycopg")
    elif url.drivername != "postgresql+psycopg":
        raise ValueError("DATABASE_URL must use PostgreSQL with the psycopg driver")

    if "sslmode" not in url.query:
        url = url.update_query_dict({"sslmode": "require"})
    return url


def create_database_engine() -> Engine | None:
    database_url = get_settings().database_url
    if not database_url:
        return None
    return create_engine(build_sqlalchemy_url(database_url), pool_pre_ping=True)


engine = create_database_engine()
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db() -> Generator[Session, None, None]:
    if engine is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is not configured",
        )

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
