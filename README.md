# StayFlow

StayFlow is a fullstack short-stay discovery, booking, and operations platform built with Next.js App Router, TypeScript, Tailwind CSS, Prisma, Zod, and provider abstractions for payments and AI. It is aimed at city inventory where guests book hourly, overnight, or daily rooms.

## Getting started

```bash
cp .env.example .env
npm install
npm run dev
```

The UI runs with typed demo data and mock providers without external service keys. PostgreSQL is required for Prisma migrations and seed data:

```bash
npm run db:push
npm run db:seed
```

The functional local demo persists data to `data/app-data.json`. Sign in at `/login` with
`stayflow-demo`. Set strong `ADMIN_PASSWORD` and `SESSION_SECRET` values in production.
Supabase setup notes live in `docs/SUPABASE_SETUP.md`.

Guest flow:

1. Open a room and choose hourly, overnight, or daily.
2. Enter guest details and reserve.
3. Complete the server-confirmed demo payment.
4. Use the private status URL to view or cancel the booking.

The floating support chat can answer property questions and look up a booking when both its
reference and booking email are supplied.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Architecture and design decisions live in `docs/`. Public routes are server-first; interactive booking, search, support, theme, and layout-builder features are isolated client components. Availability, pricing, payment truth, and permissions remain server-authoritative.
