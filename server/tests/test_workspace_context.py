"""The session logic only. PostgreSQL behaviour is covered in tests/postgres."""

from uuid import uuid4

from app.db.workspace_context import _apply_workspace, use_workspace


class FakeConnection:
    def __init__(self):
        self.settings: list[str] = []

    def execute(self, statement, parameters):
        assert "set_config('app.workspace_id'" in str(statement)
        self.settings.append(parameters["workspace_id"])


class FakeSession:
    def __init__(self, in_transaction: bool):
        self.info: dict = {}
        self.open = in_transaction
        self.current = FakeConnection()

    def in_transaction(self):
        return self.open

    def connection(self):
        return self.current


def test_a_session_without_a_workspace_sets_nothing():
    connection = FakeConnection()

    _apply_workspace(FakeSession(False), None, connection)

    assert connection.settings == []


def test_the_workspace_applies_to_the_open_transaction_and_every_later_one():
    session, later, workspace_id = FakeSession(True), FakeConnection(), uuid4()

    use_workspace(session, workspace_id)
    _apply_workspace(session, None, later)

    assert session.current.settings == [str(workspace_id)]
    assert later.settings == [str(workspace_id)]


def test_before_a_transaction_starts_it_is_only_remembered():
    session, workspace_id = FakeSession(False), uuid4()

    use_workspace(session, workspace_id)

    assert session.current.settings == []
    assert session.info == {"workspace_id": str(workspace_id)}
