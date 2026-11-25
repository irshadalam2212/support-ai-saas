"""Customers and tickets. Every table here belongs to one workspace.

workspaces.last_ticket_number (migration 0005) is deliberately not mapped on the
Workspace model; only ticket numbering needs it.
"""

from datetime import datetime
from uuid import UUID

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    ForeignKeyConstraint,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    Uuid,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

TICKET_STATUSES = ("OPEN", "IN_PROGRESS", "WAITING_FOR_CUSTOMER", "RESOLVED", "CLOSED")
TICKET_PRIORITIES = ("LOW", "MEDIUM", "HIGH", "URGENT")
MESSAGE_SENDER_TYPES = ("AGENT", "CUSTOMER", "SYSTEM")
MESSAGE_VISIBILITIES = ("PUBLIC", "INTERNAL")
TICKET_EVENT_TYPES = ("CREATED", "STATUS_CHANGED", "PRIORITY_CHANGED", "ASSIGNEE_CHANGED")


def _one_of(column: str, values: tuple[str, ...]) -> str:
    return f"{column} IN ({', '.join(repr(value) for value in values)})"


def _profile_column() -> Mapped[UUID | None]:
    return mapped_column(Uuid(as_uuid=True), ForeignKey("public.profiles.id", ondelete="SET NULL"))


def _created_at() -> Mapped[datetime]:
    return mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


def _updated_at() -> Mapped[datetime]:
    return mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())


def _ticket_reference() -> ForeignKeyConstraint:
    return ForeignKeyConstraint(
        ["workspace_id", "ticket_id"],
        ["public.tickets.workspace_id", "public.tickets.id"],
        ondelete="CASCADE",
    )


class Customer(Base):
    """Someone a workspace supports. May be linked to a login."""

    __tablename__ = "customers"
    __table_args__ = (
        CheckConstraint("length(btrim(name)) > 0", name="ck_customers_name_nonempty"),
        CheckConstraint("email = lower(btrim(email)) AND length(email) > 0", name="ck_customers_email_normalized"),
        UniqueConstraint("workspace_id", "id", name="uq_customers_workspace_id"),
        UniqueConstraint("workspace_id", "email", name="uq_customers_workspace_email"),
        UniqueConstraint("workspace_id", "profile_id", name="uq_customers_workspace_profile"),
        Index("ix_customers_workspace_name", "workspace_id", "name"),
        {"schema": "public"},
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True)
    workspace_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("public.workspaces.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(40))
    company: Mapped[str | None] = mapped_column(String(120))
    profile_id: Mapped[UUID | None] = _profile_column()
    created_by: Mapped[UUID | None] = _profile_column()
    created_at: Mapped[datetime] = _created_at()
    updated_at: Mapped[datetime] = _updated_at()


class Ticket(Base):
    __tablename__ = "tickets"
    __table_args__ = (
        CheckConstraint("number > 0", name="ck_tickets_number_positive"),
        CheckConstraint("length(btrim(subject)) > 0", name="ck_tickets_subject_nonempty"),
        CheckConstraint(_one_of("status", TICKET_STATUSES), name="ck_tickets_status"),
        CheckConstraint(_one_of("priority", TICKET_PRIORITIES), name="ck_tickets_priority"),
        ForeignKeyConstraint(
            ["workspace_id", "customer_id"], ["public.customers.workspace_id", "public.customers.id"]
        ),
        ForeignKeyConstraint(
            ["workspace_id", "assignee_id"],
            ["public.workspace_members.workspace_id", "public.workspace_members.user_id"],
            name="fk_tickets_assignee_member",
            ondelete="SET NULL (assignee_id)",
        ),
        UniqueConstraint("workspace_id", "id", name="uq_tickets_workspace_id"),
        UniqueConstraint("workspace_id", "number", name="uq_tickets_workspace_number"),
        Index("ix_tickets_workspace_status", "workspace_id", "status", "updated_at"),
        Index("ix_tickets_workspace_priority", "workspace_id", "priority"),
        Index("ix_tickets_workspace_assignee", "workspace_id", "assignee_id"),
        Index("ix_tickets_workspace_customer", "workspace_id", "customer_id"),
        {"schema": "public"},
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True)
    workspace_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("public.workspaces.id", ondelete="CASCADE"), nullable=False
    )
    number: Mapped[int] = mapped_column(Integer, nullable=False)
    customer_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), nullable=False)
    subject: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False, server_default="OPEN")
    priority: Mapped[str] = mapped_column(String(10), nullable=False, server_default="MEDIUM")
    assignee_id: Mapped[UUID | None] = mapped_column(Uuid(as_uuid=True))
    created_by: Mapped[UUID | None] = _profile_column()
    created_at: Mapped[datetime] = _created_at()
    updated_at: Mapped[datetime] = _updated_at()
    last_message_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class TicketMessage(Base):
    """A reply or an internal note. Never edited or deleted."""

    __tablename__ = "ticket_messages"
    __table_args__ = (
        CheckConstraint(_one_of("sender_type", MESSAGE_SENDER_TYPES), name="ck_ticket_messages_sender_type"),
        CheckConstraint(_one_of("visibility", MESSAGE_VISIBILITIES), name="ck_ticket_messages_visibility"),
        CheckConstraint("length(btrim(body)) > 0 AND length(body) <= 10000", name="ck_ticket_messages_body_length"),
        CheckConstraint("sender_type <> 'CUSTOMER' OR visibility = 'PUBLIC'", name="ck_ticket_messages_customer_public"),
        _ticket_reference(),
        Index("ix_ticket_messages_ticket", "workspace_id", "ticket_id", "created_at"),
        {"schema": "public"},
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True)
    workspace_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), nullable=False)
    ticket_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), nullable=False)
    sender_type: Mapped[str] = mapped_column(String(20), nullable=False)
    sender_user_id: Mapped[UUID | None] = _profile_column()
    visibility: Mapped[str] = mapped_column(String(10), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = _created_at()


class TicketEvent(Base):
    """One entry in a ticket's history. Append-only."""

    __tablename__ = "ticket_events"
    __table_args__ = (
        CheckConstraint(_one_of("event_type", TICKET_EVENT_TYPES), name="ck_ticket_events_type"),
        _ticket_reference(),
        Index("ix_ticket_events_ticket", "workspace_id", "ticket_id", "created_at"),
        {"schema": "public"},
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True)
    workspace_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), nullable=False)
    ticket_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), nullable=False)
    actor_id: Mapped[UUID | None] = _profile_column()
    event_type: Mapped[str] = mapped_column(String(30), nullable=False)
    old_value: Mapped[str | None] = mapped_column(String(64))
    new_value: Mapped[str | None] = mapped_column(String(64))
    created_at: Mapped[datetime] = _created_at()
