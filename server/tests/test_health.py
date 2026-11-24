import asyncio

from httpx import ASGITransport, AsyncClient, Response

from app.main import app


def test_health_endpoint_returns_service_status() -> None:
    async def request_health() -> Response:
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as client:
            return await client.get("/api/v1/health")

    response = asyncio.run(request_health())

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "supportai-api"}
