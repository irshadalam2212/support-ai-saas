# SupportAI FastAPI service

This is the Python API foundation. The previous Express/Prisma application is preserved in `../server-node-legacy` during the migration. The React client uses Supabase Auth directly; FastAPI verifies Supabase access tokens on protected routes.

## Setup

Requires Python 3.12–3.14. From this directory, create and activate a virtual environment, then install the project:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -e ".[dev]"
Copy-Item .env.example .env
```

Set `DATABASE_URL` in `.env` to the PostgreSQL connection string from Supabase Dashboard → **Connect**. For this persistent FastAPI service, use the direct connection when the host network supports IPv6 (or the project has IPv4 enabled); otherwise use the shared **Session pooler** string. Do not use the transaction pooler for this long-running service. Standard `postgresql://` URLs are adapted to the installed psycopg 3 driver, and the connection requires TLS (`sslmode=require`). Percent-encode reserved characters in the password. Never commit `.env` or put database credentials in the React client.

Set `SUPABASE_URL` to the project URL and `SUPABASE_PUBLISHABLE_KEY` to its publishable key. For asymmetric signing keys (ES256 or RS256), FastAPI verifies tokens against the project's cached JWKS endpoint and checks issuer, audience, expiry, role, and subject. If the project still uses legacy HS256 signing, FastAPI asks Supabase Auth to validate the token using `/auth/v1/user`; it does not store or use the JWT signing secret. The publishable key is not a service-role key and is safe to use for this Auth request.

After setting the URL, verify the live database connection with:

```powershell
python -m app.db.check_connection
```

The command runs `SELECT 1` and reports success or a safe error category without printing the URL or password. The API health endpoint itself does not require a database.

## Supabase pgvector extension

The repeatable Supabase-specific extension setup is in `supabase/0001_enable_pgvector.sql`. Run it with:

```powershell
python -m app.db.enable_pgvector
```

The command enables the extension in the `extensions` schema and verifies its version. It does not create application tables, vector columns, or indexes; those wait until the embedding model and dimension are selected.

## Run the API

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Check `GET http://127.0.0.1:8000/api/v1/health`. Interactive OpenAPI docs are at `http://127.0.0.1:8000/docs`.

The protected `GET /api/v1/auth/me` endpoint requires `Authorization: Bearer <access-token>` and returns the verified user's ID and email. `POST /api/v1/profiles/me` idempotently creates or syncs the user's profile from verified token claims; `GET /api/v1/profiles/me` reads that profile. `POST /api/v1/workspaces/onboarding` creates or returns the user's initial workspace, and `GET /api/v1/workspaces` lists only workspaces where that verified user has a membership. Profile and workspace identities come from verified claims/database results, never request-supplied identity fields. A missing or invalid token returns `401`; unavailable Supabase key discovery/Auth validation returns `503`.

## Database migrations

Alembic uses the SQLAlchemy models and the same psycopg/TLS URL handling. The migrations create:

- `public.profiles`, linked to `auth.users.id`; the profile ID is the Supabase Auth user ID.
- `public.workspaces`, whose creator references a profile and whose slug is globally unique.
- `public.workspace_members`, keyed by `(workspace_id, user_id)` with a constrained role.

Profiles are user-owned. Workspaces are tenant roots, and memberships are scoped to a workspace. RLS limits authenticated Supabase reads to member workspaces and permitted membership rows. The browser has no write grants on workspace tables. FastAPI must still scope every operation to the verified JWT subject because its direct database connection does not automatically carry that user's JWT. Invitations, general workspace creation, and role-protected workspace writes remain pending.

Review the generated SQL before applying the migration. To preview without changing the database, run `python -m alembic upgrade head --sql`. Once approved, run `python -m alembic upgrade head` from this directory.

## Current boundary

Supabase handles browser sign-in, signup, password recovery, refresh, and logout. FastAPI verifies bearer tokens, synchronizes profiles, and creates/lists initial workspaces. The dashboard can switch among the current user's workspaces. Invitations and role-protected workspace writes remain pending. The unrelated legacy API helper remains available during the incremental migration.
