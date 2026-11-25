# SupportAI SaaS

SupportAI is built with React, TypeScript, and Vite; FastAPI and Python; and Supabase Auth and PostgreSQL. pgvector, Gemini, LangChain, LangGraph, Redis, and Celery are planned for later phases.

## Repository layout

- `client/` — React frontend.
- `server/` — FastAPI backend.

## Run the project

Follow the setup instructions in [server/README.md](server/README.md) to configure and run FastAPI. Start the frontend from `client/` with `npm run dev`. The backend health endpoint is `GET /api/v1/health`; the frontend connection check is at `http://localhost:5173/dev/health`.

Set `VITE_FASTAPI_BASE_URL` in `client/.env.local` if FastAPI runs at a different address. Set the Supabase browser URL and publishable key there as described in `client/README.md`.

## Current implementation

Supabase Auth, profile synchronization, workspace creation and switching, workspace settings, member listing, role changes, member removal, ownership transfer, and invitation create/respond flows are implemented. The frontend is connected to these endpoints. Customer and ticket workflows, knowledge ingestion, RAG, AI agents, analytics, and billing integrations remain future work. Areas without backend support are labeled in the UI rather than showing sample records as live data.
