"""
Dashboard endpoints:
- GET /api/dashboard/user   -> welcome + order counts for the logged-in user
- GET /api/dashboard/admin  -> cards + revenue/sales/orders charts for the admin panel
"""
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_active_admin, get_current_user
from app.database.session import get_db
from app.models.order import Order, OrderItem, OrderStatus, PaymentStatus
from app.models.user import User
from app.schemas.dashboard import (
    AdminDashboardCards,
    AdminDashboardResponse,
    OrdersPoint,
    RevenuePoint,
    UserDashboardResponse,
)

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/user", response_model=UserDashboardResponse)
async def user_dashboard(
    db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)
) -> UserDashboardResponse:
    base = select(func.count()).select_from(Order).where(Order.user_id == user.id)

    total_orders = (await db.execute(base)).scalar_one()
    pending_orders = (
        await db.execute(base.where(Order.status.in_([OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.PREPARING, OrderStatus.READY])))
    ).scalar_one()
    completed_orders = (await db.execute(base.where(Order.status == OrderStatus.COMPLETED))).scalar_one()

    return UserDashboardResponse(
        welcome_name=user.name,
        total_orders=total_orders,
        pending_orders=pending_orders,
        completed_orders=completed_orders,
    )


@router.get("/admin", response_model=AdminDashboardResponse)
async def admin_dashboard(
    db: AsyncSession = Depends(get_db), _admin: User = Depends(get_current_active_admin)
) -> AdminDashboardResponse:
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    thirty_days_ago = now - timedelta(days=30)

    total_users = (await db.execute(select(func.count()).select_from(User))).scalar_one()

    todays_sales = (
        await db.execute(
            select(func.coalesce(func.sum(Order.total_amount), 0)).where(
                Order.created_at >= today_start, Order.payment_status == PaymentStatus.PAID
            )
        )
    ).scalar_one()

    monthly_revenue = (
        await db.execute(
            select(func.coalesce(func.sum(Order.total_amount), 0)).where(
                Order.created_at >= month_start, Order.payment_status == PaymentStatus.PAID
            )
        )
    ).scalar_one()

    pending_orders = (
        await db.execute(
            select(func.count()).select_from(Order).where(
                Order.status.in_([OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.PREPARING, OrderStatus.READY])
            )
        )
    ).scalar_one()
    completed_orders = (
        await db.execute(select(func.count()).select_from(Order).where(Order.status == OrderStatus.COMPLETED))
    ).scalar_one()
    cancelled_orders = (
        await db.execute(select(func.count()).select_from(Order).where(Order.status == OrderStatus.CANCELLED))
    ).scalar_one()

    best_seller_row = (
        await db.execute(
            select(OrderItem.product_name, func.sum(OrderItem.quantity).label("qty"))
            .group_by(OrderItem.product_name)
            .order_by(func.sum(OrderItem.quantity).desc())
            .limit(1)
        )
    ).first()
    best_selling_product = best_seller_row[0] if best_seller_row else None

    # Last 7 days revenue/orders trend
    day_bucket = func.date(Order.created_at)
    daily_rows = (
        await db.execute(
            select(day_bucket.label("day"), func.sum(Order.total_amount).label("revenue"), func.count().label("count"))
            .where(Order.created_at >= now - timedelta(days=7), Order.payment_status == PaymentStatus.PAID)
            .group_by(day_bucket)
            .order_by(day_bucket)
        )
    ).all()

    revenue_chart = [RevenuePoint(label=str(row.day), revenue=Decimal(row.revenue or 0)) for row in daily_rows]
    orders_chart = [OrdersPoint(label=str(row.day), count=row.count) for row in daily_rows]

    # Monthly sales trend (last 30 days, same shape as revenue for the Sales Chart)
    sales_rows = (
        await db.execute(
            select(day_bucket.label("day"), func.sum(Order.total_amount).label("revenue"))
            .where(Order.created_at >= thirty_days_ago, Order.payment_status == PaymentStatus.PAID)
            .group_by(day_bucket)
            .order_by(day_bucket)
        )
    ).all()
    sales_chart = [RevenuePoint(label=str(row.day), revenue=Decimal(row.revenue or 0)) for row in sales_rows]

    cards = AdminDashboardCards(
        total_users=total_users,
        todays_sales=Decimal(todays_sales or 0),
        monthly_revenue=Decimal(monthly_revenue or 0),
        pending_orders=pending_orders,
        completed_orders=completed_orders,
        cancelled_orders=cancelled_orders,
        best_selling_product=best_selling_product,
    )

    return AdminDashboardResponse(
        cards=cards, revenue_chart=revenue_chart, sales_chart=sales_chart, orders_chart=orders_chart
    )
