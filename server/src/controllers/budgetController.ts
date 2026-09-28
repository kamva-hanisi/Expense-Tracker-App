import type { Request, Response } from "express";

import { pool } from "../config/database.js";

type BudgetInput = { category: string; monthlyLimit: number };

const readBudget = (value: unknown): BudgetInput | null => {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const category = typeof input.category === "string" ? input.category.trim() : "";
  const monthlyLimit = typeof input.monthlyLimit === "number"
    ? input.monthlyLimit
    : Number(input.monthlyLimit);
  if (!category || category.length > 100 || !Number.isFinite(monthlyLimit) || monthlyLimit <= 0 || monthlyLimit > 999999999999.99) {
    return null;
  }
  return { category, monthlyLimit: Math.round(monthlyLimit * 100) / 100 };
};

const listForUser = (userId: string) => pool.query(
  `SELECT b.id::text AS id, b.category,
     b.monthly_limit::float8 AS "monthlyLimit",
     COALESCE(SUM(t.amount), 0)::float8 AS spent
   FROM expense_budgets b
   LEFT JOIN expense_transactions t
     ON t.user_id = b.user_id
     AND t.category = b.category
     AND t.type = 'expense'
     AND t.transaction_date >= DATE_TRUNC('month', CURRENT_DATE)::date
     AND t.transaction_date < (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month')::date
   WHERE b.user_id = $1
   GROUP BY b.id, b.category, b.monthly_limit
   ORDER BY b.category`,
  [userId],
);

export const listBudgets = async (request: Request, response: Response) => {
  const result = await listForUser(request.user!.id);
  response.json(result.rows);
};

export const saveBudget = async (request: Request, response: Response) => {
  const budget = readBudget(request.body);
  if (!budget) {
    response.status(400).json({ message: "Enter a category and a positive monthly limit" });
    return;
  }

  await pool.query(
    `INSERT INTO expense_budgets (user_id, category, monthly_limit)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, category)
     DO UPDATE SET monthly_limit = EXCLUDED.monthly_limit, updated_at = NOW()`,
    [request.user!.id, budget.category, budget.monthlyLimit],
  );
  const result = await listForUser(request.user!.id);
  response.status(200).json(result.rows);
};

export const replaceBudgets = async (request: Request, response: Response) => {
  const inputs = request.body?.budgets;
  if (!Array.isArray(inputs) || inputs.length === 0 || inputs.length > 50) {
    response.status(400).json({ message: "Provide between 1 and 50 budgets" });
    return;
  }
  const budgets = inputs.map(readBudget);
  if (budgets.some((budget) => budget === null)) {
    response.status(400).json({ message: "Each budget needs a category and a positive monthly limit" });
    return;
  }
  const validBudgets = budgets as BudgetInput[];
  const categories = validBudgets.map((budget) => budget.category.toLowerCase());
  if (new Set(categories).size !== categories.length) {
    response.status(400).json({ message: "Budget categories must be unique" });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM expense_budgets WHERE user_id = $1", [request.user!.id]);
    for (const budget of validBudgets) {
      await client.query(
        "INSERT INTO expense_budgets (user_id, category, monthly_limit) VALUES ($1, $2, $3)",
        [request.user!.id, budget.category, budget.monthlyLimit],
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  const result = await listForUser(request.user!.id);
  response.json(result.rows);
};

export const deleteBudget = async (request: Request, response: Response) => {
  const id = request.params.id;
  if (typeof id !== "string" || !/^\d+$/.test(id) || id === "0") {
    response.status(400).json({ message: "Invalid budget id" });
    return;
  }
  const result = await pool.query(
    "DELETE FROM expense_budgets WHERE id = $1 AND user_id = $2 RETURNING id",
    [id, request.user!.id],
  );
  if (!result.rowCount) {
    response.status(404).json({ message: "Budget not found" });
    return;
  }
  response.status(204).send();
};