"""
Cafe Management System - FastAPI application entrypoint.

Phase 1: authentication + database foundation.
Phase 2: categories, products, cart/checkout, orders, dashboards, admin user management.
Frontend + remaining admin/user polish + testing/deploy land in later phases.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.admin_user_routes import router as admin_user_router
from app.api.auth_routes import router as auth_router
from app.api.category_routes import router as category_router
from app.api.dashboard_routes import router as dashboard_router
from app.api.order_routes import router as order_router
from app.api.product_routes import router as product_router
from app.config.settings import settings
from app.middleware.error_handlers import register_error_handlers
from app.middleware.rate_limit import limiter

app = FastAPI(
    title="Cafe Management System API",
    description="Secure REST API for the Cafe Management System (Phase 2: Products, Orders, Dashboards).",
    version="0.2.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global error handlers (consistent JSON error shape, incl. 422/401/403/500)
register_error_handlers(app)

# Routers
app.include_router(auth_router)
app.include_router(category_router)
app.include_router(product_router)
app.include_router(order_router)
app.include_router(dashboard_router)
app.include_router(admin_user_router)


@app.get("/api/health", tags=["Health"])
async def health_check() -> dict:
    return {"success": True, "message": "Cafe Management System API is running.", "environment": settings.environment}
