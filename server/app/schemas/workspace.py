from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.schemas.common import normalize_email

WorkspaceRoleName = Literal["OWNER", "ADMIN", "AGENT", "CUSTOMER"]
InvitationRoleName = Literal["ADMIN", "AGENT", "CUSTOMER"]
InvitationStatus = Literal["PENDING", "ACCEPTED", "DECLINED", "REVOKED", "EXPIRED"]


class WorkspaceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    slug: str
    description: str | None
    role: WorkspaceRoleName
    created_at: datetime


class WorkspaceMemberResponse(BaseModel):
    user_id: UUID
    email: str | None
    full_name: str | None
    role: WorkspaceRoleName
    joined_at: datetime


class WorkspaceMemberRoleUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    # Ownership cannot be assigned here, so the same roles as invitations apply.
    role: InvitationRoleName


class WorkspaceInvitationCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: str = Field(min_length=3, max_length=320)
    role: InvitationRoleName

    @field_validator("email")
    @classmethod
    def normalize_and_validate_email(cls, value: str) -> str:
        return normalize_email(value)


class WorkspaceInvitationResponse(BaseModel):
    id: UUID
    workspace_id: UUID
    email: str
    role: InvitationRoleName
    status: InvitationStatus
    expires_at: datetime
    created_at: datetime
    invitation_url: str
    email_sent: bool


class InvitationDecisionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    invitation_token: str = Field(min_length=32, max_length=128)


class InvitationPreviewResponse(BaseModel):
    workspace_name: str
    email: str
    role: InvitationRoleName
    expires_at: datetime


class InvitationDecisionResponse(BaseModel):
    invitation_id: UUID
    workspace_id: UUID
    role: InvitationRoleName
    status: Literal["ACCEPTED", "DECLINED"]


class WorkspaceUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(default=None, max_length=120)
    description: str | None = Field(default=None, max_length=500)

    @field_validator("name")
    @classmethod
    def name_must_not_be_blank(cls, value: str | None) -> str | None:
        if value is not None and not value.strip():
            raise ValueError("Workspace name cannot be blank")
        return value.strip() if value is not None else None

    @model_validator(mode="after")
    def require_an_update(self):
        if not self.model_fields_set:
            raise ValueError("Provide a workspace name or description to update")
        if "name" in self.model_fields_set and self.name is None:
            raise ValueError("Workspace name cannot be null")
        return self


class WorkspaceCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=500)

    @field_validator("name")
    @classmethod
    def name_must_not_be_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Workspace name cannot be blank")
        return value
