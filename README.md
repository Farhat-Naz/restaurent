# 🍽️ The Golden Fork — Restaurant Management & Online Ordering

A full-stack restaurant platform built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, **shadcn/ui (Base UI)**, **Prisma 7**, and **SQLite** (swappable for Neon Postgres in production).

## Features (v1)

**Customer**
- Home page: hero, categories, chef's favorites, story, guest reviews, promo banner, newsletter
- Menu: search, category filter, vegetarian/spicy filters, sorting, ratings
- Food details: sizes, add-ons, quantity, ingredients, allergens, calories, reviews + review form, related dishes
- Cart: persistent (localStorage), slide-out sheet, quantity editing
- Checkout: delivery/pickup, coupons (`WELCOME10`, `FLAT5`, `GOLDEN20`), tips, order notes, Cash on Delivery / Pay at Restaurant
- Order tracking: live status timeline with polling (`/track`, try `GF-DEMO01`)
- Table reservations with date/time/party-size picker
- **AI support chat ("Forky")**: order-status lookup, menu/allergen/coupon/hours answers. Rule-based out of the box; plugs into an LLM automatically when `AI_GATEWAY_API_KEY` or `OPENAI_API_KEY` is set.

**Admin** (`/admin` — protected by staff login; demo credentials `admin@goldenfork.dev` / `admin123`)
- Dashboard: revenue (all-time/7-day/today), active orders, pending reservations, average rating, best sellers, recent orders
- Orders: full table with status workflow (Received → Confirmed → Preparing → Ready → Out for Delivery → Delivered / Cancelled)
- Menu management: add items, toggle availability, feature items, safe delete (items with order history are hidden, not deleted)
- Reservations: confirm / seat / complete / cancel workflow

## Getting started

```bash
npm install
npm run db:push    # create the SQLite schema (dev.db)
npm run db:seed    # seed menu, coupons, reviews, demo orders
npm run dev        # http://localhost:3000
```

## Useful scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run db:push` | Sync Prisma schema to the database |
| `npm run db:seed` | Reset + seed demo data |
| `npm run db:studio` | Browse the database in Prisma Studio |

## Environment variables

See `.env.example`. Highlights:

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes (defaults to `file:./dev.db`) | Prisma datasource |
| `AUTH_SECRET` | yes in production | Signs admin session cookies |
| `ADMIN_PASSWORD` | no (default `admin123`) | Seeded admin password |
| `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` | no | Enables "Pay Online (Card)" at checkout |
| `AI_GATEWAY_API_KEY` | no | Enables LLM chat via Vercel AI Gateway |
| `OPENAI_API_KEY` | no | Enables LLM chat via OpenAI directly |

### Stripe setup

1. Set `STRIPE_SECRET_KEY` (test key is fine) — the "Pay Online (Card)" option activates automatically.
2. Forward webhooks locally: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` and copy the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET`.
3. The webhook (`checkout.session.completed`) marks orders as paid and confirms them.

## Architecture notes

- Single Next.js app: server components read Prisma directly; mutations go through route handlers (`/api/*`) for customer flows and server actions for admin flows.
- **All order pricing is recomputed server-side** — client totals are never trusted.
- SQLite via `@prisma/adapter-better-sqlite3` for zero-config local dev. For production, switch the datasource to Postgres (e.g. Neon) and update the adapter.
- Food images are emoji placeholders (`FoodImage` component) — swap in Cloudinary/Vercel Blob URLs later without schema changes.

## Roadmap (from the full spec)

- Customer accounts (registration, order history, saved addresses) — admin login is done
- PayPal, wallets, gift cards (Stripe card payments + COD already work)
- Real-time order updates (currently 8s polling), driver GPS tracking
- Loyalty points, gift cards, email/SMS notifications (Resend/Twilio)
- Inventory & employee management, multi-language (i18n), PWA
