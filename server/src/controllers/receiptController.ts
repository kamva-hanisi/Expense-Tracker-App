import type { Request, Response } from "express";

import { pool } from "../config/database.js";

const receiptFields = `
  id::text AS id, transaction_id::text AS "transactionId", file_name AS "fileName",
  merchant, amount::float8 AS amount, category,
  TO_CHAR(receipt_date, 'YYYY-MM-DD') AS date, created_at AS "createdAt"
`;

const isDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

export const listReceipts = async (request: Request, response: Response) => {
  const result = await pool.query(
    `SELECT ${receiptFields} FROM expense_receipts
     WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
    [request.user!.id],
  );
  response.json(result.rows);
};

export const getReceiptImage = async (request: Request, response: Response) => {
  const id = request.params.id;
  if (typeof id !== "string" || !/^\d+$/.test(id) || id === "0") {
    response.status(400).json({ message: "Invalid receipt id" });
    return;
  }
  const result = await pool.query<{ image_data: string }>(
    "SELECT image_data FROM expense_receipts WHERE id = $1 AND user_id = $2",
    [id, request.user!.id],
  );
  const imageData = result.rows[0]?.image_data;
  if (!imageData) {
    response.status(404).json({ message: "Receipt image not found" });
    return;
  }
  const image = /^data:image\/jpeg;base64,([A-Za-z0-9+/]+=*)$/i.exec(imageData);
  if (!image) {
    response.status(500).json({ message: "Stored receipt image is invalid" });
    return;
  }
  response.setHeader("Cache-Control", "private, no-store");
  response.type("image/jpeg").send(Buffer.from(image[1]!, "base64"));
};

export const createReceipt = async (request: Request, response: Response) => {
  const fileName = typeof request.body?.fileName === "string" ? request.body.fileName.trim() : "";
  const merchant = typeof request.body?.merchant === "string" ? request.body.merchant.trim() : "";
  const category = typeof request.body?.category === "string" ? request.body.category.trim() : "";
  const amount = typeof request.body?.amount === "number" ? request.body.amount : Number(request.body?.amount);
  const date = typeof request.body?.date === "string" ? request.body.date : "";
  const imageData = typeof request.body?.imageData === "string" ? request.body.imageData : "";

  if (!fileName || fileName.length > 255 || !merchant || merchant.length > 150 || !category || category.length > 100) {
    response.status(400).json({ message: "Enter a file name, merchant, and category" });
    return;
  }
  if (!Number.isFinite(amount) || amount < 0 || amount > 999999999999.99) {
    response.status(400).json({ message: "Enter a valid receipt total" });
    return;
  }
  if (!isDate(date)) {
    response.status(400).json({ message: "Enter a valid receipt date" });
    return;
  }
  if (imageData.length > 1_200_000 || !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/i.test(imageData)) {
    response.status(400).json({ message: "Receipt image is too large or is not a supported JPEG" });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const transaction = await client.query<{ id: string }>(
      `INSERT INTO expense_transactions
         (user_id, title, amount, category, type, transaction_date, completed)
       VALUES ($1, $2, $3, $4, 'expense', $5, false)
       RETURNING id`,
      [request.user!.id, merchant, Math.round(amount * 100) / 100, category, date],
    );
    const receipt = await client.query(
      `INSERT INTO expense_receipts
         (user_id, transaction_id, file_name, merchant, amount, category, receipt_date, image_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING ${receiptFields}`,
      [request.user!.id, transaction.rows[0]!.id, fileName, merchant, Math.round(amount * 100) / 100, category, date, imageData],
    );
    await client.query("COMMIT");
    response.status(201).json(receipt.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const deleteReceipt = async (request: Request, response: Response) => {
  const id = request.params.id;
  if (typeof id !== "string" || !/^\d+$/.test(id) || id === "0") {
    response.status(400).json({ message: "Invalid receipt id" });
    return;
  }
  const result = await pool.query(
    "DELETE FROM expense_receipts WHERE id = $1 AND user_id = $2 RETURNING id",
    [id, request.user!.id],
  );
  if (!result.rowCount) {
    response.status(404).json({ message: "Receipt not found" });
    return;
  }
  response.status(204).send();
};