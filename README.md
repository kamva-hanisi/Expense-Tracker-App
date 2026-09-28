# Expense Tracker App

A full-stack expense tracker built with a React and TypeScript frontend plus a Node.js, Express, TypeScript, and PostgreSQL API.

## Features

- User registration and login with JWT authentication
- Protected transaction create, read, update, and delete endpoints
- Income, expense, balance, and transaction-count summaries
- Search and category filtering in the frontend
- Responsive dashboards and financial charts
- Automatic PostgreSQL table setup on API startup

## Tech Stack

**Frontend:** React, TypeScript, Vite, Redux Toolkit, React Router, Tailwind CSS, Recharts, Axios

**Backend:** Node.js, TypeScript, Express, PostgreSQL, `pg`, `bcryptjs`, JSON Web Tokens

## Local Setup

1. Create a PostgreSQL database named `expense_tracker`.
2. Copy `server/.env.example` to `server/.env` and update the PostgreSQL password and JWT secret.
3. Install dependencies and start the API:

```bash
cd server
npm install
npm run dev
```

4. In another terminal, install dependencies and start the frontend:

```bash
cd client
npm install
npm run dev
```

The frontend uses `http://localhost:5000/api` by default. Set `VITE_API_URL` in `client/.env` when the API is hosted elsewhere.

## Deployment configuration

The frontend is deployed to GitHub Pages at `https://kamva-hanisi.github.io/Expense-Tracker-App/`.
The GitHub Pages workflow builds with `VITE_API_URL` set to the Vercel API URL. Set the repository variable `VITE_API_URL` if the API URL changes.

Deploy the `server` directory as a Vercel project. Set these Vercel environment variables:

```text
NODE_ENV=production
DATABASE_URL=<Neon pooled connection string>
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=true
JWT_SECRET=<long random secret>
JWT_EXPIRES_IN=7d
CLIENT_URL=https://kamva-hanisi.github.io
DB_AUTO_MIGRATE=true
```

For local PostgreSQL, create an `expense_tracker` database in pgAdmin 4, leave `DATABASE_URL` empty, and set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` in `server/.env`.

## API

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET|POST /api/transactions`
- `PUT|DELETE /api/transactions/:id`
- `GET /api/transactions/summary`

All transaction endpoints and `/api/auth/me` require `Authorization: Bearer <token>`.

## Production

Set `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`, and the SSL options from `server/.env.example`. `CLIENT_URL` accepts a comma-separated list of allowed frontend origins.
