# Expense Tracker App

A full-stack expense tracker for recording income and expenses, viewing a financial summary, filtering transactions, and checking spending visually with charts.


## Features

- User registration and login with JWT authentication
- Add, edit, delete, and complete transactions
- Filter transactions by search text, type, and category
- Summary cards for income, expenses, and balance
- Financial overview chart
- Calm responsive UI with React and Tailwind CSS
- PostgreSQL database connection through Node.js and Express

## Tech Stack

**Frontend**

- React
- Vite
- Redux Toolkit
- React Router
- Tailwind CSS
- Recharts
- Axios
- React Hot Toast

**Backend**

- Node.js
- Express
- PostgreSQL
- pg
- bcryptjs
- jsonwebtoken
- dotenv

## Project Structure

```text
Expense-Tracker-App/
  client/      React frontend
  server/      Express API backend
  README.md
```

## Getting Started

### 1. Install dependencies

Open a terminal in the project root.

```bash
cd server
npm install
```

```bash
cd ../client
npm install
```

## Deploying to Render

Deploy this as three Render resources:

1. **PostgreSQL database**
   - Create a new Render PostgreSQL database.
   - Connect to it with Beekeeper Studio using the Render external database connection details.
   - Create your `expense_users` and `expense_transactions` tables in Beekeeper.

2. **Backend web service**
   - Type: Web Service
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment variables:
     - `DATABASE_URL`: use the Render PostgreSQL internal connection string
     - `DB_SSL`: `true`
     - `JWT_SECRET`: use a long random secret
     - `CLIENT_URL`: `https://expense-tracker-client-0ndu.onrender.com`

3. **Frontend static site**
   - Type: Static Site
   - Root Directory: `client`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Environment variables:
     - `VITE_API_URL`: `https://expense-tracker-app-pdrv.onrender.com/api`

After setting `CLIENT_URL` or `VITE_API_URL`, redeploy the affected Render service so the new values are used.

The backend works in both environments:

- Localhost: use `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, and `DB_PORT` from `server/.env`.
- Render: use `DATABASE_URL` and `DB_SSL=true`.

Built by **Kamva Hanisi**.
