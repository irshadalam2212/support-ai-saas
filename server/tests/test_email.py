from datetime import UTC, datetime, timedelta
from types import SimpleNamespace

from app.services import email


class FakeSMTP:
    messages = []
    logins = []

    def __init__(self, *_args, **_kwargs):
        self.started_tls = False

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return None

    def starttls(self, **_kwargs):
        self.started_tls = True

    def login(self, username, password):
        self.logins.append((username, password))

    def send_message(self, message):
        self.messages.append(message)


def test_workspace_invitation_email_uses_configured_smtp(monkeypatch):
    FakeSMTP.messages = []
    FakeSMTP.logins = []
    monkeypatch.setattr(email, "get_settings", lambda: SimpleNamespace(
        smtp_host="smtp.example.test",
        smtp_port=587,
        smtp_username="mailer",
        smtp_password="secret",
        smtp_secure=False,
        smtp_starttls=True,
        email_from="SupportAI <support@example.test>",
    ))
    monkeypatch.setattr(email.smtplib, "SMTP", FakeSMTP)

    sent = email.send_workspace_invitation_email(
        recipient="agent@example.test",
        workspace_name="Acme Support",
        role="AGENT",
        invitation_url="https://app.example.test/invitations/respond?token=secret-token",
        expires_at=datetime.now(UTC) + timedelta(days=7),
    )

    assert sent is True
    assert FakeSMTP.logins == [("mailer", "secret")]
    assert len(FakeSMTP.messages) == 1
    assert FakeSMTP.messages[0]["To"] == "agent@example.test"
    assert "Acme Support" in FakeSMTP.messages[0].get_body(preferencelist=("plain",)).get_content()
    assert "secret-token" in FakeSMTP.messages[0].get_body(preferencelist=("html",)).get_content()


def test_workspace_invitation_email_skips_smtp_when_unconfigured(monkeypatch):
    monkeypatch.setattr(email, "get_settings", lambda: SimpleNamespace(
        smtp_host=None,
        email_from=None,
    ))

    sent = email.send_workspace_invitation_email(
        recipient="agent@example.test",
        workspace_name="Acme Support",
        role="AGENT",
        invitation_url="https://app.example.test/invitations/respond?token=secret-token",
        expires_at=datetime.now(UTC) + timedelta(days=7),
    )

    assert sent is False
