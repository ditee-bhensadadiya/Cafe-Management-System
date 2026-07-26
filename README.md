# Cafe Management System

A full-stack cafe ordering & management system, built incrementally:

| Phase | Scope | Status |
|---|---|---|
| 1 | Backend: Auth & Database (FastAPI + Supabase Postgres) | ✅ Done |
| 2 | Backend: Products, Categories, Orders, Cart/Checkout, Dashboards | ✅ Done |
| 3 | Frontend: Auth pages, Menu, Cart, Checkout (React + Tailwind + Framer Motion) | ✅ Done |
| 4 | Frontend: Full Admin Panel (charts, CRUD tables, order/user management) | ⏳ Next |
| 5 | Remaining user features (profile editing, notifications, exports) + polish | Planned |
| 6 | Testing, Docker Compose, deployment configs | Planned |

## Structure

```
cafe-system/
  backend/    FastAPI + SQLAlchemy + Alembic + Supabase Postgres — see backend/README.md
  frontend/   React (Vite) + Tailwind + Framer Motion — see frontend/README.md
```

## Quick start

**Backend**
```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in your Supabase connection strings + JWT secret
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend** (in a second terminal)
```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173. The frontend dev server proxies API calls to
`http://localhost:8000`.

See `backend/README.md` and `frontend/README.md` for full details on what each phase includes.
