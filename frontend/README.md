# Cafe Management System — Frontend (Phase 3: Auth, Menu, Cart, Checkout)

React (Vite) + Tailwind CSS + Framer Motion, in the "Minimal + Luxury Cafe" theme.

## What's included
- **Theme**: `tailwind.config.js` — exact brand colors (`primary #6F4E37`, `secondary #C8A97E`,
  `cream #FFF8F3`, `espresso #2B2B2B`, `accent #D2691E`), Fraunces (display) + Inter (body) fonts,
  glassmorphism `.glass-card`, soft shadows, and a signature **steam-curl divider** motif.
- **Auth pages** (`src/pages/auth/`): Login, Register, Forgot Password, Reset Password — full
  client-side validation mirroring the backend rules exactly (`src/utils/validationRules.js`),
  inline field errors, server-error banners, toast notifications.
- **Menu** (`src/pages/Menu.jsx`): debounced search, category chips, price/availability filter,
  sort (newest/price/rating/name), pagination, skeleton loaders, empty states.
- **Cart** (`src/pages/Cart.jsx`): add/remove/increase/decrease, live tax + discount calculation
  from the backend (never computed client-side), SweetAlert2 confirm-to-remove.
- **Checkout** (`src/pages/Checkout.jsx`): customer info form, payment method picker, order
  summary, places the order and redirects to a confirmation page.
- **Order tracking** (`src/pages/MyOrders.jsx`, `OrderSuccess.jsx`): history with status filter
  and color-coded status badges.
- **Dark / light mode**: `src/context/ThemeContext.jsx`, toggle in the navbar.
- **State**: `AuthContext` (session + JWT), `CartContext` (persisted cart). React Query handles
  all server-state fetching/caching.
- **Axios layer** (`src/api/`): JWT auto-attached, global 401 handling, one automatic retry on
  network failure, normalized error shape matching the backend's `{message, errors[]}` format.
- Route guards (`src/routes/guards.jsx`): `RequireAuth`, `RequireAdmin`, `RequireGuest`.
- A minimal read-only Profile page and an Admin dashboard snapshot are included as placeholders —
  full editing and the full admin panel UI land in Phases 4–5.

## Setup

```bash
cd frontend
npm install
cp .env.example .env.local   # only needed for production; dev uses the Vite proxy
npm run dev
```

The dev server proxies `/api/*` to `http://localhost:8000` (see `vite.config.js`), so make sure
the backend from Phases 1–2 is running.

## Build

```bash
npm run build   # outputs to dist/
npm run preview
```

## Deploying

Set `VITE_API_BASE_URL` in your hosting provider's environment variables (e.g. Vercel) to your
deployed backend's `/api` URL, since there's no dev proxy in production.

## What's next (upcoming phases)
- **Phase 4:** Full admin panel UI — dashboard charts (Recharts), product/category CRUD tables,
  order management board, user management table
- **Phase 5:** Profile editing (name/phone/address/photo upload), notifications, CSV/PDF export, polish
- **Phase 6:** Testing, Docker Compose (frontend + backend + Postgres), Vercel + Render/Railway deploy configs
