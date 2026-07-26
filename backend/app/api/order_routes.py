"""
Cart preview, checkout (creates an order), order history/tracking for users,
and full order management for admins.
"""
import math
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.dependencies import get_current_active_admin, get_current_user
from app.database.session import get_db
from app.models.order import Order, OrderItem, OrderStatus
from app.models.user import User
from app.schemas.order import (
    CartCalculateRequest,
    CartSummaryResponse,
    CheckoutRequest,
    OrderResponse,
    OrderStatusUpdate,
    PaginatedOrdersResponse,
)
from app.services.cart_service import price_cart
from app.utils.order_number import generate_order_number

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.post("/cart/calculate", response_model=CartSummaryResponse)
async def calculate_cart(
    payload: CartCalculateRequest,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_user),
) -> CartSummaryResponse:
    """Live price preview for the cart page — validates stock/availability, applies tax + discount."""
    summary, _ = await price_cart(payload.items, db)
    return summary


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def checkout(
    payload: CheckoutRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> OrderResponse:
    summary, products = await price_cart(payload.items, db)

    order = Order(
        order_number=generate_order_number(),
        user_id=user.id,
        subtotal=summary.subtotal,
        tax_amount=summary.tax_amount,
        discount_amount=summary.discount_amount,
        total_amount=summary.total_amount,
        status=OrderStatus.PENDING,
        payment_method=payload.payment_method,
        customer_name=payload.customer_name,
        customer_phone=payload.customer_phone,
        customer_address=payload.customer_address,
        notes=payload.notes,
    )

    for priced_item, product in zip(summary.items, products):
        product.stock -= priced_item.quantity  # decrement stock atomically within this transaction
        order.items.append(
            OrderItem(
                product_id=product.id,
                product_name=product.name,
                unit_price=priced_item.unit_price,
                quantity=priced_item.quantity,
                line_total=priced_item.line_total,
            )
        )

    db.add(order)
    await db.commit()

    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order.id)
    )
    return OrderResponse.model_validate(result.scalar_one())


@router.get("/my", response_model=PaginatedOrdersResponse)
async def my_orders(
    status_filter: OrderStatus | None = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> PaginatedOrdersResponse:
    query = select(Order).options(selectinload(Order.items)).where(Order.user_id == user.id)
    count_query = select(func.count()).select_from(Order).where(Order.user_id == user.id)

    if status_filter:
        query = query.where(Order.status == status_filter)
        count_query = count_query.where(Order.status == status_filter)

    total = (await db.execute(count_query)).scalar_one()
    query = query.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    orders = (await db.execute(query)).scalars().all()

    return PaginatedOrdersResponse(
        items=[OrderResponse.model_validate(o) for o in orders],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=max(1, math.ceil(total / page_size)),
    )


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> OrderResponse:
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
    if order.user_id != user.id and user.role.value != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You cannot view this order.")
    return OrderResponse.model_validate(order)


# ---- Admin order management ----

@router.get("", response_model=PaginatedOrdersResponse)
async def list_all_orders(
    status_filter: OrderStatus | None = Query(None, alias="status"),
    search: str | None = Query(None, description="Search by order number or customer name"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_active_admin),
) -> PaginatedOrdersResponse:
    query = select(Order).options(selectinload(Order.items))
    count_query = select(func.count()).select_from(Order)

    if status_filter:
        query = query.where(Order.status == status_filter)
        count_query = count_query.where(Order.status == status_filter)
    if search:
        like = f"%{search}%"
        query = query.where((Order.order_number.ilike(like)) | (Order.customer_name.ilike(like)))
        count_query = count_query.where((Order.order_number.ilike(like)) | (Order.customer_name.ilike(like)))

    total = (await db.execute(count_query)).scalar_one()
    query = query.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    orders = (await db.execute(query)).scalars().all()

    return PaginatedOrdersResponse(
        items=[OrderResponse.model_validate(o) for o in orders],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=max(1, math.ceil(total / page_size)),
    )


@router.put("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: uuid.UUID,
    payload: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_active_admin),
) -> OrderResponse:
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")

    order.status = payload.status
    await db.commit()
    await db.refresh(order, attribute_names=["items"])
    return OrderResponse.model_validate(order)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order(
    order_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_active_admin),
) -> None:
    order = await db.get(Order, order_id)
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
    await db.delete(order)
    await db.commit()
