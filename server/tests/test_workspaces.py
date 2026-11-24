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

    def execute(self, _statement):
        workspaces_by_id = {workspace.id: workspace for workspace in self.workspaces}
        rows = [
            (workspaces_by_id[member.workspace_id], member.role)
            for member in self.members
            if member.user_id == self.user_id and member.workspace_id in workspaces_by_id
        ]
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
