from datetime import datetime
from uuid import UUID

from sqlalchemy import Column, DateTime, ForeignKey, MetaData, String, Table, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

_auth_metadata = MetaData()
_supabase_auth_users = Table(
    "users",
    _auth_metadata,
    Column("id", Uuid(as_uuid=True), primary_key=True),
    schema="auth",
)


class Profile(Base):
    """Application-facing user profile backed by a Supabase Auth identity."""

    __tablename__ = "profiles"
    __table_args__ = {"schema": "public"}

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey(_supabase_auth_users.c.id, ondelete="CASCADE"),
        primary_key=True,
    )
    email: Mapped[str | None] = mapped_column(String(320))
    full_name: Mapped[str | None] = mapped_column(String(120))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )
