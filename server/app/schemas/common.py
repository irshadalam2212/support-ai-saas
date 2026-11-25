import re

_EMAIL_PATTERN = re.compile(r"[^@\s]+@[^@\s]+\.[^@\s]+")


def normalize_email(value: str) -> str:
    """Trim and lower-case an email address, rejecting values that are not one."""
    value = value.strip().lower()
    if not _EMAIL_PATTERN.fullmatch(value):
        raise ValueError("Enter a valid email address")
    return value
