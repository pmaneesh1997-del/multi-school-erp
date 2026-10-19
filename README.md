# Educ-core Multi-school ERP

A multi-campus school operations workspace built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, MySQL, and Drizzle ORM.

## Requirements

- Node.js 20 or newer
- MySQL 8 or a compatible MySQL server

## Run locally

1. Install packages with `npm install`.
2. Create a MySQL database named `multi_school_erp` (or change the database name in the connection URL).
3. Copy `.env.example` to `.env.local` and set `DATABASE_URL` to your MySQL connection string.
4. Generate and apply the initial schema:

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. Start Next.js with `npm run dev` and open http://localhost:3000.

The dashboard is protected by a server-side MySQL session. To sign in, create a user row in the `users` table with a bcrypt password hash, and associate it with a row in `school_groups`. The group and user IDs should be UUIDs. For example, generate a hash using `node -e "require('bcryptjs').hash('ChangeMe123!', 12).then(console.log)"`, then insert a group and user using the generated hash. Never use example credentials in production.

## Database and sessions

The Drizzle schema in `src/lib/db/schema.ts` includes school groups, schools, users, opaque database-backed sessions, students, and attendance records. Schools, users, and student/attendance records are tenant-scoped through group or school IDs. Session tokens are random, stored only as SHA-256 hashes in MySQL, and sent to the browser in a `HttpOnly`, `SameSite=Lax` cookie with a 14-day expiry. Password verification uses bcrypt.

Keep authorization checks server-side and scope every school-owned query by the authenticated user's group and/or active school. The dashboard currently displays representative sample metrics and student rows; replace those fixtures with tenant-filtered Drizzle queries as each ERP module is implemented.

## Scripts

- `npm run dev` starts the development server.
- `npm run lint` runs ESLint.
- `npm run build` creates the production build.
- `npm run db:generate` creates SQL migrations from the Drizzle schema.
- `npm run db:migrate` applies pending migrations.
- `npm run db:studio` opens Drizzle Studio.
