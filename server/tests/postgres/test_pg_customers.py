"""Customer endpoints on real PostgreSQL, with the restricted role and Row Level Security."""

from uuid import uuid4

from sqlalchemy import text

from test_pg_api import api  # noqa: F401  (fixture: the real routes using the restricted role)


def _setup(api):
    owner = api.signed_up()
    workspace_id = api.workspace(owner)
    return owner, workspace_id, f"/workspaces/{workspace_id}/customers"


def _add(api, user, base, **fields):
    body = {"name": "Customer", "email": f"{uuid4().hex}@pg.test", **fields}
    response = api.call(user, "POST", base, body)
    assert response.status_code == 201, response.text
    return response.json()


def test_the_customer_lifecycle_works_under_row_level_security(api):
    owner, workspace_id, base = _setup(api)
    agent = api.join(owner, workspace_id, "AGENT")

    created = _add(api, agent, base, name="Jane", email="jane@pg.test", company="Acme")
    listing = api.call(owner, "GET", base)
    updated = api.call(agent, "PATCH", f"{base}/{created['id']}", {"phone": "123"})
    fetched = api.call(owner, "GET", f"{base}/{created['id']}")
    duplicate = api.call(owner, "POST", base, {"name": "Again", "email": "jane@pg.test"})
    # The session must still be scoped after the rolled-back duplicate.
    after = api.call(owner, "GET", base)
    forbidden = api.call(agent, "DELETE", f"{base}/{created['id']}")
    removed = api.call(owner, "DELETE", f"{base}/{created['id']}")

    assert listing.json()["total"] == 1
    assert updated.status_code == 200 and fetched.json()["phone"] == "123"
    assert duplicate.status_code == 409
    assert after.json()["total"] == 1
    assert (forbidden.status_code, removed.status_code) == (403, 204)
    assert api.call(owner, "GET", base).json()["total"] == 0


def test_customers_stay_inside_their_workspace(api):
    owner_a, _, base_a = _setup(api)
    owner_b, _, base_b = _setup(api)
    in_a = _add(api, owner_a, base_a, email="shared@pg.test")
    _add(api, owner_b, base_b, email="shared@pg.test")

    assert [c["id"] for c in api.call(owner_a, "GET", base_a).json()["items"]] == [in_a["id"]]
    assert api.call(owner_b, "GET", f"{base_b}/{in_a['id']}").status_code == 404
    assert api.call(owner_b, "DELETE", f"{base_b}/{in_a['id']}").status_code == 404
    assert api.call(owner_b, "GET", base_a).status_code == 404


def test_requests_at_the_same_time_do_not_mix_workspaces(api):
    tenants = []
    for _ in range(4):
        owner, _, base = _setup(api)
        tenants.append((owner, base, _add(api, owner, base)["id"]))

    responses = api.run(*(
        (owner, "GET", base, None) for _ in range(5) for owner, base, _ in tenants
    ))

    for index, response in enumerate(responses):
        _, _, expected = tenants[index % len(tenants)]
        assert [c["id"] for c in response.json()["items"]] == [expected]


def test_a_customer_with_a_ticket_cannot_be_deleted(api, database):
    owner, workspace_id, base = _setup(api)
    customer = _add(api, owner, base)
    with database.owner.begin() as connection:
        connection.execute(
            text(
                """INSERT INTO public.tickets (id, workspace_id, number, customer_id, subject)
                VALUES (:id, :workspace, 1, :customer, 'Help')"""
            ),
            {"id": uuid4(), "workspace": workspace_id, "customer": customer["id"]},
        )

    response = api.call(owner, "DELETE", f"{base}/{customer['id']}")

    assert response.status_code == 409
    assert api.call(owner, "GET", f"{base}/{customer['id']}").status_code == 200
