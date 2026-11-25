import asyncio
from datetime import UTC, datetime, timedelta
import hashlib
from uuid import UUID, uuid4

import pytest
from httpx import ASGITransport, AsyncClient

from app.api.deps import get_current_claims
from app.db.session import get_db
from app.main import app
from app.models.profile import Profile
from app.models.workspace import Workspace, WorkspaceInvitation, WorkspaceMember
from test_workspaces import FakeSession

ROLES = ["OWNER", "ADMIN", "AGENT", "CUSTOMER"]
# Every (actor, target) pair that is allowed to change or remove a member.
ALLOWED = {
    ("OWNER", "ADMIN"),
    ("OWNER", "AGENT"),
    ("OWNER", "CUSTOMER"),
    ("ADMIN", "AGENT"),
    ("ADMIN", "CUSTOMER"),
}


def _workspace(name: str = "Acme") -> Workspace:
    return Workspace(
        id=uuid4(), name=name, slug=name.lower(), created_by=uuid4(), created_at=datetime.now(UTC)
    )


def _join(session: FakeSession, workspace: Workspace, role: str, user_id: UUID | None = None) -> WorkspaceMember:
    user_id = user_id or uuid4()
    member = WorkspaceMember(
        workspace_id=workspace.id, user_id=user_id, role=role, created_at=datetime.now(UTC)
    )
    session.members.append(member)
    if not any(profile.id == user_id for profile in session.profiles):
        session.profiles.append(
            Profile(id=user_id, email=f"{user_id.hex[:8]}@acme.test", full_name=f"{role.title()} Person")
        )
    return member


def _invitation(workspace: Workspace, *, invited_by: UUID, email: str, token: str = "x" * 40) -> WorkspaceInvitation:
    return WorkspaceInvitation(
        id=uuid4(),
        workspace_id=workspace.id,
        email=email,
        role="AGENT",
        token_hash=hashlib.sha256(token.encode()).hexdigest(),
        status="PENDING",
        invited_by=invited_by,
        expires_at=datetime.now(UTC) + timedelta(days=1),
        created_at=datetime.now(UTC),
    )


def _setup(actor_role: str) -> tuple[FakeSession, Workspace, WorkspaceMember]:
    """A workspace whose signed-in user holds the given role."""
    actor_id = uuid4()
    session = FakeSession(actor_id)
    session.profiles = []
    workspace = _workspace()
    session.workspaces.append(workspace)
    actor = _join(session, workspace, actor_role, actor_id)
    return session, workspace, actor


def _send(session: FakeSession, *requests: tuple[str, str, dict | None], email: str | None = None):
    """Run requests in order as the session's user and return the responses."""
    app.dependency_overrides[get_current_claims] = lambda: {"sub": str(session.user_id), "email": email}
    app.dependency_overrides[get_db] = lambda: session

    async def run():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            return [await client.request(method, url, json=body) for method, url, body in requests]

    try:
        return asyncio.run(run())
    finally:
        app.dependency_overrides.clear()


def _url(workspace: Workspace, user_id: UUID) -> str:
    return f"/api/v1/workspaces/{workspace.id}/members/{user_id}"


@pytest.mark.parametrize("target_role", ROLES)
@pytest.mark.parametrize("actor_role", ROLES)
def test_role_change_permissions(actor_role, target_role):
    session, workspace, _ = _setup(actor_role)
    target = _join(session, workspace, target_role)
    new_role = "AGENT" if target_role != "AGENT" else "CUSTOMER"

    [response] = _send(session, ("PATCH", _url(workspace, target.user_id), {"role": new_role}))

    if (actor_role, target_role) in ALLOWED:
        assert response.status_code == 200
        assert response.json()["role"] == new_role
        assert response.json()["user_id"] == str(target.user_id)
        assert target.role == new_role
    else:
        assert response.status_code == 403
        assert target.role == target_role


@pytest.mark.parametrize("target_role", ROLES)
@pytest.mark.parametrize("actor_role", ROLES)
def test_removal_permissions(actor_role, target_role):
    session, workspace, _ = _setup(actor_role)
    target = _join(session, workspace, target_role)

    [response] = _send(session, ("DELETE", _url(workspace, target.user_id), None))

    if (actor_role, target_role) in ALLOWED:
        assert response.status_code == 204
        assert response.content == b""
        assert target not in session.members
    else:
        assert response.status_code == 403
        assert target in session.members


def test_owner_cannot_demote_or_remove_themselves():
    session, workspace, owner = _setup("OWNER")

    demote, remove = _send(
        session,
        ("PATCH", _url(workspace, owner.user_id), {"role": "ADMIN"}),
        ("DELETE", _url(workspace, owner.user_id), None),
    )

    assert demote.status_code == 403
    assert remove.status_code == 403
    assert owner.role == "OWNER"
    assert owner in session.members


@pytest.mark.parametrize("body", [{"role": "OWNER"}, {"role": "SUPERUSER"}, {}, {"role": "AGENT", "user_id": "x"}])
def test_invalid_role_changes_are_rejected(body):
    session, workspace, _ = _setup("OWNER")
    target = _join(session, workspace, "AGENT")

    [response] = _send(session, ("PATCH", _url(workspace, target.user_id), body))

    assert response.status_code == 422
    assert target.role == "AGENT"


def test_members_of_another_workspace_cannot_be_reached():
    session, workspace, _ = _setup("OWNER")
    other = _workspace("Other")
    session.workspaces.append(other)
    outsider = _join(session, other, "AGENT")

    through_own, through_other = _send(
        session,
        # Their ID under the caller's workspace: they are not a member there.
        ("DELETE", _url(workspace, outsider.user_id), None),
        # The real workspace: the caller is not a member, so it is not disclosed.
        ("DELETE", _url(other, outsider.user_id), None),
    )

    assert through_own.status_code == 404
    assert through_own.json()["detail"] == "Member not found"
    assert through_other.status_code == 404
    assert through_other.json()["detail"] == "Workspace not found"
    assert outsider in session.members


def test_removal_revokes_invitations_from_and_to_the_member_only_in_that_workspace():
    session, workspace, owner = _setup("OWNER")
    admin = _join(session, workspace, "ADMIN")
    admin_email = session.get(Profile, admin.user_id).email
    other = _workspace("Other")
    session.workspaces.append(other)
    sent_by_admin = _invitation(workspace, invited_by=admin.user_id, email="friend@acme.test", token="a" * 40)
    sent_to_admin = _invitation(workspace, invited_by=owner.user_id, email=admin_email, token="b" * 40)
    unrelated = _invitation(workspace, invited_by=owner.user_id, email="colleague@acme.test", token="c" * 40)
    elsewhere = _invitation(other, invited_by=admin.user_id, email=admin_email, token="d" * 40)
    session.invitations.extend([sent_by_admin, sent_to_admin, unrelated, elsewhere])

    [response] = _send(session, ("DELETE", _url(workspace, admin.user_id), None))

    assert response.status_code == 204
    assert sent_by_admin.status == "REVOKED"
    assert sent_to_admin.status == "REVOKED"
    assert unrelated.status == "PENDING"
    assert elsewhere.status == "PENDING"


@pytest.mark.parametrize(
    ("previous", "new", "expected"),
    [("ADMIN", "AGENT", "REVOKED"), ("ADMIN", "ADMIN", "PENDING"), ("AGENT", "ADMIN", "PENDING")],
)
def test_only_losing_admin_revokes_sent_invitations(previous, new, expected):
    session, workspace, _ = _setup("OWNER")
    member = _join(session, workspace, previous)
    sent = _invitation(workspace, invited_by=member.user_id, email="friend@acme.test")
    session.invitations.append(sent)

    [response] = _send(session, ("PATCH", _url(workspace, member.user_id), {"role": new}))

    assert response.status_code == 200
    assert sent.status == expected


def test_removed_member_loses_access_to_the_workspace():
    session, workspace, _ = _setup("OWNER")
    agent = _join(session, workspace, "AGENT")
    owner_id = session.user_id

    session.user_id = agent.user_id
    [before] = _send(session, ("GET", f"/api/v1/workspaces/{workspace.id}", None))
    session.user_id = owner_id
    _send(session, ("DELETE", _url(workspace, agent.user_id), None))
    session.user_id = agent.user_id
    [after] = _send(session, ("GET", f"/api/v1/workspaces/{workspace.id}", None))

    assert before.status_code == 200
    assert after.status_code == 404


def _transfer_url(workspace: Workspace, user_id: UUID) -> str:
    return f"{_url(workspace, user_id)}/transfer-ownership"


def test_owner_transfers_ownership_to_an_admin_and_becomes_admin():
    session, workspace, owner = _setup("OWNER")
    admin = _join(session, workspace, "ADMIN")

    [response] = _send(session, ("POST", _transfer_url(workspace, admin.user_id), None))

    assert response.status_code == 200
    assert response.json()["id"] == str(workspace.id)
    assert response.json()["role"] == "ADMIN"
    assert owner.role == "ADMIN"
    assert admin.role == "OWNER"
    assert [member.role for member in session.members].count("OWNER") == 1


@pytest.mark.parametrize("actor_role", ["ADMIN", "AGENT", "CUSTOMER"])
def test_only_the_owner_can_transfer_ownership(actor_role):
    session, workspace, _ = _setup(actor_role)
    owner = _join(session, workspace, "OWNER")
    admin = _join(session, workspace, "ADMIN")

    [response] = _send(session, ("POST", _transfer_url(workspace, admin.user_id), None))

    assert response.status_code == 403
    assert owner.role == "OWNER"
    assert admin.role == "ADMIN"


@pytest.mark.parametrize("target_role", ["AGENT", "CUSTOMER"])
def test_ownership_can_only_go_to_an_admin(target_role):
    session, workspace, owner = _setup("OWNER")
    target = _join(session, workspace, target_role)

    [response] = _send(session, ("POST", _transfer_url(workspace, target.user_id), None))

    assert response.status_code == 409
    assert response.json()["detail"] == "Ownership can only be transferred to an admin"
    assert (owner.role, target.role) == ("OWNER", target_role)


def test_ownership_cannot_go_to_self_or_to_a_non_member():
    session, workspace, owner = _setup("OWNER")
    other = _workspace("Other")
    session.workspaces.append(other)
    outsider = _join(session, other, "ADMIN")

    to_self, to_outsider = _send(
        session,
        ("POST", _transfer_url(workspace, owner.user_id), None),
        ("POST", _transfer_url(workspace, outsider.user_id), None),
    )

    assert to_self.status_code == 409
    assert to_outsider.status_code == 404
    assert (owner.role, outsider.role) == ("OWNER", "ADMIN")


def test_after_a_transfer_the_roles_apply_immediately():
    session, workspace, former = _setup("OWNER")
    first = _join(session, workspace, "ADMIN")
    second = _join(session, workspace, "ADMIN")

    transfer, again, remove_new_owner = _send(
        session,
        ("POST", _transfer_url(workspace, first.user_id), None),
        ("POST", _transfer_url(workspace, second.user_id), None),
        ("DELETE", _url(workspace, first.user_id), None),
    )
    session.user_id = first.user_id
    [new_owner_demotes_former] = _send(
        session, ("PATCH", _url(workspace, former.user_id), {"role": "AGENT"})
    )

    assert transfer.status_code == 200
    assert again.status_code == 403
    assert remove_new_owner.status_code == 403
    assert new_owner_demotes_former.status_code == 200
    assert (first.role, second.role, former.role) == ("OWNER", "ADMIN", "AGENT")


def test_revoked_invitation_cannot_be_used():
    session, workspace, owner = _setup("OWNER")
    token = "revoked-token-value-with-more-than-thirty-two-chars"
    invitee = Profile(id=uuid4(), email="invitee@acme.test")
    session.profiles.append(invitee)
    invitation = _invitation(workspace, invited_by=owner.user_id, email=invitee.email, token=token)
    invitation.status = "REVOKED"
    session.invitations.append(invitation)
    session.user_id = invitee.id

    [response] = _send(
        session,
        ("POST", "/api/v1/invitations/accept", {"invitation_token": token}),
        email=invitee.email,
    )

    assert response.status_code == 410
    assert response.json()["detail"] == "Invitation has been revoked"
    assert all(member.user_id != invitee.id for member in session.members)
