from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.schemas.common import normalize_email


def _required_name(value: str) -> str:
    value = value.strip()
    if not value:
        raise ValueError("Customer name cannot be blank")
    return value


def _optional_text(value: str | None) -> str | None:
    """Store an empty optional field as null."""
    return value.strip() or None if value is not None else None


class CustomerCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(max_length=120)
    email: str = Field(max_length=320)
    phone: str | None = Field(default=None, max_length=40)
    company: str | None = Field(default=None, max_length=120)

    _name = field_validator("name")(_required_name)
    _email = field_validator("email")(normalize_email)
    _optional = field_validator("phone", "company")(_optional_text)


class CustomerUpdateRequest(BaseModel):
    """Only the fields that are sent are changed. Send null to clear phone or company."""

    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(default=None, max_length=120)
    email: str | None = Field(default=None, max_length=320)
    phone: str | None = Field(default=None, max_length=40)
    company: str | None = Field(default=None, max_length=120)

    @field_validator("name")
    @classmethod
    def name_must_not_be_blank(cls, value: str | None) -> str | None:
        return None if value is None else _required_name(value)

    @field_validator("email")
    @classmethod
    def email_must_be_valid(cls, value: str | None) -> str | None:
        return None if value is None else normalize_email(value)

    _optional = field_validator("phone", "company")(_optional_text)

    @model_validator(mode="after")
    def require_a_valid_update(self):
        if not self.model_fields_set:
            raise ValueError("Provide at least one field to update")
        for field in ("name", "email"):
            if field in self.model_fields_set and getattr(self, field) is None:
                raise ValueError(f"Customer {field} cannot be null")
        return self


class CustomerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    email: str
    phone: str | None
    company: str | None
    created_at: datetime
    updated_at: datetime


class CustomerListResponse(BaseModel):
    items: list[CustomerResponse]
    total: int
    page: int
    page_size: int
