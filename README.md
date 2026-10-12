# Holocron — Inventory Lifecycle Management

A portfolio-ready migration of an internal inventory workflow from Google Apps Script + Google Sheets into a modern React + Node.js + Express + MariaDB application.

## Architecture

React → REST API → Node.js/Express → MariaDB

The application replaces internal Buganizer with an application-owned ticket module. Email is implemented through a safe mock notification adapter for local/demo use; it can later be replaced by SMTP, Resend, SendGrid, SES, etc.

## Features

- JWT authentication and role-based access control
- Admin and normal-user workflows
- Inventory dashboard
- Add asset
- Transfer asset + target-user receipt confirmation
- Remove asset + admin approval
- Assign custodian
- Asset lifecycle history / audit records
- Internal ticket generation (`TKT-YYYY-00000`)
- Ticket status management
- Search and status badges
- MariaDB relational model with PK/FK/indexes
- Seed data
- GitHub Actions CI
- Responsive UI

The original workflow included Add, Transfer Device, Remove Device, Confirm Receipt, Approve Action and Reject Action states; these are represented in the new relational application model.

## Project structure

```text
inventory-lifecycle-management/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── test/
├── frontend/
│   └── src/
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── seed.mjs
├── docs/
└── .github/workflows/ci.yml
```

## Database tables

- `users` — identity and roles
- `assets` — current asset state
- `asset_transactions` — immutable lifecycle events
- `tickets` — application-owned tickets
- `email_notifications` — notification audit records
- `dropdown_config` — configurable dropdown values
- `audit_logs` — security/business audit trail

## Run locally

### 1. MariaDB

Create the schema:

```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend

```bash
cd backend
copy .env.example .env
npm install
```

Set your MariaDB password in `.env`, then seed:

```bash
cd ../database
node seed.mjs
```

Start the API:

```bash
cd ../backend
npm run dev
```

API: `http://localhost:5000/api`

### 3. Frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

## Demo credentials

All seeded users use:

```text
Password@123
```

Admin:

```text
admin
```

Normal users:

```text
keerthana
rahul
ananya
vikram
```

## Interview story

> The original application used Google Apps Script and Google Sheets as the data layer. It was effective for the internal workflow, but I wanted a more scalable and maintainable architecture with clear separation between presentation, business logic and persistence. I migrated the UI to React, moved the business rules into Node.js/Express REST APIs, and introduced MariaDB for relational constraints, transactions and querying. I separated current asset state from lifecycle transactions so the application retains a complete audit history. For external ticketing, I replaced the internal Buganizer dependency with an application-owned ticket module so the portfolio version is independently deployable.

## CI/CD

The included GitHub Actions workflow installs dependencies, runs backend tests and builds the React frontend on pushes and pull requests to `main`.

For deployment, the intended production setup is:

- React frontend → Vercel/Netlify/static hosting
- Node API → Render/Railway/Azure App Service/etc.
- MariaDB/MySQL → managed database
- GitHub Actions → CI + deployment hooks

Never commit `.env` files or database credentials.
