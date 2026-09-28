import type { Request, Response } from "express";

import { pool } from "../config/database.js";

export const getSettings = async (request: Request, response: Response) => {
  const result = await pool.query<{ transaction_activity_enabled: boolean }>(
    "SELECT transaction_activity_enabled FROM expense_user_settings WHERE user_id = $1",
    [request.user!.id],
  );
  response.json({ transactionActivityEnabled: result.rows[0]?.transaction_activity_enabled ?? true });
};

export const updateSettings = async (request: Request, response: Response) => {
  const enabled = request.body?.transactionActivityEnabled;
  if (typeof enabled !== "boolean") {
    response.status(400).json({ message: "Choose whether in-app transaction activity is enabled" });
    return;
  }
  await pool.query(
    `INSERT INTO expense_user_settings (user_id, transaction_activity_enabled)
     VALUES ($1, $2)
     ON CONFLICT (user_id)
     DO UPDATE SET transaction_activity_enabled = EXCLUDED.transaction_activity_enabled, updated_at = NOW()`,
    [request.user!.id, enabled],
  );
  response.json({ transactionActivityEnabled: enabled });
};