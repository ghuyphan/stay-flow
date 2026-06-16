# Supabase Setup

StayFlow is currently runnable with the local JSON repository in `data/app-data.json`.
The Prisma schema is prepared for Supabase Postgres, including hourly, overnight, and
daily short-stay bookings. Switching runtime reads/writes from local JSON to Prisma is
the next adapter step after credentials are available.

## 1. Create the project

1. Create a Supabase project.
2. Open Project Settings -> Database.
3. Copy the Postgres connection string.
4. Prefer the pooled connection string for the app runtime.
5. Use the direct connection string for migrations if Supabase provides a separate one.

## 2. Configure `.env`

Copy `.env.example` to `.env` and fill these values:

```bash
DATA_ADAPTER=local
DATABASE_URL="postgresql://postgres:[password]@[host]:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[password]@[host]:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_STORAGE_BUCKET="stayflow-images"
ADMIN_PASSWORD="use-a-real-password"
SESSION_SECRET="use-a-long-random-secret"
```

Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Never expose it in client components.

## 3. Create tables

After `DATABASE_URL` is set:

```bash
npm run db:push
npm run db:seed
```

For production, replace `db:push` with migrations once the schema stabilizes:

```bash
npm run db:migrate
```

## 4. Storage

Create a private bucket named `stayflow-images` or update `SUPABASE_STORAGE_BUCKET`.
The current admin UI accepts image URLs. A Supabase Storage uploader still needs to be
wired before hosts can upload files directly from the dashboard.

## 5. Runtime adapter status

Already prepared:

- Postgres schema for users, homestays, rooms, bookings, payments, layouts, theme, and AI knowledge.
- Room pricing fields for `hourlyPrice`, `overnightPrice`, `dailyPrice`, `minHours`, and `maxHours`.
- Booking fields for `stayType`, `durationHours`, and `durationLabel`.
- Prisma Postgres adapter helper in `src/server/db/prisma.ts`.

Still pending before Supabase is the source of truth:

- Implement a Prisma-backed repository matching `appRepository`.
- Switch `DATA_ADAPTER=prisma` to select that repository at runtime.
- Add Supabase Storage upload flows for room/property images.
- Decide whether owner login stays password-based or moves to Supabase Auth.
- Add Row Level Security policies if client-side Supabase access is introduced.

