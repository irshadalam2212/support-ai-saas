"""Customers and tickets on real PostgreSQL: isolation, privileges, and integrity."""

from uuid import uuid4

import pytest
from sqlalchemy import select, text
from sqlalchemy.exc import IntegrityError, ProgrammingError
from sqlalchemy.orm import Session

from app.db.workspace_context import use_workspace
from app.models.support import Customer

TABLES = ("customers", "tickets", "ticket_messages", "ticket_events")


def _insert(connection, table: str, **values) -> None:
    columns = ", ".join(values)
    placeholders = ", ".join(f":{name}" for name in values)
    connection.execute(text(f"INSERT INTO public.{table} ({columns}) VALUES ({placeholders})"), values)


def _tenant(database, connection, label: str) -> dict:
    """A workspace with an owner, an agent, a customer, a ticket, a message, and an event."""
    ids = {name: uuid4() for name in ("workspace", "customer", "ticket")}
    ids["owner"], ids["agent"] = database.new_user(), database.new_user()
    for person in ("owner", "agent"):
        _insert(connection, "profiles", id=ids[person])
    _insert(
        connection, "workspaces",
        id=ids["workspace"], name=label, slug=f"sup-{ids['workspace'].hex}", created_by=ids["owner"],
    )
    for person, role in (("owner", "OWNER"), ("agent", "AGENT")):
        _insert(connection, "workspace_members", workspace_id=ids["workspace"], user_id=ids[person], role=role)
    _insert(
        connection, "customers",
        id=ids["customer"], workspace_id=ids["workspace"], name="Customer", email="customer@support.test",
    )
    _insert(
        connection, "tickets",
        id=ids["ticket"], workspace_id=ids["workspace"], number=1, customer_id=ids["customer"],
        subject="Help", assignee_id=ids["agent"],
    )
    _insert(
        connection, "ticket_messages",
        id=uuid4(), workspace_id=ids["workspace"], ticket_id=ids["ticket"], sender_type="AGENT",
        visibility="INTERNAL", body="Note",
    )
    _insert(
        connection, "ticket_events",
        id=uuid4(), workspace_id=ids["workspace"], ticket_id=ids["ticket"], event_type="CREATED",
    )
    return ids


@pytest.fixture
def tenants(database):
    # The owner connection is not limited by Row Level Security, which allows setup.
    with database.owner.begin() as connection:
        created = _tenant(database, connection, "A"), _tenant(database, connection, "B")
    yield created
    with database.owner.begin() as connection:
        for tenant in created:
            connection.execute(text("DELETE FROM public.workspaces WHERE id = :id"), {"id": tenant["workspace"]})


@pytest.fixture(scope="module")
def api_engine(database):
    engine = database.api_engine()
    yield engine
    engine.dispose()


def _scope(connection, tenant: dict) -> None:
    connection.execute(
        text("SELECT set_config('app.workspace_id', :id, true)"), {"id": str(tenant["workspace"])}
    )


def _workspaces_in(connection, table: str) -> set:
    return {row[0] for row in connection.execute(text(f"SELECT workspace_id FROM public.{table}"))}


# Browser roles


@pytest.mark.parametrize("table", TABLES)
@pytest.mark.parametrize("role", ["anon", "authenticated"])
def test_the_browser_cannot_reach_support_tables(database, tenants, role, table):
    for statement in (f"SELECT * FROM public.{table}", f"DELETE FROM public.{table}"):
        with database.as_role(role, tenants[0]["owner"]) as connection:
            with pytest.raises(ProgrammingError, match="permission denied"):
                connection.execute(text(statement))


@pytest.mark.parametrize("table", TABLES)
def test_support_tables_have_row_level_security(database, table):
    with database.owner.connect() as connection:
        assert connection.scalar(
            text("SELECT relrowsecurity FROM pg_class WHERE oid = to_regclass(:name)"), {"name": f"public.{table}"}
        ) is True


# Workspace isolation for the API role


@pytest.mark.parametrize("table", TABLES)
def test_without_a_chosen_workspace_the_api_sees_nothing(api_engine, tenants, table):
    with api_engine.begin() as connection:
        assert _workspaces_in(connection, table) == set()


@pytest.mark.parametrize("table", TABLES)
def test_the_api_sees_only_the_chosen_workspace(api_engine, tenants, table):
    for tenant in tenants:
        with api_engine.begin() as connection:
            _scope(connection, tenant)
            # No WHERE clause: the database itself does the filtering.
            assert _workspaces_in(connection, table) == {tenant["workspace"]}


def test_the_api_cannot_change_another_workspaces_rows(api_engine, tenants):
    a, b = tenants
    with api_engine.begin() as connection:
        _scope(connection, a)
        for statement in (
            "UPDATE public.tickets SET subject = 'Changed' WHERE id = :id",
            "UPDATE public.customers SET name = 'Changed' WHERE workspace_id = :workspace",
            "DELETE FROM public.customers WHERE workspace_id = :workspace",
        ):
            result = connection.execute(text(statement), {"id": b["ticket"], "workspace": b["workspace"]})
            assert result.rowcount == 0, statement


@pytest.mark.parametrize("chosen", [None, "other"])
def test_the_api_cannot_insert_outside_the_chosen_workspace(api_engine, tenants, chosen):
    a, b = tenants
    with api_engine.connect() as connection:
        if chosen:
            _scope(connection, a)
        with pytest.raises(ProgrammingError, match="row-level security"):
            _insert(connection, "customers", id=uuid4(), workspace_id=b["workspace"], name="X", email="x@support.test")


def test_a_row_cannot_be_moved_to_another_workspace(api_engine, tenants):
    a, b = tenants
    with api_engine.connect() as connection:
        _scope(connection, a)
        with pytest.raises(ProgrammingError, match="row-level security"):
            connection.execute(
                text("UPDATE public.customers SET workspace_id = :b WHERE id = :id"),
                {"b": b["workspace"], "id": a["customer"]},
            )


def test_a_session_keeps_its_workspace_after_commit_and_does_not_leak_it(api_engine, tenants):
    a, _ = tenants
    with Session(api_engine) as db:
        use_workspace(db, a["workspace"])
        assert [c.id for c in db.scalars(select(Customer))] == [a["customer"]]
        db.add(Customer(id=uuid4(), workspace_id=a["workspace"], name="New", email="new@support.test"))
        db.commit()
        assert len(db.scalars(select(Customer)).all()) == 2
    # The pooled connection is reused by the next session, which chose nothing.
    with Session(api_engine) as db:
        assert db.scalars(select(Customer)).all() == []


def test_choosing_a_workspace_during_a_transaction_applies_at_once(api_engine, tenants):
    a, _ = tenants
    with Session(api_engine) as db:
        assert db.scalars(select(Customer)).all() == []
        use_workspace(db, a["workspace"])
        assert [c.id for c in db.scalars(select(Customer))] == [a["customer"]]


# Privileges


@pytest.mark.parametrize(
    "statement",
    [
        "DELETE FROM public.tickets",
        "DELETE FROM public.ticket_messages",
        "DELETE FROM public.ticket_events",
        "UPDATE public.ticket_messages SET body = 'Edited'",
        "UPDATE public.ticket_events SET new_value = 'Edited'",
        "TRUNCATE public.customers",
        "DROP TABLE public.ticket_events",
    ],
)
def test_the_api_role_cannot_delete_or_rewrite_history(api_engine, tenants, statement):
    with api_engine.connect() as connection:
        _scope(connection, tenants[0])
        with pytest.raises(ProgrammingError, match="permission denied|must be owner"):
            connection.execute(text(statement))


# Integrity, checked as the owner so that only constraints can refuse


def _refused(database, table: str, constraint: str | None = None, **values) -> None:
    with database.owner.connect() as connection:
        with pytest.raises(IntegrityError, match=constraint):
            _insert(connection, table, **values)


def _ticket(tenant: dict, **changes) -> dict:
    return {
        "id": uuid4(), "workspace_id": tenant["workspace"], "number": 2,
        "customer_id": tenant["customer"], "subject": "Another", **changes,
    }


def _message(tenant: dict, **changes) -> dict:
    return {
        "id": uuid4(), "workspace_id": tenant["workspace"], "ticket_id": tenant["ticket"],
        "sender_type": "AGENT", "visibility": "PUBLIC", "body": "Reply", **changes,
    }


def test_a_ticket_cannot_use_another_workspaces_customer_or_member(database, tenants):
    a, b = tenants
    _refused(database, "tickets", **_ticket(a, customer_id=b["customer"]))
    _refused(database, "tickets", "fk_tickets_assignee_member", **_ticket(a, assignee_id=b["agent"]))


def test_messages_and_events_cannot_attach_to_another_workspaces_ticket(database, tenants):
    a, b = tenants
    _refused(database, "ticket_messages", **_message(a, ticket_id=b["ticket"]))
    _refused(
        database, "ticket_events",
        id=uuid4(), workspace_id=a["workspace"], ticket_id=b["ticket"], event_type="CREATED",
    )


@pytest.mark.parametrize(
    ("changes", "constraint"),
    [
        ({"status": "DONE"}, "ck_tickets_status"),
        ({"priority": "SOON"}, "ck_tickets_priority"),
        ({"subject": "   "}, "ck_tickets_subject_nonempty"),
        ({"number": 0}, "ck_tickets_number_positive"),
        ({"number": 1}, "uq_tickets_workspace_number"),
    ],
)
def test_invalid_tickets_are_rejected(database, tenants, changes, constraint):
    _refused(database, "tickets", constraint, **_ticket(tenants[0], **changes))


@pytest.mark.parametrize(
    ("changes", "constraint"),
    [
        ({"sender_type": "CUSTOMER", "visibility": "INTERNAL"}, "ck_ticket_messages_customer_public"),
        ({"visibility": None}, "visibility"),
        ({"visibility": "SECRET"}, "ck_ticket_messages_visibility"),
        ({"body": "  "}, "ck_ticket_messages_body_length"),
        ({"body": "x" * 10001}, "ck_ticket_messages_body_length"),
    ],
)
def test_invalid_messages_are_rejected(database, tenants, changes, constraint):
    _refused(database, "ticket_messages", constraint, **_message(tenants[0], **changes))


def test_customer_email_is_unique_within_a_workspace_only(database, tenants):
    # Both workspaces already hold customer@support.test.
    _refused(
        database, "customers", "uq_customers_workspace_email",
        id=uuid4(), workspace_id=tenants[0]["workspace"], name="Again", email="customer@support.test",
    )
    _refused(
        database, "customers", "ck_customers_email_normalized",
        id=uuid4(), workspace_id=tenants[0]["workspace"], name="Upper", email="Upper@support.test",
    )


def test_removing_a_member_unassigns_their_tickets_only(database, api_engine, tenants):
    a, b = tenants
    # Done with the API role and no chosen workspace, as the member endpoint does it.
    with api_engine.begin() as connection:
        connection.execute(
            text("DELETE FROM public.workspace_members WHERE workspace_id = :w AND user_id = :u"),
            {"w": a["workspace"], "u": a["agent"]},
        )
    with database.owner.connect() as connection:
        rows = {
            row.id: (row.workspace_id, row.assignee_id)
            for row in connection.execute(text("SELECT id, workspace_id, assignee_id FROM public.tickets"))
        }
    assert rows[a["ticket"]] == (a["workspace"], None)
    assert rows[b["ticket"]] == (b["workspace"], b["agent"])


def test_a_customer_with_tickets_cannot_be_deleted(database, api_engine, tenants):
    a, _ = tenants
    with api_engine.connect() as connection:
        _scope(connection, a)
        with pytest.raises(IntegrityError):
            connection.execute(text("DELETE FROM public.customers WHERE id = :id"), {"id": a["customer"]})
        connection.rollback()
        _scope(connection, a)
        spare = uuid4()
        _insert(connection, "customers", id=spare, workspace_id=a["workspace"], name="Spare", email="s@support.test")
        deleted = connection.execute(text("DELETE FROM public.customers WHERE id = :id"), {"id": spare})
        assert deleted.rowcount == 1


def test_deleting_a_workspace_removes_its_support_data_only(database, tenants):
    a, b = tenants
    with database.owner.begin() as connection:
        connection.execute(text("DELETE FROM public.workspaces WHERE id = :id"), {"id": a["workspace"]})
        for table in TABLES:
            remaining = _workspaces_in(connection, table)
            assert a["workspace"] not in remaining and b["workspace"] in remaining, table
