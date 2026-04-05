# DormPayment Web App

Role-based dormitory payment platform built with Next.js App Router, Tailwind CSS, and shadcn/ui.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- shadcn/ui components
- Route Handlers for API
- Cookie-based session authentication
- Drizzle ORM + MySQL/MariaDB login integration
- Docker + Docker Compose deployment on Proxmox LXC

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Start development server

```bash
npm run dev
```

3. Open app

http://localhost:3000

## Demo Accounts

- Student: 65160381 / pass1234
- Staff: staff01 / pass1234
- Finance: finance01 / pass1234
- Manager: manager01 / pass1234
- Admin: admin01 / pass1234

## Connect Your MySQL/MariaDB (Proxmox)

1. Create `.env.local` from `.env.example`

```bash
cp .env.example .env.local
```

2. Set your database connection string

```env
DATABASE_URL=mysql://your_user:your_password@your_server_ip:3306/dorm_payment
```

3. Run SQL bootstrap script in your database

```sql
-- run file: sql/auth_users.sql
```

4. Start app and test login

```bash
npm run dev
```

Open `/login` and sign in with one of the seeded accounts.

Notes:
- If `DATABASE_URL` (or `MYSQL_URL`) is present, login is validated from DB via Drizzle.
- If not present, login uses in-memory demo users.
- `password_hash` currently accepts plain text for quick testing and also supports bcrypt hashes.
- Some operational features also support in-memory fallback data for demo scenarios.

## Routes

- Landing: /
- Login: /login
- Auto role redirect: /dashboard
- Role portal: /portal/[role]

## Implemented API Endpoints

- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/change-password
- GET /api/auth/me
- GET /api/health
- GET /api/dashboard?role={role}
- POST /api/payments/submit
- GET /api/payments/pending
- POST /api/payments/[paymentId]/decision
- POST /api/meter-readings
- POST /api/invoices/batch
- GET /api/reports/summary
- GET /api/finance/overdue
- POST /api/finance/overdue
- GET /api/finance/export
- GET /api/admin/users
- POST /api/admin/users
- DELETE /api/admin/users
- PATCH /api/admin/users
- GET /api/admin/rooms
- POST /api/admin/rooms/assign
- POST /api/admin/students/move-out
- GET /api/admin/rates
- POST /api/admin/rates
- GET /api/admin/audit-logs
- GET /api/maintenance
- POST /api/maintenance
- PATCH /api/maintenance
- POST /api/uploads/slips

## Role Flow Coverage

- Student: submit payment slip and view own invoices
- Staff: record monthly meter readings
- Staff/Admin: manage maintenance workflow
- Finance: generate invoices, approve pending slips, export reports, mark overdue invoices
- Manager: load financial summary report
- Admin: manage users, room assignment, room rates, audit logs, and move-out workflow

## Current MVP Features

- Role-based login and protected portals
- Student billing dashboard and payment submission flow
- Finance invoice generation and payment approval flow
- Overdue tracking and finance CSV export
- Admin user, room, rate, and audit management
- Maintenance request tracking for operations

## Docker Deployment

Production-oriented container files are included:

- `Dockerfile`: multi-stage build for Next.js production runtime
- `docker-compose.yml`: service definition for container startup

Example:

```bash
docker compose up -d --build
```

The default mapping in this workspace publishes the app on port `3069`.

## Validation

```bash
npm run lint
npm run build
```

Both commands pass successfully in this workspace.
