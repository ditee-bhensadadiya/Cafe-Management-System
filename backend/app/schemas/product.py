import uuid
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, Field

from app.schemas.category import CategoryResponse


class ProductSortField(str, Enum):
    NAME = "name"
    PRICE = "price"
    RATING = "rating"
    CREATED_AT = "created_at"


class SortOrder(str, Enum):
    ASC = "asc"
    DESC = "desc"


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    description: str | None = Field(None, max_length=1000)
    image_url: str | None = None
    price: Decimal = Field(..., gt=0)
    stock: int = Field(0, ge=0)
    is_available: bool = True
    category_id: uuid.UUID


class ProductUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=150)
    description: str | None = Field(None, max_length=1000)
    image_url: str | None = None
    price: Decimal | None = Field(None, gt=0)
    stock: int | None = Field(None, ge=0)
    is_available: bool | None = None
    category_id: uuid.UUID | None = None


class ProductResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    image_url: str | None
    price: Decimal
    stock: int
    is_available: bool
    rating: Decimal
    rating_count: int
    category: CategoryResponse

    model_config = {"from_attributes": True}


class PaginatedProductsResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
