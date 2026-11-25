import asyncio
from datetime import UTC, datetime
from uuid import UUID, uuid4

from httpx import ASGITransport, AsyncClient

from app.api.deps import get_current_claims
from app.api.v1.endpoints.workspaces import _slug_base
from app.db.session import get_db
from app.main import app
from app.models.profile import Profile
from app.models.workspace import Workspace, WorkspaceMember


class FakeResult:
    def __init__(self, rows):
        self.rows = rows

    def first(self):
        return self.rows[0] if self.rows else None

    def all(self):
        return self.rows


class FakeSession:
    def __init__(self, user_id: UUID):
        self.user_id = user_id
        self.profile = Profile(id=user_id)
        self.workspaces: list[Workspace] = []
        self.members: list[WorkspaceMember] = []

    def get(self, model, record_id):
        if model is Profile and record_id == self.user_id:
            return self.profile
        return None

    def execute(self, statement):
        workspaces_by_id = {workspace.id: workspace for workspace in self.workspaces}
        parameters = statement.compile().params
        workspace_filter = parameters.get("id_1")
        rows = []
        for member in self.members:
            if member.user_id != self.user_id or member.workspace_id not in workspaces_by_id:
                continue
            if workspace_filter is not None and member.workspace_id != workspace_filter:
                continue
            workspace = workspaces_by_id[member.workspace_id]
            second_name = statement.column_descriptions[1]["name"]
            rows.append((workspace, member) if second_name == "WorkspaceMember" else (workspace, member.role))
        return FakeResult(rows)

    def scalar(self, _statement):
        return None

    def add(self, record):
        if isinstance(record, Workspace):
            self.workspaces.append(record)
        elif isinstance(record, WorkspaceMember):
            self.members.append(record)

    def commit(self):
        now = datetime.now(UTC)
        for workspace in self.workspaces:
            if workspace.created_at is None:
                workspace.created_at = now
                workspace.updated_at = now
        for member in self.members:
            if member.created_at is None:
                member.created_at = now

    def rollback(self):
        return None

    def refresh(self, _record):
        return None


def test_slug_base_normalizes_company_names():
    assert _slug_base("Acme Customer Support, Inc.") == "acme-customer-support-inc"
    assert _slug_base("東京") == "workspace"


def test_initial_workspace_creation_is_idempotent_and_listed_for_member():
    user_id = uuid4()
    claims = {
        "sub": str(user_id),
        "user_metadata": {"company_name": "Acme Support"},
    }
    session = FakeSession(user_id)
    app.dependency_overrides[get_current_claims] = lambda: claims
    app.dependency_overrides[get_db] = lambda: session

    async def exercise_workspace_routes():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            first = await client.post("/api/v1/workspaces/onboarding")
            second = await client.post("/api/v1/workspaces/onboarding")
            workspaces = await client.get("/api/v1/workspaces")
            return first, second, workspaces

    try:
        first, second, workspaces = asyncio.run(exercise_workspace_routes())
    finally:
        app.dependency_overrides.clear()

    assert first.status_code == 200
    assert first.json()["name"] == "Acme Support"
    assert first.json()["slug"] == "acme-support"
    assert first.json()["role"] == "OWNER"
    assert second.json()["id"] == first.json()["id"]
    assert len(session.workspaces) == 1
    assert workspaces.json() == [first.json()]


def test_member_can_read_own_workspace_but_cannot_read_another_workspace():
    user_id = uuid4()
    other_user_id = uuid4()
    own_workspace = Workspace(
        id=uuid4(), name="Own", slug="own", created_by=user_id, created_at=datetime.now(UTC)
    )
    other_workspace = Workspace(
        id=uuid4(), name="Other", slug="other", created_by=other_user_id, created_at=datetime.now(UTC)
    )
    session = FakeSession(user_id)
    session.workspaces.extend([own_workspace, other_workspace])
    session.members.extend([
        WorkspaceMember(workspace_id=own_workspace.id, user_id=user_id, role="AGENT"),
        WorkspaceMember(workspace_id=other_workspace.id, user_id=other_user_id, role="OWNER"),
    ])
    app.dependency_overrides[get_current_claims] = lambda: {"sub": str(user_id)}
    app.dependency_overrides[get_db] = lambda: session

    async def read_workspaces():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            own = await client.get(f"/api/v1/workspaces/{own_workspace.id}")
            other = await client.get(f"/api/v1/workspaces/{other_workspace.id}")
            return own, other

    try:
        own, other = asyncio.run(read_workspaces())
    finally:
        app.dependency_overrides.clear()

    assert own.status_code == 200
    assert own.json()["id"] == str(own_workspace.id)
    assert own.json()["role"] == "AGENT"
    assert other.status_code == 404


def test_only_owner_or_admin_can_update_workspace():
    user_id = uuid4()
    workspace = Workspace(
        id=uuid4(), name="Acme", slug="acme", created_by=user_id, created_at=datetime.now(UTC)
    )
    membership = WorkspaceMember(workspace_id=workspace.id, user_id=user_id, role="AGENT")
    session = FakeSession(user_id)
    session.workspaces.append(workspace)
    session.members.append(membership)
    app.dependency_overrides[get_current_claims] = lambda: {"sub": str(user_id)}
    app.dependency_overrides[get_db] = lambda: session

    async def update_workspace():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            denied = await client.patch(f"/api/v1/workspaces/{workspace.id}", json={"name": "Changed"})
            membership.role = "ADMIN"
            allowed = await client.patch(f"/api/v1/workspaces/{workspace.id}", json={"name": "Changed"})
            return denied, allowed

    try:
        denied, allowed = asyncio.run(update_workspace())
    finally:
        app.dependency_overrides.clear()

    assert denied.status_code == 403
    assert allowed.status_code == 200
    assert allowed.json()["name"] == "Changed"
