from decimal import Decimal

from pydantic import BaseModel


class UserDashboardResponse(BaseModel):
    welcome_name: str
    total_orders: int
    pending_orders: int
    completed_orders: int


class AdminDashboardCards(BaseModel):
    total_users: int
    todays_sales: Decimal
    monthly_revenue: Decimal
    pending_orders: int
    completed_orders: int
    cancelled_orders: int
    best_selling_product: str | None


class RevenuePoint(BaseModel):
    label: str
    revenue: Decimal


class OrdersPoint(BaseModel):
    label: str
    count: int


class AdminDashboardResponse(BaseModel):
    cards: AdminDashboardCards
    revenue_chart: list[RevenuePoint]
    sales_chart: list[RevenuePoint]
    orders_chart: list[OrdersPoint]
