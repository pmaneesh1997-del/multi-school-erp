# Kartik Education Multi-school ERP

A multi-campus school operations workspace built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, MySQL, Drizzle ORM, and Razorpay subscriptions.

## Requirements

- Node.js 20 or newer
- MySQL 8 or compatible MySQL server
- Razorpay account with Subscriptions enabled

## Run locally

1. Install packages with `npm install`.
2. Create a MySQL database named `multi_school_erp`.
3. Copy `.env.example` to `.env.local` and configure `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` for your MySQL server.
4. Configure Razorpay test keys and plan IDs in `.env.local` as described below.
5. Generate and apply schema updates:

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

6. Start the app with `npm run dev` and open http://localhost:3000.

## Razorpay subscription setup

Create six Razorpay Plans in Test Mode: Starter, Growth, and Enterprise, each with monthly and yearly billing. Set their plan IDs in `RAZORPAY_PLAN_STARTER_MONTH`, `RAZORPAY_PLAN_STARTER_YEAR`, `RAZORPAY_PLAN_GROWTH_MONTH`, `RAZORPAY_PLAN_GROWTH_YEAR`, `RAZORPAY_PLAN_ENTERPRISE_MONTH`, and `RAZORPAY_PLAN_ENTERPRISE_YEAR`. Configure monthly amounts of ₹4,999, ₹12,999, and ₹29,999. Configure annual plans with yearly charges of ₹47,988, ₹1,24,788, and ₹2,87,988 respectively (the billing page shows the discounted monthly equivalent). Razorpay plan amount and currency must match the price shown in `src/app/billing/page.tsx`.

Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` from the Razorpay API Keys page. Set `RAZORPAY_WEBHOOK_SECRET` to the secret configured for the webhook endpoint `/api/billing/webhook`, and set `NEXT_PUBLIC_APP_URL` to the public app origin. Enable subscription lifecycle events and `payment.captured` / `payment.failed`. Use a public staging URL for webhook testing; Razorpay cannot deliver webhooks directly to localhost.

Razorpay manages subscription authorization through its hosted `short_url`. The application stores subscriptions and payment records locally, verifies webhook HMAC signatures, and schedules cancellation at the end of the billing cycle. Customers can manage payment methods and subscription authorization through Razorpay's hosted subscription experience.

## Accounts and access

The app and Drizzle CLI use the `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` values from `.env.local`. A separate `DATABASE_URL` is not required. To create or reset the local group-owner account, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` (at least 12 characters) in your shell and run `npm run admin:reset-password`. Optionally set `ADMIN_NAME`. The command creates the default group and campus if needed and does not print the password. Never use example credentials in production. Billing actions require the `group_owner`, `group_admin`, or `platform_admin` role. Keep all school-owned records scoped by the authenticated user's school group and/or active school.

## Database and sessions

The Drizzle schema in `src/lib/db/schema.ts` includes groups, schools, users, opaque database-backed sessions, students, attendance, subscriptions, and payment records. Session tokens are random, persisted only as SHA-256 hashes, and sent in a 14-day `HttpOnly`, `SameSite=Lax` cookie. Passwords use bcrypt.

## Scripts

- `npm run dev` starts the development server.
- `npm run lint` runs ESLint.
- `npm run build` creates the production build.
- `npm run db:generate` creates SQL migrations from the Drizzle schema.
- `npm run db:migrate` applies pending migrations.
- `npm run db:studio` opens Drizzle Studio.
