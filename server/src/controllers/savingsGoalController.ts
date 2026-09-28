import type { Request, Response } from "express";

import { pool } from "../config/database.js";

type GoalInput = { name: string; targetAmount: number; targetDate: string | null };

const validDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

const readGoal = (value: unknown): GoalInput | null => {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const targetAmount = typeof input.targetAmount === "number"
    ? input.targetAmount
    : Number(input.targetAmount);
  const targetDate = input.targetDate === "" || input.targetDate === null || input.targetDate === undefined
    ? null
    : typeof input.targetDate === "string" && validDate(input.targetDate) ? input.targetDate : "invalid";

  if (
    !name || name.length > 120 ||
    !Number.isFinite(targetAmount) || targetAmount <= 0 || targetAmount > 999999999999.99 ||
    targetDate === "invalid"
  ) return null;

  return { name, targetAmount: Math.round(targetAmount * 100) / 100, targetDate };
};

const listForUser = (userId: string) => pool.query(
  `SELECT id::text AS id, name, target_amount::float8 AS "targetAmount",
     saved_amount::float8 AS "savedAmount",
     TO_CHAR(target_date, 'YYYY-MM-DD') AS "targetDate"
   FROM expense_savings_goals
   WHERE user_id = $1
   ORDER BY target_date NULLS LAST, name`,
  [userId],
);

export const listSavingsGoals = async (request: Request, response: Response) => {
  const result = await listForUser(request.user!.id);
  response.json(result.rows);
};

export const saveSavingsGoal = async (request: Request, response: Response) => {
  const goal = readGoal(request.body);
  if (!goal) {
    response.status(400).json({ message: "Enter a goal name, positive target, and valid optional target date" });
    return;
  }
  await pool.query(
    `INSERT INTO expense_savings_goals (user_id, name, target_amount, target_date)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, name)
     DO UPDATE SET target_amount = EXCLUDED.target_amount,
       target_date = EXCLUDED.target_date, updated_at = NOW()`,
    [request.user!.id, goal.name, goal.targetAmount, goal.targetDate],
  );
  const result = await listForUser(request.user!.id);
  response.status(200).json(result.rows);
};

export const replaceSavingsGoals = async (request: Request, response: Response) => {
  const inputs = request.body?.goals;
  if (!Array.isArray(inputs) || inputs.length === 0 || inputs.length > 50) {
    response.status(400).json({ message: "Provide between 1 and 50 savings goals" });
    return;
  }
  const goals = inputs.map(readGoal);
  if (goals.some((goal) => goal === null)) {
    response.status(400).json({ message: "Each goal needs a name, positive target, and valid optional date" });
    return;
  }
  const validGoals = goals as GoalInput[];
  if (new Set(validGoals.map((goal) => goal.name.toLowerCase())).size !== validGoals.length) {
    response.status(400).json({ message: "Goal names must be unique" });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM expense_savings_goals WHERE user_id = $1", [request.user!.id]);
    for (const goal of validGoals) {
      await client.query(
        `INSERT INTO expense_savings_goals (user_id, name, target_amount, target_date)
         VALUES ($1, $2, $3, $4)`,
        [request.user!.id, goal.name, goal.targetAmount, goal.targetDate],
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

export const updateSavingsGoal = async (request: Request, response: Response) => {
  const id = request.params.id;
  if (typeof id !== "string" || !/^\d+$/.test(id) || id === "0") {
    response.status(400).json({ message: "Invalid goal id" });
    return;
  }
  const goal = readGoal(request.body);
  if (!goal) {
    response.status(400).json({ message: "Enter a goal name, positive target, and valid optional target date" });
    return;
  }
  const result = await pool.query(
    `UPDATE expense_savings_goals
     SET name = $3, target_amount = $4, target_date = $5, updated_at = NOW()
     WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, request.user!.id, goal.name, goal.targetAmount, goal.targetDate],
  );
  if (!result.rowCount) {
    response.status(404).json({ message: "Savings goal not found" });
    return;
  }
  const goals = await listForUser(request.user!.id);
  response.json(goals.rows);
};

export const addGoalContribution = async (request: Request, response: Response) => {
  const id = request.params.id;
  const amount = typeof request.body?.amount === "number" ? request.body.amount : Number(request.body?.amount);
  if (typeof id !== "string" || !/^\d+$/.test(id) || id === "0") {
    response.status(400).json({ message: "Invalid goal id" });
    return;
  }
  if (!Number.isFinite(amount) || amount <= 0 || amount > 999999999999.99) {
    response.status(400).json({ message: "Contribution must be a positive amount" });
    return;
  }
  const result = await pool.query(
    `UPDATE expense_savings_goals
     SET saved_amount = saved_amount + $3, updated_at = NOW()
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [id, request.user!.id, Math.round(amount * 100) / 100],
  );
  if (!result.rowCount) {
    response.status(404).json({ message: "Savings goal not found" });
    return;
  }
  const goals = await listForUser(request.user!.id);
  response.json(goals.rows);
};

export const deleteSavingsGoal = async (request: Request, response: Response) => {
  const id = request.params.id;
  if (typeof id !== "string" || !/^\d+$/.test(id) || id === "0") {
    response.status(400).json({ message: "Invalid goal id" });
    return;
  }
  const result = await pool.query(
    "DELETE FROM expense_savings_goals WHERE id = $1 AND user_id = $2 RETURNING id",
    [id, request.user!.id],
  );
  if (!result.rowCount) {
    response.status(404).json({ message: "Savings goal not found" });
    return;
  }
  response.status(204).send();
};