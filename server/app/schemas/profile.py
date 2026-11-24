from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str | None
    full_name: str | None
    created_at: datetime
    updated_at: datetime
