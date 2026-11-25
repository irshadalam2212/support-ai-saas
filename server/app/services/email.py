import html
import logging
import smtplib
import ssl
from datetime import datetime
from email.message import EmailMessage

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def send_workspace_invitation_email(
    *,
    recipient: str,
    workspace_name: str,
    role: str,
    invitation_url: str,
    expires_at: datetime,
) -> bool:
    """Send an invite when SMTP is configured; return False when unavailable."""
    settings = get_settings()
    if not all((settings.smtp_host, settings.email_from)):
        return False
    if bool(settings.smtp_username) != bool(settings.smtp_password):
        logger.warning("Workspace invitation email is not configured: SMTP credentials are incomplete")
        return False

    safe_workspace = " ".join(workspace_name.split())
    safe_role = role.lower()
    escaped_workspace = html.escape(safe_workspace)
    escaped_role = html.escape(safe_role)
    expiration = expires_at.strftime("%B %d, %Y at %H:%M UTC")

    message = EmailMessage()
    message["Subject"] = f"Invitation to join {safe_workspace} on SupportAI"
    message["From"] = settings.email_from
    message["To"] = recipient
    message.set_content(
        f"You have been invited to join {safe_workspace} as a {safe_role}.\n\n"
        f"Accept or decline this invitation: {invitation_url}\n\n"
        f"This invitation expires on {expiration}."
    )
    message.add_alternative(
        "<!doctype html><html><body style=\"font-family:Arial,sans-serif;color:#111827\">"
        "<h1>You are invited to SupportAI</h1>"
        f"<p>You have been invited to join <strong>{escaped_workspace}</strong> as a "
        f"{escaped_role}.</p>"
        f"<p><a href=\"{html.escape(invitation_url, quote=True)}\">View invitation</a></p>"
        f"<p>This invitation expires on {html.escape(expiration)}.</p>"
        "</body></html>",
        subtype="html",
    )

    try:
        if settings.smtp_secure:
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(
                settings.smtp_host,
                settings.smtp_port,
                timeout=10,
                context=context,
            ) as smtp:
                _authenticate_and_send(smtp, settings.smtp_username, settings.smtp_password, message)
        else:
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as smtp:
                if settings.smtp_starttls:
                    smtp.starttls(context=ssl.create_default_context())
                _authenticate_and_send(smtp, settings.smtp_username, settings.smtp_password, message)
    except (OSError, smtplib.SMTPException, ssl.SSLError):
        logger.warning("Could not deliver workspace invitation email")
        return False
    return True


def _authenticate_and_send(
    smtp: smtplib.SMTP,
    username: str | None,
    password: str | None,
    message: EmailMessage,
) -> None:
    if username and password:
        smtp.login(username, password)
    smtp.send_message(message)
