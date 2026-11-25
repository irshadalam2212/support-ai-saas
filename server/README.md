# SupportAI FastAPI service

This is the FastAPI backend. The React client uses Supabase Auth directly; FastAPI verifies Supabase access tokens on protected routes.

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

The protected `GET /api/v1/auth/me` endpoint requires `Authorization: Bearer <access-token>` and returns the verified user's ID and email. `POST /api/v1/profiles/me` idempotently creates or syncs the user's profile from verified token claims; `GET /api/v1/profiles/me` reads that profile. `POST /api/v1/workspaces/onboarding` creates or returns the user's initial workspace. `POST /api/v1/workspaces` creates an additional workspace owned by the authenticated user. `GET /api/v1/workspaces` lists only workspaces where that verified user has a membership. `GET` and `PATCH /api/v1/workspaces/{workspace_id}` read or update a workspace after checking membership; only owners and admins may update it. `GET /api/v1/workspaces/{workspace_id}/members` lists member profile details for workspace owners and admins. `POST /api/v1/workspaces/{workspace_id}/members/invitations` creates a seven-day invitation and sends an email when SMTP is configured; otherwise the team page offers a copyable invite link. Only an SHA-256 hash of the token is stored. An authenticated account with a verified matching email can accept or decline the token through `POST /api/v1/invitations/accept` and `POST /api/v1/invitations/decline`. `POST /api/v1/invitations/preview` needs no sign-in: whoever holds a pending token can see the workspace name, invited email, role, and expiry, so the invitation page can offer account creation. It changes nothing and returns only the reason for a used, revoked, or expired token. People who sign up from that page get no workspace of their own; the token is kept in their Supabase user metadata until they answer, so they return to the invitation after confirming their email. Configure `FRONTEND_BASE_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_SECURE`, `SMTP_STARTTLS`, and `EMAIL_FROM` in the server environment for email delivery. Profile and workspace identities come from verified claims/database results, never request-supplied identity fields. A missing or invalid token returns `401`; unavailable Supabase key discovery/Auth validation returns `503`.

## Member management

| Endpoint | Who | Rules |
|---|---|---|
| `PATCH /api/v1/workspaces/{workspace_id}/members/{user_id}` with `{"role": ...}` | Owner, admin | Role is `ADMIN`, `AGENT`, or `CUSTOMER` |
| `DELETE /api/v1/workspaces/{workspace_id}/members/{user_id}` | Owner, admin | Returns `204` |
| `POST /api/v1/workspaces/{workspace_id}/members/{user_id}/transfer-ownership` | Owner | The target must be an admin; the caller becomes an admin |

An owner can manage admins, agents, and customers; an admin can manage agents and customers only. The owner cannot be changed or removed, so ownership moves only through the transfer endpoint, which locks both membership rows and always leaves exactly one owner. Removing a member revokes pending invitations sent by or to them, and demoting an admin revokes the invitations they sent.

## Database migrations

Alembic uses the SQLAlchemy models and the same psycopg/TLS URL handling. The migrations create:

- `public.profiles`, linked to `auth.users.id`; the profile ID is the Supabase Auth user ID.
- `public.workspaces`, whose creator references a profile and whose slug is globally unique.
- `public.workspace_members`, keyed by `(workspace_id, user_id)` with a constrained role.
- `public.workspace_invitations`, linked to a workspace and inviter profile, with a hashed token, invited email, role, status, expiry, and creation timestamp. A partial unique index prevents multiple pending invitations for the same workspace/email; ownership cannot be granted through invitations.

- `0004_restricted_roles` removes direct browser writes, protects `alembic_version`, and creates the `supportai_app` role for the API.

Profiles are user-owned. Workspaces are tenant roots, and memberships and invitations are scoped to a workspace. RLS limits authenticated Supabase reads to the user's own profile, member workspaces, and permitted membership rows. After migration `0004`, the browser cannot write to any application table and has no access to invitation rows; all changes go through FastAPI. FastAPI must still scope every operation to the verified JWT subject because its direct database connection does not automatically carry that user's JWT.

Review the generated SQL before applying a migration. To preview without changing the database, run `python -m alembic upgrade head --sql`. Once approved, run `python -m alembic upgrade head` from this directory.

## Restricted database role

The API should not connect as the database owner. `supportai_app` may only read and write the four application tables, cannot change the schema, cannot read `auth.users`, and cannot delete profiles, workspaces, or invitations. Row Level Security gives it access to all rows because FastAPI performs the membership and role checks; the database does not isolate tenants from this role.

1. Apply the migrations with the owner connection.
2. In the Supabase SQL editor, create a login that joins the role. Choose a long random password and do not save the statement in the repository:

   ```sql
   CREATE ROLE supportai_api LOGIN PASSWORD '<your-password>' IN ROLE supportai_app;
   ```

3. In `server/.env`, move the current owner connection string to `MIGRATION_DATABASE_URL`. Set `DATABASE_URL` to the same string with the new user and password. With the Supabase session pooler the user name is `supportai_api.<project-ref>`.
4. Verify, then restart the API. The command should report that the role is restricted:

   ```powershell
   python -m app.db.check_connection
   ```

To go back, restore the owner connection string in `DATABASE_URL`. New tables added by later migrations must grant `supportai_app` the privileges they need and add a policy for it.

## PostgreSQL tests

Tests in `tests/postgres/` check Row Level Security, role privileges, tenant isolation, and simultaneous changes on a real server. They are skipped unless `TEST_DATABASE_URL` is set, and they refuse a database that already has the application tables or that matches the application's server and user.

Use a disposable database: a local PostgreSQL 15 or newer, or an empty Supabase project kept only for testing (use its session pooler or direct connection and a user that can create roles). The tests apply every migration and revert them afterwards.

```powershell
$env:TEST_DATABASE_URL = "postgresql://postgres@127.0.0.1:5432/supportai_test?sslmode=disable"
python -m pytest tests/postgres
Remove-Item Env:TEST_DATABASE_URL
```

## Current boundary

Supabase handles browser sign-in, signup, password recovery, refresh, and logout. FastAPI verifies bearer tokens, synchronizes profiles, and manages workspace creation, listing, detail, member listing, role changes, member removal, ownership transfer, owner/admin updates, invitation creation, and invitation acceptance/decline. The dashboard can switch among the current user's workspaces. Settings displays the authenticated account and profile, reads workspace details, and supports workspace create/update. The Team Members page lists and manages members and creates invitations; the public invitation page routes recipients through sign-in before responding. SMTP email delivery is optional until SMTP settings are configured.
