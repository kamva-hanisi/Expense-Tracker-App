import { pool } from "../config/database.js";

export const runMigrations = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(726014832)");
    await client.query(`
    CREATE TABLE IF NOT EXISTS expense_users (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE expense_users
      ADD COLUMN IF NOT EXISTS name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS phone VARCHAR(40),
      ADD COLUMN IF NOT EXISTS city VARCHAR(120),
      ADD COLUMN IF NOT EXISTS avatar_data TEXT,
      ADD COLUMN IF NOT EXISTS default_currency VARCHAR(3) NOT NULL DEFAULT 'ZAR',
      ADD COLUMN IF NOT EXISTS monthly_note TEXT NOT NULL DEFAULT '';

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'expense_users' AND column_name = 'username'
      ) THEN
        EXECUTE 'UPDATE expense_users SET name = username WHERE name IS NULL';
      END IF;
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'expense_users' AND column_name = 'password'
      ) THEN
        EXECUTE 'UPDATE expense_users SET password_hash = password WHERE password_hash IS NULL';
        EXECUTE 'ALTER TABLE expense_users ALTER COLUMN password DROP NOT NULL';
      END IF;
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'expense_users' AND column_name = 'username'
      ) THEN
        EXECUTE 'ALTER TABLE expense_users ALTER COLUMN username DROP NOT NULL';
      END IF;
    END $$;

    ALTER TABLE expense_users
      ALTER COLUMN name SET NOT NULL,
      ALTER COLUMN password_hash SET NOT NULL;

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

    ALTER TABLE expense_transactions
      ADD COLUMN IF NOT EXISTS transaction_date DATE NOT NULL DEFAULT CURRENT_DATE;

    ALTER TABLE expense_transactions
      ADD COLUMN IF NOT EXISTS completed BOOLEAN NOT NULL DEFAULT FALSE;

    ALTER TABLE expense_transactions
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

    CREATE INDEX IF NOT EXISTS expense_transactions_user_date_idx
      ON expense_transactions (user_id, transaction_date DESC, created_at DESC);

    CREATE TABLE IF NOT EXISTS expense_budgets (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES expense_users(id) ON DELETE CASCADE,
      category VARCHAR(100) NOT NULL,
      monthly_limit NUMERIC(14, 2) NOT NULL CHECK (monthly_limit > 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, category)
    );

    CREATE INDEX IF NOT EXISTS expense_budgets_user_category_idx
      ON expense_budgets (user_id, category);
  `);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
