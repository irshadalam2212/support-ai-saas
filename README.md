# SupportAI SaaS

SupportAI is migrating from the initial React/Express prototype to the architecture described in the master prompt at the workspace root: React, TypeScript, and Vite; FastAPI and Python; Supabase Auth and PostgreSQL; and later pgvector, Gemini, LangChain, LangGraph, Redis, and Celery.

## Repository layout during migration

- `client/` — existing React frontend.
- `server/` — new FastAPI backend foundation.
- `server-node-legacy/` — preserved Express/Prisma implementation for legacy business APIs during migration. Browser authentication uses Supabase Auth.

## Run the FastAPI foundation

See [`server/README.md`](server/README.md). In short, create a Python virtual environment, install `.[dev]`, and run Uvicorn from `server/` on port 8000. The initial health endpoint is `GET /api/v1/health`.

## Check the React-to-FastAPI connection

Start FastAPI, then start the Vite client from `client/` with `npm run dev`. Open [`http://localhost:5173/dev/health`](http://localhost:5173/dev/health) to check the API. To use a different FastAPI URL, copy `client/.env.example` to `client/.env.local` and update `VITE_FASTAPI_BASE_URL`.

## Existing frontend and legacy backend

The React app is in `client/`; its current Vite development server uses port 5173. The preserved Express service and its MySQL configuration are in `server-node-legacy/`. FastAPI verifies Supabase access tokens at `GET /api/v1/auth/me`; other business endpoints will migrate incrementally.

## Migration status

The FastAPI configuration, SQLAlchemy connection setup, Alembic environment, CORS configuration, health endpoint, Supabase bearer-token verification, profile synchronization, workspace/membership/invitation schema, workspace onboarding/list/create/detail/update/member-list endpoints, invitation creation and response, invitation email delivery, and dashboard workspace selector are implemented. Workspace access is checked against verified membership, and only owners/admins may update workspace details or invite members. Customers, tickets, and other business endpoints remain to be implemented. Keep migration steps incremental and preserve existing data and the legacy service until replacements are verified.
