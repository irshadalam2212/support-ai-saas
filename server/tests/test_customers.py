import asyncio
from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.orm import Session

from app.api.deps import get_current_claims
from app.db.session import get_db
from app.main import app
from app.models.profile import Profile
from app.models.support import Customer, Ticket
from app.models.workspace import Workspace, WorkspaceMember
from sqlite_db import create_sqlite_engine

ROLES = ("OWNER", "ADMIN", "AGENT", "CUSTOMER")


class Api:
    """The real routes and queries; only token verification and the database are replaced."""

    def __init__(self):
        self.engine = create_sqlite_engine()
        self.user = None
        self.users = {}
        self.workspace = self._workspace("a")
        self.other = self._workspace("b")

    def session(self):
        with Session(self.engine, autoflush=False, expire_on_commit=True) as db:
            yield db

    def _workspace(self, slug: str):
        workspace_id = uuid4()
        with Session(self.engine) as db:
            for role in ROLES:
                user_id = uuid4()
                self.users[slug, role] = user_id
                db.add(Profile(id=user_id, email=f"{role.lower()}@{slug}.test"))
            db.flush()
            db.add(Workspace(id=workspace_id, name=slug, slug=slug, created_by=self.users[slug, "OWNER"]))
            db.flush()
            for role in ROLES:
                db.add(WorkspaceMember(workspace_id=workspace_id, user_id=self.users[slug, role], role=role))
            db.commit()
        return workspace_id

    def call(self, method, path="", *, role="OWNER", of="a", workspace=None, **kwargs):
        self.user = self.users[of, role]

        async def go():
            base = f"http://test/api/v1/workspaces/{workspace or self.workspace}/customers"
            async with AsyncClient(transport=ASGITransport(app=app)) as client:
                return await client.request(method, base + path, **kwargs)

        return asyncio.run(go())

    def add(self, name="Jane Doe", email=None, **fields):
        response = self.call("POST", json={"name": name, "email": email or f"{uuid4().hex}@c.test", **fields})
        assert response.status_code == 201, response.text
        return response.json()


@pytest.fixture
def api():
    instance = Api()
    app.dependency_overrides[get_current_claims] = lambda: {"sub": str(instance.user)}
    app.dependency_overrides[get_db] = instance.session
    yield instance
    app.dependency_overrides.clear()
    instance.engine.dispose()


def test_create_normalizes_values_and_records_the_creator(api):
    response = api.call(
        "POST", role="AGENT",
        json={"name": "  Jane Doe ", "email": " Jane@Example.TEST ", "phone": "   ", "company": " Acme "},
    )

    assert response.status_code == 201
    body = response.json()
    assert (body["name"], body["email"], body["phone"], body["company"]) == ("Jane Doe", "jane@example.test", None, "Acme")
    assert set(body) == {"id", "name", "email", "phone", "company", "created_at", "updated_at"}
    with Session(api.engine) as db:
        stored = db.query(Customer).one()
        assert (stored.workspace_id, stored.created_by) == (api.workspace, api.users["a", "AGENT"])


@pytest.mark.parametrize(
    "body",
    [
        {},
        {"name": "Jane"},
        {"name": "   ", "email": "a@b.test"},
        {"name": "Jane", "email": "not-an-email"},
        {"name": "x" * 121, "email": "a@b.test"},
        {"name": "Jane", "email": "a@b.test", "phone": "1" * 41},
        {"name": "Jane", "email": "a@b.test", "workspace_id": str(uuid4())},
    ],
)
def test_invalid_customers_are_rejected(api, body):
    assert api.call("POST", json=body).status_code == 422


def test_email_is_unique_in_a_workspace_but_not_across_workspaces(api):
    api.add(email="same@c.test")
    second = api.add(email="second@c.test")

    duplicate = api.call("POST", json={"name": "Again", "email": "SAME@c.test"})
    renamed = api.call("PATCH", f"/{second['id']}", json={"email": "same@c.test"})
    elsewhere = api.call("POST", of="b", workspace=api.other, json={"name": "Other", "email": "same@c.test"})

    assert duplicate.status_code == 409 and renamed.status_code == 409
    assert duplicate.json()["detail"] == "A customer with this email already exists"
    assert elsewhere.status_code == 201


def test_search_matches_name_email_and_company_literally(api):
    api.add(name="Alice Wong", email="alice@one.test", company="Globex")
    api.add(name="Bob 100% Ray", email="bob@two.test", company="Initech")
    api.add(name="Carol", email="carol_x@three.test")

    def found(q):
        return sorted(item["name"] for item in api.call("GET", params={"q": q}).json()["items"])

    assert found("ALICE") == ["Alice Wong"]
    assert found("two.test") == ["Bob 100% Ray"]
    assert found("glob") == ["Alice Wong"]
    assert found("%") == ["Bob 100% Ray"]
    assert found("_") == ["Carol"]
    assert found("nobody") == []
    assert len(found("   ")) == 3


def test_sorting_and_pagination(api):
    for index, name in enumerate(["delta", "Alpha", "charlie", "Bravo", "echo"]):
        customer = api.add(name=name)
        with Session(api.engine) as db:
            db.get(Customer, UUID(customer["id"])).created_at = (
                datetime(2026, 1, 1, tzinfo=UTC) + timedelta(days=index)
            )
            db.commit()

    def names(**params):
        return [item["name"] for item in api.call("GET", params=params).json()["items"]]

    assert names() == ["Alpha", "Bravo", "charlie", "delta", "echo"]
    assert names(sort="-name")[0] == "echo"
    assert names(sort="created_at")[:2] == ["delta", "Alpha"]
    assert names(sort="-created_at")[:2] == ["echo", "Bravo"]
    assert names(page=2, page_size=2) == ["charlie", "delta"]
    last = api.call("GET", params={"page": 3, "page_size": 2}).json()
    assert (last["total"], last["page"], last["page_size"], len(last["items"])) == (5, 3, 2, 1)
    assert api.call("GET", params={"page": 9}).json()["items"] == []


@pytest.mark.parametrize("params", [{"page": 0}, {"page_size": 0}, {"page_size": 101}, {"sort": "email"}, {"q": "x" * 121}])
def test_invalid_list_parameters_are_rejected(api, params):
    assert api.call("GET", params=params).status_code == 422


def test_update_changes_only_sent_fields_and_can_clear_optional_ones(api):
    customer = api.add(name="Jane", phone="123", company="Acme")

    response = api.call("PATCH", f"/{customer['id']}", role="AGENT", json={"phone": None, "name": " Janet "})

    assert response.status_code == 200
    body = response.json()
    assert (body["name"], body["phone"], body["company"], body["email"]) == ("Janet", None, "Acme", customer["email"])


@pytest.mark.parametrize("body", [{}, {"name": None}, {"email": None}, {"name": " "}, {"email": "x"}, {"id": str(uuid4())}])
def test_invalid_updates_are_rejected(api, body):
    customer = api.add()

    assert api.call("PATCH", f"/{customer['id']}", json=body).status_code == 422


@pytest.mark.parametrize(
    ("role", "view", "delete"),
    [("OWNER", True, True), ("ADMIN", True, True), ("AGENT", True, False), ("CUSTOMER", False, False)],
)
def test_role_permissions(api, role, view, delete):
    customer = api.add()
    path = f"/{customer['id']}"

    listing = api.call("GET", role=role)
    one = api.call("GET", path, role=role)
    created = api.call("POST", role=role, json={"name": "New", "email": "new@c.test"})
    updated = api.call("PATCH", path, role=role, json={"name": "Changed"})
    removed = api.call("DELETE", path, role=role)

    expected = [200, 200, 201, 200] if view else [403, 403, 403, 403]
    assert [r.status_code for r in (listing, one, created, updated)] == expected
    assert removed.status_code == (204 if delete else 403)


def test_another_workspaces_customers_cannot_be_reached(api):
    customer = api.add()
    path = f"/{customer['id']}"

    # Their own workspace URL with our customer ID.
    for method, body in (("GET", None), ("PATCH", {"name": "Taken"}), ("DELETE", None)):
        response = api.call(method, path, of="b", workspace=api.other, json=body)
        assert response.status_code == 404, method
        assert response.json()["detail"] == "Customer not found"
    # Our workspace URL while not a member.
    assert api.call("GET", path, of="b").status_code == 404
    assert api.call("GET", of="b", workspace=api.other).json()["items"] == []
    assert api.call("GET", path).json()["name"] == customer["name"]


def test_delete_removes_a_customer_without_tickets_only(api):
    busy, idle = api.add(), api.add()
    with Session(api.engine) as db:
        db.add(Ticket(
            id=uuid4(), workspace_id=api.workspace, number=1,
            customer_id=UUID(busy["id"]), subject="Help",
        ))
        db.commit()

    refused = api.call("DELETE", f"/{busy['id']}")
    removed = api.call("DELETE", f"/{idle['id']}")

    assert refused.status_code == 409
    assert refused.json()["detail"] == "This customer has tickets and cannot be deleted"
    assert removed.status_code == 204 and removed.content == b""
    assert [item["id"] for item in api.call("GET").json()["items"]] == [busy["id"]]
    assert api.call("GET", f"/{idle['id']}").status_code == 404
