import type { Request, Response } from "express";

import { pool } from "../config/database.js";

type TransactionInput = {
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: string;
  completed: boolean;
};

const transactionSelect = `
  id, title, amount::float8 AS amount, category, type,
  TO_CHAR(transaction_date, 'YYYY-MM-DD') AS date,
  completed, created_at AS "createdAt", updated_at AS "updatedAt"
`;

const isDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

const readTransaction = (
  body: unknown,
  partial = false,
): { value?: Partial<TransactionInput>; error?: string } => {
  if (!body || typeof body !== "object") return { error: "Request body is required" };
  const input = body as Record<string, unknown>;
  const value: Partial<TransactionInput> = {};

  if (!partial || input.title !== undefined) {
    if (typeof input.title !== "string" || input.title.trim().length < 1 || input.title.trim().length > 150) {
      return { error: "Title must be between 1 and 150 characters" };
    }
    value.title = input.title.trim();
  }
  if (!partial || input.amount !== undefined) {
    const amount = typeof input.amount === "number" ? input.amount : Number(input.amount);
    if (!Number.isFinite(amount) || amount < 0 || amount > 999999999999.99) {
      return { error: "Amount must be a non-negative number" };
    }
    value.amount = Math.round(amount * 100) / 100;
  }
  if (!partial || input.category !== undefined) {
    if (typeof input.category !== "string" || input.category.trim().length < 1 || input.category.trim().length > 100) {
      return { error: "Category must be between 1 and 100 characters" };
    }
    value.category = input.category.trim();
  }
  if (!partial || input.type !== undefined) {
    if (input.type !== "income" && input.type !== "expense") {
      return { error: "Type must be income or expense" };
    }
    value.type = input.type;
  }
  if (!partial || input.date !== undefined) {
    const date = input.date ?? new Date().toISOString().slice(0, 10);
    if (typeof date !== "string" || !isDate(date)) {
      return { error: "Date must use YYYY-MM-DD format" };
    }
    value.date = date;
  }
  if (input.completed !== undefined) {
    if (typeof input.completed !== "boolean") return { error: "Completed must be true or false" };
    value.completed = input.completed;
  } else if (!partial) {
    value.completed = false;
  }
  if (partial && Object.keys(value).length === 0) {
    return { error: "Provide at least one transaction field to update" };
  }
  return { value };
};

const validId = (id: string) => /^\d+$/.test(id) && id !== "0";

export const listTransactions = async (request: Request, response: Response) => {
  const result = await pool.query(
    `SELECT ${transactionSelect} FROM expense_transactions
     WHERE user_id = $1 ORDER BY transaction_date DESC, created_at DESC`,
    [request.user!.id],
  );
  response.json(result.rows);
};

export const createTransaction = async (request: Request, response: Response) => {
  const parsed = readTransaction(request.body);
  if (parsed.error) {
    response.status(400).json({ message: parsed.error });
    return;
  }
  const transaction = parsed.value as TransactionInput;
  const result = await pool.query(
    `INSERT INTO expense_transactions
       (user_id, title, amount, category, type, transaction_date, completed)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING ${transactionSelect}`,
    [request.user!.id, transaction.title, transaction.amount, transaction.category,
      transaction.type, transaction.date, transaction.completed],
  );
  response.status(201).json(result.rows[0]);
};

export const updateTransaction = async (request: Request, response: Response) => {
  const id = request.params.id;
  if (typeof id !== "string" || !validId(id)) {
    response.status(400).json({ message: "Invalid transaction id" });
    return;
  }
  const parsed = readTransaction(request.body, true);
  if (parsed.error) {
    response.status(400).json({ message: parsed.error });
    return;
  }

  const columns: Record<keyof TransactionInput, string> = {
    title: "title", amount: "amount", category: "category", type: "type",
    date: "transaction_date", completed: "completed",
  };
  const entries = Object.entries(parsed.value!) as [keyof TransactionInput, unknown][];
  const values: unknown[] = [request.user!.id, id];
  const assignments = entries.map(([key, value], index) => {
    values.push(value);
    return `${columns[key]} = $${index + 3}`;
  });
  const result = await pool.query(
    `UPDATE expense_transactions SET ${assignments.join(", ")}, updated_at = NOW()
     WHERE user_id = $1 AND id = $2 RETURNING ${transactionSelect}`,
    values,
  );
  if (!result.rows[0]) {
    response.status(404).json({ message: "Transaction not found" });
    return;
  }
  response.json(result.rows[0]);
};

export const deleteTransaction = async (request: Request, response: Response) => {
  const id = request.params.id;
  if (typeof id !== "string" || !validId(id)) {
    response.status(400).json({ message: "Invalid transaction id" });
    return;
  }
  const result = await pool.query(
    "DELETE FROM expense_transactions WHERE user_id = $1 AND id = $2 RETURNING id",
    [request.user!.id, id],
  );
  if (!result.rows[0]) {
    response.status(404).json({ message: "Transaction not found" });
    return;
  }
  response.status(204).send();
};

export const getSummary = async (request: Request, response: Response) => {
  const result = await pool.query<{
    totalIncome: number; totalExpenses: number; balance: number; transactionCount: number;
  }>(
    `SELECT
       COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0)::float8 AS "totalIncome",
       COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0)::float8 AS "totalExpenses",
       COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0)::float8 AS balance,
       COUNT(*)::int AS "transactionCount"
     FROM expense_transactions WHERE user_id = $1`,
    [request.user!.id],
  );
  const summary = result.rows[0]!;
  response.json({ ...summary, income: summary.totalIncome, expenses: summary.totalExpenses });
};
