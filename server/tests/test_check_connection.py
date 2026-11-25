from app.db.check_connection import describe_role


def test_a_limited_role_is_reported_as_restricted():
    assert describe_role("supportai_api", False, False, False) == "Role 'supportai_api' is restricted."


def test_every_reason_for_being_unrestricted_is_listed():
    message = describe_role("postgres", True, True, True)

    assert "NOT restricted" in message
    for reason in ("superuser", "bypasses Row Level Security", "owns tables"):
        assert reason in message
