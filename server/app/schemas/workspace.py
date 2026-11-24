from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict

WorkspaceRoleName = Literal["OWNER", "ADMIN", "AGENT", "CUSTOMER"]


class WorkspaceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    slug: str
    description: str | None
    role: WorkspaceRoleName
    created_at: datetime
