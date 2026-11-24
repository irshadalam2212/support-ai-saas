from pydantic import BaseModel


class CurrentUserResponse(BaseModel):
    id: str
    email: str | None = None
