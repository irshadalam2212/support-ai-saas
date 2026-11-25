"""The API on real PostgreSQL, connected with the restricted role."""

import asyncio
from urllib.parse import parse_qs, urlparse
from uuid import uuid4

import pytest
from fastapi import Request
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import get_current_claims
from app.api.v1.endpoints import workspaces as workspace_endpoints
from app.db.session import get_db
from app.main import app

ATTEMPTS = 15  # Races do not happen every time, so repeat them.


@pytest.fixture(scope="module")
def api(database):
    """Real routes and real SQL; only Supabase token verification is replaced."""
    engine = database.api_engine()
    people: dict[str, dict] = {}

    def claims(request: Request):
        return people[request.headers["x-test-user"]]

    def session():
        with Session(engine, autoflush=False) as db:
            yield db

    app.dependency_overrides[get_current_claims] = claims
    app.dependency_overrides[get_db] = session
    # Never send real email, even when SMTP is configured in .env.
    patch = pytest.MonkeyPatch()
    patch.setattr(workspace_endpoints, "send_workspace_invitation_email", lambda **_kwargs: False)

    class Api:
        def person(self) -> dict:
            user_id = database.new_user()
            key = uuid4().hex
            people[key] = {"sub": str(user_id), "email": f"{key}@api.test"}
            return {"key": key, "id": str(user_id), "email": people[key]["email"]}

        def run(self, *requests):
            """Send (user, method, path, body) requests at the same time."""

            async def go():
                async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test/api/v1") as client:
                    return await asyncio.gather(*(
                        client.request(method, path, json=body, headers={"x-test-user": user["key"]})
                        for user, method, path, body in requests
                    ))

            return asyncio.run(go())

        def call(self, user, method, path, body=None):
            return self.run((user, method, path, body))[0]

        def signed_up(self):
            user = self.person()
            assert self.call(user, "POST", "/profiles/me").status_code == 200
            return user

        def workspace(self, owner) -> str:
            response = self.call(owner, "POST", "/workspaces", {"name": f"W {uuid4().hex[:8]}"})
            assert response.status_code == 201, response.text
            return response.json()["id"]

        def invite(self, inviter, workspace_id, invitee, role="AGENT") -> str:
            response = self.call(
                inviter, "POST", f"/workspaces/{workspace_id}/members/invitations",
                {"email": invitee["email"], "role": role},
            )
            assert response.status_code == 201, response.text
            return parse_qs(urlparse(response.json()["invitation_url"]).query)["token"][0]

        def join(self, inviter, workspace_id, role="AGENT"):
            user = self.signed_up()
            token = self.invite(inviter, workspace_id, user, role)
            accepted = self.call(user, "POST", "/invitations/accept", {"invitation_token": token})
            assert accepted.status_code == 200, accepted.text
            return user

        def roles(self, workspace_id) -> dict[str, str]:
            with database.owner.connect() as connection:
                rows = connection.execute(
                    text("SELECT user_id, role FROM public.workspace_members WHERE workspace_id = :w"),
                    {"w": workspace_id},
                )
                return {str(user_id): role for user_id, role in rows}

    try:
        yield Api()
    finally:
        patch.undo()
        app.dependency_overrides.clear()
        engine.dispose()


def test_the_whole_workspace_lifecycle_works_with_the_restricted_role(api):
    owner = api.signed_up()
    first = api.call(owner, "POST", "/workspaces/onboarding")
    assert first.status_code == 200, first.text
    workspace_id = api.workspace(owner)
    admin = api.join(owner, workspace_id, "ADMIN")
    agent = api.join(admin, workspace_id)
    base = f"/workspaces/{workspace_id}"

    steps = [
        (owner, "GET", "/workspaces", None, 200),
        (owner, "GET", base, None, 200),
        (owner, "PATCH", base, {"description": "Updated"}, 200),
        (admin, "GET", f"{base}/members", None, 200),
        (admin, "PATCH", f"{base}/members/{agent['id']}", {"role": "CUSTOMER"}, 200),
        (admin, "DELETE", f"{base}/members/{agent['id']}", None, 204),
        (owner, "POST", f"{base}/members/{admin['id']}/transfer-ownership", None, 200),
        (admin, "DELETE", f"{base}/members/{owner['id']}", None, 204),
    ]
    for user, method, path, body, expected in steps:
        response = api.call(user, method, path, body)
        assert response.status_code == expected, f"{method} {path}: {response.status_code} {response.text}"
    assert api.roles(workspace_id) == {admin["id"]: "OWNER"}


def test_another_workspace_cannot_be_read_or_changed(api):
    owner_a, owner_b = api.signed_up(), api.signed_up()
    api.workspace(owner_a)
    b = api.workspace(owner_b)
    member_b = api.join(owner_b, b)
    base = f"/workspaces/{b}"

    attempts = [
        ("GET", base, None),
        ("PATCH", base, {"name": "Taken over"}),
        ("GET", f"{base}/members", None),
        ("POST", f"{base}/members/invitations", {"email": "x@api.test", "role": "ADMIN"}),
        ("PATCH", f"{base}/members/{member_b['id']}", {"role": "ADMIN"}),
        ("DELETE", f"{base}/members/{member_b['id']}", None),
        ("POST", f"{base}/members/{member_b['id']}/transfer-ownership", None),
    ]
    for method, path, body in attempts:
        assert api.call(owner_a, method, path, body).status_code == 404, f"{method} {path}"
    assert api.roles(b) == {owner_b["id"]: "OWNER", member_b["id"]: "AGENT"}
    assert b not in [item["id"] for item in api.call(owner_a, "GET", "/workspaces").json()]


@pytest.mark.parametrize("attempt", range(ATTEMPTS))
def test_simultaneous_transfers_leave_exactly_one_owner(api, attempt):
    owner = api.signed_up()
    workspace_id = api.workspace(owner)
    first, second = api.join(owner, workspace_id, "ADMIN"), api.join(owner, workspace_id, "ADMIN")
    path = f"/workspaces/{workspace_id}/members"

    responses = api.run(
        (owner, "POST", f"{path}/{first['id']}/transfer-ownership", None),
        (owner, "POST", f"{path}/{second['id']}/transfer-ownership", None),
    )

    assert sorted(response.status_code for response in responses) == [200, 403]
    assert list(api.roles(workspace_id).values()).count("OWNER") == 1


@pytest.mark.parametrize("attempt", range(ATTEMPTS))
def test_a_transfer_racing_a_removal_keeps_one_owner(api, attempt):
    owner = api.signed_up()
    workspace_id = api.workspace(owner)
    admin = api.join(owner, workspace_id, "ADMIN")
    path = f"/workspaces/{workspace_id}/members/{admin['id']}"

    responses = api.run(
        (owner, "POST", f"{path}/transfer-ownership", None),
        (owner, "DELETE", path, None),
    )

    assert all(response.status_code < 500 for response in responses), [r.text for r in responses]
    assert list(api.roles(workspace_id).values()).count("OWNER") == 1


@pytest.mark.parametrize("attempt", range(ATTEMPTS))
def test_an_invitation_accepted_twice_at_once_joins_once(api, attempt):
    owner = api.signed_up()
    workspace_id = api.workspace(owner)
    invitee = api.signed_up()
    token = api.invite(owner, workspace_id, invitee)
    request = (invitee, "POST", "/invitations/accept", {"invitation_token": token})

    responses = api.run(request, request)

    assert sorted(response.status_code for response in responses) == [200, 409]
    assert api.roles(workspace_id)[invitee["id"]] == "AGENT"
