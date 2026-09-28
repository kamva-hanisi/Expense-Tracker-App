import { pool } from "../config/database.js";

export const runMigrations = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS expense_users (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS expense_transactions (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES expense_users(id) ON DELETE CASCADE,
      title VARCHAR(150) NOT NULL,
      amount NUMERIC(14, 2) NOT NULL CHECK (amount >= 0),
      category VARCHAR(100) NOT NULL,
      type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
      transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS expense_transactions_user_date_idx
      ON expense_transactions (user_id, transaction_date DESC, created_at DESC);
  `);
};
