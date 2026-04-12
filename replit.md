# Velvet Store — Adult Wellness Ecommerce

## Overview

pnpm workspace monorepo using TypeScript. Velvet is a production-ready adult wellness ecommerce platform for the Kenyan market.

## Project Structure

```
artifacts/
  velvet-store/       # React + Vite storefront + admin dashboard (port from $PORT)
  api-server/         # Express API server (port 8080)
lib/
  api-client-react/   # Generated React Query hooks (from openapi spec)
  api-spec/           # OpenAPI 3.0 specification
  api-zod/            # Generated Zod schemas
  db/                 # Drizzle ORM schema + PostgreSQL client
```

## Credentials

- **Admin login:** `admin@velvetke.com` / `velvet2024`
- **Admin panel:** `/admin`
- **Storefront:** `/`

## Brand Identity

- **Font:** Inter (weight 300 thin throughout, 200 for display/hero text)
- **Logo:** AI-generated visual mark at `artifacts/velvet-store/src/assets/velvet-logo.png`
- **Background:** #0B0B0F (near-black)
- **Card:** #14141A
- **Plum accent:** #6F2C91
- **Soft rose:** #C26D85
- **Champagne text:** #E7D9C8
- **Muted:** #A1A1AA

## Features

### Storefront
- Age gate (configurable, localStorage-backed)
- Homepage with banner slider, best sellers, new arrivals, offers, testimonials, FAQ
- Shop page with search, category filters, tag filters, sort, pagination
- Product detail page with image gallery, add to cart, related products
- Cart (localStorage, drawer + full page)
- Checkout: anonymous option, Nairobi/outside Nairobi shipping, coupon codes, COD/manual payment
- Order confirmation page
- Categories, Offers, FAQ, About pages
- Discreet packaging messaging throughout

### Admin Dashboard (/admin)
- Login with JWT token (global auth token getter)
- Dashboard: revenue stats, order status breakdown, recent orders
- Products: full CRUD with image upload, tags, inventory, status
- Orders: status filter, detail expand, status updates
- Categories, Banners, Coupons, Testimonials, FAQs: full CRUD
- Customers: list with order count and spend
- Settings: site config, shipping fees, age gate

## API

- Express app on port 8080
- PostgreSQL via `DATABASE_URL` environment variable
- Bearer token auth for admin routes (in-memory token map)
- Files served from `/api/uploads/` (base64 upload → disk)
- Coupons: VELVET10 (10% off, min KES 3000), WELCOME500 (KES 500 off, min KES 2000)
- Shipping: KES 300 Nairobi, KES 450 outside Nairobi

## Running

All workflows auto-start. To restart:
- API: `pnpm --filter @workspace/api-server run dev`
- Frontend: `pnpm --filter @workspace/velvet-store run dev`
