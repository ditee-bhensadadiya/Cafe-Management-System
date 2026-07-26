import uuid

from pydantic import BaseModel


class UserListItem(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    phone: str
    role: str
    is_active: bool

    model_config = {"from_attributes": True}


class PaginatedUsersResponse(BaseModel):
    items: list[UserListItem]
    total: int
    page: int
    page_size: int
    total_pages: int


class UserActiveStatusUpdate(BaseModel):
    is_active: bool
