import asyncio
from datetime import UTC, datetime
from uuid import uuid4

from httpx import ASGITransport, AsyncClient

from app.api.deps import get_current_claims
from app.db.session import get_db
from app.main import app
from app.models.profile import Profile


def test_profile_mapper_resolves_external_supabase_auth_foreign_key():
    assert list(Profile.__mapper__._sorted_tables) == [Profile.__table__]
    assert next(iter(Profile.__table__.c.id.foreign_keys)).target_fullname == "auth.users.id"


class FakeSession:
    def __init__(self):
        self.profiles: dict[object, Profile] = {}

    def get(self, model, profile_id):
        assert model is Profile
        return self.profiles.get(profile_id)

    def add(self, profile):
        self.profiles[profile.id] = profile

    def commit(self):
        return None

    def refresh(self, profile):
        now = datetime.now(UTC)
        if profile.created_at is None:
            profile.created_at = now
        profile.updated_at = now


def test_profile_sync_uses_verified_subject_and_updates_claim_data():
    user_id = uuid4()
    claims = {
        "sub": str(user_id),
        "email": "Agent@Example.com",
        "user_metadata": {"full_name": "Taylor Agent"},
    }
    session = FakeSession()
    app.dependency_overrides[get_current_claims] = lambda: claims
    app.dependency_overrides[get_db] = lambda: session

    async def sync_and_read():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            sync = await client.post("/api/v1/profiles/me", json={"id": str(uuid4())})
            read = await client.get("/api/v1/profiles/me")
            claims["email"] = "taylor@example.com"
            claims["user_metadata"] = {"full_name": "Taylor Updated"}
            updated = await client.post("/api/v1/profiles/me")
            return sync, read, updated

    try:
        sync, read, updated = asyncio.run(sync_and_read())
    finally:
        app.dependency_overrides.clear()

    assert sync.status_code == 200
    assert sync.json()["id"] == str(user_id)
    assert sync.json()["email"] == "agent@example.com"
    assert sync.json()["full_name"] == "Taylor Agent"
    assert read.status_code == 200
    assert updated.json()["email"] == "taylor@example.com"
    assert updated.json()["full_name"] == "Taylor Updated"
