"""Add customers, tickets, ticket messages, and ticket history.

Revision ID: 0005_customers_and_tickets
Revises: 0004_restricted_roles
Create Date: 2026-11-25
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0005_customers_and_tickets"
down_revision: Union[str, None] = "0004_restricted_roles"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Tickets, messages, and history are never deleted by the API, and messages and
# history are never edited.
API_PRIVILEGES = {
    "customers": "SELECT, INSERT, UPDATE, DELETE",
    "tickets": "SELECT, INSERT, UPDATE",
    "ticket_messages": "SELECT, INSERT",
    "ticket_events": "SELECT, INSERT",
}

# The workspace chosen for the current transaction. Unset or empty matches no rows.
CURRENT_WORKSPACE = "(select nullif(current_setting('app.workspace_id', true), '')::uuid)"


def _uuid(name: str, *, nullable: bool = False) -> sa.Column:
    return sa.Column(name, postgresql.UUID(as_uuid=True), nullable=nullable)


def _timestamp(name: str, *, nullable: bool = False) -> sa.Column:
    default = None if nullable else sa.text("now()")
    return sa.Column(name, sa.DateTime(timezone=True), nullable=nullable, server_default=default)


def _profile_reference(column: str) -> sa.ForeignKeyConstraint:
    # History is kept when an account is deleted.
    return sa.ForeignKeyConstraint([column], ["public.profiles.id"], ondelete="SET NULL")


def _ticket_reference() -> sa.ForeignKeyConstraint:
    # Includes workspace_id, so a row can never belong to another workspace's ticket.
    return sa.ForeignKeyConstraint(
        ["workspace_id", "ticket_id"],
        ["public.tickets.workspace_id", "public.tickets.id"],
        ondelete="CASCADE",
    )


def upgrade() -> None:
    # The last ticket number handed out in each workspace.
    op.add_column(
        "workspaces",
        sa.Column("last_ticket_number", sa.Integer(), nullable=False, server_default="0"),
        schema="public",
    )
    op.create_check_constraint(
        "ck_workspaces_last_ticket_number", "workspaces", "last_ticket_number >= 0", schema="public"
    )

    op.create_table(
        "customers",
        _uuid("id"),
        _uuid("workspace_id"),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("phone", sa.String(length=40), nullable=True),
        sa.Column("company", sa.String(length=120), nullable=True),
        _uuid("profile_id", nullable=True),
        _uuid("created_by", nullable=True),
        _timestamp("created_at"),
        _timestamp("updated_at"),
        sa.CheckConstraint("length(btrim(name)) > 0", name="ck_customers_name_nonempty"),
        sa.CheckConstraint(
            "email = lower(btrim(email)) AND length(email) > 0", name="ck_customers_email_normalized"
        ),
        sa.ForeignKeyConstraint(["workspace_id"], ["public.workspaces.id"], ondelete="CASCADE"),
        _profile_reference("profile_id"),
        _profile_reference("created_by"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("workspace_id", "id", name="uq_customers_workspace_id"),
        sa.UniqueConstraint("workspace_id", "email", name="uq_customers_workspace_email"),
        sa.UniqueConstraint("workspace_id", "profile_id", name="uq_customers_workspace_profile"),
        schema="public",
    )
    op.create_index("ix_customers_workspace_name", "customers", ["workspace_id", "name"], schema="public")

    op.create_table(
        "tickets",
        _uuid("id"),
        _uuid("workspace_id"),
        sa.Column("number", sa.Integer(), nullable=False),
        _uuid("customer_id"),
        sa.Column("subject", sa.String(length=200), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="OPEN"),
        sa.Column("priority", sa.String(length=10), nullable=False, server_default="MEDIUM"),
        _uuid("assignee_id", nullable=True),
        _uuid("created_by", nullable=True),
        _timestamp("created_at"),
        _timestamp("updated_at"),
        _timestamp("last_message_at", nullable=True),
        _timestamp("resolved_at", nullable=True),
        _timestamp("closed_at", nullable=True),
        sa.CheckConstraint("number > 0", name="ck_tickets_number_positive"),
        sa.CheckConstraint("length(btrim(subject)) > 0", name="ck_tickets_subject_nonempty"),
        sa.CheckConstraint(
            "status IN ('OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED')",
            name="ck_tickets_status",
        ),
        sa.CheckConstraint("priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')", name="ck_tickets_priority"),
        sa.ForeignKeyConstraint(["workspace_id"], ["public.workspaces.id"], ondelete="CASCADE"),
        # No ON DELETE action: a customer with tickets cannot be deleted, while
        # deleting a whole workspace still removes both.
        sa.ForeignKeyConstraint(
            ["workspace_id", "customer_id"], ["public.customers.workspace_id", "public.customers.id"]
        ),
        # The assignee must be a member of this workspace. Only the assignee is
        # cleared when that membership is removed (PostgreSQL 15 or newer).
        sa.ForeignKeyConstraint(
            ["workspace_id", "assignee_id"],
            ["public.workspace_members.workspace_id", "public.workspace_members.user_id"],
            name="fk_tickets_assignee_member",
            ondelete="SET NULL (assignee_id)",
        ),
        _profile_reference("created_by"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("workspace_id", "id", name="uq_tickets_workspace_id"),
        sa.UniqueConstraint("workspace_id", "number", name="uq_tickets_workspace_number"),
        schema="public",
    )
    for name, columns in (
        ("ix_tickets_workspace_status", ["workspace_id", "status", "updated_at"]),
        ("ix_tickets_workspace_priority", ["workspace_id", "priority"]),
        ("ix_tickets_workspace_assignee", ["workspace_id", "assignee_id"]),
        ("ix_tickets_workspace_customer", ["workspace_id", "customer_id"]),
    ):
        op.create_index(name, "tickets", columns, schema="public")

    op.create_table(
        "ticket_messages",
        _uuid("id"),
        _uuid("workspace_id"),
        _uuid("ticket_id"),
        sa.Column("sender_type", sa.String(length=20), nullable=False),
        _uuid("sender_user_id", nullable=True),
        # No default: whether a customer may see a message is always chosen explicitly.
        sa.Column("visibility", sa.String(length=10), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        _timestamp("created_at"),
        sa.CheckConstraint("sender_type IN ('AGENT', 'CUSTOMER', 'SYSTEM')", name="ck_ticket_messages_sender_type"),
        sa.CheckConstraint("visibility IN ('PUBLIC', 'INTERNAL')", name="ck_ticket_messages_visibility"),
        sa.CheckConstraint(
            "length(btrim(body)) > 0 AND length(body) <= 10000", name="ck_ticket_messages_body_length"
        ),
        sa.CheckConstraint(
            "sender_type <> 'CUSTOMER' OR visibility = 'PUBLIC'", name="ck_ticket_messages_customer_public"
        ),
        _ticket_reference(),
        _profile_reference("sender_user_id"),
        sa.PrimaryKeyConstraint("id"),
        schema="public",
    )
    op.create_index(
        "ix_ticket_messages_ticket",
        "ticket_messages",
        ["workspace_id", "ticket_id", "created_at"],
        schema="public",
    )

    op.create_table(
        "ticket_events",
        _uuid("id"),
        _uuid("workspace_id"),
        _uuid("ticket_id"),
        _uuid("actor_id", nullable=True),
        sa.Column("event_type", sa.String(length=30), nullable=False),
        sa.Column("old_value", sa.String(length=64), nullable=True),
        sa.Column("new_value", sa.String(length=64), nullable=True),
        _timestamp("created_at"),
        sa.CheckConstraint(
            "event_type IN ('CREATED', 'STATUS_CHANGED', 'PRIORITY_CHANGED', 'ASSIGNEE_CHANGED')",
            name="ck_ticket_events_type",
        ),
        _ticket_reference(),
        _profile_reference("actor_id"),
        sa.PrimaryKeyConstraint("id"),
        schema="public",
    )
    op.create_index(
        "ix_ticket_events_ticket",
        "ticket_events",
        ["workspace_id", "ticket_id", "created_at"],
        schema="public",
    )

    for table, privileges in API_PRIVILEGES.items():
        # Support data is reachable only through FastAPI. Supabase grants browser
        # roles every privilege on new tables, so that must be revoked.
        op.execute(f"ALTER TABLE public.{table} ENABLE ROW LEVEL SECURITY")
        op.execute(f"REVOKE ALL ON public.{table} FROM anon, authenticated")
        op.execute(f"GRANT {privileges} ON public.{table} TO supportai_app")
        op.execute(
            f"""CREATE POLICY {table}_api_workspace ON public.{table}
            FOR ALL TO supportai_app
            USING (workspace_id = {CURRENT_WORKSPACE})
            WITH CHECK (workspace_id = {CURRENT_WORKSPACE})"""
        )


def downgrade() -> None:
    # Dropping a table also drops its policies, grants, and indexes.
    for table in reversed(API_PRIVILEGES):
        op.drop_table(table, schema="public")
    op.drop_constraint("ck_workspaces_last_ticket_number", "workspaces", schema="public")
    op.drop_column("workspaces", "last_ticket_number", schema="public")
