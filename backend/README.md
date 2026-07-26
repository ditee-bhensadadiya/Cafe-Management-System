# Cafe Management System — Backend (Phases 1 & 2)

Incremental build on FastAPI + SQLAlchemy (async) + Alembic + Supabase Postgres.
**Phase 1** (auth & database) and **Phase 2** (products, orders, dashboards, admin) are complete.

## What's included
- `app/models/user.py` — User model (UUID pk, role enum admin/user, profile fields, reset-token fields)
- `app/schemas/auth.py` — Pydantic v2 schemas enforcing every validation rule from the spec:
  - Name: required, min 3 letters, alphabets only
  - Email: standard RFC email validation, duplicate-email check on register
  - Phone: exactly 10 digits, numbers only
  - Password: min 8 chars, upper + lower + digit + special char; confirm-password match
- `app/auth/security.py` — bcrypt password hashing, JWT access + reset tokens
- `app/auth/dependencies.py` — `get_current_user` / `get_current_active_admin` (role-based auth)
- `app/api/auth_routes.py` — `POST /api/auth/register`, `/login`, `/forgot-password`, `/reset-password`, `GET /api/auth/me`
- `app/services/email_service.py` — SMTP email for password-reset links (safe no-op if unconfigured)
- `app/middleware/error_handlers.py` — consistent JSON error shape for 401/403/422/500
- `app/middleware/rate_limit.py` — brute-force protection on auth endpoints (slowapi)
- `app/migrations/` — Alembic setup + initial migration creating the `users` table

## Phase 2 additions
- `app/models/category.py`, `product.py`, `order.py` — Category, Product, Order, OrderItem
- `app/api/category_routes.py` — public read, admin-only create/update/delete, duplicate-name protection
- `app/api/product_routes.py` — public menu browsing with **search, category/price filters, sort, pagination**; admin CRUD
- `app/services/cart_service.py` — single source of truth for pricing: validates stock/availability, computes **tax (5%) + bulk discount (10% over ₹500)**
- `app/api/order_routes.py`:
  - `POST /api/orders/cart/calculate` — live cart total preview
  - `POST /api/orders` — checkout: prices the cart server-side (never trusts client totals), decrements stock, snapshots item prices/names, generates an order number
  - `GET /api/orders/my` — the logged-in user's order history, filterable by status, paginated
  - `GET /api/orders/{id}` — order detail (owner or admin only)
  - `GET /api/orders` (admin) — all orders, searchable/filterable/paginated
  - `PUT /api/orders/{id}/status` (admin) — pending → accepted → preparing → ready → completed / cancelled
- `app/api/dashboard_routes.py`:
  - `GET /api/dashboard/user` — welcome message + total/pending/completed order counts
  - `GET /api/dashboard/admin` — total users, today's sales, monthly revenue, pending/completed/cancelled counts, best-selling product, plus revenue/sales/orders chart series (last 7/30 days)
- `app/api/admin_user_routes.py` — admin user list (search/filter by role & status), activate/deactivate, delete (self-protection built in)
- Second Alembic migration (`0002_categories_products_orders.py`) creating all new tables + Postgres enums

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` with your **Supabase** connection strings (Project Settings → Database → Connection string):
- `DATABASE_URL` — sync, `postgresql+psycopg2://...` (used by Alembic migrations)
- `ASYNC_DATABASE_URL` — async, `postgresql+asyncpg://...` (used by the running app)

Generate a strong `JWT_SECRET_KEY`, e.g.:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
```

## Run the migration (creates the `users` table in Supabase)

```bash
alembic upgrade head
```

## Run the API

```bash
uvicorn app.main:app --reload
```

- Swagger UI: http://localhost:8000/api/docs
- Health check: http://localhost:8000/api/health

## Try it

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","phone":"9876543210","password":"Cafe@123","confirm_password":"Cafe@123"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Cafe@123"}'

# Authenticated "me" endpoint
curl http://localhost:8000/api/auth/me -H "Authorization: Bearer <access_token>"
```

## Notes on the admin role
There's no public "become admin" endpoint by design (security). To create your first
admin, either:
1. Register normally, then run `UPDATE users SET role = 'admin' WHERE email = '...';` directly in Supabase, or
2. Add a one-off seed script (planned for Phase 2 alongside the admin panel APIs).

## Docker

```bash
docker build -t cafe-backend .
docker run --env-file .env -p 8000:8000 cafe-backend
```

## What's next (upcoming phases)
- **Phase 3:** React frontend — auth pages, menu (search/filter/sort/pagination UI), cart, checkout — Tailwind + Framer Motion + the luxury-cafe theme
- **Phase 4:** Admin panel UI (dashboard charts, product/category/order/user management screens)
- **Phase 5:** Remaining user features (profile photo upload, notifications, CSV/PDF export) + polish
- **Phase 6:** Testing, Docker Compose, Vercel/Render deployment configs, full API docs
