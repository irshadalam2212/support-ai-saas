import asyncio

from httpx import ASGITransport, AsyncClient, Response

from app.main import app


def test_vite_origin_can_call_fastapi_health_endpoint() -> None:
    async def request_health_and_preflight() -> tuple[Response, Response]:
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as client:
            origin = "http://localhost:5173"
            health = await client.get(
                "/api/v1/health",
                headers={"Origin": origin},
            )
            preflight = await client.options(
                "/api/v1/health",
                headers={
                    "Origin": origin,
                    "Access-Control-Request-Method": "GET",
                    "Access-Control-Request-Headers": "accept",
                },
            )
            return health, preflight

    health, preflight = asyncio.run(request_health_and_preflight())

    assert health.status_code == 200
    assert health.headers["access-control-allow-origin"] == "http://localhost:5173"
    assert preflight.status_code == 200
    assert preflight.headers["access-control-allow-origin"] == "http://localhost:5173"
