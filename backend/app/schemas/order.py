import re
import uuid
from decimal import Decimal

from pydantic import BaseModel, Field, field_validator

from app.models.order import OrderStatus, PaymentMethod, PaymentStatus

PHONE_REGEX = re.compile(r"^[0-9]{10}$")

TAX_RATE = Decimal("0.05")  # 5% tax — adjust to your locale
DISCOUNT_THRESHOLD = Decimal("500")  # spend over this and get a discount
DISCOUNT_RATE = Decimal("0.10")  # 10% discount


class CartItemInput(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(..., gt=0, le=50)


class CartCalculateRequest(BaseModel):
    items: list[CartItemInput] = Field(..., min_length=1)


class CartItemPriced(BaseModel):
    product_id: uuid.UUID
    name: str
    unit_price: Decimal
    quantity: int
    line_total: Decimal
    is_available: bool
    stock: int


class CartSummaryResponse(BaseModel):
    items: list[CartItemPriced]
    subtotal: Decimal
    tax_amount: Decimal
    discount_amount: Decimal
    total_amount: Decimal


class CheckoutRequest(BaseModel):
    items: list[CartItemInput] = Field(..., min_length=1)
    customer_name: str = Field(..., min_length=3, max_length=100)
    customer_phone: str
    customer_address: str | None = Field(None, max_length=500)
    payment_method: PaymentMethod
    notes: str | None = Field(None, max_length=500)

    @field_validator("customer_phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        if not PHONE_REGEX.match(v):
            raise ValueError("Phone number must contain exactly 10 digits and only numbers.")
        return v


class OrderItemResponse(BaseModel):
    product_id: uuid.UUID | None
    product_name: str
    unit_price: Decimal
    quantity: int
    line_total: Decimal

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: uuid.UUID
    order_number: str
    status: OrderStatus
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    subtotal: Decimal
    tax_amount: Decimal
    discount_amount: Decimal
    total_amount: Decimal
    customer_name: str
    customer_phone: str
    customer_address: str | None
    notes: str | None
    items: list[OrderItemResponse]

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class PaginatedOrdersResponse(BaseModel):
    items: list[OrderResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
