import asyncio
from datetime import UTC, datetime, timedelta
import hashlib
from uuid import uuid4

import pytest
from httpx import ASGITransport, AsyncClient

from app.db.session import get_db
from app.main import app
from app.models.workspace import Workspace, WorkspaceInvitation
from test_workspaces import FakeSession

TOKEN = "preview-token-value-with-more-than-thirty-two-chars"


def _setup(status: str = "PENDING", expires_in: timedelta = timedelta(days=1)):
    workspace = Workspace(
        id=uuid4(), name="Acme Support", slug="acme", created_by=uuid4(), created_at=datetime.now(UTC)
    )
    invitation = WorkspaceInvitation(
        id=uuid4(),
        workspace_id=workspace.id,
        email="new.person@acme.test",
        role="AGENT",
        token_hash=hashlib.sha256(TOKEN.encode()).hexdigest(),
        status=status,
        invited_by=workspace.created_by,
        expires_at=datetime.now(UTC) + expires_in,
        created_at=datetime.now(UTC),
    )
    session = FakeSession(uuid4())
    session.workspaces.append(workspace)
    session.invitations.append(invitation)
    return session, invitation


def _preview(session: FakeSession, token: str = TOKEN):
    """Call the endpoint with no Authorization header at all."""
    app.dependency_overrides[get_db] = lambda: session

    async def run():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            return await client.post("/api/v1/invitations/preview", json={"invitation_token": token})

    try:
        return asyncio.run(run())
    finally:
        app.dependency_overrides.clear()


def test_preview_needs_no_sign_in_and_returns_only_what_the_invitee_needs():
    session, invitation = _setup()

    response = _preview(session)

    assert response.status_code == 200
    body = response.json()
    assert set(body) == {"workspace_name", "email", "role", "expires_at"}
    assert (body["workspace_name"], body["email"], body["role"]) == ("Acme Support", "new.person@acme.test", "AGENT")
    assert invitation.status == "PENDING"


def test_unknown_token_is_not_found():
    session, _ = _setup()

    response = _preview(session, "some-other-token-value-with-more-than-thirty-two-chars")

    assert response.status_code == 404


@pytest.mark.parametrize(
    ("status", "code", "detail"),
    [
        ("ACCEPTED", 409, "Invitation has already been used"),
        ("DECLINED", 409, "Invitation has already been used"),
        ("REVOKED", 410, "Invitation has been revoked"),
        ("EXPIRED", 410, "Invitation has expired"),
    ],
)
def test_finished_invitations_reveal_nothing_but_the_reason(status, code, detail):
    session, _ = _setup(status)

    response = _preview(session)

    assert response.status_code == code
    assert response.json() == {"detail": detail}


def test_past_expiry_is_reported_without_changing_the_invitation():
    session, invitation = _setup(expires_in=-timedelta(minutes=1))

    response = _preview(session)

    assert response.status_code == 410
    assert invitation.status == "PENDING"


@pytest.mark.parametrize("token", ["", "short", "x" * 129])
def test_malformed_tokens_are_rejected(token):
    session, _ = _setup()

    assert _preview(session, token).status_code == 422
